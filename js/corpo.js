// Logique métier du Module 7 : Corporate, Leads & New Business

// 1. Filtrage et recherche instantanée des comptes SC (5 891 comptes)
let currentCorpoFilter = 'all'; // 'all', 'managed', 'unmanaged'
let corpoRenderLimit = 60;

function filterCorpoAccounts() {
    const searchInput = document.getElementById('corpo-search-input');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const container = document.getElementById('corpo-accounts-results');
    const countBadge = document.getElementById('corpo-results-count');
    const loadMoreBtn = document.getElementById('corpo-load-more-btn');

    if (!window.CORPO_ACCOUNTS || !container) return;

    const filtered = window.CORPO_ACCOUNTS.filter(item => {
        // Filtre Type
        const isUnmanaged = (!item.s || item.s.toLowerCase() === 'unmanaged');
        if (currentCorpoFilter === 'managed' && isUnmanaged) return false;
        if (currentCorpoFilter === 'unmanaged' && !isUnmanaged) return false;

        // Filtre Recherche texte
        if (!query) return true;
        const nameMatch = (item.n && item.n.toLowerCase().includes(query));
        const codeMatch = (item.c && item.c.toLowerCase().includes(query));
        const salesMatch = (item.s && item.s.toLowerCase().includes(query));
        return nameMatch || codeMatch || salesMatch;
    });

    if (countBadge) {
        countBadge.innerText = `${filtered.length} compte${filtered.length > 1 ? 's' : ''} trouvé${filtered.length > 1 ? 's' : ''}`;
    }

    const toDisplay = filtered.slice(0, corpoRenderLimit);

    if (toDisplay.length === 0) {
        container.innerHTML = `
            <div class="p-8 text-center bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700">
                <div class="w-12 h-12 mx-auto rounded-full bg-indigo-50 dark:bg-indigo-900/40 text-indigo-500 flex items-center justify-center text-xl mb-3">
                    <i class="fas fa-search"></i>
                </div>
                <h4 class="font-bold text-gray-800 dark:text-gray-200 text-sm">Aucun compte trouvé</h4>
                <p class="text-xs text-gray-500 mt-1">Vérifiez l'orthographe du nom ou du code client (ex: SC... ou SCP...).</p>
            </div>
        `;
        if (loadMoreBtn) loadMoreBtn.classList.add('hidden');
        return;
    }

    let html = '';
    toDisplay.forEach(item => {
        const isUnmanaged = (!item.s || item.s.toLowerCase() === 'unmanaged');
        const badgeClass = isUnmanaged 
            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/80 dark:border-amber-800' 
            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800';
        const badgeLabel = isUnmanaged ? 'UNMANAGED (Non suivi)' : `MANAGED — Suivi par ${escapeHtml(item.s)}`;
        const tipText = isUnmanaged 
            ? 'Rattachez le code SC dans Opera. Si potentiel multisite, envoyez un Lead à <strong>leads@adagio-city.com</strong> !' 
            : `Compte déjà suivi : rattachez le code SC dans Opera et transmettez les besoins directement à <strong>${escapeHtml(item.s)}</strong> ou au HUB.`;
        const tipBg = isUnmanaged ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 border-amber-200/60' : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 border-emerald-200/60';

        html += `
            <div class="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-sm transition-all flex flex-col justify-between gap-3">
                <div class="flex items-start justify-between gap-3">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1 flex-wrap">
                            <span class="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${badgeClass}">
                                ${badgeLabel}
                            </span>
                        </div>
                        <h4 class="font-black text-gray-900 dark:text-white text-sm sm:text-base tracking-tight leading-snug truncate" title="${escapeHtml(item.n)}">
                            ${escapeHtml(item.n)}
                        </h4>
                    </div>
                    <button onclick="copyCorpoCode('${escapeHtml(item.c)}', this)" 
                        class="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-mono font-bold text-xs border border-indigo-200/80 dark:border-indigo-800 flex items-center gap-1.5 shrink-0 transition-transform active:scale-95 cursor-pointer"
                        title="Copier le code client">
                        <i class="fas fa-copy text-[11px]"></i>
                        <span>${escapeHtml(item.c)}</span>
                    </button>
                </div>
                <div class="text-[11px] p-2.5 rounded-xl border ${tipBg} leading-relaxed">
                    <i class="fas fa-info-circle mr-1 opacity-70"></i> ${tipText}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;

    if (loadMoreBtn) {
        if (filtered.length > toDisplay.length) {
            loadMoreBtn.classList.remove('hidden');
            loadMoreBtn.innerText = `Afficher plus (+60 sur ${filtered.length - toDisplay.length} restants)`;
        } else {
            loadMoreBtn.classList.add('hidden');
        }
    }
}

function loadMoreCorpoAccounts() {
    corpoRenderLimit += 60;
    filterCorpoAccounts();
}

function setCorpoFilter(type, btn) {
    currentCorpoFilter = type;
    corpoRenderLimit = 60;
    const buttons = document.querySelectorAll('.corpo-filter-tab');
    buttons.forEach(b => {
        b.className = 'corpo-filter-tab px-3.5 py-1.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 transition-all cursor-pointer';
    });
    if (btn) {
        btn.className = 'corpo-filter-tab px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 shadow-sm border border-indigo-600 transition-all cursor-pointer';
    }
    filterCorpoAccounts();
}

function copyCorpoCode(code, btn) {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(code).then(() => {
        const originalHtml = btn.innerHTML;
        btn.innerHTML = `<i class="fas fa-check text-emerald-500"></i> Copié !`;
        setTimeout(() => { btn.innerHTML = originalHtml; }, 1500);
    });
}

function copyTextValue(text, btn) {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text).then(() => {
        const originalHtml = btn.innerHTML;
        btn.innerHTML = `<i class="fas fa-check text-emerald-500"></i> Copié !`;
        setTimeout(() => { btn.innerHTML = originalHtml; }, 1500);
    });
}

// 2. Générateur de Fiche Lead (Formulaire & Mailto)
function generateLeadData() {
    const site = document.getElementById('lead-site')?.value.trim() || 'Adagio Courbevoie';
    const societe = document.getElementById('lead-societe')?.value.trim() || '';
    const codeSC = document.getElementById('lead-codesc')?.value.trim() || 'Non renseigné';
    const nomClient = document.getElementById('lead-nom-client')?.value.trim() || '';
    const fonction = document.getElementById('lead-fonction')?.value.trim() || 'Non renseignée';
    const email = document.getElementById('lead-email')?.value.trim() || '';
    const tel = document.getElementById('lead-tel')?.value.trim() || 'Non renseigné';
    const adresse = document.getElementById('lead-adresse')?.value.trim() || 'Non renseignée';
    const lieux = document.getElementById('lead-lieux')?.value.trim() || 'Non renseignés';
    const perimetre = document.getElementById('lead-perimetre')?.value || 'National';
    const commentaires = document.getElementById('lead-commentaires')?.value.trim() || 'Aucun';

    return { site, societe, codeSC, nomClient, fonction, email, tel, adresse, lieux, perimetre, commentaires };
}

function copyLeadTable() {
    const data = generateLeadData();
    if (!data.societe || !data.nomClient || !data.email) {
        alert("Veuillez renseigner au minimum : le Nom de la société, le Nom/Prénom du contact et son Email professionnel.");
        return;
    }

    const tableText = `FICHE DE TRANSMISSION DE LEAD COMMERCIAL - ADAGIO
------------------------------------------------------------
Nom du site émetteur   : ${data.site}
Nom de la société       : ${data.societe}
Code Client SC (si connu): ${data.codeSC}
Contact (Nom & Prénom)  : ${data.nomClient}
Fonction                : ${data.fonction}
Email professionnel     : ${data.email}
Téléphone               : ${data.tel}
Adresse postale         : ${data.adresse}
Lieux de déplacement    : ${data.lieux}
Périmètre               : ${data.perimetre}
Contexte & Commentaires : ${data.commentaires}
------------------------------------------------------------
Transmis depuis l'assistant de réception S.O.F.I.A 3.0`;

    if (navigator.clipboard) {
        navigator.clipboard.writeText(tableText).then(() => {
            const btn = document.getElementById('btn-copy-lead');
            if (btn) {
                const prev = btn.innerHTML;
                btn.innerHTML = `<i class="fas fa-check text-emerald-300 mr-2"></i> Tableau copié !`;
                setTimeout(() => { btn.innerHTML = prev; }, 2000);
            }
        });
    }
}

function openLeadOutlook() {
    const data = generateLeadData();
    if (!data.societe) {
        alert("Veuillez saisir le nom de la société pour préparer le Lead.");
        return;
    }

    const subject = encodeURIComponent(`Lead + ${data.site} + ${data.societe}`);
    const body = encodeURIComponent(`Bonjour l'équipe Biz Dev / Sales,

Voici une nouvelle opportunité de Lead commercial qualifiée par la réception :

• Nom du site émetteur   : ${data.site}
• Société                : ${data.societe}
• Code SC (si existant)  : ${data.codeSC}
• Contact client         : ${data.nomClient} (${data.fonction})
• Email pro              : ${data.email}
• Téléphone              : ${data.tel}
• Adresse du siège       : ${data.adresse}
• Villes / Déplacements  : ${data.lieux}
• Périmètre du besoin    : ${data.perimetre}
• Détails & Contexte     : ${data.commentaires}

Merci pour votre retour et bonne conversion !
L'équipe Réception - S.O.F.I.A`);

    window.location.href = `mailto:leads@adagio-city.com?subject=${subject}&body=${body}`;
}

// 3. Questions de qualification (Onglets)
function switchCorpoQuestionTab(tabKey) {
    const tabs = ['ouvertes', 'alternatives', 'fermees'];
    tabs.forEach(t => {
        const el = document.getElementById(`corpo-q-${t}`);
        const btn = document.getElementById(`corpo-btn-q-${t}`);
        if (el) el.classList.add('hidden');
        if (btn) {
            btn.className = 'corpo-q-tab px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 transition-all cursor-pointer';
        }
    });

    const activeEl = document.getElementById(`corpo-q-${tabKey}`);
    const activeBtn = document.getElementById(`corpo-btn-q-${tabKey}`);
    if (activeEl) activeEl.classList.remove('hidden');
    if (activeBtn) {
        activeBtn.className = 'corpo-q-tab px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 shadow-sm border border-emerald-600 transition-all cursor-pointer';
    }
}

// 4. Reset Checklist de chasse au Lead
function resetCorpoChecklist() {
    const container = document.getElementById('corpo-checklist-container');
    if (!container) return;
    container.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
}
