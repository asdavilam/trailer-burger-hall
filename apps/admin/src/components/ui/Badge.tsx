import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'outline'
}

export function Badge({ className = "", variant = "default", ...props }: BadgeProps) {
    const variants = {
        default: "border-transparent bg-[var(--color-primary)] text-white hover:opacity-80",
        secondary: "border-transparent bg-[var(--color-secondary)] text-white hover:opacity-80",
        success: "border-transparent bg-[var(--color-success)] text-white shadow-sm",
        warning: "border-transparent bg-[var(--color-warning)] text-white shadow-sm",
        error: "border-transparent bg-[var(--color-error)] text-white shadow-sm",
        outline: "text-[var(--color-secondary)] border-[var(--color-secondary)]",
    }

    return (
        <div
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variants[variant]} ${className}`}
            {...props}
        />
    )
}
