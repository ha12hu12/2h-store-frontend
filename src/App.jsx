import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Layout from './pages/Layout.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Home from './pages/Home.jsx'
import MyProducts from './pages/MyProducts.jsx'
import ProductForm from './pages/ProductForm.jsx'
import PledgeForm from './pages/PledgeForm.jsx'
import Purchases from './pages/Purchases.jsx'
import Debts from './pages/Debts.jsx'
import Settings from './pages/Settings.jsx'

function RequireAuth({ children }) {
  const { token, ready } = useAuth()
  if (!ready) return null
  if (!token) return <Navigate to="/login" replace />
  return children
}

function RedirectIfAuthed({ children }) {
  const { token, ready } = useAuth()
  if (!ready) return null
  if (token) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<RedirectIfAuthed><Login /></RedirectIfAuthed>} />
      <Route path="/signup" element={<RedirectIfAuthed><Signup /></RedirectIfAuthed>} />

      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/my-products" element={<MyProducts />} />
        <Route path="/my-products/new" element={<ProductForm mode="create" />} />
        <Route path="/my-products/new-pledge" element={<PledgeForm />} />
        <Route path="/my-products/:name/edit" element={<ProductForm mode="edit" />} />
        <Route path="/my-products/:name/edit-pledge" element={<PledgeForm mode="edit" />} />
        <Route path="/purchases" element={<Purchases />} />
        <Route path="/debts" element={<Debts />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
