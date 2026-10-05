import { auth, currentUser } from '@clerk/nextjs/server';
import { upsertAccount } from './db.js';

// Clerk owns identity; this turns the signed-in Clerk user into the local
// account row that signals hang off. Done lazily on first use rather than via
// a Clerk webhook: no signing secret to manage, and no window where someone
// has signed up but has no row because a webhook was dropped.
export async function requireAccount() {
    const { userId } = await auth();
    if (!userId) return null;

    const user = await currentUser();
    const email =
        user?.primaryEmailAddress?.emailAddress ??
        user?.emailAddresses?.[0]?.emailAddress ??
        null;

    // Without an email there is nowhere to deliver leads, which is the entire
    // product. Better to fail here than to create an account that can never
    // receive anything.
    if (!email) return null;

    // Kenyan sign-ups are priced in shillings, so the default currency follows
    // the country Clerk saw at sign-up. It is only a default: the account row
    // is editable and the admin can change it when someone pays in the other.
    const country = user?.primaryPhoneNumber?.phoneNumber?.startsWith('+254') ? 'KES' : 'USD';

    return upsertAccount({ clerkUserId: userId, email, currency: country });
}
