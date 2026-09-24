/* Lecture des colonnes du listing OPERA à partir du TSV de Tesseract.
   Aucun montant à encaisser n'est déduit du solde OPERA. */
(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    if (root) root.SofiaArrivalsParser = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
    'use strict';

    const HEADERS = {
        balance: /^solde$/,
        room: /^chambre$/,
        roomType: /^type$/,
        nights: /^nuits?$/,
        arrival: /^arrivee$/,
        guestName: /^nom$/,
        departure: /^depart$/
    };

    function normalize(text) {
        return String(text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
    }

    function wordsFromTsv(tsv) {
        return String(tsv || '').split(/\r?\n/).slice(1).map(line => {
            const parts = line.split('\t');
            if (parts[0] !== '5' || parts.length < 12 || !parts.slice(11).join('\t').trim()) return null;
            const [left, top, width, height, confidence] = parts.slice(6, 11).map(Number);
            if (![left, top, width, height].every(Number.isFinite)) return null;
            return { left, top, width, height, confidence, text: parts.slice(11).join('\t').trim(),
                x: left + width / 2, y: top + height / 2 };
        }).filter(Boolean);
    }

    function parseDate(text) {
        const match = String(text || '').match(/\b(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})\b/);
        if (!match) return '';
        const day = +match[1], month = +match[2], year = +match[3];
        const date = new Date(Date.UTC(year, month - 1, day));
        if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return '';
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    function parseBalance(text) {
        const clean = String(text || '').replace(/[\u2212\u2013]/g, '-').replace(/\s/g, '').replace(',', '.');
        if (clean === '0') return 0;
        if (!/^[+-]?\d+(?:\.\d{2})$/.test(clean)) return null;
        const amount = Number(clean);
        return Number.isFinite(amount) ? amount : null;
    }

    function nightsBetween(arrival, departure) {
        if (!arrival || !departure) return null;
        const days = (Date.parse(departure + 'T00:00:00Z') - Date.parse(arrival + 'T00:00:00Z')) / 86400000;
        return Number.isInteger(days) && days >= 0 && days <= 365 ? days : null;
    }

    function layout(words) {
        const ids = words.filter(w => /^\d{10,15}$/.test(w.text.replace(/[^\d]/g, '')) && /^\d[\d.\s]*$/.test(w.text))
            .sort((a, b) => a.y - b.y);
        if (!ids.length) return null;
        const first = ids[0];
        const headerWords = words.filter(w => w.top < first.top - 8 && w.top > first.top - 130);
        const columns = { confirmation: first.left };
        const selectedHeaders = [];
        for (const [field, pattern] of Object.entries(HEADERS)) {
            const header = headerWords.filter(w => pattern.test(normalize(w.text)))
                .sort((a, b) => b.top - a.top)[0];
            if (header) { columns[field] = header.left; selectedHeaders.push(header); }
        }
        const required = ['balance', 'room', 'nights', 'arrival', 'guestName', 'departure'];
        if (required.filter(field => Number.isFinite(columns[field])).length < 5) return null;
        if (!Number.isFinite(columns.roomType)) columns.roomType = (columns.room + columns.nights) / 2;
        if (!Number.isFinite(columns.balance)) columns.balance = (first.left + columns.room) / 2;
        if (!Number.isFinite(columns.room)) columns.room = (columns.balance + columns.roomType) / 2;
        if (!Number.isFinite(columns.nights)) columns.nights = (columns.roomType + columns.arrival) / 2;
        if (!Number.isFinite(columns.arrival)) columns.arrival = (columns.nights + columns.guestName) / 2;
        if (!Number.isFinite(columns.guestName)) columns.guestName = (columns.arrival + columns.departure) / 2;
        if (!Number.isFinite(columns.departure) || !Object.values(columns).every(Number.isFinite)) return null;
        const positions = Object.entries(columns).sort((a, b) => a[1] - b[1]);
        if (positions.some(([, value], i) => i && value <= positions[i - 1][1])) return null;
        return { ids, columns, positions, headerTop: Math.min(...selectedHeaders.map(w => w.top)) };
    }

    function tableBounds(tsv, width, height) {
        const found = layout(wordsFromTsv(tsv));
        if (!found || found.ids.length < 1) return null;
        const { ids, columns, headerTop } = found;
        const left = Math.max(0, Math.floor(columns.confirmation - 14));
        const top = Math.max(0, Math.floor(headerTop - 13));
        const right = Math.min(width, Math.ceil(columns.departure + Math.max(90, width * 0.055)));
        const bottom = Math.min(height, Math.ceil(ids[ids.length - 1].top + 46));
        return right > left && bottom > top ? { left, top, width: right - left, height: bottom - top } : null;
    }

    function parseTsv(tsv) {
        const words = wordsFromTsv(tsv);
        const found = layout(words);
        if (!found) return { rows: [], error: 'Colonnes OPERA non reconnues. Affichez le tableau des arrivées avec confirmation, solde, chambre, type, dates et nom.' };
        const { ids, positions } = found;
        const x = found.columns;
        const boundaries = [
            x.balance - .85 * (x.room - x.balance),
            x.room - .2 * (x.room - x.balance),
            x.roomType - .35 * (x.roomType - x.room),
            x.nights - .25 * (x.nights - x.roomType),
            x.arrival - .25 * (x.arrival - x.nights),
            x.guestName - .2 * (x.guestName - x.arrival),
            x.departure - .03 * (x.departure - x.guestName)
        ];
        const fields = ['confirmation', 'balance', 'room', 'roomType', 'nights', 'arrival', 'guestName', 'departure'];
        const rows = [];
        const seen = new Set();
        for (let i = 0; i < ids.length; i++) {
            const anchor = ids[i];
            const confirmation = anchor.text.replace(/\D/g, '');
            if (seen.has(confirmation)) continue;
            seen.add(confirmation);
            const upper = i ? (ids[i - 1].y + anchor.y) / 2 : anchor.y - 26;
            const lower = i + 1 < ids.length ? (anchor.y + ids[i + 1].y) / 2 : anchor.y + 26;
            const cells = Object.fromEntries(positions.map(([field]) => [field, []]));
            words.filter(w => w.y > upper && w.y < lower && w !== anchor).forEach(w => {
                // Les mots longs (noms, dates) dépassent le milieu entre deux en-têtes.
                // Leur bord gauche suit la colonne bien mieux que leur centre.
                const index = boundaries.findIndex(boundary => w.left < boundary);
                const field = fields[index < 0 ? fields.length - 1 : index];
                cells[field].push(w);
            });
            const cell = field => cells[field].sort((a, b) => a.left - b.left);
            const value = field => cell(field).map(w => w.text).join(' ').trim();
            const room = cell('room').map(w => w.text.replace(/\D/g, '')).find(s => /^\d{2,5}$/.test(s)) || '';
            const roomType = cell('roomType').map(w => w.text.toUpperCase().replace(/[^A-Z0-9]/g, ''))
                .find(s => /^[A-Z]{1,5}[A-Z0-9]{1,5}$/.test(s)) || '';
            const arrivalDate = parseDate(value('arrival'));
            const departureDate = parseDate(value('departure'));
            const calculated = nightsBetween(arrivalDate, departureDate);
            const displayed = value('nights').match(/^\s*(\d{1,3})\s*$/);
            const nights = calculated !== null ? calculated : displayed ? Number(displayed[1]) : null;
            const balanceWord = cell('balance').find(w => parseBalance(w.text) !== null);
            const operaBalance = balanceWord ? parseBalance(balanceWord.text) : null;
            const nameWords = cell('guestName');
            const guestName = value('guestName').replace(/\s+,/g, ',').trim();
            const issues = [];
            if (!guestName || !arrivalDate || !departureDate) issues.push('Nom ou dates à vérifier');
            if (displayed && calculated !== null && Number(displayed[1]) !== calculated) issues.push('Durée affichée différente des dates');
            if (!room) issues.push('Chambre à vérifier');
            if (operaBalance === null || (balanceWord && balanceWord.confidence < 80)) issues.push('Solde OPERA à vérifier');
            if (nameWords.some(w => w.confidence < 65)) issues.push('Orthographe du nom à vérifier');
            rows.push({ confirmation, guestName, room, roomType, arrivalDate, departureDate,
                nights, operaBalance, amountToPay: '', notes: '', arrivalDone: false,
                paymentPosted: false, issues });
        }
        return { rows, error: rows.length ? '' : 'Aucune réservation détectée : affichez le tableau OPERA complet et réessayez.' };
    }

    return { wordsFromTsv, parseDate, parseBalance, nightsBetween, tableBounds, parseTsv };
});
