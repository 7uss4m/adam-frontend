/* eslint-disable @typescript-eslint/no-explicit-any */

// ✅ SAME "full image card" style used before (image fills card + gradient + title overlay)

import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import getAllSub from "../api/getAllSub";
import getSubCategories from "../api/getSubCategories";
import getProducts from "../api/getProducts";
import getDollar from "../api/getDollar";

import type { Category, Product } from "../types/types";
import logo from "../assets/logo.webp";

import Spinner from "../components/Spinner";
import { Input } from "../components/ui/input";
import { cn } from "../lib/utils";
import { useCurrency } from "../context/CurrencyContext";

export default function Products() {
  const { id, subId } = useParams();
  const [t] = useTranslation("global");
  const { currency } = useCurrency();

  const [search, setSearch] = useState("");

  // --- queries ---
  const getAllSubQuery = useQuery({
    queryKey: ["all", "subc", subId],
    queryFn: async () => {
      const response = await getAllSub();
      const found = (response.data.result as Category[]).find(
        (c) => c.id.toString() === String(subId)
      );
      return found as Category | undefined;
    },
    refetchOnWindowFocus: false,
  });

  const getSubCategoriesQuery = useQuery({
    queryKey: ["subc", subId],
    queryFn: async () => {
      const response = await getSubCategories(subId as string);
      return response.data.result as Category[];
    },
    refetchOnWindowFocus: false,
  });

  const getDolla = useQuery({
    queryKey: ["static", "dollar"],
    queryFn: async () => {
      const response = await getDollar();
      return Number(response.data.date.dollar_exchange || 0);
    },
    refetchOnWindowFocus: false,
  });

  const getProductQuery = useQuery({
    queryKey: ["getProduct", "page", subId],
    queryFn: async () => {
      const response = await getProducts(
        subId as string,
        localStorage.getItem("token") as string
      );
      return response.data.result as Product[];
    },
    refetchOnWindowFocus: false,
  });

  const loading =
    getAllSubQuery.isLoading ||
    getSubCategoriesQuery.isLoading ||
    getProductQuery.isLoading ||
    getDolla.isLoading;

  // --- filtering (same behavior, but with memo instead of extra state) ---
  const filteredCatgs = useMemo(() => {
    const list = getSubCategoriesQuery.data || [];
    const q = search.trim();
    if (!q) return list;
    return list.filter((c) => (c.name || "").includes(q));
  }, [getSubCategoriesQuery.data, search]);

  const filteredProd = useMemo(() => {
    const list = getProductQuery.data || [];
    const q = search.trim();
    if (!q) return list;
    return list.filter((p) => (p.name || "").includes(q));
  }, [getProductQuery.data, search]);

  const dollar = getDolla.data || 0;

  const hasAny =
    (filteredCatgs?.length || 0) > 0 || (filteredProd?.length || 0) > 0;

  return (
    <>
      {loading ? (
        <section className="min-h-[40vh] flex justify-center items-center">
          <Spinner />
        </section>
      ) : getSubCategoriesQuery.isSuccess &&
        getProductQuery.isSuccess &&
        (getSubCategoriesQuery.data || getProductQuery.data) ? (
        <section className="min-h-svh relative pb-32 space-y-6 py-10">
          {/* Search */}
          <div className="container relative z-10 max-w-[100%] md:max-w-[90%] lg:max-w-[70%] md:px-0">
            <Input
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("search")}
              value={search}
            />
          </div>

          {/* Title */}
          <div className="container relative max-w-[100%] md:max-w-[90%] lg:max-w-[70%] px-2">
            <span className="capitalize text-accent font-semibold text-2xl">
              {getAllSubQuery.data?.name}
            </span>
          </div>

          {/* Grid (same style as your new cards) */}
          <div className="container max-w-[100%] md:max-w-[90%] lg:max-w-[70%] p-2">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {/* SUB CATEGORIES (full image cards) */}
              {filteredCatgs?.map((category) => (
                <Link
                  key={`sub-${category.id}`}
                  to={`/categories/${id}/subs/${category.id}`}
                  onClick={(e) => {
                    if (!category.available) e.preventDefault();
                  }}
                  className={cn(
                    "group relative h-[140px] w-full overflow-hidden rounded-xl",
                    category.available
                      ? "cursor-pointer"
                      : "cursor-not-allowed opacity-60"
                  )}
                >
                  <img
                    src={category.image || logo}
                    alt={category.name}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).src = logo; }}
                  />

                  {/* gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                  {/* not available badge */}
                  {!category.available ? (
                    <div className="absolute left-2 top-2 rounded-full bg-destructive/90 px-2 py-1 text-[10px] font-semibold text-white">
                      {t("not_available")}
                    </div>
                  ) : null}

                  {/* title */}
                  <div className="absolute bottom-3 left-0 right-0 px-2 text-center">
                    <p className="text-sm font-bold text-white drop-shadow-lg line-clamp-1">
                      {category.name}
                    </p>
                  </div>
                </Link>
              ))}

              {/* PRODUCTS (full image cards + price overlay) */}
              {filteredProd?.map((product) => {
                const price = Number(product.price);
                const originalPrice = product.originalPrice
                  ? Number(product.originalPrice)
                  : null;
                const priceText =
                  currency === "dollar"
                    ? `$${price.toFixed(2)}`
                    : `SYP ${(price * dollar).toFixed(0)}`;
                const originalPriceText =
                  originalPrice && product.hasOffer
                    ? currency === "dollar"
                      ? `$${originalPrice.toFixed(2)}`
                      : `SYP ${(originalPrice * dollar).toFixed(0)}`
                    : null;

                return (
                  <Link
                    key={`prod-${product.id}`}
                    to={`product/${product.id}`}
                    onClick={(e) => {
                      if (!product.active) e.preventDefault();
                    }}
                    className={cn(
                      "group relative h-[140px] w-full overflow-hidden rounded-xl",
                      product.active
                        ? "cursor-pointer"
                        : "cursor-not-allowed opacity-60"
                    )}
                  >
                    <img
                      src={product.image || logo}
                      alt={product.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).src = logo; }}
                    />

                    {/* gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                    {/* not available badge */}
                    {!product.active ? (
                      <div className="absolute left-2 top-2 rounded-full bg-destructive/90 px-2 py-1 text-[10px] font-semibold text-white">
                        {t("not_available")}
                      </div>
                    ) : product.hasOffer ? (
                      <div className="absolute left-2 top-2 rounded-full bg-cyan-600/90 px-2 py-1 text-[10px] font-semibold text-white">
                        {t("special_offer")}
                      </div>
                    ) : null}

                    {/* title + price */}
                    <div className="absolute bottom-3 left-0 right-0 px-2 text-center">
                      <p className="text-sm font-bold text-white drop-shadow-lg line-clamp-1">
                        {product.name}
                      </p>
                      <div className="mt-1 flex items-center justify-center gap-1.5">
                        <p className="text-[11px] font-semibold text-cyan-300">
                          {priceText}
                        </p>
                        {originalPriceText && (
                          <p className="text-[10px] text-white/60 line-through">
                            {originalPriceText}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}

              {/* empty state */}
              {!hasAny ? (
                <div className="col-span-full rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
                  {t("no_product")}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : (
        <section className="min-h-svh relative flex justify-center items-center text-accent text-xl">
          {t("no_product")}
        </section>
      )}
    </>
  );
}
