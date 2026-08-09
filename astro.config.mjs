import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import { d1, r2, sandbox } from "@emdash-cms/cloudflare";
import { formsPlugin } from "@emdash-cms/plugin-forms";
import { webhookNotifierPlugin } from "@emdash-cms/plugin-webhook-notifier";
import { defineConfig, fontProviders } from "astro/config";
import emdash from "emdash/astro";

export default defineConfig({
	// Required for canonical URLs and for @astrojs/sitemap to emit absolute URLs.
	// Its absence is why the live site currently has no canonical tag on any page.
	site: "https://ironsidecoatings.ca",
	// City pages moved from /epoxy-flooring/<city> to flat /epoxy-flooring-<city>.
	// The nested URLs were live for about an hour, so they 301 rather than 404.
	redirects: {
		"/epoxy-flooring/toronto": { status: 301, destination: "/epoxy-flooring-toronto" },
		"/epoxy-flooring/mississauga": { status: 301, destination: "/epoxy-flooring-mississauga" },
		"/epoxy-flooring/brampton": { status: 301, destination: "/epoxy-flooring-brampton" },
		"/epoxy-flooring/hamilton": { status: 301, destination: "/epoxy-flooring-hamilton" },
		"/epoxy-flooring/vaughan": { status: 301, destination: "/epoxy-flooring-vaughan" },
		"/epoxy-flooring/milton": { status: 301, destination: "/epoxy-flooring-milton" },
	},
	output: "server",
	adapter: cloudflare(),
	image: {
		layout: "constrained",
		responsiveStyles: true,
	},
	integrations: [
		react(),
		sitemap({
			// Excluded on purpose:
			//  /_emdash/*  admin surface
			//  /search     un-themed Astro starter page, still titled "Search — My Blog"
			//  /posts      empty blog shell inherited from the starter template
			//  /quote      conversion endpoint, no search value
			//  /404        error route
			filter: (page) =>
				!page.includes("/_emdash") &&
				!page.includes("/search") &&
				!page.includes("/posts") &&
				!page.includes("/quote") &&
				!page.includes("/404"),
			serialize(item) {
				// Canonical tags are emitted without a trailing slash. A sitemap that
				// disagrees with the canonical is a self-inflicted duplicate signal, so
				// normalise here rather than leaving the two to drift.
				const bare = item.url.replace(/\/+$/, "");
				item.url = bare === "https://ironsidecoatings.ca" ? `${bare}/` : bare;
				if (item.url === "https://ironsidecoatings.ca/") {
					item.priority = 1.0;
					item.changefreq = "weekly";
				} else if (item.url.includes("/epoxy-flooring")) {
					item.priority = 0.8;
					item.changefreq = "monthly";
				}
				return item;
			},
		}),
		emdash({
			database: d1({ binding: "DB", session: "auto" }),
			storage: r2({ binding: "MEDIA" }),
			plugins: [formsPlugin()],
			sandboxed: [webhookNotifierPlugin()],
			sandboxRunner: sandbox(),
			marketplace: "https://marketplace.emdashcms.com",
		}),
	],
	fonts: [
		{
			provider: fontProviders.google(),
			name: "Geist",
			cssVariable: "--font-display-loaded",
			weights: [400, 500, 600, 700, 800, 900],
			fallbacks: ["sans-serif"],
		},
		{
			provider: fontProviders.google(),
			name: "Inter",
			cssVariable: "--font-sans",
			weights: [400, 500, 600, 700],
			fallbacks: ["sans-serif"],
		},
		{
			provider: fontProviders.google(),
			name: "JetBrains Mono",
			cssVariable: "--font-mono",
			weights: [400, 500, 600],
			fallbacks: ["monospace"],
		},
	],
	devToolbar: { enabled: false },
});
