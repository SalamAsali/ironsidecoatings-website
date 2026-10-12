import handler from "@astrojs/cloudflare/entrypoints/server";

export { PluginBridge } from "@emdash-cms/cloudflare/sandbox";

/**
 * Edge HTML cache for public marketing pages.
 *
 * Every page is server-rendered and EmDash hits D1 on each request, so an
 * uncached visit pays Worker cold start + D1 round trips before the first byte.
 * Astro's route cache (`Astro.cache`) has no provider on the Cloudflare adapter,
 * so it is a no-op here. Instead we use the Workers Cache API directly:
 *
 * - Anonymous GET requests for public pages are served from the colo cache.
 * - Entries older than FRESH_SECONDS are still served instantly, then refreshed
 *   in the background (stale-while-revalidate), so CMS edits show up within
 *   ~FRESH_SECONDS without any visitor waiting on a render.
 * - Entries are hard-expired after STALE_SECONDS.
 *
 * Note: the Cache API is a no-op on *.workers.dev; it works on the custom domain.
 */
const FRESH_SECONDS = 300;
const STALE_SECONDS = 60 * 60 * 24;
const CACHED_AT = "x-ironside-cached-at";

/** Never cache admin, APIs, form endpoints or search. */
const BYPASS_PREFIXES = ["/_emdash", "/_actions", "/_server-islands", "/_image", "/api", "/quote", "/search"];

/** Tracking params that don't change the page; stripped from the cache key. */
const IGNORED_PARAMS = /^(utm_|gclid$|gbraid$|wbraid$|fbclid$|msclkid$|_gl$)/;

/** Editors / logged-in admin sessions must always see live, uncached output. */
const PRIVATE_COOKIE = /(?:^|;\s*)[^=]*(emdash|session|astro)[^=]*=/i;

type Env = Record<string, unknown>;

function cacheKeyFor(request: Request): Request | null {
	// GET only: a HEAD render has no body and must never be stored.
	if (request.method !== "GET") return null;

	const url = new URL(request.url);
	if (BYPASS_PREFIXES.some((p) => url.pathname === p || url.pathname.startsWith(`${p}/`))) return null;
	if (PRIVATE_COOKIE.test(request.headers.get("cookie") ?? "")) return null;

	// Any non-tracking query param (preview tokens, pagination, etc.) bypasses the cache.
	for (const key of [...url.searchParams.keys()]) {
		if (!IGNORED_PARAMS.test(key)) return null;
		url.searchParams.delete(key);
	}
	url.hash = "";
	return new Request(url.toString(), { method: "GET" });
}

function isCacheable(response: Response): boolean {
	return (
		response.status === 200 &&
		!response.headers.has("set-cookie") &&
		(response.headers.get("content-type") ?? "").includes("text/html") &&
		!/no-store|private/i.test(response.headers.get("cache-control") ?? "")
	);
}

async function renderAndStore(
	request: Request,
	key: Request,
	env: Env,
	ctx: ExecutionContext,
	cache: Cache,
): Promise<Response> {
	const response = await handler.fetch(request, env, ctx);
	if (!isCacheable(response)) return response;

	const stored = new Response(response.clone().body, response);
	stored.headers.set("cache-control", `public, max-age=${STALE_SECONDS}`);
	stored.headers.set(CACHED_AT, String(Date.now()));
	ctx.waitUntil(cache.put(key, stored));

	const out = new Response(response.body, response);
	out.headers.set("x-ironside-cache", "MISS");
	return out;
}

/** Browsers always revalidate HTML; only the edge holds onto it. */
function toClient(response: Response, status: string): Response {
	const out = new Response(response.body, response);
	out.headers.set("cache-control", "public, max-age=0, must-revalidate");
	out.headers.delete(CACHED_AT);
	out.headers.set("x-ironside-cache", status);
	return out;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const key = cacheKeyFor(request);
		if (!key) return handler.fetch(request, env, ctx);

		const cache = caches.default;
		let cached: Response | undefined;
		try {
			cached = await cache.match(key);
		} catch {
			// Cache unavailable: fall through to a normal render.
		}

		if (!cached) {
			const response = await renderAndStore(request, key, env, ctx, cache);
			return response.headers.get("x-ironside-cache") === "MISS"
				? toClient(response, "MISS")
				: response;
		}

		const ageSeconds = (Date.now() - Number(cached.headers.get(CACHED_AT) ?? 0)) / 1000;
		if (ageSeconds > FRESH_SECONDS) {
			// Serve stale immediately, refresh in the background.
			ctx.waitUntil(
				renderAndStore(new Request(request.url, { headers: request.headers }), key, env, ctx, cache).catch(
					() => undefined,
				),
			);
			return toClient(cached, "STALE");
		}
		return toClient(cached, "HIT");
	},
} satisfies ExportedHandler<Env>;
