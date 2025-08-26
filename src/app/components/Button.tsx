type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary'
}

export default function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  const styles =
    variant === 'primary'
      ? 'bg-brand-700 text-white hover:bg-brand-800 focus-visible:ring-brand-600 focus-visible:ring-offset-white'
      : 'bg-white text-brand-700 border border-brand-700 hover:bg-brand-50 focus-visible:ring-brand-600 focus-visible:ring-offset-white'

  return <button className={`${base} ${styles} ${className}`} {...props} />
}