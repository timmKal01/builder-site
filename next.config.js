/** @type {import('next').NextConfig} */
const nextConfig = {
    // The site was renamed from builder-site-lovat.vercel.app to Tidefeed.
    // Permanent redirect (308 keeps POST bodies for the demo API) so Google
    // transfers the old address's standing to the new one.
    async redirects() {
        return [
            {
                source: '/:path*',
                has: [{ type: 'host', value: 'builder-site-lovat.vercel.app' }],
                destination: 'https://tidefeed.vercel.app/:path*',
                permanent: true,
            },
            // Google Maps Leads and the Email & Phone Extractor merged into Website Gap Finder (2026-11-11), so the
            // extractor's demo page sends people to the actor that now does the job.
            {
                source: '/try/website-lead-extractor',
                destination: 'https://apify.com/m_ctim/website-gap-finder',
                permanent: true,
            },
            // Website Tech Stack Detector merged into Tech Stack Lead Finder (2026-11-13): no filters = every site's stack.
            {
                source: '/try/website-tech-stack-detector',
                destination: 'https://apify.com/m_ctim/tech-stack-lead-finder',
                permanent: true,
            },
        ];
    },
};

export default nextConfig;
