import LoginPage from './login/page'
import { authFont } from './fonts'

// The app's start page (what opens from the iPhone / Android home screen icon and jobyra.app)
// is the login screen itself. Signed-in users are sent straight on to their dashboard by the login screen; only
// people with no saved sign-in see the form (and the phone's own saved-password / Face ID prompt).
export default function Home() {
  return (
    <div className={authFont.variable}>
      <LoginPage />
    </div>
  )
}
