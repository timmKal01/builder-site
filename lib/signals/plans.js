// What a plan allows, and what it costs in each market.
//
// The two prices are set independently, not converted. At ~129.5 KES to the
// dollar the USD price would come out around KES 6,350, which is steep for a
// solo Nairobi freelancer and cheap for a US agency — the same number in two
// markets is the wrong number in at least one of them. So KES is priced
// against what a local web shop earns from one closed client, and USD against
// what comparable lead tools charge.
//
// Amounts are in minor units (cents, KES cents) because that is what Paystack
// expects and because storing money as a float is how rounding bugs start.

export const CURRENCIES = ['USD', 'KES'];
export const INTERVALS = ['monthly', 'quarterly'];

export const PRICES = {
    pro: {
        // $19 (the owner's price, 2026-11-06). Swokei, the closest product,
        // starts at $42 but also writes and sends the emails; this sells the
        // leads alone, so it sits well under that.
        USD: { monthly: 1900, quarterly: 5100 },
        // One closed website client in Nairobi is worth many multiples of a
        // year of this, which is the pitch. Quarterly carries a discount
        // mainly to cut the number of manual M-Pesa renewals, since M-Pesa
        // cannot auto-debit and every renewal is a chance to lapse.
        KES: { monthly: 150000, quarterly: 400000 },
    },
};

export const PLANS = {
    free: {
        label: 'Free',
        signals: 1,
        cities: 1,
        schedules: ['weekly'],
        // Every free run spends real Apify budget, so the free tier is a
        // sales tool with a hard ceiling, not a small version of the product.
        maxNewPerRun: 10,
        maxNewPerMonth: 40,
        paid: false,
    },
    pro: {
        label: 'Pro',
        signals: 5,
        cities: 5,
        schedules: ['weekly', 'daily'],
        // Each lead costs about $0.003-0.005 in Gap Finder events on the
        // owner's account, so 1,000 a month is $3-5 against $19. Without a
        // monthly cap, five daily searches could cost more than the plan earns.
        maxNewPerRun: 100,
        maxNewPerMonth: 1000,
        paid: true,
    },
};

export function getPlan(name) {
    return Object.hasOwn(PLANS, name) ? PLANS[name] : PLANS.free;
}

// What the account can actually do right now.
//
// A lapsed account drops to free rather than stopping dead: they keep one
// weekly signal and carry on seeing a trickle of leads. Someone still getting
// a little value renews; someone staring at an error message churns. The
// distinction matters more for M-Pesa, where lapsing is a missed reminder
// rather than a deliberate cancellation.
export function effectivePlan(account, now = new Date()) {
    const named = getPlan(account?.plan);
    if (!named.paid) return { name: account?.plan ?? 'free', ...PLANS.free, lapsed: false };

    const until = account?.paid_until ? new Date(account.paid_until) : null;
    const active = until instanceof Date && !Number.isNaN(until.getTime()) && until > now;

    if (active) return { name: account.plan, ...named, lapsed: false };
    return { name: 'free', ...PLANS.free, lapsed: true };
}

export function priceFor(plan, currency, interval) {
    return PRICES[plan]?.[currency]?.[interval] ?? null;
}

// Minor units to something a human reads on an invoice.
export function formatPrice(minorUnits, currency) {
    if (minorUnits == null) return null;
    const major = minorUnits / 100;
    if (currency === 'KES') return `KES ${major.toLocaleString('en-KE')}`;
    return `$${major.toFixed(major % 1 === 0 ? 0 : 2)}`;
}

// How far a payment moves paid_until. Extends from whichever is later: the
// existing expiry or now. Renewing early should add to the time left, not
// quietly throw the remainder away — and paying late must not back-date the
// new period into the past.
export function extendFrom(currentPaidUntil, interval, now = new Date()) {
    const current = currentPaidUntil ? new Date(currentPaidUntil) : null;
    const base = current && !Number.isNaN(current.getTime()) && current > now ? current : now;

    const next = new Date(base.getTime());
    next.setUTCMonth(next.getUTCMonth() + (interval === 'quarterly' ? 3 : 1));
    return next;
}
