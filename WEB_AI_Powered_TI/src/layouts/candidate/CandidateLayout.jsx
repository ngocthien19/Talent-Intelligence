import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { getProfile } from '~/redux/slices/auth.slice'
import Header from './Header'
import Footer from './Footer'

const CandidateLayout = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    const hasAccessToken = document.cookie.includes('accessToken')
    const userInStorage = localStorage.getItem('user')

    if (hasAccessToken && userInStorage) {
      dispatch(getProfile())
    }
  }, [dispatch])

  return (
    <div className="app-wrapper">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default CandidateLayout