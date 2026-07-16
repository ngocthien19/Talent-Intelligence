import { Routes, Route } from 'react-router-dom'
import CandidateLayout from '~/layouts/candidate/CandidateLayout'
import Home from '~/pages/candidate/Home'
import Jobs from '~/pages/candidate/Jobs'
import ThemeInitializer from '~/components/common/ThemeInitializer'
import LanguageInitializer from '~/components/common/LanguageInitializer'

function App() {
  return (
    <>
      <ThemeInitializer />
      <LanguageInitializer />
      <Routes>
        <Route path="/" element={<CandidateLayout />}>
          <Route index element={<Home />} />
          <Route path="jobs" element={<Jobs />} />
        </Route>
      </Routes>
    </>
  )
}

export default App