import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import CustomerDetail from './pages/CustomerDetail'
import AIAssistant from './pages/AIAssistant'
import Navbar from './components/Navbar'

function ProtectedLayout({ children }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/login" />
  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
        <Route path="/customers" element={<ProtectedLayout><Customers /></ProtectedLayout>} />
        <Route path="/customers/:id" element={<ProtectedLayout><CustomerDetail /></ProtectedLayout>} />
        <Route path="/ai" element={<ProtectedLayout><AIAssistant /></ProtectedLayout>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}