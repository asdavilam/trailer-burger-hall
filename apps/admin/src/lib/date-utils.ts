export function getMexicoDate() {
    const timeZone = 'America/Mexico_City'
    const now = new Date()
    const mexicoDateStr = now.toLocaleString('en-US', { timeZone })
    const today = new Date(mexicoDateStr)
    return {
        date: today,
        dateString: today.toLocaleDateString('es-MX', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }
}
