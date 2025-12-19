/**
 * Convert a date string to relative time in Spanish
 * Examples: "Hace 5 min", "Hace 2 horas", "Hace 1 día"
 */
export function timeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffMin < 1) {
        return 'Ahora mismo';
    } else if (diffMin < 60) {
        return `Hace ${diffMin} min`;
    } else if (diffHour < 24) {
        return `Hace ${diffHour} ${diffHour === 1 ? 'hora' : 'horas'}`;
    } else {
        return `Hace ${diffDay} ${diffDay === 1 ? 'día' : 'días'}`;
    }
}

/**
 * Format a date as time (HH:MM)
 */
export function formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Format a date as short date (DD/MM/YYYY)
 */
export function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}
