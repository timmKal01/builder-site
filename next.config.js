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
        ];
    },
};

export default nextConfig;
