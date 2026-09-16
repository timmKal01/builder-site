import { createPost } from '../lib/db.js';

const title = 'Tracking New Clinical Trial Postings by Sponsor Without an Enterprise CI Subscription';
const slug = 'tracking-new-clinical-trial-postings-by-sponsor';

const body = `If you do business development for a CRO, a lab or reagent supplier, or a
patient recruitment firm, you already know the timing trick: the moment a
sponsor posts a new trial, especially an early Phase 1, is the moment their
vendor budget is still up for grabs. A week later the CRO shortlist is
already locked in and you're too late.

The data that tells you this is happening is public. ClinicalTrials.gov runs
a free API (no key, no login) that anyone can query by sponsor, condition,
phase, or status, and it updates the same day a trial gets posted. The
problem isn't access, it's that almost nobody on a BD or competitive
intelligence team is going to hand-write API queries and re-run them every
morning. So the fallback is either a manual check nobody keeps up with, or a
subscription to an enterprise competitive-intelligence platform priced for
teams that need a lot more than "tell me when this sponsor posts a trial."

That gap is exactly what [clinical-trial-tracker](https://apify.com/m_ctim/clinical-trial-tracker)
fills. Give it a sponsor name, a condition, a phase, or any combination, and
it returns every trial matching that filter, most recent first: sponsor,
phase, condition, site countries, and the first-posted date. Point it at
"terminated" status instead of "new" and the same tool becomes a risk signal
instead of a buying signal, a competitor's trial getting pulled is worth
knowing about too.

It's billed per search, not per trial returned, so checking a shortlist of
15 sponsors every morning costs the same whether each one has 1 new trial or
none. No proxy, no scraping, no login, it reads the same public API
ClinicalTrials.gov's own site is built on.

See it alongside the rest of the [early-signal and risk-monitoring actors](/actors)
in the portfolio, including [Insider Trading Alert](https://apify.com/m_ctim/insider-trading-alert)
for executive buy/sell signals and [Product Recall Alert](https://apify.com/m_ctim/product-recall-alert)
for FDA drug/food/device recalls.`;

await createPost({ slug, title, body, published: true });
console.log('Published:', slug);
process.exit(0);
