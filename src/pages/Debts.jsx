import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { api } from '../lib/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../components/Toast.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Spinner from '../components/Spinner.jsx'

export default function Debts() {
  const { token, refreshMoney } = useAuth()
  const toast = useToast()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [toPay, setToPay] = useState(null)
  const [paying, setPaying] = useState(false)

  async function load(username = '') {
    setLoading(true)
    try {
      const data = await api.getDebts(username, token)
      setItems(data)
    } catch (err) {
      setItems(err.status === 404 ? [] : items)
      if (err.status !== 404) toast.push(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, []) // eslint-disable-line

  function handleSearchSubmit(e) {
    e.preventDefault()
    load(search)
  }

  async function confirmPay() {
    setPaying(true)
    try {
      await api.markPaid(toPay.id, token)
      toast.push(`تم تسجيل دفع ${toPay.buyer.username}`)
      setToPay(null)
      await Promise.all([load(search), refreshMoney()])
    } catch (err) {
      toast.push(err.message, 'error')
    } finally {
      setPaying(false)
    }
  }

  // for pledge items: the debt is the buyer's share, not the full product price
  function debtAmount(item) {
    const isPledge = !!item.product.pledge_shares
    if (isPledge && item.product.pledge_shares?.[item.buyer.username] != null) {
      return item.product.pledge_shares[item.buyer.username]
    }
    return item.product.price
  }

  return (
    <>
      <form onSubmit={handleSearchSubmit} className="relative mb-4">
        <Search size={16} className="absolute top-1/2 -translate-y-1/2 right-3 text-inkfaint" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="دور باسم مستخدم" className="input pr-9" />
      </form>

      {loading ? (
        <div className="flex justify-center py-16 text-awning"><Spinner /></div>
      ) : items.length === 0 ? (
        <EmptyState
          title="ما عليك أحد"
          hint={search ? `ما لقينا نتائج لـ "${search}"` : 'ما فيه ديون غير مسددة عليك حاليًا'}
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          {items.map((item) => {
            const isPledge = !!item.product.pledge_shares
            const amount = debtAmount(item)
            return (
              <div key={item.id}
                className="perforated bg-card/70 border border-stone rounded-2xl p-3 flex gap-3 items-center">
                <div className="w-10 h-10 rounded-full bg-awning/10 text-awning flex-shrink-0 flex items-center justify-center font-display font-bold text-sm">
                  {item.buyer.username.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-sm truncate">{item.buyer.username}</h3>
                  <p className="text-xs text-inkfaint truncate">
                    {item.product.product_name}
                    {isPledge && <span className="mr-1 text-mustard">· قطة</span>}
                  </p>
                </div>

                <span className="price-tag bg-brickfaint text-brick text-xs">
                  {amount.toLocaleString('en-US')} ر.س
                </span>

                <button onClick={() => setToPay(item)}
                  className="text-xs font-bold bg-awning text-white rounded-tag px-3 py-1.5 hover:bg-awningdark active:scale-95 transition">
                  تم الدفع
                </button>
              </div>
            )
          })}
        </div>
      )}

      <ConfirmModal
        open={!!toPay}
        title={`تأكيد استلام المبلغ من ${toPay?.buyer.username ?? ''}`}
        body={toPay
          ? `${debtAmount(toPay).toLocaleString('en-US')} ر.س مقابل ${toPay.product.product_name}`
          : ''}
        confirmLabel="تم الدفع"
        loading={paying}
        onConfirm={confirmPay}
        onCancel={() => setToPay(null)}
      />
    </>
  )
}
