"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Sparkles, Loader2, Filter, Flame } from "lucide-react";
import { PRODUCTS as FALLBACK_PRODUCTS } from "@/lib/data/products";
import { ProductCard } from "@/components/product/ProductCard";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4001";

const CATEGORIES = [
  "All",
  "Cookware",
  "Storage",
  "Cutlery",
  "Bakeware",
  "Utensil",
  "Serveware",
  "Appliance",
];

const SORTS = [
  { label: "Most Popular", value: "popular" },
  { label: "Top Rated", value: "rating" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
];

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("popular");
  const [inductionOnly, setInductionOnly] = useState(false);
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch products from real backend database
  const fetchProducts = useCallback(async (isLoadMore = false) => {
    if (!isLoadMore) setLoading(true);

    try {
      const params = new URLSearchParams();
      params.append("page", isLoadMore ? (page + 1).toString() : "1");
      params.append("limit", "24");

      if (category !== "All") {
        params.append("category", category.toLowerCase());
      }
      if (search.trim()) {
        params.append("search", search.trim());
      }

      const res = await fetch(`${API_BASE}/api/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const incoming = data.products || [];
        
        let sorted = isLoadMore ? [...products, ...incoming] : incoming;

        // Apply client-side sorting
        if (sort === "price_asc") {
          sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
        } else if (sort === "price_desc") {
          sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
        } else if (sort === "rating") {
          sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        }

        // Apply induction filter
        if (inductionOnly) {
          sorted = sorted.filter((p) => p.induction_compatible === "Yes");
        }

        setProducts(sorted);
        setTotalCount(data.pagination?.total || sorted.length);
        setHasMore((data.pagination?.page || 1) < (data.pagination?.totalPages || 1));
        if (isLoadMore) setPage((prev) => prev + 1);
        else setPage(1);
      } else {
        throw new Error("Backend responded with error");
      }
    } catch (err) {
      console.warn("Failed to fetch from backend, using fallback data:", err);
      // Fallback if backend offline
      let local = FALLBACK_PRODUCTS;
      if (category !== "All") {
        local = local.filter((p) => p.category.toLowerCase() === category.toLowerCase());
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        local = local.filter((p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
      }
      setProducts(local);
      setTotalCount(local.length);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [category, search, sort, inductionOnly, page, products]);

  // Re-fetch on filter change with debounce on search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [category, search, sort, inductionOnly]);

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-ink leading-tight">
            All Utensils & Cookware
          </h1>
          <p className="text-ink-muted mt-1 text-[15px]">
            {loading ? (
              <span className="inline-flex items-center gap-1.5 text-accent">
                <Loader2 size={14} className="animate-spin" /> Loading Indian kitchen catalog...
              </span>
            ) : (
              <span>{totalCount.toLocaleString("en-IN")} authentic stainless steel products in catalog</span>
            )}
          </p>
        </div>

        {/* Induction ready toggle */}
        <button
          onClick={() => setInductionOnly(!inductionOnly)}
          className={`self-start md:self-auto px-4 py-2 rounded-xl text-[13px] font-semibold flex items-center gap-2 transition-all border ${
            inductionOnly
              ? "bg-amber-500/10 border-amber-500 text-amber-700 shadow-xs"
              : "bg-white border-ink/10 text-ink-muted hover:border-ink/20"
          }`}
        >
          <Flame size={15} className={inductionOnly ? "text-amber-500" : "text-ink-muted"} />
          Induction Compatible Only
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[260px] max-w-sm">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            placeholder="Search by kadai, tawa, brand (e.g. Prestige, Borosil)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-ink/10 bg-white text-ink placeholder:text-ink-muted/60 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all text-[14px]"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 overflow-x-auto py-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-[13px] font-semibold transition-all shrink-0 ${
                category === cat
                  ? "bg-brand text-white shadow-xs"
                  : "bg-white text-ink-muted border border-ink/10 hover:border-ink/20 hover:text-ink"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort Select */}
        <div className="ml-auto">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-11 px-4 pr-10 rounded-xl border border-ink/10 bg-white text-ink text-[13px] font-semibold focus:outline-none focus:border-brand cursor-pointer shadow-xs appearance-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b5b4e' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 12px center",
            }}
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-12">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-80 rounded-2xl bg-white border border-ink/5 p-4 animate-pulse flex flex-col justify-between">
              <div className="h-44 bg-ink/5 rounded-xl" />
              <div className="space-y-2 mt-4">
                <div className="h-3 bg-ink/5 rounded w-1/3" />
                <div className="h-4 bg-ink/5 rounded w-3/4" />
                <div className="h-4 bg-ink/5 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id || product.item_id} product={product} />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="mt-12 flex justify-center">
              <button
                onClick={() => fetchProducts(true)}
                className="px-8 py-3.5 rounded-xl bg-white border border-ink/15 hover:border-brand text-ink font-semibold text-[14px] hover:text-brand shadow-sm hover:shadow-md transition-all active:scale-95"
              >
                Load More Cookware ↓
              </button>
            </div>
          )}
        </>
      ) : (
        /* Empty State */
        <div className="py-24 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-ink/5 p-8 shadow-xs">
          <div className="text-[52px] mb-4">🍳</div>
          <h2 className="font-display font-bold text-[24px] text-ink mb-2">No matching products found</h2>
          <p className="text-ink-muted max-w-md mb-6">
            We couldn't find anything matching "{search || category}". Try clearing your filters or searching for terms like "Kadai", "Tawa", or "Storage".
          </p>
          <button 
            onClick={() => { setSearch(""); setCategory("All"); setInductionOnly(false); }}
            className="px-6 py-2.5 rounded-xl bg-brand text-white font-semibold text-sm hover:bg-brand-dark transition-all shadow-sm"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* AI Upsell Strip */}
      <div className="mt-16 w-full rounded-2xl bg-gradient-to-r from-accent/15 via-accent/5 to-transparent border border-accent/20 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-accent/20 text-accent text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles size={13} />
            AI Kitchen Advice
          </div>
          <h3 className="font-display font-bold text-xl sm:text-2xl text-ink mb-1">
            Overwhelmed by {totalCount > 0 ? `${totalCount}+` : "all the"} utensils?
          </h3>
          <p className="text-[14px] sm:text-[15px] text-ink-muted max-w-xl">
            Tell KitchenGenie your family size, budget, and cooking style — and get tailored recommendations in under 30 seconds.
          </p>
        </div>
        <Link
          href="/assistant"
          className="shrink-0 inline-flex items-center gap-2 px-6 py-3.5 bg-accent text-white font-bold text-[14px] rounded-xl hover:bg-accent-light transition-all shadow-md hover:scale-105 active:scale-95"
        >
          Ask KitchenGenie
          <Sparkles size={16} />
        </Link>
      </div>
    </div>
  );
}
