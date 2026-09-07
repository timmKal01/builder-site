import { notFound } from 'next/navigation';
import { marked } from 'marked';
import { getPostBySlug } from '@/lib/db.js';

function formatTimestamp(iso) {
    const d = new Date(`${iso}Z`);
    return d.toISOString().slice(0, 16).replace('T', ' ');
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const post = getPostBySlug(slug);
    if (!post || !post.published) return {};
    return { title: post.title };
}

export default async function PostPage({ params }) {
    const { slug } = await params;
    const post = getPostBySlug(slug);
    if (!post || !post.published) notFound();

    return (
        <div className="wrap">
            <div className="post-header">
                <span className="post-meta">{formatTimestamp(post.created_at)}</span>
                <h1 className="post-title">{post.title}</h1>
            </div>
            <div className="post-body" dangerouslySetInnerHTML={{ __html: marked.parse(post.body) }} />
        </div>
    );
}
