# Home page: category grid redesign

## Context

The storefront home page (`src/home/page.tsx`) currently shows parent categories
via `CategorySection.tsx` as a horizontal scroll row of icon-circles, where the
icon is guessed client-side from the category name (`ICON_RULES` keyword
matching in `src/home/CategorySection.tsx`). The user wants the main idea from
a reference screenshot: parent categories shown as a grid of image cards
(icon/illustration + label), similar to the pattern already used on the
`/categories` page (`CategoryCard` in `src/categories/page.tsx`).

Categories already carry a real `image` field (`Category.image` in
`src/types/types.ts`) and `getCategories()` (`src/api/getCategories.ts`)
already returns only the parent-level categories — subcategories are fetched
separately via `getSubCategories.ts` keyed by `parent_id`. So no new API work
or data-shape changes are needed; this is a presentation-only change scoped to
the Frontend repo.

## Design

1. **Extract a shared `CategoryCard` component** to
   `src/components/CategoryCard.tsx`, based on the existing implementation in
   `src/categories/page.tsx` (image tile with `object-cover`, fallback to
   `logo.webp` on load error, name label below, links to
   `/categories/:id/subs`). Both `src/categories/page.tsx` and the home page's
   category section import this shared component instead of each defining
   their own.

2. **Rework `src/home/CategorySection.tsx`**:
   - Remove `ICON_RULES`, `iconFor()`, and the lucide icon imports used for
     keyword-matched icons — no longer needed since real category images are
     used instead.
   - Replace the horizontal-scroll `CategoryItem` list with a responsive grid
     of `CategoryCard` (`grid grid-cols-2 sm:grid-cols-4 gap-4`), matching the
     reference screenshot's 2/4-column layout.
   - Remove the `.slice(0, 8)` truncation — render all categories returned by
     `getCategories()`, since that list is already just the parent
     categories (a small, finite set), not paginated/large data.
   - Remove the inline "View all" grid tile (no longer needed once all
     categories are shown), but keep the existing `SectionHeader` with its
     `viewAllHref="/categories"` link — it still serves as a shortcut to the
     search/browse view.
   - Update the loading skeleton to render skeleton grid cells (image
     placeholder + text placeholder) matching the new card shape, replacing
     the old circle+label skeleton.
   - Keep the `useQuery(["categories"])` fetch, `available !== false` filter,
     and `safeOrder` sort exactly as they are today.

3. **No changes** to `HeroBanner.tsx`, `home/page.tsx`'s composition, routing,
   theme tokens, or any other home page section.

## Out of scope

- No visual theme change (stays on the existing cyan/blue accent scheme, not
  the reference screenshot's purple).
- No backend or API changes.
- No changes to the `/categories` page's behavior beyond importing the now-
  shared `CategoryCard`.
