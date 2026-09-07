import { getPostBySlug } from './db.js';

export function slugify(title) {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export async function uniqueSlug(title, excludeId = null) {
    const base = slugify(title) || 'post';
    let slug = base;
    let n = 2;
    while (true) {
        const existing = await getPostBySlug(slug);
        if (!existing || existing.id === excludeId) return slug;
        slug = `${base}-${n}`;
        n += 1;
    }
}
