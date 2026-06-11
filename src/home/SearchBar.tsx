import { useState, useMemo } from "react";
import { Search, LayoutGrid, Coins, Percent, Gamepad2, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import getCategories from "../api/getCategories";
import type { Category } from "../types/types";

function safeOrder(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 999999;
}

const TAB_ICONS = [Coins, Gamepad2, CreditCard, Percent, LayoutGrid];

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await getCategories();
      return (res.data?.result ?? res.data) as Category[];
    },
    refetchOnWindowFocus: false,
  });

  const topCategories = useMemo(() => {
    const list = categoriesQuery.data || [];
    return list
      .filter((c) => c?.available !== false)
      .sort((a, b) => safeOrder(a.order) - safeOrder(b.order))
      .slice(0, 4);
  }, [categoriesQuery.data]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="mt-6 mb-2">
      <div className="flex flex-col sm:flex-row items-stretch gap-3">
        {/* Search input */}
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن منتجاتك المفضلة..."
            className="w-full rounded-2xl border border-[#1a2a44] bg-[#0a1628] px-5 py-4 pl-12 text-sm text-white placeholder:text-gray-500 outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 transition-all"
            dir="rtl"
          />
        </form>

        {/* Category quick tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {/* All tab */}
          <Link
            to="/categories"
            className="flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-2xl border border-cyan-500 bg-cyan-500/10 text-cyan-400 transition-all hover:bg-cyan-500/20"
          >
            <div className="p-1.5 rounded-lg bg-cyan-500">
              <LayoutGrid className="w-4 h-4 text-white" />
            </div>
            <div className="text-right">
              <p className="text-xs font-bold">الكل</p>
              <p className="text-[9px] text-gray-500">جميع المنتجات</p>
            </div>
          </Link>

          {topCategories.map((cat, i) => {
            const Icon = TAB_ICONS[i % TAB_ICONS.length];
            return (
              <Link
                key={cat.id}
                to={`/categories/${cat.id}/subs`}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-2xl border border-[#1a2a44] bg-[#0a1628] text-gray-400 transition-all hover:border-cyan-500/40 hover:text-gray-200"
              >
                <div className="p-1.5 rounded-lg bg-[#1a2a44]">
                  <Icon className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-white">{cat.name}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}