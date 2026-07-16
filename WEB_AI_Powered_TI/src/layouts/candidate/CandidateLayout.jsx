import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

const CandidateLayout = () => {
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