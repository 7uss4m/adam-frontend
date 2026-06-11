/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { Fragment, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import logo from "../assets/logo.webp";

import type { Category, Product } from "../types/types";

import Spinner from "../components/Spinner";
import getSubCategories from "../api/getSubCategories";
import getProducts from "../api/getProducts";

import { Input } from "../components/ui/input";
import { cn } from "../lib/utils";

export default function SubCategoryPage() {
  const params = useParams();
  const id = params.id as string;

  const [t] = useTranslation("global");

  const [search, setSearch] = useState("");

  const getSubsQuery = useQuery({
    queryKey: ["sub", id],
    queryFn: async () => {
      const response = await getSubCategories(id);
      return response.data.result as Category[];
    },
    refetchOnWindowFocus: false,
  });

  const getProductQuery = useQuery({
    queryKey: ["getProduct", id],
    queryFn: async () => {
      const response = await getProducts(
        id,
        localStorage.getItem("token") as string
      );
      return response.data.result as Product[];
    },
    refetchOnWindowFocus: false,
  });

  // ✅ same "full image card" style as categories carousel cards (image covers card + gradient + overlay text)
  const filteredSubs = useMemo(() => {
    const list = getSubsQuery.data || [];
    if (!search.trim()) return list;
    return list.filter((c) => (c.name || "").includes(search));
  }, [getSubsQuery.data, search]);

  const filteredProducts = useMemo(() => {
    const list = getProductQuery.data || [];
    if (!search.trim()) return list;
    return list.filter((p) => (p.name || "").includes(search));
  }, [getProductQuery.data, search]);

  const loading = getSubsQuery.isLoading || getProductQuery.isLoading;

  return (
    <section className="relative pb-32 py-10">
      <div className="container relative z-10 max-w-[100%] md:max-w-[90%] lg:max-w-[70%] md:px-0">
        <Input
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("search")}
          value={search}
        />
      </div>

      <div className="container mt-10 max-w-[100%] md:max-w-[90%] lg:max-w-[70%] p-2">
        {loading ? (
          <div className="min-h-[60vh] flex justify-center items-center">
            <Spinner />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {/* SUB CATEGORIES */}
            {getSubsQuery.isSuccess && filteredSubs.length > 0 && (
              <Fragment>
                {filteredSubs.map((category) => (
                  <Link
                    key={`sub-${category.id}`}
                    to={`${category.id}`}
                    onClick={(e) => {
                      if (!category.available) e.preventDefault();
                    }}
                    className={cn(
                      "group relative h-[140px] w-full overflow-hidden rounded-xl",
                      "transition-transform duration-300",
                      category.available
                        ? "cursor-pointer"
                        : "cursor-not-allowed opacity-60"
                    )}
                    style={{ willChange: "transform" }}
                  >
                    {/* full image */}
                    <img
                      src={category.image || logo}
                      alt={category.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).src = logo; }}
                    />

                    {/* gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                    {/* top badge */}
                    {!category.available ? (
                      <div className="absolute left-2 top-2 rounded-full bg-destructive/90 px-2 py-1 text-[10px] font-semibold text-white">
                        {t("not_available")}
                      </div>
                    ) : null}

                    {/* bottom title */}
                    <div className="absolute bottom-3 left-0 right-0 px-2 text-center">
                      <p className="text-sm font-bold text-white drop-shadow-lg line-clamp-1">
                        {category.name}
                      </p>
                    </div>
                  </Link>
                ))}
              </Fragment>
            )}

            {/* PRODUCTS */}
            {getProductQuery.isSuccess && filteredProducts.length > 0 && (
              <Fragment>
                {filteredProducts.map((product) => (
                  <Link
                    key={`prod-${product.id}`}
                    to={`${id}/product/${product.id}`}
                    onClick={(e) => {
                      if (!product.active) e.preventDefault();
                    }}
                    className={cn(
                      "group relative h-[140px] w-full overflow-hidden rounded-xl",
                      "transition-transform duration-300",
                      product.active
                        ? "cursor-pointer"
                        : "cursor-not-allowed opacity-60"
                    )}
                    style={{ willChange: "transform" }}
                  >
                    {/* full image */}
                    <img
                      src={product.image || logo}
                      alt={product.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).src = logo; }}
                    />

                    {/* gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                    {/* top badge */}
                    {!product.active ? (
                      <div className="absolute left-2 top-2 rounded-full bg-destructive/90 px-2 py-1 text-[10px] font-semibold text-white">
                        {t("not_available")}
                      </div>
                    ) : null}

                    {/* bottom title */}
                    <div className="absolute bottom-3 left-0 right-0 px-2 text-center">
                      <p className="text-sm font-bold text-white drop-shadow-lg line-clamp-1">
                        {product.name}
                      </p>
                    </div>
                  </Link>
                ))}
              </Fragment>
            )}

            {/* EMPTY STATE */}
            {getSubsQuery.isSuccess &&
              getProductQuery.isSuccess &&
              filteredSubs.length === 0 &&
              filteredProducts.length === 0 && (
                <div className="col-span-full rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
                  {t("no_results") || "لا توجد نتائج"}
                </div>
              )}
          </div>
        )}
      </div>
    </section>
  );
}
