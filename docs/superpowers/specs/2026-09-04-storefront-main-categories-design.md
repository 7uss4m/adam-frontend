# Storefront main categories grouping

## Context

This is sub-project 3 (final) of the main-categories effort. Sub-project 1
(backend) and sub-project 2 (admin UI, both merged) let the user create a
fixed set of "main category" buckets and assign existing synced categories to
one. This sub-project makes the storefront home page actually show those
buckets instead of a flat list of every synced category — the original ask.

Confirmed with the user: a category not yet assigned to any bucket simply
won't appear on the storefront until assigned — no catch-all/"Other" group.

## Design

### `src/api/getCategoriesByMainCategory.ts` (new)

Public API call (no admin token needed, matches `getCategories.ts`'s
anonymous pattern) hitting the already-built
`GET {VITE_API_URL}main-categories/:id/categories`:

```ts
export default function getCategoriesByMainCategory(id: number | string) {
  // GET main-categories/${id}/categories, x-api-key header only
}
```

### `src/components/MainCategoryCard.tsx` (new)

A small card mirroring `CategoryCard.tsx`'s exact visual pattern (image tile
+ fallback to `logo.webp` + name label, same classes), but for `MainCategory`
and linking to `/main-categories/:id` instead of `/categories/:id/subs`. Not
merged into `CategoryCard` itself — the two types have different shapes and
different link targets, and `CategoryCard` is also used by the existing
`/categories` page and admin dashboard patterns that shouldn't change.

### `src/main-categories/page.tsx` (new storefront page, route `/main-categories/:id`)

Mirrors `src/categories/page.tsx`'s structure (back button, title, count
badge, responsive grid, loading skeleton) minus the search box (a single
bucket's category count is small enough not to need it). Two queries:
- `getMainCategories()` (already exists) to find the current bucket's name
  for the page title, by matching `:id` from the route params.
- `getCategoriesByMainCategory(id)` (new) for the grid contents.

Each result renders via the existing `CategoryCard` (unchanged) — from here
the flow into `/categories/:id/subs` and onward is exactly what already
works today.

### `src/home/CategorySection.tsx` (modified)

- Replace `getCategories()` with `getMainCategories()` — same loading
  skeleton and empty-state shape, same sort (`safeOrder(order)`,
  `active !== false` filter using `MainCategory.active` instead of
  `Category.available`).
- Replace `CategoryCard` with the new `MainCategoryCard`.
- Drop `viewAllHref="/categories"` from the `SectionHeader` call (the prop
  is optional, so omitting it simply hides the "view all" link) — there's no
  more flat "view all" browse entry point from the home page.

### Untouched

- `src/categories/page.tsx` (the flat browse-all page) stays in the
  codebase as-is, just no longer linked from the home page.
- The entire `/categories/:id/subs` → subcategory → product → purchase flow
  is unchanged.
- Backend and admin UI: no changes.

## Out of scope

- No "Other"/catch-all group for unassigned categories (confirmed with user).
- No changes to `/categories/:id/subs` or anything past it.
- No removal of the `/categories` route or its component — kept for
  potential future use, just unlinked from the home page.
