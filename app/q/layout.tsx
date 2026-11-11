import type { Metadata } from 'next'

// Quote pages are private to whoever holds the link, so search engines are asked to stay away.
export const metadata: Metadata = {
  title: 'Your quote',
  robots: { index: false, follow: false },
}

export default function QuoteLayout({ children }: { children: React.ReactNode }) {
  return children
}
