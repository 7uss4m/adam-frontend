import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  LayoutGrid,
  Coins,
  Percent,
  Gamepad2,
  CreditCard,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import getCategories from "../api/getCategories";
import getProductsPaginated from "../api/getProductsPaginated";
import type { Category, Product } from "../types/types";
import { safeOrder, getProductPath, formatUsd, getProductImageUrl } from "./home-utils";

const TAB_ICONS = [Coins, Gamepad2, CreditCard, Percent, LayoutGrid];

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [focused, setFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token") || "";

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await getCategories();
      return (res.data?.result ?? res.data) as Category[];
    },
    staleTime: 120_000,
    refetchOnWindowFocus: false,
  });

  const searchQuery = useQuery({
    queryKey: ["home-search", debounced],
    queryFn: async () => {
      const res = await getProductsPaginated(token, {
        search: debounced,
        page: 1,
        limit: 6,
        status: "active",
      });
      return res.data.result as Product[];
    },
    enabled: debounced.length >= 2,
    refetchOnWindowFocus: false,
  });

  const topCategories = useMemo(() => {
    const list = categoriesQuery.data || [];
    return list
      .filter((c) => c?.available !== false)
      .sort((a, b) => safeOrder(a.order) - safeOrder(b.order))
      .slice(0, 5);
  }, [categoriesQuery.data]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigate(`/categories`);
  };

  const showDropdown =
    focused && debounced.length >= 2 && (searchQuery.isFetching || (searchQuery.data?.length ?? 0) > 0);

  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          {searchQuery.isFetching && debounced.length >= 2 && (
            <Loader2 className="absolute end-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-cyan-500" />
          )}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder="ابحث عن PUBG، Steam، Netflix، بطاقات..."
            className="h-14 w-full rounded-2xl border border-border bg-card/90 px-5 ps-12 text-sm text-foreground shadow-inner backdrop-blur-sm placeholder:text-muted-foreground outline-none transition-all focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
            dir="rtl"
          />
        </form>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <Link
            to="/categories"
            className="flex shrink-0 items-center gap-2 rounded-2xl border border-cyan-500/50 bg-cyan-500/10 px-4 py-3 text-cyan-400 transition-all hover:bg-cyan-500/20"
          >
            <div className="rounded-lg bg-cyan-500 p-1.5">
              <LayoutGrid className="h-4 w-4 text-foreground" />
            </div>
            <div className="text-right">
              <p className="text-xs font-bold">الكل</p>
              <p className="text-[9px] text-muted-foreground">جميع الأقسام</p>
            </div>
          </Link>

          {topCategories.map((cat, i) => {
            const Icon = TAB_ICONS[i % TAB_ICONS.length];
            return (
              <Link
                key={cat.id}
                to={`/categories/${cat.id}/subs`}
                className="flex shrink-0 items-center gap-2 rounded-2xl border border-border bg-card/80 px-4 py-3 text-muted-foreground transition-all hover:border-cyan-500/40 hover:text-gray-200"
              >
                <div className="rounded-lg bg-muted p-1.5">
                  <Icon className="h-4 w-4 text-amber-400" />
                </div>
                <p className="max-w-[80px] truncate text-xs font-bold text-foreground">
                  {cat.name}
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute start-0 end-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-border bg-card/95 shadow-2xl backdrop-blur-xl"
          >
            <div className="border-b border-border px-4 py-2.5 text-xs text-muted-foreground">
              نتائج البحث عن &quot;{debounced}&quot;
            </div>
            <ul className="max-h-72 overflow-y-auto py-1">
              {searchQuery.data?.map((product) => (
                <li key={product.id}>
                  <Link
                    to={getProductPath(product)}
                    onClick={() => setFocused(false)}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-cyan-500/10"
                  >
                    <img
                      src={getProductImageUrl(product.image)}
                      alt=""
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-foreground">
                        {product.name}
                      </p>
                      {product.categories?.name && (
                        <p className="truncate text-xs text-muted-foreground">
                          {product.categories.name}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 text-sm font-black text-cyan-400">
                      {formatUsd(product.price)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              to="/categories"
              onClick={() => setFocused(false)}
              className="flex items-center justify-center gap-1 border-t border-border py-3 text-xs font-semibold text-cyan-400 hover:bg-cyan-500/5"
            >
              عرض كل النتائج
              <ArrowLeft className="h-3.5 w-3.5" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
