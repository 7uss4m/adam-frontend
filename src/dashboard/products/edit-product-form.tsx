import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
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
import { useEffect, useRef, useState } from "react";
import { Checkbox } from "../../components/ui/checkbox";
import { UseQueryResult, useMutation, useQuery } from "@tanstack/react-query";
import { Category, Product, Require } from "../../types/types";
import { useToast } from "../../components/ui/use-toast";
import { AxiosError } from "axios";
import putProduct from "../../api/putProduct";
import { RequireInput } from "./requires-input";
import AddRequireForm from "./add-require-form";
import getCategories from "../../api/getCategories";
import { useTranslation } from "react-i18next";

// Combobox components
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { cn } from "../../lib/utils";
import { BiCaretDown } from "react-icons/bi";
import { CheckIcon, Pencil } from "lucide-react";

type ProductWithAreas = Product & { areas?: { name: string }[] };

export default function EditProductForm({
  id,
  query,
  product,
  compact = false,
  open: controlledOpen,
  onOpenChange,
  hideTrigger = false,
}: {
  id: string;
  query: UseQueryResult;
  product: ProductWithAreas;
  compact?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}) {
  const [requires, setRequires] = useState<Require[]>(product.requires || []);
  const [requireValues, setRequireValues] = useState<
    Record<number, string | number>
  >({});

  // state
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  // refs
  const nameRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);
  const areasRef = useRef<HTMLTextAreaElement>(null);
  // toast
  const { toast } = useToast();
  const [t] = useTranslation("global");
  // state
  const [price, setPrice] = useState(product.price);
  const [mainPrice, setMainPrice] = useState(product.mainPrice);
  const [description, setDescription] = useState(product.description);
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [order, setOrder] = useState(product.order?.toString() || "");

  const getAllCategoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await getCategories();
      return response.data.result as Category[];
    },
    enabled: open,
  });

  // Parent categories only (no subcategories)
  const allCategories = getAllCategoriesQuery.data || [];

  // Find the selected category for display
  const selectedCategory = allCategories.find(
    (cat) => cat.id.toString() === categoryId
  );

  // mutation
  const putProductMutation = useMutation({
    mutationFn: async () => {
      const name = nameRef.current?.value as string;
      const image: File | undefined = imageRef.current?.files
        ? imageRef.current?.files[0]
        : undefined;

      const active = activeRef.current?.value == "on" ? true : false;
      const areasRaw = areasRef.current?.value || "";
      const areas = areasRaw
        .split("-")
        .map((a) => a.trim())
        .filter((a) => a.length > 0)
        .map((name) => ({ name }));

      const data = {
        name,
        image,
        category_id: categoryId as string,
        price,
        mainPrice,
        description,
        requires,
        active,
        order: Number(order),
        areas,
      };

      const response = await putProduct(
        localStorage.getItem("token") as string,
        data,
        id
      );
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "Done!",
        description: data.data.result,
      });
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

  // effect - Set initial category when parent categories load
  useEffect(() => {
    if (!getAllCategoriesQuery.isSuccess) return;

    const productCategoryId = product.categoryId ?? product.categories?.id;
    if (productCategoryId != null) {
      const byId = allCategories.find(
        (cat) => cat.id.toString() === String(productCategoryId)
      );
      if (byId) {
        setCategoryId(byId.id.toString());
        return;
      }
    }

    const foundCategory = allCategories.find(
      (cat) => cat.name === product.categories?.name
    );
    if (foundCategory) {
      setCategoryId(foundCategory.id.toString());
    }
  }, [
    getAllCategoriesQuery.isSuccess,
    product.categoryId,
    product.categories?.id,
    product.categories?.name,
    allCategories,
  ]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!hideTrigger && (
        <DialogTrigger asChild>
          {compact ? (
            <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit">
              <Pencil className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="outline" size="sm">Edit</Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px] overflow-y-scroll max-h-full">
        <DialogHeader>
          <DialogTitle className="text-primary">Edit Product</DialogTitle>
          <VisuallyHidden>
            <DialogDescription></DialogDescription>
          </VisuallyHidden>
        </DialogHeader>
        <div className="space-y-5">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              defaultValue={product.name}
              ref={nameRef}
              id="name"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="image" className="text-right">
              Image
            </Label>
            <Input
              ref={imageRef}
              id="image"
              type="file"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="active" className="text-right">
              Active?
            </Label>
            <Checkbox
              defaultChecked={product.active}
              ref={activeRef}
              id="active"
            />
          </div>

          {/* Parent category Combobox */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              {t("category")}
            </Label>
            <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={categoryOpen}
                  className="w-[280px] justify-between"
                >
                  {selectedCategory ? (
                    <div className="flex items-center gap-2">
                      <img
                        src={`${import.meta.env.VITE_PUBLIC_DOMAIN}${
                          selectedCategory.image
                        }`}
                        alt={selectedCategory.name}
                        className="size-[20px] rounded"
                      />
                      <span>{selectedCategory.name}</span>
                    </div>
                  ) : (
                    t("select_parent_category")
                  )}
                  <BiCaretDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[280px] p-0">
                <Command>
                  <CommandInput
                    placeholder={t("search_categories")}
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty>{t("no_category_found")}</CommandEmpty>
                    <CommandGroup>
                      {allCategories.map((category) => (
                        <CommandItem
                          key={category.id}
                          value={category.name.toLowerCase()}
                          onSelect={() => {
                            setCategoryId(category.id.toString());
                            setCategoryOpen(false);
                          }}
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <img
                              src={`${import.meta.env.VITE_PUBLIC_DOMAIN}${
                                category.image
                              }`}
                              alt={category.name}
                              className="size-[20px] rounded"
                            />
                            <span>{category.name}</span>
                          </div>
                          <CheckIcon
                            className={cn(
                              "ml-auto h-4 w-4",
                              categoryId === category.id.toString()
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right col-span-1">
              Description
            </Label>
            <Input
              id="description"
              className="col-span-3"
              type="text"
              defaultValue={product.description}
              onChange={(e) => setDescription(e.currentTarget.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right col-span-1">
              Price
            </Label>
            <Input
              id="price"
              className="col-span-3"
              type="number"
              defaultValue={price}
              onChange={(e) => setPrice(e.currentTarget.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="mainPrice" className="text-right col-span-1">
              Main Price
            </Label>
            <Input
              id="mainPrice"
              className="col-span-3"
              type="number"
              defaultValue={mainPrice}
              onChange={(e) => setMainPrice(e.currentTarget.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="order" className="text-right col-span-1">
              Order
            </Label>
            <Input
              defaultValue={product.order}
              type="number"
              min={1}
              className="col-span-3 w-full"
              onChange={(e) => setOrder(e.currentTarget.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="areas" className="text-right col-span-1">
              Areas
            </Label>
            <textarea
              id="areas"
              ref={areasRef}
              className="col-span-3 w-full rounded border text-main-primary p-2 min-h-[60px]"
              defaultValue={
                Array.isArray(product.areas)
                  ? product.areas.map((a) => a.name).join("-")
                  : ""
              }
              placeholder="One area per line"
            />
          </div>
          <div className="col-span-4">
            <Label className="text-right">Requires</Label>
            {requires.map((req) => (
              <RequireInput
                key={req.id}
                require={req}
                value={requireValues[req.id] ?? ""}
                onDelete={(id) => {
                  setRequires((prev) => prev.filter((r) => r.id !== id));
                  setRequireValues((prev) => {
                    const updated = { ...prev };
                    delete updated[id];
                    return updated;
                  });
                }}
              />
            ))}
          </div>
        </div>

        <AddRequireForm
          onAdd={(newReq) => {
            setRequires((prev) => [...prev, newReq]);
          }}
          nextId={Date.now()}
        />

        <DialogFooter>
          <Button
            disabled={putProductMutation.isPending}
            variant={putProductMutation.isPending ? "ghost" : "default"}
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              putProductMutation.mutate();
            }}
          >
            {putProductMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
