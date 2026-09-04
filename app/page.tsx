"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { LabTools } from "@/components/lab-tools";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/client";
import type { Category, PaymentMethod, Product } from "@/lib/types";

export default function StorefrontPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [payments, setPayments] = useState<PaymentMethod[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderForm, setOrderForm] = useState({ name: "", phone: "", address: "", notes: "" });
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderBusy, setOrderBusy] = useState(false);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");

  useEffect(() => {
    let cancelled = false;
    if (!hasSupabaseConfig()) {
      setLoadError("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      setIsLoaded(true);
      return;
    }

    const supabase = createClient();
    const channel = supabase
      .channel("storefront-products")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, async () => {
        const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
        if (!cancelled) setProducts((data as Product[]) ?? []);
      })
      .subscribe();

    (async () => {
      try {
        const [{ data: productRows, error: productError }, { data: categoryRows }, { data: paymentRows }] =
          await Promise.all([
            supabase.from("products").select("*").order("created_at", { ascending: false }),
            supabase.from("categories").select("*").order("name"),
            supabase.from("payment_methods").select("*").order("created_at"),
          ]);
        if (productError) throw productError;
        if (cancelled) return;
        setProducts((productRows as Product[]) ?? []);
        setCategories((categoryRows as Category[]) ?? []);
        setPayments((paymentRows as PaymentMethod[]) ?? []);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : "Could not load catalog.");
        }
      } finally {
        if (!cancelled) setIsLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  const visibleProducts = useMemo(() => {
    if (activeCategory === "All") return products;
    return products.filter((p) => p.category === activeCategory);
  }, [products, activeCategory]);

  const categoryOptions = useMemo(() => {
    const names = new Set<string>(["All"]);
    categories.forEach((c) => names.add(c.name));
    products.forEach((p) => names.add(p.category));
    return Array.from(names);
  }, [categories, products]);

  async function handleOrderSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selectedProduct) return;
    setOrderBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("orders").insert({
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        customer_name: orderForm.name,
        phone: orderForm.phone,
        address: orderForm.address,
        notes: orderForm.notes,
      });
      if (error) throw error;
      setOrderPlaced(true);
      setOrderForm({ name: "", phone: "", address: "", notes: "" });
    } catch (err) {
      setAiResponse(err instanceof Error ? err.message : "Order could not be submitted.");
    } finally {
      setOrderBusy(false);
    }
  }

  function handleAiAssistant(e: FormEvent) {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    const q = aiQuery.toLowerCase();
    const match = products.find(
      (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
    if (match) {
      setAiResponse(
        `Found "${match.name}" (${Number(match.price).toLocaleString()} RWF, ${match.inventory} in inventory). Available for local pickup/delivery in Kigali.`
      );
      setActiveCategory(match.category);
      document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (q.includes("filament") || q.includes("cost") || q.includes("power") || q.includes("calculator")) {
      setAiResponse("Open Calculators & Ideas below for filament cost and machine-hour estimates.");
      document.getElementById("calculators")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    setAiResponse(`No direct match for "${aiQuery}". Filter the catalog or use the calculators.`);
  }

  if (!isLoaded) return null;

  return (
    <main className="min-h-screen bg-[#0d0d0d] text-[#F4F1EA] font-sans selection:bg-purple-600 selection:text-white">
      <nav className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center border-b border-white/10 text-xs font-mono">
        <div className="flex items-center gap-3">
          <span className="font-bold tracking-widest uppercase">The Safe House</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#catalog" className="opacity-70 hover:opacity-100 transition">
            Storefront
          </a>
          <a href="#marketplace" className="opacity-70 hover:opacity-100 transition">
            Networks
          </a>
          <a href="#calculators" className="opacity-70 hover:opacity-100 transition">
            Calculators & Ideas
          </a>
          <a href="#ai-assistant" className="opacity-70 hover:opacity-100 transition">
            AI Assistant
          </a>
          <a href="/admin" className="px-3 py-1.5 rounded-full border border-white/20 hover:bg-white hover:text-black transition uppercase">
            Admin →
          </a>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <span className="inline-block px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 text-[10px] font-mono tracking-wider uppercase">
            Kigali Precision 3D Fabrication
          </span>
          <h1 className="text-3xl md:text-5xl font-serif font-bold uppercase tracking-tight leading-none">
            Built for function. <span className="text-purple-400">Engineered locally.</span>
          </h1>
          <p className="text-xs md:text-sm text-neutral-400 font-light max-w-md leading-relaxed">
            Curated hardware artifacts and custom geometries manufactured dynamically on our Bambu setup.
          </p>
          <div className="flex gap-3 pt-2">
            <a href="#catalog" className="px-6 py-3 bg-purple-600 text-white font-bold text-[11px] uppercase tracking-widest rounded-full hover:bg-purple-500 transition">
              View Storefront
            </a>
            <button
              onClick={() => setShowWalkthrough(true)}
              className="px-6 py-3 border border-white/20 font-bold text-[11px] uppercase tracking-widest rounded-full hover:bg-white/10 transition"
            >
              Guide Walkthrough
            </button>
          </div>
        </div>

        <div className="relative h-60 md:h-72 rounded-2xl overflow-hidden border border-white/10 bg-black shadow-xl flex items-center justify-center">
          <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-50">
            <source src="https://assets.mixkit.co/videos/preview/mixkit-3d-printer-printing-an-object-41315-large.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
          <div className="relative z-10 p-4 text-center">
            <span className="text-[9px] font-mono text-purple-400 uppercase tracking-widest block">[ LIVE STREAM ACTIVE ]</span>
            <p className="text-xs font-mono font-bold uppercase mt-1">Bambu Lab A1 Precision</p>
          </div>
        </div>
      </section>

      <section id="catalog" className="max-w-7xl mx-auto px-6 py-12 border-t border-white/10">
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-8">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 block mb-1">[ STOREFRONT ]</span>
            <h2 className="text-2xl font-serif font-bold uppercase">Available Artifacts</h2>
          </div>
          <span className="text-xs font-mono opacity-50">{visibleProducts.length} Items</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {categoryOptions.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setActiveCategory(name)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-mono uppercase border transition ${
                activeCategory === name ? "bg-purple-600 border-purple-500 text-white" : "border-white/20 opacity-70 hover:opacity-100"
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        {loadError && <p className="text-xs font-mono text-red-400 mb-6">{loadError}</p>}

        {visibleProducts.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl bg-black/20 text-xs font-mono opacity-60">
            No items published yet. Visit <a href="/admin" className="underline text-purple-400">/admin</a> to add products.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {visibleProducts.map((product) => (
              <div
                key={product.id}
                className="bg-[#141414] border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-purple-500/50 transition"
              >
                <div>
                  {product.image_url ? (
                    <div className="h-48 w-full overflow-hidden bg-black">
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    </div>
                  ) : (
                    <div className="h-48 w-full bg-neutral-900 flex items-center justify-center font-mono text-[10px] opacity-40">
                      [ No Image ]
                    </div>
                  )}
                  <div className="p-4">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-purple-400 block mb-1">
                      {product.category} · {product.status}
                    </span>
                    <h3 className="text-base font-serif font-bold uppercase mb-1">{product.name}</h3>
                    <p className="text-[11px] text-neutral-400 line-clamp-2">{product.description}</p>
                  </div>
                </div>
                <div className="p-4 pt-0 flex items-center justify-between border-t border-white/5 mt-2">
                  <span className="font-mono font-bold text-xs">{Number(product.price).toLocaleString()} RWF</span>
                  <button
                    onClick={() => {
                      setSelectedProduct(product);
                      setOrderPlaced(false);
                    }}
                    disabled={product.status === "Sold Out" || product.inventory <= 0}
                    className="px-4 py-2 bg-white text-black text-[10px] font-bold uppercase tracking-wider rounded-full hover:bg-purple-200 transition disabled:opacity-40"
                  >
                    Acquire
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section id="marketplace" className="max-w-7xl mx-auto px-6 py-12 border-t border-white/10">
        <div className="mb-6">
          <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 block mb-1">[ NETWORKS ]</span>
          <h2 className="text-2xl font-serif font-bold uppercase">Marketplace & Social Media</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <a href="https://github.com" target="_blank" rel="noreferrer" className="p-5 rounded-2xl bg-neutral-900 border border-white/10 hover:border-purple-500 transition space-y-2">
            <span className="text-purple-400">📂</span>
            <h4 className="text-white font-bold uppercase">GitHub Repositories</h4>
            <p className="opacity-60 text-[10px]">Source code, software engineering projects, and scripts.</p>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="p-5 rounded-2xl bg-neutral-900 border border-white/10 hover:border-purple-500 transition space-y-2">
            <span className="text-purple-400">📸</span>
            <h4 className="text-white font-bold uppercase">Instagram Showcase</h4>
            <p className="opacity-60 text-[10px]">Visual logs and captured prints from the workshop.</p>
          </a>
          <div className="p-5 rounded-2xl bg-neutral-900 border border-white/10 space-y-2">
            <span className="text-purple-400">📍</span>
            <h4 className="text-white font-bold uppercase">Kigali Operations</h4>
            <p className="opacity-60 text-[10px]">Direct local fulfillment across Rwanda.</p>
          </div>
        </div>
      </section>

      <section id="calculators" className="max-w-7xl mx-auto px-6 py-12 border-t border-white/10">
        <div className="mb-6">
          <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 block mb-1">[ ARCHIVES & LAB ]</span>
          <h2 className="text-2xl font-serif font-bold uppercase">Calculators & Developed Ideas</h2>
        </div>
        <LabTools />
      </section>

      <section id="ai-assistant" className="max-w-4xl mx-auto px-6 py-12 border-t border-white/10">
        <div className="p-6 rounded-2xl bg-neutral-900 border border-purple-500/30 space-y-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 block">[ AI ASSISTANT ]</span>
            <h3 className="text-lg font-serif font-bold uppercase">Store Guide Assistant</h3>
          </div>
          <form onSubmit={handleAiAssistant} className="flex gap-2">
            <input
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="Ask the AI guide about products or setup..."
              className="flex-1 rounded-xl px-4 py-3 bg-black/60 border border-white/20 text-white text-xs font-mono focus:outline-none focus:border-purple-500"
            />
            <button type="submit" className="px-5 py-3 bg-purple-600 text-white text-xs font-bold font-mono uppercase rounded-xl hover:bg-purple-500 transition">
              Ask
            </button>
          </form>
          {aiResponse && (
            <div className="p-3 rounded-lg bg-black/40 border border-purple-500/20 text-xs font-mono text-purple-200">🤖 {aiResponse}</div>
          )}
        </div>
      </section>

      <footer className="bg-black border-t border-white/10 mt-12 py-8 text-neutral-400 font-mono text-[11px]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center opacity-60">
          <p>© 2026 The Safe House. Kigali, Rwanda.</p>
          <div className="flex gap-6 mt-3 md:mt-0">
            <a href="/admin" className="hover:underline">
              Admin Portal
            </a>
            <a href="#catalog" className="hover:underline">
              Back to Top
            </a>
          </div>
        </div>
      </footer>

      {showWalkthrough && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 font-sans">
          <div className="bg-[#181818] border border-purple-500/40 rounded-3xl max-w-md w-full p-6 relative shadow-2xl space-y-4">
            <button onClick={() => setShowWalkthrough(false)} className="absolute top-5 right-5 text-xs font-mono opacity-50 hover:opacity-100">
              [CLOSE]
            </button>
            <h3 className="text-lg font-serif font-bold uppercase">Walkthrough Guide</h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-mono">
              1. Storefront: browse and filter live catalog items.
              <br />
              2. Networks: GitHub and socials.
              <br />
              3. Calculators: filament, power, and reminder tools.
              <br />
              4. AI Assistant: search products from the query box.
            </p>
            <button onClick={() => setShowWalkthrough(false)} className="w-full py-3 bg-purple-600 text-white font-bold text-xs uppercase tracking-wider rounded-full">
              Got it
            </button>
          </div>
        </div>
      )}

      {selectedProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#181818] border border-white/20 rounded-3xl max-w-md w-full p-6 relative shadow-2xl">
            <button
              onClick={() => {
                setSelectedProduct(null);
                setOrderPlaced(false);
              }}
              className="absolute top-5 right-5 text-xs font-mono opacity-50"
            >
              [CLOSE]
            </button>

            {orderPlaced ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto font-bold text-xs">✓</div>
                <h3 className="text-lg font-serif font-bold uppercase">Order Registered</h3>
                <p className="text-xs text-neutral-400">Request for {selectedProduct.name} received. We will coordinate fulfillment in Kigali.</p>
                <button
                  onClick={() => {
                    setSelectedProduct(null);
                    setOrderPlaced(false);
                  }}
                  className="w-full py-2.5 bg-purple-600 text-white text-xs font-bold uppercase rounded-full"
                >
                  Done
                </button>
              </div>
            ) : (
              <div>
                <h3 className="text-base font-serif font-bold uppercase mb-1">Acquire Artifact</h3>
                <p className="text-xs font-mono text-neutral-400 mb-4">
                  {selectedProduct.name} — {Number(selectedProduct.price).toLocaleString()} RWF
                </p>
                <form onSubmit={handleOrderSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="opacity-70 block mb-1 font-mono">Your Name</label>
                    <input
                      required
                      value={orderForm.name}
                      onChange={(e) => setOrderForm({ ...orderForm, name: e.target.value })}
                      className="w-full rounded-xl px-3 py-2.5 bg-black/40 border border-white/20 text-white"
                      placeholder="Full Name"
                    />
                  </div>
                  <div>
                    <label className="opacity-70 block mb-1 font-mono">Phone Number</label>
                    <input
                      required
                      value={orderForm.phone}
                      onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
                      className="w-full rounded-xl px-3 py-2.5 bg-black/40 border border-white/20 text-white"
                      placeholder="078..."
                    />
                  </div>
                  <div>
                    <label className="opacity-70 block mb-1 font-mono">Delivery Address</label>
                    <input
                      required
                      value={orderForm.address}
                      onChange={(e) => setOrderForm({ ...orderForm, address: e.target.value })}
                      className="w-full rounded-xl px-3 py-2.5 bg-black/40 border border-white/20 text-white"
                      placeholder="Kigali, Rwanda"
                    />
                  </div>
                  <div>
                    <label className="opacity-70 block mb-1 font-mono">Notes</label>
                    <input
                      value={orderForm.notes}
                      onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                      className="w-full rounded-xl px-3 py-2.5 bg-black/40 border border-white/20 text-white"
                      placeholder="Color, size, pickup time"
                    />
                  </div>
                  <div>
                    <label className="opacity-70 block mb-1 font-mono">Accepted Payments</label>
                    <div className="p-3 rounded-xl bg-black/30 border border-white/10 space-y-1">
                      {payments.map((p) => (
                        <p key={p.id} className="text-[11px] font-mono text-neutral-300">
                          • {p.label}
                        </p>
                      ))}
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={orderBusy}
                    className="w-full py-3 bg-purple-600 text-white font-bold uppercase tracking-wider rounded-full transition hover:bg-purple-500 mt-2 disabled:opacity-50"
                  >
                    {orderBusy ? "Submitting…" : "Submit Order Request"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
