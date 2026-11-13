# SaaS Facture

Facturation en FCFA pour les entrepreneurs africains. Next.js 16 (App Router), Supabase, Tailwind CSS.

## Démarrer

```bash
npm install
npm run dev
```

Puis ouvrir http://localhost:3000.

## Commandes

| Commande | Rôle |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm test` | Tests unitaires (calculs, formats) |
| `npm run typecheck` | Vérification TypeScript |
| `npm run lint` | ESLint |
| `npm run build` | Build de production |

## Règles qui ne se négocient pas

- Les montants sont des entiers en FCFA. Aucun calcul d'argent en virgule flottante.
- Tout calcul de facture passe par `lib/invoice/totals.ts`, côté client comme côté serveur.
- Le statut « en retard » est déduit de l'échéance (`lib/invoice/status.ts`), jamais stocké.

## Structure

- `app/` : pages (App Router)
- `lib/domain/` : types du domaine
- `lib/invoice/` : totaux, statuts, numérotation, montant en lettres
- `lib/format/` : monnaie et dates
- `tests/unit/` : tests Vitest
