/**
 * Single source of truth for NAP and site identity.
 *
 * ⚠️ PHONE IS STILL A PLACEHOLDER. 905-555-0174 is a reserved fictional-use number
 * (the 555 block). It is live on the production site today. Replace BOTH constants
 * below with the real business line before this site is promoted, submitted to any
 * directory, or attached to a Google Business Profile - a wrong NAP propagates into
 * citations and is painful to unwind later.
 *
 * Nothing else in the codebase should hardcode a phone number.
 */
export const PHONE_PLACEHOLDER = true;

/** E.164-ish digits, used for tel: hrefs. */
export const PHONE_HREF = "9055550174";
/** Display form, used in visible text. */
export const PHONE_DISPLAY = "905 · 555 · 0174";

export const EMAIL = "quote@ironsidecoatings.ca";

export const SITE_URL = "https://ironsidecoatings.ca";
export const BRAND = "Ironside Coatings";

/**
 * Locality + region only. Deliberately no streetAddress in schema: for a
 * service-area business, publishing a street address for a non-public dispatch
 * location alongside a tight areaServed signals a storefront/SAB mismatch.
 */
export const BASE_LOCALITY = "Oakville";
export const BASE_REGION = "ON";
export const BASE_COUNTRY = "CA";
