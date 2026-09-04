# Main Categories Admin UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the admin dashboard UI for sub-project 2: a page to
create/edit/delete the fixed "main category" buckets, and a way to assign an
existing category to one — on top of the backend API already built on the
`feature/main-categories` branch in the backend repo.

**Architecture:** A new, deliberately minimal dashboard resource
(`src/dashboard/main-categories/`) mirroring the existing `categories`
resource's Dialog/AlertDialog/DataTable conventions but without its stats
cards, search bar, or card/grid toggle (unwarranted for a small, fixed
dataset). New `src/api/*MainCategory*.ts` files built on `putCategory.ts`'s
correct real-`FormData` upload pattern. The existing `categories` add/edit
forms gain one new field to actually assign a category to a bucket.

**Tech Stack:** React + TypeScript, Vite, Tailwind CSS, shadcn/ui,
`@tanstack/react-query`, `@tanstack/react-table`, `react-i18next`, axios.

## Global Constraints

- Backend API this UI calls (already built, not part of this plan):
  `GET/POST/PUT/DELETE {VITE_API_URL}main-categories`,
  `GET {VITE_API_URL}main-categories/:id/categories`, all needing
  `x-api-key` + (for POST/PUT/DELETE) `Authorization: Bearer <token>`
  headers, gated by a `"main_categories"` permission key. `categories`'
  create/update endpoints now also accept an optional `main_category_id`
  (number or `null`) field.
- `npm run build` (`tsc -b && vite build`) must succeed after each task.
- `npm run lint` must pass with `--max-warnings 0`.
- New user-facing strings go into BOTH `src/locales/ar/global.json` and
  `src/locales/en/global.json` (this project defaults to Arabic).
- Follow existing per-resource file conventions exactly — do not introduce a
  card/grid view, stats cards, or search bar for main categories; the
  dataset is small and fixed (~8 rows).
- No changes to the storefront home page or any public route — that's
  sub-project 3.
- Do not fix `postCategory.ts`'s pre-existing broken multipart pattern —
  only new main-category API files use the correct real-`FormData` pattern.

---

### Task 1: Types + main-categories API client

**Files:**
- Modify: `Frontend/src/types/types.ts:53-69` (the `Category` type)
- Create: `Frontend/src/api/getMainCategories.ts`
- Create: `Frontend/src/api/postMainCategory.ts`
- Create: `Frontend/src/api/putMainCategory.ts`
- Create: `Frontend/src/api/deleteMainCategory.ts`

**Interfaces:**
- Produces: `MainCategory` type (`{ id: number; name: string; image: string; active: boolean; order: number }`) in `types.ts`, consumed by Task 2. `Category` gains `main_category_id?: number | null`, consumed by Task 4. `getMainCategories`, `postMainCategory`, `putMainCategory`, `deleteMainCategory` default exports, consumed by Task 2.

- [ ] **Step 1: Add the `MainCategory` type and extend `Category`**

In `Frontend/src/types/types.ts`, change:

```ts
export type Category = {
  id: number,
  name: string,
  image: string,
  type: "one" | "bundle";
  bonus: number
  available: boolean
  active?: boolean
  order: string
  parent_id?: number | null
  source?: string | null
  external_id?: number | null
  sub_count?: number
  product_count?: number
  profit?: number
  // visible: boolean
}
```

to:

```ts
export type Category = {
  id: number,
  name: string,
  image: string,
  type: "one" | "bundle";
  bonus: number
  available: boolean
  active?: boolean
  order: string
  parent_id?: number | null
  main_category_id?: number | null
  source?: string | null
  external_id?: number | null
  sub_count?: number
  product_count?: number
  profit?: number
  // visible: boolean
}

export type MainCategory = {
  id: number,
  name: string,
  image: string,
  active: boolean,
  order: number,
}
```

(Insert `MainCategory` directly after `Category`'s closing `}`, before
`SubCategory`.)

- [ ] **Step 2: `getMainCategories.ts`**

Create `Frontend/src/api/getMainCategories.ts`:

```ts
import axios from "axios";

type GetMainCategoriesParams = {
  token?: string;
};

export default function getMainCategories(params?: GetMainCategoriesParams) {
  const apiUrl = `${import.meta.env.VITE_API_URL}main-categories`;
  const headers: Record<string, string> = {
    "x-api-key": import.meta.env.VITE_API_KEY,
  };

  if (params?.token) {
    headers.Authorization = `Bearer ${params.token}`;
  }

  return axios.get(apiUrl, { headers }).then((res) => res);
}
```

- [ ] **Step 3: `postMainCategory.ts`**

Create `Frontend/src/api/postMainCategory.ts`:

```ts
import axios from "axios";

export default function postMainCategory(
  token: string,
  name: string,
  order: number,
  image: File
) {
  const apiUrl = `${import.meta.env.VITE_API_URL}main-categories`;
  const form = new FormData();
  form.append("name", name);
  form.append("order", String(order));
  form.append("image", image);

  return axios
    .post(apiUrl, form, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-api-key": import.meta.env.VITE_API_KEY,
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => res);
}
```

- [ ] **Step 4: `putMainCategory.ts`**

Create `Frontend/src/api/putMainCategory.ts`:

```ts
import axios from "axios";

type PutMainCategoryPayload = {
  name?: string;
  order?: number;
  active?: boolean;
  image?: File;
};

export default function putMainCategory(
  token: string,
  id: string,
  payload: PutMainCategoryPayload
) {
  const apiUrl = `${import.meta.env.VITE_API_URL}main-categories/${id}`;
  const form = new FormData();
  if (payload.name !== undefined) form.append("name", payload.name);
  if (payload.order !== undefined) form.append("order", String(payload.order));
  if (payload.active !== undefined) form.append("active", String(payload.active));
  if (payload.image) form.append("image", payload.image);

  return axios
    .put(apiUrl, form, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-api-key": import.meta.env.VITE_API_KEY,
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => res);
}
```

- [ ] **Step 5: `deleteMainCategory.ts`**

Create `Frontend/src/api/deleteMainCategory.ts`:

```ts
import axios from "axios";

export default function deleteMainCategory(token: string, id: string) {
  const apiUrl = `${import.meta.env.VITE_API_URL}main-categories/${id}`;
  return axios
    .delete(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-api-key": import.meta.env.VITE_API_KEY,
      },
    })
    .then((res) => res);
}
```

- [ ] **Step 6: Verify build and lint**

Run: `cd Frontend && npm run build`
Expected: exits 0, no TypeScript errors.

Run: `npm run lint`
Expected: exits 0, no warnings.

- [ ] **Step 7: Commit**

```bash
git add src/types/types.ts src/api/getMainCategories.ts src/api/postMainCategory.ts src/api/putMainCategory.ts src/api/deleteMainCategory.ts
git commit -m "Add main categories API client and types"
```

---

### Task 2: Main categories dashboard resource (page, table, forms)

**Files:**
- Create: `Frontend/src/dashboard/main-categories/page.tsx`
- Create: `Frontend/src/dashboard/main-categories/columns.tsx`
- Create: `Frontend/src/dashboard/main-categories/data-table.tsx`
- Create: `Frontend/src/dashboard/main-categories/add-main-category-form.tsx`
- Create: `Frontend/src/dashboard/main-categories/edit-main-category-form.tsx`
- Create: `Frontend/src/dashboard/main-categories/main-category-row-actions.tsx`

Note: unlike `categories`, there's no separate `delete-*-form.tsx` file —
the existing `category-row-actions.tsx` doesn't use `delete-category-form.tsx`
either; it has its own inline `AlertDialog` + delete mutation. This resource
follows that same, actually-used pattern rather than the spec's literal file
list.

**Interfaces:**
- Consumes: `MainCategory` type and the four API functions from Task 1.
- Produces: `DashboardMainCategories` default export from `page.tsx`,
  consumed by Task 3's route registration. Uses translation keys
  `main_categories`, `add_main_category`, `edit_main_category` — added in
  Task 3.

- [ ] **Step 1: `data-table.tsx`**

Create `Frontend/src/dashboard/main-categories/data-table.tsx`:

```tsx
import { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useTranslation } from "react-i18next";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import type { MainCategory } from "../../types/types";

interface DataTableProps {
  columns: ColumnDef<MainCategory>[];
  data: MainCategory[];
}

export function DataTable({ columns, data }: DataTableProps) {
  const [t] = useTranslation("global");
  const [sorting, setSorting] = useState<SortingState>([{ id: "order", desc: false }]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
  });

  return (
    <div className="overflow-hidden rounded-xl border border-border/50 bg-background/40">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="border-border/50 hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="text-start font-bold">
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="border-border/40 transition-colors hover:bg-muted/20"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-32 text-center">
                <p className="text-muted-foreground">{t("no_results")}</p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
```

- [ ] **Step 2: `add-main-category-form.tsx`**

Create `Frontend/src/dashboard/main-categories/add-main-category-form.tsx`:

```tsx
import { useRef, useState } from "react";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../components/ui/use-toast";
import postMainCategory from "../../api/postMainCategory";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";

export function AddMainCategoryForm() {
  const [open, setOpen] = useState(false);
  const [order, setOrder] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const postMainCategoryMutation = useMutation({
    mutationFn: async () => {
      const image = imageRef.current?.files?.[0];
      if (!image) {
        throw new Error("image is required");
      }
      const response = await postMainCategory(
        localStorage.getItem("token") as string,
        nameRef.current?.value as string,
        Number(order),
        image
      );
      return response;
    },
    onSuccess: (data) => {
      toast({ title: "Done!", description: data.data.result });
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["main-categories"] });
    },
    onError: (error: AxiosError | Error) => {
      const axiosError = error as AxiosError;
      toast({
        title: "Error!",
        description: axiosError.response?.data
          ? (axiosError.response.data as { error: string }).error
          : error.message,
      });
    },
  });

  const [t, i18n] = useTranslation("global");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">{t("add")}</Button>
      </DialogTrigger>
      <DialogContent
        dir={i18n.language == "en" ? "ltr" : "rtl"}
        className="sm:max-w-[425px]"
      >
        <DialogHeader>
          <DialogTitle className="text-start text-primary">
            {t("add_main_category")}
          </DialogTitle>
          <VisuallyHidden.Root>
            <DialogDescription></DialogDescription>
          </VisuallyHidden.Root>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              {t("name")}
            </Label>
            <Input id="name" className="col-span-3" ref={nameRef} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="image" className="text-right">
              {t("image")}
            </Label>
            <Input id="image" type="file" className="col-span-3" ref={imageRef} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="order" className="text-right">
              {t("cat_sort_order")}
            </Label>
            <Input
              type="number"
              min={0}
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            disabled={postMainCategoryMutation.isPending}
            variant={postMainCategoryMutation.isPending ? "ghost" : "default"}
            onClick={(e) => {
              e.preventDefault();
              postMainCategoryMutation.mutate();
            }}
          >
            {postMainCategoryMutation.isPending ? t("saving") : t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 3: `edit-main-category-form.tsx`**

Create `Frontend/src/dashboard/main-categories/edit-main-category-form.tsx`:

```tsx
import { useRef, useState } from "react";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import type { MainCategory } from "../../types/types";
import { UseQueryResult, useMutation } from "@tanstack/react-query";
import putMainCategory from "../../api/putMainCategory";
import { useToast } from "../../components/ui/use-toast";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

type EditMainCategoryFormProps = {
  mainCategory: MainCategory;
  query: UseQueryResult;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export default function EditMainCategoryForm({
  mainCategory,
  query,
  open: controlledOpen,
  onOpenChange,
}: EditMainCategoryFormProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [order, setOrder] = useState(mainCategory.order);

  const nameRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  const editMainCategoryMutation = useMutation({
    mutationFn: async () => {
      const response = await putMainCategory(
        localStorage.getItem("token") as string,
        mainCategory.id.toString(),
        {
          order: Number(order),
          name: nameRef.current?.value as string,
          image: imageRef.current?.files ? imageRef.current.files[0] : undefined,
        }
      );
      return response;
    },
    onSuccess: (data) => {
      toast({ title: "Done!", description: data.data.result });
      setOpen(false);
      query.refetch();
    },
    onError: (error: AxiosError) => {
      toast({
        title: "Error!",
        description: (error.response?.data as { error: string }).error,
      });
    },
  });

  const [t, i18n] = useTranslation("global");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {controlledOpen === undefined && (
        <DialogTrigger asChild>
          <Button variant="default">{t("edit")}</Button>
        </DialogTrigger>
      )}
      <DialogContent
        dir={i18n.language == "en" ? "ltr" : "rtl"}
        className="sm:max-w-[425px]"
      >
        <DialogHeader>
          <DialogTitle className="text-primary text-start">
            {t("edit_main_category")}
          </DialogTitle>
          <VisuallyHidden>
            <DialogDescription>
              Make changes to main category here. Click save when you're done.
            </DialogDescription>
          </VisuallyHidden>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              {t("name")}
            </Label>
            <Input
              ref={nameRef}
              id="name"
              type="text"
              defaultValue={mainCategory.name}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="image" className="text-right">
              {t("image")}
            </Label>
            <Input ref={imageRef} id="image" type="file" className="col-span-3" />
          </div>
          {mainCategory.image && (
            <div className="flex justify-center">
              <img
                src={mainCategory.image}
                alt={mainCategory.name}
                className="h-16 w-16 rounded-xl object-cover border border-border"
              />
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="order" className="text-right">
              {t("cat_sort_order")}
            </Label>
            <Input
              type="number"
              min={0}
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={editMainCategoryMutation.isPending}
            variant={editMainCategoryMutation.isPending ? "ghost" : "default"}
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              editMainCategoryMutation.mutate();
            }}
          >
            {editMainCategoryMutation.isPending ? t("saving") : t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 4: `main-category-row-actions.tsx`**

Create `Frontend/src/dashboard/main-categories/main-category-row-actions.tsx`:

```tsx
import { useMutation, UseQueryResult, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { AxiosError } from "axios";
import { Eye, EyeOff, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { useToast } from "../../components/ui/use-toast";
import deleteMainCategory from "../../api/deleteMainCategory";
import putMainCategory from "../../api/putMainCategory";
import type { MainCategory } from "../../types/types";
import EditMainCategoryForm from "./edit-main-category-form";

type MainCategoryRowActionsProps = {
  mainCategory: MainCategory;
  query: UseQueryResult;
};

export default function MainCategoryRowActions({
  mainCategory,
  query,
}: MainCategoryRowActionsProps) {
  const [t, i18n] = useTranslation("global");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isRtl = i18n.language === "ar";
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const isActive = mainCategory.active !== false;

  const toggleMutation = useMutation({
    mutationFn: () =>
      putMainCategory(localStorage.getItem("token") as string, String(mainCategory.id), {
        name: mainCategory.name,
        order: Number(mainCategory.order),
        active: !isActive,
      }),
    onSuccess: (data) => {
      toast({ title: t("done") || "Done!", description: data.data.result });
      query.refetch();
    },
    onError: (e: AxiosError) => {
      toast({
        title: "Error",
        description: (e.response?.data as { error: string })?.error,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () =>
      deleteMainCategory(localStorage.getItem("token") as string, String(mainCategory.id)),
    onSuccess: (data) => {
      toast({ title: t("done") || "Done!", description: data.data.result });
      setDeleteOpen(false);
      query.refetch();
      queryClient.invalidateQueries({ queryKey: ["main-categories"] });
    },
    onError: (e: AxiosError) => {
      toast({
        title: "Error",
        description: (e.response?.data as { error: string })?.error,
        variant: "destructive",
      });
    },
  });

  return (
    <>
      <DropdownMenu dir={isRtl ? "rtl" : "ltr"}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-9 w-9">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4 me-2" />
            {t("edit")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => toggleMutation.mutate()}
            disabled={toggleMutation.isPending}
          >
            {isActive ? (
              <>
                <EyeOff className="h-4 w-4 me-2" />
                {t("cat_hide")}
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 me-2" />
                {t("cat_show")}
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4 me-2" />
            {t("delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditMainCategoryForm
        mainCategory={mainCategory}
        query={query}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent dir={isRtl ? "rtl" : "ltr"}>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("are_you_absolutely_sure")}</AlertDialogTitle>
            <AlertDialogDescription>{t("actions")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? t("deleting") : t("continue")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
```

- [ ] **Step 5: `columns.tsx`**

Create `Frontend/src/dashboard/main-categories/columns.tsx`:

```tsx
import { ColumnDef } from "@tanstack/react-table";
import { UseQueryResult } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import type { MainCategory } from "../../types/types";
import MainCategoryRowActions from "./main-category-row-actions";

export function createColumns(
  t: (k: string) => string,
  query: UseQueryResult
): ColumnDef<MainCategory>[] {
  return [
    {
      id: "main_category",
      accessorFn: (row) => row.name,
      header: t("main_categories"),
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-border/50 bg-muted">
              {c.image && (
                <img src={c.image} alt={c.name} className="h-full w-full object-cover" />
              )}
            </div>
            <p className="truncate font-bold text-foreground">{c.name}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "order",
      header: t("cat_sort_order"),
      cell: ({ row }) => (
        <span className="font-mono text-sm tabular-nums">{row.original.order}</span>
      ),
    },
    {
      id: "status",
      accessorFn: (row) => row.active,
      header: t("status"),
      cell: ({ row }) => {
        const isActive = row.original.active !== false;
        return (
          <Badge
            variant="outline"
            className={
              isActive
                ? "border-0 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : "border-0 bg-amber-500/15 text-amber-600 dark:text-amber-400"
            }
          >
            {isActive ? (
              <>
                <Eye className="me-1 h-3 w-3" />
                {t("cat_visible")}
              </>
            ) : (
              <>
                <EyeOff className="me-1 h-3 w-3" />
                {t("cat_hidden")}
              </>
            )}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <MainCategoryRowActions mainCategory={row.original} query={query} />
        </div>
      ),
    },
  ];
}
```

- [ ] **Step 6: `page.tsx`**

Create `Frontend/src/dashboard/main-categories/page.tsx`:

```tsx
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import getMainCategories from "../../api/getMainCategories";
import type { MainCategory } from "../../types/types";
import { AddMainCategoryForm } from "./add-main-category-form";
import { createColumns } from "./columns";
import { DataTable } from "./data-table";

export default function DashboardMainCategories() {
  const [t] = useTranslation("global");

  const mainCategoriesQuery = useQuery({
    queryKey: ["main-categories"],
    queryFn: async () => {
      const res = await getMainCategories({
        token: localStorage.getItem("token") as string,
      });
      return (res.data?.result ?? []) as MainCategory[];
    },
  });

  const mainCategories = mainCategoriesQuery.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-foreground">
          {t("main_categories")}
        </h1>
        <AddMainCategoryForm />
      </div>

      <DataTable
        columns={createColumns(t, mainCategoriesQuery)}
        data={mainCategories}
      />
    </div>
  );
}
```

- [ ] **Step 7: Verify build and lint**

Run: `cd Frontend && npm run build`
Expected: exits 0 — note `main_categories`/`add_main_category`/
`edit_main_category` translation keys don't exist yet (added in Task 3);
`react-i18next`'s `t()` falls back to returning the key itself at runtime
rather than a compile error, so this does not fail the TypeScript build.

Run: `npm run lint`
Expected: exits 0, no warnings.

- [ ] **Step 8: Commit**

```bash
git add src/dashboard/main-categories/
git commit -m "Add main categories dashboard resource"
```

---

### Task 3: Route, navigation, permission, and translation wiring

**Files:**
- Modify: `Frontend/src/main.tsx`
- Modify: `Frontend/src/layouts/DashboardLayout.tsx`
- Modify: `Frontend/src/dashboard/admins/permissions-config.ts`
- Modify: `Frontend/src/locales/ar/global.json`
- Modify: `Frontend/src/locales/en/global.json`

**Interfaces:**
- Consumes: `DashboardMainCategories` from Task 2.
- Produces: the page becomes reachable at `/${VITE_DASHBOARD}/main-categories`,
  appears in the sidebar's "catalog" group (gated by the new
  `"main_categories"` permission for non-admin employees), and is grantable
  through the existing admin-permissions editor.

- [ ] **Step 1: Register the route**

In `Frontend/src/main.tsx`, add the import near the other dashboard category
imports (after `import DashboardAllSub from "./dashboard/categories/allsubcategories/page";`):

```ts
import DashboardMainCategories from "./dashboard/main-categories/page";
```

Then add the route entry among the other dashboard-layout children, directly
after the existing:

```tsx
      {
        path: "categories/sub/:id/products",
        element: <DashboardSubProducts />,
      },
```

insert:

```tsx
      {
        path: "main-categories",
        element: <DashboardMainCategories />,
      },
```

- [ ] **Step 2: Add the sidebar nav item and page title**

In `Frontend/src/layouts/DashboardLayout.tsx`, add `LayoutGrid` to the
existing `lucide-react` import:

```ts
import {
  BarChart3,
  Calendar as CalendarIcon,
  ClipboardList,
  Coins,
  HandCoins,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  LucideBox,
  Menu,
  X,
} from "lucide-react";
```

Then, in the `"catalog"` nav group, change:

```tsx
    {
      labelKey: "catalog",
      items: [
        { to: `/${d}/categories`, labelKey: "categories", icon: <BiCategoryAlt className="h-4 w-4" /> },
        { to: `/${d}/categories/sub`, labelKey: "sub_categories", icon: <PiSubtractDuotone className="h-4 w-4" /> },
        { to: `/${d}/products`, labelKey: "products", icon: <LucideBox className="h-4 w-4" /> },
      ],
    },
```

to:

```tsx
    {
      labelKey: "catalog",
      items: [
        { to: `/${d}/categories`, labelKey: "categories", icon: <BiCategoryAlt className="h-4 w-4" /> },
        { to: `/${d}/categories/sub`, labelKey: "sub_categories", icon: <PiSubtractDuotone className="h-4 w-4" /> },
        { to: `/${d}/main-categories`, labelKey: "main_categories", icon: <LayoutGrid className="h-4 w-4" /> },
        { to: `/${d}/products`, labelKey: "products", icon: <LucideBox className="h-4 w-4" /> },
      ],
    },
```

Then add a `PAGE_TITLE_KEYS` entry — change:

```ts
const PAGE_TITLE_KEYS: Record<string, string> = {
  "/": "dashboard_overview",
  "/clients": "clients",
  "/admins": "admins",
  "/users": "users",
```

to:

```ts
const PAGE_TITLE_KEYS: Record<string, string> = {
  "/": "dashboard_overview",
  "/clients": "clients",
  "/admins": "admins",
  "/users": "users",
  "/main-categories": "main_categories",
```

- [ ] **Step 3: Gate the nav item by permission**

In `Frontend/src/layouts/DashboardLayout.tsx`, change:

```ts
  const ROUTE_PERMISSION_MAP: Record<string, string> = {
    "/clients": "clients",
    "/admins": "admins",
    "/users": "users",
    "/categories": "categories",
    "/categories/sub": "categories",
```

to:

```ts
  const ROUTE_PERMISSION_MAP: Record<string, string> = {
    "/clients": "clients",
    "/admins": "admins",
    "/users": "users",
    "/categories": "categories",
    "/categories/sub": "categories",
    "/main-categories": "main_categories",
```

- [ ] **Step 4: Register the permission key**

In `Frontend/src/dashboard/admins/permissions-config.ts`, change:

```ts
export const ALL_PERMISSIONS = [
  "dashboard", "users", "admins", "clients", "activity_logs",
  "categories", "products",
  "orders", "charges", "debts", "reconciliation",
  "ads", "levels", "currencies",
  "inventory", "reports", "boxes", "notes", "notifications", "info",
] as const;
```

to:

```ts
export const ALL_PERMISSIONS = [
  "dashboard", "users", "admins", "clients", "activity_logs",
  "categories", "main_categories", "products",
  "orders", "charges", "debts", "reconciliation",
  "ads", "levels", "currencies",
  "inventory", "reports", "boxes", "notes", "notifications", "info",
] as const;
```

Change:

```ts
  {
    labelKey: "catalog_group",
    permissions: ["categories", "products"] as Permission[],
  },
```

to:

```ts
  {
    labelKey: "catalog_group",
    permissions: ["categories", "main_categories", "products"] as Permission[],
  },
```

And change:

```ts
export const PERMISSION_LABEL_KEYS: Record<string, string> = {
  dashboard: "perm_dashboard",
  users: "perm_users",
  admins: "perm_admins",
  clients: "perm_clients",
  activity_logs: "perm_activity_logs",
  categories: "perm_categories",
  products: "perm_products",
```

to:

```ts
export const PERMISSION_LABEL_KEYS: Record<string, string> = {
  dashboard: "perm_dashboard",
  users: "perm_users",
  admins: "perm_admins",
  clients: "perm_clients",
  activity_logs: "perm_activity_logs",
  categories: "perm_categories",
  main_categories: "perm_main_categories",
  products: "perm_products",
```

- [ ] **Step 5: Add translation keys**

In `Frontend/src/locales/en/global.json`, change:

```json
  "edit_category": "Edit Category",
  "name": "Name",
  "image": "Image",
  "add_category": "Add Category",
```

to:

```json
  "edit_category": "Edit Category",
  "name": "Name",
  "image": "Image",
  "add_category": "Add Category",
  "main_categories": "Main Categories",
  "add_main_category": "Add Main Category",
  "edit_main_category": "Edit Main Category",
  "no_main_category": "No main category",
```

and change:

```json
  "perm_categories": "Categories",
  "perm_products": "Products",
```

to:

```json
  "perm_categories": "Categories",
  "perm_main_categories": "Main Categories",
  "perm_products": "Products",
```

In `Frontend/src/locales/ar/global.json`, change:

```json
  "edit_category": "تعديل التصنيف",
  "name": "الاسم",
  "image": "الصورة",
  "add_category": "اضف صنف",
```

to:

```json
  "edit_category": "تعديل التصنيف",
  "name": "الاسم",
  "image": "الصورة",
  "add_category": "اضف صنف",
  "main_categories": "الأقسام الرئيسية",
  "add_main_category": "اضف قسم رئيسي",
  "edit_main_category": "تعديل القسم الرئيسي",
  "no_main_category": "بدون قسم رئيسي",
```

and change:

```json
  "perm_categories": "التصنيفات",
  "perm_products": "المنتجات",
```

to:

```json
  "perm_categories": "التصنيفات",
  "perm_main_categories": "الأقسام الرئيسية",
  "perm_products": "المنتجات",
```

- [ ] **Step 6: Verify build and lint**

Run: `cd Frontend && npm run build`
Expected: exits 0.

Run: `npm run lint`
Expected: exits 0.

- [ ] **Step 7: Manual check**

Run: `npm run dev`, log in as an admin, navigate to
`/${VITE_DASHBOARD}/main-categories` directly (or via the new "Main
Categories" sidebar item under the catalog group).
Expected: the page loads, shows an empty table with "no_results" text (or
existing rows if the backend has any), and the "Add" button opens the
add-dialog. Create one main category with a name, image, and order; confirm
it appears in the table after the dialog closes. Edit it (rename, confirm
the row updates). Toggle visibility from the row-actions menu. Delete it,
confirm the row disappears.

Then open the admin-permissions editor (wherever `permissions-config.ts` is
rendered, e.g. the admin add/edit employee form) and confirm "Main
Categories" now appears as a grantable permission under the same group as
"Categories".

- [ ] **Step 8: Commit**

```bash
git add src/main.tsx src/layouts/DashboardLayout.tsx src/dashboard/admins/permissions-config.ts src/locales/ar/global.json src/locales/en/global.json
git commit -m "Wire main categories page into routing, nav, permissions, and i18n"
```

---

### Task 4: Assign a category to a main category from the category forms

**Files:**
- Modify: `Frontend/src/api/putCategory.ts`
- Modify: `Frontend/src/api/postCategory.ts`
- Modify: `Frontend/src/dashboard/categories/edit-category-form.tsx`
- Modify: `Frontend/src/dashboard/categories/add-category-form.tsx`

**Interfaces:**
- Consumes: `getMainCategories` (Task 1) to populate the dropdown; `Category.main_category_id` (Task 1) to preselect the current value on edit.
- Produces: no new exports — extends existing mutation payloads.

- [ ] **Step 1: Extend `putCategory.ts`**

Change:

```ts
type PutCategoryPayload = {
  name?: string;
  order?: number;
  active?: boolean;
  image?: File;
  profit?: number;
};

export default function putCategory(
  token: string,
  id: string,
  payload: PutCategoryPayload
) {
  const apiUrl = `${import.meta.env.VITE_API_URL}categories/${id}`;
  const form = new FormData();
  if (payload.name !== undefined) form.append("name", payload.name);
  if (payload.order !== undefined) form.append("order", String(payload.order));
  if (payload.active !== undefined) form.append("active", String(payload.active));
  if (payload.image) form.append("image", payload.image);
  if (payload.profit !== undefined) form.append("profit", String(payload.profit));
```

to:

```ts
type PutCategoryPayload = {
  name?: string;
  order?: number;
  active?: boolean;
  image?: File;
  profit?: number;
  main_category_id?: number | null;
};

export default function putCategory(
  token: string,
  id: string,
  payload: PutCategoryPayload
) {
  const apiUrl = `${import.meta.env.VITE_API_URL}categories/${id}`;
  const form = new FormData();
  if (payload.name !== undefined) form.append("name", payload.name);
  if (payload.order !== undefined) form.append("order", String(payload.order));
  if (payload.active !== undefined) form.append("active", String(payload.active));
  if (payload.image) form.append("image", payload.image);
  if (payload.profit !== undefined) form.append("profit", String(payload.profit));
  if (payload.main_category_id !== undefined) {
    form.append(
      "main_category_id",
      payload.main_category_id === null ? "" : String(payload.main_category_id)
    );
  }
```

(leave the rest of the file, including the `axios.put(...)` call, unchanged)

- [ ] **Step 2: Extend `postCategory.ts`**

Change:

```ts
import axios from "axios"

export default function postCategory(token: string, name: string, order: number, image?: File) {

  const apiUrl = `${import.meta.env.VITE_API_URL}categories`;
  return axios.post(apiUrl, { name, order, image }, {
    headers: {
      "x-api-key": import.meta.env.VITE_API_KEY,
      "Authorization": `Bearer ${token}`,
      "Content-Type": "multipart/form-data"
    }
  }).then((res) => {
    return res
  })
}
```

to:

```ts
import axios from "axios"

export default function postCategory(token: string, name: string, order: number, image?: File, mainCategoryId?: number | null) {

  const apiUrl = `${import.meta.env.VITE_API_URL}categories`;
  return axios.post(apiUrl, { name, order, image, main_category_id: mainCategoryId ?? undefined }, {
    headers: {
      "x-api-key": import.meta.env.VITE_API_KEY,
      "Authorization": `Bearer ${token}`,
      "Content-Type": "multipart/form-data"
    }
  }).then((res) => {
    return res
  })
}
```

(This mirrors `postCategory.ts`'s existing plain-object approach exactly —
not fixing its pre-existing multipart limitation, per the Global
Constraints.)

- [ ] **Step 3: Add the dropdown to `edit-category-form.tsx`**

Add imports — change:

```tsx
import { useRef, useState } from "react";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Category } from "../../types/types";
import { UseQueryResult, useMutation } from "@tanstack/react-query";
import putCategory from "../../api/putCategory";
import { useToast } from "../../components/ui/use-toast";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
```

to:

```tsx
import { useRef, useState } from "react";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Category, MainCategory } from "../../types/types";
import { UseQueryResult, useMutation, useQuery } from "@tanstack/react-query";
import putCategory from "../../api/putCategory";
import getMainCategories from "../../api/getMainCategories";
import { useToast } from "../../components/ui/use-toast";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
```

Add state and the main-categories query — change:

```tsx
  const [order, setOrder] = useState(category.order);
  const [profit, setProfit] = useState(String(category.profit ?? 0));

  const nameRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();
```

to:

```tsx
  const [order, setOrder] = useState(category.order);
  const [profit, setProfit] = useState(String(category.profit ?? 0));
  const [mainCategoryId, setMainCategoryId] = useState(
    category.main_category_id ? String(category.main_category_id) : "none"
  );

  const nameRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  const mainCategoriesQuery = useQuery({
    queryKey: ["main-categories"],
    queryFn: async () => {
      const res = await getMainCategories({
        token: localStorage.getItem("token") as string,
      });
      return (res.data?.result ?? []) as MainCategory[];
    },
  });
```

Add the field to the mutation payload — change:

```tsx
      const response = await putCategory(
        localStorage.getItem("token") as string,
        category.id.toString(),
        {
          order: Number(order),
          name: nameRef.current?.value as string,
          image: imageRef.current?.files ? imageRef.current.files[0] : undefined,
          profit: Number(profit),
        }
      );
```

to:

```tsx
      const response = await putCategory(
        localStorage.getItem("token") as string,
        category.id.toString(),
        {
          order: Number(order),
          name: nameRef.current?.value as string,
          image: imageRef.current?.files ? imageRef.current.files[0] : undefined,
          profit: Number(profit),
          main_category_id: mainCategoryId === "none" ? null : Number(mainCategoryId),
        }
      );
```

Add the `<Select>` field to the JSX — change:

```tsx
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="profit" className="text-right">
              {t("cat_margin_percent")}
            </Label>
            <Input
              id="profit"
              type="number"
              step="0.01"
              value={profit}
              onChange={(e) => setProfit(e.target.value)}
              className="col-span-3"
            />
            <p className="col-span-4 text-xs text-muted-foreground text-start">
              {t("cat_margin_hint")}
            </p>
          </div>
        </div>
```

to:

```tsx
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="profit" className="text-right">
              {t("cat_margin_percent")}
            </Label>
            <Input
              id="profit"
              type="number"
              step="0.01"
              value={profit}
              onChange={(e) => setProfit(e.target.value)}
              className="col-span-3"
            />
            <p className="col-span-4 text-xs text-muted-foreground text-start">
              {t("cat_margin_hint")}
            </p>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="main_category" className="text-right">
              {t("main_categories")}
            </Label>
            <Select onValueChange={setMainCategoryId} value={mainCategoryId}>
              <SelectTrigger id="main_category" className="col-span-3">
                <SelectValue placeholder={t("main_categories")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t("no_main_category")}</SelectItem>
                {mainCategoriesQuery.data?.map((mc) => (
                  <SelectItem key={mc.id} value={String(mc.id)}>
                    {mc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
```

- [ ] **Step 4: Add the dropdown to `add-category-form.tsx`**

Add imports — change:

```tsx
import { useRef, useState } from "react";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../components/ui/use-toast";
import postCategory from "../../api/postCategory";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
```

to:

```tsx
import { useRef, useState } from "react";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../components/ui/use-toast";
import postCategory from "../../api/postCategory";
import getMainCategories from "../../api/getMainCategories";
import type { MainCategory } from "../../types/types";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
```

Add state and the query — change:

```tsx
export function AddCategoryForm() {
  // state
  const [open, setOpen] = useState(false);
  const [order, setOrder] = useState("");
  // refs
  const nameRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  // toast
  const { toast } = useToast();
  const queryClient = useQueryClient();
```

to:

```tsx
export function AddCategoryForm() {
  // state
  const [open, setOpen] = useState(false);
  const [order, setOrder] = useState("");
  const [mainCategoryId, setMainCategoryId] = useState("none");
  // refs
  const nameRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  // toast
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mainCategoriesQuery = useQuery({
    queryKey: ["main-categories"],
    queryFn: async () => {
      const res = await getMainCategories({
        token: localStorage.getItem("token") as string,
      });
      return (res.data?.result ?? []) as MainCategory[];
    },
  });
```

Pass the field through in the mutation — change:

```tsx
      const response = await postCategory(
        localStorage.getItem("token") as string,
        nameRef.current?.value as string,
        Number(order),
        imageRef.current?.files ? imageRef.current?.files[0] : undefined
      );
```

to:

```tsx
      const response = await postCategory(
        localStorage.getItem("token") as string,
        nameRef.current?.value as string,
        Number(order),
        imageRef.current?.files ? imageRef.current?.files[0] : undefined,
        mainCategoryId === "none" ? null : Number(mainCategoryId)
      );
```

Add the `<Select>` field to the JSX — change:

```tsx
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="order" className="text-right">
              {t("cat_sort_order")}
            </Label>
            <Input
              type="number"
              min={1}
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
```

to:

```tsx
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="order" className="text-right">
              {t("cat_sort_order")}
            </Label>
            <Input
              type="number"
              min={1}
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="main_category" className="text-right">
              {t("main_categories")}
            </Label>
            <Select onValueChange={setMainCategoryId} value={mainCategoryId}>
              <SelectTrigger id="main_category" className="col-span-3">
                <SelectValue placeholder={t("main_categories")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t("no_main_category")}</SelectItem>
                {mainCategoriesQuery.data?.map((mc) => (
                  <SelectItem key={mc.id} value={String(mc.id)}>
                    {mc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
```

- [ ] **Step 5: Verify build and lint**

Run: `cd Frontend && npm run build`
Expected: exits 0.

Run: `npm run lint`
Expected: exits 0.

- [ ] **Step 6: Manual check**

Run: `npm run dev`, log in as an admin, go to the categories dashboard page.
Create at least one main category first (via the page built in Task 2) if
none exist. Open "Add" on a category: confirm the "Main Categories" dropdown
lists it and "No main category" is selected by default; create a category
with it assigned, confirm no error toast. Edit an existing category: confirm
the dropdown preselects its current assignment (or "No main category" if
unassigned); change it and save; confirm no error toast and (by re-opening
the edit dialog) that the new assignment persisted.

- [ ] **Step 7: Commit**

```bash
git add src/api/putCategory.ts src/api/postCategory.ts src/dashboard/categories/edit-category-form.tsx src/dashboard/categories/add-category-form.tsx
git commit -m "Let categories be assigned to a main category from the dashboard"
```
