'use client'

import React, { use } from 'react'
import { PublicDocument } from '@/components/PublicDocument'

export default function PublicInvoicePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  return <PublicDocument kind="invoice" token={token} />
}
