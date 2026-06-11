import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, LayoutGrid, List, Pencil, Trash2, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Switch } from "../../components/ui/switch";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

import Spinner from "../../components/Spinner";
import { Ad } from "../../types/types";
import AddAdForm from "./add-ad-form";
import EditAdForm from "./edit-ad-form";
import DeleteAdForm from "./delete-ad-form";
import getAds from "../../api/getAds";
import putAdState from "../../api/putAdState";
import { useTranslation } from "react-i18next";
import { useToast } from "../../components/ui/use-toast";
import logo from "../../assets/logo.webp";

function AdCard({ ad, query }: { ad: Ad; query: ReturnType<typeof useQuery> }) {
  const [t] = useTranslation("global");
  const { toast } = useToast();
  const [imgSrc, setImgSrc] = useState(ad.image || logo);

  const toggleMutation = useMutation({
    mutationFn: async (active: number) => {
      return await putAdState(localStorage.getItem("token") as string, ad.id.toString(), active);
    },
    onSuccess: (data) => {
      toast({ title: "Done!", description: data.data.result });
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
    >
      {/* Image */}
      <Dialog>
        <DialogTrigger asChild>
          <div className="relative h-44 overflow-hidden cursor-pointer">
            <img
              src={imgSrc}
              alt={ad.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImgSrc(logo)}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            {/* Status badge */}
            <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-sm ${
              ad.active
                ? "bg-emerald-500/90 text-white"
                : "bg-red-500/90 text-white"
            }`}>
              {ad.active ? (t("active") || "فعال") : (t("inactive") || "معطل")}
            </div>
            {/* ID */}
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-sm text-[10px] font-mono text-white">
              #{ad.id}
            </div>
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <VisuallyHidden><DialogTitle></DialogTitle></VisuallyHidden>
            <VisuallyHidden><DialogDescription></DialogDescription></VisuallyHidden>
          </DialogHeader>
          <img src={imgSrc} alt={ad.title} className="rounded-lg w-full" onError={(e) => { (e.target as HTMLImageElement).src = logo; }} />
        </DialogContent>
      </Dialog>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="text-sm font-bold text-foreground line-clamp-1">{ad.title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">{ad.description}</p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border/40">
          <Switch
            dir="ltr"
            defaultChecked={ad.active}
            onClick={(e) => {
              toggleMutation.mutate(e.currentTarget.dataset["state"] === "unchecked" ? 1 : 0);
            }}
            id={`card-switch-${ad.id}`}
          />
          <div className="flex items-center gap-1">
            <EditAdForm id={ad.id.toString()} query={query} ad={ad} />
            <DeleteAdForm query={query} id={ad.id.toString()} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function DashboardAds() {
  const [view, setView] = useState<"table" | "cards">("cards");

  const getAllAdsQuery = useQuery({
    queryKey: ["ads"],
    queryFn: async () => {
      const response = await getAds();
      return response.data.result as Ad[];
    },
    refetchOnWindowFocus: false,
  });

  const [t, i18n] = useTranslation("global");

  return (
    <section
      dir={i18n.language === "en" ? "ltr" : "rtl"}
      className="container mx-auto py-8 px-4 space-y-8"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg">
            <Megaphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">{t("ads")}</h1>
            {getAllAdsQuery.data && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {getAllAdsQuery.data.length} {t("total") || "إجمالي"}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-lg border border-border/60 overflow-hidden">
            <button
              onClick={() => setView("cards")}
              className={`p-2 transition-colors ${view === "cards" ? "bg-primary text-white" : "bg-secondary/40 text-muted-foreground hover:text-foreground"}`}
              title={t("cards_view") || "عرض كروت"}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("table")}
              className={`p-2 transition-colors ${view === "table" ? "bg-primary text-white" : "bg-secondary/40 text-muted-foreground hover:text-foreground"}`}
              title={t("table_view") || "عرض جدول"}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <AddAdForm query={getAllAdsQuery} />
        </div>
      </motion.div>

      {/* Content */}
      {getAllAdsQuery.isFetching ? (
        <div className="min-h-[40vh] flex justify-center items-center">
          <Spinner />
        </div>
      ) : getAllAdsQuery.isSuccess && getAllAdsQuery.data ? (
        <AnimatePresence mode="wait">
          {view === "cards" ? (
            <motion.div
              key="cards"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
              {getAllAdsQuery.data.map((ad) => (
                <AdCard key={ad.id} ad={ad} query={getAllAdsQuery} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="table"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DataTable
                query={getAllAdsQuery}
                columns={columns}
                data={getAllAdsQuery.data}
              />
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
          <Megaphone className="w-12 h-12 text-muted-foreground/30" />
          <p className="text-muted-foreground">{t("something_went_wrong")}</p>
        </div>
      )}
    </section>
  );
}
