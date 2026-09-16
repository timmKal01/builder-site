const SITE_URL = 'https://builder-site-lovat.vercel.app';

export default function robots() {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: '/admin',
        },
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}
