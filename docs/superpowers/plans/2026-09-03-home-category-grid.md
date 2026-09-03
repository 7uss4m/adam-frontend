# Home Page Category Grid Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the storefront home page's icon-scroll category row with a
responsive grid of real category-image cards, matching the layout style from
the user's reference screenshot, by extracting and reusing the existing
`CategoryCard` pattern from the `/categories` page.

**Architecture:** Extract the card markup already used on `/categories`
(`src/categories/page.tsx`) into a standalone, shared component. Both
`/categories` and the home page's category section then render that same
component in a CSS grid, driven by the same `getCategories()` query and
sort/filter logic that's already in place. No API, type, or routing changes.

**Tech Stack:** React + TypeScript, Vite, Tailwind CSS, `@tanstack/react-query`,
`framer-motion`, `react-router-dom`. No test runner configured in this repo —
verification is `npm run typecheck`, `npm run lint`, and manual checks with
`npm run dev`.

## Global Constraints

- Follow the existing per-file responsibility pattern: card markup lives in
  its own component file, not duplicated across pages.
- Use the project's existing theme tokens (`bg-card`, `border-border`,
  `text-foreground`, `text-muted-foreground`, `text-primary`) — no new colors
  or a purple theme; the reference screenshot's *layout*, not its palette, is
  what's being adopted.
- `npm run build` (`tsc -b && vite build`) must succeed after each task —
  this repo's build implies typecheck, so a type error fails the build.
- `npm run lint` must pass with `--max-warnings 0`.
- No changes to `src/api/getCategories.ts`, `src/types/types.ts`, or backend
  code — this is a Frontend-only presentational change.

---

### Task 1: Extract shared `CategoryCard` component

**Files:**
- Create: `Frontend/src/components/CategoryCard.tsx`
- Modify: `Frontend/src/categories/page.tsx:1-39` (remove inline `CategoryCard`, import the new one)

**Interfaces:**
- Produces: `CategoryCard` — default export from `src/components/CategoryCard.tsx`, props `{ cat: Category; index: number }` (same signature as the current inline component), renders a `Link` to `/categories/${cat.id}/subs` wrapping an image tile (`cat.image`, falling back to `logo.webp` on error) and a name label below.
- Consumes: `Category` type from `../types/types`, `logo.webp` from `../assets/logo.webp`.

- [ ] **Step 1: Create the shared component file**

Create `Frontend/src/components/CategoryCard.tsx`:

```tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import type { Category } from "../types/types";
import logo from "../assets/logo.webp";

export default function CategoryCard({
  cat,
  index,
}: {
  cat: Category;
  index: number;
}) {
  const [imgSrc, setImgSrc] = useState(cat.image || logo);

  return (
    <Link to={`/categories/${cat.id}/subs`} data-index={index}>
      <div className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-colors duration-200 hover:border-primary/40 cursor-pointer">
        <div className="relative aspect-square overflow-hidden">
          <img
            src={imgSrc}
            alt={cat.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={() => setImgSrc(logo)}
          />
        </div>

        <div className="px-3 py-2.5">
          <p className="text-sm font-bold text-foreground line-clamp-1 text-center">
            {cat.name}
          </p>
        </div>
      </div>
    </Link>
  );
}
```

Note: `index` is kept in the props signature (and stamped as `data-index` on
the link) purely so the call sites in Task 1 Step 2 and Task 2 don't need to
change their `.map((cat, i) => <CategoryCard key={cat.id} cat={cat} index={i} />)`
call shape — the original inline component accepted the same prop without
using it either.

- [ ] **Step 2: Update `Frontend/src/categories/page.tsx` to use the shared component**

Remove lines 1-39's inline `CategoryCard` function and its now-unused
`useState` usage for that function (the page's own `useState` for `search`
on line 42 stays). Replace the top of the file:

```tsx
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import getCategories from "../api/getCategories";
import type { Category } from "../types/types";
import CategoryCard from "../components/CategoryCard";

function safeOrder(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 999999;
}
```

(This deletes the old `import logo from "../assets/logo.webp";` line and the
entire inline `function CategoryCard(...) { ... }` block — the rest of
`CategoriesPage` below it is unchanged.)

- [ ] **Step 3: Verify the build and lint pass**

Run: `cd Frontend && npm run build`
Expected: exits 0, no TypeScript errors.

Run: `npm run lint`
Expected: exits 0, no warnings/errors.

- [ ] **Step 4: Manual check**

Run: `npm run dev`, open the app, navigate to `/categories`.
Expected: the grid of category cards still renders exactly as before
(image + name, same hover effect) — this task is a pure refactor with no
visual change on this page.

- [ ] **Step 5: Commit**

```bash
git add src/components/CategoryCard.tsx src/categories/page.tsx
git commit -m "Extract shared CategoryCard component from categories page"
```

---

### Task 2: Rework home page `CategorySection` to use the image grid

**Files:**
- Modify: `Frontend/src/home/CategorySection.tsx` (full rewrite of the component body; `SectionHeader` and `safeOrder` imports/usage stay)

**Interfaces:**
- Consumes: `CategoryCard` from `../components/CategoryCard` (Task 1), `Category` type from `../types/types`, `getCategories` from `../api/getCategories`, `SectionHeader` from `./SectionHeader`, `safeOrder` from `./home-utils`.
- Produces: no exports consumed elsewhere — `CategorySection` remains the default export used by `src/home/page.tsx`, same as today, with the same no-prop signature.

- [ ] **Step 1: Rewrite `Frontend/src/home/CategorySection.tsx`**

Replace the entire file with:

```tsx
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import getCategories from "../api/getCategories";
import type { Category } from "../types/types";
import CategoryCard from "../components/CategoryCard";
import SectionHeader from "./SectionHeader";
import { safeOrder } from "./home-utils";

export default function CategorySection() {
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await getCategories();
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
    <section className="py-4">
      <SectionHeader
        icon={Sparkles}
        title="الأقسام"
        subtitle="تصفّح حسب نوع المنتج"
        viewAllHref="/categories"
        accent="text-cyan-400"
      />

      {categoriesQuery.isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
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
      ) : categories.length ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {categories.map((cat, i) => (
            <CategoryCard key={cat.id} cat={cat} index={i} />
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

This drops `ICON_RULES`/`iconFor`/`CategoryItem`, the `framer-motion` /
`LayoutGrid` / per-icon lucide imports, and the `.slice(0, 8)` truncation +
inline "view all" tile, per the design spec
(`docs/superpowers/specs/2026-09-03-home-category-grid-design.md`).

- [ ] **Step 2: Verify the build and lint pass**

Run: `cd Frontend && npm run build`
Expected: exits 0, no TypeScript errors (in particular, confirm no leftover
references to removed imports like `motion`, `LayoutGrid`, or the deleted
`Category` icon-matching helpers).

Run: `npm run lint`
Expected: exits 0, no unused-import warnings.

- [ ] **Step 3: Manual check**

Run: `npm run dev`, open the home page (`/`).
Expected:
- The category section now renders as a 2-column (mobile) / 4-column
  (`sm:` and up) grid of image cards instead of a horizontal icon-scroll row.
- Each card shows the category's real image (or the `logo.webp` fallback)
  and its name, and clicking one navigates to `/categories/:id/subs`.
- The "عرض الكل" (view all) link in the section header still navigates to
  `/categories`, which still works and looks the same as before Task 1.
- Loading state (throttle network in devtools, or reload) shows a skeleton
  grid instead of a skeleton scroll row.

- [ ] **Step 4: Commit**

```bash
git add src/home/CategorySection.tsx
git commit -m "Show home page categories as an image grid instead of icon scroll"
```
