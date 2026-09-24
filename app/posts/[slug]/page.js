import { notFound } from 'next/navigation';
import { marked } from 'marked';
import { getPostBySlug } from '@/lib/db.js';
import { SITE_URL, jsonLd, pageMeta } from '@/lib/site.js';

function formatTimestamp(value) {
    return new Date(value).toISOString().slice(0, 16).replace('T', ' ');
}

// Google shows this under the title in search results — the site-wide default ("Shipping
// small data tools in public") told a searcher nothing about what a specific post covers, so
// every post needs its own, derived from its actual first paragraph.
function excerptFrom(markdownBody, maxLength = 150) {
    const plainText = marked.parse(markdownBody)
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    if (plainText.length <= maxLength) return plainText;
    const truncated = plainText.slice(0, maxLength);
    return `${truncated.slice(0, truncated.lastIndexOf(' '))}…`;
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);
    if (!post || !post.published) return {};
    return pageMeta({ title: post.title, description: excerptFrom(post.body), path: `/posts/${post.slug}`, type: 'article' });
}

export default async function PostPage({ params }) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);
    if (!post || !post.published) notFound();

    return (
        <div className="wrap">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={jsonLd({
                    '@context': 'https://schema.org',
                    '@type': 'BlogPosting',
                    headline: post.title,
                    description: excerptFrom(post.body),
                    datePublished: new Date(post.created_at).toISOString(),
                    url: `${SITE_URL}/posts/${post.slug}`,
                    mainEntityOfPage: `${SITE_URL}/posts/${post.slug}`,
                    author: { '@id': `${SITE_URL}/#org` },
                    publisher: { '@id': `${SITE_URL}/#org` },
                })}
            />
            <div className="post-header">
                <span className="post-meta">{formatTimestamp(post.created_at)}</span>
                <h1 className="post-title">{post.title}</h1>
            </div>
            <div className="post-body" dangerouslySetInnerHTML={{ __html: marked.parse(post.body) }} />
        </div>
    );
}
