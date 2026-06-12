import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, Plus, Trash2, X, Loader2 } from "lucide-react";
import { useToast } from "../../components/ui/use-toast";
import { AxiosError } from "axios";
import Spinner from "../../components/Spinner";
import getCurrencies from "../../api/getCurrencies";
import postCurrency from "../../api/postCurrency";
import deleteCurrency from "../../api/deleteCurrency";

interface Currency {
  id: string;
  name: string;
}

export default function DashboardCurrencies() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const token = localStorage.getItem("token") || "";

  const [newName, setNewName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  /* ── Fetch ── */
  const query = useQuery({
    queryKey: ["currencies"],
    queryFn: async () => {
      const res = await getCurrencies();
      return res.data.result as Currency[];
    },
    refetchOnWindowFocus: false,
  });

  /* ── Add ── */
  const addMutation = useMutation({
    mutationFn: () => postCurrency(token, newName.trim()),
    onSuccess: () => {
      toast({ title: "تمت الإضافة", description: `تمت إضافة العملة "${newName}" بنجاح` });
      setNewName("");
      queryClient.invalidateQueries({ queryKey: ["currencies"] });
    },
    onError: (err: AxiosError) => {
      toast({
        title: "خطأ",
        description: (err.response?.data as { error?: string })?.error || "فشل الإضافة",
        variant: "destructive",
      });
    },
  });

  /* ── Delete ── */
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCurrency(token, id),
    onSuccess: () => {
      toast({ title: "تم الحذف", description: "تم حذف العملة بنجاح" });
      setDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ["currencies"] });
    },
    onError: (err: AxiosError) => {
      toast({
        title: "خطأ",
        description: (err.response?.data as { error?: string })?.error || "فشل الحذف",
        variant: "destructive",
      });
    },
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addMutation.mutate();
  };

  return (
    <section dir="rtl" className="container mx-auto py-10 space-y-8 max-w-3xl">

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg shadow-yellow-500/30">
          <Coins className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground">العملات</h1>
          <p className="text-sm text-muted-foreground">إدارة عملات صناديق الشحن</p>
        </div>
      </motion.header>

      {/* Add Form */}
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleAdd}
        className="flex gap-3 items-center p-4 rounded-2xl border border-border bg-card shadow-sm"
      >
        <div className="flex-1 relative">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="اسم العملة (مثال: ليرة، دولار، يورو)"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={!newName.trim() || addMutation.isPending}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
        >
          {addMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          <span>إضافة</span>
        </button>
      </motion.form>

      {/* List */}
      {query.isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : !query.data?.length ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground"
        >
          <Coins className="w-12 h-12 opacity-20" />
          <p className="text-sm">لا توجد عملات حالياً</p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="space-y-3"
        >
          <p className="text-xs text-muted-foreground font-semibold">
            {query.data.length} عملة مسجلة
          </p>

          <AnimatePresence>
            {query.data.map((currency, i) => (
              <motion.div
                key={currency.id}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between px-5 py-4 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center flex-shrink-0">
                    <Coins className="w-4 h-4 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{currency.name}</p>
                    <p className="text-[11px] text-muted-foreground">ID: {currency.id}</p>
                  </div>
                </div>

                {deleteId === currency.id ? (
                  /* Confirm delete */
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">تأكيد الحذف؟</span>
                    <button
                      type="button"
                      onClick={() => deleteMutation.mutate(currency.id)}
                      disabled={deleteMutation.isPending}
                      className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      {deleteMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "حذف"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteId(null)}
                      className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDeleteId(currency.id)}
                    className="p-2 rounded-xl hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  );
}
