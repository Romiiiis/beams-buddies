import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export function useBusiness() {
  const [business, setBusiness] = useState<{ name: string; logo_url: string | null } | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data: userData } = await supabase.from('users').select('business_id').eq('id', session.user.id).single()
      if (!userData) return
      const { data } = await supabase.from('businesses').select('name, logo_url').eq('id', userData.business_id).single()
      if (data) setBusiness(data)
    }
    load()
  }, [])

  return business
}