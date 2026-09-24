        /* Gestion du mode sombre : mode jour (light) garanti par défaut à l'arrivée */
        function toggleDarkMode() {
            const isDark = document.documentElement.classList.toggle('dark');
            if (isDark) {
                document.documentElement.classList.remove('light');
            } else {
                document.documentElement.classList.add('light');
            }
            try {
                localStorage.theme = isDark ? 'dark' : 'light';
            } catch (e) { }
        }
        try {
            if (localStorage.theme === 'dark') {
                document.documentElement.classList.add('dark');
                document.documentElement.classList.remove('light');
            } else {
                document.documentElement.classList.remove('dark');
                document.documentElement.classList.add('light');
                if (!localStorage.theme) localStorage.theme = 'light';
            }
        } catch (e) {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light');
        }

        /* ==========================================================================
           RACCOURCIS RÉCEPTION & SÉLECTEUR RAPIDE DE MATRICES
           ========================================================================== */
        function openTaxCalculator() {
            navFromSidebar('module-tools', 'tools-tax');
        }

        function toggleMatrixMenu(e) {
            if (e) {
                e.stopPropagation();
            }
            const menu = document.getElementById('matrixQuickMenu');
            if (!menu) return;
            menu.classList.toggle('hidden');
        }

        function closeMatrixMenu() {
            const menu = document.getElementById('matrixQuickMenu');
            if (menu) menu.classList.add('hidden');
        }

        function openMatrixSelectorModal() {
            const modal = document.getElementById('matrix-selector-modal');
            if (!modal) return;
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            closeMatrixMenu();
        }

        function closeMatrixSelectorModal() {
            const modal = document.getElementById('matrix-selector-modal');
            if (!modal) return;
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }

        // Fermeture automatique au clic en dehors et touche Échap
        document.addEventListener('click', function (e) {
            const dropdown = document.getElementById('matrixQuickDropdown');
            if (dropdown && !dropdown.contains(e.target)) {
                closeMatrixMenu();
            }
            const modal = document.getElementById('matrix-selector-modal');
            if (modal && e.target === modal) {
                closeMatrixSelectorModal();
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                closeMatrixMenu();
                closeMatrixSelectorModal();
            }
        });

        /* Configuration et aiguillage direct des modules & sous-modules */
        function getActiveShiftId() {
            const hour = new Date().getHours();
            if (hour >= 7 && hour < 14) return 'checklist-matin';
            if (hour >= 14 && hour < 21) return 'checklist-aprem';
            return 'checklist-nuit';
        }

        const defaultSubContents = {
            'module-checklist': null, // résolu dynamiquement via getActiveShiftId()
            'module-resa': 'resa-bloc',
            'module-sejour': 'sejour-prepa',
            'module-factu': 'factu-online',
            'module-ofis': 'ofis-cardex',
            'module-fidelite': 'fidelite-all',
            'module-backoffice': 'backoffice-cloture',
            'module-tools': 'tools-caisse',
            'module-tars': 'tars-map'
        };

        /* Navigation directe entre modules, sous-modules et accueil */
        function openModule(moduleId, subContentId, fromSidebar = false) {
            const homeView = document.getElementById('home-view');
            const moduleView = document.getElementById('module-view');

            // Résolution automatique du sous-module si non spécifié
            // Uniquement actif si on vient de la sidebar
            if (!subContentId) {
                if (fromSidebar && defaultSubContents[moduleId]) {
                    subContentId = defaultSubContents[moduleId];
                }
            }

            const activateTarget = () => {
                homeView.classList.add('hidden');
                moduleView.classList.remove('hidden');

                document.querySelectorAll('.module-content').forEach(m => m.classList.add('hidden'));
                const target = document.getElementById(moduleId);
                if (target) {
                    target.classList.remove('hidden');
                    const prefix = moduleId.replace('module-', '');
                    const grid = document.getElementById('grid-' + prefix);

                    if (subContentId) {
                        const sub = document.getElementById('content-' + subContentId);
                        if (sub) {
                            if (grid) grid.classList.add('hidden');
                            target.querySelectorAll('.sub-content').forEach(c => c.classList.add('hidden'));
                            sub.classList.remove('hidden');
                            if (typeof gsap !== 'undefined') {
                                gsap.fromTo(sub, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.2, ease: "expo.out" });
                            }
                        } else {
                            if (grid) grid.classList.remove('hidden');
                            target.querySelectorAll('.sub-content').forEach(c => c.classList.add('hidden'));
                        }
                    } else {
                        if (grid) grid.classList.remove('hidden');
                        target.querySelectorAll('.sub-content').forEach(c => c.classList.add('hidden'));
                    }

                    // Correction UX : remonter automatiquement en haut de la page lors d'un changement de module
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    // Si un conteneur principal scrollable existe, on le remonte aussi
                    const mainContainer = document.querySelector('main') || document.body;
                    mainContainer.scrollTop = 0;
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
            };

            // Si homeView est déjà masqué (navigation directe entre modules depuis la sidebar)
            if (homeView.classList.contains('hidden')) {
                activateTarget();
                if (typeof gsap !== 'undefined') {
                    gsap.fromTo(moduleView, { opacity: 0.8 }, { opacity: 1, duration: 0.18, ease: "expo.out" });
                }
                return;
            }

            if (typeof gsap !== 'undefined') {
                gsap.to(homeView, {
                    opacity: 0,
                    y: -10,
                    duration: 0.15,
                    ease: "power2.inOut",
                    onComplete: () => {
                        activateTarget();
                        gsap.fromTo(moduleView, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.2, ease: "expo.out" });
                    }
                });
            } else {
                activateTarget();
            }
        }

        /* --- GESTION DU VOLET LATÉRAL (SIDEBAR DRAWER) --- */
        function openSidebar() {
            const drawer = document.getElementById('sidebarDrawer');
            const overlay = document.getElementById('sidebarOverlay');
            if (drawer && overlay) {
                overlay.classList.remove('pointer-events-none', 'opacity-0');
                overlay.classList.add('opacity-100');
                drawer.classList.remove('-translate-x-full');
                document.body.classList.add('overflow-hidden');
            }
        }

        function closeSidebar() {
            const drawer = document.getElementById('sidebarDrawer');
            const overlay = document.getElementById('sidebarOverlay');
            if (drawer && overlay) {
                overlay.classList.remove('opacity-100');
                overlay.classList.add('opacity-0', 'pointer-events-none');
                drawer.classList.add('-translate-x-full');
                document.body.classList.remove('overflow-hidden');
            }
        }

        function toggleSidebar() {
            const drawer = document.getElementById('sidebarDrawer');
            if (drawer && drawer.classList.contains('-translate-x-full')) {
                openSidebar();
            } else {
                closeSidebar();
            }
        }

        function toggleAccordion(accId, event) {
            if (event) {
                event.stopPropagation();
            }
            const content = document.getElementById(accId);
            const chevron = document.getElementById('chev-' + accId);
            if (content) {
                const isHidden = content.classList.contains('hidden');
                document.querySelectorAll('.sidebar-acc-content').forEach(c => c.classList.add('hidden'));
                document.querySelectorAll('.sidebar-acc-chev').forEach(ch => ch.classList.remove('rotate-180'));
                if (isHidden) {
                    content.classList.remove('hidden');
                    if (chevron) chevron.classList.add('rotate-180');
                }
            }
        }

        function navFromSidebar(moduleId, contentId) {
            closeSidebar();
            openModule(moduleId, contentId, true);
        }

        function filterSidebar(query) {
            query = query.toLowerCase().trim();
            const items = document.querySelectorAll('.sidebar-module-item');
            items.forEach(item => {
                const text = item.innerText.toLowerCase();
                if (query === '' || text.includes(query)) {
                    item.classList.remove('hidden');
                    if (query.length > 1) {
                        const content = item.querySelector('.sidebar-acc-content');
                        const chevron = item.querySelector('.sidebar-acc-chev');
                        if (content) content.classList.remove('hidden');
                        if (chevron) chevron.classList.add('rotate-180');
                    }
                } else {
                    item.classList.add('hidden');
                }
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeSidebar();
        });

        function closeModules() {
            const homeView = document.getElementById('home-view');
            const moduleView = document.getElementById('module-view');

            if (typeof gsap !== 'undefined') {
                gsap.to(moduleView, {
                    opacity: 0,
                    y: 10,
                    duration: 0.2,
                    ease: "power2.inOut",
                    onComplete: () => {
                        moduleView.classList.add('hidden');
                        homeView.classList.remove('hidden');
                        document.getElementById('searchInput').value = '';
                        document.getElementById('clearSearchBtn').classList.add('hidden');
                        handleGlobalSearch('');

                        gsap.fromTo(homeView, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.25, ease: "expo.out" });
                        gsap.fromTo('.search-item', { opacity: 0, y: 12, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.3, stagger: 0.03, ease: "expo.out" });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                });
            } else {
                moduleView.classList.add('hidden');
                homeView.classList.remove('hidden');
                document.getElementById('searchInput').value = '';
                document.getElementById('clearSearchBtn').classList.add('hidden');
                handleGlobalSearch('');
                window.scrollTo(0, 0);
            }
        }

        function goHome() {
            closeModules();
        }

        function showSubContent(modulePrefix, contentId) {
            const grid = document.getElementById('grid-' + modulePrefix);
            if (grid) grid.classList.add('hidden');

            const moduleContainer = document.getElementById('module-' + modulePrefix);
            if (moduleContainer) {
                moduleContainer.querySelectorAll('.sub-content').forEach(c => c.classList.add('hidden'));
            }

            const target = document.getElementById('content-' + contentId);
            if (target) {
                target.classList.remove('hidden');
                if (typeof gsap !== 'undefined') {
                    gsap.fromTo(target, { opacity: 0, x: 15 }, { opacity: 1, x: 0, duration: 0.25, ease: "expo.out" });
                }
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Mise à jour de la navigation entre sous-modules
            currentModulePrefix = modulePrefix;
            currentSubContentId = contentId;
            updateSubNavArrows(modulePrefix, contentId);

            if (contentId === 'tools-caisse' && typeof initCaisseShift === 'function') {
                initCaisseShift();
            }
        }

        function hideSubContent(modulePrefix) {
            const moduleContainer = document.getElementById('module-' + modulePrefix);
            if (moduleContainer) {
                moduleContainer.querySelectorAll('.sub-content').forEach(c => c.classList.add('hidden'));
            }

            const grid = document.getElementById('grid-' + modulePrefix);
            if (grid) {
                grid.classList.remove('hidden');
                if (typeof gsap !== 'undefined') {
                    gsap.fromTo(grid, { opacity: 0, scale: 0.98 }, { opacity: 1, scale: 1, duration: 0.2, ease: "expo.out" });
                }
            }
        }

        function openAndNavigateTo(moduleId, contentId, event) {
            if (event) event.stopPropagation();
            openModule(moduleId, contentId);
        }

        function handleGlobalSearch(query) {
            query = query.toLowerCase().trim();
            const homeView = document.getElementById('home-view');
            const clearBtn = document.getElementById('clearSearchBtn');

            if (query.length > 0) clearBtn.classList.remove('hidden');
            else clearBtn.classList.add('hidden');

            if (homeView.classList.contains('hidden') && query.length > 0) {
                document.getElementById('module-view').classList.add('hidden');
                homeView.classList.remove('hidden');
            }

            const tiles = document.querySelectorAll('.search-item');
            if (query === '') {
                tiles.forEach(tile => {
                    tile.style.display = 'flex';
                    tile.classList.remove('ring-4', 'ring-adagio-red');
                });
                document.querySelectorAll('.tiles-row').forEach(row => {
                    row.style.display = '';
                });
                return;
            }

            tiles.forEach(tile => {
                const keywords = tile.getAttribute('data-keywords') || '';
                const titleEl = tile.querySelector('h2');
                const descEl = tile.querySelector('p');
                const title = titleEl ? titleEl.innerText.toLowerCase() : '';
                const desc = descEl ? descEl.innerText.toLowerCase() : '';

                if (keywords.includes(query) || title.includes(query) || desc.includes(query)) {
                    tile.style.display = 'flex';
                    tile.classList.add('ring-4', 'ring-adagio-red');
                } else {
                    tile.style.display = 'none';
                    tile.classList.remove('ring-4', 'ring-adagio-red');
                }
            });

            document.querySelectorAll('.tiles-row').forEach(row => {
                const visibleTiles = Array.from(row.querySelectorAll('.search-item')).filter(t => t.style.display !== 'none');
                if (visibleTiles.length === 0 && query !== '') {
                    row.style.display = 'none';
                } else {
                    row.style.display = '';
                }
            });
        }

        function clearSearch(returnHome) {
            if (returnHome === undefined) returnHome = true;
            const input = document.getElementById('searchInput');
            if (input) input.value = '';
            const clearBtn = document.getElementById('clearSearchBtn');
            if (clearBtn) clearBtn.classList.add('hidden');
            handleGlobalSearch('');
            if (returnHome) {
                const homeView = document.getElementById('home-view');
                if (homeView && homeView.classList.contains('hidden')) closeModules();
            }
        }

        function escapeHtml(value) {
            return String(value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        function exportToPDF(containerId, shiftName) {
            const originalContainer = document.getElementById(containerId);
            if (!originalContainer) return;

            const receptionistInput = originalContainer.querySelector('input[id^="receptionist-"]');
            const receptionistName = (receptionistInput && receptionistInput.value.trim())
                ? receptionistInput.value.trim()
                : "Non spécifié";

            const checkboxes = originalContainer.querySelectorAll('.checklist-row input[type="checkbox"]');
            const total = checkboxes.length;
            const checked = originalContainer.querySelectorAll('.checklist-row input[type="checkbox"]:checked').length;
            const percentage = total > 0 ? Math.round((checked / total) * 100) : 0;
            const completionColor = percentage === 100 ? '#16a34a' : (percentage >= 50 ? '#1e3a8a' : '#dc2626');

            const dateObj = new Date();
            const dateStr = dateObj.toLocaleDateString('fr-FR');
            const timeStr = dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            const dateFileSafe = dateStr.split('/').join('-');
            const shiftFileSafe = String(shiftName).split(' ').join('_');

            const printDiv = document.createElement('div');
            printDiv.style.padding = '40px';
            printDiv.style.fontFamily = '"Helvetica Neue", Helvetica, Arial, sans-serif';
            printDiv.style.color = '#1e293b';
            printDiv.style.backgroundColor = '#ffffff';

            let html = `
                <table style="width: 100%; border-collapse: collapse; border-bottom: 3px solid #1e3a8a; padding-bottom: 15px; margin-bottom: 20px;">
                    <tr>
                        <td style="vertical-align: bottom; padding-bottom: 12px;">
                            <h1 style="font-size: 38px; font-weight: 900; color: #1e3a8a; margin: 0; text-transform: uppercase; letter-spacing: -1px;">CHECKLIST</h1>
                            <h2 style="font-size: 18px; font-weight: 600; color: #64748b; margin: 5px 0 0 0;">Shift : ${escapeHtml(shiftName.toUpperCase())}</h2>
                        </td>
                        <td style="vertical-align: bottom; text-align: right; line-height: 1.4; padding-bottom: 12px;">
                            <div style="font-size: 18px; font-weight: 900; color: #e3004f;">S.O.F.I.A 3.0</div>
                            <div style="font-size: 13px; color: #475569; margin-top: 5px;">Généré le ${dateStr} à ${timeStr}</div>
                            <div style="font-size: 13px; color: #475569;">Réceptionniste : <strong style="color: #0f172a;">${escapeHtml(receptionistName)}</strong></div>
                        </td>
                    </tr>
                </table>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 18px;">
                    <tr>
                        <td style="background-color: #f1f5f9; border: 1px solid #cbd5e1; padding: 12px 16px; font-size: 13px; color: #334155;">
                            Taux de complétion
                            <div style="margin-top: 8px; height: 8px; background: #e2e8f0; border-radius: 999px; overflow: hidden;">
                                <div style="width: ${percentage}%; height: 8px; background: ${completionColor};"></div>
                            </div>
                        </td>
                        <td style="background-color: #f1f5f9; border: 1px solid #cbd5e1; padding: 12px 16px; text-align: right; width: 160px; vertical-align: middle;">
                            <div style="font-size: 26px; font-weight: 900; color: ${completionColor}; line-height: 1;">${percentage}%</div>
                            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">${checked}/${total} tâches</div>
                        </td>
                    </tr>
                </table>
                <div style="font-size: 13px; font-style: italic; color: #64748b; margin-bottom: 15px;">
                    Cochez la bonne colonne pour vérifier que la tâche est accomplie. Signez numériquement avec votre nom ci-dessus.
                </div>
                <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                    <thead>
                        <tr>
                            <th style="background-color: #1e3a8a; color: #ffffff; padding: 12px 15px; text-align: left; font-size: 14px; width: 70%; border: 1px solid #1e3a8a;">TÂCHES À EFFECTUER</th>
                            <th style="background-color: #1e3a8a; color: #ffffff; padding: 12px 5px; text-align: center; font-size: 14px; width: 15%; border: 1px solid #1e3a8a;">FAIT</th>
                            <th style="background-color: #1e3a8a; color: #ffffff; padding: 12px 5px; text-align: center; font-size: 14px; width: 15%; border: 1px solid #1e3a8a;">PAS FAIT</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            const rows = originalContainer.querySelectorAll('.checklist-row');
            rows.forEach((row, index) => {
                const checkbox = row.querySelector('input[type="checkbox"]');
                let textElement = row.querySelector('.ml-3');

                let taskClone = textElement.cloneNode(true);
                taskClone.querySelectorAll('button').forEach(b => b.remove());
                let taskText = taskClone.innerText.trim();

                const isChecked = checkbox && checkbox.checked;
                const bgColor = index % 2 === 0 ? '#f8fafc' : '#ffffff';

                html += `
                    <tr style="background-color: ${bgColor};">
                        <td style="padding: 12px 15px; font-size: 13px; border: 1px solid #cbd5e1; color: #334155;">${taskText}</td>
                        <td style="padding: 12px 5px; text-align: center; border: 1px solid #cbd5e1; font-weight: bold; font-size: 16px; color: #16a34a;">${isChecked ? '✔️' : ''}</td>
                        <td style="padding: 12px 5px; text-align: center; border: 1px solid #cbd5e1; font-weight: bold; font-size: 16px; color: #dc2626;">${!isChecked ? '❌' : ''}</td>
                    </tr>
                `;
            });

            html += `
                    </tbody>
                </table>
                <div style="margin-top: 40px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px;">
                    Document interne d'opérations hôtelières. S.O.F.I.A 3.0 PMS Guide.
                </div>
            `;

            printDiv.innerHTML = html;

            const opt = {
                margin: [10, 10, 10, 10],
                filename: 'Checklist_' + shiftFileSafe + '_' + dateFileSafe + '.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, logging: false },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            if (typeof html2pdf !== 'undefined') {
                html2pdf().set(opt).from(printDiv).save();
            }
        }

        function updateProgress(containerId) {
            const container = document.getElementById(containerId);
            if (!container) return;
            const total = container.querySelectorAll('input[type="checkbox"]').length;
            const checked = container.querySelectorAll('input[type="checkbox"]:checked').length;
            let percentage = total > 0 ? Math.round((checked / total) * 100) : 0;

            const progressText = container.querySelector('.progress-text');
            const progressBar = container.querySelector('.progress-bar-fill');

            if (progressText) {
                progressText.innerText = `${percentage}% complété (${checked}/${total})`;
                if (percentage === 100 && container.dataset.completed !== "true") {
                    container.dataset.completed = "true";
                    progressText.className = 'progress-text text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-full text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/40 transition-colors shadow-sm ring-2 ring-green-400';
                    if (typeof confetti === 'function') {
                        var duration = 2500;
                        var end = Date.now() + duration;
                        (function frame() {
                            confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#a855f7', '#3b82f6', '#ec4899'] });
                            confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#a855f7', '#3b82f6', '#ec4899'] });
                            if (Date.now() < end) requestAnimationFrame(frame);
                        }());
                    }
                    if (typeof playUISound === 'function') playUISound('chime');
                } else if (percentage < 100) {
                    container.dataset.completed = "false";
                    progressText.className = 'progress-text text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-full text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-slate-700 transition-colors';
                }
            }
            if (progressBar) progressBar.style.width = `${percentage}%`;
        }

        function resetCheckboxes(containerId) {
            const container = document.getElementById(containerId);
            if (!container) return;
            container.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
            updateProgress(containerId);
        }
        /* ==========================================================================
           MODULE DE SYNCHRONISATION MULTI-POSTES EN TEMPS RÉEL (SALON PARTAGÉ)
           ========================================================================== */

        const currentTabId = 'desk_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
        const syncChannel = (typeof BroadcastChannel !== 'undefined') ? new BroadcastChannel('sofia_multidesk_channel') : null;
        let roomEventSource = null;
        let currentRoomTopic = localStorage.getItem('sofia_room_topic') || 'adagio-courbevoie-desk';
        const processedSyncMessages = new Set();

        function markAndCheckProcessed(msgId) {
            if (!msgId) return false;
            if (processedSyncMessages.has(msgId)) return true;
            processedSyncMessages.add(msgId);
            if (processedSyncMessages.size > 400) {
                const firstKey = processedSyncMessages.values().next().value;
                processedSyncMessages.delete(firstKey);
            }
            return false;
        }

        // Synthétiseur audio Web Audio API (signal sonore sans fichier externe)
        window.audioEnabled = true; // Global flag

        function playUISound(type = 'info') {
            if (!window.audioEnabled) return;
            try {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (!AudioCtx) return;
                const ctx = new AudioCtx();
                const now = ctx.currentTime;

                if (type === 'hover') {
                    // Very soft high pitch tick
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(1200, now);
                    gain.gain.setValueAtTime(0.015, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                    osc.start(now);
                    osc.stop(now + 0.05);
                } else if (type === 'click') {
                    // Soft low pop
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(300, now);
                    osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
                    gain.gain.setValueAtTime(0.08, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                    osc.start(now);
                    osc.stop(now + 0.1);
                } else if (type === 'chime') {
                    // Magical major arpeggio
                    const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
                    freqs.forEach((freq, i) => {
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        osc.connect(gain);
                        gain.connect(ctx.destination);
                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(freq, now + i * 0.08);
                        gain.gain.setValueAtTime(0, now + i * 0.08);
                        gain.gain.linearRampToValueAtTime(0.1, now + i * 0.08 + 0.02);
                        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.6);
                        osc.start(now + i * 0.08);
                        osc.stop(now + i * 0.08 + 0.6);
                    });
                } else if (type === 'alerte') {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(880, now);
                    osc.frequency.setValueAtTime(740, now + 0.12);
                    gain.gain.setValueAtTime(0.2, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
                    osc.start(now);
                    osc.stop(now + 0.35);
                } else {
                    // Default info
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(587.33, now); // D5
                    osc.frequency.setValueAtTime(880, now + 0.1); // A5
                    gain.gain.setValueAtTime(0.1, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                    osc.start(now);
                    osc.stop(now + 0.3);
                }
            } catch (e) { }
        }

        // Expose globally for legacy sync calls
        window.playSyncSound = playUISound;

        // Affichage Toast Notification flottant
        function showToastNotification(title, message, type = 'info') {
            const container = document.getElementById('toast-container');
            if (!container) return;

            playSyncSound(type);

            let borderClasses = 'border-blue-500 bg-white dark:bg-slate-800 text-blue-900 dark:text-blue-200';
            let icon = 'fa-info-circle text-blue-500';
            if (type === 'alerte') {
                borderClasses = 'border-red-500 bg-red-50/95 dark:bg-slate-800 text-red-900 dark:text-red-200';
                icon = 'fa-exclamation-triangle text-red-500';
            } else if (type === 'colis') {
                borderClasses = 'border-purple-500 bg-purple-50/95 dark:bg-slate-800 text-purple-900 dark:text-purple-200';
                icon = 'fa-box-open text-purple-500';
            } else if (type === 'resolved' || type === 'delivered') {
                borderClasses = 'border-emerald-500 bg-emerald-50/95 dark:bg-slate-800 text-emerald-900 dark:text-emerald-200';
                icon = 'fa-check-circle text-emerald-500';
            }

            const toast = document.createElement('div');
            toast.className = `pointer-events-auto p-4 rounded-2xl shadow-xl border-l-4 ${borderClasses} flex items-start gap-3 toast-slide-in transition-all duration-300 border border-gray-200 dark:border-slate-700`;
            toast.innerHTML = `
                <div class="text-xl mt-0.5"><i class="fas ${icon}"></i></div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                        <h4 class="font-bold text-xs uppercase tracking-wider">${title}</h4>
                        <span class="text-[10px] opacity-60">À l'instant</span>
                    </div>
                    <p class="text-xs mt-1 text-gray-700 dark:text-gray-200 leading-snug break-words">${message}</p>
                </div>
                <button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs p-1 ml-1" onclick="this.closest('.toast-slide-in').remove()">
                    <i class="fas fa-times"></i>
                </button>
            `;

            container.appendChild(toast);

            setTimeout(() => {
                toast.classList.add('opacity-0', 'scale-95');
                setTimeout(() => toast.remove(), 400);
            }, 6000);
        }

        // Test d'alerte manuelle pour vérifier le bon fonctionnement
        function testSyncAlert() {
            showToastNotification(
                "Alerte Test Réception",
                "Chambre 304 : Ceci est un test de notification sonore et visuelle multi-postes.",
                "alerte"
            );
        }

        // Gestion du Modal de Synchronisation
        const syncModal = document.getElementById('sync-modal');
        function openSyncModal() {
            if (!syncModal) return;
            syncModal.classList.add('active');
            const roomInput = document.getElementById('syncRoomInput');
            if (roomInput) {
                roomInput.value = currentRoomTopic;
            }
            const display = document.getElementById('currentRoomDisplay');
            if (display) {
                display.innerText = currentRoomTopic;
            }
        }
        function closeSyncModal() {
            if (syncModal) syncModal.classList.remove('active');
        }

        function updateSyncBadgeUI(status, roomName) {
            const dot = document.getElementById('syncStatusDot');
            const text = document.getElementById('syncStatusText');
            const modalBadge = document.getElementById('syncModalBadge');
            const modalDetails = document.getElementById('syncModalDetails');
            const currentRoomDisplay = document.getElementById('currentRoomDisplay');

            if (currentRoomDisplay) currentRoomDisplay.innerText = roomName;

            if (status === 'connected') {
                if (dot) dot.className = "w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse";
                if (text) text.innerText = `Salon : ${roomName}`;
                if (modalBadge) {
                    modalBadge.className = "px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 flex items-center gap-1.5";
                    modalBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> En direct`;
                }
                if (modalDetails) {
                    modalDetails.innerHTML = `Salon actif : <strong class="text-indigo-600 dark:text-indigo-400">${roomName}</strong> (Poste 1, Poste 2 & Mobiles reliés)`;
                }
            } else if (status === 'reconnecting') {
                if (dot) dot.className = "w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse";
                if (text) text.innerText = `Reconnexion (${roomName})...`;
                if (modalBadge) {
                    modalBadge.className = "px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 flex items-center gap-1.5";
                    modalBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> Reconnexion...`;
                }
                if (modalDetails) {
                    modalDetails.innerHTML = `Recherche du salon <strong class="text-amber-600 dark:text-amber-400">${roomName}</strong>... Vos modifications locales sont conservées.`;
                }
            } else {
                if (dot) dot.className = "w-2.5 h-2.5 rounded-full bg-emerald-500";
                if (text) text.innerText = `Synchro Locale`;
                if (modalBadge) {
                    modalBadge.className = "px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 flex items-center gap-1.5";
                    modalBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-500"></span> Mode Local Actif`;
                }
                if (modalDetails) {
                    modalDetails.innerHTML = `Liaison locale active sur cette machine.`;
                }
            }
        }

        // Initialisation de Firebase
        const firebaseConfig = {
          apiKey: "AIzaSyC-ocSLeeUcKoyu3B8-x5Ucz0b6vtiejwU",
          authDomain: "sofia-v3.firebaseapp.com",
          databaseURL: "https://sofia-v3-default-rtdb.europe-west1.firebasedatabase.app",
          projectId: "sofia-v3",
          storageBucket: "sofia-v3.firebasestorage.app",
          messagingSenderId: "708323446251",
          appId: "1:708323446251:web:c4e516dbeead0755171dae"
        };
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        const db = firebase.database();

        // Diffusion locale et réseau unifiée
        function broadcastSync(action, payload = null) {
            const msg = {
                msgId: currentTabId + '_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
                action,
                payload,
                senderId: currentTabId,
                timestamp: Date.now()
            };

            // Enregistrer localement pour ne pas re-traiter notre propre message
            markAndCheckProcessed(msg.msgId);

            // 1. Diffusion locale immédiate (même PC, multi-onglets)
            if (syncChannel) {
                try { syncChannel.postMessage(msg); } catch (e) { }
            }

            // 2. Diffusion réseau multi-postes (Firebase RTDB)
            if (currentRoomTopic) {
                try {
                    db.ref('sync_messages/' + currentRoomTopic).push(msg).catch(err => console.warn('Erreur Firebase:', err));
                } catch (e) { }
            }
        }

        // Traitement centralisé des messages de synchronisation reçus
        function handleIncomingSync(data) {
            if (!data || data.senderId === currentTabId) return;
            if (data.msgId && markAndCheckProcessed(data.msgId)) return;

            if (data.action === 'ADD_CONSIGNE') {
                const item = data.payload;
                if (item && !consignes.some(c => c.id === item.id)) {
                    consignes.push(item);
                    localStorage.setItem('sofia_consignes', JSON.stringify(consignes));
                    renderConsignes();
                    showToastNotification(
                        item.type === 'alerte' ? '⚠️ Nouvelle Alerte Consigne' : 'ℹ️ Nouvelle Consigne',
                        `${item.shift} : ${item.text}`,
                        item.type
                    );
                }
            } else if (data.action === 'RESOLVE_CONSIGNE') {
                const idx = consignes.findIndex(c => c.id === data.payload.id);
                if (idx !== -1 && consignes[idx].status !== 'resolved') {
                    consignes[idx].status = 'resolved';
                    localStorage.setItem('sofia_consignes', JSON.stringify(consignes));
                    renderConsignes();
                    showToastNotification('✅ Consigne Résolue', 'Une consigne a été validée par un autre poste.', 'resolved');
                }
            } else if (data.action === 'DELETE_CONSIGNE') {
                consignes = consignes.filter(c => c.id !== data.payload.id);
                localStorage.setItem('sofia_consignes', JSON.stringify(consignes));
                renderConsignes();
            } else if (data.action === 'CLEAR_CONSIGNES') {
                consignes = [];
                localStorage.setItem('sofia_consignes', JSON.stringify(consignes));
                renderConsignes();
            } else if (data.action === 'ADD_COLIS') {
                const item = data.payload;
                if (item && !colisDb.some(c => c.id === item.id)) {
                    colisDb.push(item);
                    localStorage.setItem('sofia_colis', JSON.stringify(colisDb));
                    renderColis();
                    showToastNotification('📦 Nouveau Colis Enregistré', `Ch. ${item.room} - ${item.name} (${item.carrier})`, 'colis');
                }
            } else if (data.action === 'DELIVER_COLIS') {
                const idx = colisDb.findIndex(c => c.id === data.payload.id);
                if (idx !== -1 && colisDb[idx].status !== 'delivered') {
                    colisDb[idx].status = 'delivered';
                    colisDb[idx].deliveredDate = data.payload.deliveredDate || new Date().toLocaleString('fr-FR');
                    localStorage.setItem('sofia_colis', JSON.stringify(colisDb));
                    renderColis();
                    showToastNotification('🤝 Colis Remis au Client', `Chambre ${colisDb[idx].room} (${colisDb[idx].name})`, 'delivered');
                }
            } else if (data.action === 'DELETE_COLIS') {
                colisDb = colisDb.filter(c => c.id !== data.payload.id);
                localStorage.setItem('sofia_colis', JSON.stringify(colisDb));
                renderColis();
            } else if (data.action === 'CLEAR_COLIS') {
                colisDb = [];
                localStorage.setItem('sofia_colis', JSON.stringify(colisDb));
                renderColis();
            } else if (data.action === 'SYNC_REQUEST') {
                // Un autre poste demande l'état complet
                if (consignes.length > 0 || colisDb.length > 0) {
                    const snapshotMsg = {
                        action: 'SYNC_SNAPSHOT',
                        targetSenderId: data.senderId,
                        payload: {
                            consignes: consignes,
                            colisDb: colisDb
                        },
                        senderId: currentTabId,
                        timestamp: Date.now()
                    };
                    if (currentRoomTopic) {
                        try {
                            db.ref('sync_messages/' + currentRoomTopic).push(snapshotMsg).catch(err => console.warn('Erreur Firebase Snapshot:', err));
                        } catch (e) { }
                    }
                }
            } else if (data.action === 'SYNC_SNAPSHOT') {
                // Réception d'un état complet après demande
                if (data.targetSenderId === currentTabId && data.payload) {
                    let hasUpdated = false;
                    if (Array.isArray(data.payload.consignes) && data.payload.consignes.length > 0) {
                        data.payload.consignes.forEach(c => {
                            const exists = consignes.find(x => x.id === c.id);
                            if (!exists) {
                                consignes.push(c);
                                hasUpdated = true;
                            } else if (c.status === 'resolved' && exists.status !== 'resolved') {
                                exists.status = 'resolved';
                                hasUpdated = true;
                            }
                        });
                        if (hasUpdated) {
                            localStorage.setItem('sofia_consignes', JSON.stringify(consignes));
                            renderConsignes();
                        }
                    }
                    if (Array.isArray(data.payload.colisDb) && data.payload.colisDb.length > 0) {
                        let colisHasUpdated = false;
                        data.payload.colisDb.forEach(item => {
                            const exists = colisDb.find(x => x.id === item.id);
                            if (!exists) {
                                colisDb.push(item);
                                colisHasUpdated = true;
                            } else if (item.status === 'delivered' && exists.status !== 'delivered') {
                                exists.status = 'delivered';
                                exists.deliveredDate = item.deliveredDate;
                                colisHasUpdated = true;
                            }
                        });
                        if (colisHasUpdated) {
                            localStorage.setItem('sofia_colis', JSON.stringify(colisDb));
                            renderColis();
                        }
                    }
                    if (hasUpdated) {
                        showToastNotification("🔄 Synchronisation Réussie", "Données partagées récupérées depuis le poste actif.", "info");
                    }
                }
            }
        }

        // Initialisation de la connexion au salon partagé (Firebase)
        let firebaseListener = null;
        function initRoomSync() {
            currentRoomTopic = localStorage.getItem('sofia_room_topic') || 'adagio-courbevoie-desk';
            updateSyncBadgeUI('connected', currentRoomTopic);

            try {
                const messagesRef = db.ref('sync_messages/' + currentRoomTopic);
                
                if (firebaseListener) {
                    messagesRef.off('child_added', firebaseListener);
                }

                // On écoute les nouveaux messages ajoutés
                const now = Date.now();
                firebaseListener = messagesRef.orderByChild('timestamp').startAt(now).on('child_added', (snapshot) => {
                    const data = snapshot.val();
                    if (data) {
                        handleIncomingSync(data);
                    }
                });

                // Nettoyage optionnel des messages vieux de plus de 24h
                const yesterday = Date.now() - 86400000;
                messagesRef.orderByChild('timestamp').endAt(yesterday).once('value', (snap) => {
                    snap.forEach(child => child.ref.remove());
                });

                // Dès que connecté, demander aux autres postes de nous transmettre l'état
                setTimeout(() => {
                    broadcastSync('SYNC_REQUEST');
                }, 600);

                // Gérer l'état de connexion de Firebase
                db.ref('.info/connected').on('value', function(snap) {
                    if (snap.val() === true) {
                        updateSyncBadgeUI('connected', currentRoomTopic);
                    } else {
                        updateSyncBadgeUI('reconnecting', currentRoomTopic);
                    }
                });

            } catch (e) {
                console.warn('Firebase non accessible, mode local maintenu:', e);
                updateSyncBadgeUI('local', currentRoomTopic);
            }
        }

        // Configuration & Sauvegarde du Salon
        function saveRoomConfig() {
            const input = document.getElementById('syncRoomInput');
            if (!input) return;
            let val = input.value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
            if (!val) {
                val = 'adagio-courbevoie-desk';
                input.value = val;
            }
            localStorage.setItem('sofia_room_topic', val);
            currentRoomTopic = val;
            initRoomSync();
            showToastNotification("Salon Connecté", `Connecté au salon "${val}". Vos collègues sur ce salon reçoivent vos consignes !`, "resolved");
            closeSyncModal();
        }

        function forceSyncRefresh() {
            broadcastSync('SYNC_REQUEST');
            showToastNotification("Synchronisation Lancée", "Demande de mise à jour transmise aux autres postes...", "info");
        }

        // Écouteur BroadcastChannel pour onglets du même poste
        if (syncChannel) {
            syncChannel.onmessage = (event) => {
                handleIncomingSync(event.data);
            };
        }

        // Synchronisation croisée storage (secondaire)
        window.addEventListener('storage', (e) => {
            if (e.key === 'sofia_consignes') {
                try {
                    consignes = JSON.parse(e.newValue) || [];
                    renderConsignes();
                } catch (err) { }
            } else if (e.key === 'sofia_colis') {
                try {
                    colisDb = JSON.parse(e.newValue) || [];
                    renderColis();
                } catch (err) { }
            }
        });

        let consignes = JSON.parse(localStorage.getItem('sofia_consignes')) || [
            { id: 1, shift: 'Technique', type: 'todo', text: 'Chambre 304 : Le mitigeur douche a été changé ce matin. À tester avant réattribution.', date: new Date().toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }), status: 'active' },
            { id: 2, shift: 'Direction', type: 'info', text: 'Bienvenue sur S.O.F.I.A 3.0 ! Pensez à pointer systématiquement vos paiements CB/AMEX en fin de service.', date: new Date(Date.now() - 7200000).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }), status: 'active' }
        ];

        function renderConsignes() {
            const list = document.getElementById('consignes-list');
            if (!list) return;
            list.innerHTML = '';

            if (consignes.length === 0) {
                list.innerHTML = `
                    <div class="text-center py-12 bg-gray-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-gray-300 dark:border-slate-700">
                        <i class="fas fa-clipboard text-3xl text-gray-300 dark:text-slate-600 mb-2"></i>
                        <p class="text-gray-500 dark:text-gray-400 font-medium text-sm">Le cahier de consignes est vide.</p>
                    </div>`;
                return;
            }

            [...consignes].reverse().forEach(c => {
                let typeClasses = 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200';
                let icon = '<i class="fas fa-info-circle text-blue-500"></i>';

                if (c.type === 'alerte') {
                    typeClasses = 'bg-red-50 border-red-200 text-red-900 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200';
                    icon = '<i class="fas fa-exclamation-triangle text-red-500"></i>';
                } else if (c.type === 'todo') {
                    typeClasses = 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-200';
                    icon = '<i class="fas fa-check-square text-emerald-500"></i>';
                }

                const isResolved = c.status === 'resolved';
                const resolvedClass = isResolved ? 'resolved-item' : '';
                const resolveBtnHtml = isResolved
                    ? `<span class="text-[10px] font-bold text-green-600 dark:text-green-400 flex items-center bg-green-100 dark:bg-green-900/40 px-2 py-0.5 rounded"><i class="fas fa-check mr-1"></i> Résolu</span>`
                    : `<button onclick="resolveConsigne(${c.id})" class="text-[10px] font-bold text-gray-600 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 px-2 py-0.5 rounded hover:bg-green-50 hover:text-green-600 hover:border-green-300 transition-colors">Marquer résolu</button>`;

                list.innerHTML += `
                    <div id="consigne-${c.id}" class="p-3.5 rounded-xl border shadow-sm ${typeClasses} ${resolvedClass} relative group">
                        <button onclick="deleteConsigne(${c.id})" class="absolute top-2.5 right-2.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-800 rounded-full w-6 h-6 flex items-center justify-center shadow-sm">
                            <i class="fas fa-trash-alt text-xs"></i>
                        </button>
                        <div class="flex items-center justify-between mb-2 pb-1.5 border-b border-black/5 dark:border-white/5 pr-6">
                            <span class="font-bold text-xs flex items-center gap-1.5">${icon} ${c.shift}</span>
                            <div class="flex items-center gap-2">
                                ${resolveBtnHtml}
                                <span class="text-[11px] font-medium opacity-75">${c.date}</span>
                            </div>
                        </div>
                        <p class="text-xs whitespace-pre-wrap leading-relaxed">${c.text}</p>
                    </div>
                `;
            });
        }

        function addConsigne() {
            const shift = document.getElementById('log-shift').value;
            const type = document.getElementById('log-type').value;
            const textInput = document.getElementById('log-text');
            const text = textInput.value.trim();

            if (!text) {
                textInput.classList.add('ring-2', 'ring-red-500');
                setTimeout(() => textInput.classList.remove('ring-2', 'ring-red-500'), 800);
                return;
            }

            const newLog = {
                id: Date.now(),
                shift,
                type,
                text,
                date: new Date().toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
                status: 'active',
                senderId: currentTabId
            };

            consignes.push(newLog);
            localStorage.setItem('sofia_consignes', JSON.stringify(consignes));
            textInput.value = '';
            renderConsignes();

            // Diffusion multi-postes & multi-onglets
            broadcastSync('ADD_CONSIGNE', newLog);

            if (typeof gsap !== 'undefined') {
                gsap.from(`#consigne-${newLog.id}`, { opacity: 0, y: -15, duration: 0.4, ease: "back.out(1.2)" });
            }
        }

        function resolveConsigne(id) {
            const index = consignes.findIndex(c => c.id === id);
            if (index !== -1) {
                consignes[index].status = 'resolved';
                localStorage.setItem('sofia_consignes', JSON.stringify(consignes));
                renderConsignes();

                // Diffusion multi-postes & multi-onglets
                broadcastSync('RESOLVE_CONSIGNE', { id });

                if (typeof gsap !== 'undefined') {
                    gsap.fromTo(`#consigne-${id}`, { scale: 1.02 }, { scale: 1, duration: 0.3, ease: "expo.out" });
                }
            }
        }

        function deleteConsigne(id) {
            const el = document.getElementById(`consigne-${id}`);
            const performDelete = () => {
                consignes = consignes.filter(c => c.id !== id);
                localStorage.setItem('sofia_consignes', JSON.stringify(consignes));
                renderConsignes();

                // Diffusion multi-postes & multi-onglets
                broadcastSync('DELETE_CONSIGNE', { id });
            };

            if (el && typeof gsap !== 'undefined') {
                gsap.to(el, { opacity: 0, scale: 0.9, duration: 0.2, onComplete: performDelete });
            } else {
                performDelete();
            }
        }

        let colisDb = JSON.parse(localStorage.getItem('sofia_colis')) || [];

        function renderColis() {
            const list = document.getElementById('colis-list');
            if (!list) return;
            list.innerHTML = '';

            if (colisDb.length === 0) {
                list.innerHTML = `
                    <div class="text-center py-12 bg-gray-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-gray-300 dark:border-slate-700">
                        <i class="fas fa-box-open text-3xl text-gray-300 dark:text-slate-600 mb-2"></i>
                        <p class="text-gray-500 dark:text-gray-400 font-medium text-sm">Aucun colis en attente ou répertorié.</p>
                    </div>`;
                return;
            }

            [...colisDb].reverse().forEach(c => {
                const isDelivered = c.status === 'delivered';
                const cardClass = isDelivered
                    ? 'bg-gray-100 border-gray-200 text-gray-500 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-400 resolved-item'
                    : 'bg-purple-50 border-purple-200 text-purple-900 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-200';

                const actionBtn = isDelivered
                    ? `<span class="text-[10px] font-bold text-gray-500 flex items-center bg-gray-200 dark:bg-slate-700 px-2 py-0.5 rounded">Remis le ${c.deliveredDate}</span>`
                    : `<button onclick="remettreColis(${c.id})" class="text-[10px] font-bold text-white bg-purple-600 hover:bg-purple-700 px-2 py-1 rounded transition-colors shadow-sm"><i class="fas fa-hand-holding-heart mr-1"></i> Remettre au client</button>`;

                list.innerHTML += `
                    <div id="colis-${c.id}" class="p-3.5 rounded-xl border shadow-sm ${cardClass} relative group">
                        <button onclick="deleteColis(${c.id})" class="absolute top-2.5 right-2.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-800 rounded-full w-6 h-6 flex items-center justify-center shadow-sm">
                            <i class="fas fa-trash-alt text-xs"></i>
                        </button>
                        <div class="flex items-center justify-between mb-2 pb-1.5 border-b border-black/5 dark:border-white/5 pr-6">
                            <span class="font-black text-sm flex items-center gap-1.5"><i class="fas fa-door-closed opacity-60"></i> Ch. ${c.room}</span>
                            ${actionBtn}
                        </div>
                        <div class="flex justify-between items-end">
                            <div>
                                <p class="text-xs font-bold mb-0.5 uppercase">${c.name}</p>
                                <p class="text-[11px] font-medium opacity-80 flex items-center"><i class="fas fa-truck mr-1"></i> ${c.carrier}</p>
                            </div>
                            <span class="text-[10px] opacity-70">Reçu le ${c.date}</span>
                        </div>
                    </div>
                `;
            });
        }

        function addColis() {
            const roomInput = document.getElementById('colis-room');
            const nameInput = document.getElementById('colis-name');
            const carrier = document.getElementById('colis-carrier').value;

            const room = roomInput.value.trim();
            const name = nameInput.value.trim();

            if (!room || !name) {
                if (!room) roomInput.classList.add('ring-2', 'ring-red-500');
                if (!name) nameInput.classList.add('ring-2', 'ring-red-500');
                setTimeout(() => {
                    roomInput.classList.remove('ring-2', 'ring-red-500');
                    nameInput.classList.remove('ring-2', 'ring-red-500');
                }, 800);
                return;
            }

            const newColis = {
                id: Date.now(),
                room,
                name,
                carrier,
                date: new Date().toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
                status: 'pending',
                senderId: currentTabId
            };

            colisDb.push(newColis);
            localStorage.setItem('sofia_colis', JSON.stringify(colisDb));

            roomInput.value = '';
            nameInput.value = '';
            renderColis();

            // Diffusion multi-postes & multi-onglets
            broadcastSync('ADD_COLIS', newColis);

            if (typeof gsap !== 'undefined') {
                gsap.from(`#colis-${newColis.id}`, { opacity: 0, x: -15, duration: 0.4, ease: "back.out(1.2)" });
            }
        }

        function remettreColis(id) {
            const index = colisDb.findIndex(c => c.id === id);
            if (index !== -1) {
                colisDb[index].status = 'delivered';
                colisDb[index].deliveredDate = new Date().toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
                localStorage.setItem('sofia_colis', JSON.stringify(colisDb));
                renderColis();

                // Diffusion multi-postes & multi-onglets
                broadcastSync('DELIVER_COLIS', {
                    id,
                    room: colisDb[index].room,
                    name: colisDb[index].name,
                    deliveredDate: colisDb[index].deliveredDate
                });

                if (typeof gsap !== 'undefined') {
                    gsap.fromTo(`#colis-${id}`, { scale: 1.02, backgroundColor: '#e9d5ff' }, { scale: 1, backgroundColor: 'transparent', duration: 0.4 });
                }
            }
        }

        function deleteColis(id) {
            const el = document.getElementById(`colis-${id}`);
            const performDelete = () => {
                colisDb = colisDb.filter(c => c.id !== id);
                localStorage.setItem('sofia_colis', JSON.stringify(colisDb));
                renderColis();

                // Diffusion multi-postes & multi-onglets
                broadcastSync('DELETE_COLIS', { id });
            };

            if (el && typeof gsap !== 'undefined') {
                gsap.to(el, { opacity: 0, height: 0, marginBottom: 0, padding: 0, duration: 0.3, onComplete: performDelete });
            } else {
                performDelete();
            }
        }

        const modal = document.getElementById('custom-modal');
        let currentTarget = null;

        function clearConsignes() {
            if (consignes.length === 0) return;
            currentTarget = 'consignes';
            document.getElementById('modal-desc').innerText = "Voulez-vous vraiment supprimer toutes les consignes ? Cette action est irréversible.";
            document.getElementById('modal-confirm-btn').onclick = confirmClear;
            modal.classList.add('active');
        }

        function clearColis() {
            if (colisDb.length === 0) return;
            currentTarget = 'colis';
            document.getElementById('modal-desc').innerText = "Voulez-vous nettoyer le registre des colis ? Tous les historiques seront perdus.";
            document.getElementById('modal-confirm-btn').onclick = confirmClear;
            modal.classList.add('active');
        }

        function closeModal() {
            modal.classList.remove('active');
        }

        function confirmClear() {
            if (currentTarget === 'consignes') {
                consignes = [];
                localStorage.setItem('sofia_consignes', JSON.stringify(consignes));
                renderConsignes();
                broadcastSync('CLEAR_CONSIGNES');
            } else if (currentTarget === 'colis') {
                colisDb = [];
                localStorage.setItem('sofia_colis', JSON.stringify(colisDb));
                renderColis();
                broadcastSync('CLEAR_COLIS');
            }
            closeModal();
        }

        /* ==========================================================================
           GESTION ET EXPORT D'AUDIT DU FOND DE CAISSE (RÉCEPTION H9297)
           ========================================================================== */

        let caisseActiveShift = 'matin-soir'; // 'nuit-matin' | 'matin-soir' | 'soir-nuit' | 'cloture'

        // Détection automatique du shift selon l'heure
        function getAutoCaisseShift() {
            const hour = new Date().getHours();
            if (hour >= 6 && hour < 9) return 'nuit-matin';
            if (hour >= 9 && hour < 15) return 'matin-soir';
            if (hour >= 15 && hour < 22) return 'soir-nuit';
            return 'cloture';
        }

        function initCaisseShift() {
            caisseActiveShift = getAutoCaisseShift();
            updateCaisseShiftUI();
            updateCaisseDateDisplay();

            // Charger le nom du réceptionniste mémorisé
            const savedName = localStorage.getItem('sofia_caisse_receptionist') || localStorage.getItem('sofia_user_name') || '';
            const recInput = document.getElementById('caisse-receptionist');
            if (recInput && savedName) {
                recInput.value = savedName;
            }
            calculCaisse();
        }

        function selectCaisseShift(shiftKey) {
            caisseActiveShift = shiftKey;
            updateCaisseShiftUI();
            calculCaisse();
        }

        function updateCaisseShiftUI() {
            const shifts = [
                { key: 'nuit-matin', icon: '🌅', name: 'Nuit/Matin', activeCls: 'bg-emerald-100 text-emerald-900 border-emerald-500 shadow-sm' },
                { key: 'matin-soir', icon: '☀️', name: 'Matin/Soir', activeCls: 'bg-amber-100 text-amber-900 border-amber-500 shadow-sm' },
                { key: 'soir-nuit', icon: '🌙', name: 'Soir/Nuit', activeCls: 'bg-blue-100 text-blue-900 border-blue-500 shadow-sm' },
                { key: 'cloture', icon: '🔒', name: 'Clôture', activeCls: 'bg-rose-100 text-rose-900 border-rose-500 shadow-sm' }
            ];
            shifts.forEach(s => {
                const btn = document.getElementById('shift-btn-' + s.key);
                if (btn) {
                    if (s.key === caisseActiveShift) {
                        btn.className = `caisse-shift-btn px-3 py-2 rounded-xl text-xs font-black border-2 transition-all text-center flex items-center justify-center gap-1.5 ${s.activeCls}`;
                    } else {
                        btn.className = `caisse-shift-btn px-3 py-2 rounded-xl text-xs font-black border transition-all text-center flex items-center justify-center gap-1.5 bg-gray-50 dark:bg-slate-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer`;
                    }
                }
            });
        }

        function saveCaisseReceptionistName(name) {
            if (name) {
                localStorage.setItem('sofia_caisse_receptionist', name.trim());
            }
        }

        function updateCaisseDateDisplay() {
            const dateLabel = document.getElementById('caisse-date-label');
            if (dateLabel) {
                const now = new Date();
                const formatted = now.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                dateLabel.innerText = formatted.charAt(0).toUpperCase() + formatted.slice(1);
            }
        }

        function toggleCaisseExtraAudit() {
            const content = document.getElementById('caisse-extra-content');
            const chevron = document.getElementById('caisse-extra-chevron');
            if (!content) return;
            const isHidden = content.classList.contains('hidden');
            if (isHidden) {
                content.classList.remove('hidden');
                if (chevron) chevron.style.transform = 'rotate(180deg)';
            } else {
                content.classList.add('hidden');
                if (chevron) chevron.style.transform = 'rotate(0deg)';
            }
        }

        function getCaisseCurrentValues() {
            const b = {
                b500: parseInt(document.getElementById('b500')?.value) || 0,
                b200: parseInt(document.getElementById('b200')?.value) || 0,
                b100: parseInt(document.getElementById('b100')?.value) || 0,
                b50: parseInt(document.getElementById('b50')?.value) || 0,
                b20: parseInt(document.getElementById('b20')?.value) || 0,
                b10: parseInt(document.getElementById('b10')?.value) || 0,
                b5: parseInt(document.getElementById('b5')?.value) || 0
            };
            const p = {
                p2e: parseInt(document.getElementById('p2e')?.value) || 0,
                p1e: parseInt(document.getElementById('p1e')?.value) || 0,
                p50c: parseInt(document.getElementById('p50c')?.value) || 0,
                p20c: parseInt(document.getElementById('p20c')?.value) || 0,
                p10c: parseInt(document.getElementById('p10c')?.value) || 0,
                p5c: parseInt(document.getElementById('p5c')?.value) || 0,
                p2c: parseInt(document.getElementById('p2c')?.value) || 0,
                p1c: parseInt(document.getElementById('p1c')?.value) || 0
            };
            const debours = parseFloat(document.getElementById('debours')?.value) || 0;
            const Opera = parseFloat(document.getElementById('Opera-especes')?.value) || 0;

            const totBillets = (b.b500 * 500) + (b.b200 * 200) + (b.b100 * 100) + (b.b50 * 50) + (b.b20 * 20) + (b.b10 * 10) + (b.b5 * 5);
            const totPieces = (p.p2e * 2) + (p.p1e * 1) + (p.p50c * 0.50) + (p.p20c * 0.20) + (p.p10c * 0.10) + (p.p5c * 0.05) + (p.p2c * 0.02) + (p.p1c * 0.01);
            const totalCaisse = totBillets + totPieces + debours;
            const fondsNet = totalCaisse - Opera;
            const ecart = fondsNet - 250;

            const env = {
                amex_tpe: parseFloat(document.getElementById('env-amex-tpe')?.value) || 0,
                amex_Opera: parseFloat(document.getElementById('env-amex-Opera')?.value) || 0,
                cb_tpe: parseFloat(document.getElementById('env-cb-tpe')?.value) || 0,
                cb_Opera: parseFloat(document.getElementById('env-cb-Opera')?.value) || 0,
                cv_tpe: parseFloat(document.getElementById('env-cv-tpe')?.value) || 0,
                cv_Opera: parseFloat(document.getElementById('env-cv-Opera')?.value) || 0,
                cc_tpe: parseFloat(document.getElementById('env-cc-tpe')?.value) || 0,
                cc_Opera: parseFloat(document.getElementById('env-cc-Opera')?.value) || 0
            };

            const obj = {
                clef: document.getElementById('obj-clef')?.checked ? 1 : 0,
                pass: document.getElementById('obj-pass')?.checked ? 1 : 0,
                portable: document.getElementById('obj-portable')?.checked ? 1 : 0,
                autres: document.getElementById('obj-autres')?.value?.trim() || ''
            };

            const comments = document.getElementById('caisse-comments')?.value?.trim() || '';
            const receptionist = document.getElementById('caisse-receptionist')?.value?.trim() || 'Réceptionniste';

            return {
                b, p, debours, Opera, totBillets, totPieces, totalCaisse, fondsNet, ecart,
                env, obj, comments, receptionist, shift: caisseActiveShift
            };
        }

        function calculCaisse() {
            const data = getCaisseCurrentValues();

            if (document.getElementById('subtotal-billets')) {
                document.getElementById('subtotal-billets').innerText = data.totBillets.toFixed(2) + ' €';
            }
            if (document.getElementById('subtotal-pieces')) {
                document.getElementById('subtotal-pieces').innerText = data.totPieces.toFixed(2) + ' €';
            }
            if (document.getElementById('caisse-total')) {
                document.getElementById('caisse-total').innerText = data.totalCaisse.toFixed(2) + ' €';
            }
            if (document.getElementById('caisse-net')) {
                document.getElementById('caisse-net').innerText = data.fondsNet.toFixed(2) + ' €';
            }

            const ecartEl = document.getElementById('caisse-ecart');
            if (ecartEl) {
                if (Math.abs(data.ecart) < 0.005) {
                    ecartEl.innerText = "Parfait ! Aucun écart (Fond de caisse exact à 250,00 €)";
                    ecartEl.className = "py-1.5 px-3 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold inline-block";
                } else if (data.ecart > 0) {
                    ecartEl.innerText = `Excédent / Surplus : +${data.ecart.toFixed(2)} €`;
                    ecartEl.className = "py-1.5 px-3 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-bold inline-block";
                } else {
                    ecartEl.innerText = `Déficit / Manquant : ${data.ecart.toFixed(2)} €`;
                    ecartEl.className = "py-1.5 px-3 rounded-xl bg-red-500/20 text-red-300 text-xs font-bold inline-block";
                }
            }

            // Sauvegarde de la saisie active du jour dans le localStorage
            try {
                const dayKey = 'sofia_caisse_' + new Date().toISOString().slice(0, 10);
                let dayData = {};
                try { dayData = JSON.parse(localStorage.getItem(dayKey)) || {}; } catch (e) { }
                dayData[caisseActiveShift] = data;
                localStorage.setItem(dayKey, JSON.stringify(dayData));
            } catch (e) { }
        }

        function resetCaisse() {
            const ids = [
                'b500', 'b200', 'b100', 'b50', 'b20', 'b10', 'b5',
                'p2e', 'p1e', 'p50c', 'p20c', 'p10c', 'p5c', 'p2c', 'p1c',
                'debours', 'Opera-especes',
                'env-amex-tpe', 'env-amex-Opera', 'env-cb-tpe', 'env-cb-Opera',
                'env-cv-tpe', 'env-cv-Opera', 'env-cc-tpe', 'env-cc-Opera',
                'obj-autres', 'caisse-comments'
            ];
            ids.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
            calculCaisse();
        }

        // Générateur du HTML conforme pixel-perfect au classeur Excel H9297
        function generateCaisseAuditHTML() {
            const currentData = getCaisseCurrentValues();
            const now = new Date();
            const caisseDateFullFr = now.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            const dateStr = now.toLocaleDateString('fr-FR');
            const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

            // Récupérer toutes les passations enregistrées aujourd'hui
            let dayData = {};
            try {
                const dayKey = 'sofia_caisse_' + now.toISOString().slice(0, 10);
                dayData = JSON.parse(localStorage.getItem(dayKey)) || {};
            } catch (e) { }
            // Toujours s'assurer que le shift actif actuel a les données les plus fraîches
            dayData[currentData.shift] = currentData;

            const shiftKeys = ['nuit-matin', 'matin-soir', 'soir-nuit', 'cloture'];

            // Formateur Euros Excel
            const fmt = (num) => {
                if (num === undefined || num === null || num === 0) return '0 €';
                return Number(num).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
            };
            const fmtDec = (num) => {
                if (num === undefined || num === null || num === 0) return '0,00 €';
                return Number(num).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
            };

            const billetRows = [
                { label: '500 €', key: 'b500', val: 500 },
                { label: '200 €', key: 'b200', val: 200 },
                { label: '100 €', key: 'b100', val: 100 },
                { label: '50 €', key: 'b50', val: 50 },
                { label: '20 €', key: 'b20', val: 20 },
                { label: '10 €', key: 'b10', val: 10 },
                { label: '5 €', key: 'b5', val: 5 }
            ];

            const pieceRows = [
                { label: '2,00 €', key: 'p2e', val: 2 },
                { label: '1,00 €', key: 'p1e', val: 1 },
                { label: '0,50 €', key: 'p50c', val: 0.50 },
                { label: '0,20 €', key: 'p20c', val: 0.20 },
                { label: '0,10 €', key: 'p10c', val: 0.10 },
                { label: '0,05 €', key: 'p5c', val: 0.05 },
                { label: '0,02 €', key: 'p2c', val: 0.02 },
                { label: '0,01 €', key: 'p1c', val: 0.01 }
            ];

            const EMBEDDED_ADAGIO_LOGO = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABAAAAAIiCAYAAABWqbqEAAAQAElEQVR4AeydB7wdRdn/f7PnliSEhAAh9N4kSFXAgsaGUlIxKgKK+oq9YcFu7O9rV/RVsYCiqERIbgKiqH9jfy0IiBQV6T20QEi5954z/99zTwIpt5yyuzO757efZ86es2dmnme+22aemZ1NoEUEREAEREAEREAEREAEREAEREAERKDsBCAHQOl3sQooAiIgAiIgAiIgAiIgAiIgAiIgApADQAeBCIiACIiACIiACIiACIiACIiACJSeAAuoEQCEIBEBERABERABERABERABERABERCBMhOwsskBYBQUREAEREAEREAEREAEREAEREAERKC8BIZKJgfAEAZ9iIAIiIAIiIAIiIAIiIAIiIAIiEBZCdTLJQdAnYM+RUAEREAEREAEREAEREAEREAERKCcBNaVSg6AdSC0EgEREAEREAEREAEREAEREAEREIEyElhfJjkA1pPQWgREQAREQAREQAREQAREQAREQATKR+CxEskB8BgKfREBERABERABERABERABERABERCBshF4vDxyADzOQt9EQAREQAREQAREQAREQAREQAREoFwENiiNHAAbwNBXERABERABERABERABERABERABESgTgQ3LIgfAhjT0XQREQAREQAREQAREQAREQAREQATKQ2CjksgBsBEO/RABERABERABERABERABERABERCBshDYuBxyAGzMQ79EQAREQAREQAREQAREQAREQAREoBwENimFHACbANFPERABERABERABERABERABERABESgDgU3LIAfApkT0WwREQAREQAREQAREQAREQAREQASKT2CzEsgBsBkSbRABERABERABERABERABERABERCBohPY3H45ADZnoi0iIAIiIAIiIAIiIAIiIAIiIAIiUGwCw1gvB8AwULRJBERABERABERABERABERABERABIpMYDjb5QAYjoq2iYAIiIAIiIAIiIAIiIAIiIAIiEBxCQxruRwAw2LRRhEQAREQAREQAREQAREQAREQAREoKoHh7ZYDYHgu2ioCIiACIiACIiACIiACIiACIiACxSQwgtVyAIwARptFQAREQAREQAREQAREQAREQAREoIgERrJZDoCRyGi7CIiACIiACIiACIiACIiACIiACBSPwIgWywEwIhr9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BNIioHzSJSAHQLo8lZsIiIAIiIAIiIAIiIAIiIAIiEA6BJRLygTkAEgZqLITAREQAREQAREQAREQAREQARFIg4DySJuAHABpE1V+IiACIiACIiACIiACIiACIiAC7RNQDqkTkAMgdaTKUAREQAREQAREQAREQAREQAREoF0CSp8+ATkA0meqHEVABERABERABERABERABERABNojoNQZEJADIAOoylIEREAEREAEREAEREAEREAERKAdAkqbBQE5ALKgqjxFQAREQAREQAREQAREQAREQARaJ6CUmRCQAyATrMpUBERABERABERABERABERABESgVQJKlw0BOQCy4apcRUAEREAEREAEREAEREAEREAEWiOgVBkRkAMgI7DKVgREQAREQAREQAREQAREQAREoBUCSpMVATkAsiKrfEVABERABERABERABERABERABJonoBSZEZADIDO0ylgEREAEREAEREAEREAEREAERKBZAoqfHQE5ALJjq5xFQAREQAREQAREQAREQAREQASaI6DYGRKQAyBDuMpaBERABERABERABERABERABESgGQKKmyUBOQCypKu8RUAEREAEREAEREAEREAEREAEGiegmJkSkAMgU7zKXAREQAREQAREQAREQAREQAREoFECipctATkAsuWr3EVABERABERABERABERABERABBojoFgZE5ADIGPAyl4EREAEREAEREAEREAEREAERKARAoqTNQE5ALImrPxFQAREQAREQAREQAREQAREQATGJqAYmROQAyBzxFIgAiIgAiIgAiIgAiIgAiIgAiIwFgH9nz0BOQCyZywNIiACIiACIiACIiACIiACIiACoxPQvzkQkAMgB8hSIQIiIAIiIAIiIAIiIAIiIAIiMBoB/ZcHATkA8qAsHSIgAiIgAiIgAiIgAiIgAiIgAiMT0D+5EJADIBfMUiICIiACIiACIiACIiACIiACIjASAW3Ph4AcAPlwlhYREAEREAEREAEREAEREAEREIHhCWhrTgTkAMgJtNSIgAiIgAiIgAiIgAiIgAiIgAgMR0Db8iIgB0BepKVHBERABERABERABERABERABERgcwLakhsBOQByQy1FIiACIiACIiACIiACIiACIiACmxLQ7/wIyAGQH2tpEgEREAEREAEREAEREAEREAER2JiAfuVIQA6AHGFLlQiIgAiIgAiIgAiIgAiIgAiIwIYE9D1PAnIA5ElbukRABERABERABERABERABERABB4noG+5EpADIFfcUiYCIiACIiACIiACIiACIiACIrCegNb5EpADIF/e0iYCIiACIiACIiACIiACIiACIlAnoM+cCcgBkDNwqRMBERABERABERABERABERABETACCnkTkAMgb+LSJwIiIAIiIAIiIAIiIAIiIAIiAIhB7gTkAMgduRSKgAiIgAiIgAiIgAiIgAiIgAiIQP4E5ADIn7k0ioAIiIAIiIAIiIAIiIAIiECnE1D5AxCQAyAAdKkUAREQAREQAREQAREQAREQgc4moNKHICAHQAjq0ikCIiACIiACIiACIiACIiACnUxAZQ9CQA6AINilVAREQAREQAREQAREQAREQAQ6l4BKHoaAHABhuEurCIiACIiACIiACBgBxw8LFa63YtiGYbcNwvb8btsncG31NotrgT8lIiACIlBYAjI8EAG7kQRSLbUiIAIiIAIiIAIi0JEEprLUz2J4NcPHGb7HcDHDz9aFX3C9Pvyc3237T7hexPBlhncyzGY4kKGXQSICIiACBSMgc0MRkAMgFHnpFYF8CVjP0nOocl6K4bnMy3qkuMpVrAzXUON/MgpW6f42834zw1MYdmIIUU6q3Uys1+9J3GoM0grHMz/rXeQqV9mF2q5nyGo/Wr7/Zv7WaPoq129hOIJhR4YtGLKQHmY6gyGtfZNHPtaApMkNyQ6M1axN05kmKzHez2fmzdhk+8fOIybLVUznRGo8muEHDJczLGX4X4YzGU5ieAGDHaOHRbrwRgAAEABJREFUc733BsH2kW1/JrfNYngtwycYfsSwjOEPDLZtZ667GLKUtK8/zey7VuI+jzAadZBsybjHMLSiJ+00dl2mKU3LeKZo9l5vx12jjJi9RARSIqBsghGQAyAYeikWgVwJ7EFtP2S4MMVwHvM6hCFvsUra7lS6Z0bBKk+vYN5fZPgdw98Y+hg+xTCHwRwCoa6d06j/Swxp7scLmJ81irjKVbqpzY7LrPaj5WuNqGOpxxpHX+D6Twx/YbCGl/1+Cb/vx5BWo8kaeNabm+b+yTKvhSz7KQyNypMZsVl7Xso01vjlKnWZxBzPYmjGpk8yflb2MOvNxI4tc4K8jf+YM8p68u24MweYOaLsf7ueNGOTxTenrjXa7HGBw5i3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';
            if (typeof window !== 'undefined' && !window.ADAGIO_LOGO_SRC) {
                window.ADAGIO_LOGO_SRC = EMBEDDED_ADAGIO_LOGO;
            }
            const logoSrc = (typeof window !== 'undefined' && window.ADAGIO_LOGO_SRC) ? window.ADAGIO_LOGO_SRC : EMBEDDED_ADAGIO_LOGO;

            let html = `
            <div id="caisse-audit-render-doc" style="width: 1040px; font-family: Calibri, Arial, sans-serif; font-size: 10.5px; color: #000000; background-color: #ffffff; padding: 12px; margin: 0 auto; box-sizing: border-box;">
                
                <!-- EN-TÊTE OFFICIEL : LOGO ADAGIO & BANDEAU GRIS H9297 -->
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px;">
                    <tr>
                        <td style="width: 160px; vertical-align: middle; padding: 4px 8px; text-align: center; background-color: #ffffff;">
                            <img src="${logoSrc}" alt="ADAGIO APARTHOTEL" style="max-height: 48px; max-width: 150px; object-fit: contain; display: block; margin: 0 auto;">
                        </td>
                        <td style="background-color: #7f7f7f; color: #ffffff; text-align: center; vertical-align: middle; padding: 6px 12px; border: 1.5px solid #000000;">
                            <div style="font-size: 15px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px;">Réception - H9297</div>
                            <div style="font-size: 17px; font-weight: bold; margin-top: 2px;">Feuille de passation du fond de caisse</div>
                        </td>
                    </tr>
                </table>

                <!-- SECTION IDENTIFICATION & DÉTAILS DU JOUR -->
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 6px;">
                    <tr>
                        <td style="width: 105px; border: 1.5px solid #000; background-color: #e6e6e6; font-weight: bold; padding: 4px 6px; text-align: right;">Date du jour :</td>
                        <td style="width: 200px; border: 1.5px solid #000; font-weight: bold; padding: 4px 6px; text-align: center; background-color: #ffffff;">${caisseDateFullFr}</td>
                        <td style="width: 140px; border: 1.5px solid #000; background-color: #e6e6e6; font-weight: bold; padding: 4px 6px; text-align: right;">Fonds de caisse initial :</td>
                        <td style="width: 105px; border: 1.5px solid #000; font-weight: bold; padding: 4px 6px; text-align: center; font-size: 12px; background-color: #ffffff;">250,00 €</td>
                        <td style="width: 130px; border: 1.5px solid #000; background-color: #e6e6e6; font-weight: bold; padding: 4px 6px; text-align: center;">Visa de la direction :</td>
                        <td style="border: 1.5px solid #000; background-color: #ffffff; padding: 4px;"></td>
                    </tr>
                </table>

                <!-- EN-TÊTE DES 4 SHIFTS DE PASSATION (COULEURS EXCEL MAQUETTE) -->
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 6px;">
                    <tr style="font-weight: bold; text-align: center; font-size: 10.5px;">
                        <td style="width: 50%; padding: 0;"></td>
                        <td style="width: 12.5%; background-color: #d9ead3; border: 1.5px solid #274e13; color: #1e4620; padding: 4px 2px;">Passation nuit/matin</td>
                        <td style="width: 12.5%; background-color: #fff2cc; border: 1.5px solid #b45f06; color: #7f6000; padding: 4px 2px;">Passation matin/soir</td>
                        <td style="width: 12.5%; background-color: #cfe2f3; border: 1.5px solid #0b5394; color: #0b5394; padding: 4px 2px;">Passation soir/nuit</td>
                        <td style="width: 12.5%; background-color: #fce5cd; border: 1.5px solid #a61c1c; color: #a61c1c; padding: 4px 2px;">Clôture</td>
                    </tr>
                </table>

                <!-- DEUX GRANDES COLONNES : GAUCHE = CAISSE ESPÈCES / DROITE = ENVELOPPE & OBJETS & SIGNATURES -->
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <!-- COLONNE GAUCHE (50%) -->
                        <td style="width: 50%; vertical-align: top; padding-right: 6px;">
                            
                            <!-- TABLE 1 : BILLETS -->
                            <table style="width: 100%; border-collapse: collapse; margin-bottom: 6px; border: 1.5px solid #000;">
                                <thead>
                                    <tr style="background-color: #bfbfbf; font-weight: bold; text-align: center;">
                                        <th colspan="9" style="border: 1px solid #000; padding: 3px; font-size: 11px;">Billets</th>
                                    </tr>
                                    <tr style="background-color: #f2f2f2; font-size: 9.5px; font-weight: bold; text-align: center;">
                                        <th style="width: 60px; border: 1px solid #000; padding: 2px;">Coupure</th>
                                        <th style="width: 50px; border: 1px solid #000; padding: 2px;">Nombre</th>
                                        <th style="width: 62px; border: 1px solid #000; padding: 2px;">Total</th>
                                        <th style="width: 50px; border: 1px solid #000; padding: 2px;">Nombre</th>
                                        <th style="width: 62px; border: 1px solid #000; padding: 2px;">Total</th>
                                        <th style="width: 50px; border: 1px solid #000; padding: 2px;">Nombre</th>
                                        <th style="width: 62px; border: 1px solid #000; padding: 2px;">Total</th>
                                        <th style="width: 50px; border: 1px solid #000; padding: 2px;">Nombre</th>
                                        <th style="width: 62px; border: 1px solid #000; padding: 2px;">Total</th>
                                    </tr>
                                </thead>
                                <tbody>`;

            billetRows.forEach(row => {
                html += `
                                    <tr>
                                        <td style="border: 1px solid #000; padding: 2px 4px; text-align: center; font-weight: bold; background-color: #fafafa;">${row.label}</td>`;
                shiftKeys.forEach(sKey => {
                    const sData = dayData[sKey];
                    const qte = sData?.b?.[row.key] || 0;
                    const tot = qte * row.val;
                    html += `
                                        <td style="border: 1px solid #000; padding: 2px; text-align: center;">${qte > 0 ? qte : ''}</td>
                                        <td style="border: 1px solid #000; padding: 2px 4px; text-align: right;">${fmt(tot)}</td>`;
                });
                html += `
                                    </tr>`;
            });

            // Total billets (1)
            html += `
                                </tbody>
                                <tfoot>
                                    <tr style="background-color: #f2f2f2; font-weight: bold;">
                                        <td style="border: 1px solid #000; padding: 3px 4px;">Total billets (1)</td>`;
            shiftKeys.forEach(sKey => {
                const sData = dayData[sKey];
                const tot = sData?.totBillets || 0;
                html += `
                                        <td style="border: 1px solid #000; padding: 2px;"></td>
                                        <td style="border: 1px solid #000; padding: 3px 4px; text-align: right; font-weight: bold;">${fmt(tot)}</td>`;
            });
            html += `
                                    </tr>
                                </tfoot>
                            </table>

                            <!-- TABLE 2 : PIÈCES -->
                            <table style="width: 100%; border-collapse: collapse; margin-bottom: 6px; border: 1.5px solid #000;">
                                <thead>
                                    <tr style="background-color: #bfbfbf; font-weight: bold; text-align: center;">
                                        <th colspan="9" style="border: 1px solid #000; padding: 3px; font-size: 11px;">Pièces</th>
                                    </tr>
                                    <tr style="background-color: #f2f2f2; font-size: 9.5px; font-weight: bold; text-align: center;">
                                        <th style="width: 60px; border: 1px solid #000; padding: 2px;">Coupure</th>
                                        <th style="width: 50px; border: 1px solid #000; padding: 2px;">Nombre</th>
                                        <th style="width: 62px; border: 1px solid #000; padding: 2px;">Total</th>
                                        <th style="width: 50px; border: 1px solid #000; padding: 2px;">Nombre</th>
                                        <th style="width: 62px; border: 1px solid #000; padding: 2px;">Total</th>
                                        <th style="width: 50px; border: 1px solid #000; padding: 2px;">Nombre</th>
                                        <th style="width: 62px; border: 1px solid #000; padding: 2px;">Total</th>
                                        <th style="width: 50px; border: 1px solid #000; padding: 2px;">Nombre</th>
                                        <th style="width: 62px; border: 1px solid #000; padding: 2px;">Total</th>
                                    </tr>
                                </thead>
                                <tbody>`;

            pieceRows.forEach(row => {
                html += `
                                    <tr>
                                        <td style="border: 1px solid #000; padding: 1.5px 4px; text-align: center; font-weight: bold; background-color: #fafafa;">${row.label}</td>`;
                shiftKeys.forEach(sKey => {
                    const sData = dayData[sKey];
                    const qte = sData?.p?.[row.key] || 0;
                    const tot = qte * row.val;
                    html += `
                                        <td style="border: 1px solid #000; padding: 1.5px; text-align: center;">${qte > 0 ? qte : ''}</td>
                                        <td style="border: 1px solid #000; padding: 1.5px 4px; text-align: right;">${fmtDec(tot)}</td>`;
                });
                html += `
                                    </tr>`;
            });

            // Total pièces (2), Total bons dépenses (3), Total Caisse (1+2+3)
            html += `
                                </tbody>
                                <tfoot>
                                    <tr style="background-color: #f2f2f2; font-weight: bold;">
                                        <td style="border: 1px solid #000; padding: 2px 4px;">Total pièces (2)</td>`;
            shiftKeys.forEach(sKey => {
                const sData = dayData[sKey];
                const tot = sData?.totPieces || 0;
                html += `
                                        <td style="border: 1px solid #000; padding: 1.5px;"></td>
                                        <td style="border: 1px solid #000; padding: 2px 4px; text-align: right; font-weight: bold;">${fmtDec(tot)}</td>`;
            });
            html += `
                                    </tr>
                                    <tr style="background-color: #f2f2f2; font-weight: bold;">
                                        <td style="border: 1px solid #000; padding: 2px 4px;">Total bons dépenses (3)</td>`;
            shiftKeys.forEach(sKey => {
                const sData = dayData[sKey];
                const tot = sData?.debours || 0;
                html += `
                                        <td style="border: 1px solid #000; padding: 1.5px;"></td>
                                        <td style="border: 1px solid #000; padding: 2px 4px; text-align: right; font-weight: bold;">${fmtDec(tot)}</td>`;
            });
            html += `
                                    </tr>
                                    <tr style="background-color: #e6e6e6; font-weight: 900;">
                                        <td style="border: 1.5px solid #000; padding: 3px 4px; font-size: 10.5px;">Total Caisse (1+2+3)</td>`;
            shiftKeys.forEach(sKey => {
                const sData = dayData[sKey];
                const tot = sData?.totalCaisse || 0;
                html += `
                                        <td style="border: 1.5px solid #000; padding: 2px;"></td>
                                        <td style="border: 1.5px solid #000; padding: 3px 4px; text-align: right; font-size: 11px; font-weight: 900;">${fmtDec(tot)}</td>`;
            });
            html += `
                                    </tr>
                                </tfoot>
                            </table>

                            <!-- TABLE 3 : RAPPROCHEMENT Opera & SOLDE NET DU FONDS DE CAISSE -->
                            <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #000;">
                                <tr>
                                    <td style="border: 1px solid #000; padding: 4px; font-size: 9.5px; font-weight: bold; background-color: #fafafa; width: 48%;">
                                        Montant des encaissements en espèces sur Opera (B) :
                                    </td>`;
            shiftKeys.forEach(sKey => {
                const sData = dayData[sKey];
                const Opera = sData?.Opera || 0;
                html += `
                                    <td colspan="2" style="border: 1px solid #000; padding: 4px; text-align: right; font-weight: bold; width: 13%;">
                                        ${Opera > 0 ? fmtDec(Opera) : '- €'}
                                    </td>`;
            });
            html += `
                                </tr>
                                <tr style="background-color: #f7fcf5;">
                                    <td style="border: 2px solid #000; padding: 5px 4px; font-size: 10.5px; font-weight: 900;">
                                        Montant du fonds de caisse (A) - (B) :
                                    </td>`;
            shiftKeys.forEach(sKey => {
                const sData = dayData[sKey];
                const net = sData ? sData.fondsNet : 250;
                html += `
                                    <td colspan="2" style="border: 2px solid #000; padding: 5px 4px; text-align: center; font-size: 11.5px; font-weight: 900; background-color: #ffffff;">
                                        ${fmtDec(net)}
                                    </td>`;
            });
            html += `
                                </tr>
                            </table>

                        </td>

                        <!-- COLONNE DROITE (50%) -->
                        <td style="width: 50%; vertical-align: top; padding-left: 6px;">
                            
                            <!-- TABLE 4 : MONTANTS CONTENUS DANS L'ENVELOPPE DE CAISSE -->
                            <table style="width: 100%; border-collapse: collapse; margin-bottom: 6px; border: 1.5px solid #000;">
                                <thead>
                                    <tr style="background-color: #bfbfbf; font-weight: bold; text-align: center;">
                                        <th colspan="9" style="border: 1px solid #000; padding: 3px; font-size: 11px;">Montants contenus dans l'enveloppe de caisse</th>
                                    </tr>
                                    <tr style="font-size: 9.5px; font-weight: bold; text-align: center;">
                                        <th rowspan="2" style="border: 1px solid #000; padding: 2px; width: 110px; background-color: #f2f2f2;">Règlement</th>
                                        <th colspan="2" style="border: 1px solid #000; background-color: #d9ead3;">Passation nuit/matin</th>
                                        <th colspan="2" style="border: 1px solid #000; background-color: #fff2cc;">Passation matin/soir</th>
                                        <th colspan="2" style="border: 1px solid #000; background-color: #cfe2f3;">Passation soir/nuit</th>
                                        <th colspan="2" style="border: 1px solid #000; background-color: #fce5cd;">Clôture</th>
                                    </tr>
                                    <tr style="font-size: 8.5px; font-weight: bold; text-align: center; background-color: #f2f2f2;">
                                        <th style="border: 1px solid #000; padding: 2px; width: 45px;">TPE</th>
                                        <th style="border: 1px solid #000; padding: 2px; width: 45px;">Opera</th>
                                        <th style="border: 1px solid #000; padding: 2px; width: 45px;">TPE</th>
                                        <th style="border: 1px solid #000; padding: 2px; width: 45px;">Opera</th>
                                        <th style="border: 1px solid #000; padding: 2px; width: 45px;">TPE</th>
                                        <th style="border: 1px solid #000; padding: 2px; width: 45px;">Opera</th>
                                        <th style="border: 1px solid #000; padding: 2px; width: 45px;">TPE</th>
                                        <th style="border: 1px solid #000; padding: 2px; width: 45px;">Opera</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style="border: 1px solid #000; padding: 2px 4px; font-weight: bold; background-color: #fafafa;">AMEX</td>`;
            shiftKeys.forEach(sKey => {
                const env = dayData[sKey]?.env;
                html += `
                                        <td style="border: 1px solid #000; padding: 2px; text-align: right;">${env?.amex_tpe > 0 ? fmtDec(env.amex_tpe) : ''}</td>
                                        <td style="border: 1px solid #000; padding: 2px; text-align: right;">${env?.amex_Opera > 0 ? fmtDec(env.amex_Opera) : ''}</td>`;
            });
            html += `
                                    </tr>
                                    <tr>
                                        <td style="border: 1px solid #000; padding: 2px 4px; font-weight: bold; background-color: #fafafa;">CB (Visa + Mastercard)</td>`;
            shiftKeys.forEach(sKey => {
                const env = dayData[sKey]?.env;
                html += `
                                        <td style="border: 1px solid #000; padding: 2px; text-align: right;">${env?.cb_tpe > 0 ? fmtDec(env.cb_tpe) : ''}</td>
                                        <td style="border: 1px solid #000; padding: 2px; text-align: right;">${env?.cb_Opera > 0 ? fmtDec(env.cb_Opera) : ''}</td>`;
            });
            html += `
                                    </tr>
                                    <tr>
                                        <td style="border: 1px solid #000; padding: 2px 4px; font-weight: bold; background-color: #fafafa;">Chèques Vacances</td>`;
            shiftKeys.forEach(sKey => {
                const env = dayData[sKey]?.env;
                html += `
                                        <td style="border: 1px solid #000; padding: 2px; text-align: right;">${env?.cv_tpe > 0 ? fmtDec(env.cv_tpe) : ''}</td>
                                        <td style="border: 1px solid #000; padding: 2px; text-align: right;">${env?.cv_Opera > 0 ? fmtDec(env.cv_Opera) : ''}</td>`;
            });
            html += `
                                    </tr>
                                    <tr>
                                        <td style="border: 1px solid #000; padding: 2px 4px; font-weight: bold; background-color: #fafafa;">Chèques Cadeaux</td>`;
            shiftKeys.forEach(sKey => {
                const env = dayData[sKey]?.env;
                html += `
                                        <td style="border: 1px solid #000; padding: 2px; text-align: right;">${env?.cc_tpe > 0 ? fmtDec(env.cc_tpe) : ''}</td>
                                        <td style="border: 1px solid #000; padding: 2px; text-align: right;">${env?.cc_Opera > 0 ? fmtDec(env.cc_Opera) : ''}</td>`;
            });
            html += `
                                    </tr>
                                </tbody>
                            </table>

                            <!-- TABLE 5 : OBJETS GARDÉS DANS LA CAISSE -->
                            <table style="width: 100%; border-collapse: collapse; margin-bottom: 6px; border: 1.5px solid #000;">
                                <thead>
                                    <tr style="background-color: #bfbfbf; font-weight: bold; text-align: center;">
                                        <th colspan="5" style="border: 1px solid #000; padding: 3px; font-size: 11px;">Objets gardés dans la caisse</th>
                                    </tr>
                                    <tr style="font-size: 9.5px; font-weight: bold; text-align: center;">
                                        <th style="border: 1px solid #000; padding: 3px; text-align: left; width: 140px; background-color: #f2f2f2;">Objets et quantités initiales :</th>
                                        <th style="border: 1px solid #000; background-color: #d9ead3; padding: 3px; width: 85px;">Passation nuit/matin</th>
                                        <th style="border: 1px solid #000; background-color: #fff2cc; padding: 3px; width: 85px;">Passation matin/soir</th>
                                        <th style="border: 1px solid #000; background-color: #cfe2f3; padding: 3px; width: 85px;">Passation soir/nuit</th>
                                        <th style="border: 1px solid #000; background-color: #fce5cd; padding: 3px; width: 85px;">Clôture</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style="border: 1px solid #000; padding: 2px 4px;">Clef : caisse</td>`;
            shiftKeys.forEach(sKey => {
                const hasClef = dayData[sKey]?.obj?.clef ?? 1;
                html += `<td style="border: 1px solid #000; padding: 2px; text-align: center;">${hasClef ? '1' : '-'}</td>`;
            });
            html += `
                                    </tr>
                                    <tr>
                                        <td style="border: 1px solid #000; padding: 2px 4px;">Passxxx : Réception</td>`;
            shiftKeys.forEach(sKey => {
                const hasPass = dayData[sKey]?.obj?.pass ?? 1;
                html += `<td style="border: 1px solid #000; padding: 2px; text-align: center;">${hasPass ? '1' : '-'}</td>`;
            });
            html += `
                                    </tr>
                                    <tr>
                                        <td style="border: 1px solid #000; padding: 2px 4px;">Portable d'urgence (chargé)</td>`;
            shiftKeys.forEach(sKey => {
                const hasPort = dayData[sKey]?.obj?.portable ?? 1;
                html += `<td style="border: 1px solid #000; padding: 2px; text-align: center;">${hasPort ? '1' : '-'}</td>`;
            });
            html += `
                                    </tr>
                                    <tr>
                                        <td style="border: 1px solid #000; padding: 2px 4px;">Autres :</td>`;
            shiftKeys.forEach(sKey => {
                const aut = dayData[sKey]?.obj?.autres || '';
                html += `<td style="border: 1px solid #000; padding: 2px; text-align: center; font-size: 8.5px;">${escapeHtml(aut)}</td>`;
            });
            html += `
                                    </tr>
                                </tbody>
                            </table>

                            <!-- TABLE 6 : COMMENTAIRES DE PASSATION -->
                            <table style="width: 100%; border-collapse: collapse; margin-bottom: 6px; border: 1.5px solid #000;">
                                <tr>
                                    <td style="width: 95px; border: 1px solid #000; background-color: #f2f2f2; font-weight: bold; padding: 4px; font-size: 10px; vertical-align: top;">Commentaires :</td>
                                    <td style="border: 1px solid #000; padding: 4px 6px; min-height: 40px; height: 40px; vertical-align: top; font-size: 9.5px; background-color: #ffffff;">
                                        ${escapeHtml(currentData.comments || '')}
                                    </td>
                                </tr>
                            </table>

                            <!-- TABLE 7 : SIGNATURES D'AUDIT AVEC HORODATAGE ET NOM DU RÉCEPTIONNISTE -->
                            <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #000;">
                                <tr style="background-color: #bfbfbf; font-weight: bold; text-align: center; font-size: 10px;">
                                    <th style="border: 1px solid #000; padding: 3px; width: 95px;">SIGNATURES</th>
                                    <th style="border: 1px solid #000; padding: 3px; background-color: #d9ead3;">Passation nuit/matin</th>
                                    <th style="border: 1px solid #000; padding: 3px; background-color: #fff2cc;">Passation matin/soir</th>
                                    <th style="border: 1px solid #000; padding: 3px; background-color: #cfe2f3;">Passation soir/nuit</th>
                                    <th style="border: 1px solid #000; padding: 3px; background-color: #fce5cd;">Clôture</th>
                                </tr>
                                <tr style="height: 48px; text-align: center; vertical-align: middle;">
                                    <td style="border: 1px solid #000; background-color: #fafafa; font-size: 9px; font-weight: bold; color: #555;">Desk Réception</td>`;

            shiftKeys.forEach(sKey => {
                const sData = dayData[sKey];
                if (sData && sData.receptionist) {
                    html += `
                                    <td style="border: 1px solid #000; padding: 4px; font-size: 9.5px;">
                                        <div style="font-weight: bold; color: #000;">${escapeHtml(sData.receptionist)}</div>
                                        <div style="font-size: 8.5px; color: #555; margin-top: 2px;">${dateStr} à ${timeStr}</div>
                                    </td>`;
                } else {
                    html += `
                                    <td style="border: 1px solid #000; padding: 4px; color: #aaa; font-style: italic; font-size: 9px;">-</td>`;
                }
            });

            html += `
                                </tr>
                            </table>

                        </td>
                    </tr>
                </table>

            </div>`;

            return html;
        }

        // Prévisualisation de la feuille d'audit
        function previewCaisseSheet() {
            const container = document.getElementById('caisse-audit-preview-body');
            const modal = document.getElementById('caisse-preview-modal');
            if (container) {
                container.innerHTML = generateCaisseAuditHTML();
            }
            if (modal) {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            }
        }

        function closeCaissePreviewModal() {
            const modal = document.getElementById('caisse-preview-modal');
            if (modal) {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }
        }

        // Export PDF Officiel via html2pdf (même fonctionnement direct que les checklists)
        function exportCaissePDF() {
            const dateObj = new Date();
            const dateStr = dateObj.toLocaleDateString('fr-FR');
            const dateFileSafe = dateStr.split('/').join('-');
            const shiftFileSafe = String(caisseActiveShift).split('-').join('_');

            const printDiv = document.createElement('div');
            printDiv.style.width = '1040px';
            printDiv.style.margin = '0 auto';
            printDiv.style.padding = '0';
            printDiv.style.backgroundColor = '#ffffff';
            printDiv.innerHTML = generateCaisseAuditHTML();

            const opt = {
                margin: [4, 4, 4, 4],
                filename: 'Feuille_Passation_Caisse_H9297_' + shiftFileSafe + '_' + dateFileSafe + '.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, logging: false },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
            };

            showToast("📥 Téléchargement du PDF en cours...", "info");

            if (typeof html2pdf !== 'undefined') {
                html2pdf().set(opt).from(printDiv).save().then(() => {
                    showToast("✅ Feuille de Caisse téléchargée avec succès !", "success");
                }).catch(err => {
                    console.error(err);
                    showToast("❌ Erreur lors de l'export PDF", "error");
                });
            } else {
                showToast("❌ Module PDF non disponible", "error");
            }
        }

        // Impression directe via fenêtre pop-up
        function printCaisseAudit() {
            const html = generateCaisseAuditHTML();
            const printWin = window.open('', '_blank', 'width=1100,height=800');
            if (!printWin) {
                showToast("❌ Veuillez autoriser les fenêtres pop-up pour l'impression", "error");
                return;
            }
            printWin.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Feuille de Passation du Fond de Caisse - H9297</title>
                    <style>
                        @page { size: A4 landscape; margin: 5mm; }
                        body { margin: 0; padding: 0; background: #fff; font-family: Calibri, Arial, sans-serif; }
                        @media print {
                            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                        }
                    </style>
                </head>
                <body>
                    ${html}
                    <script>
                        window.onload = function() {
                            setTimeout(function() {
                                window.print();
                                window.close();
                            }, 400);
                        };
                    <\/script>
                </body>
                </html>
            `);
            printWin.document.close();
        }

        // Export Excel officiel natif (.xlsx) via SheetJS
        function exportCaisseExcel() {
            if (typeof XLSX === 'undefined') {
                showToast("❌ Bibliothèque Excel non chargée", "error");
                return;
            }

            const currentData = getCaisseCurrentValues();
            const now = new Date();
            const caisseDateFullFr = now.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            const dateStr = now.toLocaleDateString('fr-FR');
            const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

            let dayData = {};
            try {
                const dayKey = 'sofia_caisse_' + now.toISOString().slice(0, 10);
                dayData = JSON.parse(localStorage.getItem(dayKey)) || {};
            } catch (e) { }
            dayData[currentData.shift] = currentData;

            const shiftKeys = ['nuit-matin', 'matin-soir', 'soir-nuit', 'cloture'];

            const getB = (sKey, bKey) => dayData[sKey]?.b?.[bKey] || 0;
            const getP = (sKey, pKey) => dayData[sKey]?.p?.[pKey] || 0;

            const rows = [
                ["ADAGIO APARTHOTEL", "", "", "", "Réception - H9297 : Feuille de passation du fond de caisse"],
                [""],
                ["Date du jour :", caisseDateFullFr, "", "Fonds de caisse initial :", 250, "€", "Visa de la direction :", ""],
                [""],
                ["", "", "Passation nuit/matin", "", "Passation matin/soir", "", "Passation soir/nuit", "", "Clôture", ""],
                ["BILLETS", "Coupure", "Nombre", "Total (€)", "Nombre", "Total (€)", "Nombre", "Total (€)", "Nombre", "Total (€)"],
                ["", "500 €", getB('nuit-matin', 'b500'), getB('nuit-matin', 'b500') * 500, getB('matin-soir', 'b500'), getB('matin-soir', 'b500') * 500, getB('soir-nuit', 'b500'), getB('soir-nuit', 'b500') * 500, getB('cloture', 'b500'), getB('cloture', 'b500') * 500],
                ["", "200 €", getB('nuit-matin', 'b200'), getB('nuit-matin', 'b200') * 200, getB('matin-soir', 'b200'), getB('matin-soir', 'b200') * 200, getB('soir-nuit', 'b200'), getB('soir-nuit', 'b200') * 200, getB('cloture', 'b200'), getB('cloture', 'b200') * 200],
                ["", "100 €", getB('nuit-matin', 'b100'), getB('nuit-matin', 'b100') * 100, getB('matin-soir', 'b100'), getB('matin-soir', 'b100') * 100, getB('soir-nuit', 'b100'), getB('soir-nuit', 'b100') * 100, getB('cloture', 'b100'), getB('cloture', 'b100') * 100],
                ["", "50 €", getB('nuit-matin', 'b50'), getB('nuit-matin', 'b50') * 50, getB('matin-soir', 'b50'), getB('matin-soir', 'b50') * 50, getB('soir-nuit', 'b50'), getB('soir-nuit', 'b50') * 50, getB('cloture', 'b50'), getB('cloture', 'b50') * 50],
                ["", "20 €", getB('nuit-matin', 'b20'), getB('nuit-matin', 'b20') * 20, getB('matin-soir', 'b20'), getB('matin-soir', 'b20') * 20, getB('soir-nuit', 'b20'), getB('soir-nuit', 'b20') * 20, getB('cloture', 'b20'), getB('cloture', 'b20') * 20],
                ["", "10 €", getB('nuit-matin', 'b10'), getB('nuit-matin', 'b10') * 10, getB('matin-soir', 'b10'), getB('matin-soir', 'b10') * 10, getB('soir-nuit', 'b10'), getB('soir-nuit', 'b10') * 10, getB('cloture', 'b10'), getB('cloture', 'b10') * 10],
                ["", "5 €", getB('nuit-matin', 'b5'), getB('nuit-matin', 'b5') * 5, getB('matin-soir', 'b5'), getB('matin-soir', 'b5') * 5, getB('soir-nuit', 'b5'), getB('soir-nuit', 'b5') * 5, getB('cloture', 'b5'), getB('cloture', 'b5') * 5],
                ["Total billets (1)", "", "", dayData['nuit-matin']?.totBillets || 0, "", dayData['matin-soir']?.totBillets || 0, "", dayData['soir-nuit']?.totBillets || 0, "", dayData['cloture']?.totBillets || 0],
                [""],
                ["PIÈCES", "Coupure", "Nombre", "Total (€)", "Nombre", "Total (€)", "Nombre", "Total (€)", "Nombre", "Total (€)"],
                ["", "2,00 €", getP('nuit-matin', 'p2e'), getP('nuit-matin', 'p2e') * 2, getP('matin-soir', 'p2e'), getP('matin-soir', 'p2e') * 2, getP('soir-nuit', 'p2e'), getP('soir-nuit', 'p2e') * 2, getP('cloture', 'p2e'), getP('cloture', 'p2e') * 2],
                ["", "1,00 €", getP('nuit-matin', 'p1e'), getP('nuit-matin', 'p1e') * 1, getP('matin-soir', 'p1e'), getP('matin-soir', 'p1e') * 1, getP('soir-nuit', 'p1e'), getP('soir-nuit', 'p1e') * 1, getP('cloture', 'p1e'), getP('cloture', 'p1e') * 1],
                ["", "0,50 €", getP('nuit-matin', 'p50c'), getP('nuit-matin', 'p50c') * 0.5, getP('matin-soir', 'p50c'), getP('matin-soir', 'p50c') * 0.5, getP('soir-nuit', 'p50c'), getP('soir-nuit', 'p50c') * 0.5, getP('cloture', 'p50c'), getP('cloture', 'p50c') * 0.5],
                ["", "0,20 €", getP('nuit-matin', 'p20c'), getP('nuit-matin', 'p20c') * 0.2, getP('matin-soir', 'p20c'), getP('matin-soir', 'p20c') * 0.2, getP('soir-nuit', 'p20c'), getP('soir-nuit', 'p20c') * 0.2, getP('cloture', 'p20c'), getP('cloture', 'p20c') * 0.2],
                ["", "0,10 €", getP('nuit-matin', 'p10c'), getP('nuit-matin', 'p10c') * 0.1, getP('matin-soir', 'p10c'), getP('matin-soir', 'p10c') * 0.1, getP('soir-nuit', 'p10c'), getP('soir-nuit', 'p10c') * 0.1, getP('cloture', 'p10c'), getP('cloture', 'p10c') * 0.1],
                ["", "0,05 €", getP('nuit-matin', 'p5c'), getP('nuit-matin', 'p5c') * 0.05, getP('matin-soir', 'p5c'), getP('matin-soir', 'p5c') * 0.05, getP('soir-nuit', 'p5c'), getP('soir-nuit', 'p5c') * 0.05, getP('cloture', 'p5c'), getP('cloture', 'p5c') * 0.05],
                ["", "0,02 €", getP('nuit-matin', 'p2c'), getP('nuit-matin', 'p2c') * 0.02, getP('matin-soir', 'p2c'), getP('matin-soir', 'p2c') * 0.02, getP('soir-nuit', 'p2c'), getP('soir-nuit', 'p2c') * 0.02, getP('cloture', 'p2c'), getP('cloture', 'p2c') * 0.02],
                ["", "0,01 €", getP('nuit-matin', 'p1c'), getP('nuit-matin', 'p1c') * 0.01, getP('matin-soir', 'p1c'), getP('matin-soir', 'p1c') * 0.01, getP('soir-nuit', 'p1c'), getP('soir-nuit', 'p1c') * 0.01, getP('cloture', 'p1c'), getP('cloture', 'p1c') * 0.01],
                ["Total pièces (2)", "", "", dayData['nuit-matin']?.totPieces || 0, "", dayData['matin-soir']?.totPieces || 0, "", dayData['soir-nuit']?.totPieces || 0, "", dayData['cloture']?.totPieces || 0],
                ["Total bons dépenses (3)", "", "", dayData['nuit-matin']?.debours || 0, "", dayData['matin-soir']?.debours || 0, "", dayData['soir-nuit']?.debours || 0, "", dayData['cloture']?.debours || 0],
                ["Total Caisse (1+2+3)", "", "", dayData['nuit-matin']?.totalCaisse || 0, "", dayData['matin-soir']?.totalCaisse || 0, "", dayData['soir-nuit']?.totalCaisse || 0, "", dayData['cloture']?.totalCaisse || 0],
                ["Montant encaissements espèces Opera (B)", "", "", dayData['nuit-matin']?.Opera || 0, "", dayData['matin-soir']?.Opera || 0, "", dayData['soir-nuit']?.Opera || 0, "", dayData['cloture']?.Opera || 0],
                ["Montant fonds de caisse (A) - (B)", "", "", dayData['nuit-matin']?.fondsNet || 250, "", dayData['matin-soir']?.fondsNet || 250, "", dayData['soir-nuit']?.fondsNet || 250, "", dayData['cloture']?.fondsNet || 250],
                [""],
                ["SIGNATURES", "", "", dayData['nuit-matin']?.receptionist || "-", "", dayData['matin-soir']?.receptionist || "-", "", dayData['soir-nuit']?.receptionist || "-", "", dayData['cloture']?.receptionist || "-"]
            ];

            const ws = XLSX.utils.aoa_to_sheet(rows);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Fond de Caisse H9297");

            const dateFileSafe = now.toISOString().slice(0, 10);
            XLSX.writeFile(wb, `Feuille_Passation_Caisse_H9297_${dateFileSafe}.xlsx`);
            showToast("✅ Fichier Excel (.xlsx) téléchargé avec succès !", "success");
        }

        /* ==========================================================================
           MODULE 9 : DÉLOGEMENT INTER-HÔTELS ADAGIO / WALK-OUT (OPERA CLOUD)
           Génération & Impression Formulaire PDF Conforme Audit Adagio
           ========================================================================== */

        function getDelogementFormValues(fromForm) {
            const todayStr = new Date().toISOString().slice(0, 10);
            if (!fromForm) {
                return {
                    emetteurNom: 'Aparthotel Adagio ……………………..',
                    emetteurAdresse: '…………………………………………..',
                    emetteurTel: '……………………..',
                    emetteurMail: 'h........@adagio-city.com',
                    emetteurContact: '…………………………………………..',
                    recepteurNom: 'ADAGIO ……………………..',
                    recepteurAdresse: '…………………………………………..',
                    recepteurTel: '……………………..',
                    recepteurMail: 'h........@adagio-city.com',
                    recepteurContact: '…………………………………………..',
                    clientNom: '…………………………………………..',
                    numResa: '…………………………………………..',
                    dateDelog: todayStr,
                    dateArrivee: todayStr,
                    dateDepart: '……………………..',
                    nbNuits: '……………………..',
                    nbPax: '……………………..',
                    typo: '…………………………………………..',
                    pecChambreClient: false,
                    pecChambreHotel: false,
                    pecPdjClient: false,
                    pecPdjHotel: false,
                    pecTaxiAllerEmetteur: false,
                    pecTaxiAllerReceveur: false,
                    pecTaxiRetourEmetteur: false,
                    pecTaxiRetourReceveur: false,
                    raison: '…………………………………………..',
                    reaction: '…………………………………………..',
                    commentaires: '…………………………………………..'
                };
            }

            const getVal = (id, fallback = '') => {
                const el = document.getElementById(id);
                return el && el.value.trim() !== '' ? el.value.trim() : fallback;
            };

            const getRadio = (name, targetVal) => {
                const checkedEl = document.querySelector(`input[name="${name}"]:checked`);
                return checkedEl ? checkedEl.value === targetVal : false;
            };

            return {
                emetteurNom: getVal('delog_site_emetteur_nom', 'Aparthotel Adagio Paris Centre Tour Eiffel (H3789)'),
                emetteurAdresse: getVal('delog_site_emetteur_adresse', '14 Rue du Théâtre, 75015 Paris'),
                emetteurTel: getVal('delog_site_emetteur_tel', '01 53 95 60 00'),
                emetteurMail: getVal('delog_site_emetteur_mail', 'h3789@adagio-city.com'),
                emetteurContact: getVal('delog_site_emetteur_contact', 'Alexandre V. (Duty Manager)'),

                recepteurNom: getVal('delog_site_recepteur_nom', 'Aparthotel Adagio Paris Montmartre (H5678)'),
                recepteurAdresse: getVal('delog_site_recepteur_adresse', '10 Place Baudiquey, 75018 Paris'),
                recepteurTel: getVal('delog_site_recepteur_tel', '01 42 57 10 00'),
                recepteurMail: getVal('delog_site_recepteur_mail', 'h5678@adagio-city.com'),
                recepteurContact: getVal('delog_site_recepteur_contact', 'Sophie M. (Chef de Réception)'),

                clientNom: getVal('delog_client_nom', 'Client à renseigner'),
                numResa: getVal('delog_num_resa', 'Opera-Cloud'),
                dateDelog: getVal('delog_date_delogement', todayStr),
                dateArrivee: getVal('delog_date_arrivee', todayStr),
                dateDepart: getVal('delog_date_depart', todayStr),
                nbNuits: getVal('delog_nb_nuits', '1'),
                nbPax: getVal('delog_nb_pax', '2'),
                typo: getVal('delog_typo', 'Studio Standard'),

                pecChambreClient: getRadio('delog_pec_chambre', 'CLIENT'),
                pecChambreHotel: getRadio('delog_pec_chambre', 'HÔTEL'),
                pecPdjClient: getRadio('delog_pec_pdj', 'CLIENT'),
                pecPdjHotel: getRadio('delog_pec_pdj', 'HÔTEL'),
                pecTaxiAllerEmetteur: getRadio('delog_pec_taxi_aller', 'HÔTEL ÉMETTEUR'),
                pecTaxiAllerReceveur: getRadio('delog_pec_taxi_aller', 'HÔTEL RECEVEUR'),
                pecTaxiRetourEmetteur: getRadio('delog_pec_taxi_retour', 'HÔTEL ÉMETTEUR'),
                pecTaxiRetourReceveur: getRadio('delog_pec_taxi_retour', 'HÔTEL RECEVEUR'),

                raison: getVal('delog_raison', 'Panne technique / Relogement établissement réseau'),
                reaction: getVal('delog_reaction', 'Client informé et compréhensif'),
                commentaires: getVal('delog_commentaires', 'Procédure Opera Cloud exécutée - Prise en charge taxi desk')
            };
        }

        // 1. Téléchargement direct du PDF officiel vierge d'audit Adagio (authentique 1:1)
        function downloadFormulaireViergePDF() {
            try {
                if (typeof window !== 'undefined' && window.OFFICIAL_DELOGEMENT_PDF_B64) {
                    const byteCharacters = atob(window.OFFICIAL_DELOGEMENT_PDF_B64);
                    const byteNumbers = new Uint8Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const blob = new Blob([byteNumbers], { type: 'application/pdf' });
                    const blobUrl = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = blobUrl;
                    a.download = 'FORMULAIRE_DE_DELOGEMENT_ADAGIO_OFFICIEL.pdf';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
                    if (typeof showToast === 'function') {
                        showToast("✅ Téléchargement du formulaire officiel vierge réussi !", "success");
                    }
                    return;
                }

                // Secours fichier local
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = 'FORMULAIRE_DE_DELOGEMENT_ADAGIO_OFFICIEL.pdf';
                a.download = 'FORMULAIRE_DE_DELOGEMENT_ADAGIO_OFFICIEL.pdf';
                a.target = '_blank';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                if (typeof showToast === 'function') {
                    showToast("✅ Téléchargement du formulaire officiel vierge lancé !", "success");
                }
            } catch (err) {
                console.error("Erreur téléchargement formulaire vierge:", err);
                window.open('FORMULAIRE_DE_DELOGEMENT_ADAGIO_OFFICIEL.pdf', '_blank');
            }
        }

        // 2. Générateur de l'HTML officiel 100% fidèle au PDF d'audit Adagio
        function generateDelogementOfficialHTML(fromForm) {
            const data = getDelogementFormValues(fromForm);

            const logoHtml = (typeof window !== 'undefined' && window.ADAGIO_LOGO_SRC)
                ? `<img src="${window.ADAGIO_LOGO_SRC}" style="height: 48px; max-width: 175px; object-fit: contain; margin: 0 auto; display: block;" alt="ADAGIO APARTHOTEL" />`
                : `<div style="text-align: center; line-height: 1.1; margin-bottom: 2px;">
                       <div style="font-size: 26pt; font-weight: 900; color: #d40e53; letter-spacing: 2px; font-family: Arial, sans-serif;">ADAGIO</div>
                       <div style="font-size: 8.5pt; font-weight: bold; color: #111827; letter-spacing: 4px; margin-top: 1px; font-family: Arial, sans-serif;">APARTHOTEL</div>
                   </div>`;

            const cleanSite = (name) => {
                if (!name || name.includes('…')) return '……………………..';
                return name.replace(/^(aparthotel\s+adagio|adagio)\s+/i, '').trim();
            };

            const formatDate = (val) => {
                if (!val || val.includes('…')) return '……………………..';
                if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
                    const p = val.split('-');
                    return `${p[2]}/${p[1]}/${p[0]}`;
                }
                return val;
            };

            const escapeStr = (str) => {
                if (!str) return '';
                return String(str)
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;');
            };

            // Valeurs émetteur
            const emetteurNom = (fromForm && data.emetteurNom) ? escapeStr(cleanSite(data.emetteurNom)) : '……………………..';
            const emetteurAdresse = (fromForm && data.emetteurAdresse) ? escapeStr(data.emetteurAdresse) : '……………………..';
            const emetteurTel = (fromForm && data.emetteurTel) ? escapeStr(data.emetteurTel) : '……………………..';
            const emetteurMail = (fromForm && data.emetteurMail) ? escapeStr(data.emetteurMail) : 'h........@adagio-city.com';
            const emetteurContact = (fromForm && data.emetteurContact) ? escapeStr(data.emetteurContact) : '……………………..';

            // Valeurs récepteur
            const recepteurNom = (fromForm && data.recepteurNom) ? escapeStr(cleanSite(data.recepteurNom)) : '……………………..';
            const recepteurAdresse = (fromForm && data.recepteurAdresse) ? escapeStr(data.recepteurAdresse) : '……………………..';
            const recepteurTel = (fromForm && data.recepteurTel) ? escapeStr(data.recepteurTel) : '……………………..';
            const recepteurMail = (fromForm && data.recepteurMail) ? escapeStr(data.recepteurMail) : 'h........@adagio-city.com';
            const recepteurContact = (fromForm && data.recepteurContact) ? escapeStr(data.recepteurContact) : '……………………..';

            // Informations client
            const valDateDelog = (fromForm && data.dateDelog) ? formatDate(data.dateDelog) : '……………………..';
            const valDateArrivee = (fromForm && data.dateArrivee) ? formatDate(data.dateArrivee) : '……………………..';
            const valDateDepart = (fromForm && data.dateDepart) ? formatDate(data.dateDepart) : '……………………..';
            const valNbNuits = (fromForm && data.nbNuits) ? escapeStr(data.nbNuits) : '……………………..';
            const valTypo = (fromForm && data.typo) ? escapeStr(data.typo) : '……………………..';
            const valNbPax = (fromForm && data.nbPax) ? escapeStr(data.nbPax) : '……………………..';

            let valClientNom = (fromForm && data.clientNom && data.clientNom !== 'Client à renseigner')
                ? escapeStr(data.clientNom)
                : '……………………..';
            if (fromForm && data.numResa && data.numResa !== 'Opera-Cloud' && !data.numResa.includes('…')) {
                valClientNom += `<br /><span style="font-size: 9pt; font-weight: normal; color: #374151;">(N&deg; R&eacute;sa Op&eacute;ra : <strong>${escapeStr(data.numResa)}</strong>)</span>`;
            }

            // Prise en charge
            const renderMark = (checked) => (fromForm && checked)
                ? '<strong style="font-size: 13pt; line-height: 1; display: inline-block;">X</strong>'
                : '&nbsp;';

            const boxChambreClient = renderMark(data.pecChambreClient);
            const boxChambreHotel = renderMark(data.pecChambreHotel);
            const boxPdjClient = renderMark(data.pecPdjClient);
            const boxPdjHotel = renderMark(data.pecPdjHotel);

            const boxTaxiAllerEmetteur = renderMark(data.pecTaxiAllerEmetteur);
            const boxTaxiAllerReceveur = renderMark(data.pecTaxiAllerReceveur);
            const boxTaxiRetourEmetteur = renderMark(data.pecTaxiRetourEmetteur);
            const boxTaxiRetourReceveur = renderMark(data.pecTaxiRetourReceveur);

            // Commentaires
            let commentsHtml = '';
            if (fromForm) {
                const commentLines = [];
                if (data.raison && !data.raison.includes('…')) {
                    commentLines.push(`<div><strong>Raison du d&eacute;logement :</strong> ${escapeStr(data.raison)}</div>`);
                }
                if (data.reaction && !data.reaction.includes('…')) {
                    commentLines.push(`<div style="margin-top: 4px;"><strong>R&eacute;action du client :</strong> ${escapeStr(data.reaction)}</div>`);
                }
                if (data.commentaires && !data.commentaires.includes('…')) {
                    commentLines.push(`<div style="margin-top: 4px;"><strong>Commentaires plus pr&eacute;cis :</strong> ${escapeStr(data.commentaires)}</div>`);
                }
                if (commentLines.length > 0) {
                    commentsHtml = `
                    <div style="font-size: 10.5pt; line-height: 1.5; margin-top: 8px; color: #000000; font-family: Arial, sans-serif;">
                        ${commentLines.join('')}
                        <div style="font-size: 11pt; line-height: 2; margin-top: 6px; color: #555555;">
                            ……………………………………………………………………………………………………………………………………………………………………………………
                        </div>
                    </div>`;
                }
            }

            if (!commentsHtml) {
                commentsHtml = `
                <div style="font-size: 11pt; line-height: 2.1; margin-top: 8px; color: #000000; font-family: Arial, sans-serif;">
                    <div>……………………..</div>
                    <div>……………………..</div>
                </div>`;
            }

            return `
            <div style="width: 100%; max-width: 794px; min-height: 1050px; margin: 0 auto; padding: 36px 48px; font-family: Arial, Helvetica, sans-serif; color: #000000; background-color: #ffffff; font-size: 11pt; line-height: 1.4; box-sizing: border-box; text-align: left;">
                
                <!-- LOGO ADAGIO APARTHOTEL (CENTRÉ) -->
                <div style="text-align: center; margin-bottom: 20px;">
                    ${logoHtml}
                </div>

                <!-- TITRE OFFICIEL CENTRÉ, GRAS, SOULIGNÉ -->
                <div style="text-align: center; margin-bottom: 24px;">
                    <span style="font-size: 15.5pt; font-weight: bold; text-decoration: underline; letter-spacing: 0.5px; text-transform: uppercase;">
                        FORMULAIRE DE D&Eacute;LOGEMENT
                    </span>
                </div>

                <!-- COORDONNÉES SITE ÉMETTEUR -->
                <div style="margin-bottom: 20px;">
                    <div style="font-weight: bold; font-size: 11pt; margin-bottom: 4px;">
                        Coordonn&eacute;es du site &eacute;metteur du d&eacute;logement :
                    </div>
                    <div style="font-size: 11pt; line-height: 1.45;">
                        <div>(Entit&eacute; juridique du site &agrave; renseigner) ……………………..</div>
                        <div>(Nom du site &agrave; renseigner) ADAGIO ${emetteurNom}</div>
                        <div>(Adresse du site &agrave; renseigner) ${emetteurAdresse}</div>
                        <div>T&eacute;l : ${emetteurTel} &ndash; Mail : ${emetteurMail}</div>
                        <div>Nom du contact site en charge du dossier : ${emetteurContact}</div>
                    </div>
                </div>

                <!-- COORDONNÉES SITE RÉCEPTEUR -->
                <div style="margin-bottom: 22px;">
                    <div style="font-weight: bold; font-size: 11pt; margin-bottom: 4px;">
                        Coordonn&eacute;es du site r&eacute;cepteur du d&eacute;logement :
                    </div>
                    <div style="font-size: 11pt; line-height: 1.45;">
                        <div>(Entit&eacute; juridique du site &agrave; renseigner) ……………………..</div>
                        <div>(Nom du site &agrave; renseigner) ADAGIO ${recepteurNom}</div>
                        <div>(Adresse du site &agrave; renseigner) ${recepteurAdresse}</div>
                        <div>T&eacute;l : ${recepteurTel} &ndash; Mail : ${recepteurMail}</div>
                        <div>Nom du contact site en charge du dossier : ${recepteurContact}</div>
                    </div>
                </div>

                <!-- INFORMATIONS CLIENT : -->
                <div style="margin-bottom: 22px;">
                    <div style="font-weight: bold; font-size: 11pt; text-decoration: underline; margin-bottom: 6px;">
                        INFORMATIONS CLIENT :
                    </div>
                    <table style="width: 100%; border-collapse: collapse; border: 1px solid #000000; font-size: 10.5pt; line-height: 1.35; font-family: Arial, sans-serif;">
                        <tr>
                            <td style="width: 44%; border: 1px solid #000000; padding: 4px 6px; vertical-align: top;">
                                <strong>DATE DU DELOGEMENT :</strong> ${valDateDelog}
                            </td>
                            <td style="width: 56%; border: 1px solid #000000; padding: 4px 6px; vertical-align: top;">
                                <strong>DATE D&rsquo;ARRIV&Eacute;E :</strong> ${valDateArrivee}
                            </td>
                        </tr>
                        <tr>
                            <td rowspan="4" style="border: 1px solid #000000; padding: 4px 6px; vertical-align: top;">
                                <strong>NOM DU CLIENT :</strong> ${valClientNom}
                            </td>
                            <td style="border: 1px solid #000000; padding: 4px 6px; vertical-align: top;">
                                <strong>DATE DE D&Eacute;PART :</strong> ${valDateDepart}
                            </td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #000000; padding: 4px 6px; vertical-align: top;">
                                <strong>NOMBRE DE NUITS :</strong> ${valNbNuits}
                            </td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #000000; padding: 4px 6px; vertical-align: top;">
                                <strong>NOMBRE D&rsquo;APPARTEMENTS/ TYPO :</strong> ${valTypo}
                            </td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #000000; padding: 4px 6px; vertical-align: top;">
                                <strong>NOMBRE DE PERSONNES :</strong> ${valNbPax}
                            </td>
                        </tr>
                    </table>
                </div>

                <!-- PRISE EN CHARGE : -->
                <div style="margin-bottom: 22px;">
                    <div style="font-weight: bold; font-size: 11pt; text-decoration: underline; margin-bottom: 6px;">
                        PRISE EN CHARGE :
                    </div>

                    <!-- TABLE 1 : CLIENT / HÔTEL -->
                    <table style="width: 100%; border-collapse: collapse; border: 1px solid #000000; font-size: 10.5pt; margin-bottom: 12px; font-family: Arial, sans-serif;">
                        <tr>
                            <td style="width: 30%; border: 1px solid #000000; padding: 4px 6px;">&nbsp;</td>
                            <td style="width: 35%; border: 1px solid #000000; padding: 4px 6px; text-align: center;"><strong>CLIENT</strong></td>
                            <td style="width: 35%; border: 1px solid #000000; padding: 4px 6px; text-align: center;"><strong>H&Ocirc;TEL</strong></td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #000000; padding: 4px 6px;"><strong>CHAMBRE</strong></td>
                            <td style="border: 1px solid #000000; padding: 4px 6px; text-align: center; height: 20px;">${boxChambreClient}</td>
                            <td style="border: 1px solid #000000; padding: 4px 6px; text-align: center; height: 20px;">${boxChambreHotel}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #000000; padding: 4px 6px;"><strong>PDJ</strong></td>
                            <td style="border: 1px solid #000000; padding: 4px 6px; text-align: center; height: 20px;">${boxPdjClient}</td>
                            <td style="border: 1px solid #000000; padding: 4px 6px; text-align: center; height: 20px;">${boxPdjHotel}</td>
                        </tr>
                    </table>

                    <!-- TABLE 2 : HOTEL EMETTEUR / HOTEL RECEVEUR -->
                    <table style="width: 100%; border-collapse: collapse; border: 1px solid #000000; font-size: 10.5pt; font-family: Arial, sans-serif;">
                        <tr>
                            <td style="width: 30%; border: 1px solid #000000; padding: 4px 6px;">&nbsp;</td>
                            <td style="width: 35%; border: 1px solid #000000; padding: 4px 6px; text-align: center;"><strong>HOTEL EMETTEUR</strong></td>
                            <td style="width: 35%; border: 1px solid #000000; padding: 4px 6px; text-align: center;"><strong>HOTEL RECEVEUR</strong></td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #000000; padding: 4px 6px;"><strong>TAXI ALLER</strong></td>
                            <td style="border: 1px solid #000000; padding: 4px 6px; text-align: center; height: 20px;">${boxTaxiAllerEmetteur}</td>
                            <td style="border: 1px solid #000000; padding: 4px 6px; text-align: center; height: 20px;">${boxTaxiAllerReceveur}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #000000; padding: 4px 6px;"><strong>TAXI RETOUR</strong></td>
                            <td style="border: 1px solid #000000; padding: 4px 6px; text-align: center; height: 20px;">${boxTaxiRetourEmetteur}</td>
                            <td style="border: 1px solid #000000; padding: 4px 6px; text-align: center; height: 20px;">${boxTaxiRetourReceveur}</td>
                        </tr>
                    </table>
                </div>

                <!-- RAISON DU DELOGEMENT + RÉACTION DU CLIENT + COMMENTAIRES PLUS PRÉCIS : -->
                <div>
                    <div style="font-weight: bold; font-size: 10.5pt; text-decoration: underline; margin-bottom: 6px;">
                        RAISON DU DELOGEMENT + R&Eacute;ACTION DU CLIENT + COMMENTAIRES PLUS PR&Eacute;CIS :
                    </div>
                    ${commentsHtml}
                </div>

            </div>
            `;
        }

        // 3. Mise à jour de l'aperçu dynamique direct
        function updateDelogementLivePreview() {
            const previewEl = document.getElementById('delogement-preview-container');
            if (!previewEl) return;
            previewEl.innerHTML = generateDelogementOfficialHTML(true);
        }

        // 4. Télécharger le PDF (rempli depuis le formulaire ou vierge conforme au document officiel)
        function downloadFormulaireDelogementPDF(fromForm) {
            if (!fromForm) {
                downloadFormulaireViergePDF();
                return;
            }

            const data = getDelogementFormValues(true);
            const clientClean = (data.clientNom && !data.clientNom.includes('…') && data.clientNom !== 'Client à renseigner')
                ? data.clientNom.replace(/[^a-zA-Z0-9_-]/g, '_')
                : 'Rempli';

            const dateStr = new Date().toISOString().slice(0, 10);
            const filename = `FORMULAIRE_DELOGEMENT_ADAGIO_${clientClean}_${dateStr}.pdf`;

            const previewEl = document.getElementById('delogement-preview-container');
            const targetElement = (previewEl && previewEl.firstElementChild) ? previewEl.firstElementChild : null;

            if (typeof html2pdf !== 'undefined' && targetElement) {
                showToast("📥 Génération du formulaire officiel Adagio (PDF)...", "info");
                const opt = {
                    margin: [6, 8, 6, 8],
                    filename: filename,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true, logging: false },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                };

                html2pdf().set(opt).from(targetElement).save().then(() => {
                    showToast("✅ Formulaire de délogement officiel PDF téléchargé !", "success");
                }).catch(err => {
                    console.error("Erreur html2pdf:", err);
                    printDelogementForm();
                });
            } else {
                showToast("🖨️ Préparation pour impression / PDF...", "info");
                printDelogementForm();
            }
        }

        // 5. Impression directe du formulaire officiel conforme audit
        function printDelogementForm() {
            const html = generateDelogementOfficialHTML(true);
            const printWin = window.open('', '_blank', 'width=900,height=960');
            if (!printWin) {
                showToast("❌ Veuillez autoriser les fenêtres pop-up pour imprimer", "error");
                return;
            }
            printWin.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>Formulaire de Délogement - Adagio Aparthotel</title>
                    <style>
                        @page { size: A4 portrait; margin: 8mm 10mm 8mm 10mm; }
                        * { box-sizing: border-box; }
                        body { margin: 0; padding: 0; background: #fff; font-family: Arial, Helvetica, sans-serif; color: #000; }
                        table { border-collapse: collapse; }
                        @media print {
                            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                        }
                    </style>
                </head>
                <body>
                    ${html}
                    <script>
                        window.onload = function() {
                            setTimeout(function() {
                                window.print();
                            }, 300);
                        };
                    <\/script>
                </body>
                </html>
            `);
            printWin.document.close();
        }

        // 6. Pré-remplissage avec un cas type réaliste
        function fillDelogementSample() {
            const now = new Date();
            const todayStr = now.toISOString().slice(0, 10);
            const depDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

            const setVal = (id, val) => {
                const el = document.getElementById(id);
                if (el) el.value = val;
            };

            const setRadio = (name, val) => {
                const el = document.querySelector(`input[name="${name}"][value="${val}"]`);
                if (el) el.checked = true;
            };

            setVal('delog_site_emetteur_nom', 'Aparthotel Adagio Paris Centre Tour Eiffel (H3789)');
            setVal('delog_site_emetteur_adresse', '14 Rue du Théâtre, 75015 Paris');
            setVal('delog_site_emetteur_tel', '01 53 95 60 00');
            setVal('delog_site_emetteur_mail', 'h3789@adagio-city.com');
            setVal('delog_site_emetteur_contact', 'Alexandre V. (Duty Manager)');

            setVal('delog_site_recepteur_nom', 'Aparthotel Adagio Paris Montmartre (H5678)');
            setVal('delog_site_recepteur_adresse', '10 Place Baudiquey, 75018 Paris');
            setVal('delog_site_recepteur_tel', '01 42 57 10 00');
            setVal('delog_site_recepteur_mail', 'h5678@adagio-city.com');
            setVal('delog_site_recepteur_contact', 'Sophie M. (Chef de Réception)');

            setVal('delog_client_nom', 'DUPONT Jean');
            setVal('delog_num_resa', 'OP-489215');
            setVal('delog_date_delogement', todayStr);
            setVal('delog_date_arrivee', todayStr);
            setVal('delog_date_depart', depDate);
            setVal('delog_nb_nuits', '2');
            setVal('delog_nb_pax', '2');
            setVal('delog_typo', 'Studio Supérieur');

            setRadio('delog_pec_chambre', 'HÔTEL');
            setRadio('delog_pec_pdj', 'HÔTEL');
            setRadio('delog_pec_taxi_aller', 'HÔTEL ÉMETTEUR');
            setRadio('delog_pec_taxi_retour', 'HÔTEL ÉMETTEUR');

            setVal('delog_raison', 'Panne majeure de climatisation aile 3ème étage - Relogement réseau immédiat');
            setVal('delog_reaction', 'Client compréhensif et très satisfait de la prise en charge taxi G7 et surclassement');
            setVal('delog_commentaires', 'Client ALL Gold n° 308492019. Virement inter-sites négatif posté (360 €). Geste 1 500 points ALL.');

            updateDelogementLivePreview();
            showToast("✨ Cas type appliqué et aperçu actualisé", "info");
        }

        // 7. Réinitialiser le formulaire
        function resetDelogementForm() {
            const form = document.getElementById('form-delogement');
            if (form) form.reset();
            const todayStr = new Date().toISOString().slice(0, 10);
            const delogDate = document.getElementById('delog_date_delogement');
            const arrDate = document.getElementById('delog_date_arrivee');
            if (delogDate) delogDate.value = todayStr;
            if (arrDate) arrDate.value = todayStr;
            updateDelogementLivePreview();
            showToast("Formulaire délogement réinitialisé", "info");
        }

        /* ==========================================================================
           TÉLÉCHARGEMENT DE LA MATRICE ROOMING LIST OFFICIELLE (OPERA CLOUD)
           ========================================================================== */
        const EMBEDDED_ROOMING_B64 = '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
The above content was truncated because individual lines are very long. Only a portion of the content is shown.

        const EMBEDDED_ROOMING_B64 = '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';
        if (typeof window !== 'undefined' && !window.ROOMING_LIST_BASE64) {
            window.ROOMING_LIST_BASE64 = EMBEDDED_ROOMING_B64;
        }

        function getRoomingBlob() {
            try {
                const b64 = (typeof window !== 'undefined' && window.ROOMING_LIST_BASE64)
                    ? window.ROOMING_LIST_BASE64
                    : (typeof EMBEDDED_ROOMING_B64 !== 'undefined' ? EMBEDDED_ROOMING_B64 : null);
                if (!b64) return null;
                const cleanB64 = b64.replace(/\s+/g, '');
                const binaryStr = atob(cleanB64);
                const len = binaryStr.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    bytes[i] = binaryStr.charCodeAt(i);
                }
                return new Blob([bytes], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                });
            } catch (err) {
                console.error("Erreur génération blob matrice Rooming List:", err);
                return null;
            }
        }

        function triggerFileDownload(blobOrUrl, fileName) {
            const isBlob = typeof blobOrUrl !== 'string';
            const url = isBlob ? URL.createObjectURL(blobOrUrl) : blobOrUrl;
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = fileName;
            a.setAttribute('download', fileName);
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                if (a.parentNode) document.body.removeChild(a);
                if (isBlob) {
                    try { URL.revokeObjectURL(url); } catch (e) { }
                }
            }, 2000);
        }

        function downloadRoomingList(e) {
            if (e) {
                if (e.preventDefault) e.preventDefault();
                if (e.stopPropagation) e.stopPropagation();
            }
            const fileName = 'Rooming_List_FR_v2.xlsx';

            // 1. Déclenchement direct depuis le Blob mémoire base64 (instantané, 100% autonome en ligne et hors-ligne)
            try {
                const blob = getRoomingBlob();
                if (blob) {
                    triggerFileDownload(blob, fileName);
                    showToast("✅ Matrice Rooming List téléchargée avec succès !", "success");
                    return false;
                }
            } catch (err) {
                console.warn("Échec téléchargement via blob mémoire, tentative alternative...", err);
            }

            // 2. Repli serveur via fetch si servi en HTTP / HTTPS (ex: GitHub Pages)
            if (window.location.protocol.startsWith('http')) {
                fetch(fileName)
                    .then(res => {
                        if (!res.ok) throw new Error("Fichier non accessible (HTTP " + res.status + ")");
                        return res.blob();
                    })
                    .then(blob => {
                        triggerFileDownload(blob, fileName);
                        showToast("✅ Matrice Rooming List téléchargée avec succès !", "success");
                    })
                    .catch(fetchErr => {
                        console.warn("Fetch serveur échoué, repli navigation directe:", fetchErr);
                        triggerFileDownload(fileName, fileName);
                        showToast("✅ Matrice Rooming List téléchargée !", "success");
                    });
                return false;
            }

            // 3. Repli direct pour navigation standard
            triggerFileDownload(fileName, fileName);
            showToast("✅ Matrice Rooming List téléchargée !", "success");
            return false;
        }

        function calculateTax() {
            const adults = parseFloat(document.getElementById('tax-adults').value) || 0;
            const nights = parseFloat(document.getElementById('tax-nights').value) || 0;
            const total = adults * nights * 8.13;
            const res = document.getElementById('tax-result-total');
            if (res) res.innerText = total.toFixed(2) + ' €';
        }

        function calculateVAT() {
            const amount = parseFloat(document.getElementById('vat-amount').value) || 0;
            const mode = document.getElementById('vat-mode').value;
            const rate = parseFloat(document.getElementById('vat-rate').value) || 0;
            const cityTax = parseFloat(document.getElementById('vat-citytax').value) || 0;

            let ht = 0, tva = 0, ttc = 0;
            if (mode === 'ttc2ht') {
                ttc = amount;
                ht = ttc / (1 + rate);
                tva = ttc - ht;
            } else {
                ht = amount;
                tva = ht * rate;
                ttc = ht + tva;
            }

            const totalGlobal = ttc + cityTax;

            if (document.getElementById('vat-result-ht')) document.getElementById('vat-result-ht').innerText = ht.toFixed(2) + ' €';
            if (document.getElementById('vat-result-tva')) document.getElementById('vat-result-tva').innerText = tva.toFixed(2) + ' €';
            if (document.getElementById('vat-result-ttc')) document.getElementById('vat-result-ttc').innerText = ttc.toFixed(2) + ' €';
            if (document.getElementById('vat-result-total')) document.getElementById('vat-result-total').innerText = totalGlobal.toFixed(2) + ' €';
        }

        function calculateALLPoints() {
            const amount = parseFloat(document.getElementById('all-amount').value) || 0;
            const brand = document.getElementById('all-brand').value;
            const status = document.getElementById('all-status').value;

            let basePoints = (brand === 'adagio') ? (amount * 1) : (amount * 0.5);

            let multiplier = 1;
            if (status === 'silver') multiplier = 1.25;
            if (status === 'gold') multiplier = 1.50;
            if (status === 'platinum') multiplier = 1.75;
            if (status === 'diamond') multiplier = 2.00;

            let finalPoints = Math.round(basePoints * multiplier);
            let estimatedEuro = finalPoints * 0.02;

            if (document.getElementById('all-result-total')) document.getElementById('all-result-total').innerText = finalPoints.toLocaleString();
            if (document.getElementById('all-result-euro')) document.getElementById('all-result-euro').innerText = `≈ ${estimatedEuro.toFixed(2)} €`;
        }

        /* ==========================================================================
           MODULE SÉJOUR : CHECK-IN & MODIFICATION CLIENT IN
           ========================================================================== */

        function switchCheckinTab(tab) {
            const btnStandard = document.getElementById('tab-btn-checkin-standard');
            const btnModif = document.getElementById('tab-btn-checkin-modif');
            const secStandard = document.getElementById('sub-checkin-standard');
            const secModif = document.getElementById('sub-checkin-modif');

            if (!btnStandard || !btnModif || !secStandard || !secModif) return;

            if (tab === 'standard') {
                btnStandard.className = 'flex-1 p-4 rounded-2xl border-2 border-orange-500 bg-orange-50 dark:bg-orange-950/60 text-orange-900 dark:text-orange-200 font-black text-sm flex items-center justify-center gap-3 transition-all shadow-sm';
                const iconStandard = btnStandard.querySelector('div:first-child');
                if (iconStandard) iconStandard.className = 'w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center text-base shadow-sm';

                btnModif.className = 'flex-1 p-4 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 font-bold text-sm flex items-center justify-center gap-3 hover:border-orange-300 transition-all shadow-sm';
                const iconModif = btnModif.querySelector('div:first-child');
                if (iconModif) iconModif.className = 'w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 flex items-center justify-center text-base';

                secStandard.classList.remove('hidden');
                secModif.classList.add('hidden');
                if (typeof gsap !== 'undefined') {
                    gsap.fromTo(secStandard, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.25, ease: "expo.out" });
                }
            } else {
                btnModif.className = 'flex-1 p-4 rounded-2xl border-2 border-orange-500 bg-orange-50 dark:bg-orange-950/60 text-orange-900 dark:text-orange-200 font-black text-sm flex items-center justify-center gap-3 transition-all shadow-sm';
                const iconModif = btnModif.querySelector('div:first-child');
                if (iconModif) iconModif.className = 'w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center text-base shadow-sm';

                btnStandard.className = 'flex-1 p-4 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 font-bold text-sm flex items-center justify-center gap-3 hover:border-orange-300 transition-all shadow-sm';
                const iconStandard = btnStandard.querySelector('div:first-child');
                if (iconStandard) iconStandard.className = 'w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 flex items-center justify-center text-base';

                secModif.classList.remove('hidden');
                secStandard.classList.add('hidden');
                if (typeof gsap !== 'undefined') {
                    gsap.fromTo(secModif, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.25, ease: "expo.out" });
                }
            }
        }

        /* ==========================================================================
           MODULE 3 : PAIEMENTS ONLINE (PAY BY LINK & APOL)
           ========================================================================== */

        function switchOnlineTab(tab) {
            const btnPBL = document.getElementById('tab-btn-paybylink');
            const btnAPOL = document.getElementById('tab-btn-apol');
            const btnPVCP = document.getElementById('tab-btn-pvcp');
            const secPBL = document.getElementById('sub-paybylink');
            const secAPOL = document.getElementById('sub-apol');
            const secPVCP = document.getElementById('sub-pvcp');

            if (!btnPBL || !btnAPOL || !btnPVCP || !secPBL || !secAPOL || !secPVCP) return;

            const setInactive = (btn, sec) => {
                btn.className = 'p-4 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 font-bold text-sm flex items-center justify-start gap-3 hover:border-emerald-300 transition-all shadow-sm';
                const icon = btn.querySelector('div:first-child');
                if (icon) icon.className = 'w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 flex-shrink-0 flex items-center justify-center text-base';
                sec.classList.add('hidden');
            };

            const setActive = (btn, sec) => {
                btn.className = 'p-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-black text-sm flex items-center justify-start gap-3 transition-all shadow-sm';
                const icon = btn.querySelector('div:first-child');
                if (icon) icon.className = 'w-9 h-9 rounded-xl bg-emerald-500 text-white flex-shrink-0 flex items-center justify-center text-base shadow-sm';
                sec.classList.remove('hidden');
                if (typeof gsap !== 'undefined') {
                    gsap.fromTo(sec, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.25, ease: "expo.out" });
                }
            };

            setInactive(btnPBL, secPBL);
            setInactive(btnAPOL, secAPOL);
            setInactive(btnPVCP, secPVCP);

            if (tab === 'paybylink') {
                setActive(btnPBL, secPBL);
            } else if (tab === 'apol') {
                setActive(btnAPOL, secAPOL);
            } else if (tab === 'pvcp') {
                setActive(btnPVCP, secPVCP);
            }
        }

        /* ==========================================================================
           MODULE 10 : ENVIRONNEMENT TARS & SIMULATEUR INTERACTIF
           ========================================================================== */

        function selectTarsTool(toolId) {
            const buttons = document.querySelectorAll('.tars-tool-tab');
            buttons.forEach(btn => {
                btn.className = 'tars-tool-tab p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-bold text-xs flex flex-col items-center gap-1.5 hover:border-pink-300 transition-all shadow-sm';
            });

            if (window.event && window.event.currentTarget) {
                window.event.currentTarget.className = 'tars-tool-tab active p-3 rounded-xl border-2 border-pink-500 bg-pink-50 dark:bg-pink-950/50 text-pink-700 dark:text-pink-300 font-bold text-xs flex flex-col items-center gap-1.5 transition-all shadow-sm';
            }

            const contents = document.querySelectorAll('.tars-tool-content');
            contents.forEach(c => c.classList.add('hidden'));

            const target = document.getElementById('detail-' + toolId);
            if (target) {
                target.classList.remove('hidden');
                if (typeof gsap !== 'undefined') {
                    gsap.fromTo(target, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.25, ease: "expo.out" });
                }
            }
        }


        function calculateDecade() {
            const input = document.getElementById('decade-date-input').value;
            if (!input) return;
            const date = new Date(input);
            const day = date.getDate();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();

            let startDay, endDay;
            if (day <= 10) {
                startDay = '01'; endDay = '10';
            } else if (day <= 20) {
                startDay = '11'; endDay = '20';
            } else {
                startDay = '21';
                const lastDay = new Date(year, date.getMonth() + 1, 0).getDate();
                endDay = String(lastDay);
            }

            const startStr = `${startDay}/${month}/${year}`;
            const endStr = `${endDay}/${month}/${year}`;

            document.getElementById('decade-start').innerText = startStr;
            document.getElementById('decade-end').innerText = endStr;
            document.getElementById('decade-result').classList.remove('hidden');
        }

        let currentModulePrefix = null;
        let currentSubContentId = null;

        function getSubContentsList(modulePrefix) {
            const grid = document.getElementById('grid-' + modulePrefix);
            if (!grid) return [];
            const tiles = grid.querySelectorAll('[onclick^="showSubContent"]');
            const list = [];
            tiles.forEach(tile => {
                const match = tile.getAttribute('onclick').match(/showSubContent\(['"]([^'"]+)['"],\s*['"]([^'"]+)['"]\)/);
                if (match && match[1] === modulePrefix) list.push(match[2]);
            });
            return list;
        }

        function updateSubNavArrows(modulePrefix, contentId) {
            const list = getSubContentsList(modulePrefix);
            if (list.length === 0) return;
            const idx = list.indexOf(contentId);
            const contentDiv = document.getElementById('content-' + contentId);
            if (!contentDiv) return;

            const prevBtn = contentDiv.querySelector('.nav-prev-btn');
            const nextBtn = contentDiv.querySelector('.nav-next-btn');

            if (prevBtn) prevBtn.disabled = (idx <= 0);
            if (nextBtn) nextBtn.disabled = (idx >= list.length - 1 || idx === -1);
        }

        function navigateSub(direction) {
            if (!currentModulePrefix || !currentSubContentId) return;
            const list = getSubContentsList(currentModulePrefix);
            const idx = list.indexOf(currentSubContentId);
            if (idx !== -1) {
                const nextIdx = idx + direction;
                if (nextIdx >= 0 && nextIdx < list.length) {
                    const currentId = currentSubContentId;
                    const nextId = list[nextIdx];
                    const currentEl = document.getElementById('content-' + currentId);
                    const nextEl = document.getElementById('content-' + nextId);

                    if (typeof gsap !== 'undefined' && currentEl && nextEl) {
                        // Suppress CSS animation conflicts
                        currentEl.classList.remove('fade-in');
                        nextEl.classList.remove('fade-in');

                        const slideDistance = 40;
                        const outX = direction > 0 ? -slideDistance : slideDistance;
                        const inX = direction > 0 ? slideDistance : -slideDistance;

                        // Smooth slide out
                        gsap.to(currentEl, {
                            opacity: 0,
                            x: outX,
                            duration: 0.25,
                            ease: "power2.inOut",
                            onComplete: () => {
                                window.__skipGsapSub = true;
                                showSubContent(currentModulePrefix, nextId);
                                window.__skipGsapSub = false;

                                // Reset currentEl styles so it's fresh for next time
                                gsap.set(currentEl, { clearProps: "all" });

                                // Smooth slide in for new content
                                gsap.killTweensOf(nextEl);
                                nextEl.classList.remove('fade-in');
                                gsap.set(nextEl, { opacity: 0, x: inX });

                                gsap.to(nextEl, {
                                    opacity: 1,
                                    x: 0,
                                    duration: 0.35,
                                    ease: "expo.out",
                                    clearProps: "all"
                                });
                            }
                        });
                    } else {
                        showSubContent(currentModulePrefix, nextId);
                    }
                }
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            initRoomSync();
            renderConsignes();
            renderColis();
            if (typeof initCaisseShift === 'function') {
                initCaisseShift();
            } else {
                calculCaisse();
            }
            if (typeof gsap !== 'undefined') {
                gsap.fromTo('.search-item',
                    { opacity: 0, y: 15, scale: 0.98 },
                    { opacity: 1, y: 0, scale: 1, duration: 0.35, stagger: 0.03, ease: "expo.out" }
                );
            }

            // UI Enhancement: Déplacer "Retour à l'accueil" dans les grilles
            document.querySelectorAll('[id^="grid-"]').forEach(grid => {
                const btn = document.createElement('div');
                btn.className = 'col-span-full mb-2 pb-4 border-b border-gray-100 dark:border-slate-700 w-full';
                btn.innerHTML = `<button onclick="closeModules()" class="flex items-center text-slate-600 dark:text-slate-400 font-bold hover:underline transition-all hover:-translate-x-1"><i class="fas fa-arrow-left mr-2"></i> Retour à l'accueil</button>`;
                grid.insertBefore(btn, grid.firstChild);
            });

            // UI Enhancement: Injecter les flèches de navigation gauche/droite
            document.querySelectorAll('[onclick^="hideSubContent"]').forEach(btn => {
                if (btn.parentElement.classList.contains('sub-nav-wrapper')) return;

                const wrapper = document.createElement('div');
                wrapper.className = 'sub-nav-wrapper flex items-center flex-wrap gap-2 sm:gap-4';
                btn.parentNode.insertBefore(wrapper, btn);
                wrapper.appendChild(btn);

                const arrowsHTML = `
                    <div class="flex items-center gap-1 sm:border-l border-gray-200 dark:border-slate-700 sm:pl-4 sm:ml-2">
                        <button class="nav-prev-btn w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-slate-700 text-gray-500 hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed" title="Sous-module précédent" onclick="navigateSub(-1)">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <button class="nav-next-btn w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-slate-700 text-gray-500 hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed" title="Sous-module suivant" onclick="navigateSub(1)">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                `;
                wrapper.insertAdjacentHTML('beforeend', arrowsHTML);
            });
            
            // --- CMS : CHARGEMENT DYNAMIQUE DES PROCÉDURES DEPUIS FIREBASE ---
            if (typeof firebase !== 'undefined' && firebase.database) {
                const proceduresRef = firebase.database().ref('procedures');
                proceduresRef.on('value', snapshot => {
                    const data = snapshot.val();
                    if (!data) return;

                    // Group by category
                    const byCategory = {};
                    Object.keys(data).forEach(id => {
                        const proc = data[id];
                        if (!byCategory[proc.category]) byCategory[proc.category] = [];
                        byCategory[proc.category].push({ id, ...proc });
                    });

                    // For each category, rebuild the UI
                    Object.keys(byCategory).forEach(category => {
                        const grid = document.getElementById('grid-' + category);
                        const moduleContainer = document.getElementById('module-' + category);
                        
                        if (!grid || !moduleContainer) return;

                        // Retrieve the "Retour à l'accueil" button to preserve it
                        const backBtn = grid.querySelector('.col-span-full');

                        // Clear the grid tiles
                        grid.innerHTML = '';
                        if (backBtn) grid.appendChild(backBtn);

                        const contentWrapper = moduleContainer.querySelector('.border-t-0');

                        // Sort procedures by title for consistency
                        const procs = byCategory[category].sort((a, b) => a.title.localeCompare(b.title));

                        procs.forEach(proc => {
                            // 1. Create Tile
                            const tileHTML = `
                                <div onclick="showSubContent('${category}', '${proc.id}')"
                                    class="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer border border-gray-100 dark:border-slate-700 tile-hover group overflow-hidden relative">
                                    <div class="absolute inset-0 bg-gradient-to-br from-${proc.color}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div class="flex items-start justify-between relative z-10">
                                        <div class="w-14 h-14 rounded-2xl bg-${proc.color}-100 dark:bg-${proc.color}-900/50 text-${proc.color}-600 dark:text-${proc.color}-400 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                                            <i class="${proc.icon}"></i>
                                        </div>
                                        <span class="bg-${proc.color}-50 dark:bg-${proc.color}-900/30 text-${proc.color}-700 dark:text-${proc.color}-300 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-${proc.color}-100 dark:border-${proc.color}-800">
                                            ${proc.label}
                                        </span>
                                    </div>
                                    <h3 class="mt-5 text-xl font-black text-gray-900 dark:text-white group-hover:text-${proc.color}-600 dark:group-hover:text-${proc.color}-400 transition-colors">${proc.title}</h3>
                                    <p class="mt-2 text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">${proc.shortDesc}</p>
                                </div>
                            `;
                            grid.insertAdjacentHTML('beforeend', tileHTML);

                            // 2. Create or Update Sub-Content
                            let contentDiv = document.getElementById('content-' + proc.id);
                            if (!contentDiv) {
                                contentDiv = document.createElement('div');
                                contentDiv.id = 'content-' + proc.id;
                                contentDiv.className = 'sub-content hidden';
                                // We inject the header, back/nav arrows, and the content
                                contentDiv.innerHTML = `
                                    <div class="flex items-center justify-between mb-8 pb-4 border-b border-gray-100 dark:border-slate-700">
                                        <div class="flex items-center gap-4">
                                            <div class="w-12 h-12 rounded-xl bg-${proc.color}-100 dark:bg-${proc.color}-900/50 text-${proc.color}-600 dark:text-${proc.color}-400 flex items-center justify-center text-xl">
                                                <i class="${proc.icon}"></i>
                                            </div>
                                            <h3 class="text-2xl font-black text-gray-900 dark:text-white">${proc.title}</h3>
                                        </div>
                                        <div class="sub-nav-wrapper flex items-center flex-wrap gap-2 sm:gap-4">
                                            <button onclick="hideSubContent('${category}')" class="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 font-bold text-sm transition-colors flex items-center gap-2">
                                                <i class="fas fa-arrow-left"></i> Retour
                                            </button>
                                            <div class="flex items-center gap-1 sm:border-l border-gray-200 dark:border-slate-700 sm:pl-4 sm:ml-2">
                                                <button class="nav-prev-btn w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-slate-700 text-gray-500 hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors" title="Sous-module précédent" onclick="navigateSub(-1)">
                                                    <i class="fas fa-chevron-left"></i>
                                                </button>
                                                <button class="nav-next-btn w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-slate-700 text-gray-500 hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors" title="Sous-module suivant" onclick="navigateSub(1)">
                                                    <i class="fas fa-chevron-right"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="dynamic-html-container space-y-6"></div>
                                `;
                                contentWrapper.appendChild(contentDiv);
                            }
                            
                            // Update HTML content
                            const htmlContainer = contentDiv.querySelector('.dynamic-html-container');
                            if (htmlContainer) {
                                htmlContainer.innerHTML = proc.contentHtml;
                            }
                        });
                    });
                });
            }
        });
