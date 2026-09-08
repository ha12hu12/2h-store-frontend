import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Trash2 } from 'lucide-react'
import { api } from '../lib/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../components/Toast.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Spinner from '../components/Spinner.jsx'

export default function MyProducts() {
  const { token } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const data = await api.getMyProducts(token)
      setProducts(data)
    } catch (err) {
      setProducts(err.status === 404 ? [] : products)
      if (err.status !== 404) toast.push(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, []) // eslint-disable-line

  async function confirmDelete() {
    setDeleting(true)
    try {
      await api.deleteProduct(toDelete.product_name, token)
      toast.push(`تم حذف ${toDelete.product_name}`)
      setToDelete(null)
      load()
    } catch (err) {
      toast.push(err.message, 'error')
    } finally {
      setDeleting(false)
    }
  }

  function handleEdit(p) {
    const isPledge = !!p.pledge_shares
    if (isPledge) {
      navigate(`/my-products/${encodeURIComponent(p.product_name)}/edit-pledge`, { state: { product: p } })
    } else {
      navigate(`/my-products/${encodeURIComponent(p.product_name)}/edit`, { state: { product: p } })
    }
  }

  if (loading) return <div className="flex justify-center py-16 text-awning"><Spinner /></div>

  if (products.length === 0) {
    return <EmptyState title="ما عندك منتجات بعد" hint="اضغط على + بالأسفل عشان تضيف أول منتج" />
  }

  return (
    <>
      <div className="flex flex-col gap-2.5">
        {products.map((p) => {
          const isPledge = !!p.pledge_shares
          return (
            <div key={p.id ?? p.product_name}
              className="perforated bg-card/70 border border-stone rounded-2xl p-3 flex gap-3 items-center">
              <div className="w-14 h-14 rounded-xl bg-stone flex-shrink-0 overflow-hidden flex items-center justify-center relative">
                {p.image_url
                  ? <img src={p.image_url} alt={p.product_name} className="w-full h-full object-cover" />
                  : <span className="text-lg">{isPledge ? '💰' : '٠'}</span>}
                {isPledge && (
                  <span className="absolute bottom-0 right-0 text-[8px] bg-mustard/90 text-ink font-bold px-1 rounded-tl-lg">قطة</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold text-sm truncate">{p.product_name}</h3>
                <p className="text-xs text-inkfaint">
                  الكمية: {p.amount}
                  {typeof p.price === 'number' && ` · ${p.price.toLocaleString('en-US')} ر.س`}
                </p>
                {isPledge && p.pledge_shares && (
                  <p className="text-[10px] text-mustarddark mt-0.5">
                    {Object.keys(p.pledge_shares).length} مشارك
                  </p>
                )}
              </div>

              <div className="flex gap-1.5">
                <button
                  onClick={() => handleEdit(p)}
                  className="w-9 h-9 rounded-tag bg-stone flex items-center justify-center text-ink hover:bg-mustard/40 transition"
                  aria-label="تعديل"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => setToDelete(p)}
                  className="w-9 h-9 rounded-tag bg-stone flex items-center justify-center text-brick hover:bg-brickfaint transition"
                  aria-label="حذف"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <ConfirmModal
        open={!!toDelete}
        title={`حذف ${toDelete?.product_name ?? ''}؟`}
        body="ما راح تقدر تتراجع بعد الحذف."
        confirmLabel="حذف"
        danger
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  )
}
