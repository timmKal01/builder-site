// A delivered lead as the customer reads it: on the dashboard and in the CSV download. The row is Website Gap
// Finder's output, stored as-is in signal_matches.payload.

/** Gap Finder's websiteStatus values, in words. */
export const WEBSITE_STATUS = {
    none: 'No website',
    social_only: 'Social page only',
    broken: 'Broken website',
    dead_builder: 'Shut-down site builder',
    free_subdomain: 'Free subdomain',
    blocked: "Couldn't check",
    ok: 'Website works',
};

/** The columns of the CSV download, in order: [header, how to read it from a row]. */
export const CSV_COLUMNS = [
    ['Business', (r) => r.name],
    ['Category', (r) => r.category],
    ['City', (r) => r.city],
    ['Address', (r) => r.address],
    ['Phone', (r) => r.phone],
    ['Email', (r) => r.publicEmail],
    ['WhatsApp', (r) => r.whatsapp],
    ['Website', (r) => r.websiteUrl],
    ['Website status', (r) => WEBSITE_STATUS[r.websiteStatus] ?? r.websiteStatus],
    ['Lead score', (r) => r.opportunityScore],
    ['Problems found', (r) => (Array.isArray(r.opportunityReasons) ? r.opportunityReasons.join('; ') : r.opportunityReasons)],
    ['Pitch line', (r) => r.pitchAngle],
    ['Rating', (r) => r.rating],
    ['Reviews', (r) => r.reviewCount],
    ['Google Maps', (r) => r.mapsUrl],
];

/**
 * One CSV cell. Quoted when it holds a comma, quote or line break. A cell that a spreadsheet would read as a
 * formula (=, +, -, @) gets a leading apostrophe: lead data comes from business listings and websites, and a
 * business name like "=HYPERLINK(...)" must stay text when the customer opens the file.
 */
export function csvCell(value) {
    if (value == null) return '';
    let s = String(value);
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Rows (Gap Finder payloads) to a CSV string with a header line, and a BOM so Excel reads UTF-8. */
export function leadsToCsv(rows) {
    const lines = [CSV_COLUMNS.map(([header]) => csvCell(header)).join(',')];
    for (const row of rows) lines.push(CSV_COLUMNS.map(([, read]) => csvCell(read(row ?? {}))).join(','));
    return `\uFEFF${lines.join('\r\n')}\r\n`;
}

/** A file name from a search name: lowercase words joined by hyphens. */
export function csvFileName(name) {
    const slug = String(name ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
    return `tidefeed-${slug || 'leads'}.csv`;
}
