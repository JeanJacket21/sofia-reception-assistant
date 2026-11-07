# sofia-reception-assistant
S.O.F.I.A 3.0
# 🛎️ S.O.F.I.A 3.0 - Assistant de Réception Adagio

**S.O.F.I.A 3.0** (Guide Interactif & Outils Opérationnels Adagio) est une application web métier conçue pour accompagner les réceptionnistes et les équipes front-office dans leurs tâches quotidiennes. Ce dashboard centralise les processus opérationnels, simplifie la prise de décision et optimise la gestion du parcours client.

## ✨ Fonctionnalités Principales

L'outil est structuré autour de plusieurs modules clés qui couvrent l'intégralité du cycle de vie client et des opérations de la réception :

- **📋 Check-lists de Shift** : Suivi des tâches quotidiennes et routines pour les shifts Matin, Après-Midi et Nuit (Night EOD), avec guide visuel Opera Cloud 4K.
- **📅 Réservations & Groupes** : Gestion des blocs, traitement des rooming lists automatisé (Excel), gestion des arrhes, tarifs dégressifs Adagio (`Fixed Rate` / `Do Not Move`), routings et annulations.
- **🛏️ Le Séjour (In-House)** : Préparation des arrivées, attribution des chambres (`Inspected` / `DNM`), instructions de facturation (`Routing Instructions`), procédures de Check-In, Check-Out, gestion des délogements et statuts des chambres (OOO/OOS).
- **⭐ Programme ALL & Expérience Client** : Accompagnement sur les statuts du programme de fidélité *ALL - Accor Live Limitless*, notes G.E.T et gestion des préférences clients (ACDC).
- **💳 Facturation & Caisse** : Outils pour les paiements en ligne (Secure Pay By Link Stripe, APOL, PVCP), ajustements en cours de séjour, factures de crédit (avoirs après départ) et gestion des folios avec captures Opera Cloud 4K UHD.
- **🧾 Facturation Électronique (OFIS)** : Conformité e-Invoicing / e-Reporting (B2B France, Sociétés Étrangères UE/Hors UE, B2G Chorus Pro), paramétrage du Cardex et assistant interactif de résolution des rejets.
- **🏢 Corporate, Leads & New Biz** : Moteur de recherche des comptes Corporate et accompagnement commercial en réception.
- **🔌 Environnement TARS Connect** : Cartographie et procédures de l'écosystème TARS (RESAweb, DATAweb).
- **🌙 Back Office & Clôture de Nuit** : Gestion des comptes débiteurs (*Accounts Receivable / City Ledger*), accompagnement à l'audit de nuit et procédures de clôture.

## 🛠️ Technologies Utilisées

Ce projet est conçu pour être léger, rapide et accessible depuis un simple navigateur web :

- **HTML5 / CSS3 / JavaScript (Vanilla)**
- **Tailwind CSS** : Pour une interface moderne, utilitaire et 100% responsive (thème clair/sombre inclus).
- **SheetJS (xlsx)** : Pour la manipulation et la génération de Rooming Lists au format Excel.
- **html2pdf.js** : Pour la génération de fiches de contrôle et rapports PDF.
- **GSAP** : Pour des animations fluides de l'interface et une meilleure expérience utilisateur.
- **FontAwesome** : Bibliothèque d'icônes intégrée.

## 🚀 Installation & Utilisation

Ce projet ne nécessite aucune installation de serveur backend complexe pour être consulté.

1. Clonez ce dépôt sur votre machine :
   ```bash
   git clone https://github.com/votre-nom-utilisateur/sofia-reception-assistant.git
