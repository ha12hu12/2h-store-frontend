import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../components/Toast.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Spinner from '../components/Spinner.jsx'

export default function Purchases() {
  const { token, refreshMoney } = useAuth()
  const toast = useToast()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [toCancel, setToCancel] = useState(null)
  const [canceling, setCanceling] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const data = await api.getMyPurchases(token)
      setItems(data)
    } catch (err) {
      setItems(err.status === 404 ? [] : items)
      if (err.status !== 404) toast.push(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, []) // eslint-disable-line

  async function confirmCancel() {
    setCanceling(true)
    try {
      await api.cancelPurchase(toCancel.id, token)
      toast.push('تم إلغاء الشراء')
      setToCancel(null)
      await Promise.all([load(), refreshMoney()])
    } catch (err) {
      toast.push(err.message, 'error')
    } finally {
      setCanceling(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center py-16 text-awning"><Spinner /></div>
  }

  if (items.length === 0) {
    return <EmptyState title="ما اشتريت شي بعد" hint="لما تشتري منتج بيظهر هنا" />
  }

  return (
    <>
      <div className="flex flex-col gap-2.5">
        {items.map((item) => {
          const isPledge = !!item.product.pledge_shares
          // pledge_shares is filtered to only current user's share by backend
          const pledgeAmount = isPledge
            ? Object.values(item.product.pledge_shares ?? {})[0]
            : null
          const displayPrice = pledgeAmount ?? item.product.price

          return (
            <div key={item.id}
              className="perforated bg-card/70 border border-stone rounded-2xl p-3 flex gap-3 items-center">
              <div className="w-14 h-14 rounded-xl bg-stone flex-shrink-0 overflow-hidden flex items-center justify-center relative">
                {item.product.image_url ? (
                  <img src={item.product.image_url} alt={item.product.product_name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg">{isPledge ? '💰' : '٠'}</span>
                )}
                {isPledge && (
                  <span className="absolute bottom-0 right-0 text-[8px] bg-mustard/90 text-ink font-bold px-1 rounded-tl-lg">قطة</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold text-sm truncate">{item.product.product_name}</h3>
                <p className="text-xs text-inkfaint">
                  من {item.product.owner.username}
                  {isPledge && pledgeAmount != null
                    ? ` · حصتك ${pledgeAmount.toLocaleString('en-US')} ر.س`
                    : ` · ${item.product.price.toLocaleString('en-US')} ر.س`}
                </p>
              </div>

              {item.status ? (
                <span className="stamp text-awning text-[11px]">مدفوع</span>
              ) : (
                <button onClick={() => setToCancel(item)}
                  className="text-xs font-medium text-brick bg-brickfaint rounded-tag px-2.5 py-1.5 hover:bg-brick hover:text-white transition">
                  إلغاء
                </button>
              )}
            </div>
          )
        })}
      </div>

      <ConfirmModal
        open={!!toCancel}
        title="تلغي هذا الشراء؟"
        body="بيرجع المنتج للمخزون وبيرجعلك المبلغ لرصيدك."
        confirmLabel="إلغاء الشراء"
        danger
        loading={canceling}
        onConfirm={confirmCancel}
        onCancel={() => setToCancel(null)}
      />
    </>
  )
}
