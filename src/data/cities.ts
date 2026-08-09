/**
 * Service-area cities for Ironside Coatings.
 *
 * Selection is organic-first, from the Aug 2026 scan:
 * - deduped Google Ads volume for `epoxy flooring {city}` and siblings (CA, 2124)
 * - top-3 organic weakness score from serp_scan.py (>=6/10 is the green light)
 * - Maps R_entry (reviews on the 3rd-ranked *contractor* pin, retailers stripped)
 *
 * Oakville is the primary city and is targeted by the home page. It is deliberately
 * NOT in this list: an /epoxy-flooring-oakville page would cannibalise the home page.
 *
 * Wikidata IDs below were each verified against the Wikidata API - do not edit them
 * from memory. Several plausible-looking IDs resolve to entirely unrelated entities.
 */

export interface City {
 slug: string;
 name: string;
 /** Used in <title>, H1 and prose where the formal municipality name reads oddly. */
 region: string;
 wikidata: string;
 /** Deduped monthly searches across the city's epoxy cluster. */
 volume: number;
 /** Highest CPC observed in the city's cluster - the value signal when volume is thin. */
 cpc: number | null;
 /** Top-3 organic weakness, 0-10. Higher = easier to displace. */
 weakness: number;
 /** Reviews held by the 3rd-ranked contractor in the Maps pack. */
 rEntry: number;
 /** Approximate drive time from the Oakville base, for logistics copy. */
 driveMinutes: number;
 /** Real neighbourhoods/districts. Used in prose and internal links. */
 neighbourhoods: string[];
 /** Coordinates for the service-area map embed. */
 lat: number;
 lng: number;
}

export const PRIMARY_CITY = {
 slug: "oakville",
 name: "Oakville",
 wikidata: "Q424984",
 lat: 43.4675,
 lng: -79.6877,
};

export const CITIES: City[] = [
 {
 slug: "toronto",
 name: "Toronto",
 region: "Toronto",
 wikidata: "Q172",
 volume: 850,
 cpc: 15.97,
 weakness: 4.7,
 rEntry: 5,
 driveMinutes: 45,
 neighbourhoods: ["The Kingsway", "Leaside", "Willowdale", "High Park", "Lawrence Park"],
 lat: 43.6532,
 lng: -79.3832,
 },
 {
 slug: "mississauga",
 name: "Mississauga",
 region: "Peel Region",
 wikidata: "Q50816",
 volume: 160,
 cpc: 8.75,
 weakness: 5.0,
 rEntry: 10,
 driveMinutes: 18,
 neighbourhoods: ["Lorne Park", "Port Credit", "Streetsville", "Erin Mills", "Churchill Meadows"],
 lat: 43.589,
 lng: -79.6441,
 },
 {
 slug: "brampton",
 name: "Brampton",
 region: "Peel Region",
 wikidata: "Q44198",
 volume: 60,
 cpc: 7.18,
 weakness: 5.7,
 rEntry: 0,
 driveMinutes: 40,
 neighbourhoods: ["Springdale", "Bramalea", "Mount Pleasant", "Castlemore", "Credit Valley"],
 lat: 43.7315,
 lng: -79.7624,
 },
 {
 slug: "hamilton",
 name: "Hamilton",
 region: "Hamilton",
 wikidata: "Q133116",
 volume: 60,
 cpc: 8.09,
 weakness: 5.0,
 rEntry: 1,
 driveMinutes: 30,
 neighbourhoods: ["Ancaster", "Dundas", "Stoney Creek", "Westdale", "Hamilton Mountain"],
 lat: 43.2557,
 lng: -79.8711,
 },
 {
 slug: "vaughan",
 name: "Vaughan",
 region: "York Region",
 wikidata: "Q44013",
 volume: 50,
 cpc: 10.24,
 weakness: 5.7,
 rEntry: 2,
 driveMinutes: 50,
 neighbourhoods: ["Kleinburg", "Woodbridge", "Maple", "Vellore Village", "Patterson"],
 lat: 43.8361,
 lng: -79.4983,
 },
 {
 slug: "milton",
 name: "Milton",
 region: "Halton Region",
 wikidata: "Q425057",
 volume: 20,
 cpc: 9.91,
 weakness: 6.7,
 rEntry: 14,
 driveMinutes: 20,
 neighbourhoods: ["Hawthorne Village", "Old Milton", "Willmott", "Scott", "Ford"],
 lat: 43.5183,
 lng: -79.8774,
 },
];

export const cityBySlug = (slug: string) => CITIES.find((c) => c.slug === slug);

/** Sibling links for the "nearby" block. Keeps every city page 5 internal links richer. */
export const siblingsOf = (slug: string) => CITIES.filter((c) => c.slug !== slug);

/**
 * Standalone service pages. City-suffixed variants of all three read 0/mo
 * (checked Aug 2026: "metallic epoxy oakville" 0, "basement floor coating oakville" 0,
 * "polyaspartic oakville" 0), so these are GTA-scoped rather than city-scoped.
 */
export interface ServicePage {
  slug: string;
  nav: string;
  /** Head term the page targets, with its measured monthly volume. */
  target: string;
  volume: number;
}

export const SERVICE_PAGES: ServicePage[] = [
  { slug: "polyaspartic-garage-floors", nav: "Polyaspartic garage floors",
    target: "polyaspartic floor coating", volume: 1300 },
  { slug: "basement-floor-coating", nav: "Basement floor coating",
    target: "basement floor coating", volume: 880 },
  { slug: "metallic-epoxy-flooring", nav: "Metallic epoxy flooring",
    target: "metallic epoxy flooring", volume: 480 },
];

export const SERVICE = {
 slug: "epoxy-flooring",
 name: "Epoxy flooring",
 /**
 * The SERP overlap test (Aug 2026, top-10 domains, 5 cities) put garage floor
 * coating (5.8/10), metallic epoxy (6.0/10) and commercial epoxy (6.2/10) on the
 * same page as epoxy flooring. Polyaspartic (2.4/10) and concrete resurfacing
 * (0.6/10) are separate SERPs and get their own pages, not city variants -
 * they show 0/mo at city level Ontario-wide.
 */
 absorbs: ["garage floor coating", "metallic epoxy", "commercial epoxy flooring"],
};
