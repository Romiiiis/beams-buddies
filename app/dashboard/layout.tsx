'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { BusinessContext } from '@/lib/business-context'

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
    async function load() {
      setLoading(true)
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
        setBusiness({
          name: bizData.name,
          logo_url: bizData.logo_url,
          full_name: userData.full_name,
          role_title: userData.role_title,
        })
      }

      setLoading(false)
    }

    load()
  }, [tick])

  return (
    <BusinessContext.Provider value={{ business, loading, refresh }}>
      {children}
    </BusinessContext.Provider>
  )
}