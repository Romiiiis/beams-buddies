// The address customers see in the links we send them (quote and invoice pages).
// Set NEXT_PUBLIC_SITE_URL to change it; otherwise it is the live site.

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://jobyra.app').replace(/\/+$/, '')

export const quoteLink = (token: string) => `${SITE_URL}/q/${token}`
export const invoiceLink = (token: string) => `${SITE_URL}/i/${token}`
