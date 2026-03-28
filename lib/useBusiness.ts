import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export function useBusiness() {
  const [data, setData] = useState<{
    name: string
    logo_url: string | null
    full_name: string | null
    role_title: string | null
  } | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data: userData } = await supabase
        .from('users')
        .select('business_id, full_name, role_title')
        .eq('id', session.user.id)
        .single()
      if (!userData) return
      const { data: bizData } = await supabase
        .from('businesses')
        .select('name, logo_url')
        .eq('id', userData.business_id)
        .single()
      if (bizData) {
        setData({
          name: bizData.name,
          logo_url: bizData.logo_url,
          full_name: userData.full_name,
          role_title: userData.role_title,
        })
      }
    }
    load()
  }, [])

  return data
}