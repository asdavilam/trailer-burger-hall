import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'

// --- TIPOS ---
type SupplyRow = {
  Item: string
  Proveedor: string
  Marca: string
  Categoría: string
  Medida: string
  Unidad: string
  'Precio Ud.': string
  Existencias: string
  Código: string
}

type ProductRow = {
  Nombre: string
  'Precio actual': string
  'Precio Total': string
}

// --- UTILIDADES ---
const parseCurrency = (str: string | undefined | null) => {
  if (!str || typeof str !== 'string') return 0
  const clean = str.replace('$', '').replace(/\./g, '').replace(',', '.').trim()
  const num = parseFloat(clean)
  return isNaN(num) ? 0 : num
}

const mapUnit = (medida: string, unidad: string) => {
  const text = ((medida || '') + ' ' + (unidad || '')).toLowerCase()
  if (text.includes('kilogramo') || text.includes('kg')) return 'kg'
  if (text.includes('litro') || text.includes('lt')) return 'lt'
  if (text.includes('gramo') || text.includes('gr')) return 'gr'
  if (text.includes('mililitro') || text.includes('ml')) return 'ml'
  return 'pz' 
}

// --- IMPORTADORES ---

async function importSupplies() {
  const csvPath = path.join(process.cwd(), 'Control productos TBH - Inventario.csv')
  const fileContent = fs.readFileSync(csvPath, 'utf-8')
  
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  }) as SupplyRow[]

  let successCount = 0
  const errors: any[] = []

  for (const row of records) {
    const unit = mapUnit(row['Medida'], row['Unidad'])
    const cost = parseCurrency(row['Precio Ud.']) 
    const stock = parseCurrency(row['Existencias']) 

    // Intentamos insertar
    const { error } = await supabaseAdmin.from('supplies').upsert({
      name: row['Item'],
      provider: row['Proveedor'] || null,
      brand: row['Marca'] || null,
      category: row['Categoría'] || null,
      unit: unit,
      cost_per_unit: cost,
      min_stock: 5,
      current_stock: stock,
      legacy_id: parseInt(row['Código']) || 0
    }, { onConflict: 'name' })

    if (error) {
      // Guardamos el error para mostrarlo al usuario
      errors.push({ item: row['Item'], error: error.message })
    } else {
      successCount++
    }
  }
  return { successCount, errors }
}

async function importProductsV2() {
  const csvPath = path.join(process.cwd(), 'Control productos TBH - Productos.csv')
  const fileContent = fs.readFileSync(csvPath, 'utf-8')
  
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  }) as ProductRow[]

  let successCount = 0
  const errors: any[] = []
  const productMap: Record<string, string> = {}

  for (const row of records) {
    const rawName = row['Nombre']
    if (!rawName) continue

    const priceStr = row['Precio actual'] && row['Precio actual'] !== '$0' ? row['Precio actual'] : row['Precio Total']
    const price = parseCurrency(priceStr)

    let baseName = rawName
    let variantName = 'normal'
    let category = 'protein_base'

    const nameLower = rawName.toLowerCase()
    if (nameLower.includes('papas')) {
       category = 'side'
       baseName = rawName
    } else if (nameLower.includes('hot dog') || nameLower.includes('banderilla') || nameLower.includes('nugget')) {
       category = 'special'
    } else {
        category = 'protein_base'
        if (nameLower.includes('doble')) {
            variantName = 'doble'
            baseName = rawName.replace(/doble /i, 'de ').replace(/  +/g, ' ')
        } else if (nameLower.includes('light')) {
            variantName = 'light'
            baseName = rawName.replace(/light /i, 'de ').replace(/  +/g, ' ')
        } else if (nameLower.includes('casa')) {
            variantName = 'casa'
            baseName = rawName.replace(/casa /i, 'de ').replace(/  +/g, ' ')
        }
    }
    
    baseName = baseName.trim()

    let productId = productMap[baseName]

    if (!productId) {
      const { data: existing } = await supabaseAdmin.from('v2_products').select('id').eq('name', baseName).single()
      
      if (existing) {
        productId = existing.id
      } else {
        const { data: newProd, error } = await supabaseAdmin.from('v2_products').insert({
            name: baseName,
            category: category,
            is_active: true,
            config: {} 
        }).select('id').single()

        if (error) {
            errors.push({ product: baseName, error: error.message })
            continue
        }
        productId = newProd.id
      }
      productMap[baseName] = productId
    }

    const { error: varError } = await supabaseAdmin.from('v2_product_variants').upsert({
        product_id: productId,
        name: variantName,
        price: price,
        is_active: true
    }, { onConflict: 'product_id, name' })

    if (varError) {
        errors.push({ variant: rawName, error: varError.message })
    } else {
        successCount++
    }
  }
  return { successCount, errors }
}

// --- HANDLER DE LA API ---

export async function GET() {
  try {
    const suppliesResult = await importSupplies()
    const productsResult = await importProductsV2()

    return NextResponse.json({ 
      success: true, 
      message: `Proceso finalizado`,
      stats: {
        insumos_ok: suppliesResult.successCount,
        insumos_error: suppliesResult.errors.length,
        variantes_ok: productsResult.successCount
      },
      // 👇 AQUÍ VERÁS POR QUÉ FALLARON
      errors: {
        supplies: suppliesResult.errors,
        products: productsResult.errors
      }
    })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}