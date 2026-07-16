import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Fleet from './pages/Fleet'
import Drivers from './pages/Drivers'
import RoutesPage from './pages/Routes'
import Reports from './pages/Reports'
import Contact from './pages/Contact'
import DriverApp from './pages/DriverApp'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <div className="bubble-1" />
      <div className="bubble-2" />
      <div className="bubble-3" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route path="/" element={<Dashboard />} />
          <Route path="/fleet" element={<Fleet />} />
          <Route path="/drivers" element={<Drivers />} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/support" element={<Contact />} />
        </Route>
        <Route path="/driver" element={<DriverApp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
