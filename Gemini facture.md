# 🏛️ DANHOMEY Facture — Guide de Référence & Architecture Technique

> **Document de référence pour les développeurs et agents IA (Antigravity / Gemini / Claude)**  
> **Dernière mise à jour :** Novembre 2026  
> **Version de l'application :** 1.0.0 (Production-Ready)  
> **Identité de marque :** DANHOMEY Facture · Facturation FCFA (UEMOA & CEMAC)

---

## 1. 🎯 Ce que fait l'application (Vision & Contexte Métier)

**DANHOMEY Facture** est une application SaaS moderne de facturation d'entreprise spécialement conçue pour les entrepreneurs, PME, startups et consultants exerçant en Afrique de l'Ouest et en Afrique Centrale (zones **UEMOA** et **CEMAC**).

### Contexte réglementaire & géographique
- **Devise monétaire légale :** Franc CFA (**FCFA** / codes ISO `XOF` pour l'UEMOA, `XAF` pour la CEMAC).
- **Règle comptable stricte SYSCOHADA :** Le Franc CFA n'a **aucune décimale ni centime**. Tous les calculs (prix unitaires, totaux HT, TVA, totaux TTC, acomptes, restes à payer) doivent être arrondis à l'entier le plus proche (`Math.round` / entiers stricts).
- **Pays couverts :**
  - **Bénin** (Cotonou, Porto-Novo, Parakou) — Réglementation DGI Bénin / IFU
  - **Côte d'Ivoire** (Abidjan, Yamoussoukro, Bouaké) — DGI CI / NCC
  - **Sénégal** (Dakar, Thiès, Saint-Louis) — NINEA
  - **Togo** (Lomé, Kara) — NIF
  - **Burkina Faso** (Ouagadougou, Bobo-Dioulasso) — IFU
  - **Mali** (Bamako) — NIF
  - **Niger** (Niamey) — NIF
  - **Cameroun** (Douala, Yaoundé) — NIU (Zone CEMAC)
- **Moyens de paiement africains intégrés :**
  - **Mobile Money :** Wave, MTN Mobile Money, Moov Money, Orange Money.
  - **Virement bancaire :** BOA, Ecobank, UBA, Société Générale, Coris Bank, etc.
  - **Espèces / Règlement au comptant** contre délivrance d'un reçu officiel.

---

## 2. ⚡ Toutes les fonctionnalités implémentées

L'application est 100% fonctionnelle, interactive et testée de bout en bout :

### 1. Tableau de bord financier temps réel (`/`)
- **Cartes d'indicateurs clés (KPIs) :**
  - Chiffre d'affaires total facturé (FCFA).
  - Total des encaissements perçus avec répartition Mobile Money vs Virement.
  - Factures en attente / en retard avec alertes visuelles.
  - Taux de recouvrement dynamique (%).
- **Graphique interactif de trésorerie (Cashflow) :**
  - Évolution mensuelle Facturé vs Encaissé sur l'exercice en cours.
  - Filtres temporels rapides : Ce mois-ci, Dernier trimestre, Année 2026.
- **Tableau des dernières factures :**
  - Filtres par statut en contrôle segmenté moderne : *Toutes, Payées, Envoyées, En retard, Brouillons*.
  - Recherche en direct par client, référence ou montant.
  - Actions rapides par ligne : Visualisation directe (œil), Téléchargement instantané PDF (icône téléchargement), et Menu "Plus d'actions" (3 points : modifier, télécharger CSV, partager WhatsApp, copier lien public, supprimer).
  - Pagination interactive et responsive.

### 2. Gestion complète du cycle de vie des factures (`/factures`)
- **Statuts officiels pris en charge :**
  - `draft` (Brouillon) : facture en préparation, modifiable sans restriction.
  - `sent` (Envoyée) : facture transmise au client, échéance en cours.
  - `paid` (Payée) : solde intégralement réglé (`balanceDue === 0`).
  - `overdue` (En retard) : date d'échéance dépassée sans règlement intégral.
  - `cancelled` (Annulée) : facture annulée avec motif légal.
- **Filtres avancés :** par statut, par période, recherche plein texte.
- **Sélection multiple et actions groupées :** export groupé CSV, marquage payé groupé.

### 3. Création & Édition de factures (`/factures/nouvelle` et `/factures/[id]/modifier`)
- **Double affichage en onglets :**
  - Mode Formulaire interactif.
  - Mode Aperçu en direct (Live Document Preview) reflétant instantanément la saisie et la langue sélectionnée.
- **Sélection et création rapide de client :**
  - Menu déroulant des clients enregistrés avec aperçu complet de la fiche (IFU, adresse, contact).
  - Modale de création express d'un nouveau client directement depuis le formulaire sans quitter la page.
- **Lignes de prestations dynamiques :**
  - Ajout/suppression illimités de lignes.
  - Suggestions en un clic de prestations pré-remplies courantes du marché local.
  - Calcul automatique en temps réel : Montant HT par ligne = Quantité × Prix unitaire.
- **Paramétrage fiscal SYSCOHADA :**
  - Taux de TVA standard (18% par défaut dans l'UEMOA) ou case à cocher d'exonération de TVA (Régime TPS / Export / Exonéré).
  - Calcul dynamique du sous-total HT, montant de la TVA et montant total TTC.
  - Conversion automatique du montant en toutes lettres selon la grammaire officielle française et SYSCOHADA (ex. *"Deux millions cinq cent trente-sept mille Francs CFA"*).
- **Conditions de règlement :** Modalités bancaires, Wave, MTN MoMo, mentions légales.

### 4. Fiche détaillée de facture (`/factures/[id]`)
- **En-tête épuré et ergonomique :**
  - Affichage clair du numéro de facture et du badge de statut, sans aucun chevauchement de bouton.
  - Bouton d'encaissement rapide si le solde reste dû.
  - Barre d'outils unifiée : Changer le statut, Modifier, Supprimer, Partager par WhatsApp, Exporter CSV, Imprimer / PDF.
- **Enregistrement des encaissements partiels ou totaux :**
  - Modale d'enregistrement de règlement : saisie du montant perçu, sélection du moyen (Mobile Money, Virement, Espèces, Chèque), référence de transaction, date et note.
  - Historique des paiements avec calcul du solde restant dû.
- **Feuille de facture / reçu officielle ([`InvoiceSheet`](file:///c:/Users/HP/SaaS%20facture/components/invoices/invoice-sheet.tsx)) :**
  - Basculement instantané entre format "Facture" et format "Reçu d'encaissement" officiel certifié.
  - Sceau/tampon officiel haute définition intégrant l'écusson cauris de la marque.
  - Format optimisé pour impression papier ou enregistrement PDF (`@media print` dédié masquant les barres d'outils).

### 5. Partage public et sécurisé de facture (`/f/[token]`)
- Vue publique sans authentification pour les clients finaux.
- Barre d'en-tête publique avec logo officiel, sélecteur de langue, bascule de thème clair/sombre et bouton de téléchargement PDF immédiat.
- Affichage du reçu d'encaissement si la facture a été soldée.

### 6. Répertoire Clients (`/clients` et `/clients/[id]`)
- Liste des entreprises et particuliers avec fiches complètes (IFU, RCCM, adresse, ville, pays, téléphone, email).
- Métriques financières par client : Total facturé, Solde restant dû, Nombre de factures émises.
- Fiche client détaillée avec historique des factures et règlements associés.
- Création, modification et suppression de clients avec retours visuels (toasts).

### 7. Historique des Règlements & Paiements (`/paiements`)
- Suivi de tous les flux entrants classés par moyen (Mobile Money Wave/MTN, virement bancaire, espèces).
- Récapitulatif global des encaissements du mois.
- Exportation du relevé d'encaissements en CSV.

### 8. Rapports & Analyses Financières (`/rapports`)
- Ventilation du chiffre d'affaires par pays de facturation (Bénin, Côte d'Ivoire, Sénégal, Togo, etc.).
- Ventilation par moyen de paiement et par type de prestation.
- Taux de recouvrement et créances en retard.

### 9. Paramètres de l'entreprise & Fiscalité (`/parametres`)
- **Profil Entreprise :** Raison sociale, Pays d'immatriculation, IFU / Numéro fiscal, RCCM, Adresse, Téléphone, Email.
- **Fiscalité & Facturation FCFA :** Taux de TVA par défaut (18%), mention légale d'exonération, préfixe de numérotation des factures, délai d'échéance par défaut (30 jours).
- **Profil Utilisateur :** Nom, prénom, rôle, email.

### 10. Support Client (`/support`)
- Canaux d'assistance directe : Assistance WhatsApp dédiée, Support par email, Ligne téléphonique.
- FAQ interactive sur les questions fiscales UEMOA / CEMAC et l'utilisation de l'application.

### 11. Gestion du Thème (Clair / Sombre)
- Bascule fluide et instantanée entre Mode Clair et Mode Sombre via [`ThemeToggleButton`](file:///c:/Users/HP/SaaS%20facture/components/layout/theme-toggle-button.tsx).
- Respect du thème système par défaut avec persistance `localStorage` (`danhomey_theme`).
- Palette de couleurs adaptée : fond vert forêt et surfaces sombres en mode dark, sans contraste éblouissant, avec conformité WCAG.

### 12. Système Multilingue Global (12 langues)
- Système centralisé de dictionnaires de traduction avec typage TypeScript strict [`TranslationDictionary`](file:///c:/Users/HP/SaaS%20facture/lib/i18n/translations.ts).
- Basculement instantané sur 100% de l'interface (menus, formulaires, aperçus de reçus, tableaux, notifications toasts).
- **Langues disponibles :**
  - **Français** (`fr`) — Langue administrative principale
  - **Anglais** (`en`) — Commerce international
  - **Fon** (`fon`) — Bénin
  - **Yoruba** (`yo`) — Bénin / Nigéria
  - **Dioula** (`diu`) — Côte d'Ivoire / Burkina Faso
  - **Baoulé** (`ba`) — Côte d'Ivoire
  - **Wolof** (`wo`) — Sénégal
  - **Peul / Pulaar** (`ff`) — Sénégal / Guinée / Mali
  - **Ewe** (`ee`) — Togo
  - **Kabyè** (`kbp`) — Togo
  - **Mooré** (`mos`) — Burkina Faso
  - **Douala** (`dua`) — Cameroun

### 13. Système de Notifications Toast Interactif
- Conteneur de notification global z-index 100 avec effet `backdrop-blur` ([`components/ui/toast.tsx`](file:///c:/Users/HP/SaaS%20facture/components/ui/toast.tsx)).
- Types supportés : `success`, `error`, `info`, `warning`.
- Actif sur toutes les actions critiques : encaissement, changement de statut, suppression, export CSV, copie de lien, partage WhatsApp, enregistrement de paramètres, bascule de thème.

---

## 3. 📁 Structure des fichiers du projet

```
c:/Users/HP/SaaS facture/
├── app/                                    # Routes Next.js 16 App Router
│   ├── layout.tsx                          # Layout racine (HTML, script anti-flicker thème, fonts, métadonnées & favicons)
│   ├── page.tsx                            # Page Tableau de bord principal
│   ├── globals.css                         # Styles Tailwind v4 & variables de thème CSS
│   ├── factures/
│   │   ├── page.tsx                        # Liste des factures avec filtres & recherche
│   │   ├── nouvelle/
│   │   │   └── page.tsx                    # Formulaire de création avec aperçu direct
│   │   └── [id]/
│   │       ├── page.tsx                    # Fiche détail facture, encaissement, actions
│   │       └── modifier/
│   │           └── page.tsx                # Modification d'une facture existante
│   ├── clients/
│   │   ├── page.tsx                        # Liste du répertoire clients
│   │   └── [id]/
│   │       └── page.tsx                    # Fiche détail client et historique
│   ├── paiements/
│   │   └── page.tsx                        # Suivi des encaissements et moyens de paiement
│   ├── rapports/
│   │   └── page.tsx                        # Analyses financières et statistiques
│   ├── parametres/
│   │   └── page.tsx                        # Profil entreprise, fiscalité FCFA, utilisateur
│   ├── support/
│   │   └── page.tsx                        # Centre d'aide, assistance WhatsApp & FAQ
│   └── f/
│       └── [token]/
│           └── page.tsx                    # Vue publique d'une facture/reçu pour client
│
├── components/                             # Composants React modulaires
│   ├── dashboard/                          # Composants du tableau de bord
│   │   ├── cashflow-chart.tsx              # Graphique de trésorerie Facturé vs Encaissé
│   │   ├── recent-invoices-table.tsx       # Tableau interactif des factures avec onglets
│   │   └── stat-cards.tsx                  # Cartes d'indicateurs financiers clés
│   ├── invoices/                           # Composants métier de facturation
│   │   └── invoice-sheet.tsx               # Feuille officielle de facture / reçu (imprimable/PDF)
│   ├── layout/                             # Mise en page générale
│   │   ├── dashboard-shell.tsx             # Enveloppe avec sidebar responsive et header
│   │   ├── sidebar.tsx                     # Barre latérale avec Logo officiel et navigation
│   │   ├── top-header.tsx                  # En-tête avec fil d'Ariane, logo mobile, recherche
│   │   ├── header-search-bar.tsx           # Barre de recherche globale temps réel
│   │   ├── period-calendar-popover.tsx     # Sélecteur de période avec calendrier
│   │   ├── language-selector-popover.tsx   # Sélecteur multilingue (12 langues)
│   │   ├── theme-toggle-button.tsx         # Bouton bascule mode clair / sombre
│   │   ├── notification-popover.tsx        # Tiroir des notifications système
│   │   └── user-menu-popover.tsx           # Menu utilisateur et profil
│   ├── ui/                                 # Composants atomiques réutilisables
│   │   ├── logo.tsx                        # Composant Logo officiel (icone, complet, svg, png)
│   │   ├── status-badge.tsx                # Badge stylisé selon statut de facture
│   │   └── toast.tsx                       # Système de pop-up notifications (toasts)
│   └── providers.tsx                       # Contexte React global (I18n + Data)
│
├── supabase/                               # Configuration et migrations Supabase
│   ├── migrations/
│   │   └── 20261110000000_init_schema.sql  # Schéma SQL complet (tables, enums, triggers, RLS)
│   ├── seed.sql                            # Données de référence initiales
│   └── full_setup.sql                      # Migration consolidée appliquée en production
│
├── lib/                                    # Logique métier pure, utilitaires & état
│   ├── config.ts                           # Configuration de l'application (noms, versions)
│   ├── data/
│   │   ├── context.tsx                     # Contexte React Data synchronisé avec Supabase
│   │   └── local-store.ts                  # Persistance locale & calculs de métriques en direct
│   ├── supabase/
│   │   ├── client.ts                       # Initialisation sécurisée du client Supabase
│   │   └── services.ts                     # CRUD complet & mappeurs relationnels typés
│   ├── format/
│   │   ├── money.ts                        # Formatage monétaire FCFA strict SYSCOHADA
│   │   └── date.ts                         # Formatage des dates selon la locale active
│   ├── i18n/
│   │   ├── context.tsx                     # Contexte de langue et hook useI18n()
│   │   └── translations.ts                 # Dictionnaires de traduction pour les 12 langues
│   ├── invoice/
│   │   ├── totals.ts                       # Calculs des totaux HT, TVA, TTC, acomptes
│   │   └── amount-in-words.ts              # Conversion des montants en lettres (français & SYSCOHADA)
│   └── mock-data.ts                        # Données initiales réalistes (Bénin, CI, Sénégal, Togo)
│
├── public/                                 # Assets statiques & images haute définition
│   ├── logo-master.jpg                     # Master extrait du PDF officiel (2880x1800)
│   ├── logo-icon-light.png                 # Écusson squircle officiel fond clair (288x288)
│   ├── logo-icon-dark.png                  # Écusson squircle officiel fond sombre (288x288)
│   ├── logo-full-light.png                 # Logo complet horizontal fond clair (1244x288)
│   ├── logo-full-dark.png                  # Logo complet horizontal fond sombre (1244x288)
│   ├── favicon.ico                         # Favicon officiel du navigateur
│   ├── icon.png                            # Icône 32px
│   ├── apple-icon.png                      # Icône Apple 180px
│   └── icon-*.png                          # Tailles 16, 32, 40, 48, 72, 180, 192, 512 px
│
├── tests/                                  # Tests unitaires Vitest
│   └── unit/
│       ├── amount-in-words.test.ts         # Tests conversion montants en lettres (36 tests)
│       ├── format.test.ts                  # Tests formatage FCFA et dates (12 tests)
│       ├── i18n-and-theme.test.ts          # Tests multilingue et thèmes (3 tests)
│       ├── status.test.ts                  # Tests statuts et transitions (8 tests)
│       └── totals.test.ts                  # Tests calculs HT, TVA, TTC (15 tests)
│
├── package.json                            # Dépendances et scripts npm
├── tsconfig.json                           # Configuration TypeScript strict
├── vitest.config.ts                        # Configuration des tests Vitest
└── Gemini facture.md                       # Ce fichier de référence master
```

---

## 4. 🛠️ Technologies utilisées & Versions

| Technologie | Version | Rôle & Usage |
| :--- | :--- | :--- |
| **Next.js** | `16.0.2` (App Router) | Framework React serveur & client, routes dynamiques, SSR/SSG |
| **React** | `19.0.0` | Bibliothèque UI moderne avec hooks (`use`, `useMemo`, `useState`) |
| **TypeScript** | `^5.6.0` | Typage strict complet, zéro erreur `tsc --noEmit` |
| **Tailwind CSS** | `^4.0.0` | Styling utilitaire haute performance avec mode sombre natif |
| **Lucide React** | `^1.16.0` | Bibliothèque d'icônes vectorielles cohérente |
| **Sharp** | `^0.33.5` | Traitement et recadrage haute fidélité des assets graphiques du logo |
| **Vitest** | `^3.2.7` | Framework de test unitaire ultra-rapide (74 tests validés) |
| **Supabase** | `@supabase/supabase-js` `^2.49.0` | Backend Cloud (PostgreSQL, Row Level Security, Client SDK) |

---

## 5. 🎨 Décisions de Design & Charte Graphique

### 1. Palette de couleurs
- **Vert Forêt Profond (`forest-950` / `#0f241b`, `forest-900` / `#163327`) :** Couleur institutionnelle dominante symbolisant la confiance, la solidité financière et la souveraineté économique.
- **Vert Lime Vif (`lime-400` / `#a3e635`, `lime-300` / `#bef264`) :** Couleur d'accent et de vivacité technologique, assurant un contraste maximal sur les fonds sombres.
- **Or / Ambre (`#f59e0b`, `amber-500`) :** Utilisé pour la vague en dents de scie sous DANHOMEY et les triangles d'angle, évoquant la richesse et la tradition commerciale d'Afrique de l'Ouest.
- **Sage / Lin (`sage-50` à `sage-300`) :** Nuances douces et chaleureuses pour les fonds de tableaux, bordures et séparateurs.
- **Surface & Canvas dynamiques :**
  - Mode clair : Fond canvas lin très léger (`#f8faf7`), surfaces cartes blanches pures (`#ffffff`).
  - Mode sombre : Fond canvas vert forêt nuit (`#091711`), cartes surfaces (`#0f241b`), bordures subtiles (`#1c382b`).

### 2. Le Logo Officiel et sa symbolique
- **Écusson Squircle :** Forme moderne combinant la rigueur du carré et la douceur du cercle.
- **Cauris sacré central :** Ancienne monnaie d'Afrique de l'Ouest et symbole de valeur marchande inaltérable. Composé d'une fente centrale et de 4 encoches horizontales de chaque côté.
- **Ligne en dents de scie dorée (Chevron wave) :** Motif textile traditionnel tissé rappelant les pagnes d'apparat du Danhomè.
- **Badge FCFA à très haut contraste :** Fond vert lime avec texte noir forêt gras, lisible en un coup d'œil quel que soit le thème actif.

### 3. Ergonomie & Responsivité
- **En-têtes anti-collision :** Le titre de page et le fil d'Ariane sont protégés avec `shrink-0 min-w-fit` et `whitespace-nowrap`, tandis que la barre de recherche a une largeur adaptative (`w-28 sm:w-36 lg:w-48`) pour garantir qu'aucun chevauchement ne se produise sur les écrans d'ordinateurs portables (1366x768 et au-delà).
- **Navigation mobile optimisée :** Menu burger escamotable avec tiroir fluide, logo officiel visible en mobile, et tableaux convertis en cartes lisibles sur smartphone.
- **Impression PDF irréprochable :** Toutes les barres d'outils, boutons de navigation et menus sont automatiquement masqués via les règles CSS `print:hidden` pour produire un document A4 standard impeccable.

---

## 6. 🤖 Instructions impératives pour les futurs Modèles IA

Quand vous intervenez sur ce projet, vous **DEVEZ TOUJOURS RESPECTER LES RÈGLES SUIVANTES** :

### Règle 1 : Règle comptable SYSCOHADA (FCFA sans décimales)
- Le Franc CFA **ne possède aucun centime**.
- N'utilisez **JAMAIS** de virgule flottante ni `.00` pour afficher un montant FCFA.
- Utilisez toujours la fonction utilitaire centralisée [`formatFCFA(amount)`](file:///c:/Users/HP/SaaS%20facture/lib/format/money.ts).
- Lors de tout calcul de sous-total, TVA, acompte ou solde, appliquez systématiquement `Math.round(...)`.

### Règle 2 : Traduction centralisée obligatoire (Pas de texte en dur)
- N'écrivez **JAMAIS** de texte d'interface utilisateur en dur dans un composant JSX.
- Utilisez systématiquement le hook `const { t } = useI18n();` avec une clé existante de [`TranslationDictionary`](file:///c:/Users/HP/SaaS%20facture/lib/i18n/translations.ts).
- Si une nouvelle clé est nécessaire :
  1. Déclarez-la dans l'interface `TranslationDictionary` dans `lib/i18n/translations.ts`.
  2. Fournissez sa traduction dans chacun des 12 dictionnaires de langue (`fr`, `en`, `fon`, `yo`, `diu`, `ba`, `wo`, `ff`, `ee`, `kbp`, `mos`, `dua`).
  3. Utilisez-la via `t("votre_cle", "Texte de secours")`.

### Règle 3 : Respect du Logo officiel et de l'identité visuelle
- N'insérez jamais de badge générique `<div>D</div>` ou de lettre isolée.
- Utilisez exclusivement le composant officiel [`<Logo />`](file:///c:/Users/HP/SaaS%20facture/components/ui/logo.tsx) avec les variants adaptés :
  - `variant="full"` pour la barre latérale ou les pages d'accueil.
  - `variant="icon"` pour les en-têtes mobiles, les vignettes de facture, le tampon officiel de facture, etc.
- Laissez le composant gérer le mode d'affichage automatique clair/sombre (`themeMode="auto"`).

### Règle 4 : Gestion stricte des deux thèmes (Clair / Sombre)
- Chaque composant doit être conçu pour les deux modes grâce aux variantes Tailwind `dark:`.
- Respectez les conventions de couleur du projet :
  - Fond de carte : `bg-surface`
  - Fond de page : `bg-canvas`
  - Texte principal : `text-forest-950 dark:text-white`
  - Texte secondaire : `text-ink-muted` ou `text-sage-600 dark:text-sage-400`
  - Bordure : `border-line`
- Vérifiez toujours le contraste des éléments interactifs en mode sombre.

### Règle 5 : Exécution des commandes sur Windows
- Pour toute commande `node` ou `npm` exécutée via le terminal, préfixez le chemin de Node.js Scoop :
  ```powershell
  $env:Path = "C:\Users\HP\scoop\apps\nodejs-lts\current;" + $env:Path; npm run typecheck
  $env:Path = "C:\Users\HP\scoop\apps\nodejs-lts\current;" + $env:Path; npm test
  ```
- Vérifiez toujours que `npm run typecheck` renvoie **0 erreur** avant de clore une tâche.
- Vérifiez que l'ensemble des 74 tests unitaires de Vitest continuent de passer (`npm test`).

### Règle 6 : Notifications et retours utilisateur (Toasts)
- Toute action modifiant l'état (création, mise à jour, suppression, export CSV, copie de lien, partage) doit obligatoirement émettre un pop-up toast explicite via le hook `showToast({ type: "success" | "info" | "error", title, message })`.

---

## 7. 🗄️ Architecture Backend Supabase & Synchronisation Cloud

L'application fonctionne en architecture **Full Stack** avec **Supabase** comme base de données PostgreSQL et moteur d'authentification/sécurité.

### 1. Tables de la Base de Données
- `organizations` : Entreprises et paramètres fiscaux (ID, nom, IFU/tax_id, RCCM, adresse, ville, pays, TVA par défaut, coordonnées bancaires BOA/Ecobank et Mobile Money Wave/MTN).
- `customers` : Répertoire des clients (ID, organisation_id, nom, personne de contact, email, téléphone, adresse, IFU, total facturé, total payé, solde restant dû).
- `invoices` : Factures d'entreprise (ID, organisation_id, customer_id, numéro officiel, date d'émission, date d'échéance, statut ENUM, sous-total HT, taux TVA, montant TVA, total TTC, montant payé, jeton public de partage `public_token`).
- `invoice_items` : Lignes de prestation détaillées (ID, invoice_id, position, description, quantité, prix unitaire FCFA, total ligne).
- `payments` : Règlements enregistrés (ID, organisation_id, invoice_id, montant, date, moyen de paiement ENUM, référence bancaire/Mobile Money, note).
- `profiles` : Profils utilisateurs et appartenance organisationnelle avec rôles (`owner`, `admin`, `member`, `accountant`).

### 2. Modèle de Synchronisation & Multi-Tenancy Sécurisé
1. **Authentification Supabase (`/inscription` & `/connexion`) :**
   - Inscription moderne avec support Google OAuth, Twitter, Facebook et création automatique de profil + organisation via triggers PostgreSQL (`auto_confirm_new_user` et `handle_new_user`).
   - Connexion rapide 1-clic avec le compte de test préconfiguré (`demo@danhomey.africa` / `Danhomey2026!`).
2. **Isolation stricte des données (RLS) :**
   - Chaque utilisateur est rattaché à son organisation via `auth.uid() = profiles.id`.
   - La fonction de sécurité `auth_org_id()` garantit que les factures, clients et paiements d'une entreprise sont 100% invisibles et inaccessibles pour les autres entreprises.
   - Les liens de partage public (`/f/[token]`) sont accessibles publiquement sans authentification grâce à la politique dédiée pour le rôle `anon`.
3. **Zéro donnée fictive en production :**
   - En mode connecté, l'application n'affiche que les données réelles issues de Supabase.
   - Si une nouvelle entreprise n'a pas encore émis de facture ou enregistré de client, l'interface affiche des états vides élégants avec bouton d'action pour créer le premier élément.
4. **Mappeurs relationnels typés :** Conversion transparente et bidirectionnelle entre la convention `snake_case` de PostgreSQL et les types `camelCase` stricts de TypeScript.


