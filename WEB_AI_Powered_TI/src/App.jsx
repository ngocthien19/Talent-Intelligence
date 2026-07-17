import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { getProfile, syncFavorites } from '~/redux/slices/auth.slice'
import { getFavorites } from '~/redux/slices/favorite.slice'

import CandidateLayout from '~/layouts/candidate/CandidateLayout'
import Home from '~/pages/candidate/Home'
import Jobs from '~/pages/candidate/Jobs'
import JobDetailPage from '~/pages/candidate/JobDetailPage'
import Favorites from '~/pages/candidate/Favorites'

import Login from '~/pages/auth/Login'
import Register from '~/pages/auth/Register'
import VerifyOtp from '~/pages/auth/VerifyOtp'
import ForgotPassword from '~/pages/auth/ForgotPassword'
import ResetPassword from '~/pages/auth/ResetPassword'
import ThemeInitializer from '~/components/common/ThemeInitializer'
import LanguageInitializer from '~/components/common/LanguageInitializer'

function App() {
  const dispatch = useDispatch()

  const { isAuthenticated } = useSelector((state) => state.auth)

  useEffect(() => {
    dispatch(getProfile())
  }, [dispatch])

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getFavorites()).unwrap().then((result) => {
        if (result?.data) {
          const ids = result.data.map(fav => fav.job_id)
          dispatch(syncFavorites(ids))
        }
      })
    }
  }, [isAuthenticated, dispatch])

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
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Candidate routes */}
        <Route path="/" element={<CandidateLayout />}>
          <Route index element={<Home />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="jobs/:id" element={<JobDetailPage />} />
          <Route path="favorites" element={<Favorites />} />
        </Route>
      </Routes>
    </>
  )
}

export default App