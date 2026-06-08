import { useRef, useState } from "react";
import { Button } from "../../components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { useMutation, UseQueryResult } from "@tanstack/react-query";
import { useToast } from "../../components/ui/use-toast";
import { AxiosError } from "axios";
import postAdmin from "../../api/postAdmin";
import { useTranslation } from "react-i18next";


export function AddAdminForm({ query }: { query: UseQueryResult }) {

  // state
  const [open, setOpen] = useState(false);

  // refs
  const userRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // translation
  const [t, i18n] = useTranslation("global")
  // toast
  const { toast } = useToast()


  // mutation
  const postAdminMutation = useMutation({
    mutationFn: async () => {
      const response = await postAdmin(
        localStorage.getItem("token") as string,
        {
          user_name: userRef.current?.value as string,
          email: emailRef.current?.value as string,
          password: passwordRef.current?.value as string
        }

      );
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
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">{t("add")}</Button>
      </DialogTrigger>
      <DialogContent dir={i18n.language == "en" ? "ltr" : "rtl"} className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-primary"></DialogTitle>
          <VisuallyHidden.Root>
            <DialogDescription>
            </DialogDescription>
          </VisuallyHidden.Root>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              {t("username")}
            </Label>
            <Input
              id="username"
              className="col-span-3"
              ref={userRef}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              {t("email")}
            </Label>
            <Input
              id="email"
              type="text"
              className="col-span-3"
              ref={emailRef}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              {t("password")}
            </Label>
            <Input
              id="password"
              type="password"
              className="col-span-3"
              ref={passwordRef}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" disabled={postAdminMutation.isPending} variant={postAdminMutation.isPending ? "ghost" : "default"} onClick={(e) => {
            e.preventDefault()
            postAdminMutation.mutate()
          }}>{postAdminMutation.isPending ? t("saving") : t("save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
