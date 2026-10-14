/**
 * S.O.F.I.A 3.0 - Assistant E-Invoicing Opera Cloud (OFFLINE ➔ SUCCESS)
 * Sous-module : Codes erreur facturation électronique & Référentiel Audit
 */

(function () {
    // BASE DE DONNÉES DES 9 CODES ERREUR OPERA CLOUD (OFFLINE ➔ SUCCESS)
    const EINVOICING_ERRORS = [
        {
            id: 'g6-07',
            code: '[G6.07]',
            docRef: 'DocRef: 2325 / 84176096',
            category: 'b2b-fr',
            categoryLabel: 'B2B France & E-Reporting',
            title: 'Identifiant acheteur obligatoire manquant (B2B)',
            shortTag: 'Acheteur B2B manquant',
            statusBadge: 'OFFLINE ➔ SUCCESS',
            statusType: 'success',
            accentColor: 'rose',
            message: 'The buyer identifier is mandatory for B2B transactions.',
            auditCause: 'Toute facture émise vers un profil entreprise ou agence requiert un identifiant fiscal légalement valide. Pour les sociétés françaises, le standard exige le SIREN/SIRET et le numéro de TVA intracommunautaire. Si ces identifiants sont manquants ou incomplets sur le Cardex rattaché au Folio 2, Opera Cloud bascule automatiquement la facture en statut OFFLINE.',
            solutionTitle: 'Procédure Opérationnelle Opera Cloud',
            solutionSteps: [
                {
                    step: '1. Accès Folio 2',
                    desc: 'Allez sur le <strong>Folio 2</strong> de la réservation et cliquez directement sur le nom de la société débitrice (<em>ex: Ufifrance Patrimoine</em>) — <strong>uniquement si elle a été renseignée au préalable dans les instructions de facturation</strong>.'
                },
                {
                    step: '2. Cas Client B2B Français',
                    desc: 'Renseigner obligatoirement le <strong>SIRET</strong> (14 chiffres sans espace) ET le <strong>numéro de TVA intracommunautaire</strong> (FR...). Tout en bas dans l\'adresse (champ <strong>Pays</strong>), s\'assurer que le code pays est strictement identique à celui de la TVA (<strong>FR</strong>). Vérifier l\'identifiant de routage sur l\'<strong>Annuaire Chorus Pro</strong> si nécessaire.'
                },
                {
                    step: '3. Cas Client Étranger (E-reporting B2B)',
                    desc: '<strong>Laisser tout vide</strong> (notamment SIRET / SIREN / ID français) <strong>sauf le numéro de TVA étranger</strong> (ex: <code>DE114108789</code>). Dans <strong>eInvoicing Address</strong> (section Communication), renseigner ce même numéro de TVA étranger (sans préfixe <code>9914:</code>). Renseigner le bon code pays (ex: <code>DE</code>) dans l\'adresse ET dans Communication.'
                },
                {
                    step: '4. Cas Particulier (Erreur B2B sur Guest)',
                    desc: 'Si la facture concerne un client individuel et non une entreprise, détacher le profil société du folio pour basculer la facture en régime B2C (E-reporting B2C).'
                },
                {
                    step: '5. Rafraîchissement & Retry',
                    desc: 'Détacher puis rattacher le profil société sur la fenêtre de facturation pour forcer la régénération du flux XML, puis relancer la transmission (<strong>Retry / Send Fiscal Folio</strong>) ➔ Statut SUCCESS.'
                }
            ],
            copyText: `[CONSIGNE OPERA CLOUD - REJET G6.07]
1. Accès Folio 2 : Cliquer sur la société débitrice (si renseignée dans instructions de facturation).
2. Client Français (B2B) : Renseigner SIRET (14 chiffres sans espace) + N° TVA (FR...) + Pays FR en bas de l'adresse.
3. Client Étranger (E-reporting B2B) : Laisser tout vide sauf le N° de TVA étranger. Mettre le N° TVA dans eInvoicing Address (sans 9914:) + code pays dans adresse et Communication.
4. Particulier : Détacher le profil société pour basculer en B2C.
5. Rafraîchir : Détacher/rattacher profil sur le Folio puis relancer Retry ➔ Statut SUCCESS.`
        },
        {
            id: 'br-co-9',
            code: '[BR-CO-9]',
            docRef: 'DocRef: 2228',
            category: 'vat',
            categoryLabel: 'Format TVA ISO',
            title: 'Absence de préfixe pays ISO 3166-1 alpha-2 sur le N° de TVA',
            shortTag: 'Préfixe Pays TVA absent',
            statusBadge: 'OFFLINE ➔ SUCCESS',
            statusType: 'success',
            accentColor: 'indigo',
            message: 'The Buyer VAT identifier (BT-48) shall have a prefix in accordance with ISO code ISO 3166-1 alpha-2 by which the country of identification may be specified.',
            auditCause: 'Le numéro de TVA intracommunautaire saisi dans le Cardex ne comporte pas les 2 lettres initiales du code pays ISO (ex: FR, DE, BE, IT, ES). Le validateur européen de facturation électronique rejette immédiatement le fichier XML dès lors que le préfixe pays est manquant ou tronqué.',
            solutionTitle: 'Procédure Opérationnelle Opera Cloud',
            solutionSteps: [
                {
                    step: '1. Ouvrir le Cardex Société',
                    desc: 'Ouvrir le Cardex depuis le Folio 2 ou via le menu <em>Relations clients > Profils</em>.'
                },
                {
                    step: '2. Corriger le champ TVA Intracommunautaire',
                    desc: 'Ajouter les deux lettres officielles du pays sans espace devant le numéro de TVA. Exemples : <code>FR57776042210</code> pour la France, <code>DE114108789</code> pour l\'Allemagne, <code>BE0403019261</code> pour la Belgique. <strong>Note de conformité :</strong> La Grèce utilise le préfixe officiel <code>EL</code> (et non GR).'
                },
                {
                    step: '3. Contrôle d\'alignement Pays',
                    desc: 'Vérifier impérativement que le champ <strong>Pays</strong> en bas de la fiche adresse et dans la section <strong>Communication</strong> correspond exactement au préfixe de la TVA.'
                },
                {
                    step: '4. Purge & Retry',
                    desc: 'Détacher puis rattacher le profil sur le Folio 2 pour mettre à jour la charge XML, puis exécuter le <strong>Retry</strong> ➔ Statut SUCCESS.'
                }
            ],
            copyText: `[CONSIGNE OPERA CLOUD - REJET BR-CO-9]
1. Ouvrir le Cardex de l'entreprise (Folio 2 ou Relations clients).
2. Dans le champ "TVA Intracommunautaire", insérer le préfixe officiel à 2 lettres sans espace (ex: FR, DE, BE, IT, ES — Attention Grèce = EL).
3. Vérifier que le code Pays en bas dans l'adresse et dans Communication est strictement identique.
4. Détacher/rattacher le profil sur le Folio 2 et relancer la transmission (Retry ➔ SUCCESS).`
        },
        {
            id: 'br-fr-12',
            code: '[BR-FR-12]',
            docRef: 'DocRef: 2329',
            category: 'address',
            categoryLabel: 'Adresse Routage BT-49',
            title: 'Adresse électronique de routage de l\'acheteur (BT-49) manquante',
            shortTag: 'Adresse BT-49 manquante',
            statusBadge: 'OFFLINE ➔ SUCCESS',
            statusType: 'success',
            accentColor: 'purple',
            message: 'When the electronic invoice must be transmitted and lifecycle status updates are expected in return, the Buyer\'s electronic address (BT-49) is MANDATORY.',
            auditCause: 'En flux E-invoicing B2B domestique français, l\'acheminement fiscal et le retour des statuts du cycle de vie (Mise à disposition, Prise en charge, Rejet) exigent une adresse électronique de routage légale (BT-49, basée sur le SIREN ou l\'identifiant Chorus Pro). Si cette adresse ne peut être dérivée ou est absente de la fiche, la facture est bloquée.',
            solutionTitle: 'Procédure Opérationnelle Opera Cloud',
            solutionSteps: [
                {
                    step: '1. Cas Client Français',
                    desc: 'Renseigner le <strong>SIREN / SIRET</strong> complet et le numéro de TVA intracommunautaire dans la fiche société, avec le code Pays <code>FR</code> en bas dans l\'adresse. Si le client possède un routage spécifique sur une PDP ou Chorus Pro, renseigner son identifiant exact dans <strong>eInvoicing Address</strong>.'
                },
                {
                    step: '2. Cas Client Étranger (E-reporting B2B)',
                    desc: '<strong>Laisser tout vide</strong> sauf le numéro de TVA étranger. Dans le champ <strong>eInvoicing Address</strong> (section Communication), saisir directement le numéro de TVA étranger (sans aucun préfixe <code>9914:</code>). Mettre le bon code pays dans l\'adresse et dans Communication.'
                },
                {
                    step: '3. Rafraîchissement Folio',
                    desc: 'Détacher puis rattacher la société sur le Folio 2 pour purger le cache Opera Cloud, puis cliquer sur <strong>Retry</strong> ➔ Statut SUCCESS.'
                }
            ],
            copyText: `[CONSIGNE OPERA CLOUD - REJET BR-FR-12]
1. Client Français : Renseigner SIREN/SIRET et N° TVA dans la fiche société + Pays FR dans l'adresse. Si identifiant Chorus Pro spécifique, l'inscrire dans eInvoicing Address.
2. Client Étranger (E-reporting B2B) : Laisser tout vide sauf le N° de TVA étranger. Renseigner ce numéro de TVA étranger dans eInvoicing Address (sans 9914:) + bon code pays dans adresse et Communication.
3. Détacher puis rattacher le profil sur le Folio 2 et lancer le Retry ➔ Statut SUCCESS.`
        },
        {
            id: 'br-fr-21',
            code: '[BR-FR-21]',
            docRef: 'DocRef: A0X14601 / 92972952',
            category: 'b2b-fr',
            categoryLabel: 'Contrôle Cohérence SIREN/SIRET/TVA',
            title: 'Incohérence structurelle SIREN / SIRET / TVA / Adresse BT-49',
            shortTag: 'Incohérence TVA / SIREN / SIRET',
            statusBadge: 'OFFLINE ➔ SUCCESS',
            statusType: 'success',
            accentColor: 'blue',
            message: 'BR-FR-21: Buyer\'s Electronic Address. Rule to be executed if the invoice is subject to B2B processing. The electronic address shall correspond to the party\'s legal identification.',
            auditCause: 'La règle de validation BR-FR-21 vérifie la concordance mathématique stricte entre le numéro de TVA intracommunautaire français, le SIREN (9 chiffres), le SIRET (14 chiffres) et l\'adresse électronique de facturation (schéma 0225). Une faute de frappe, un SIRET appartenant à une autre filiale ou un ancien numéro de TVA génère un rejet immédiat.',
            solutionTitle: 'Procédure Opérationnelle Opera Cloud',
            solutionSteps: [
                {
                    step: '1. Contrôle Mathématique Fondamental',
                    desc: 'Appliquer la règle d\'audit : <strong>Les 9 derniers chiffres de la TVA = SIREN (9 ch.) = les 9 premiers chiffres du SIRET (14 ch.)</strong>.<br><div class="p-2.5 mt-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 font-mono text-xs text-blue-900 dark:text-blue-200">Exemple : TVA <strong>FR 57 776 042 210</strong> ⟺ SIREN <strong>776 042 210</strong> ⟺ SIRET <strong>776 042 210 01297</strong></div>'
                },
                {
                    step: '2. Vérification sur l\'Annuaire Chorus Pro',
                    desc: 'Rechercher la raison sociale sur le portail Chorus Pro ou Société.com pour obtenir le SIRET exact du siège ou de l\'établissement payeur et l\'adresse de facturation active.'
                },
                {
                    step: '3. Mise à jour du Cardex',
                    desc: 'Corriger le SIRET et le numéro de TVA sur la fiche client Opera Cloud. Vérifier que le code Pays est <code>FR</code>.'
                },
                {
                    step: '4. Actualiser le Folio & Retry',
                    desc: 'Détacher le profil du Folio 2, le rattacher pour injecter les nouveaux identifiants dans la facture fiscale, puis relancer la transmission ➔ SUCCESS.'
                }
            ],
            copyText: `[CONSIGNE OPERA CLOUD - REJET BR-FR-21]
1. Contrôle mathématique : Les 9 derniers chiffres de la TVA DOIVENT être identiques au SIREN (9 chiffres) et aux 9 premiers chiffres du SIRET (14 chiffres).
   Exemple : TVA FR57 776042210 ⟺ SIREN 776042210 ⟺ SIRET 776042210 01297.
2. Vérifier l'adresse active sur l'Annuaire Chorus Pro / Société.com.
3. Corriger le SIRET et la TVA dans le Cardex + Pays FR.
4. Détacher/rattacher sur le Folio 2, puis Retry ➔ Statut SUCCESS.`
        },
        {
            id: 'br-fr-09',
            code: '[BR-FR-09] / [G1.89]',
            docRef: 'DocRef: 1637 [G1.80] [G2.07]',
            category: 'b2b-fr',
            categoryLabel: 'Format SIRET 14 chiffres',
            title: 'Format SIRET/SIREN invalide ou renseigné sur client étranger',
            shortTag: 'Format SIRET invalide (0009)',
            statusBadge: 'OFFLINE ➔ SUCCESS',
            statusType: 'success',
            accentColor: 'amber',
            message: 'The SIREN consists of 9 digits. || [BR-FR-09][G1.80][G2.07] | Within a Party, where a SIRET is provided (Private Identifier, scheme 0009), it shall consist of 14 digits.',
            auditCause: 'Le validateur analyse le schéma officiel 0009 (SIRET) et exige rigoureusement 14 chiffres numériques continus. Deux cas fréquents d\'erreur : soit la présence d\'espaces ou de tirets dans le SIRET français, soit un SIRET renseigné par erreur sur une société étrangère qui ne dispose pas d\'immatriculation en France.',
            solutionTitle: 'Procédure Opérationnelle Opera Cloud',
            solutionSteps: [
                {
                    step: '1. Cas Client Étranger (E-reporting B2B)',
                    desc: 'Une société étrangère sans établissement en France n\'a PAS de SIRET. <strong>Supprimer totalement le contenu des champs SIRET / SIREN / ID légal</strong> (laisser vide). Renseigner uniquement le <strong>numéro de TVA étranger</strong> (ex: <code>DE114108789</code>) dans TVA Intracommunautaire ET dans <strong>eInvoicing Address</strong> (sans <code>9914:</code>). Mettre le code pays correspondant dans l\'adresse et Communication.'
                },
                {
                    step: '2. Cas Client Français',
                    desc: 'Supprimer impérativement tous les espaces, points ou tirets parasites dans le champ SIRET. Saisir en continu exactement les <strong>14 chiffres</strong> (ex: <code>77604221001297</code>). S\'assurer que le numéro de TVA commence par <code>FR</code> et que le Pays est <code>FR</code>.'
                },
                {
                    step: '3. Purge du cache & Envoi',
                    desc: 'Détacher le profil du Folio 2, le rattacher, puis lancer <strong>Send Fiscal Folio / Retry</strong> ➔ SUCCESS.'
                }
            ],
            copyText: `[CONSIGNE OPERA CLOUD - REJET BR-FR-09 / G1.89]
1. Société Étrangère (E-reporting B2B) : VIDER entièrement les champs SIRET/SIREN. Renseigner uniquement le N° de TVA étranger dans TVA + dans eInvoicing Address (sans 9914:), et le bon code pays (ex: DE) dans adresse et Communication.
2. Société Française : Saisir 14 chiffres en continu SANS AUCUN ESPACE (ex: 77604221001297) + TVA FR + Pays FR.
3. Détacher/rattacher sur le Folio 2 puis Retry ➔ Statut SUCCESS.`
        },
        {
            id: 'br-fr-23',
            code: '[BR-FR-23]',
            docRef: 'DocRef: 1637',
            category: 'foreign',
            categoryLabel: 'Caractères Interdits / Peppol',
            title: 'Conflit de préfixe Peppol (ex: 9914:) sur le schéma français 0225',
            shortTag: 'Caractères interdits (: 9914:)',
            statusBadge: 'OFFLINE ➔ SUCCESS',
            statusType: 'success',
            accentColor: 'cyan',
            message: 'Any electronic address with schemeID = 0225 shall consist of alphanumeric characters (A-Z, a-z, 0-9) and must not contain special characters such as colons (:).',
            auditCause: 'La saisie d\'une adresse de routage internationale Peppol incluant un schéma séparé par deux-points (ex: 9914:DE114108789) dans un champ configuré sous le schéma national français 0225 provoque un rejet syntaxique immédiat, car les deux-points (:) sont formellement proscrits.',
            solutionTitle: 'Procédure Opérationnelle Opera Cloud',
            solutionSteps: [
                {
                    step: '1. Nettoyer le champ eInvoicing Address',
                    desc: 'Aller dans le Cardex > section <em>Communication</em>. <strong>Supprimer le préfixe Peppol <code>9914:</code></strong>.'
                },
                {
                    step: '2. Règle E-reporting B2B (Société Étrangère)',
                    desc: 'Pour un client étranger, laisser tout vide (notamment SIRET/SIREN), et renseigner <strong>uniquement le numéro de TVA étranger brut</strong> (ex: <code>DE114108789</code>) dans le champ <strong>eInvoicing Address</strong>.'
                },
                {
                    step: '3. Vérifier le Code Pays',
                    desc: 'S\'assurer que le code pays de la TVA (ex: <code>DE</code>) est bien renseigné tout en bas dans l\'adresse ET dans Communication.'
                },
                {
                    step: '4. Détacher / Rattacher & Retry',
                    desc: 'Détacher puis rattacher le Cardex sur le Folio 2 pour regénérer le flux XML épuré, puis cliquer sur <strong>Retry</strong> ➔ SUCCESS.'
                }
            ],
            copyText: `[CONSIGNE OPERA CLOUD - REJET BR-FR-23]
1. Dans le Cardex (section Communication), RETIRER le préfixe "9914:" du champ eInvoicing Address.
2. Pour un client étranger (E-reporting B2B) : Laisser tout vide sauf la TVA. Ne renseigner que le numéro de TVA étranger brut (ex: DE114108789) dans eInvoicing Address.
3. Renseigner le même code pays (ex: DE) dans l'adresse et dans Communication.
4. Détacher/rattacher sur le Folio 2 et lancer le Retry ➔ SUCCESS.`
        },
        {
            id: 'br-o-10',
            code: '[BR-O-10]',
            docRef: 'DocRef: 89863471 / 1567',
            category: 'accor',
            categoryLabel: 'Consigne Accor • TVA 0%',
            title: 'Code transaction à 0% de TVA sans motif d\'exonération',
            shortTag: 'Ligne TVA 0% (Taxe séjour / Débours)',
            statusBadge: '🛑 STOP RETRY (OFFLINE)',
            statusType: 'danger',
            accentColor: 'rose',
            message: 'A VAT Breakdown (BG-23) with VAT Category code (BT-118) "Not Subject to VAT" shall have a VAT Exemption Reason code (BT-121) or VAT Exemption Reason text (BT-120).',
            auditCause: 'La norme européenne EN 16931 impose qu\'une ligne de facturation à 0% de TVA (ex: taxe de séjour, débours, refacturations spécifiques) comporte un code motif d\'exonération légal (BT-121). Les codes transactions Opera Cloud actuels ne disposent pas encore tous du mapping réglementaire en base.',
            solutionTitle: 'Procédure Opérationnelle Accord Groupe Accor',
            solutionSteps: [
                {
                    step: '1. 🛑 STOP RETRY ! (Interdiction des relances)',
                    desc: '<strong>Ne PAS tenter de corriger la fiche client et ne pas relancer le folio en boucle.</strong> Cette erreur relève d\'un paramétrage central des codes de transaction financiers.'
                },
                {
                    step: '2. Consigne Officielle Direction / Accor',
                    desc: 'Le Groupe Accor procède actuellement à la mise à jour globale des codes transactions pour intégrer automatiquement les codes d\'exonération BT-121 requis.'
                },
                {
                    step: '3. Action Immédiate Réceptionniste',
                    desc: '<strong>Garder la facture en statut OFFLINE</strong> dans Opera Cloud. Générer la copie PDF de la facture et l\'adresser directement au client par email pour satisfaire son besoin comptable sans bloquer l\'encaissement.'
                }
            ],
            copyText: `[CONSIGNE ACCOR / AUDIT - REJET BR-O-10]
🛑 STOP RETRY ! Ne pas relancer en boucle.
1. Cause : Absence de code motif d'exonération BT-121 sur les lignes à 0% (Taxe de séjour, débours).
2. Consigne Groupe Accor : Déploiement du correctif en cours au niveau central sur les codes transactions.
3. Action : Maintenir la facture en statut OFFLINE et envoyer manuellement la copie PDF de la facture au client.`
        },
        {
            id: 'br-fr-co-02',
            code: '[BR-FR-CO-02]',
            docRef: 'DocRef: 1786 [G1.42] [G1.45]',
            category: 'accor',
            categoryLabel: 'Doublon Facture • Piste d\'Audit',
            title: 'Facture en doublon strict (Numéro, date, émetteur identiques)',
            shortTag: 'Facture en doublon détectée',
            statusBadge: '🛑 STOP RETRY (AVOIR REQUIS)',
            statusType: 'danger',
            accentColor: 'red',
            message: 'Duplicated invoice by number, date and supplier. The invoice with this identifier is already registered on the platform.',
            auditCause: 'La plateforme de dématérialisation (PPF / PDP) rejette le flux car le triplet (numéro de facture, date d\'émission, SIRET émetteur) est déjà enregistré sur le portail (souvent généré suite à un timeout réseau lors d\'un premier envoi qui s\'est avéré concluant côté serveur).',
            solutionTitle: 'Procédure Opérationnelle & Traçabilité Audit',
            solutionSteps: [
                {
                    step: '1. 🛑 STOP RETRY !',
                    desc: 'Ne jamais relancer immédiatement une facture en erreur de doublon sous peine de corrompre l\'historique EFD.'
                },
                {
                    step: '2. Vérification sur le Portail (Chorus Pro / PDP)',
                    desc: 'Consulter l\'espace Chorus Pro ou la PDP de l\'hôtel. Si la facture y apparaît déjà au statut <strong>« Déposée »</strong> ou <strong>« Mise à disposition »</strong>, <strong>aucune action n\'est requise</strong> : l\'obligation fiscale est légalement satisfaite.'
                },
                {
                    step: '3. Procédure Réglementaire si Rejet Confirmé',
                    desc: 'Si la facture originale est en échec irréversible : <strong>Ne JAMAIS modifier manuellement le numéro de facture !</strong> Générer obligatoirement un <strong>Credit Bill (Avoir)</strong> pour annuler comptablement la facture bloquée, puis émettre une nouvelle facture qui prendra automatiquement le numéro chronologique suivant dans Opera Cloud.'
                }
            ],
            copyText: `[CONSIGNE AUDIT COMPTABLE - REJET BR-FR-CO-02]
🛑 STOP RETRY IMMÉDIAT !
1. Vérification : Contrôler sur Chorus Pro / la PDP si la facture est déjà "Déposée" ou "Mise à disposition". Si oui, ne rien faire (facture déjà valide).
2. Si rejet avéré : Ne JAMAIS modifier manuellement le numéro de facture.
3. Régularisation : Émettre un Credit Bill (Avoir) pour annuler la facture rejetée, puis émettre une nouvelle facture dans la séquence chronologique suivante.`
        },
        {
            id: 'br-54',
            code: '[BR-54]',
            docRef: 'DocRef: 89863520',
            category: 'line',
            categoryLabel: 'Ligne / Attribut BG-32',
            title: 'Attribut d\'article (BG-32) incomplet sur un code transaction',
            shortTag: 'Attribut BG-32 incomplet',
            statusBadge: 'OFFLINE ➔ SUCCESS',
            statusType: 'success',
            accentColor: 'indigo',
            message: 'Each item attribute (BG-32) shall contain an Item attribute name (BT-160) and an Item attribute value (BT-161).',
            auditCause: 'Un code transaction, un supplément ou un package posté sur le folio génère dans la structure XML un groupe d\'attributs d\'article (BG-32) dont le libellé de l\'attribut (BT-160) ou la valeur (BT-161) est vide ou non initialisé.',
            solutionTitle: 'Procédure Opérationnelle Opera Cloud',
            solutionSteps: [
                {
                    step: '1. Contrôle des Postages Folio',
                    desc: 'Vérifier sur la fenêtre de facturation les libellés de chaque prestation postée (hébergement, petits déjeuners, suppléments boutique ou animaux). Nettoyer ou reformuler les libellés personnalisés vides.'
                },
                {
                    step: '2. Escalade Support IT / Référent Opera',
                    desc: 'Si l\'anomalie persiste après réactualisation, escalader le cas au Support IT / Référent Opera Cloud de l\'hôtel afin de vérifier le paramétrage du code transaction financier et son mapping de taxe dans la table de configuration des E-factures.'
                },
                {
                    step: '3. Rafraîchissement & Retry',
                    desc: 'Détacher/rattacher le profil société du folio et exécuter le <strong>Retry</strong> ➔ Statut SUCCESS.'
                }
            ],
            copyText: `[CONSIGNE OPERA CLOUD - REJET BR-54]
1. Examiner les lignes du folio (suppléments, packages, libellés manuels) et vérifier qu'aucun libellé n'est vide.
2. Si le problème vient d'un code transaction standard, remonter l'incident au Support IT pour corriger le mapping de l'attribut XML (BT-160 / BT-161).
3. Rafraîchir le folio (détacher/rattacher profil) puis relancer la transmission (Retry ➔ SUCCESS).`
        }
    ];

    // RENDU DES BADGES DU MODE INTERACTIF
    function renderBadges(filterQuery = '', filterCategory = 'all') {
        const grid = document.getElementById('einvoicing-badges-grid');
        const emptyState = document.getElementById('einvoicing-empty-state');
        if (!grid) return;

        const q = filterQuery.trim().toLowerCase();
        const filtered = EINVOICING_ERRORS.filter(err => {
            const matchesCategory = filterCategory === 'all' ||
                (filterCategory === 'b2b-fr' && (err.category === 'b2b-fr' || err.category === 'vat')) ||
                (filterCategory === 'foreign' && (err.category === 'foreign' || err.id === 'g6-07')) ||
                (filterCategory === 'accor' && err.category === 'accor');

            if (!matchesCategory) return false;
            if (!q) return true;

            return err.code.toLowerCase().includes(q) ||
                err.title.toLowerCase().includes(q) ||
                err.docRef.toLowerCase().includes(q) ||
                err.message.toLowerCase().includes(q) ||
                err.shortTag.toLowerCase().includes(q) ||
                err.categoryLabel.toLowerCase().includes(q);
        });

        if (filtered.length === 0) {
            grid.innerHTML = '';
            if (emptyState) emptyState.classList.remove('hidden');
            return;
        }

        if (emptyState) emptyState.classList.add('hidden');

        grid.innerHTML = filtered.map(err => {
            const isDanger = err.statusType === 'danger';
            const badgeBg = isDanger
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300'
                : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300';
            
            const cardBorder = isDanger
                ? 'border-rose-300/80 hover:border-rose-500 dark:border-rose-800/60 hover:shadow-rose-500/10'
                : 'border-slate-200/80 hover:border-rose-500/80 dark:border-slate-700/80 hover:shadow-rose-500/10';

            return `
            <div onclick="openEinvoicingDoublePopup('${err.id}')"
                class="group relative bg-white dark:bg-slate-900/90 rounded-2xl p-5 border ${cardBorder} shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between overflow-hidden">
                
                <!-- Accent glowing bar -->
                <div class="absolute top-0 left-0 right-0 h-1.5 ${isDanger ? 'bg-gradient-to-r from-rose-500 to-red-600' : 'bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600'} opacity-80 group-hover:opacity-100 transition-opacity"></div>
                
                <div>
                    <!-- Code & Status Pill -->
                    <div class="flex items-start justify-between gap-2 mb-3">
                        <span class="inline-flex items-center px-3 py-1.5 rounded-xl font-mono text-base sm:text-lg font-black tracking-tight text-gray-900 dark:text-white bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 group-hover:scale-105 transition-transform shadow-xs">
                            ${err.code}
                        </span>
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black border ${badgeBg} whitespace-nowrap">
                            ${err.statusBadge}
                        </span>
                    </div>

                    <!-- Short Tag & Title -->
                    <div class="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-1">
                        ${err.shortTag}
                    </div>
                    <h4 class="font-bold text-sm text-gray-900 dark:text-gray-100 leading-snug group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                        ${err.title}
                    </h4>
                    <p class="text-[11px] text-gray-400 font-mono mt-1 truncate">
                        ${err.docRef}
                    </p>
                </div>

                <!-- Footer Callout -->
                <div class="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-gray-500 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                    <span class="inline-flex items-center gap-1.5">
                        <i class="fas fa-bolt text-amber-500"></i> Diagnostic 1-clic
                    </span>
                    <i class="fas fa-arrow-right text-xs group-hover:translate-x-1 transition-transform"></i>
                </div>
            </div>
            `;
        }).join('');
    }

    // OUVERTURE DU DOUBLE POP-UP (ALIGNÉ, SANS DÉBORDEMENT, DOUBLE PANNEAU CÔTE À CÔTE)
    function openDoublePopup(errorId) {
        const err = EINVOICING_ERRORS.find(e => e.id === errorId);
        if (!err) return;

        const modal = document.getElementById('einvoicing-double-modal');
        if (!modal) return;

        // Remplissage POP-UP 1 (DIAGNOSTIC AUDIT - AMBRE / BLEU)
        const elCode = document.getElementById('popup1-code');
        const elDoc = document.getElementById('popup1-docref');
        const elTag = document.getElementById('popup1-tag');
        const elMsg = document.getElementById('popup1-message');
        const elCause = document.getElementById('popup1-cause');

        if (elCode) elCode.textContent = err.code;
        if (elDoc) elDoc.textContent = err.docRef;
        if (elTag) elTag.textContent = err.shortTag;
        if (elMsg) elMsg.textContent = err.message;
        if (elCause) elCause.textContent = err.auditCause;

        // Remplissage POP-UP 2 (SOLUTION OPERA CLOUD - ÉMERAUDE / ACTION)
        const elRem = document.getElementById('popup2-code-reminder');
        const elTitle = document.getElementById('popup2-title');
        if (elRem) elRem.textContent = err.code;
        if (elTitle) elTitle.textContent = err.solutionTitle;
        
        const stepsContainer = document.getElementById('popup2-steps');
        if (stepsContainer) {
            stepsContainer.innerHTML = err.solutionSteps.map((s, idx) => `
                <div class="flex items-start gap-3 p-3 rounded-xl bg-white/70 dark:bg-slate-800/80 border border-emerald-100 dark:border-emerald-900/40 shadow-xs">
                    <div class="w-6 h-6 rounded-lg bg-emerald-500 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                        ${idx + 1}
                    </div>
                    <div class="text-xs text-gray-700 dark:text-gray-200 leading-relaxed">
                        <div class="font-bold text-gray-900 dark:text-white mb-0.5">${s.step}</div>
                        <div>${s.desc}</div>
                    </div>
                </div>
            `).join('');
        }

        // Configuration du bouton Copier
        const copyBtn = document.getElementById('popup2-copy-btn');
        if (copyBtn) {
            copyBtn.setAttribute('data-error-id', err.id);
            copyBtn.innerHTML = '<i class="fas fa-copy mr-2"></i> Copier la consigne opérationnelle';
            copyBtn.className = "w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer";
        }

        // Affichage modal avec animation GSAP
        modal.classList.remove('hidden');
        modal.scrollTop = 0;
        document.body.style.overflow = 'hidden';

        const wrapper = document.getElementById('einvoicing-modal-wrapper');
        if (wrapper && typeof gsap !== 'undefined') {
            gsap.fromTo(wrapper, 
                { opacity: 0, scale: 0.96, y: 20 },
                { opacity: 1, scale: 1, y: 0, duration: 0.28, ease: "back.out(1.2)" }
            );
        }
    }

    // FERMETURE DU DOUBLE POP-UP
    function closeDoublePopup() {
        const modal = document.getElementById('einvoicing-double-modal');
        if (!modal) return;

        const wrapper = document.getElementById('einvoicing-modal-wrapper');
        if (wrapper && typeof gsap !== 'undefined') {
            gsap.to(wrapper, {
                opacity: 0,
                scale: 0.96,
                y: 15,
                duration: 0.18,
                ease: "power2.in",
                onComplete: () => {
                    modal.classList.add('hidden');
                    document.body.style.overflow = '';
                }
            });
        } else {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }

    // COPIER LA CONSIGNE
    function copyErrorSolution(btnElement) {
        const errorId = btnElement ? btnElement.getAttribute('data-error-id') : null;
        const err = EINVOICING_ERRORS.find(e => e.id === errorId);
        if (!err) return;

        navigator.clipboard.writeText(err.copyText).then(() => {
            if (btnElement) {
                btnElement.innerHTML = '<i class="fas fa-check mr-2 text-white"></i> Consigne copiée dans le presse-papier !';
                btnElement.classList.remove('from-emerald-600', 'to-teal-600');
                btnElement.classList.add('from-emerald-700', 'to-teal-800');
                setTimeout(() => {
                    btnElement.innerHTML = '<i class="fas fa-copy mr-2"></i> Copier la consigne opérationnelle';
                    btnElement.classList.add('from-emerald-600', 'to-teal-600');
                    btnElement.classList.remove('from-emerald-700', 'to-teal-800');
                }, 2200);
            }
        }).catch(err => {
            console.error('Erreur copie:', err);
        });
    }

    // BASCULE DE VUE (INTERACTIF VS AUDIT RÉFÉRENTIEL)
    function switchOfisView(mode) {
        const interactiveView = document.getElementById('ofis-view-interactive');
        const auditView = document.getElementById('ofis-view-audit');
        const btnInteractive = document.getElementById('btn-view-interactive');
        const btnAudit = document.getElementById('btn-view-audit');

        if (!interactiveView || !auditView) return;

        if (mode === 'audit') {
            interactiveView.classList.add('hidden');
            auditView.classList.remove('hidden');

            if (btnInteractive) {
                btnInteractive.className = "flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100 transition-all cursor-pointer flex items-center justify-center gap-2";
            }
            if (btnAudit) {
                btnAudit.className = "flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black bg-rose-600 text-white shadow-md shadow-rose-500/25 transition-all cursor-pointer flex items-center justify-center gap-2";
            }

            if (typeof gsap !== 'undefined') {
                gsap.fromTo(auditView, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" });
            }
        } else {
            auditView.classList.add('hidden');
            interactiveView.classList.remove('hidden');

            if (btnInteractive) {
                btnInteractive.className = "flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black bg-rose-600 text-white shadow-md shadow-rose-500/25 transition-all cursor-pointer flex items-center justify-center gap-2";
            }
            if (btnAudit) {
                btnAudit.className = "flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100 transition-all cursor-pointer flex items-center justify-center gap-2";
            }

            if (typeof gsap !== 'undefined') {
                gsap.fromTo(interactiveView, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" });
            }
        }
    }

    // GUIDE VISUEL FOLIO 2 & CARDEX (MODE DOUBLE ÉCRAN)
    function openVisualGuideModal() {
        const modal = document.getElementById('ofis-visual-guide-modal');
        if (!modal) return;
        modal.classList.remove('hidden');
        modal.scrollTop = 0;
        document.body.style.overflow = 'hidden';

        // Par défaut, afficher le mode double écran
        setVisualGuideMode('dual');

        const wrapper = document.getElementById('visual-guide-modal-wrapper');
        if (wrapper && typeof gsap !== 'undefined') {
            gsap.fromTo(wrapper,
                { opacity: 0, scale: 0.96, y: 20 },
                { opacity: 1, scale: 1, y: 0, duration: 0.25, ease: "back.out(1.2)" }
            );
        }
    }

    function closeVisualGuideModal() {
        const modal = document.getElementById('ofis-visual-guide-modal');
        if (!modal) return;

        const wrapper = document.getElementById('visual-guide-modal-wrapper');
        if (wrapper && typeof gsap !== 'undefined') {
            gsap.to(wrapper, {
                opacity: 0,
                scale: 0.96,
                y: 15,
                duration: 0.18,
                ease: "power2.in",
                onComplete: () => {
                    modal.classList.add('hidden');
                    document.body.style.overflow = '';
                }
            });
        } else {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }

    // BASCULE MODE AFFICHAGE DU GUIDE VISUEL (DUAL / FOLIO2 / CARDEX)
    let currentVisualGuideMode = 'dual';

    function setVisualGuideMode(mode) {
        currentVisualGuideMode = mode;
        const colFolio = document.getElementById('vg-col-folio');
        const colCardex = document.getElementById('vg-col-cardex');
        const grid = document.getElementById('vg-screens-grid');
        const btnDual = document.getElementById('vg-btn-dual');
        const btnFolio = document.getElementById('vg-btn-folio');
        const btnCardex = document.getElementById('vg-btn-cardex');
        const returnBar = document.getElementById('vg-return-dual-bar');

        if (!colFolio || !colCardex || !grid) return;

        // Classes boutons
        const inactiveClass = "px-3.5 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all cursor-pointer flex items-center gap-1.5";
        const activeClass = "px-3.5 py-2 rounded-xl text-xs font-black bg-rose-600 text-white shadow-xs transition-all cursor-pointer flex items-center gap-1.5";

        if (btnDual) btnDual.className = inactiveClass;
        if (btnFolio) btnFolio.className = inactiveClass;
        if (btnCardex) btnCardex.className = inactiveClass;

        if (mode === 'dual') {
            if (btnDual) btnDual.className = activeClass;
            grid.className = "grid grid-cols-1 lg:grid-cols-2 gap-6 items-start";
            colFolio.classList.remove('hidden');
            colCardex.classList.remove('hidden');
            if (returnBar) returnBar.classList.add('hidden');
        } else if (mode === 'folio2') {
            if (btnFolio) btnFolio.className = activeClass;
            grid.className = "grid grid-cols-1 gap-6 max-w-5xl mx-auto";
            colFolio.classList.remove('hidden');
            colCardex.classList.add('hidden');
            if (returnBar) returnBar.classList.remove('hidden');
        } else if (mode === 'cardex') {
            if (btnCardex) btnCardex.className = activeClass;
            grid.className = "grid grid-cols-1 gap-6 max-w-5xl mx-auto";
            colFolio.classList.add('hidden');
            colCardex.classList.remove('hidden');
            if (returnBar) returnBar.classList.remove('hidden');
        }
    }

    function toggleVisualGuideZoom(screen) {
        if (currentVisualGuideMode === screen) {
            setVisualGuideMode('dual');
        } else {
            setVisualGuideMode(screen);
        }
    }

    // IMPRESSION HAUTE-FIDÉLITÉ DU RÉFÉRENTIEL AUDIT
    function printAuditReferentiel() {
        const auditContent = document.getElementById('audit-printable-sheet');
        if (!auditContent) {
            window.print();
            return;
        }

        const printFrame = document.createElement('iframe');
        printFrame.style.position = 'fixed';
        printFrame.style.right = '0';
        printFrame.style.bottom = '0';
        printFrame.style.width = '0';
        printFrame.style.height = '0';
        printFrame.style.border = '0';
        document.body.appendChild(printFrame);

        const frameDoc = printFrame.contentWindow.document;
        frameDoc.open();
        frameDoc.write(`
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <title>Référentiel Audit Facturation Électronique France - Opera Cloud</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" rel="stylesheet">
                <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet">
                <style>
                    body {
                        font-family: 'Outfit', sans-serif;
                        color: #1e293b;
                        background: #ffffff;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    @page {
                        size: A4;
                        margin: 14mm 12mm 14mm 12mm;
                    }
                    .page-break {
                        page-break-before: always;
                    }
                    img {
                        max-width: 100% !important;
                        page-break-inside: avoid;
                    }
                    table {
                        page-break-inside: avoid;
                    }
                </style>
            </head>
            <body class="p-4">
                ${auditContent.innerHTML}
                <script>
                    window.onload = function() {
                        setTimeout(() => {
                            window.focus();
                            window.print();
                            window.parent.document.body.removeChild(window.frameElement);
                        }, 500);
                    };
                </script>
            </body>
            </html>
        `);
        frameDoc.close();
    }

    // INITIALISATION & LISTENERS
    function initEinvoicingModule() {
        renderBadges();

        // Écouteur recherche
        const searchInput = document.getElementById('einvoicing-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const activeCategoryBtn = document.querySelector('.einvoicing-cat-btn.active');
                const cat = activeCategoryBtn ? activeCategoryBtn.dataset.category : 'all';
                renderBadges(e.target.value, cat);
            });
        }

        // Écouteur filtres par catégorie
        const catBtns = document.querySelectorAll('.einvoicing-cat-btn');
        catBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                catBtns.forEach(b => {
                    b.classList.remove('active', 'bg-rose-600', 'text-white', 'shadow-sm');
                    b.classList.add('bg-gray-100', 'dark:bg-slate-800', 'text-gray-600', 'dark:text-gray-300');
                });
                btn.classList.add('active', 'bg-rose-600', 'text-white', 'shadow-sm');
                btn.classList.remove('bg-gray-100', 'dark:bg-slate-800', 'text-gray-600', 'dark:text-gray-300');

                const searchVal = searchInput ? searchInput.value : '';
                renderBadges(searchVal, btn.dataset.category);
            });
        });

        // Touche Escape pour fermer les modales
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeDoublePopup();
                closeVisualGuideModal();
            }
        });
    }

    // Exposer globalement sur window
    window.EINVOICING_ERRORS = EINVOICING_ERRORS;
    window.openEinvoicingDoublePopup = openDoublePopup;
    window.closeEinvoicingDoublePopup = closeDoublePopup;
    window.copyErrorSolution = copyErrorSolution;
    window.switchOfisView = switchOfisView;
    window.openVisualGuideModal = openVisualGuideModal;
    window.closeVisualGuideModal = closeVisualGuideModal;
    window.setVisualGuideMode = setVisualGuideMode;
    window.toggleVisualGuideZoom = toggleVisualGuideZoom;
    window.printAuditReferentiel = printAuditReferentiel;
    window.initEinvoicingModule = initEinvoicingModule;

    // Démarrage automatique
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEinvoicingModule);
    } else {
        initEinvoicingModule();
    }
})();
