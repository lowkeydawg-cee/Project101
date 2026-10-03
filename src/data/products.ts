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
  image: string
  imageUrl?: string
  featured?: boolean
  available?: boolean
  stock?: number
}
// Placeholder gradient "photography" — swap for real product photography later.
function shade(hue: number) {
  return `linear-gradient(160deg, hsl(${hue} 30% 10%) 0%, hsl(${hue} 40% 5%) 60%, #0d0d0d 100%)`
}

export const products: Product[] = [
  {
    id: '1',
    slug: 'geodesic-planter',
    catalogNo: 'ART.014',
    name: 'Geodesic Planter',
    category: 'Decor',
    price: 15000,
    description:
      'A faceted planter built from a single continuous print path. Drainage channel integrated into the base geometry, no separate saucer needed.',
    material: 'PETG, matte finish',
    finish: 'Charcoal',
    image: shade(265),
    featured: true,
    available: true,
    stock: 4,
  },
  {
    id: '2',
    slug: 'threshold-lamp',
    catalogNo: 'ART.021',
    name: 'Threshold Lamp',
    category: 'Lighting',
    price: 28000,
    description:
      'Layer-line diffusion shade over a warm 2700K bulb. Designed to sit in doorways and thresholds, casting a banded light pattern across walls.',
    material: 'PLA, translucent',
    finish: 'Bone',
    image: shade(280),
    featured: true,
    available: true,
    stock: 3,
  },
  {
    id: '3',
    slug: 'strata-vessel',
    catalogNo: 'ART.009',
    name: 'Strata Vessel',
    category: 'Decor',
    price: 19500,
    description:
      'A vase-mode print exploiting visible layer strata as ornament rather than flaw. Each unit varies slightly, no two strata patterns match exactly.',
    material: 'PLA, silk finish',
    finish: 'Ink Black',
    image: shade(250),
    featured: false,
    available: true,
    stock: 4,
  },
  {
    id: '4',
    slug: 'cable-anchor-set',
    catalogNo: 'ART.033',
    name: 'Cable Anchor Set',
    category: 'Functional',
    price: 8000,
    description:
      'Set of six desk-edge cable anchors. Friction-fit clip, no adhesive residue. Sold in sets of six.',
    material: 'PETG',
    finish: 'Graphite',
    image: shade(300),
    featured: false,
    available: true,
    stock: 30,
  },
  {
    id: '5',
    slug: 'monolith-bookend',
    catalogNo: 'ART.007',
    name: 'Monolith Bookend',
    category: 'Decor',
    price: 12000,
    description:
      'Weighted bookend pair with a sand-infill core for stability. Precision right-angle edge, brushed matte surface.',
    material: 'PLA + sand infill',
    finish: 'Charcoal',
    image: shade(240),
    featured: false,
    available: true,
    stock: 20,
  },
  {
    id: '6',
    slug: 'aperture-pendant',
    catalogNo: 'ART.026',
    name: 'Aperture Pendant Shade',
    category: 'Lighting',
    price: 32000,
    description:
      'Iris-inspired pendant shade with an articulated aperture pattern. Hangs from a standard E27 pendant cord, sold shade-only.',
    material: 'PETG, translucent',
    finish: 'Smoke',
    image: shade(275),
    featured: true,
    available: true,
    stock: 6,
  },
  {
    id: '7',
    slug: 'ridge-tray',
    catalogNo: 'ART.011',
    name: 'Ridge Catch Tray',
    category: 'Functional',
    price: 9500,
    description:
      'Entryway tray for keys, coins, and small tools. Ridged base channels dust and debris to the tray edge for easy clearing.',
    material: 'PETG',
    finish: 'Bone',
    image: shade(255),
    featured: false,
    available: true,
    stock: 18,
  },
  {
    id: '8',
    slug: 'fault-line-clock',
    catalogNo: 'ART.018',
    name: 'Fault Line Wall Clock',
    category: 'Decor',
    price: 24000,
    description:
      'Wall clock face split along a fractured seam, printed in two passes and rejoined. Silent quartz movement.',
    material: 'PLA, matte finish',
    finish: 'Ink Black / Bone',
    image: shade(285),
    featured: false,
    available: true,
    stock: 9,
  },
]

export const categories = Array.from(new Set(products.map((p) => p.category)))
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
  image: string
}

// Maps a raw Supabase row (snake_case) to the app's Product shape (camelCase)
function mapRow(row: any): Product {
  return {
    id: row.id,
    slug: row.slug,
    catalogNo: row.catalog_no,
    name: row.name,
    category: row.category,
    price: row.price,
    description: row.description,
    material: row.material,
    finish: row.finish,
    image: row.image_url ?? '',
  }
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
    .single()

  if (error || !data) return null
  return mapRow(data)
}