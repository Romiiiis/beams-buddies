import { Geist } from 'next/font/google'

// Font for the sign-in and password pages (chosen login design: option 10, Geist)
export const authFont = Geist({ subsets: ['latin'], variable: '--font-auth', display: 'swap' })
