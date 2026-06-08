// ProductsGrid.tsx
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import getAllProducts from "../api/getAllProducts";

interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  original_price: number | null;
  image_url: string | null;
  badge: string | null;
  instant_delivery: boolean | null;
  available?: boolean | number | null; // backend may return boolean or 0/1
  image?: string;
}

interface ProductsGridProps {
  title: string;
  subtitle?: string;
}

const categoryLabels: Record<string, string> = {
  games: "ألعاب",
  subscriptions: "اشتراكات",
  cards: "بطاقات",
};

function isAvailable(v: Product["available"]) {
  // supports: true/false, 1/0, "1"/"0"
  if (v === true) return true;
  if (v === false) return false;
  if (typeof v === "number") return v === 1;
  if (typeof v === "string")
    return v === "1" || (v as string)?.toLowerCase() === "true";
  // if API doesn't send available, treat as available
  return true;
}

export default function ProductsGrid({ title, subtitle }: ProductsGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const token = useMemo(() => localStorage.getItem("token") || "", []);

  useEffect(() => {
    let mounted = true;

    const fetch = async () => {
      try {
        setLoading(true);

        const res = await getAllProducts(token);
        const list = (res.data?.result ?? res.data ?? []) as Product[];

        // keep same old behavior: only available=true
        const filtered = Array.isArray(list)
          ? list.filter((p) => isAvailable(p.available))
          : [];

        if (mounted) setProducts(filtered);
      } catch (e) {
        if (mounted) setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetch();
    return () => {
      mounted = false;
    };
  }, [token]);

  return (
    <section className="py-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="font-orbitron text-xl font-bold text-foreground">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-[220px] rounded-xl border border-border bg-card/60 animate-pulse"
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          لا توجد منتجات حالياً
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.slice(0, 20).map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              viewport={{ once: true }}
            >
              <Link to={`/product/${product.id}`}>
                <ProductCard
                  name={product.name}
                  category={
                    categoryLabels[product.category] || product.category
                  }
                  price={product.price}
                  originalPrice={product.original_price ?? undefined}
                  image={product.image || "/placeholder.svg"}
                  badge={product.badge ?? undefined}
                  instant={product.instant_delivery ?? false}
                />
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
