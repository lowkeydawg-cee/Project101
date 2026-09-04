"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Order, PaymentMethod, Product } from "@/lib/types";

const emptyForm = {
  name: "",
  category: "Lighting",
  price: 20000,
  description: "",
  status: "In Stock",
  inventory: 1,
  image: null as File | null,
};

export default function AdminPage() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const [products, setProducts] = useState<Product[]>([]);
  const [payments, setPayments] = useState<PaymentMethod[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [newPayment, setNewPayment] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<Record<string, { price: number; inventory: number; status: string }>>({});

  async function refresh() {
    const supabase = createClient();
    const [{ data: productRows }, { data: paymentRows }, { data: orderRows }] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("payment_methods").select("*").order("created_at", { ascending: true }),
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
    ]);
    setProducts((productRows as Product[]) ?? []);
    setPayments((paymentRows as PaymentMethod[]) ?? []);
    setOrders((orderRows as Order[]) ?? []);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login?next=/admin");
        return;
      }
      if (cancelled) return;
      setEmail(user.email ?? "");

      const { data: claimed, error: claimError } = await supabase.rpc("claim_first_admin");
      if (claimError) {
        setError(claimError.message);
      }

      const { data: adminRow } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      const admin = Boolean(claimed) || Boolean(adminRow);
      setIsAdmin(admin);
      if (admin) {
        await refresh();
      }
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  async function uploadImage(file: File) {
    const supabase = createClient();
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("product-images").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleAddProduct(e: FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    try {
      const supabase = createClient();
      let image_url: string | null = null;
      if (form.image) {
        image_url = await uploadImage(form.image);
      }
      const { error: insertError } = await supabase.from("products").insert({
        name: form.name,
        category: form.category,
        price: form.price,
        description: form.description,
        status: form.status,
        inventory: form.inventory,
        image_url,
      });
      if (insertError) throw insertError;
      setForm(emptyForm);
      setNotice("Product published to the live storefront.");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not publish product.");
    }
  }

  async function handleSaveProduct(product: Product) {
    const patch = editing[product.id];
    if (!patch) return;
    setError("");
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("products")
      .update({ price: patch.price, inventory: patch.inventory, status: patch.status })
      .eq("id", product.id);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setEditing((current) => {
      const next = { ...current };
      delete next[product.id];
      return next;
    });
    await refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product from the live catalog?")) return;
    const supabase = createClient();
    const { error: deleteError } = await supabase.from("products").delete().eq("id", id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    await refresh();
  }

  async function handleAddPayment(e: FormEvent) {
    e.preventDefault();
    if (!newPayment.trim()) return;
    const supabase = createClient();
    const { error: insertError } = await supabase.from("payment_methods").insert({ label: newPayment.trim() });
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setNewPayment("");
    await refresh();
  }

  async function handleRemovePayment(id: string) {
    const supabase = createClient();
    const { error: deleteError } = await supabase.from("payment_methods").delete().eq("id", id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    await refresh();
  }

  async function handleOrderStatus(id: string, status: string) {
    const supabase = createClient();
    const { error: updateError } = await supabase.from("orders").update({ status }).eq("id", id);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    await refresh();
  }

  if (!ready) return null;

  const panelBg = isDarkMode ? "bg-[#181818] border-white/10" : "bg-[#E8E3D8] border-black/10";

  return (
    <main
      className={`min-h-screen transition-colors duration-500 font-serif p-6 md:p-12 ${
        isDarkMode ? "bg-[#111111] text-[#F4F1EA]" : "bg-[#F4F1EA] text-[#1A1A1A]"
      }`}
    >
      <nav className="max-w-5xl mx-auto flex justify-between items-center mb-12 pb-6 border-b border-current border-opacity-10">
        <div>
          <span className="text-[10px] font-mono opacity-50 uppercase tracking-widest block">[ SECURE BACKEND ]</span>
          <h1 className="text-xl font-bold uppercase tracking-wider font-mono">The Safe House Admin</h1>
          <p className="text-[11px] font-mono opacity-50 mt-1">{email}</p>
        </div>
        <div className="flex gap-3 items-center font-sans text-xs">
          <a href="/" className="px-4 py-2 rounded-full border border-current hover:opacity-60 transition uppercase tracking-wider">
            ← View Live Storefront
          </a>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="px-3 py-1.5 rounded-full border border-current text-[10px] font-mono">
            {isDarkMode ? "Light" : "Dark"}
          </button>
          <button onClick={handleLogout} className="px-3 py-1.5 rounded-full border border-current text-[10px] font-mono">
            Sign out
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto space-y-6">
        {error && <p className="text-xs font-mono text-red-400">{error}</p>}
        {notice && <p className="text-xs font-mono text-purple-400">{notice}</p>}

        {!isAdmin ? (
          <div className={`p-8 rounded-2xl border ${panelBg} text-sm font-mono space-y-2`}>
            <p>You are signed in, but this account is not an admin.</p>
            <p className="opacity-70 text-xs">
              Promote it in Supabase SQL: insert into public.admin_users (user_id) select id from auth.users where email = &apos;{email}&apos;;
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 font-sans">
            <div className={`p-8 rounded-2xl border ${panelBg}`}>
              <h3 className="text-lg font-serif font-bold uppercase mb-4">Add Store Artifact</h3>
              <form onSubmit={handleAddProduct} className="space-y-4 text-xs">
                <div>
                  <label className="opacity-70 block mb-1">Product Name</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={`w-full rounded px-3 py-2 border ${isDarkMode ? "bg-black/30 border-white/20" : "bg-white border-black/10"}`}
                    placeholder="e.g. Geodesic Planter"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="opacity-70 block mb-1">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className={`w-full rounded px-3 py-2 border ${isDarkMode ? "bg-black/30 border-white/20" : "bg-white border-black/10"}`}
                    >
                      <option value="Lighting">Lighting</option>
                      <option value="Workspace">Workspace</option>
                      <option value="Decor">Decor</option>
                      <option value="Interior">Interior</option>
                    </select>
                  </div>
                  <div>
                    <label className="opacity-70 block mb-1">Price (RWF)</label>
                    <input
                      required
                      type="number"
                      min={0}
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                      className={`w-full rounded px-3 py-2 border font-mono ${isDarkMode ? "bg-black/30 border-white/20" : "bg-white border-black/10"}`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="opacity-70 block mb-1">Inventory</label>
                    <input
                      required
                      type="number"
                      min={0}
                      value={form.inventory}
                      onChange={(e) => setForm({ ...form, inventory: Number(e.target.value) })}
                      className={`w-full rounded px-3 py-2 border font-mono ${isDarkMode ? "bg-black/30 border-white/20" : "bg-white border-black/10"}`}
                    />
                  </div>
                  <div>
                    <label className="opacity-70 block mb-1">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className={`w-full rounded px-3 py-2 border ${isDarkMode ? "bg-black/30 border-white/20" : "bg-white border-black/10"}`}
                    >
                      <option>In Stock</option>
                      <option>Made to Order</option>
                      <option>Sold Out</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="opacity-70 block mb-1">Description</label>
                  <input
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className={`w-full rounded px-3 py-2 border ${isDarkMode ? "bg-black/30 border-white/20" : "bg-white border-black/10"}`}
                    placeholder="Fabricated on A1..."
                  />
                </div>
                <div>
                  <label className="opacity-70 block mb-1">Upload Product Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setForm({ ...form, image: e.target.files?.[0] ?? null })}
                    className={`w-full rounded px-3 py-2 border text-[11px] ${isDarkMode ? "bg-black/30 border-white/20" : "bg-white border-black/10"}`}
                  />
                </div>
                <button
                  type="submit"
                  className={`w-full py-3 rounded font-semibold uppercase tracking-wider transition ${
                    isDarkMode ? "bg-white text-black hover:bg-neutral-200" : "bg-black text-white"
                  }`}
                >
                  Publish to Storefront
                </button>
              </form>
            </div>

            <div className="space-y-8">
              <div className={`p-6 rounded-2xl border ${panelBg}`}>
                <h3 className="text-sm font-mono uppercase tracking-widest opacity-70 mb-3">Accepted Payment Methods</h3>
                <form onSubmit={handleAddPayment} className="flex gap-2 mb-4">
                  <input
                    value={newPayment}
                    onChange={(e) => setNewPayment(e.target.value)}
                    placeholder="e.g. PayPal / Direct Cash"
                    className={`flex-grow rounded px-3 py-2 text-xs border ${isDarkMode ? "bg-black/30 border-white/20" : "bg-white border-black/10"}`}
                  />
                  <button type="submit" className={`px-4 py-2 rounded text-xs uppercase font-semibold ${isDarkMode ? "bg-white text-black" : "bg-black text-white"}`}>
                    Add
                  </button>
                </form>
                <div className="space-y-2">
                  {payments.map((m) => (
                    <div
                      key={m.id}
                      className={`flex justify-between items-center p-2 rounded text-xs font-mono border ${
                        isDarkMode ? "bg-black/20 border-white/10" : "bg-white/50 border-black/10"
                      }`}
                    >
                      <span>{m.label}</span>
                      <button onClick={() => handleRemovePayment(m.id)} className="text-red-500 hover:underline">
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`p-6 rounded-2xl border ${panelBg}`}>
                <h3 className="text-sm font-mono uppercase tracking-widest opacity-70 mb-3">
                  Managed Catalog Items ({products.length})
                </h3>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {products.map((p) => {
                    const draft = editing[p.id] ?? { price: p.price, inventory: p.inventory, status: p.status };
                    return (
                      <div
                        key={p.id}
                        className={`p-3 rounded border text-xs font-mono space-y-2 ${
                          isDarkMode ? "bg-black/20 border-white/10" : "bg-white/50 border-black/10"
                        }`}
                      >
                        <div className="flex justify-between gap-3">
                          <div>
                            <p className="font-bold">{p.name}</p>
                            <p className="opacity-60">{p.category}</p>
                          </div>
                          <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:underline">
                            Delete
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="number"
                            min={0}
                            value={draft.price}
                            onChange={(e) =>
                              setEditing({ ...editing, [p.id]: { ...draft, price: Number(e.target.value) } })
                            }
                            className={`rounded px-2 py-1 border ${isDarkMode ? "bg-black/30 border-white/20" : "bg-white border-black/10"}`}
                          />
                          <input
                            type="number"
                            min={0}
                            value={draft.inventory}
                            onChange={(e) =>
                              setEditing({ ...editing, [p.id]: { ...draft, inventory: Number(e.target.value) } })
                            }
                            className={`rounded px-2 py-1 border ${isDarkMode ? "bg-black/30 border-white/20" : "bg-white border-black/10"}`}
                          />
                          <select
                            value={draft.status}
                            onChange={(e) => setEditing({ ...editing, [p.id]: { ...draft, status: e.target.value } })}
                            className={`rounded px-2 py-1 border ${isDarkMode ? "bg-black/30 border-white/20" : "bg-white border-black/10"}`}
                          >
                            <option>In Stock</option>
                            <option>Made to Order</option>
                            <option>Sold Out</option>
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSaveProduct(p)}
                          className="text-[10px] uppercase tracking-wider underline"
                        >
                          Save price / inventory
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {isAdmin && (
          <div className={`p-6 rounded-2xl border font-sans ${panelBg}`}>
            <h3 className="text-sm font-mono uppercase tracking-widest opacity-70 mb-3">Incoming Orders ({orders.length})</h3>
            <div className="space-y-3">
              {orders.length === 0 && <p className="text-xs font-mono opacity-50">No storefront orders yet.</p>}
              {orders.map((order) => (
                <div
                  key={order.id}
                  className={`p-3 rounded border text-xs font-mono space-y-1 ${
                    isDarkMode ? "bg-black/20 border-white/10" : "bg-white/50 border-black/10"
                  }`}
                >
                  <div className="flex justify-between gap-3">
                    <p className="font-bold">{order.product_name}</p>
                    <select
                      value={order.status}
                      onChange={(e) => handleOrderStatus(order.id, e.target.value)}
                      className={`rounded px-2 py-1 border ${isDarkMode ? "bg-black/30 border-white/20" : "bg-white border-black/10"}`}
                    >
                      <option value="pending">pending</option>
                      <option value="confirmed">confirmed</option>
                      <option value="fulfilled">fulfilled</option>
                    </select>
                  </div>
                  <p>
                    {order.customer_name} · {order.phone}
                  </p>
                  <p className="opacity-70">{order.address}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
