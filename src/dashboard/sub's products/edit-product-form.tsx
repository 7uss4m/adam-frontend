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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useEffect, useRef, useState } from "react";
import { Checkbox } from "../../components/ui/checkbox";
import { UseQueryResult, useMutation, useQuery } from "@tanstack/react-query";
import { Category, Product, Require } from "../../types/types";
import { useToast } from "../../components/ui/use-toast";
import { AxiosError } from "axios";
import getCategories from "../../api/getCategories";
import putProduct from "../../api/putProduct";
import { RequireInput } from "../products/requires-input";
import AddRequireForm from "../products/add-require-form";
import { useTranslation } from "react-i18next";

export default function EditProductForm({
  id,
  query,
  product,
}: {
  id: string;
  query: UseQueryResult;
  product: Product;
}) {
  const [requires, setRequires] = useState<Require[]>(product.requires || []);
  const [requireValues, setRequireValues] = useState<
    Record<number, string | number>
  >({});
  // state
  const [open, setOpen] = useState(false);
  // refs
  const nameRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);
  // toast
  const { toast } = useToast();
  const [t] = useTranslation("global");
  // state
  const [price, setPrice] = useState(product.price);
  const [mainPrice, setMainPrice] = useState(product.mainPrice);
  const [description, setDescription] = useState(product.description);
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [order, setOrder] = useState<string | undefined>(product.order);
  const getAllCategoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await getCategories();
      return response.data.result as Category[];
    },
  });

  const parentCategories = getAllCategoriesQuery.data || [];
  const selectedCategory = parentCategories.find(
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

  // effect
  useEffect(() => {
    if (!getAllCategoriesQuery.isSuccess) return;
    const productCategoryId = product.categoryId ?? product.categories?.id;
    if (productCategoryId != null) {
      const found = parentCategories.find(
        (cat) => cat.id.toString() === String(productCategoryId)
      );
      if (found) {
        setCategoryId(found.id.toString());
        return;
      }
    }
    const byName = parentCategories.find(
      (cat) => cat.name === product.categories?.name
    );
    if (byName) setCategoryId(byName.id.toString());
  }, [
    getAllCategoriesQuery.isSuccess,
    parentCategories,
    product.categoryId,
    product.categories?.id,
    product.categories?.name,
  ]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Edit</Button>
      </DialogTrigger>
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sub" className="text-right">
              {t("category")}
            </Label>
            {getAllCategoriesQuery.isSuccess && (
              <Select
                value={categoryId}
                onValueChange={(value) => {
                  setCategoryId(value);
                }}
              >
                <SelectTrigger id="sub" className="w-[280px]">
                  <SelectValue placeholder={t("select_parent_category")}>
                    {selectedCategory ? selectedCategory.name : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {parentCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      <div className="flex items-center gap-5">
                        <img
                          src={`${import.meta.env.VITE_PUBLIC_DOMAIN}${
                            cat.image
                          }`}
                          alt={cat.name}
                          className="size-[30px] rounded"
                        />
                        <span>{cat.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
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
