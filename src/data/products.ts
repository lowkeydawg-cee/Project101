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
  /** Parts the customer can recolour. Empty when the product has no colour choices. */
  colours: ColourRole[]
}

/** The filament on the shelf. Only these colours can ever be chosen. */
export const FILAMENT: Record<string, { label: string; hex: string }> = {
  black: { label: 'Black', hex: '#1C1C1C' },
  white: { label: 'White', hex: '#F2F0EB' },
  red: { label: 'Red', hex: '#B3262E' },
  blue: { label: 'Blue', hex: '#24489A' },
}

export interface ColourRole {
  /** Stable id, saved on the order as colour_<role>. */
  role: string
  label: string
  /** Material names in the 3D model that this choice recolours. */
  materials: string[]
  default: string
  options: string[]
  /** Another role this one must not match (white lines on a white floor would vanish). */
  avoid: string | null
}

/** Personalisation key that stores a colour choice. */
export const colourKey = (role: string) => `colour_${role}`

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

// Same tolerance as parsePersonalise: bad entries are dropped, unknown colours ignored.
function parseColours(raw: unknown): ColourRole[] {
  let value = raw
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value)
    } catch {
      return []
    }
  }
  if (!Array.isArray(value)) return []
  const roles: ColourRole[] = []
  for (const r of value) {
    if (!r || typeof r !== 'object' || typeof r.role !== 'string') continue
    const options = Array.isArray(r.options) ? r.options.filter((c: unknown) => typeof c === 'string' && c in FILAMENT) : []
    if (options.length === 0) continue
    const def = typeof r.default === 'string' && options.includes(r.default) ? r.default : options[0]
    roles.push({
      role: r.role,
      label: typeof r.label === 'string' ? r.label : r.role,
      materials: Array.isArray(r.materials) ? r.materials.filter((m: unknown) => typeof m === 'string') : [],
      default: def,
      options,
      avoid: typeof r.avoid === 'string' ? r.avoid : null,
    })
  }
  return roles
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
    colours: parseColours(row.colours),
  }
}

/**
 * True when the product's picture is a render, not a photo of a real print.
 * Renders live in public/products/preview and public/products/v3. Upload a
 * real photo in the admin page and this turns false on its own, so the
 * "Preview render" label disappears for that picture.
 */
export function isPreviewImage(image: string): boolean {
  return image.includes('/products/preview/') || image.includes('/products/v3/')
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
