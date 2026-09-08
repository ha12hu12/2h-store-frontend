import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import BalanceChip from '../components/BalanceChip.jsx'
import BottomNav from '../components/BottomNav.jsx'
import WhatsNew from '../components/WhatsNew.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const TITLES = {
  '/': 'المتجر',
  '/my-products': 'منتجاتي',
  '/purchases': 'مشترياتي',
  '/debts': 'المستحقات',
  '/settings': 'الإعدادات',
}

export default function Layout() {
  const { money, username } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const title = TITLES[location.pathname] || 'المتجر'
  const showFab = location.pathname === '/' || location.pathname === '/my-products'

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-30 bg-paper/95 backdrop-blur border-b border-stone">
        <div className="max-w-xl mx-auto px-4 py-3 grid grid-cols-3 items-center">
          {/* right: balance */}
          <div className="flex justify-start">
            <BalanceChip money={money} />
          </div>

          {/* center: title + whats new */}
          <div className="flex flex-col items-center">
            <h1 className="font-display text-base font-bold leading-tight">{title}</h1>
            <WhatsNew />
          </div>

          {/* left: username */}
          <div className="flex justify-end">
            {username && (
              <p className="text-[11px] text-inkfaint leading-tight truncate max-w-[80px]">{username}</p>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-4 rise-in">
        <Outlet />
      </main>

      {showFab && (
        <button
          onClick={() => navigate('/my-products/new')}
          aria-label="أضف منتج"
          className="fixed bottom-20 left-4 z-40 w-14 h-14 rounded-full bg-mustard text-[#2B2A25] shadow-xl flex items-center justify-center hover:bg-mustarddark active:scale-95 transition"
        >
          <Plus size={26} strokeWidth={2.6} />
        </button>
      )}

      <BottomNav />
    </div>
  )
}
