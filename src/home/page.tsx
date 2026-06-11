import CategorySection from "./CategorySection";
import HeroBanner from "./HeroBanner";
import ProductsGrid from "./ProductsGrid";
import SearchBar from "./SearchBar";
import TrustBar from "./TrustBar";

const Index = () => {
  return (
    <div className="min-h-screen bg-[#050B14]">
      <main className="container mx-auto max-w-[95%] md:max-w-[90%] lg:max-w-[85%] xl:max-w-[80%] px-4 py-6 space-y-0">
        <HeroBanner />
        <SearchBar />
        <CategorySection />
        <ProductsGrid title="منتجات المميزة" />
        <TrustBar />
      </main>
    </div>
  );
};

export default Index;