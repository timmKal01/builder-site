import { getPublishedPosts } from '@/lib/db.js';
import { DEMO_PATHS } from '@/lib/actors.js';
import { SITE_URL } from '@/lib/site.js';

// Rebuilt hourly so newly published posts show up without a redeploy.
export const revalidate = 3600;

export default async function sitemap() {
    const posts = await getPublishedPosts();

    const staticRoutes = [
        { path: '', priority: 1, changeFrequency: 'daily' },
        { path: '/actors', priority: 0.9, changeFrequency: 'weekly' },
        { path: '/log', priority: 0.7, changeFrequency: 'weekly' },
    ].map(({ path, priority, changeFrequency }) => ({
        url: `${SITE_URL}${path}`,
        lastModified: new Date(),
        changeFrequency,
        priority,
    }));

    const demoRoutes = Object.values(DEMO_PATHS).map((path) => ({
        url: `${SITE_URL}${path}`,
        changeFrequency: 'monthly',
        priority: 0.8,
    }));

    const postRoutes = posts.map((post) => ({
        url: `${SITE_URL}/posts/${post.slug}`,
        lastModified: new Date(post.created_at),
        changeFrequency: 'monthly',
        priority: 0.6,
    }));

    return [...staticRoutes, ...demoRoutes, ...postRoutes];
}
