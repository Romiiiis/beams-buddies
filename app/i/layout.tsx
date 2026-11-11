import type { Metadata } from 'next'

// Invoice pages are private to whoever holds the link, so search engines are asked to stay away.
export const metadata: Metadata = {
  title: 'Your invoice',
  robots: { index: false, follow: false },
}

export default function InvoiceLayout({ children }: { children: React.ReactNode }) {
  return children
}
