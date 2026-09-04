# Storefront Main Categories Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the storefront home page show the fixed "main category" buckets
(built in prior sub-projects) instead of a flat list of every synced
category, with a new page to browse the categories inside one bucket.

**Architecture:** One new public API call, one new small card component, one
new storefront page (all self-contained, Task 1), then a small swap of the
home page's data source and card component (Task 2).

**Tech Stack:** React + TypeScript, Vite, Tailwind CSS, `@tanstack/react-query`,
`react-router-dom`, axios.

## Global Constraints

- `npm run build` (`vite build`) must succeed after each task. Note: this
  repo's `build` script does NOT run `tsc -b` (despite some stale docs
  claiming otherwise) — also run `npm run typecheck` (`tsc -b`) to confirm no
  new type errors in touched files; this repo has a large pre-existing
  baseline of unrelated type errors elsewhere, which is not this plan's
  concern.
- `npm run lint` must pass with `--max-warnings 0` in touched files (same
  pre-existing-baseline caveat).
- A category not yet assigned to any main category is simply not shown
  anywhere on the storefront — no catch-all/"Other" group (confirmed).
- Don't touch `/categories/:id/subs` or anything past it in the existing
  flow, or the admin dashboard.
- After any verification run (`npm run build`/`dev`), check `git status` for
  regenerated `dist/` files (this repo commits its build output) and revert
  them with `git checkout HEAD -- dist/` before committing — they're
  verification noise, not part of this plan's diff.

---

### Task 1: Public API call, card component, and the new browse-a-bucket page

**Files:**
- Create: `Frontend/src/api/getCategoriesByMainCategory.ts`
- Create: `Frontend/src/components/MainCategoryCard.tsx`
- Create: `Frontend/src/main-categories/page.tsx`
- Modify: `Frontend/src/main.tsx`

**Interfaces:**
- Consumes: `MainCategory`, `Category` types from `../types/types`; `getMainCategories` from `../api/getMainCategories` (both already exist from the prior sub-project); `CategoryCard` from `../components/CategoryCard` (already exists, unchanged).
- Produces: `getCategoriesByMainCategory(id: number | string)` default export, consumed by this task's own page and by Task 2 is NOT needed (Task 2 only needs `MainCategoryCard` and `getMainCategories`). `MainCategoryCard` default export with props `{ mc: MainCategory }`, consumed by Task 2.

- [ ] **Step 1: `getCategoriesByMainCategory.ts`**

Create `Frontend/src/api/getCategoriesByMainCategory.ts`:

```ts
import axios from "axios";

export default function getCategoriesByMainCategory(id: number | string) {
  const apiUrl = `${import.meta.env.VITE_API_URL}main-categories/${id}/categories`;
  return axios
    .get(apiUrl, {
      headers: {
        "x-api-key": import.meta.env.VITE_API_KEY,
      },
    })
    .then((res) => res)
    .catch((error) => {
      console.error(error);
      return error;
    });
}
```

(Matches `getCategories.ts`'s anonymous, no-token pattern exactly — this is
a public storefront call, same as the backend route requires no auth.)

- [ ] **Step 2: `MainCategoryCard.tsx`**

Create `Frontend/src/components/MainCategoryCard.tsx`:

```tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import type { MainCategory } from "../types/types";
import logo from "../assets/logo.webp";

export default function MainCategoryCard({ mc }: { mc: MainCategory }) {
  const [imgSrc, setImgSrc] = useState(mc.image || logo);

  return (
    <Link to={`/main-categories/${mc.id}`}>
      <div className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-colors duration-200 hover:border-primary/40 cursor-pointer">
        <div className="relative aspect-square overflow-hidden">
          <img
            src={imgSrc}
            alt={mc.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={() => setImgSrc(logo)}
          />
        </div>

        <div className="px-3 py-2.5">
          <p className="text-sm font-bold text-foreground line-clamp-1 text-center">
            {mc.name}
          </p>
        </div>
      </div>
    </Link>
  );
}
```

(Byte-for-byte the same visual pattern as `CategoryCard.tsx`, just typed for
`MainCategory` and linking to `/main-categories/:id` instead of
`/categories/:id/subs` — kept as a separate file per the design spec, since
the two types and link targets differ and `CategoryCard` is used elsewhere
unchanged.)

- [ ] **Step 3: `src/main-categories/page.tsx`**

Create `Frontend/src/main-categories/page.tsx`:

```tsx
import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import getMainCategories from "../api/getMainCategories";
import getCategoriesByMainCategory from "../api/getCategoriesByMainCategory";
import type { Category, MainCategory } from "../types/types";
import CategoryCard from "../components/CategoryCard";

function safeOrder(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 999999;
}

export default function MainCategoryCategoriesPage() {
  const { id } = useParams<{ id: string }>();

  const mainCategoriesQuery = useQuery({
    queryKey: ["main-categories"],
    queryFn: async () => {
      const res = await getMainCategories();
      return (res.data?.result ?? []) as MainCategory[];
    },
  });

  const currentMainCategory = useMemo(
    () => mainCategoriesQuery.data?.find((mc) => String(mc.id) === id),
    [mainCategoriesQuery.data, id]
  );

  const categoriesQuery = useQuery({
    queryKey: ["main-categories", id, "categories"],
    enabled: !!id,
    queryFn: async () => {
      const res = await getCategoriesByMainCategory(id as string);
      return (res.data?.result ?? res.data) as Category[];
    },
    refetchOnWindowFocus: false,
  });

  const categories = useMemo(() => {
    const list = categoriesQuery.data || [];
    return list
      .filter((c) => c?.available !== false)
      .sort((a, b) => safeOrder(a.order) - safeOrder(b.order));
  }, [categoriesQuery.data]);

  return (
    <section className="py-10">
      <div className="container max-w-[100%] md:max-w-[90%] lg:max-w-[80%] px-4">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <Link to="/" className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors">
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </Link>
          <div className="w-1 h-7 rounded-full bg-gradient-to-b from-primary to-accent" />
          <h1 className="text-2xl font-black text-foreground">
            {currentMainCategory?.name ?? ""}
          </h1>
          {categories.length > 0 && (
            <span className="text-xs font-bold text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
              {categories.length}
            </span>
          )}
        </motion.div>

        {categoriesQuery.isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-white/5">
                <div className="aspect-square animate-pulse bg-secondary" />
                <div className="px-3 py-3">
                  <div className="h-3 w-2/3 mx-auto rounded animate-pulse bg-secondary" />
                </div>
              </div>
            ))}
          </div>
        ) : categories.length ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} cat={cat} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
            لا يوجد أقسام حالياً
          </div>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Register the route**

In `Frontend/src/main.tsx`, add the import near the other storefront page
imports (directly after `import CategoriesPage from "./categories/page";`):

```ts
import MainCategoryCategoriesPage from "./main-categories/page";
```

Then add the route entry among the other storefront (MainLayout) children,
directly after:

```tsx
      {
        path: "categories",
        element: <CategoriesPage />,
      },
```

insert:

```tsx
      {
        path: "main-categories/:id",
        element: <MainCategoryCategoriesPage />,
      },
```

- [ ] **Step 5: Verify build and lint**

Run: `cd Frontend && npm run build`
Expected: exits 0.

Run: `npm run typecheck`
Expected: no new errors referencing `getCategoriesByMainCategory`,
`MainCategoryCard`, or `main-categories/page` (pre-existing unrelated
errors elsewhere are expected and not this task's concern).

Run: `npm run lint`
Expected: exits 0 for the touched/created files (pre-existing baseline
warnings elsewhere are expected).

- [ ] **Step 6: Manual check**

Run: `npm run dev`. Since the home page hasn't been switched over yet
(Task 2), navigate directly to `/main-categories/<id>` for an id that
exists in your `main_categories` table (check via the admin dashboard's
Main Categories page, or use `1` if that's the first one you created).
Expected: page loads, shows the bucket's name as the title, and a grid of
whatever categories are currently assigned to it (empty state if none are
assigned yet).

- [ ] **Step 7: Commit**

```bash
git add src/api/getCategoriesByMainCategory.ts src/components/MainCategoryCard.tsx src/main-categories/page.tsx src/main.tsx
git commit -m "Add storefront page to browse categories inside a main category"
```

---

### Task 2: Switch the home page to show main-category buckets

**Files:**
- Modify: `Frontend/src/home/CategorySection.tsx`

**Interfaces:**
- Consumes: `getMainCategories` from `../api/getMainCategories`, `MainCategory` type, `MainCategoryCard` from `../components/MainCategoryCard` (Task 1).
- Produces: no exports consumed elsewhere — `CategorySection` remains the default export used by `src/home/page.tsx`, same as today.

- [ ] **Step 1: Rewrite `Frontend/src/home/CategorySection.tsx`**

Replace the entire file with:

```tsx
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import getMainCategories from "../api/getMainCategories";
import type { MainCategory } from "../types/types";
import MainCategoryCard from "../components/MainCategoryCard";
import SectionHeader from "./SectionHeader";
import { safeOrder } from "./home-utils";

export default function CategorySection() {
  const mainCategoriesQuery = useQuery({
    queryKey: ["main-categories"],
    queryFn: async () => {
      const res = await getMainCategories();
      return (res.data?.result ?? []) as MainCategory[];
    },
    refetchOnWindowFocus: false,
  });

  const mainCategories = useMemo(() => {
    const list = mainCategoriesQuery.data || [];
    return list
      .filter((mc) => mc?.active !== false)
      .sort((a, b) => safeOrder(a.order) - safeOrder(b.order));
  }, [mainCategoriesQuery.data]);

  return (
    <section className="py-4">
      <SectionHeader
        icon={Sparkles}
        title="الأقسام"
        subtitle="تصفّح حسب نوع المنتج"
        accent="text-cyan-400"
      />

      {mainCategoriesQuery.isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-border"
            >
              <div className="aspect-square animate-pulse bg-secondary" />
              <div className="px-3 py-3">
                <div className="mx-auto h-3 w-2/3 animate-pulse rounded bg-secondary" />
              </div>
            </div>
          ))}
        </div>
      ) : mainCategories.length ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {mainCategories.map((mc) => (
            <MainCategoryCard key={mc.id} mc={mc} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          لا يوجد أقسام حالياً
        </div>
      )}
    </section>
  );
}
```

This drops the `viewAllHref="/categories"` prop (optional on
`SectionHeader`, so simply omitting it removes the "view all" link) and
switches the data source/card component from categories to main categories,
per the design spec.

- [ ] **Step 2: Verify build and lint**

Run: `cd Frontend && npm run build`
Expected: exits 0.

Run: `npm run typecheck`
Expected: no new errors referencing `CategorySection.tsx`.

Run: `npm run lint`
Expected: exits 0 for this file.

- [ ] **Step 3: Manual check**

Run: `npm run dev`, open the home page (`/`).
Expected:
- The category section now shows the main-category buckets (image + name)
  in the same grid layout as before, instead of every synced category.
- There is no more "عرض الكل" (view all) link in this section's header.
- Clicking a bucket navigates to `/main-categories/:id` (Task 1's page) and
  shows the categories assigned to it.
- Loading state shows the same skeleton grid as before.
- If no main categories exist yet, the empty state message shows.

- [ ] **Step 4: Commit**

```bash
git add src/home/CategorySection.tsx
git commit -m "Show main-category buckets on the home page instead of a flat category list"
```
