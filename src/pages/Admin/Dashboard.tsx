import { useEffect, useState } from 'react'
import { Link } from 'wouter'
import { ArrowUpRight, Package, RefreshCw, ShoppingBag } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getProducts, type Product } from '@/data/products'

type Order = {
  id: string
  order_number: string
  customer_name: string
  total: number
  status: string
  created_at: string
}

function formatRWF(value: number) {
  return `${value.toLocaleString('en-US')} RWF`
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    received: 'Received',
    production: 'Production',
    quality: 'Quality',
    delivery: 'Delivery',
    delivered: 'Delivered',
  }

  return labels[status] ?? status
}

export function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Product | null>(null)
  const [showForm, setShowForm] = useState(false)

  async function refresh() {
    setLoading(true)

    const [productData, orderResult] = await Promise.all([
      getProducts(),
      supabase
        .from('orders')
        .select('id, order_number, customer_name, total, status, created_at')
        .order('created_at', { ascending: false }),
    ])

    setProducts(productData)

    if (!orderResult.error) {
      setOrders((orderResult.data ?? []) as Order[])
    }

    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  async function handleDelete(id: string) {
    if (!confirm('Delete this product?')) return

    await supabase.from('products').delete().eq('id', id)
    refresh()
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = '/admin/login'
  }

  const productionOrders = orders.filter(
    (order) => order.status === 'production',
  ).length

  const pendingOrders = orders.filter(
    (order) => order.status === 'received',
  ).length

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      {/* HEADER */}
      <header className="border-y border-hairline">
        <div className="flex flex-col gap-6 p-5 sm:p-7 lg:flex-row lg:items-end lg:justify-between lg:p-8">
          <div>
            <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-ink-dim">
              Safehouse / Control
            </p>

            <h1 className="mt-4 font-mono text-[clamp(2.8rem,7vw,6rem)] uppercase leading-[0.85] tracking-[-0.07em] text-ink">
              Operations
            </h1>

            <p className="mt-5 max-w-md font-mono text-[9px] uppercase leading-relaxed tracking-[0.1em] text-ink-dim">
              Storefront, orders and production — managed from one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-3 border border-ink bg-ink px-4 py-3 font-mono text-[9px] uppercase tracking-[0.14em] text-panel transition-opacity hover:opacity-80"
            >
              Orders
              <ArrowUpRight size={13} strokeWidth={1.5} />
            </Link>

            <button
              onClick={refresh}
              className="inline-flex items-center gap-3 border border-hairline px-4 py-3 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-dim transition-colors hover:text-ink"
            >
              <RefreshCw size={13} strokeWidth={1.5} />
              Refresh
            </button>

            <button
              onClick={handleSignOut}
              className="border border-hairline px-4 py-3 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-dim transition-colors hover:text-ink"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* OVERVIEW */}
      <section className="grid border-b border-hairline sm:grid-cols-2 lg:grid-cols-4">
        <div className="border-b border-hairline p-5 sm:border-r sm:p-6 lg:border-b-0">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-ink-dim">
              Products
            </p>
            <Package size={14} strokeWidth={1.5} className="text-ink-dim" />
          </div>

          <p className="mt-6 font-mono text-4xl tracking-[-0.06em] text-ink">
            {loading ? '—' : String(products.length).padStart(2, '0')}
          </p>

          <p className="mt-2 font-mono text-[8px] uppercase tracking-[0.14em] text-ink-dim">
            Storefront objects
          </p>
        </div>

        <div className="border-b border-hairline p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-ink-dim">
              Orders
            </p>
            <ShoppingBag size={14} strokeWidth={1.5} className="text-ink-dim" />
          </div>

          <p className="mt-6 font-mono text-4xl tracking-[-0.06em] text-ink">
            {loading ? '—' : String(orders.length).padStart(2, '0')}
          </p>

          <p className="mt-2 font-mono text-[8px] uppercase tracking-[0.14em] text-ink-dim">
            Total orders
          </p>
        </div>

        <div className="border-b border-hairline p-5 sm:border-r sm:p-6 lg:border-b-0">
          <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-ink-dim">
            Production
          </p>

          <p className="mt-6 font-mono text-4xl tracking-[-0.06em] text-ink">
            {loading ? '—' : String(productionOrders).padStart(2, '0')}
          </p>

          <p className="mt-2 font-mono text-[8px] uppercase tracking-[0.14em] text-ink-dim">
            Currently printing
          </p>
        </div>

        <div className="p-5 sm:p-6">
          <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-ink-dim">
            Pending
          </p>

          <p className="mt-6 font-mono text-4xl tracking-[-0.06em] text-ink">
            {loading ? '—' : String(pendingOrders).padStart(2, '0')}
          </p>

          <p className="mt-2 font-mono text-[8px] uppercase tracking-[0.14em] text-ink-dim">
            Awaiting production
          </p>
        </div>
      </section>

      {/* RECENT ORDERS */}
      <section className="mt-10">
        <div className="flex items-end justify-between border-b border-hairline pb-4">
          <div>
            <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-ink-dim">
              Operations / 001
            </p>

            <h2 className="mt-2 font-mono text-xl uppercase tracking-[-0.04em] text-ink">
              Recent orders
            </h2>
          </div>

          <Link
            href="/admin/orders"
            className="font-mono text-[8px] uppercase tracking-[0.14em] text-ink-dim underline underline-offset-4 transition-colors hover:text-ink"
          >
            View all →
          </Link>
        </div>

        <div className="border-b border-hairline">
          {loading ? (
            <div className="p-8">
              <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-dim">
                Loading orders...
              </p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8">
              <p className="font-mono text-sm uppercase text-ink">
                No orders yet.
              </p>

              <p className="mt-2 font-mono text-[8px] uppercase tracking-[0.12em] text-ink-dim">
                Orders from the storefront will appear here.
              </p>
            </div>
          ) : (
            orders.slice(0, 5).map((order) => (
              <Link
                key={order.id}
                href="/admin/orders"
                className="grid gap-4 border-b border-hairline p-5 transition-colors last:border-b-0 hover:bg-panel sm:grid-cols-[1.4fr_1fr_1fr_auto] sm:items-center sm:p-6"
              >
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink">
                    {order.order_number}
                  </p>

                  <p className="mt-2 font-mono text-[8px] uppercase text-ink-dim">
                    {order.customer_name}
                  </p>
                </div>

                <div>
                  <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-ink-dim">
                    Status
                  </p>

                  <p className="mt-2 font-mono text-[9px] uppercase text-ink">
                    {statusLabel(order.status)}
                  </p>
                </div>

                <div>
                  <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-ink-dim">
                    Total
                  </p>

                  <p className="mt-2 font-mono text-[9px] text-ink">
                    {formatRWF(order.total)}
                  </p>
                </div>

                <ArrowUpRight
                  size={14}
                  strokeWidth={1.5}
                  className="text-ink-dim"
                />
              </Link>
            ))
          )}
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="mt-10">
        <div className="flex flex-col gap-4 border-b border-hairline pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-ink-dim">
              Storefront / 001
            </p>

            <h2 className="mt-2 font-mono text-xl uppercase tracking-[-0.04em] text-ink">
              Objects
            </h2>
          </div>

          <button
            onClick={() => {
              setEditing(null)
              setShowForm(true)
            }}
            className="inline-flex items-center justify-center gap-3 border border-ink bg-ink px-4 py-3 font-mono text-[9px] uppercase tracking-[0.14em] text-panel transition-opacity hover:opacity-80"
          >
            + Add product
          </button>
        </div>

        {showForm && (
          <ProductForm
            product={editing}
            onDone={() => {
              setShowForm(false)
              refresh()
            }}
            onCancel={() => setShowForm(false)}
          />
        )}

        <div className="border-b border-hairline">
          {loading ? (
            <div className="p-8">
              <p className="font-mono text-[9px] uppercase text-ink-dim">
                Loading products...
              </p>
            </div>
          ) : products.length === 0 ? (
            <div className="p-8">
              <p className="font-mono text-sm uppercase text-ink">
                No products yet.
              </p>
            </div>
          ) : (
            products.map((product, index) => (
              <div
                key={product.id}
                className="grid gap-5 border-b border-hairline p-5 last:border-b-0 sm:grid-cols-[64px_1fr_auto] sm:items-center sm:p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center border border-hairline bg-panel font-mono text-[8px] text-ink-dim">
                  {String(index + 1).padStart(2, '0')}
                </div>

                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.04em] text-ink">
                    {product.name}
                  </p>

                  <p className="mt-2 font-mono text-[8px] uppercase tracking-[0.12em] text-ink-dim">
                    {product.category} / {formatRWF(product.price)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditing(product)
                      setShowForm(true)
                    }}
                    className="border border-hairline px-3 py-2 font-mono text-[8px] uppercase tracking-[0.12em] text-ink-dim transition-colors hover:text-ink"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(product.id)}
                    className="border border-hairline px-3 py-2 font-mono text-[8px] uppercase tracking-[0.12em] text-red-500 transition-colors hover:bg-red-500/5"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  )
}

function ProductForm({
  product,
  onDone,
  onCancel,
}: {
  product: Product | null
  onDone: () => void
  onCancel: () => void
}) {
  const [form, setForm] = useState({
    slug: product?.slug ?? '',
    catalogNo: product?.catalogNo ?? '',
    name: product?.name ?? '',
    category: product?.category ?? '',
    price: product?.price ?? 0,
    description: product?.description ?? '',
    material: product?.material ?? '',
    finish: product?.finish ?? '',
  })

  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function update(key: keyof typeof form, value: string | number) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    setSaving(true)
    setError('')

    let image_url =
      product?.imageUrl ??
      product?.image ??
      null

    if (file) {
      const fileName = `${Date.now()}-${file.name}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file)

      if (uploadError) {
        setError(`Image upload failed: ${uploadError.message}`)
        setSaving(false)
        return
      }

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName)

      image_url = urlData.publicUrl
    }

    const row = {
      slug: form.slug,
      catalog_no: form.catalogNo,
      name: form.name,
      category: form.category,
      price: Number(form.price),
      description: form.description,
      material: form.material,
      finish: form.finish,
      image_url,
    }

    const { error: dbError } = product
      ? await supabase
          .from('products')
          .update(row)
          .eq('id', product.id)
      : await supabase
          .from('products')
          .insert(row)

    setSaving(false)

    if (dbError) {
      setError(dbError.message)
      return
    }

    onDone()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="my-6 border-y border-hairline bg-panel p-5 sm:p-7"
    >
      <div className="mb-6 flex items-end justify-between border-b border-hairline pb-4">
        <div>
          <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-ink-dim">
            Storefront / Product
          </p>

          <h3 className="mt-2 font-mono text-lg uppercase tracking-[-0.03em] text-ink">
            {product ? 'Edit object' : 'New object'}
          </h3>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <input
          placeholder="Slug"
          value={form.slug}
          onChange={(e) => update('slug', e.target.value)}
          required
          className="border border-hairline bg-transparent px-3 py-3 font-mono text-[10px] text-ink outline-none"
        />

        <input
          placeholder="Catalog No. / ART.014"
          value={form.catalogNo}
          onChange={(e) => update('catalogNo', e.target.value)}
          required
          className="border border-hairline bg-transparent px-3 py-3 font-mono text-[10px] text-ink outline-none"
        />

        <input
          placeholder="Product name"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          required
          className="border border-hairline bg-transparent px-3 py-3 font-mono text-[10px] text-ink outline-none"
        />

        <input
          placeholder="Category / Decor"
          value={form.category}
          onChange={(e) => update('category', e.target.value)}
          required
          className="border border-hairline bg-transparent px-3 py-3 font-mono text-[10px] text-ink outline-none"
        />

        <input
          type="number"
          placeholder="Price / RWF"
          value={form.price}
          onChange={(e) => update('price', e.target.value)}
          required
          className="border border-hairline bg-transparent px-3 py-3 font-mono text-[10px] text-ink outline-none"
        />

        <input
          placeholder="Material"
          value={form.material}
          onChange={(e) => update('material', e.target.value)}
          required
          className="border border-hairline bg-transparent px-3 py-3 font-mono text-[10px] text-ink outline-none"
        />

        <input
          placeholder="Finish"
          value={form.finish}
          onChange={(e) => update('finish', e.target.value)}
          required
          className="border border-hairline bg-transparent px-3 py-3 font-mono text-[10px] text-ink outline-none"
        />

        <label className="flex cursor-pointer items-center border border-dashed border-hairline px-3 py-3 font-mono text-[9px] uppercase tracking-[0.1em] text-ink-dim hover:text-ink">
          <span>{file ? file.name : 'Upload product image'}</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setFile(e.target.files?.[0] ?? null)
            }
            className="hidden"
          />
        </label>

        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          required
          rows={4}
          className="border border-hairline bg-transparent px-3 py-3 font-mono text-[10px] leading-relaxed text-ink outline-none sm:col-span-2"
        />
      </div>

      {error && (
        <div className="mt-5 border border-red-500/30 px-4 py-3">
          <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-red-500">
            {error}
          </p>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2 border-t border-hairline pt-5">
        <button
          type="submit"
          disabled={saving}
          className="border border-ink bg-ink px-5 py-3 font-mono text-[9px] uppercase tracking-[0.14em] text-panel transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          {saving ? 'Saving...' : product ? 'Save changes' : 'Create object'}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="border border-hairline px-5 py-3 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-dim transition-colors hover:text-ink"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export default AdminDashboard