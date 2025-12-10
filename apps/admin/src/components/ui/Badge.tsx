import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'outline'
}

export function Badge({ className = "", variant = "default", ...props }: BadgeProps) {
    const variants = new Map([
        ["default", "border-transparent bg-[var(--color-primary)] text-white hover:opacity-90"],
        ["secondary", "border-transparent bg-[var(--color-secondary)] text-white hover:opacity-90"],
        ["success", "border-transparent bg-[var(--color-accent)] text-white shadow-sm"], // Sage
        ["warning", "border-transparent bg-[var(--color-primary)] text-white shadow-sm"], // Bronze
        ["error", "border-transparent bg-[var(--color-error)] text-white shadow-sm"], // Wine
        ["outline", "text-[var(--color-secondary)] border-[var(--color-secondary)] bg-transparent"],
    ])

    const variantClass = variants.get(variant) || variants.get("default")

    return (
        <div
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variantClass} ${className}`}
            {...props}
        />
    )
}
