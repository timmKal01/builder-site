'use server';

import { revalidatePath } from 'next/cache';
import { requireAccount } from '@/lib/signals/account.js';
import { createSignal, countSignalsForAccount, setSignalActive } from '@/lib/signals/db.js';
import { effectivePlan } from '@/lib/signals/plans.js';
import { searchInput } from '@/lib/signals/gapFinder.js';

const MAX_NAME = 80;
const SOURCE = 'website-gap-finder';

export async function createSignalAction(prevState, formData) {
    const account = await requireAccount();
    if (!account) return { error: 'Sign in again to continue.' };

    const name = String(formData.get('name') ?? '').trim();
    const schedule = String(formData.get('schedule') ?? '');

    if (!name) return { error: 'Give the search a name.' };
    if (name.length > MAX_NAME) return { error: `Keep the name under ${MAX_NAME} characters.` };

    // The plan is checked at creation as well as at run time. The cron would
    // park an over-limit search anyway, but silently never running something
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
                    : `The ${plan.label} plan allows ${plan.signals} search${plan.signals === 1 ? '' : 'es'}.`,
        };
    }

    // The search itself becomes Website Gap Finder's input (lib/signals/gapFinder.js).
    const { input, error } = searchInput(
        {
            businessType: formData.get('businessType'),
            term: formData.get('term'),
            citiesText: formData.get('cities'),
            leadType: formData.get('leadType'),
            minScore: formData.get('minScore'),
        },
        { maxCities: plan.cities }
    );
    if (error) return { error };

    await createSignal({
        accountId: account.id,
        name,
        source: SOURCE,
        input,
        schedule,
        deliverTo: [account.email],
    });

    revalidatePath('/dashboard');
    return { ok: 'Search saved. Its first leads arrive on the next scheduled run (every morning at 06:00 UTC).' };
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
