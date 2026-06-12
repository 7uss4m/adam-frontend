import { useQuery } from "@tanstack/react-query";
import { Flame, Crown, Sparkles } from "lucide-react";
import getCategories from "../api/getCategories";
import type { Category } from "../types/types";

import HeroBanner from "./HeroBanner";
import SearchBar from "./SearchBar";
import QuickAccessBar from "./QuickAccessBar";
import PlatformStats from "./PlatformStats";
import CategorySection from "./CategorySection";
import ProductCarousel from "./ProductCarousel";
import TopUpSection from "./TopUpSection";
import HowItWorks from "./HowItWorks";
import TrustBar from "./TrustBar";
import PromoCTA from "./PromoCTA";

const Index = () => {
  const categoriesQuery = useQuery({
    queryKey: ["categories-count"],
    queryFn: async () => {
      const res = await getCategories();
      return (res.data?.result ?? res.data) as Category[];
    },
    staleTime: 120_000,
  });

  const categoryCount = categoriesQuery.data?.length ?? 0;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050B14]">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(6,182,212,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.04)_1px,transparent_1px)] bg-[size:64px_64px] opacity-30" />
      <div className="pointer-events-none fixed -top-48 -end-32 h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-[100px]" />
      <div className="pointer-events-none fixed -bottom-48 -start-32 h-[480px] w-[480px] rounded-full bg-purple-600/8 blur-[120px]" />
      <div className="pointer-events-none fixed top-1/3 start-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-blue-600/5 blur-[80px]" />

      <main className="relative container mx-auto max-w-[1400px] space-y-12 px-4 py-8 sm:space-y-14 sm:py-10">
        {/* Hero + Search */}
        <div className="space-y-6">
          <HeroBanner />
          <SearchBar />
        </div>

        {/* Logged-in dashboard strip */}
        <QuickAccessBar />

        {/* Live platform stats */}
        <PlatformStats categoryCount={categoryCount} />

        {/* Categories */}
        <CategorySection />

        {/* Exclusive offers */}
        <ProductCarousel
          title="عروض حصرية"
          subtitle="خصومات محدودة — لا تفوّت الفرصة"
          icon={Flame}
          accent="text-rose-400"
          params={{ status: "active", offer: "offer", sort: "order_asc" }}
          limit={12}
        />

        {/* Featured products */}
        <ProductCarousel
          title="منتجات مميزة"
          subtitle="الأكثر طلباً هذا الأسبوع"
          icon={Crown}
          accent="text-amber-400"
          params={{ status: "active", sort: "order_asc" }}
          limit={14}
        />

        {/* New arrivals */}
        <ProductCarousel
          title="وصل حديثاً"
          subtitle="آخر المنتجات المضافة للمتجر"
          icon={Sparkles}
          accent="text-violet-400"
          params={{ status: "active", sort: "id_desc" }}
          limit={10}
        />

        {/* Top-up (logged in) */}
        <TopUpSection />

        {/* How it works */}
        <HowItWorks />

        {/* Trust */}
        <TrustBar />

        {/* Sign up CTA (guests) */}
        <PromoCTA />
      </main>
    </div>
  );
};

export default Index;
