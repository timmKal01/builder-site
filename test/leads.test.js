import { test } from 'node:test';
import assert from 'node:assert/strict';
import { csvCell, leadsToCsv, csvFileName, CSV_COLUMNS, WEBSITE_STATUS } from '../lib/signals/leads.js';

test('CSV cells are quoted when they need it and formulas stay text', () => {
    assert.equal(csvCell(null), '');
    assert.equal(csvCell(42), '42');
    assert.equal(csvCell('Joe, the plumber'), '"Joe, the plumber"');
    assert.equal(csvCell('say "hi"'), '"say ""hi"""');
    assert.equal(csvCell('line\nbreak'), '"line\nbreak"');
    assert.equal(csvCell('=HYPERLINK("x")'), '"\'=HYPERLINK(""x"")"');
    assert.equal(csvCell('+254700000000'), "'+254700000000");
    assert.equal(csvCell('-5'), "'-5");
});

test('a lead row becomes one CSV line under the header, with statuses and reasons in words', () => {
    const csv = leadsToCsv([{ name: 'Corner Barbers', city: 'Austin', websiteStatus: 'none', opportunityScore: 80, opportunityReasons: ['No website', 'Established business'], mapsUrl: 'https://maps.google.com/?cid=1' }]);
    assert.ok(csv.startsWith('\uFEFFBusiness,Category,City'));
    const [, line] = csv.trim().split('\r\n');
    assert.equal(line.split(',').length >= CSV_COLUMNS.length, true);
    assert.match(line, /^Corner Barbers,,Austin,/);
    assert.match(line, /No website,80,No website; Established business,/);
    assert.equal(WEBSITE_STATUS.social_only, 'Social page only');
});

test('file names are safe slugs', () => {
    assert.equal(csvFileName('Denver plumbers, no website!'), 'tidefeed-denver-plumbers-no-website.csv');
    assert.equal(csvFileName(''), 'tidefeed-leads.csv');
});
