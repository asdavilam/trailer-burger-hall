import type { V2Product } from '@trailer/shared'

/**
 * Group products by category
 */
export function groupByCategory(products: V2Product[]): Map<string, V2Product[]> {
    const grouped = new Map<string, V2Product[]>()

    products.forEach(product => {
        const category = product.category || 'other'
        if (!grouped.has(category)) {
            grouped.set(category, [])
        }
        grouped.get(category)!.push(product)
    })

    return grouped
}

/**
 * Get category display name in Spanish
 */
export function getCategoryName(category: string): string {
    const names: Record<string, string> = {
        burger: 'Hamburguesas',
        fries: 'Papas',
        drink: 'Bebidas',
        side: 'Extras',
        other: 'Otros'
    }
    return names[category] || category
}
