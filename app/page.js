import Link from 'next/link';
import { getPublishedPosts } from '@/lib/db.js';

function excerpt(body, max = 180) {
    const plain = body.replace(/[#*`_>[\]]/g, '').replace(/\s+/g, ' ').trim();
    return plain.length > max ? `${plain.slice(0, max).trimEnd()}…` : plain;
}

function formatTimestamp(iso) {
    const d = new Date(`${iso}Z`);
    return d.toISOString().slice(0, 16).replace('T', ' ');
}

export default function HomePage() {
    const posts = getPublishedPosts();

    return (
        <div className="wrap">
            <section className="hero">
                <p className="hero__eyebrow">activity log</p>
                <h1 className="hero__title">What shipped, and what broke on the way there.</h1>
                <p className="hero__lede">
                    A running record of building a portfolio of small data-fetching tools —
                    what got built, what the data source did that the docs didn't mention,
                    and what's live now.
                </p>
            </section>

            {posts.length === 0 ? (
                <p className="log-empty">Nothing published yet.</p>
            ) : (
                <ol className="log">
                    {posts.map((post) => (
                        <li className="log-entry" key={post.id}>
                            <div className="log-entry__meta">
                                <span className="log-entry__time">{formatTimestamp(post.created_at)}</span>
                            </div>
                            <h2 className="log-entry__title">
                                <Link href={`/posts/${post.slug}`}>{post.title}</Link>
                            </h2>
                            <p className="log-entry__excerpt">{excerpt(post.body)}</p>
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
}
