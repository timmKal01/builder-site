'use client';

import { useActionState } from 'react';

const initialState = { error: null };

export default function PostForm({ action, post }) {
    const [state, formAction, pending] = useActionState(action, initialState);

    return (
        <form action={formAction}>
            {post && <input type="hidden" name="id" defaultValue={post.id} />}
            {state?.error && <p className="form-error">{state.error}</p>}

            <div className="form-field">
                <label htmlFor="title">Title</label>
                <input id="title" name="title" type="text" defaultValue={post?.title ?? ''} required />
            </div>

            <div className="form-field">
                <label htmlFor="body">Body (markdown)</label>
                <textarea id="body" name="body" defaultValue={post?.body ?? ''} required />
            </div>

            <label className="form-checkbox">
                <input type="checkbox" name="published" defaultChecked={post?.published === true} />
                Published
            </label>

            <button className="btn" type="submit" disabled={pending}>
                {pending ? 'Saving…' : 'Save'}
            </button>
        </form>
    );
}
