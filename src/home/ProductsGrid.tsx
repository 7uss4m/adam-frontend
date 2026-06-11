import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Crown, Sparkles } from "lucide-react";
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
  available?: boolean | number | null;
  image?: string;
}

interface ProductsGridProps {
  title: string;
  subtitle?: string;
}

function isAvailable(v: Product["available"]) {
  if (v === true) return true;
  if (v === false) return false;
  if (typeof v === "number") return v === 1;
  if (typeof v === "string")
    return v === "1" || (v as string)?.toLowerCase() === "true";
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
        const filtered = Array.isArray(list)
          ? list.filter((p) => isAvailable(p.available))
          : [];
        if (mounted) setProducts(filtered);
      } catch {
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
    <section className="py-10">
      {/* Featured Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative mb-8 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          {/* Glowing crown icon */}
          <motion.div
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="p-2 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg shadow-yellow-500/40"
          >
            <Crown className="w-5 h-5 text-white fill-white" />
          </motion.div>

          <div>
            <h2 className="text-xl font-black bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>

          <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
        </div>

        {/* Decorative line */}
        <div className="flex-1 mx-4 h-px bg-gradient-to-r from-yellow-500/40 via-amber-300/20 to-transparent" />
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-yellow-500/10">
              <div className="aspect-square animate-pulse bg-secondary" />
              <div className="px-3 py-3">
                <div className="h-3 w-2/3 mx-auto rounded animate-pulse bg-secondary" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          لا توجد منتجات حالياً
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {products.slice(0, 12).map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              viewport={{ once: true }}
            >
              <Link to={`/product/${product.id}`}>
                <ProductCard
                  name={product.name}
                  category={product.category}
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
