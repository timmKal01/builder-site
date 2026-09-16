import { getPublishedPosts } from '@/lib/db.js';

const SITE_URL = 'https://builder-site-lovat.vercel.app';

export default async function sitemap() {
    const posts = await getPublishedPosts();

    const staticRoutes = ['', '/actors', '/log'].map((path) => ({
        url: `${SITE_URL}${path}`,
        lastModified: new Date(),
    }));

    const postRoutes = posts.map((post) => ({
        url: `${SITE_URL}/posts/${post.slug}`,
        lastModified: new Date(post.created_at),
    }));

    return [...staticRoutes, ...postRoutes];
}
