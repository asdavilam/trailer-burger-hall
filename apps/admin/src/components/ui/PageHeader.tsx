import * as React from "react"

interface PageHeaderProps {
    title: string
    description?: string
    children?: React.ReactNode
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-[var(--color-secondary)]">
                    {title}
                </h1>
                {description && (
                    <p className="text-sm font-medium text-[var(--color-secondary)]/70">
                        {description}
                    </p>
                )}
            </div>
            {children && (
                <div className="flex items-center gap-2">
                    {children}
                </div>
            )}
        </div>
    )
}
