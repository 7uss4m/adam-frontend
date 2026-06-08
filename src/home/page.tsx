import CategorySection from "./CategorySection";
import HeroBanner from "./HeroBanner";
import ProductsGrid from "./ProductsGrid";
import SearchBar from "./SearchBar";
import TrendingSection from "./TrendingSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6">
        <HeroBanner />
        <SearchBar />
        <TrendingSection />
        <CategorySection />
        <ProductsGrid title="منتجات المميزة" />
      </main>
    </div>
  );
};

export default Index;