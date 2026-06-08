import CategorySection from "./CategorySection";
import HeroBanner from "./HeroBanner";
// import ProductsGrid from "./ProductsGrid";
import TopUpSection from "./TopUpSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6">
        <HeroBanner />
        <CategorySection />
        {/* <ProductsGrid
          title="الأكثر مبيعاً 🔥"
          subtitle="المنتجات الأكثر طلباً هذا الأسبوع"
        /> */}
        <TopUpSection />
        {/* <ProductsGrid  title="احدث المنتجات ⚡" subtitle="لا تفوّت هذه الفرص" /> */}
      </main>
      {/* <Footer /> */}
    </div>
  );
};

export default Index;
