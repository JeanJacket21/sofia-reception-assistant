# sofia-reception-assistant
S.O.F.I.A 3.0
# 🛎️ S.O.F.I.A 3.0 - Assistant de Réception Adagio

**S.O.F.I.A 3.0** (Guide Interactif & Outils Opérationnels Adagio) est une application web métier conçue pour accompagner les réceptionnistes et les équipes front-office dans leurs tâches quotidiennes. Ce dashboard centralise les processus opérationnels, simplifie la prise de décision et optimise la gestion du parcours client.

## ✨ Fonctionnalités Principales

L'outil est structuré autour de plusieurs modules clés qui couvrent l'intégralité du cycle de vie client et des opérations de la réception :

- **📋 Check-lists de Shift** : Suivi des tâches quotidiennes et routines pour les shifts Matin, Après-Midi et Nuit (Night EOD).
- **📅 Réservations & Groupes** : Gestion des blocs, traitement des rooming lists automatisé (Excel), gestion des arrhes, routings et annulations.
- **🛏️ Le Séjour (In-House)** : Préparation des arrivées, procédures de Check-In (Standard / Modif OTA), Check-Out, gestion des délogements et statuts des chambres (OOO/OOS).
- **📷 Tableau des arrivées OPERA** : Dans « Le Séjour → Préparer ses Arrivées », collez une capture du listing OPERA (`Win + Maj + S`, puis `Ctrl + V`) ou importez une image. Vérifiez l’aperçu OCR, corrigez les champs, renseignez manuellement le montant à encaisser et les notes, puis enregistrez. Les coches « Arrivée OK » et « Paiement posté » sont indépendantes.
- **⭐ Programme ALL & Expérience Client** : Accompagnement sur les statuts du programme de fidélité *ALL - Accor Live Limitless*, notes G.E.T et gestion des préférences clients (ACDC).
- **💳 Facturation & Caisse** : Outils pour les paiements en ligne (Secure Pay By Link Stripe, APOL, PVCP), ajustements, facturation et folios.
- **🧾 Facturation Électronique (OFIS)** : Respect des normes (ex: Bavel) et résolution des rejets (BT-47).
- **🔌 Environnement TARS Connect** : Simulateur interactif et cartographie de l'écosystème TARS (RESAweb, DATAweb).
- **🌙 Back Office & Clôture de Nuit** : Accompagnement à l'audit de nuit et procédures de clôture.

## 🛠️ Technologies Utilisées

Ce projet est conçu pour être léger, rapide et accessible depuis un simple navigateur web :

- **HTML5 / CSS3 / JavaScript (Vanilla)**
- **Tailwind CSS** : Pour une interface moderne, utilitaire et 100% responsive (thème clair/sombre inclus).
- **SheetJS (xlsx)** : Pour la manipulation et la génération de Rooming Lists au format Excel.
- **html2pdf.js** : Pour la génération de fiches de contrôle et rapports PDF.
- **GSAP** : Pour des animations fluides de l'interface et une meilleure expérience utilisateur.
- **FontAwesome** : Bibliothèque d'icônes intégrée.
- **Tesseract.js 6.0.1** : Chargé à la demande pour lire les captures dans le navigateur. Aucun service d'analyse d'images ni clé d'API n'est nécessaire.

### Tableau des arrivées : limites et confidentialité

Affichez dans OPERA les colonnes numéro de confirmation, solde, chambre, type, arrivée, nom et départ dans la même capture. L'OCR est optimisé pour cette vue du listing et propose toujours une correction manuelle. Les notes détaillées ne figurent pas dans le listing : saisissez-les dans le tableau. Le solde OPERA brut reste distinct du montant réellement dû, qui n'est jamais calculé automatiquement à partir du signe du solde.

L'image est lue sur l'appareil, sans être sauvegardée. Les réservations validées sont conservées **dans le stockage local du navigateur, par date** : elles ne se synchronisent pas entre les postes et les coches ne changent rien dans OPERA. Utilisez « Effacer ce jour » après le service sur un poste partagé. Au premier usage, le navigateur doit pouvoir télécharger les fichiers de Tesseract.js ; l'ajout manuel reste accessible si l'OCR est indisponible.

## 🚀 Installation & Utilisation

Ce projet ne nécessite aucune installation de serveur backend complexe pour être consulté.

1. Clonez ce dépôt sur votre machine :
   ```bash
   git clone https://github.com/votre-nom-utilisateur/sofia-reception-assistant.git
