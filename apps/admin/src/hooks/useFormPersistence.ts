'use client'

import { useEffect, useRef, useState } from 'react'

interface UseFormPersistenceOptions<T> {
    key: string
    data: T
    enabled?: boolean
    debounceMs?: number
}

/**
 * Hook to persist form data to localStorage with auto-save
 * @param key - Unique key for localStorage
 * @param data - Data to persist
 * @param enabled - Whether persistence is enabled (default: true)
 * @param debounceMs - Debounce time for auto-save (default: 500ms)
 */
export function useFormPersistence<T>({
    key,
    data,
    enabled = true,
    debounceMs = 500
}: UseFormPersistenceOptions<T>) {
    const [isSaving, setIsSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)
    const [showSaved, setShowSaved] = useState(false)
    const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
    const savedTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

    // Auto-save data to localStorage
    useEffect(() => {
        if (!enabled) return

        // Clear previous timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }

        // Set saving indicator
        setIsSaving(true)
        setShowSaved(false)

        // Debounced save
        timeoutRef.current = setTimeout(() => {
            try {
                localStorage.setItem(key, JSON.stringify(data))
                setLastSaved(new Date())
                setIsSaving(false)
                setShowSaved(true)

                // Auto-hide "Guardado" message after 2 seconds
                if (savedTimeoutRef.current) {
                    clearTimeout(savedTimeoutRef.current)
                }
                savedTimeoutRef.current = setTimeout(() => {
                    setShowSaved(false)
                }, 2000)
            } catch (error) {
                console.error('Failed to save form data:', error)
                setIsSaving(false)
            }
        }, debounceMs)

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
            if (savedTimeoutRef.current) {
                clearTimeout(savedTimeoutRef.current)
            }
        }
    }, [data, enabled, key, debounceMs])

    // Restore data from localStorage
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const restore = (): T | null => {
        try {
            const saved = localStorage.getItem(key)
            if (saved) {
                return JSON.parse(saved) as T
            }
        } catch (error) {
            console.error('Failed to restore form data:', error)
        }
        return null
    }

    // Clear saved data
    const clear = () => {
        try {
            localStorage.removeItem(key)
            setLastSaved(null)
        } catch (error) {
            console.error('Failed to clear form data:', error)
        }
    }

    return {
        isSaving,
        lastSaved,
        showSaved,
        restore,
        clear
    }
}
