import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { PublicWall } from './pages/PublicWall'
import { SubmitPage } from './pages/SubmitPage'
import { AdminPage } from './pages/AdminPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicWall />} />
        <Route path="/preguntar" element={<SubmitPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  )
}
