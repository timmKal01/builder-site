'use server';

import { revalidatePath } from 'next/cache';
import { requireSession } from '@/lib/session.js';
import { getAccountById, extendAccess, recordPayment } from '@/lib/signals/db.js';
import { PLANS, CURRENCIES, INTERVALS, priceFor, extendFrom } from '@/lib/signals/plans.js';

// Marking an invoice paid by hand. This is the whole billing system until
// there are enough customers for it to be annoying, which is a good problem.
//
// It does two things that have to stay together: moves paid_until out, and
// writes down what was paid. The account row carries only the current date,
// so without the payment row there is no answer to "when did they last pay
// and how much" — the first question asked the moment anything is disputed.
export async function markPaidAction(prevState, formData) {
    await requireSession();

    const accountId = Number(formData.get('accountId'));
    const plan = String(formData.get('plan') ?? '');
    const interval = String(formData.get('interval') ?? '');
    const currency = String(formData.get('currency') ?? '');
    const reference = String(formData.get('reference') ?? '').trim();

    if (!Number.isInteger(accountId) || accountId <= 0) {
        return { error: 'Pick an account.' };
    }
    if (!Object.hasOwn(PLANS, plan) || !PLANS[plan].paid) {
        return { error: 'Pick a paid plan.' };
    }
    if (!INTERVALS.includes(interval)) {
        return { error: 'Pick a billing interval.' };
    }
    if (!CURRENCIES.includes(currency)) {
        return { error: 'Pick a currency.' };
    }

    const account = await getAccountById(accountId);
    if (!account) return { error: 'Account not found.' };

    const amountMinor = priceFor(plan, currency, interval);
    if (amountMinor == null) {
        return { error: `No ${plan} price is set for ${currency} ${interval}.` };
    }

    // Extends from whichever is later, the existing expiry or now, so renewing
    // early adds to the time left and paying late is never back-dated.
    const paidUntil = extendFrom(account.paid_until, interval);

    try {
        await recordPayment({
            accountId,
            amountMinor,
            currency,
            interval,
            provider: 'manual',
            reference,
            paidUntil,
        });
    } catch (error) {
        // The unique index on (provider, reference) is what stops the same
        // M-Pesa code being credited twice on a double-submit.
        if (error?.code === '23505') {
            return { error: `Reference "${reference}" has already been recorded.` };
        }
        throw error;
    }

    await extendAccess(accountId, {
        plan,
        paidUntil,
        interval,
        provider: 'manual',
    });

    revalidatePath('/admin/billing');
    return { ok: `Paid until ${paidUntil.toISOString().slice(0, 10)}.` };
}

// Suspending is deliberately separate from lapsing. A lapsed account drops to
// the free tier on its own when paid_until passes; this is for the rarer case
// of stopping an account outright, and it is reversible.
export async function setAccountStatusAction(formData) {
    await requireSession();

    const accountId = Number(formData.get('accountId'));
    const status = String(formData.get('status') ?? '');
    if (!['active', 'suspended'].includes(status)) return;

    const { setAccountStatus } = await import('@/lib/signals/db.js');
    await setAccountStatus(accountId, status);
    revalidatePath('/admin/billing');
}
