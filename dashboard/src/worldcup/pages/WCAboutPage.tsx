export function WCAboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-4xl font-bold">About World Cup 2030</h1>
      <p className="mt-6 text-lg leading-relaxed text-[var(--wc-muted)]">
        The 2030 FIFA World Cup marks the centenary of the tournament — a historic celebration hosted across
        three nations: Morocco, Spain, and Portugal. For the first time, the world&apos;s greatest football
        event spans two continents, uniting cultures, passion, and hospitality.
      </p>
      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {[
          { flag: '🇲🇦', title: 'Morocco', desc: 'State-of-the-art stadiums in Casablanca, Rabat, Marrakech and more.' },
          { flag: '🇪🇸', title: 'Spain', desc: 'Legendary venues from Madrid to Barcelona and Seville.' },
          { flag: '🇵🇹', title: 'Portugal', desc: 'Coastal cities Lisbon and Porto ready to welcome fans worldwide.' },
        ].map(({ flag, title, desc }) => (
          <div key={title} className="wc-card p-6 text-center">
            <span className="text-5xl">{flag}</span>
            <h3 className="mt-4 font-bold">{title}</h3>
            <p className="mt-2 text-sm text-[var(--wc-muted)]">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
