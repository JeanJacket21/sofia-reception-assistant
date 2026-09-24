/* Préparation des arrivées : OCR local, vérification, suivi propre à ce navigateur. */
(function () {
    'use strict';
    const app = document.getElementById('arrivals-app');
    if (!app || !window.SofiaArrivalsParser) return;
    const parser = window.SofiaArrivalsParser;
    const $ = id => document.getElementById(id);
    const dateInput = $('arrivals-date');
    const previewPanel = $('arrivals-preview');
    const previewBody = $('arrivals-preview-body');
    const dashboardBody = $('arrivals-dashboard-body');
    const fileInput = $('arrivals-file');
    const dropzone = $('arrivals-dropzone');
    let records = [];
    let draft = [];
    let busy = false;
    let ocrScriptPromise;

    function localDate() {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
    function escapeHtml(value) {
        return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
    }
    function key() { return `sofia_arrivals_${dateInput.value}`; }
    function status(message, error = false) {
        const el = $('arrivals-status');
        el.textContent = message;
        el.classList.toggle('is-error', error);
    }
    function readDay() {
        try {
            const value = JSON.parse(localStorage.getItem(key()) || '[]');
            records = Array.isArray(value) ? value.filter(r => r && /^\d{6,15}$/.test(r.confirmation)) : [];
        } catch (_) { records = []; status('Impossible de lire les arrivées sauvegardées sur cet appareil.', true); }
        renderDashboard();
    }
    function persist() {
        try { localStorage.setItem(key(), JSON.stringify(records)); return true; }
        catch (_) { status('Sauvegarde impossible : espace indisponible dans ce navigateur.', true); return false; }
    }
    function duration(row) {
        const calculated = parser.nightsBetween(row.arrivalDate, row.departureDate);
        const n = calculated === null ? row.nights : calculated;
        return n === null || n === undefined ? '—' : n === 0 ? 'Day Use' : `${n} nuit${n > 1 ? 's' : ''}`;
    }
    function euro(balance) {
        return balance === null || balance === undefined || balance === '' || !Number.isFinite(Number(balance))
            ? 'À vérifier' : new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Number(balance));
    }
    function input(field, value, i, extra = '') {
        return `<input data-index="${i}" data-field="${field}" value="${escapeHtml(value)}" ${extra}>`;
    }
    function renderPreview() {
        previewPanel.hidden = false;
        previewBody.innerHTML = draft.map((row, i) => `<tr class="${row.issues?.length ? 'arrivals-review' : ''}">
            <td><input type="checkbox" data-index="${i}" data-field="include" aria-label="Garder la ligne ${i + 1}" ${row.include ? 'checked' : ''}></td>
            <td>${input('confirmation', row.confirmation, i, 'class="arrivals-confirmation" inputmode="numeric" aria-label="Confirmation"')}</td>
            <td>${input('room', row.room, i, 'class="arrivals-number" aria-label="Chambre"')}</td>
            <td>${input('guestName', row.guestName, i, 'class="arrivals-name" aria-label="Nom du client"')}${row.issues?.length ? `<small class="arrivals-warning">${escapeHtml(row.issues.join(' · '))}</small>` : ''}</td>
            <td>${input('arrivalDate', row.arrivalDate, i, 'type="date" class="arrivals-date-input" aria-label="Arrivée"')}</td>
            <td>${input('departureDate', row.departureDate, i, 'type="date" class="arrivals-date-input" aria-label="Départ"')}</td>
            <td>${input('roomType', row.roomType, i, 'class="arrivals-number" aria-label="Type de chambre"')}</td>
            <td>${input('operaBalance', row.operaBalance === null ? '' : row.operaBalance, i, 'class="arrivals-number" inputmode="decimal" placeholder="à vérifier" aria-label="Solde OPERA brut"')}</td>
            <td>${input('amountToPay', row.amountToPay, i, 'class="arrivals-number" inputmode="decimal" placeholder="à saisir" aria-label="Montant réellement à encaisser"')}</td>
            <td><textarea data-index="${i}" data-field="notes" aria-label="Notes et consignes">${escapeHtml(row.notes)}</textarea></td>
        </tr>`).join('') || '<tr><td class="arrivals-empty" colspan="10">Aucune ligne. Ajoutez une réservation manuellement.</td></tr>';
    }
    function renderDashboard() {
        const arrived = records.filter(r => r.arrivalDone).length;
        const toPost = records.filter(r => !r.paymentPosted && Number(r.amountToPay) > 0).length;
        $('arrivals-summary').textContent = records.length
            ? `${records.length} arrivée${records.length > 1 ? 's' : ''} · ${arrived} terminée${arrived > 1 ? 's' : ''} · ${toPost} paiement${toPost > 1 ? 's' : ''} indiqué${toPost > 1 ? 's' : ''} à poster`
            : 'Aucune arrivée enregistrée pour ce jour.';
        dashboardBody.innerHTML = records.map(row => `<tr>
            <td><input type="checkbox" data-confirmation="${row.confirmation}" data-field="arrivalDone" aria-label="Arrivée OK : ${escapeHtml(row.guestName)}" ${row.arrivalDone ? 'checked' : ''}></td>
            <td><input type="checkbox" data-confirmation="${row.confirmation}" data-field="paymentPosted" aria-label="Paiement posté : ${escapeHtml(row.guestName)}" ${row.paymentPosted ? 'checked' : ''}></td>
            <td>${escapeHtml(row.room || '—')}</td><td><strong>${escapeHtml(row.guestName || 'À vérifier')}</strong><br><small>Réf. ${row.confirmation}</small></td>
            <td>${escapeHtml(duration(row))}</td><td>${escapeHtml(row.roomType || '—')}</td>
            <td class="arrivals-balance">${euro(row.operaBalance)}</td>
            <td><input class="arrivals-number" data-confirmation="${row.confirmation}" data-field="amountToPay" value="${escapeHtml(row.amountToPay || '')}" inputmode="decimal" placeholder="À vérifier" aria-label="À encaisser pour ${escapeHtml(row.guestName)}"></td>
            <td><textarea data-confirmation="${row.confirmation}" data-field="notes" aria-label="Notes pour ${escapeHtml(row.guestName)}">${escapeHtml(row.notes || '')}</textarea></td>
        </tr>`).join('') || '<tr><td class="arrivals-empty" colspan="9">Importez une capture OPERA ou ajoutez une réservation.</td></tr>';
    }

    function loadOcr() {
        if (window.Tesseract) return Promise.resolve(window.Tesseract);
        if (!ocrScriptPromise) {
            ocrScriptPromise = new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/tesseract.min.js';
                script.onload = () => window.Tesseract ? resolve(window.Tesseract) : reject(new Error('OCR non initialisé'));
                script.onerror = () => reject(new Error('Chargement de l’OCR indisponible'));
                document.head.appendChild(script);
            }).catch(error => { ocrScriptPromise = null; throw error; });
        }
        return ocrScriptPromise;
    }
    async function decodeImage(file) {
        if ('createImageBitmap' in window) return createImageBitmap(file);
        const url = URL.createObjectURL(file);
        try {
            const image = new Image();
            image.src = url;
            await image.decode();
            return image;
        } finally { URL.revokeObjectURL(url); }
    }
    async function analyzeImage(file) {
        if (busy) return;
        if (!file || !['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 15 * 1024 * 1024) {
            status('Choisissez une image PNG, JPEG ou WebP de moins de 15 Mo.', true); return;
        }
        busy = true;
        $('arrivals-paste').disabled = true;
        let worker, image;
        try {
            status('Chargement de l’OCR local…');
            const Tesseract = await loadOcr();
            worker = await Tesseract.createWorker('eng', 1, {
                logger: message => {
                    if (message.status === 'recognizing text' && Number.isFinite(message.progress))
                        status(`Lecture de la capture… ${Math.round(message.progress * 100)} %`);
                }
            });
            await worker.setParameters({ tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK });
            image = await decodeImage(file);
            const width = image.width, height = image.height;
            const firstPass = await worker.recognize(file, {}, { tsv: true });
            const bounds = parser.tableBounds(firstPass.data.tsv, width, height);
            let result = parser.parseTsv(firstPass.data.tsv);
            if (bounds) {
                // Le texte du tableau OPERA est petit : agrandir la zone utile améliore chiffres et chambres.
                const canvas = document.createElement('canvas');
                const scale = Math.min(2, 4000 / Math.max(bounds.width, bounds.height));
                canvas.width = Math.round(bounds.width * scale);
                canvas.height = Math.round(bounds.height * scale);
                const context = canvas.getContext('2d');
                context.fillStyle = '#fff'; context.fillRect(0, 0, canvas.width, canvas.height);
                context.drawImage(image, bounds.left, bounds.top, bounds.width, bounds.height,
                    0, 0, canvas.width, canvas.height);
                status('Vérification des colonnes et des montants…');
                const secondPass = await worker.recognize(canvas, {}, { tsv: true });
                const refined = parser.parseTsv(secondPass.data.tsv);
                if (refined.rows.length >= result.rows.length) result = refined;
            }
            if (!result.rows.length) throw new Error(result.error || 'Aucune réservation lisible.');
            const day = result.rows.map(r => r.arrivalDate).filter(Boolean);
            if (day.length === result.rows.length && day.every(d => d === day[0]) && dateInput.value !== day[0]) {
                dateInput.value = day[0];
                readDay();
            }
            const saved = new Map(records.map(r => [r.confirmation, r]));
            draft = result.rows.map(r => {
                const existing = saved.get(r.confirmation);
                return { ...r, guestName: existing && r.issues.includes('Orthographe du nom à vérifier') ? existing.guestName : r.guestName,
                    room: r.room || existing?.room || '', notes: existing?.notes || '',
                    amountToPay: existing?.amountToPay || '', include: true };
            });
            renderPreview();
            const uncertain = draft.filter(r => r.issues.length).length;
            status(`${draft.length} réservation${draft.length > 1 ? 's' : ''} détectée${draft.length > 1 ? 's' : ''}. ${uncertain ? `${uncertain} ligne${uncertain > 1 ? 's' : ''} à vérifier. ` : ''}Contrôlez chaque ligne avant d’enregistrer.`);
            previewPanel.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        } catch (error) {
            status(`Analyse impossible : ${error.message || 'capture non reconnue'}. Vous pouvez ajouter les lignes manuellement.`, true);
        } finally {
            if (worker) await worker.terminate().catch(() => {});
            if (image?.close) image.close();
            busy = false;
            $('arrivals-paste').disabled = false;
            fileInput.value = '';
        }
    }

    function addDraft() {
        draft.push({ confirmation: '', room: '', guestName: '', roomType: '', arrivalDate: dateInput.value,
            departureDate: '', nights: null, operaBalance: null, amountToPay: '', notes: '',
            arrivalDone: false, paymentPosted: false, issues: [], include: true });
        renderPreview();
        previewPanel.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        previewBody.querySelector('tr:last-child input[data-field="confirmation"]')?.focus();
    }
    function parsePay(text) {
        const value = String(text).trim().replace(/\s/g, '').replace(',', '.');
        if (value === '') return '';
        if (!/^\d+(?:\.\d{1,2})?$/.test(value) || Number(value) > 1000000) return null;
        return Number(value).toFixed(2);
    }
    function savePreview() {
        const selected = draft.filter(r => r.include);
        if (!selected.length) { status('Sélectionnez au moins une réservation.', true); return; }
        const seen = new Set();
        const prepared = [];
        for (const row of selected) {
            const confirmation = String(row.confirmation).replace(/\s/g, '');
            const name = row.guestName.trim();
            if (!/^\d{6,15}$/.test(confirmation) || seen.has(confirmation)) {
                status('Chaque ligne doit avoir une confirmation OPERA unique (6 à 15 chiffres).', true); return;
            }
            seen.add(confirmation);
            if (!dateInput.value || !name || row.arrivalDate !== dateInput.value) {
                status('Renseignez le nom et une date d’arrivée identique au jour sélectionné.', true); return;
            }
            const nights = parser.nightsBetween(row.arrivalDate, row.departureDate);
            if (row.departureDate && nights === null) { status('Vérifiez la date de départ : elle doit suivre l’arrivée.', true); return; }
            const balance = row.operaBalance === null || String(row.operaBalance).trim() === ''
                ? null : typeof row.operaBalance === 'number' ? row.operaBalance
                    : parser.parseBalance(String(row.operaBalance));
            if (balance === null && row.operaBalance !== null && String(row.operaBalance).trim() !== '') {
                status('Vérifiez le solde OPERA : saisissez un montant signé, par exemple -544,55.', true); return;
            }
            const amount = parsePay(row.amountToPay);
            if (amount === null) { status('Le montant à encaisser doit être positif, avec au plus deux décimales.', true); return; }
            const existing = records.find(r => r.confirmation === confirmation);
            prepared.push({ confirmation, room: row.room.trim(), guestName: name, roomType: row.roomType.trim(),
                arrivalDate: row.arrivalDate, departureDate: row.departureDate, nights,
                operaBalance: balance, amountToPay: amount, notes: row.notes.trim(),
                arrivalDone: !!existing?.arrivalDone, paymentPosted: !!existing?.paymentPosted });
        }
        const byConfirmation = new Map(records.map(r => [r.confirmation, r]));
        prepared.forEach(r => byConfirmation.set(r.confirmation, r));
        records = [...byConfirmation.values()];
        if (!persist()) return;
        draft = [];
        previewPanel.hidden = true;
        renderDashboard();
        status(`${prepared.length} arrivée${prepared.length > 1 ? 's' : ''} enregistrée${prepared.length > 1 ? 's' : ''} pour le ${dateInput.value}.`);
    }

    dateInput.value = localDate();
    readDay();
    dateInput.addEventListener('change', () => { draft = []; previewPanel.hidden = true; readDay(); status(`Journée du ${dateInput.value} chargée.`); });
    fileInput.addEventListener('change', () => analyzeImage(fileInput.files[0]));
    dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('is-dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('is-dragover'));
    dropzone.addEventListener('drop', e => { e.preventDefault(); dropzone.classList.remove('is-dragover'); analyzeImage([...e.dataTransfer.files].find(f => f.type.startsWith('image/'))); });
    document.addEventListener('paste', e => {
        if (!app.getClientRects().length) return;
        const image = [...(e.clipboardData?.items || [])].find(item => item.type.startsWith('image/'));
        if (image) { e.preventDefault(); analyzeImage(image.getAsFile()); }
    });
    $('arrivals-paste').addEventListener('click', async () => {
        try {
            const items = await navigator.clipboard.read();
            const image = items.flatMap(item => item.types.filter(t => t.startsWith('image/')).map(t => ({ item, type: t })))[0];
            if (!image) throw new Error('Le presse-papiers ne contient pas d’image');
            analyzeImage(await image.item.getType(image.type));
        } catch (_) { status('Cliquez dans Sofia puis utilisez Ctrl + V (ou choisissez un fichier) pour coller une image.', true); }
    });
    $('arrivals-add-preview').addEventListener('click', addDraft);
    $('arrivals-add-manual').addEventListener('click', addDraft);
    $('arrivals-save').addEventListener('click', savePreview);
    previewBody.addEventListener('input', e => {
        const { index, field } = e.target.dataset;
        if (draft[Number(index)] && field && field !== 'include') draft[Number(index)][field] = e.target.value;
    });
    previewBody.addEventListener('change', e => {
        if (e.target.dataset.field === 'include') draft[Number(e.target.dataset.index)].include = e.target.checked;
    });
    dashboardBody.addEventListener('change', e => {
        const { confirmation, field } = e.target.dataset;
        const row = records.find(r => r.confirmation === confirmation);
        if (!row || !['arrivalDone', 'paymentPosted', 'amountToPay'].includes(field)) return;
        if (field === 'amountToPay') {
            const value = parsePay(e.target.value);
            if (value === null) { e.target.value = row.amountToPay || ''; status('Montant invalide : utilisez un nombre positif avec deux décimales au maximum.', true); return; }
            row.amountToPay = value;
            e.target.value = value;
        } else row[field] = e.target.checked;
        if (persist()) { $('arrivals-summary').textContent = `${records.length} arrivées · ${records.filter(r => r.arrivalDone).length} terminées · ${records.filter(r => !r.paymentPosted && Number(r.amountToPay) > 0).length} paiements indiqués à poster`; status('Suivi sauvegardé sur cet appareil.'); }
    });
    dashboardBody.addEventListener('input', e => {
        if (e.target.dataset.field !== 'notes') return;
        const row = records.find(r => r.confirmation === e.target.dataset.confirmation);
        if (row) { row.notes = e.target.value; persist(); }
    });
    $('arrivals-clear').addEventListener('click', () => {
        if (!records.length || !confirm(`Effacer les ${records.length} arrivées et leurs notes du ${dateInput.value} sur cet appareil ?`)) return;
        try { localStorage.removeItem(key()); records = []; renderDashboard(); status('Données de cette journée effacées.'); }
        catch (_) { status('Impossible d’effacer les données dans ce navigateur.', true); }
    });
})();
