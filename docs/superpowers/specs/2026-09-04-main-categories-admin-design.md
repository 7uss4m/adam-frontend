# Main categories admin UI (frontend)

## Context

This is sub-project 2 of a 3-part effort (backend → admin UI → storefront home
page) to let the user group their unbounded, externally-synced `categories`
under a fixed, manually-curated set of "main categories" (matching a
reference screenshot: top-level buckets like "Games", "Digital Cards", "App
Recharging", each containing several real categories).

Sub-project 1 (backend, on branch `feature/main-categories` in the backend
repo) added a `main_categories` table and API
(`GET/POST/PUT/DELETE /adam/api/main-categories`,
`GET /adam/api/main-categories/:id/categories`), plus an optional
`main_category_id` field on the existing `categories` create/update
endpoints, gated by a new `"main_categories"` permission key.

This spec covers the admin dashboard work needed before the user can actually
use any of that: a page to create/edit/delete the main-category buckets, and
a way to assign an existing category to one.

## Design

### New dashboard resource: `src/dashboard/main-categories/`

Deliberately simpler than the `categories` dashboard page — with a small,
fixed set of buckets (around 8), the stats cards, search/filter toolbar, and
card/table view toggle that `categories` has would be over-engineering.

Files (mirroring the `categories` resource's naming and mutation/dialog
patterns, minus the extra chrome):

- `page.tsx` — `DashboardMainCategories` default export. Header + an "Add"
  button opening `AddMainCategoryForm`, and a `DataTable` (reusing the
  existing generic `src/dashboard/categories/data-table.tsx` component)
  showing all main categories.
- `columns.tsx` — `createColumns(t, query): ColumnDef<MainCategory>[]` with
  columns: image thumbnail + name, order, active status badge, actions
  (`MainCategoryRowActions`, opening edit/delete).
- `add-main-category-form.tsx` — shadcn `Dialog`, uncontrolled refs for
  `name` (text) and `image` (file), controlled state for `order`. On submit,
  calls `postMainCategory`; on success, toast + invalidate the
  `["main-categories"]` query.
- `edit-main-category-form.tsx` — same field set plus `active` toggle,
  pre-filled from the row; calls `putMainCategory`; on success, toast +
  `query.refetch()`.
- `delete-main-category-form.tsx` — shadcn `AlertDialog`; calls
  `deleteMainCategory`; on success, toast + `query.refetch()`.
- `main-category-row-actions.tsx` — dropdown/buttons wiring edit/delete
  dialogs to a row, mirroring `category-row-actions.tsx`.

No stats cards, no search bar, no card/grid view toggle, no
`main-category-utils.ts` beyond a plain `MainCategory` type — none of that
machinery is warranted for this dataset's size.

### API files (`src/api/`)

Four new files, all built on `putCategory.ts`'s real-`FormData` upload
pattern (not `postCategory.ts`'s plain-object pattern, which doesn't
actually produce multipart form data — an existing bug in that file, not
something to propagate into new code):

- `getMainCategories.ts`: `getMainCategories({ token })` →
  `GET {VITE_API_URL}main-categories`, with `x-api-key` and
  `Authorization: Bearer` headers (mirrors `getCategories.ts`).
- `postMainCategory.ts`: `postMainCategory(token, name, order, image: File)`
  → builds a `FormData`, `POST {VITE_API_URL}main-categories`.
- `putMainCategory.ts`: `putMainCategory(token, id, payload: { name?, order?, active?, image? })`
  → builds a `FormData` from whatever fields are present, `PUT {VITE_API_URL}main-categories/${id}`.
- `deleteMainCategory.ts`: `deleteMainCategory(token, id)` →
  `DELETE {VITE_API_URL}main-categories/${id}`.

### Routing, navigation, permissions, i18n

- `src/main.tsx`: add
  `{ path: "main-categories", element: <DashboardMainCategories /> }`
  alongside the existing `categories` dashboard routes.
- `src/layouts/DashboardLayout.tsx`: add a `NavItem` for Main Categories to
  the existing `"catalog"` nav group (same group as Categories/Products), add
  an entry to `PAGE_TITLE_KEYS` for the new path, and add
  `"/main-categories": "main_categories"` to `ROUTE_PERMISSION_MAP` so
  employees without the permission don't see it in the sidebar (matching how
  `categories` is already gated there — this is nav-filtering only, not a
  route guard, consistent with the existing pattern for every other
  resource).
- `src/dashboard/admins/permissions-config.ts`: add `"main_categories"` to
  `ALL_PERMISSIONS`, assign it to the same permission group `"categories"`
  is in, and add its label key to `PERMISSION_LABEL_KEYS` — so an admin can
  grant this permission to an employee through the existing admin-permissions
  editor UI.
- `src/locales/ar/global.json` and `src/locales/en/global.json`: add the new
  translation keys used by the page/forms/nav/permission label (e.g.
  `main_categories`, `add_main_category`, `edit_main_category`,
  `delete_main_category`, `no_main_categories`, `assign_main_category`,
  `none` — reusing any of these keys that already exist in either locale
  file instead of duplicating them).

### Assigning a category to a main category

Both `src/dashboard/categories/add-category-form.tsx` and
`edit-category-form.tsx` gain a new shadcn `<Select>` field, "Assign to main
category" — copying the exact `Select`/`SelectTrigger`/`SelectValue`/
`SelectContent`/`SelectItem` JSX pattern already present (but never actually
wired to its mutation) in
`src/dashboard/categories/allsubcategories/edit-sub-form.tsx`, this time
correctly wired:

- Options are populated from a `useQuery` on `getMainCategories`.
- A leading `SelectItem` with a sentinel value (e.g. `"none"`) represents "no
  main category" — shadcn `Select` doesn't allow an empty-string item value,
  so the sentinel is translated to `null` before being sent to the API.
- `EditCategoryForm` initializes the selected value from the category's
  current `main_category_id` (now returned by `getCategories`'s admin list
  per the backend's Task-2-review fix) — `null`/`undefined` maps to the
  `"none"` sentinel.
- `AddCategoryForm`'s field is optional and defaults to `"none"`.
- Both forms' mutations extend their payload with `main_category_id` (number
  or `null`), and `putCategory.ts`/`postCategory.ts` are extended to append
  it to the `FormData`/payload they already build (only when the field is
  present and not `undefined`, to match `putCategory.ts`'s existing pattern
  of conditionally appending optional fields).

## Out of scope

- No changes to the storefront home page or any public-facing route — that's
  sub-project 3.
- No route-level permission guard (redirect/block) — the existing frontend
  pattern only ever hides nav items, it doesn't guard the route itself; this
  spec doesn't change that pattern for any resource, main-categories
  included, since doing so would be a larger, unrelated change.
- No fix to `postCategory.ts`'s pre-existing broken multipart pattern for
  the *existing* category-create flow — only the new main-category API files
  use the correct pattern; not touching working (if imperfectly built)
  existing code that's out of this feature's scope.
- No stats/aggregate UI for main categories (the backend doesn't expose any
  either, per its own spec).
