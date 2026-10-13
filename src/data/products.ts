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
  }
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
