import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../components/Toast.jsx'
import ProductCard from '../components/ProductCard.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Spinner from '../components/Spinner.jsx'

export default function Home() {
  const { token, username, refreshMoney } = useAuth()
  const toast = useToast()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  // regular buy
  const [confirmProduct, setConfirmProduct] = useState(null)
  const [buying, setBuying] = useState(false)

  // pledge
  const [confirmPledge, setConfirmPledge] = useState(null)
  const [pledging, setPledging] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const data = await api.getProducts(token)
      setProducts(data)
    } catch (err) {
      setProducts(err.status === 404 ? [] : products)
      if (err.status !== 404) toast.push(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, []) // eslint-disable-line

  async function confirmBuy() {
    setBuying(true)
    try {
      await api.buyProduct(confirmProduct.id, token)
      toast.push(`تم شراء ${confirmProduct.product_name}`)
      setConfirmProduct(null)
      await Promise.all([load(), refreshMoney()])
    } catch (err) {
      toast.push(err.message, 'error')
    } finally {
      setBuying(false)
    }
  }

  async function confirmPledgeAction() {
    setPledging(true)
    try {
      await api.pledgeProduct(confirmPledge.id, token)
      toast.push(`تم اشتراكك في قطة ${confirmPledge.product_name} 💰`)
      setConfirmPledge(null)
      await Promise.all([load(), refreshMoney()])
    } catch (err) {
      toast.push(err.message, 'error')
    } finally {
      setPledging(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center py-16 text-awning"><Spinner /></div>
  }

  if (products.length === 0) {
    return <EmptyState title="الرف فاضي" hint="ما فيه منتجات معروضة حاليًا" />
  }

  const myShare = (p) =>
    p.pledge_shares ? Object.values(p.pledge_shares)[0] : null

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {products.map((p) => {
          const isOwn = p.owner?.username === username
          const isPledge = !!p.pledge_shares
          return (
            <ProductCard
              key={p.id}
              product={p}
              isOwn={isOwn}
              currentUsername={username}
              buying={buying && confirmProduct?.id === p.id}
              pledging={pledging && confirmPledge?.id === p.id}
              onBuy={() => setConfirmProduct(p)}
              onPledge={() => setConfirmPledge(p)}
            />
          )
        })}
      </div>

      {/* regular buy modal */}
      <ConfirmModal
        open={!!confirmProduct}
        title={`شراء ${confirmProduct?.product_name ?? ''}؟`}
        body={confirmProduct
          ? `بسعر ${confirmProduct.price.toLocaleString('en-US')} ر.س، بينخصم من رصيدك مباشرة.`
          : ''}
        confirmLabel="تأكيد الشراء"
        loading={buying}
        onConfirm={confirmBuy}
        onCancel={() => setConfirmProduct(null)}
      />

      {/* pledge modal */}
      <ConfirmModal
        open={!!confirmPledge}
        title={`قط في ${confirmPledge?.product_name ?? ''}؟`}
        body={confirmPledge
          ? `حصتك ${myShare(confirmPledge)?.toLocaleString('en-US')} ر.س، بتنخصم من رصيدك.`
          : ''}
        confirmLabel="قط معنا 💰"
        loading={pledging}
        onConfirm={confirmPledgeAction}
        onCancel={() => setConfirmPledge(null)}
      />
    </>
  )
}
