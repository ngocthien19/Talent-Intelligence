import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux' // THÊM useSelector
import { getProfile } from '~/redux/slices/auth.slice'
import { updateFavoriteStatus } from '~/redux/slices/favorite.slice' // THÊM IMPORT
import CandidateLayout from '~/layouts/candidate/CandidateLayout'
import Home from '~/pages/candidate/Home'
import Jobs from '~/pages/candidate/Jobs'
import JobDetailPage from '~/pages/candidate/JobDetailPage'
import Login from '~/pages/auth/Login'
import Register from '~/pages/auth/Register'
import VerifyOtp from '~/pages/auth/VerifyOtp'
import ForgotPassword from '~/pages/auth/ForgotPassword'
import ResetPassword from '~/pages/auth/ResetPassword'
import ThemeInitializer from '~/components/common/ThemeInitializer'
import LanguageInitializer from '~/components/common/LanguageInitializer'

function App() {
  const dispatch = useDispatch()
  const { favoriteIds } = useSelector((state) => state.auth)
  const { favoriteIds: favIds } = useSelector((state) => state.favorite)

  useEffect(() => {
    dispatch(getProfile())
  }, [dispatch])

  useEffect(() => {
    if (favoriteIds && favoriteIds.length > 0 && favIds.length === 0) {
      favoriteIds.forEach(jobId => {
        dispatch(updateFavoriteStatus({ jobId, isFavorite: true }))
      })
    }
    // Nếu favorite slice có dữ liệu mà auth chưa có (trường hợp login sau)
    if (favIds && favIds.length > 0 && favoriteIds.length === 0) {
      // Cần sync ngược lại auth slice
    }
  }, [favoriteIds, favIds, dispatch])

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
        </Route>
      </Routes>
    </>
  )
}

export default App