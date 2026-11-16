'use client'

import React, { use } from 'react'
import { PublicDocument } from '@/components/PublicDocument'

export default function PublicQuotePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  return <PublicDocument kind="quote" token={token} />
}
