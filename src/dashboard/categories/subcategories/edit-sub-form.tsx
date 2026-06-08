import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Category } from "../../../types/types";
import { UseQueryResult, useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "../../../components/ui/use-toast";
import { AxiosError } from "axios";
import putSubCategory from "../../../api/putSubCategory";
import getCategories from "../../../api/getCategories";
import getSubCategories from "../../../api/getSubCategories";
import { useTranslation } from "react-i18next";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import Spinner from "../../../components/Spinner";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../../../components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

type CategoryWithSubs = Category & {
  subs: Category[];
};

export default function EditSubForm({
  sub,
  query,
}: {
  sub: Category;
  query: UseQueryResult;
}) {
  const [open, setOpen] = useState(false);
  const [comboOpen, setComboOpen] = useState(false);
  const [categoryType, setCategoryType] = useState(sub.type);
  const [order, setOrder] = useState(String(sub.order ?? ""));
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  const nameRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const bonusRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();
  const [t, i18n] = useTranslation("global");

  const categoriesWithSubsQuery = useQuery({
    queryKey: ["categories-with-subs-for-edit-sub", sub.id],
    queryFn: async () => {
      const categoriesRes = await getCategories();
      const categories = (categoriesRes.data?.result ?? categoriesRes.data) as Category[];

      const grouped = await Promise.all(
        categories.map(async (category) => {
          try {
            const subRes = await getSubCategories(category.id.toString());
            const subs = (subRes.data?.result ?? subRes.data ?? []) as Category[];

            return {
              ...category,
              subs,
            } as CategoryWithSubs;
          } catch {
            return {
              ...category,
              subs: [],
            } as CategoryWithSubs;
          }
        })
      );

      return grouped;
    },
    enabled: open,
    refetchOnWindowFocus: false,
  });

  const inferredParentCategoryId = useMemo(() => {
    const groups = categoriesWithSubsQuery.data ?? [];

    for (const category of groups) {
      const found = category.subs.find(
        (child) => child.id.toString() === sub.id.toString()
      );
      if (found) return category.id.toString();
    }

    return "";
  }, [categoriesWithSubsQuery.data, sub.id]);

  useEffect(() => {
    if (!open) {
      setComboOpen(false);
      setSelectedCategoryId("");
      return;
    }

    setCategoryType(sub.type);
    setOrder(String(sub.order ?? ""));
  }, [open, sub.type, sub.order]);

  useEffect(() => {
    if (open && inferredParentCategoryId && !selectedCategoryId) {
      setSelectedCategoryId(inferredParentCategoryId);
    }
  }, [open, inferredParentCategoryId, selectedCategoryId]);

  const selectedCategoryLabel = useMemo(() => {
    const groups = categoriesWithSubsQuery.data ?? [];
    const category = groups.find(
      (item) => item.id.toString() === selectedCategoryId
    );
    return category?.name ?? "";
  }, [categoriesWithSubsQuery.data, selectedCategoryId]);

  const editSubMutation = useMutation({
    mutationFn: async () => {
      const response = await putSubCategory({
        token: localStorage.getItem("token") as string,
        id: sub.id.toString(),
        name: nameRef.current?.value as string,
        type: categoryType,
        bonus: Number(bonusRef.current?.value),
        image: imageRef.current?.files?.[0],
        order: Number(order),
        parent_id: Number(selectedCategoryId),
      });
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
        description: (error.response?.data as { error: string })?.error,
      });
    },
  });

  const isLoadingCategories = categoriesWithSubsQuery.isLoading;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">{t("edit")}</Button>
      </DialogTrigger>

      <DialogContent
        dir={i18n.language === "en" ? "ltr" : "rtl"}
        className="sm:max-w-[520px]"
      >
        <DialogHeader>
          <DialogTitle className="text-start text-primary">
            {t("edit_sub_category")}
          </DialogTitle>
          <VisuallyHidden>
            <DialogDescription>
              Make changes to sub category here. Click save when you're done.
            </DialogDescription>
          </VisuallyHidden>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Category combobox */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="parent_id" className="text-right">
              {t("category") || "Category"}
            </Label>

            <div className="col-span-3">
              {isLoadingCategories ? (
                <div className="flex h-10 items-center rounded-md border px-3">
                  <Spinner />
                </div>
              ) : (
                <Popover open={comboOpen} onOpenChange={setComboOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="parent_id"
                      variant="outline"
                      role="combobox"
                      aria-expanded={comboOpen}
                      className="w-full justify-between"
                    >
                      <span className="truncate">
                        {selectedCategoryLabel ||
                          (t("select_category") || "Select category")}
                      </span>
                      <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent
                    align="start"
                    className="w-[--radix-popover-trigger-width] p-0"
                    dir={i18n.language === "en" ? "ltr" : "rtl"}
                  >
                    <Command>
                      <CommandInput
                        placeholder={t("search") || "Search..."}
                        className="h-9"
                      />
                      <CommandEmpty>
                        {t("no_results") || "No results found."}
                      </CommandEmpty>

                      <CommandList>
                        {(categoriesWithSubsQuery.data ?? []).map((category, idx) => (
                          <div key={category.id}>
                            {idx !== 0 ? <CommandSeparator /> : null}

                            <CommandGroup heading={category.name}>
                              <CommandItem
                                value={category.name}
                                onSelect={() => {
                                  setSelectedCategoryId(category.id.toString());
                                  setComboOpen(false);
                                }}
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${
                                    selectedCategoryId === category.id.toString()
                                      ? "opacity-100"
                                      : "opacity-0"
                                  }`}
                                />
                                {category.name}
                              </CommandItem>

                              {category.subs.map((child) => {
                                const label = `${category.name} / ${child.name}`;

                                return (
                                  <CommandItem
                                    key={`${category.id}-${child.id}`}
                                    value={label}
                                    onSelect={() => {
                                      setSelectedCategoryId(category.id.toString());
                                      setComboOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={`mr-2 h-4 w-4 ${
                                        selectedCategoryId === category.id.toString()
                                          ? "opacity-100"
                                          : "opacity-0"
                                      }`}
                                    />
                                    {label}
                                  </CommandItem>
                                );
                              })}
                            </CommandGroup>
                          </div>
                        ))}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>

          {/* Name */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              {t("name")}
            </Label>
            <Input
              ref={nameRef}
              id="name"
              type="text"
              defaultValue={sub.name}
              className="col-span-3"
            />
          </div>

          {/* Image */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="image" className="text-right">
              {t("image")}
            </Label>
            <Input
              ref={imageRef}
              id="image"
              type="file"
              className="col-span-3"
            />
          </div>

          {/* Type */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              {t("type")}
            </Label>

            <div className="col-span-3">
              <Select
                value={categoryType}
                onValueChange={(value) => {
                  setCategoryType(value as "one" | "bundle");
                }}
              >
                <SelectTrigger
                  dir={i18n.language === "en" ? "ltr" : "rtl"}
                  className="w-full"
                >
                  <SelectValue placeholder="Select category type" />
                </SelectTrigger>
                <SelectContent dir={i18n.language === "en" ? "ltr" : "rtl"}>
                  <SelectItem value="one">{t("one")}</SelectItem>
                  <SelectItem value="bundle">{t("bundle")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bonus */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="bonus" className="text-right">
              {t("bonus")}
            </Label>
            <Input
              defaultValue={sub.bonus}
              ref={bonusRef}
              type="number"
              min={0}
              id="bonus"
              name="bonus"
              className="col-span-3"
            />
          </div>

          {/* Order */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="order" className="text-right col-span-1">
              Order
            </Label>
            <Input
              id="order"
              defaultValue={sub.order}
              type="number"
              min={1}
              className="col-span-3 w-full"
              onChange={(e) => setOrder(e.currentTarget.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            disabled={editSubMutation.isPending || !selectedCategoryId}
            variant={editSubMutation.isPending ? "ghost" : "default"}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editSubMutation.mutate();
            }}
          >
            {editSubMutation.isPending ? t("saving") : t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}