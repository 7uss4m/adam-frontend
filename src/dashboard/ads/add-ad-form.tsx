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
import { useToast } from "../../components/ui/use-toast";
import { AxiosError } from "axios";

import postAd from "../../api/postAd";
import { useTranslation } from "react-i18next";

export default function AddAdForm({ query }: { query: UseQueryResult }) {
  // state
  const [open, setOpen] = useState(false)
  // refs
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null);
  // toast
  const { toast } = useToast()

  // mutation
  const postAdMutation = useMutation({
    mutationFn: async () => {


      const title = titleRef.current?.value as string
      const description = descriptionRef.current?.value as string
      const image: File | undefined = imageRef.current?.files ? imageRef.current?.files[0] : undefined
      const active = activeRef.current?.dataset['state'] == "checked" ? true : false

      const data = {
        title,
        description,
        active,
        image
      }


      const response = await postAd(localStorage.getItem("token") as string, data)
      return response
    },
    onSuccess: (data) => {
      toast({
        title: "Done!",
        description: data.data.result
      })
      setOpen(false);
      query.refetch()
    },
    onError: (error: AxiosError) => {
      toast({
        title: "Error!",
        description: (error.response?.data as { error: string }).error
      })
    }
  })

  // translation
  const [t, i18n] = useTranslation("global")

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{t("add")}</Button>
      </DialogTrigger>
      <DialogContent dir={i18n.language == "en" ? "ltr" : "rtl"} className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-start text-primary">{t("add_ad")}</DialogTitle>
          <VisuallyHidden>
            <DialogDescription></DialogDescription>
          </VisuallyHidden>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              {t("link")}
            </Label>
            <Input ref={titleRef} id="title" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              {t("description")}
            </Label>
            <Input ref={descriptionRef} id="description" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="image" className="text-right">
              {t("image")}
            </Label>
            <Input ref={imageRef} id="image" type="file" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="active" className="text-right">
              {t("active")}?
            </Label>
            <Checkbox ref={activeRef} id="active" />
          </div>

        </div>
        <DialogFooter>
          <Button disabled={postAdMutation.isPending} variant={postAdMutation.isPending ? "ghost" : "default"} type="submit" onClick={(e) => {
            e.preventDefault()
            postAdMutation.mutate()
          }}>{postAdMutation.isPending ? t("saving") : t("save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog >
  );
}
