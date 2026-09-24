const test = require('node:test');
const assert = require('node:assert/strict');
const parser = require('../js/arrivals-parser.js');

function tsv(items) {
    const columns = 'level page_num block_num par_num line_num word_num left top width height conf text';
    return [columns.replaceAll(' ', '\t'), ...items.map(([left, top, text, confidence = 95], i) =>
        [5, 1, 1, 1, 1, i + 1, left, top, text.length * 8, 14, confidence, text].join('\t'))].join('\n');
}

const listing = tsv([
    [770, 150, 'Arrivée'], // menu plus haut : ne doit pas être pris pour l'en-tête
    [390, 385, 'Solde'], [452, 385, 'Chambre'], [552, 385, 'Type'],
    [672, 385, 'Nuits'], [772, 385, 'Arrivée'], [892, 385, 'Nom'], [1012, 385, 'Départ'],
    [203, 434, '123456789012'], [363, 434, '-544.55'], [482, 434, '911'],
    [552, 434, 'CA2D'], [672, 434, '4'], [772, 434, '24/09/2026'],
    [892, 434, 'Martin,'], [955, 434, 'Alain'], [1012, 434, '28/09/2026'],
    [203, 471, '123456789013'], [382, 471, '0.00'], [482, 471, '106'],
    [552, 471, 'CA2D'], [672, 471, '0'], [772, 471, '24/09/2026'],
    [892, 471, 'Dupont,'], [958, 471, 'Léa'], [1012, 471, '24/09/2026']
]);

test('OCR rows keep the raw balance distinct from the amount to collect', () => {
    const { rows, error } = parser.parseTsv(listing);
    assert.equal(error, '');
    assert.equal(rows.length, 2);
    assert.deepEqual(rows.map(r => [r.confirmation, r.room, r.roomType, r.nights, r.operaBalance, r.amountToPay]), [
        ['123456789012', '911', 'CA2D', 4, -544.55, ''],
        ['123456789013', '106', 'CA2D', 0, 0, '']
    ]);
    assert.equal(rows[0].guestName, 'Martin, Alain');
    assert.equal(rows[1].departureDate, '2026-09-24');
    assert.equal(rows[1].arrivalDone, false);
    assert.equal(rows[1].paymentPosted, false);
});

test('crop starts at the header near the rows rather than an unrelated menu item', () => {
    const crop = parser.tableBounds(listing, 1920, 900);
    assert.ok(crop.top >= 370 && crop.top <= 385);
    assert.ok(crop.left >= 180 && crop.left <= 205);
});

test('invalid dates and incomplete table headers do not produce invented reservations', () => {
    assert.equal(parser.parseDate('31/02/2026'), '');
    assert.equal(parser.nightsBetween('2026-09-26', '2026-09-24'), null);
    assert.equal(parser.parseBalance('54455'), null);
    assert.deepEqual(parser.parseTsv(tsv([[203, 434, '123456789012']])).rows, []);
});
