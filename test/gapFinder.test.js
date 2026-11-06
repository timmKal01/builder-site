import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCities, citiesOf, describeSearch, searchInput, runInput, seenListName, BUSINESS_TYPES } from '../lib/signals/gapFinder.js';
import { getSource } from '../lib/signals/sources.js';

test('cities come one per line, trimmed, with repeats dropped and commas kept', () => {
    assert.deepEqual(parseCities(' Denver, USA \n\nAurora, USA\ndenver, usa\r\nBoulder,  USA'), ['Denver, USA', 'Aurora, USA', 'Boulder, USA']);
    assert.deepEqual(parseCities(''), []);
});

test('a search is saved as Gap Finder input: type or typed term, first city plus the rest', () => {
    const { input } = searchInput({ businessType: 'plumber', citiesText: 'Denver, USA\nAurora, USA', leadType: 'no_website' }, { maxCities: 5 });
    assert.deepEqual(input, { searchCategory: 'plumber', searchLocation: 'Denver, USA', searchLocations: ['Aurora, USA'], onlyNoWebsite: true, onlyOpportunities: false, minScore: 50, extractContacts: true });

    const typed = searchInput({ businessType: 'plumber', term: '  yoga   studio ', citiesText: 'Boulder, USA', leadType: 'any_gap', minScore: '60' }, { maxCities: 1 }).input;
    assert.equal(typed.searchTerm, 'yoga studio', 'a typed term wins over the list and is tidied');
    assert.equal(typed.searchCategory, undefined);
    assert.equal(typed.searchLocations, undefined);
    assert.equal(typed.onlyOpportunities, true);
    assert.equal(typed.minScore, 60);
});

test('a search that cannot run explains why instead of saving', () => {
    assert.match(searchInput({ citiesText: 'Denver' }, { maxCities: 1 }).error, /Pick a type of business/);
    assert.match(searchInput({ businessType: 'nope', citiesText: 'Denver' }, { maxCities: 1 }).error, /Pick a type of business/);
    assert.match(searchInput({ businessType: 'plumber', citiesText: '' }, { maxCities: 1 }).error, /at least one city/);
    assert.match(searchInput({ businessType: 'plumber', citiesText: 'A\nB' }, { maxCities: 1 }).error, /covers 1 city per search. Remove 1/);
    assert.match(searchInput({ term: 'x'.repeat(81), citiesText: 'A' }, { maxCities: 1 }).error, /under 80/);
});

test("each run asks for no more than it may deliver, on the signal's own list", () => {
    const saved = { searchCategory: 'plumber', searchLocation: 'Denver, USA', searchLocations: ['Aurora, USA', 'Boulder, USA'] };
    const run = runInput(saved, { signalId: 42, maxNew: 10 });
    assert.equal(run.maxBusinesses, 3, '10 leads over 3 cities rounds down, so the run can never return more than 10');
    assert.equal(run.onlyNew, true);
    assert.equal(run.seenListName, 'tidefeed-signal-42');
    assert.match(seenListName(7), /^[a-z0-9](?:[a-z0-9-]{1,61})[a-z0-9]$/, "Gap Finder's list-name rule");
    assert.equal(runInput(saved, { signalId: 1, maxNew: 2 }).maxBusinesses, 1);
    assert.equal(runInput(saved, { signalId: 1, maxNew: Infinity }).maxBusinesses, 100);
    assert.equal(saved.onlyNew, undefined, 'the saved search is not changed');
});

test('the Gap Finder source shapes its own run input', () => {
    const source = getSource('website-gap-finder');
    assert.equal(source.prepareInput, runInput);
    assert.deepEqual(citiesOf({ searchLocation: 'A', searchLocations: ['B'] }), ['A', 'B']);
    assert.equal(describeSearch({ searchCategory: 'dentist', searchLocation: 'Austin, USA' }), 'Dentists in Austin, USA');
    assert.equal(describeSearch({ searchTerm: 'yoga studio', searchLocation: 'Boulder' }), 'yoga studio in Boulder');
    assert.equal(BUSINESS_TYPES.length, 32);
});
