import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg' | 'icon'
    fullWidth?: boolean
    asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = "", variant = "primary", size = "md", fullWidth = false, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"

        const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"

        const variants = new Map([
            ["primary", "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90 border border-transparent shadow-sm"],
            ["secondary", "bg-[var(--color-secondary)] text-white hover:bg-[var(--color-secondary)]/90 border border-transparent shadow-sm"],
            ["outline", "border-2 border-[var(--color-primary)] bg-transparent text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white"],
            ["ghost", "hover:bg-[var(--color-background)] text-[var(--color-secondary)] hover:text-[var(--color-primary)] transition-all"],
            ["danger", "bg-[var(--color-error)] text-white hover:bg-[var(--color-error)]/90 border border-transparent shadow-sm"],
        ])

        const sizes = new Map([
            ["sm", "h-8 px-3 text-xs"],
            ["md", "h-10 px-4 py-2"],
            ["lg", "h-12 px-8 text-base"],
            ["icon", "h-10 w-10"],
        ])

        const variantClass = variants.get(variant) || variants.get("primary")
        const sizeClass = sizes.get(size) || sizes.get("md")

        const widthClass = fullWidth ? "w-full" : ""

        return (
            <Comp
                className={`${baseStyles} ${variantClass} ${sizeClass} ${widthClass} ${className}`}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"
