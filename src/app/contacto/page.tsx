import ContactForm from './ContactForm'

export const metadata = {
  title: 'Contacto — Trailer Burger Hall',
  description: 'Envíanos quejas o sugerencias. Te leemos.',
}

export default function ContactPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <header className="text-center">
        <h1 className="font-display text-3xl md:text-4xl tracking-wide">Contacto</h1>
        <p className="text-muted mt-2">
          Envíanos tus quejas o sugerencias. Tu experiencia nos importa.
        </p>
      </header>

      <ContactForm />

      <section className="cta-banner mt-8 text-center">
        <h2 className="font-display text-2xl md:text-3xl tracking-wide mb-2 text-white">¿Listo para probar nuestras hamburguesas?</h2>
        <p className="cta-sub text-white/90 mb-4">Ven y descubre por qué todos hablan de Trailer Burger Hall.</p>
      </section>
    </main>
  )
}