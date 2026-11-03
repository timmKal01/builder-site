// Single source for the site's identity. The old builder-site-lovat.vercel.app
// address 308-redirects here (see next.config.js).
export const SITE_URL = 'https://tidefeed.vercel.app';
export const SITE_NAME = 'Tidefeed';
export const SITE_TITLE = 'Tidefeed: Google Maps Leads, Jobs & Public Data APIs';
export const SITE_DESCRIPTION =
    'Pay-per-use APIs for Google Maps business leads, website audits, job listings, SEC filings and US government data. Clean JSON, no logins.';

// Per-page metadata with a self-referencing canonical and matching social
// tags. Canonical can't live in the root layout: children inherit it, which
// would point every page's canonical at the homepage.
export function pageMeta({ title, description, path, absoluteTitle = false, type = 'website' }) {
    const socialTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`;
    // A page that sets openGraph drops the root opengraph-image, so attach it explicitly.
    const images = [{ url: '/opengraph-image', width: 1200, height: 630, alt: SITE_TITLE }];
    return {
        title: absoluteTitle ? { absolute: title } : title,
        description,
        alternates: { canonical: path },
        openGraph: { title: socialTitle, description, url: path, siteName: SITE_NAME, type, locale: 'en_US', images },
        twitter: { card: 'summary_large_image', title: socialTitle, description, images },
    };
}

export function jsonLd(data) {
    return { __html: JSON.stringify(data).replace(/</g, '\\u003c') };
}
