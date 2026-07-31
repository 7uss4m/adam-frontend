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
import { useRef, useState } from "react";
import { Checkbox } from "../../components/ui/checkbox";
import { UseQueryResult, useMutation, useQuery } from "@tanstack/react-query";
import { Category, Require } from "../../types/types";
import postProduct from "../../api/postProduct";
import { useToast } from "../../components/ui/use-toast";
import { AxiosError } from "axios";
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
import { CheckIcon, Plus } from "lucide-react";

export default function AddProductForm({ query }: { query: UseQueryResult }) {
  // state
  const [open, setOpen] = useState(false);
  // refs
  const nameRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);
  const mainPriceRef = useRef<HTMLInputElement>(null);
  const orderRef = useRef<HTMLInputElement>(null);
  const areasRef = useRef<HTMLTextAreaElement>(null);
  // toast
  const { toast } = useToast();
  const [t] = useTranslation("global");
  // state
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const getAllCategoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await getCategories();
      return response.data.result as Category[];
    },
  });

  // Parent categories only (no subcategories)
  const allCategories = getAllCategoriesQuery.data || [];

  // Find the selected category for display
  const selectedCategory = allCategories.find(
    (cat) => cat.id.toString() === categoryId
  );

  // mutation
  const postProductMutation = useMutation({
    mutationFn: async () => {
      const name = nameRef.current?.value as string;
      const image: File | undefined = imageRef.current?.files
        ? imageRef.current?.files[0]
        : undefined;
      const active =
        activeRef.current?.dataset["state"] == "checked" ? true : false;
      const price = priceRef.current?.value || "";
      const description = descriptionRef.current?.value || "";
      const mainPrice = mainPriceRef.current?.value || "";
      const order = orderRef.current?.value || "";
      const areasRaw = areasRef.current?.value || "";
      const areas = areasRaw
        .split("-")
        .map((a) => a.trim())
        .filter((a) => a.length > 0)
        .map((name) => ({ name }));

      const data = {
        name,
        image,
        active,
        category_id: Number(categoryId),
        price: Number(price),
        description,
        mainPrice: Number(mainPrice),
        requires,
        order: Number(order),
        areas,
      };

      const response = await postProduct(
        localStorage.getItem("token") as string,
        data
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

  const [requires, setRequires] = useState<Require[]>([]);
  const [values, setValues] = useState<Record<number, string | number>>({});

  const handleAddRequire = (require: Require) => {
    setRequires((prev) => [...prev, require]);
    setValues((prev) => ({
      ...prev,
      [require.id]: require.type === "text" ? "" : 0,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-full overflow-y-scroll">
        <DialogHeader>
          <DialogTitle className="text-primary dark">Add Product</DialogTitle>
          <VisuallyHidden>
            <DialogDescription></DialogDescription>
          </VisuallyHidden>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-full">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input ref={nameRef} id="name" className="col-span-3" />
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
            <Checkbox ref={activeRef} id="active" />
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
                          // Search by category name, not ID
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
            <Label htmlFor="price" className="text-right col-span-1">
              Price
            </Label>
            <Input className="col-span-3 w-full" ref={priceRef} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right col-span-1">
              Description
            </Label>
            <Input className="col-span-3 w-full" ref={descriptionRef} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right col-span-1">
              Main Price
            </Label>
            <Input className="col-span-3 w-full" ref={mainPriceRef} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="order" className="text-right col-span-1">
              Order
            </Label>
            <Input
              type="number"
              min={1}
              className="col-span-3 w-full"
              ref={orderRef}
            />
          </div>
          <div>
            {requires.length === 0 && (
              <p className="text-gray-500 mb-2">
                No fields available — add one below:
              </p>
            )}
            {requires.map((req) => (
              <RequireInput
                key={req.id}
                require={req}
                value={values[req.id]}
                onDelete={(id) => {
                  setRequires((prev) => prev.filter((r) => r.id !== id));
                  setValues((prev) => {
                    const newValues = { ...prev };
                    delete newValues[id];
                    return newValues;
                  });
                }}
              />
            ))}
            <AddRequireForm
              onAdd={handleAddRequire}
              nextId={Date.now()} // quick ID generation
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="order"
              className="flex flex-col text-right col-span-full"
            >
              <span>المناطق</span>
              <span dir="rtl">قم بفصل المناطق باستخدام "-"</span>
            </Label>
            <textarea
              rows={3}
              className="col-span-full w-full text-main-primary"
              ref={areasRef}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={postProductMutation.isPending}
            variant={postProductMutation.isPending ? "ghost" : "default"}
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              postProductMutation.mutate();
            }}
          >
            {postProductMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
