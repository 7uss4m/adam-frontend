import CategorySection from "./CategorySection";
import HeroBanner from "./HeroBanner";
import ProductsGrid from "./ProductsGrid";
import SearchBar from "./SearchBar";
import TrustBar from "./TrustBar";

const Index = () => {
  return (
    <div className="min-h-screen bg-[#050B14]">
      {/* Animated background grid */}
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:60px_60px] opacity-20" />

      {/* Animated glow orbs */}
      <div className="pointer-events-none fixed -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl opacity-40 animate-pulse" />
      <div className="pointer-events-none fixed -bottom-40 -left-40 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />

      <main className="relative container mx-auto max-w-[95%] md:max-w-[90%] lg:max-w-[85%] xl:max-w-[80%] px-4 py-8 space-y-10">
        <HeroBanner />
        <SearchBar />
        <CategorySection />
        <ProductsGrid title="منتجات مميزة" subtitle="أفضل العروض الحالية" />
        <TrustBar />
      </main>
    </div>
  );
};

export default Index;