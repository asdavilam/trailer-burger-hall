'use client'

type Props = {
  label: string
  confirmMessage?: string
  className?: string
}

export default function ConfirmSubmit({ label, confirmMessage, className }: Props) {
  return (
    <button
      type="button"
      className={className}
      onClick={(e) => {
        const form = (e.currentTarget as HTMLButtonElement).closest('form')
        if (!form) return
        if (!confirmMessage || confirm(confirmMessage)) {
          // dispara el submit del form que contiene la server action
          form.requestSubmit()
        }
      }}
    >
      {label}
    </button>
  )
}