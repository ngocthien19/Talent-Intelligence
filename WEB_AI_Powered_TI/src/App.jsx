import { Routes, Route } from 'react-router-dom'
import CandidateLayout from '~/layouts/candidate/CandidateLayout'
import Home from '~/pages/candidate/Home'
import Jobs from '~/pages/candidate/Jobs'
import JobDetailPage from '~/pages/candidate/JobDetailPage'
import Login from '~/pages/auth/Login'
import Register from '~/pages/auth/Register'
import VerifyOtp from '~/pages/auth/VerifyOtp'
import ForgotPassword from '~/pages/auth/ForgotPassword'
import ThemeInitializer from '~/components/common/ThemeInitializer'
import LanguageInitializer from '~/components/common/LanguageInitializer'

function App() {
  return (
    <>
      <ThemeInitializer />
      <LanguageInitializer />
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Candidate routes */}
        <Route path="/" element={<CandidateLayout />}>
          <Route index element={<Home />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="jobs/:id" element={<JobDetailPage />} />
        </Route>
      </Routes>
    </>
  )
}

export default App