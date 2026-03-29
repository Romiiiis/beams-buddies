import { useEffect, useState } from 'react'
import { supabase } from './supabase'

let cache: {
  name: string
  logo_url: string | null
  full_name: string | null
  role_title: string | null
} | null = null

export function useBusiness() {
  const [data, setData] = useState(cache)

  useEffect(() => {
    if (cache) {
      setData(cache)
      return
    }
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
        cache = {
          name: bizData.name,
          logo_url: bizData.logo_url,
          full_name: userData.full_name,
          role_title: userData.role_title,
        }
        setData(cache)
      }
    }
    load()
  }, [])

  return data
}