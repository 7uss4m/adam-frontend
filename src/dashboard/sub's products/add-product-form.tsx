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
import { useRef, useState } from "react";
import { Checkbox } from "../../components/ui/checkbox";
import { UseQueryResult, useMutation, useQuery } from "@tanstack/react-query";
import { Category, Require } from "../../types/types";
import postProduct from "../../api/postProduct";
import { useToast } from "../../components/ui/use-toast";
import { AxiosError } from "axios";
import getCategories from "../../api/getCategories";
import { RequireInput } from "../products/requires-input";
import AddRequireForm from "../products/add-require-form";
import { useTranslation } from "react-i18next";

export default function AddProductForm({ query }: { query: UseQueryResult }) {
  // state
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [mainPrice, setMainPrice] = useState("");
  const [order, setOrder] = useState("");
  // refs
  const nameRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);
  // toast
  const { toast } = useToast();
  const [t] = useTranslation("global");
  // state
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);

  const getAllCategoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await getCategories();
      return response.data.result as Category[];
    },
  });

  // mutation
  const postProductMutation = useMutation({
    mutationFn: async () => {
      const name = nameRef.current?.value as string;
      const image: File | undefined = imageRef.current?.files
        ? imageRef.current?.files[0]
        : undefined;
      const active =
        activeRef.current?.dataset["state"] == "checked" ? true : false;

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
        <Button>Add Product</Button>
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sub" className="text-right">
              {t("category")}
            </Label>
            <Select
              onValueChange={(value) => {
                setCategoryId(value);
              }}
            >
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder={t("select_parent_category")} />
              </SelectTrigger>
              <SelectContent>
                {getAllCategoriesQuery.isSuccess &&
                  getAllCategoriesQuery.data &&
                  getAllCategoriesQuery.data.map((cat) => (
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
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right col-span-1">
              Price
            </Label>
            <Input
              className="col-span-3 w-full"
              onChange={(e) => setPrice(e.currentTarget.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right col-span-1">
              Description
            </Label>
            <Input
              className="col-span-3 w-full"
              onChange={(e) => setDescription(e.currentTarget.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right col-span-1">
              Main Price
            </Label>
            <Input
              className="col-span-3 w-full"
              onChange={(e) => setMainPrice(e.currentTarget.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="order" className="text-right col-span-1">
              Order
            </Label>
            <Input
              type="number"
              min={1}
              className="col-span-3 w-full"
              onChange={(e) => setOrder(e.currentTarget.value)}
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
