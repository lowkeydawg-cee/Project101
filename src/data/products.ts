import { supabase } from '@/lib/supabase'

export interface Product {
  id: string
  slug: string
  catalogNo: string
  name: string
  category: string
  price: number
  description: string
  material: string
  finish: string
  /** Public image URL from Supabase Storage, or '' when no photo is uploaded yet. */
  image: string
  /** Ordered gallery URLs from the gallery column. Falls back to [image] when gallery is null. */
  gallery: string[]
  /** Public URL to a .glb file in Supabase Storage. Empty string when not set. */
  glbUrl: string
  /** Fields the customer fills in before ordering. Empty when the column is missing. */
  personalise: PersonaliseField[]
}

export interface PersonaliseField {
  key: string
  label: string
  max: number
  required: boolean
}

/** What the customer typed, keyed by PersonaliseField.key. */
export type Personalisation = Record<string, string>

// Tolerates a missing column, a JSON string, and malformed entries:
// anything without a usable key is dropped rather than breaking the page.
function parsePersonalise(raw: unknown): PersonaliseField[] {
  let value = raw
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value)
    } catch {
      return []
    }
  }
  if (!Array.isArray(value)) return []
  const fields: PersonaliseField[] = []
  for (const f of value) {
    if (!f || typeof f !== 'object') continue
    const key = typeof f.key === 'string' ? f.key.trim() : ''
    if (!key || fields.some((x) => x.key === key)) continue
    const max = Number(f.max)
    fields.push({
      key,
      label: typeof f.label === 'string' && f.label.trim() ? f.label.trim() : key,
      // Same default the server uses when max is absent.
      max: Number.isFinite(max) && max > 0 ? Math.floor(max) : 60,
      required: f.required === true || f.required === 'true',
    })
  }
  return fields
}

function parseGallery(raw: unknown, imageUrl: string): string[] {
  const urls = Array.isArray(raw)
    ? raw.filter((u): u is string => typeof u === 'string' && u.trim() !== '')
    : []
  if (urls.length > 0) return urls
  return imageUrl ? [imageUrl] : []
}

// Maps a raw Supabase row (snake_case) to the app's Product shape (camelCase)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): Product {
  return {
    id: row.id,
    slug: row.slug,
    catalogNo: row.catalog_no ?? '',
    name: row.name,
    category: row.category ?? '',
    price: row.price ?? 0,
    description: row.description ?? '',
    material: row.material ?? '',
    finish: row.finish ?? '',
    image: row.image_url ?? '',
    gallery: parseGallery(row.gallery, row.image_url ?? ''),
    glbUrl: row.glb_url ?? '',
    personalise: parsePersonalise(row.personalise),
  }
}

/**
 * True when the product's picture is a preview render, not a photo of a real
 * print. Preview renders live in public/products/preview. Upload a real photo
 * in the admin page and this turns false on its own, so the label disappears.
 */
export function isPreviewImage(image: string): boolean {
  return image.includes('/products/preview/')
}

/** True when the product has a real uploaded photo (not empty / placeholder). */
export function hasProductImage(product: Pick<Product, 'image'>): boolean {
  return Boolean(product.image) && product.image.startsWith('http')
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch products:', error.message)
    return []
  }

  return (data ?? []).map(mapRow)
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (error || !data) return null
  return mapRow(data)
}
