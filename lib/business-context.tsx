'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type BusinessData = {
  name: string
  logo_url: string | null
  full_name: string | null
  role_title: string | null
}

type BusinessContextType = {
  business: BusinessData | null
  loading: boolean
  refresh: () => void
}

export const BusinessContext = createContext<BusinessContextType>({
  business: null,
  loading: true,
  refresh: () => {},
})

export function useBusinessData() {
  return useContext(BusinessContext)
}