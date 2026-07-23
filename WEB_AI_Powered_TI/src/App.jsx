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
import Applications from '~/pages/candidate/Applications'
import ApplicationDetail from '~/pages/candidate/ApplicationDetail'
import Profile from '~/pages/candidate/Profile'
import MockInterview from '~/pages/candidate/MockInterview'

import HRLayout from '~/layouts/hr/HRLayout'
import Dashboard from '~/pages/hr/dashboard/Dashboard'
import Candidates from '~/pages/hr/candidates/Candidates'
import CandidateDetail from '~/pages/hr/candidates/CandidateDetail'
import HRJobs from '~/pages/hr/jobs/HRJobs'
import JobDetail from '~/pages/hr/jobs/JobDetail'


import Login from '~/pages/auth/Login'
import Register from '~/pages/auth/Register'
import VerifyOtp from '~/pages/auth/VerifyOtp'
import ForgotPassword from '~/pages/auth/ForgotPassword'
import ResetPassword from '~/pages/auth/ResetPassword'
import ThemeInitializer from '~/components/common/ThemeInitializer'
import LanguageInitializer from '~/components/common/LanguageInitializer'
import { ROLES } from './utils/constant'

function App() {
  const dispatch = useDispatch()

  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const isCandidate = user?.roleName === ROLES.CANDIDATE

  useEffect(() => {
    dispatch(getProfile())
  }, [dispatch])

  useEffect(() => {
    if (isAuthenticated && isCandidate) {
      dispatch(getFavorites()).unwrap().then((result) => {
        if (result?.data) {
          const ids = result.data.map(fav => fav.job_id)
          dispatch(syncFavorites(ids))
        }
      })
    }
  }, [isAuthenticated, isCandidate, dispatch])

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
          <Route path="applications" element={<Applications />} />
          <Route path="applications/:id" element={<ApplicationDetail />} />
          <Route path="profile" element={<Profile />} />
          <Route path="mock-interview" element={<MockInterview />} />

        </Route>

        {/* HR routes */}
        <Route path="/hr" element={<HRLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="candidates" element={<Candidates />} />
          <Route path="candidates/:id" element={<CandidateDetail />} />
          <Route path="jobs" element={<HRJobs />} />
          <Route path="jobs/:id" element={<JobDetail />} />

        </Route>
      </Routes>
    </>
  )
}

export default App