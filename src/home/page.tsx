import { Flame, Crown, Sparkles } from "lucide-react";

import HeroBanner from "./HeroBanner";
import SearchBar from "./SearchBar";
import QuickAccessBar from "./QuickAccessBar";
import CategorySection from "./CategorySection";
import ProductCarousel from "./ProductCarousel";
import TopUpSection from "./TopUpSection";
import HowItWorks from "./HowItWorks";
import TrustBar from "./TrustBar";
import PromoCTA from "./PromoCTA";

const Index = () => {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 app-grid-overlay opacity-40 dark:opacity-30" />
      <div className="pointer-events-none fixed -top-48 -end-32 h-[420px] w-[420px] rounded-full app-glow-cyan blur-[100px]" />
      <div className="pointer-events-none fixed -bottom-48 -start-32 h-[480px] w-[480px] rounded-full app-glow-purple blur-[120px]" />
      <div className="pointer-events-none fixed top-1/3 start-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-blue-600/5 blur-[80px]" />

      <main className="relative container mx-auto max-w-[1400px] space-y-12 px-4 py-8 sm:space-y-14 sm:py-10">
        {/* Hero + Search */}
        <div className="space-y-6">
          <HeroBanner />
          <SearchBar />
        </div>

        {/* Logged-in dashboard strip */}
        <QuickAccessBar />

        {/* Featured products */}
        <ProductCarousel
          title="منتجات مميزة"
          subtitle="الأكثر طلباً هذا الأسبوع"
          icon={Crown}
          accent="text-amber-400"
          params={{ status: "active", sort: "order_asc" }}
          limit={14}
        />

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
