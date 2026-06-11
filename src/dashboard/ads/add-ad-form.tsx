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
import { Link2, FileText, ImagePlus, ToggleRight, Loader2, Plus, AlertCircle } from "lucide-react";

import postAd from "../../api/postAd";
import { useTranslation } from "react-i18next";

export default function AddAdForm({ query }: { query: UseQueryResult }) {
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<string | null>(null);

  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  const { toast } = useToast();
  const [t, i18n] = useTranslation("global");

  const validate = () => {
    const errs: Record<string, string> = {};
    const title = titleRef.current?.value.trim() || "";
    const desc = descriptionRef.current?.value.trim() || "";

    if (!title) errs.title = t("required") || "مطلوب";
    if (title.length > 500) errs.title = "500 " + (t("max_chars") || "حرف كحد أقصى");
    if (!desc) errs.description = t("required") || "مطلوب";
    if (!imageRef.current?.files?.[0]) errs.image = t("required") || "مطلوبة";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const clearField = (field: string) => setErrors((p) => { const n = { ...p }; delete n[field]; return n; });

  const handleImageChange = () => {
    clearField("image");
    const file = imageRef.current?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const postAdMutation = useMutation({
    mutationFn: async () => {
      const title = titleRef.current?.value as string;
      const description = descriptionRef.current?.value as string;
      const image: File | undefined = imageRef.current?.files?.[0];
      const active = activeRef.current?.dataset["state"] === "checked";

      const response = await postAd(localStorage.getItem("token") as string, {
        title,
        description,
        active,
        image,
      });
      return response;
    },
    onSuccess: (data) => {
      toast({ title: "Done!", description: data.data.result });
      setOpen(false);
      setErrors({});
      setPreview(null);
      query.refetch();
    },
    onError: (error: AxiosError) => {
      toast({
        title: "Error!",
        description: (error.response?.data as { error: string }).error,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    if (validate()) postAdMutation.mutate();
  };

  const handleClose = (v: boolean) => {
    setOpen(v);
    if (!v) { setErrors({}); setPreview(null); }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          {t("add")}
        </Button>
      </DialogTrigger>
      <DialogContent dir={i18n.language === "en" ? "ltr" : "rtl"} className="sm:max-w-[480px] p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl font-bold text-primary">{t("add_ad")}</DialogTitle>
          <VisuallyHidden>
            <DialogDescription></DialogDescription>
          </VisuallyHidden>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              {t("title") || "العنوان"}
            </Label>
            <Input
              ref={titleRef}
              id="title"
              placeholder={t("title") || "العنوان"}
              className={`transition-all ${errors.title ? "border-destructive focus-visible:ring-destructive/30" : "border-border focus-visible:ring-primary/30"}`}
              onChange={() => clearField("title")}
            />
            {errors.title && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              {t("description")}
            </Label>
            <Input
              ref={descriptionRef}
              id="description"
              placeholder={t("description") || ""}
              className={`transition-all ${errors.description ? "border-destructive focus-visible:ring-destructive/30" : "border-border focus-visible:ring-primary/30"}`}
              onChange={() => clearField("description")}
            />
            {errors.description && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.description}
              </p>
            )}
          </div>

          {/* Image */}
          <div className="space-y-2">
            <Label htmlFor="image" className="text-sm font-semibold flex items-center gap-2">
              <ImagePlus className="w-4 h-4 text-primary" />
              {t("image")}
            </Label>
            <div
              onClick={() => imageRef.current?.click()}
              className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 cursor-pointer transition-all hover:border-primary/50 hover:bg-primary/5 ${
                errors.image ? "border-destructive bg-destructive/5" : preview ? "border-primary/40 bg-primary/5" : "border-border"
              }`}
            >
              {preview ? (
                <img src={preview} alt="Preview" className="h-28 w-full object-contain rounded-lg" />
              ) : (
                <>
                  <ImagePlus className="w-8 h-8 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{t("choose_image") || "اضغط لاختيار صورة"}</span>
                </>
              )}
              <input
                ref={imageRef}
                id="image"
                type="file"
                accept="image/*"
                className="hidden"
                title={t("image") || "image"}
                onChange={handleImageChange}
              />
            </div>
            {errors.image && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.image}
              </p>
            )}
          </div>

          {/* Active */}
          <div className="flex items-center justify-between rounded-xl border border-border p-3">
            <Label htmlFor="active" className="text-sm font-semibold flex items-center gap-2 cursor-pointer">
              <ToggleRight className="w-4 h-4 text-primary" />
              {t("active")}?
            </Label>
            <Checkbox ref={activeRef} id="active" defaultChecked />
          </div>

          {/* Submit */}
          <Button
            disabled={postAdMutation.isPending}
            className="w-full gap-2 h-11 text-sm font-bold"
            type="submit"
            onClick={handleSubmit}
          >
            {postAdMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("saving")}
              </>
            ) : (
              t("save")
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
