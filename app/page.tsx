import LoginPage from './login/page'
import { authFont } from './fonts'

// The app's start page (what opens from the iPhone / Android home screen icon and jobyra.app)
// is the login screen itself, so people land on the same screen every time. Signed-in users
// are sent straight on to their dashboard by the login screen.
export default function Home() {
  return (
    <div className={authFont.variable}>
      <LoginPage />
    </div>
  )
}
