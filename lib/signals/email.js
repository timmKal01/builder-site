import { getSource } from './sources.js';

// The digest a customer actually receives. This is the product as far as they
// are concerned — the engine, the dedup and the cron all exist so that this
// email is worth opening.
//
// Rendering lives here, separate from sending, because the content is ours and
// the transport is Resend's. It also means the hard part is testable without a
// network or an API key.

const MAX_ROWS_IN_EMAIL = 25;

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Lead data comes from scraped pages, so a business name containing a quote or
// an angle bracket is ordinary rather than an attack. Either way it is never
// interpolated raw: a name like `"><script>` would otherwise break out of the
// markup in every inbox that renders HTML.
function cell(value) {
    if (value == null || value === '') return '—';
    if (typeof value === 'number') return escapeHtml(String(value));
    if (Array.isArray(value)) return escapeHtml(value.slice(0, 4).join(', '));
    if (typeof value === 'object') return escapeHtml(JSON.stringify(value).slice(0, 80));
    return escapeHtml(String(value).slice(0, 120));
}

function plainCell(value) {
    if (value == null || value === '') return '—';
    if (Array.isArray(value)) return value.slice(0, 4).join(', ');
    if (typeof value === 'object') return JSON.stringify(value).slice(0, 80);
    return String(value).slice(0, 120);
}

function label(field) {
    return field
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/[_-]+/g, ' ')
        .replace(/^./, (c) => c.toUpperCase());
}

export function subjectFor(signal, count) {
    if (count === 0) return `No new leads for ${signal.name}`;
    return `${count} new lead${count === 1 ? '' : 's'} for ${signal.name}`;
}

export function renderDigest({ signal, matches, dashboardUrl, held = 0 }) {
    const source = getSource(signal.source);
    const fields = source?.display ?? Object.keys(matches[0]?.payload ?? {}).slice(0, 6);
    const shown = matches.slice(0, MAX_ROWS_IN_EMAIL);
    const overflow = matches.length - shown.length;

    const subject = subjectFor(signal, matches.length);

    const head = fields.map((f) => `<th align="left" style="padding:8px 10px;border-bottom:1px solid #e5e7eb;font:600 12px system-ui;color:#6b7280;text-transform:uppercase;letter-spacing:.05em">${escapeHtml(label(f))}</th>`).join('');

    const body = shown
        .map((m) => {
            const cells = fields
                .map((f) => `<td style="padding:10px;border-bottom:1px solid #f1f3f5;font:400 14px system-ui;color:#111827">${cell(m.payload?.[f])}</td>`)
                .join('');
            return `<tr>${cells}</tr>`;
        })
        .join('');

    // A note about rows held back matters: without it, a capped plan looks
    // like a feed that quietly stops rather than one that is pacing itself.
    const heldNote = held > 0
        ? `<p style="font:400 13px system-ui;color:#6b7280;margin:16px 0 0">${held} more match${held === 1 ? '' : 'es'} held for your next run, newest and highest-scoring first.</p>`
        : '';

    const overflowNote = overflow > 0
        ? `<p style="font:400 13px system-ui;color:#6b7280;margin:16px 0 0">${overflow} more in the dashboard.</p>`
        : '';

    const html = `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f9fafb">
<div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:28px">
  <p style="font:600 12px system-ui;color:#047857;letter-spacing:.08em;text-transform:uppercase;margin:0 0 8px">Tidefeed</p>
  <h1 style="font:700 22px system-ui;color:#111827;margin:0 0 6px;letter-spacing:-.02em">${escapeHtml(subject)}</h1>
  <p style="font:400 14px system-ui;color:#6b7280;margin:0 0 20px">From your saved search &ldquo;${escapeHtml(signal.name)}&rdquo;.</p>
  ${matches.length === 0
      ? '<p style="font:400 15px system-ui;color:#374151;margin:0">Nothing new this time. Your search ran and found no matches you have not already seen.</p>'
      : `<table style="width:100%;border-collapse:collapse"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`}
  ${overflowNote}
  ${heldNote}
  ${dashboardUrl ? `<p style="margin:24px 0 0"><a href="${escapeHtml(dashboardUrl)}" style="display:inline-block;background:#047857;color:#fff;font:600 14px system-ui;padding:11px 20px;border-radius:12px;text-decoration:none">Open the dashboard</a></p>` : ''}
</div>
</body></html>`;

    const textRows = shown
        .map((m) => fields.map((f) => `${label(f)}: ${plainCell(m.payload?.[f])}`).join('\n'))
        .join('\n\n');

    const text = [
        subject,
        `From your saved search "${signal.name}".`,
        '',
        matches.length === 0 ? 'Nothing new this time.' : textRows,
        overflow > 0 ? `\n${overflow} more in the dashboard.` : '',
        held > 0 ? `${held} more held for your next run.` : '',
        dashboardUrl ? `\n${dashboardUrl}` : '',
    ]
        .filter(Boolean)
        .join('\n');

    return { subject, html, text };
}
