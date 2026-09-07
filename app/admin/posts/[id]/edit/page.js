import { notFound } from 'next/navigation';
import { requireSession } from '@/lib/session.js';
import { getPostById } from '@/lib/db.js';
import { updatePostAction, deletePostAction } from '../../../actions.js';
import PostForm from '../../../PostForm.js';

export default async function EditPostPage({ params }) {
    await requireSession();
    const { id } = await params;
    const post = await getPostById(Number(id));
    if (!post) notFound();

    return (
        <div className="wrap">
            <div className="form-page">
                <h1 className="page-title">Edit post</h1>
                <PostForm action={updatePostAction} post={post} />

                <form action={deletePostAction} className="delete-form">
                    <input type="hidden" name="id" defaultValue={post.id} />
                    <button className="btn btn-ghost btn-danger" type="submit">
                        Delete post
                    </button>
                </form>
            </div>
        </div>
    );
}
