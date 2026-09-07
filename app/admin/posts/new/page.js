import { requireSession } from '@/lib/session.js';
import { createPostAction } from '../../actions.js';
import PostForm from '../../PostForm.js';

export default async function NewPostPage() {
    await requireSession();

    return (
        <div className="wrap">
            <div className="form-page">
                <h1 className="page-title">New post</h1>
                <PostForm action={createPostAction} />
            </div>
        </div>
    );
}
