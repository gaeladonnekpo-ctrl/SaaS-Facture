# Design System Officiel — DANHOMEY Facture

> **Version :** 1.0.0 · **Mise à jour :** Novembre 2026  
> **Référence visuelle :** Dashboard Paydo & Spacebook · Marché UEMOA & CEMAC  
> **Framework :** Next.js 16 (App Router) · Tailwind CSS v4 · TypeScript Strict  

---

## 1. Philosophie & Principes Directeurs

Le Design System de **DANHOMEY Facture** est le référentiel unique et obligatoire de conception de l'ensemble de notre plateforme SaaS de facturation en ligne. Il associe la rigueur comptable et fiscale d'Afrique de l'Ouest et Centrale (OHADA, BCEAO, BEAC) à une ergonomie front-end de classe mondiale (Dribbble & Awwwards).

### Les 4 Piliers Fondamentaux

1. **Mobile d'abord (Mobile-First)** :  
   Tout écran doit s'afficher de manière impeccable sur un écran de 360 px (téléphones courants sur les marchés cibles) sans débordement horizontal, sans retour à la ligne disgracieux et avec une navigation tactile fluide.
2. **Intégrité monétaire absolue (FCFA Entiers)** :  
   Le franc CFA n'a pas de centimes. Aucun montant ne doit utiliser de nombre à virgule flottante. Les montants sont formatés avec des espaces insécables et une protection stricte contre le rognage de la devise (`shrink-0 whitespace-nowrap`).
3. **Hiérarchie visuelle apaisée et statut clair** :  
   Les informations financières critiques (retards d'échéance, encaissements, soldes dus) sont immédiatement identifiables grâce à un code couleur normalisé (Vert, Orange, Rouge, Gris).
4. **Cohérence modulaire stricte** :  
   Toutes les cartes partagent le même rayon (`rounded-2xl`), tous les contrôles partagent la même hauteur et arrondi (`rounded-xl`), et toutes les couleurs proviennent des variables CSS du thème.

---

## 2. Palette de Couleurs & Tokens Sémantiques

La palette est inspirée des interfaces fintech Paydo et Spacebook : un **vert forêt profond**, un **citron vibrant** pour l'accentuation, et des **fonds sauge chaleureux**.

### 2.1 Couleurs Fondatrices

| Token CSS | Hexadécimal | Rôle & Usage |
| :--- | :--- | :--- |
| `--color-forest-950` | `#0a1812` | Arrière-plan sombre de marque, textes d'en-tête principaux, tooltips |
| `--color-forest-900` | `#0f241b` | **Couleur primaire**, boutons principaux, barre latérale, icônes |
| `--color-forest-850` | `#142e23` | État hover des boutons primaires et fonds sombres |
| `--color-forest-800` | `#1a382b` | Bordures de contraste sombre, fonds d'onglets actifs |
| `--color-forest-700` | `#234b3a` | Anneaux de focus (`focus-visible`), bordures actives |
| `--color-lime-500` | `#9dd333` | Bordure d'accent citron, icônes de succès |
| `--color-lime-400` | `#b5e354` | **Couleur d'accent**, puces actives, indicateur "+", monnaie active |
| `--color-lime-300` | `#cbef78` | État hover des éléments citron, badges lumineux |
| `--color-lime-100` | `#f1fcd5` | Arrière-plan de badges d'accent (`bg-lime-100`) |
| `--color-sage-50` | `#f8f9f6` | **Couleur de toile (Canvas)**, arrière-plan global de l'app |
| `--color-sage-100` | `#f0f2ed` | Arrière-plans secondaires, conteneurs d'icônes, badges neutres |
| `--color-sage-200` | `#e2e6dd` | **Couleur de bordure standard (`border-line`)** |
| `--color-sage-300` | `#cfd5c8` | Lignes de séparateur subtiles, ascenseurs (scrollbars) |
| `--color-sage-500` | `#6d7667` | **Texte estompé (`text-ink-muted`)**, sous-titres, libellés de tableau |
| `--color-surface` | `#ffffff` | **Couleur de surface**, cartes, fenêtres, modales, barre supérieure |

### 2.2 Couleurs Sémantiques Métier

Ces couleurs sont strictement attribuées aux statuts des factures et ne doivent pas être altérées :

| Statut | Fond (`bg`) | Texte (`fg`) | Bordure (`border`) | Puce (`dot`) |
| :--- | :--- | :--- | :--- | :--- |
| **Payée** | `bg-emerald-50/90` (`#ecfdf5`) | `text-emerald-800` (`#065f46`) | `border-emerald-200/80` | `bg-emerald-500` |
| **Envoyée** | `bg-amber-50/90` (`#fff8eb`) | `text-amber-800` (`#92400e`) | `border-amber-200/80` | `bg-amber-500` |
| **En retard** | `bg-rose-50/90` (`#fef2f2`) | `text-rose-800` (`#991b1b`) | `border-rose-200/80` | `bg-rose-500 animate-pulse` |
| **Brouillon** | `bg-stone-100/90` (`#f5f5f4`) | `text-stone-700` (`#44403c`) | `border-stone-200/80` | `bg-stone-400` |
| **Annulée** | `bg-stone-100` (`#f5f5f4`) | `text-stone-600` (`#57534e`) | `border-stone-200` | `bg-stone-400` |

---

## 3. Typographie & Règles Numériques

### 3.1 Police & Hiérarchie des Textes

La typographie officielle est **Plus Jakarta Sans**, chargée avec crénage géométrique optimisé pour les interfaces denses.

```css
font-family: "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
```

| Niveau | Classe Tailwind | Taille | Poids | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Titre d'écran (H1)** | `text-xl sm:text-2xl` | 20 / 24 px | 700 (Bold) | Titre de page, en-tête principal |
| **Titre de section (H2)** | `text-base sm:text-lg` | 16 / 18 px | 700 (Bold) | Titre de tableau, graphique, panneau |
| **Titre de carte / sous-titre** | `text-sm sm:text-base` | 14 / 16 px | 600 (Semibold) | Ligne de document, titre de modal |
| **Sur-titre (Overline)** | `text-[11px] sm:text-xs` | 11 / 12 px | 600 (Semibold) | `uppercase tracking-wider text-sage-600` |
| **Corps de texte (Body)** | `text-xs sm:text-sm` | 12 / 14 px | 400 / 500 | Paragraphes, cellules, descriptions |
| **Mention légale / Pied** | `text-[10px] sm:text-[11px]` | 10 / 11 px | 400 / 500 | Dates d'émission, mentions BCEAO, badges |

### 3.2 La Règle d'Or des Montants FCFA

1. **Chiffres tabulaires obligatoires** :  
   Toujours appliquer la classe utilitaire `tabular` (`font-variant-numeric: tabular-nums`) pour aligner parfaitement les colonnes de chiffres.
2. **Format entier avec espace insécable** :  
   `18 450 000 FCFA` (jamais `18450000`, ni `18,450,000`, ni `18 450 000,00 FCFA`).
3. **Protection contre le rognage de la devise** :  
   Le suffixe `FCFA` doit **systématiquement** porter les classes `shrink-0 whitespace-nowrap`.
4. **Composant officiel** :  
   Utiliser `<MoneyDisplay amount={18450000} size="xl" />` pour garantir l'uniformité.

---

## 4. Bordures, Rayons d'Arrondi & Élévations

Pour éviter le "décalage entre les fenêtres", chaque niveau d'élément respecte une règle géométrique stricte :

```
┌────────────────────────────────────────────────────────┐
│ Conteneur d'écran / Fenêtre / Carte : rounded-2xl      │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Bloc imbriqué / Ligne de formulaire : rounded-xl │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │ Boutons / Inputs / Contrôles : rounded-xl  │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
│  Badges & Puces de statut : rounded-full               │
└────────────────────────────────────────────────────────┘
```

### 4.1 Rayons d'Arrondi (Border Radius)

| Rôle | Classe | Valeur | Éléments cibles |
| :--- | :--- | :--- | :--- |
| **Fenêtres & Cartes majeures** | `rounded-2xl` | `1rem` (16 px) | KPI cards, Cashflow chart, Tables, Modales, Welcome banner |
| **Contrôles & Conteneurs internes**| `rounded-xl` | `0.75rem` (12 px) | Boutons, champs de saisie, selects, lignes de prestation |
| **Sous-éléments & Boîtes d'icône** | `rounded-lg` | `0.5rem` (8 px) | Boîtes d'icônes 32x32 px, alertes internes compactes |
| **Badges & Pilules de statut** | `rounded-full` | `9999px` | Badges de statut, pastilles FCFA, puces d'alerte |

### 4.2 Ombres & Élévation (Shadows)

- **Surface standard (Carte)** : `shadow-card`  
  `box-shadow: 0 1px 3px 0 rgb(15 36 27 / 0.04), 0 4px 14px -2px rgb(15 36 27 / 0.03);`
- **Menu déroulant & Popover** : `shadow-dropdown`  
  `box-shadow: 0 10px 25px -5px rgb(15 36 27 / 0.08), 0 8px 10px -6px rgb(15 36 27 / 0.04);`
- **Bouton & Élément interactif** : `shadow-xs` ou `shadow-2xs`
- **Bordure standard** : `border border-line` (`#e2e6dd`)

---

## 5. Composants UI Officiels (Bibliothèque `@/components/ui`)

### 5.1 Boutons (`Button`)

Supporte 7 variantes, 5 tailles, état de chargement avec spinner, et l'indicateur d'action signature DANHOMEY (cercle citron avec `+`).

```tsx
import { Button } from "@/components/ui/button";

// Bouton Primaire Signature (avec pastille citron)
<Button variant="primary" withLimeDot>
  Créer une facture
</Button>

// Bouton Secondaire
<Button variant="secondary" icon={<Download className="w-4 h-4" />}>
  Exporter CSV
</Button>

// Bouton Outline
<Button variant="outline" size="sm">
  Aperçu
</Button>

// Bouton Danger (Annulation)
<Button variant="danger-subtle" size="sm">
  Annuler la facture
</Button>
```

### 5.2 Cartes & Fenêtres (`Card`)

Fournit une structure uniforme pour toutes les fenêtres de l'application :

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

<Card hoverable>
  <CardHeader bordered>
    <CardTitle>Dernières factures</CardTitle>
    <CardDescription>Suivi en temps réel de vos émissions.</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Contenu */}
  </CardContent>
  <CardFooter>
    {/* Pagination ou actions */}
  </CardFooter>
</Card>
```

### 5.3 Badges de Statut Facture (`StatusBadge`)

Comporte **obligatoirement** : la pastille de couleur (`w-1.5 h-1.5`), l'icône SVG Lucide, et le libellé français avec `whitespace-nowrap shrink-0`.

```tsx
import { StatusBadge } from "@/components/ui/status-badge";

<StatusBadge status="paid" />      // Payée (Émeraude avec Check)
<StatusBadge status="sent" />      // Envoyée (Ambre avec Send)
<StatusBadge status="overdue" />   // En retard (Rouge avec AlertTriangle + pulse)
<StatusBadge status="draft" />     // Brouillon (Gris avec FileText)
<StatusBadge status="cancelled" /> // Annulée (Gris avec XCircle)
```

### 5.4 Champs de Saisie & Sélecteurs (`Input`, `Select`)

Comportent label sémantique, icône optionnelle, gestion des messages d'erreur et styles de focus :

```tsx
import { Input, Select } from "@/components/ui";
import { Search } from "lucide-react";

<Input
  label="Recherche"
  icon={<Search className="w-4 h-4" />}
  placeholder="Filtrer par client, numéro..."
/>

<Select
  label="Moyen de paiement"
  options={[
    { value: "mobile_money", label: "Mobile Money (Wave / MTN / Moov / Orange)" },
    { value: "bank_transfer", label: "Virement bancaire" },
    { value: "cash", label: "Espèces" },
  ]}
/>
```

### 5.5 Boîtes de Dialogue & Modales (`Modal`)

Respecte les normes d'accessibilité (fermeture touche Échap, verrouillage de défilement, flou d'arrière-plan `backdrop-blur-xs`) :

```tsx
import { Modal } from "@/components/ui/modal";

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Enregistrer un encaissement"
  description="Saisissez les détails du paiement client reçu."
  footer={
    <>
      <Button variant="outline" onClick={() => setIsOpen(false)}>Annuler</Button>
      <Button variant="primary">Confirmer</Button>
    </>
  }
>
  {/* Contenu du formulaire */}
</Modal>
```

### 5.6 Onglets Segmentés (`Tabs`)

Défilement tactile bord à bord sur mobile (`-mx-3.5 px-3.5`) avec puces de comptage :

```tsx
import { Tabs } from "@/components/ui/tabs";

<Tabs
  tabs={[
    { id: "all", label: "Toutes", count: 48 },
    { id: "paid", label: "Payées", count: 32, dotColor: "bg-emerald-500" },
    { id: "sent", label: "Envoyées", count: 11, dotColor: "bg-amber-500" },
    { id: "overdue", label: "En retard", count: 3, dotColor: "bg-rose-500" },
  ]}
  activeTab={activeTab}
  onChange={setActiveTab}
/>
```

---

## 6. Animations, Transitions & Micro-Interactions

Toutes les micro-interactions utilisent une durée courte (`duration-150` à `duration-200`) pour une sensation instantanée :

1. **Survol de carte** :  
   `hover:border-forest-700/30 hover:shadow-md transition-all`  
   L'icône intérieure grandit légèrement : `group-hover:scale-105 transition-transform`.
2. **Clic sur bouton (Feedback tactile)** :  
   `active:scale-95 transition-transform` (donne un ressenti d'enfoncement physique naturel).
3. **Ouverture de menu déroulant & modal** :  
   `animate-in fade-in-50 zoom-in-95 duration-200`.
4. **Indicateurs d'attention en direct** :  
   - Factures en retard : `animate-pulse` sur la puce rouge.
   - Notifications non lues : `animate-ping` sur la pastille citron.
5. **Survol de la pastille "+"** :  
   `group-hover:rotate-90 transition-transform duration-300` ou `group-hover:scale-110`.

---

## 7. Système d'Espacements & Rythme Vertical (Rhythm System)

Pour éviter tout décalage visuel entre les différentes "fenêtres", les règles d'espacement sont unifiées :

| Zone | Mobile (< 640 px) | Tablette (640 - 1024 px) | Desktop (>= 1024 px) |
| :--- | :--- | :--- | :--- |
| **Hauteur d'en-tête** | `h-14` (56 px) | `h-16` (64 px) | `h-18` (72 px) |
| **Padding d'en-tête** | `px-3` (12 px) | `px-6` (24 px) | `px-8` (32 px) |
| **Padding du conteneur page** | `p-3` (12 px) | `p-6` (24 px) | `p-8` (32 px) |
| **Espacement vertical entre sections** | `space-y-3.5` (14 px) | `space-y-6` (24 px) | `space-y-8` (32 px) |
| **Padding interne d'une carte** | `p-3.5` (14 px) | `p-5` (20 px) | `p-6` (24 px) |
| **Écart de grille KPI (Gap)** | `gap-2.5` (10 px) | `gap-4` (16 px) | `gap-5` (20 px) |

---

## 8. Responsivité & Adaptation Multi-Écrans

### 8.1 Écran Mobile (< 640 px)
- L'en-tête n'affiche **jamais** de fil d'Ariane (`hidden sm:flex`).
- Le bouton de filtre de période affiche une icône calendrier + format court `Nov 26` (`whitespace-nowrap`).
- Les onglets de filtrage s'étendent bord à bord avec `-mx-3.5 px-3.5` et défilent au doigt sans afficher de barre d'ascenseur (`scrollbar-none`).
- Les tableaux denses basculent en vue **Cartes individuelles empilées** avec badge en haut à droite et boutons d'action compacts en bas.
- Les boutons d'action secondaires masquent leur texte secondaire (ex: `<span>WhatsApp</span>` devient icône seule ou libellé court).

### 8.2 Écran Tablette (640 px - 1024 px)
- Grille KPI en 2 colonnes (`sm:grid-cols-2`).
- Barre latérale escamotable (Drawer) contrôlée par le bouton menu hamburger.
- Fil d'Ariane visible.

### 8.3 Écran Ordinateur (>= 1024 px)
- Barre latérale fixe à gauche (`w-72 border-r border-line`).
- Grille KPI en 4 colonnes alignées (`lg:grid-cols-4`).
- Disposition Trésorerie en 2/3 graphique et 1/3 résumé des créances (`lg:grid-cols-3`).
- Tableau TanStack complet avec sélection par case à cocher, colonnes chiffrées alignées à droite et menu d'options.

---

## 9. Guide Anti-Erreurs & Checklist Développeur

Avant d'ajouter toute nouvelle page, formulaire ou composant, vérifiez cette checklist :

- [ ] **Couleurs :** Aucune couleur hexadécimale arbitraire n'a été insérée en dur (`#xxx`). Utiliser uniquement `forest-*`, `lime-*`, `sage-*` et les statuts sémantiques.
- [ ] **Arrondis :** Toutes les cartes et conteneurs ont `rounded-2xl border border-line bg-surface shadow-card`.
- [ ] **Montants FCFA :** Aucun montant à virgule. Utiliser `<MoneyDisplay />` ou `formatFCFA()`. Suffixe `FCFA` protégé par `shrink-0 whitespace-nowrap`. Chiffres avec classe `tabular`.
- [ ] **En-tête Mobile :** Pas de fil d'Ariane visible sur petit écran. Titre sur une seule ligne avec `truncate`.
- [ ] **Statuts :** Statuts affichés avec le composant `<StatusBadge />` officiel (icône + point + texte).
- [ ] **Contrôles :** Tous les boutons et inputs ont l'arrondi `rounded-xl`.
- [ ] **États interactifs :** Chaque bouton a son état `:hover`, `:active:scale-95`, et `:focus-visible`.
- [ ] **Accessibilité :** Attributs `aria-label` sur tous les boutons contenant uniquement une icône.

