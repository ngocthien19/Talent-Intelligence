import { Routes, Route } from 'react-router-dom'
import CandidateLayout from '~/layouts/candidate/CandidateLayout'
import Home from '~/pages/candidate/Home'
import ThemeInitializer from '~/components/common/ThemeInitializer'

function App() {
  return (
    <>
      <ThemeInitializer />
      <Routes>
        <Route path="/" element={<CandidateLayout />}>
          <Route index element={<Home />} />
        </Route>
      </Routes>
    </>
  )
}

export default App