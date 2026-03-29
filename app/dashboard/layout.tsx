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
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [business, setBusiness] = useState<BusinessData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)

  function refresh() { setTick(t => t + 1) }

  useEffect(() => {
    // Read cache on client only
    try {
      const raw = localStorage.getItem(CACHE_KEY)
      if (raw) {
        const cached = JSON.parse(raw)
        setBusiness(cached)
        setLoading(false)
      }
    } catch {}

    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setLoading(false); return }

      const { data: userData } = await supabase
        .from('users')
        .select('business_id, full_name, role_title')
        .eq('id', session.user.id)
        .single()

      if (!userData) { setLoading(false); return }

      const { data: bizData } = await supabase
        .from('businesses')
        .select('name, logo_url')
        .eq('id', userData.business_id)
        .single()

      if (bizData) {
        const data = {
          name: bizData.name,
          logo_url: bizData.logo_url,
          full_name: userData.full_name,
          role_title: userData.role_title,
        }
        setBusiness(data)
        setLoading(false)
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)) } catch {}
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