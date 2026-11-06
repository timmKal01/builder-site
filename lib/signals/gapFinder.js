// A web design lead search, as the customer describes it, and the Website Gap Finder input it becomes.
//
// Two shapes on purpose. What's saved on the signal is the search itself (type, cities, which leads). What's sent to
// the actor on each run adds the parts that change run to run: how many leads this run may bring, and the name of
// the signal's own "already returned" list in Gap Finder. That list is what keeps a run cheap. Gap Finder skips the
// businesses it already returned for this signal before auditing them, so they're neither re-audited nor charged,
// and one customer's leads never hide another's (a single shared list would).

// Gap Finder's 32 business types (its searchCategory enum), with the names its form shows.
export const BUSINESS_TYPES = [
    ['plumber', 'Plumbers'], ['electrician', 'Electricians'], ['hvac', 'Heating and air conditioning (HVAC)'],
    ['roofer', 'Roofers'], ['carpenter', 'Carpenters and joiners'], ['painter', 'Painters and decorators'],
    ['hair', 'Hair salons and barbers'], ['beauty', 'Beauty and nail salons'], ['massage', 'Massage and spas'],
    ['tattoo', 'Tattoo and piercing studios'], ['dentist', 'Dentists'], ['doctor', 'Doctors and clinics'],
    ['physio', 'Physiotherapists'], ['vet', 'Veterinarians'], ['optician', 'Opticians'],
    ['gym', 'Gyms and fitness studios'], ['restaurant', 'Restaurants'], ['cafe', 'Cafes'], ['bakery', 'Bakeries'],
    ['hotel', 'Hotels and guest houses'], ['car_repair', 'Car repair garages'], ['car_dealer', 'Car dealers'],
    ['lawyer', 'Lawyers'], ['accountant', 'Accountants'], ['estate_agent', 'Real estate agents'],
    ['florist', 'Florists'], ['clothes', 'Clothing stores'], ['furniture', 'Furniture stores'],
    ['photographer', 'Photographers'], ['driving_school', 'Driving schools'], ['childcare', 'Nurseries and childcare'],
    ['laundry', 'Laundry and dry cleaning'],
];
const TYPE_KEYS = new Set(BUSINESS_TYPES.map(([key]) => key));

export const MAX_TERM = 80;
export const MAX_CITY = 100;
export const DEFAULT_MIN_SCORE = 50;
// Gap Finder's own ceiling on maxBusinesses.
const ACTOR_MAX_BUSINESSES = 2000;

/** Cities from a textarea: one per line (commas inside a line are part of the place, e.g. "Denver, USA"). */
export function parseCities(text) {
    const out = [];
    for (const line of String(text ?? '').split(/\r?\n/)) {
        const city = line.trim().replace(/\s+/g, ' ');
        if (city && !out.some((c) => c.toLowerCase() === city.toLowerCase())) out.push(city);
    }
    return out;
}

/** The cities a saved search covers. */
export function citiesOf(input) {
    return [input?.searchLocation, ...(input?.searchLocations ?? [])].filter(Boolean);
}

/** What the search looks for, for people: the typed term, or the business type's name. */
export function describeSearch(input) {
    const what = input?.searchTerm || BUSINESS_TYPES.find(([key]) => key === input?.searchCategory)?.[1] || 'Businesses';
    return `${what} in ${citiesOf(input).join(', ') || 'no city'}`;
}

/**
 * The search as saved on the signal, or an error to show on the form.
 * @param {{ businessType?: string, term?: string, citiesText?: string, leadType?: string, minScore?: string|number }} form
 * @param {{ maxCities: number }} limits
 */
export function searchInput(form, { maxCities }) {
    const term = String(form.term ?? '').trim().replace(/\s+/g, ' ');
    const businessType = String(form.businessType ?? '');
    if (term.length > MAX_TERM) return { error: `Keep the business type under ${MAX_TERM} characters.` };
    if (!term && !TYPE_KEYS.has(businessType)) return { error: 'Pick a type of business, or type one.' };

    const cities = parseCities(form.citiesText);
    if (cities.length === 0) return { error: 'Add at least one city or area, e.g. "Denver, USA".' };
    if (cities.some((c) => c.length > MAX_CITY)) return { error: `Keep each city under ${MAX_CITY} characters.` };
    if (cities.length > maxCities) {
        return { error: `Your plan covers ${maxCities} cit${maxCities === 1 ? 'y' : 'ies'} per search. Remove ${cities.length - maxCities}, or upgrade.` };
    }

    const noWebsiteOnly = form.leadType === 'no_website';
    const score = Number(form.minScore);
    const minScore = Number.isFinite(score) ? Math.min(100, Math.max(0, Math.round(score))) : DEFAULT_MIN_SCORE;

    return {
        input: {
            ...(term ? { searchTerm: term } : { searchCategory: businessType }),
            searchLocation: cities[0],
            ...(cities.length > 1 ? { searchLocations: cities.slice(1) } : {}),
            onlyNoWebsite: noWebsiteOnly,
            // "Any website gap" keeps only businesses whose site scores at least minScore. A no-website lead always
            // scores high, so the filter matters only for businesses that have a site.
            onlyOpportunities: !noWebsiteOnly && minScore > 0,
            minScore,
            extractContacts: true,
        },
    };
}

/** Gap Finder's "already returned" list for one signal: lowercase, digits and hyphens, as Gap Finder requires. */
export function seenListName(signalId) {
    return `tidefeed-signal-${signalId}`;
}

/**
 * The input sent to Gap Finder on one run. maxBusinesses is per city, and rounded down so a run can never return
 * more than this run may deliver: Gap Finder remembers everything it returns, so a lead over the cap would be gone.
 */
export function runInput(saved, { signalId, maxNew }) {
    const cities = Math.max(1, citiesOf(saved).length);
    const perCity = Number.isFinite(maxNew) ? Math.max(1, Math.floor(maxNew / cities)) : 100;
    return {
        ...saved,
        onlyNew: true,
        seenListName: seenListName(signalId),
        maxBusinesses: Math.min(ACTOR_MAX_BUSINESSES, perCity),
    };
}
