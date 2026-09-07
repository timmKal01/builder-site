import Link from 'next/link';
import { requireSession } from '@/lib/session.js';
import { getAllPosts } from '@/lib/db.js';
import { logoutAction } from './actions.js';

function formatDate(value) {
    return new Date(value).toISOString().slice(0, 10);
}

export default async function AdminDashboard() {
    await requireSession();
    const posts = await getAllPosts();

    return (
        <div className="wrap">
            <div className="admin-page">
                <div className="admin-toolbar">
                    <h1 className="page-title">Posts</h1>
                    <div className="admin-toolbar__actions">
                        <Link href="/admin/posts/new" className="btn">
                            New post
                        </Link>
                        <form action={logoutAction}>
                            <button className="btn btn-ghost" type="submit">
                                Log out
                            </button>
                        </form>
                    </div>
                </div>

                {posts.length === 0 ? (
                    <p className="log-empty">No posts yet.</p>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts.map((post) => (
                                <tr key={post.id}>
                                    <td>{post.title}</td>
                                    <td>
                                        <span className={`status-pill ${post.published ? 'status-pill--live' : ''}`}>
                                            {post.published ? 'live' : 'draft'}
                                        </span>
                                    </td>
                                    <td>{formatDate(post.created_at)}</td>
                                    <td>
                                        <div className="admin-row-actions">
                                            <Link href={`/admin/posts/${post.id}/edit`}>Edit</Link>
                                            {post.published ? (
                                                <a href={`/posts/${post.slug}`} target="_blank" rel="noreferrer">
                                                    View
                                                </a>
                                            ) : null}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
