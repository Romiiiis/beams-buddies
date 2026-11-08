import { authFont } from '../fonts'

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <div className={authFont.variable}>{children}</div>
}
