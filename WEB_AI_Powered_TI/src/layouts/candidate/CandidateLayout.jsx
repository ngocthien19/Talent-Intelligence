import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

const CandidateLayout = () => {
  return (
    <div className="app-wrapper">
      <Header />
      <main className="flex-1">
        <div className="app-container py-6">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default CandidateLayout