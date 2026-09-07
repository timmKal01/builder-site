'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireSession, clearSessionCookie } from '@/lib/session.js';
import { createPost, updatePost, deletePost, getPostById } from '@/lib/db.js';
import { uniqueSlug } from '@/lib/slug.js';

export async function createPostAction(prevState, formData) {
    await requireSession();

    const title = String(formData.get('title') ?? '').trim();
    const body = String(formData.get('body') ?? '').trim();
    const published = formData.get('published') === 'on';

    if (!title || !body) {
        return { error: 'Title and body are both required.' };
    }

    const slug = await uniqueSlug(title);
    await createPost({ slug, title, body, published });

    revalidatePath('/');
    revalidatePath('/admin');
    redirect('/admin');
}

export async function updatePostAction(prevState, formData) {
    await requireSession();

    const id = Number(formData.get('id'));
    const title = String(formData.get('title') ?? '').trim();
    const body = String(formData.get('body') ?? '').trim();
    const published = formData.get('published') === 'on';

    if (!title || !body) {
        return { error: 'Title and body are both required.' };
    }

    const existing = await getPostById(id);
    if (!existing) {
        return { error: 'Post not found.' };
    }

    const slug = existing.title === title ? existing.slug : await uniqueSlug(title, id);
    await updatePost(id, { slug, title, body, published });

    revalidatePath('/');
    revalidatePath('/admin');
    revalidatePath(`/posts/${slug}`);
    redirect('/admin');
}

export async function deletePostAction(formData) {
    await requireSession();
    const id = Number(formData.get('id'));
    await deletePost(id);
    revalidatePath('/');
    revalidatePath('/admin');
    redirect('/admin');
}

export async function logoutAction() {
    await clearSessionCookie();
    redirect('/admin/login');
}
