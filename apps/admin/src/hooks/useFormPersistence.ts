'use client'

import { useEffect, useRef, useState } from 'react'

export interface UseFormPersistenceOptions<T> {
    key: string
    data: T
    enabled?: boolean
    debounceMs?: number
    expirationHours?: number // New prop
}

interface StoredData<T> {
    timestamp: number
    content: T
}

/**
 * Hook to persist form data to localStorage with auto-save
 * @param key - Unique key for localStorage
 * @param data - Data to persist
 * @param enabled - Whether persistence is enabled (default: true)
 * @param debounceMs - Debounce time for auto-save (default: 500ms)
 * @param expirationHours - Hours before data expires (default: 18)
 */
export function useFormPersistence<T>({
    key,
    data,
    enabled = true,
    debounceMs = 500,
    expirationHours = 12
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
                const payload: StoredData<T> = {
                    timestamp: Date.now(),
                    content: data
                }
                localStorage.setItem(key, JSON.stringify(payload))
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
            const raw = localStorage.getItem(key)
            if (raw) {
                const parsed = JSON.parse(raw)

                // Check if it's the old format (direct data) or new format (wrapper)
                // We assume new format has 'timestamp' number. 
                // To be safe, we can try to detect or just assume migration implies clearing old data if format mismatch triggers logic.
                // But simpler: check if 'timestamp' exists.

                let content: T | null = null
                let timestamp = 0

                if ('timestamp' in parsed && 'content' in parsed) {
                    // New format
                    content = parsed.content
                    timestamp = parsed.timestamp
                } else {
                    // Old format (or just data). 
                    // To migrate cleanly, we might want to discard old data to be safe, 
                    // OR accept it this one time.
                    // Given the user wants to Fix persistence, treating old untimestamped data as EXPIRED is safer.
                    console.warn('Found untimestamped/legacy data, discarding to ensure freshness.')
                    return null
                }

                // Check Expiration
                const ageHours = (Date.now() - timestamp) / (1000 * 60 * 60)
                if (ageHours > expirationHours) {
                    console.log(`Data expired (${ageHours.toFixed(1)} hours old), clearing.`)
                    localStorage.removeItem(key)
                    return null
                }

                return content
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
