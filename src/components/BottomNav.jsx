import { NavLink } from 'react-router-dom'
import { Store, PackageSearch, ShoppingBag, Receipt, Settings2 } from 'lucide-react'

const items = [
  { to: '/', label: 'المتجر', icon: Store, end: true },
  { to: '/my-products', label: 'منتجاتي', icon: PackageSearch },
  { to: '/purchases', label: 'مشترياتي', icon: ShoppingBag },
  { to: '/debts', label: 'المستحقات', icon: Receipt },
  { to: '/settings', label: 'الإعدادات', icon: Settings2 },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-paper border-t border-stone">
      <ul className="flex justify-around max-w-xl mx-auto">
        {items.map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                  isActive ? 'text-awning' : 'text-inkfaint'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} strokeWidth={isActive ? 2.4 : 1.9} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
