'use server';

import { revalidatePath } from 'next/cache';
import { requireAccount } from '@/lib/signals/account.js';
import { createSignal, countSignalsForAccount, setSignalActive } from '@/lib/signals/db.js';
import { isKnownSource, getSource } from '@/lib/signals/sources.js';
import { effectivePlan } from '@/lib/signals/plans.js';

const MAX_NAME = 80;

export async function createSignalAction(prevState, formData) {
    const account = await requireAccount();
    if (!account) return { error: 'Sign in again to continue.' };

    const name = String(formData.get('name') ?? '').trim();
    const source = String(formData.get('source') ?? '');
    const schedule = String(formData.get('schedule') ?? '');
    const query = String(formData.get('query') ?? '').trim();

    if (!name) return { error: 'Give the signal a name.' };
    if (name.length > MAX_NAME) return { error: `Keep the name under ${MAX_NAME} characters.` };

    // isKnownSource uses a prototype-safe lookup, so '__proto__' or
    // 'constructor' posted here cannot resolve to something runnable.
    if (!isKnownSource(source)) return { error: 'Pick a source.' };
    if (!query) return { error: 'Say what to search for.' };

    // The plan is checked at creation as well as at run time. The cron would
    // park an over-limit signal anyway, but silently never running something
    // the customer just created is a bad way to find out.
    const plan = effectivePlan(account);
    if (!plan.schedules.includes(schedule)) {
        return { error: `The ${plan.label} plan runs ${plan.schedules.join(' or ')} only.` };
    }

    const existing = await countSignalsForAccount(account.id);
    if (existing >= plan.signals) {
        return {
            error:
                plan.lapsed
                    ? `Your plan has lapsed, so you are limited to ${plan.signals}. Renew to add more.`
                    : `The ${plan.label} plan allows ${plan.signals} signal${plan.signals === 1 ? '' : 's'}.`,
        };
    }

    const definition = getSource(source);
    await createSignal({
        accountId: account.id,
        name,
        source,
        // Each source reads its own search text, so the free-form field is
        // mapped onto whatever that actor calls it rather than guessing a
        // shared shape across four different actors.
        input: { ...definition.defaultInput, query },
        schedule,
        deliverTo: [account.email],
    });

    revalidatePath('/dashboard');
    return { ok: 'Signal created. It runs on the next scheduled pass.' };
}

export async function toggleSignalAction(formData) {
    const account = await requireAccount();
    if (!account) return;

    const signalId = Number(formData.get('signalId'));
    const active = formData.get('active') === 'true';
    if (!Number.isInteger(signalId)) return;

    // Scoped by account id, so a guessed signal id in the form cannot pause
    // somebody else's search.
    await setSignalActive(signalId, account.id, active);
    revalidatePath('/dashboard');
}
