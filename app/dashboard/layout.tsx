'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { BusinessContext } from '@/lib/business-context'

const CACHE_KEY = 'jobyra_business'

type BusinessData = {
  name: string
  logo_url: string | null
  full_name: string | null
  role_title: string | null
  industry: string | null
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [business, setBusiness] = useState<BusinessData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)

  function refresh() { setTick(t => t + 1) }

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setLoading(false); return }

      const userId = session.user.id
      const userCacheKey = `${CACHE_KEY}_${userId}`

      // Read cache keyed by user ID so different accounts don't bleed into each other
      try {
        const raw = localStorage.getItem(userCacheKey)
        if (raw) {
          const cached = JSON.parse(raw)
          setBusiness(cached)
          setLoading(false)
        }
      } catch {}

      const { data: userData } = await supabase
        .from('users')
        .select('business_id, full_name, role_title')
        .eq('id', userId)
        .single()

      if (!userData) { setLoading(false); return }

      const { data: bizData } = await supabase
        .from('businesses')
        .select('name, logo_url, industry')
        .eq('id', userData.business_id)
        .single()

      if (bizData) {
        const data = {
          name: bizData.name,
          logo_url: bizData.logo_url,
          full_name: userData.full_name,
          role_title: userData.role_title,
          industry: bizData.industry ?? null,
        }
        setBusiness(data)
        setLoading(false)
        try { localStorage.setItem(userCacheKey, JSON.stringify(data)) } catch {}
      }
    }

    load()
  }, [tick])

  return (
    <BusinessContext.Provider value={{ business, loading, refresh }}>
      {children}
    </BusinessContext.Provider>
  )
}