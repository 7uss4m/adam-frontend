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
import { UseQueryResult, useMutation } from "@tanstack/react-query";
import { Ad, } from "../../types/types";
import { useToast } from "../../components/ui/use-toast";
import { AxiosError } from "axios";

import putAd from "../../api/putAd";
import { useTranslation } from "react-i18next";

export default function EditAdForm({
  id,
  query,
  ad,
}: {
  id: string;
  query: UseQueryResult;
  ad: Ad;
}) {
  // state
  const [open, setOpen] = useState(false);
  // refs
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);
  // toast
  const { toast } = useToast();


  // mutation
  const putAdMutation = useMutation({
    mutationFn: async () => {
      const response = await putAd(
        localStorage.getItem("token") as string,
        id.toString(),
        {
          title: titleRef.current?.value as string,
          description: descriptionRef.current?.value as string,
          active: activeRef.current?.value == "on" ? true : false,
          image: imageRef.current?.files ? imageRef.current?.files[0] : undefined
        }
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

  // translation
  const [t, i18n] = useTranslation("global")

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{t("edit")}</Button>
      </DialogTrigger>
      <DialogContent dir={i18n.language == "en" ? "ltr" : "rtl"} className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-start text-primary">{t("edit_ad")}</DialogTitle>
          <VisuallyHidden>
            <DialogDescription></DialogDescription>
          </VisuallyHidden>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              {t("link")}
            </Label>
            <Input
              defaultValue={ad.title}
              ref={titleRef}
              id="title"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              {t("description")}
            </Label>
            <Input
              defaultValue={ad.description}
              ref={descriptionRef}
              id="description"
              className="col-span-3"
            />
          </div>
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="active" className="text-right">
              {t("active")}?
            </Label>
            <Checkbox
              defaultChecked={ad.active}
              ref={activeRef}
              id="active"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={putAdMutation.isPending}
            variant={putAdMutation.isPending ? "ghost" : "default"}
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              putAdMutation.mutate();
            }}
          >
            {putAdMutation.isPending ? t("saving") : t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
