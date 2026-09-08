import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { ArrowRight, ImagePlus, X } from 'lucide-react'
import { api } from '../lib/api.js'
import { uploadImage } from '../lib/cloudinary.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../components/Toast.jsx'
import Spinner from '../components/Spinner.jsx'

const EMPTY = { product_name: '', description: '', amount: '', price: '', image_url: '' }

export default function ProductForm({ mode }) {
  const { token } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const { name: originalName } = useParams()
  const location = useLocation()

  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(mode === 'edit' && !location.state?.product)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (mode !== 'edit') return
    if (location.state?.product) {
      const p = location.state.product
      setForm({
        product_name: p.product_name ?? '',
        description: p.description ?? '',
        amount: p.amount ?? '',
        price: p.price ?? '',
        image_url: p.image_url ?? '',
      })
      return
    }
    api.getMyProducts(token)
      .then((list) => {
        const p = list.find((x) => x.product_name === originalName)
        if (p) {
          setForm({
            product_name: p.product_name ?? '',
            description: p.description ?? '',
            amount: p.amount ?? '',
            price: p.price ?? '',
            image_url: p.image_url ?? '',
          })
        } else {
          setError('ما لقيت هذا المنتج')
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [mode]) // eslint-disable-line

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleFileSelect(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage(file)
      update('image_url', url)
      toast.push('تم رفع الصورة')
    } catch (err) {
      toast.push(err.message, 'error')
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const payload = {
        product_name: form.product_name,
        description: form.description || undefined,
        amount: Number(form.amount),
        price: Number(form.price),
        image_url: form.image_url || undefined,
      }
      if (mode === 'create') {
        await api.createProduct(payload, token)
        toast.push(`تمت إضافة ${form.product_name}`)
      } else {
        await api.updateProduct(originalName, payload, token)
        toast.push('تم تعديل المنتج')
      }
      navigate('/my-products')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center py-16 text-awning"><Spinner /></div>
  }

  return (
    <div className="rise-in">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-inkfaint mb-4 hover:text-ink transition"
      >
        <ArrowRight size={16} />
        رجوع
      </button>

      {/* pledge shortcut — only on create */}
      {mode === 'create' && (
        <button
          type="button"
          onClick={() => navigate('/my-products/new-pledge')}
          className="w-full mb-5 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-mustard/60 text-mustarddark text-sm font-bold hover:bg-mustard/8 active:scale-[0.98] transition"
        >
          <span className="text-base">💰</span>
          إنشاء قَطّة بدلاً من هذا
        </button>
      )}

      <h2 className="font-display font-bold text-lg mb-4">
        {mode === 'create' ? 'منتج جديد' : 'تعديل المنتج'}
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Field label="اسم المنتج">
          <input type="text" required value={form.product_name}
            onChange={(e) => update('product_name', e.target.value)} className="input" />
        </Field>

        <Field label="الوصف (اختياري)">
          <textarea rows={3} value={form.description}
            onChange={(e) => update('description', e.target.value)} className="input resize-none" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="الكمية">
            <input type="number" min="0" required value={form.amount}
              onChange={(e) => update('amount', e.target.value)} className="input" />
          </Field>
          <Field label="السعر (ر.س)">
            <input type="number" min="0" step="0.01" required value={form.price}
              onChange={(e) => update('price', e.target.value)} className="input" />
          </Field>
        </div>

        <Field label="صورة المنتج (اختياري)">
          <div className="flex flex-col gap-2.5">
            {form.image_url && (
              <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-stone">
                <img src={form.image_url} alt="" className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none' }} />
                <button type="button" onClick={() => update('image_url', '')}
                  aria-label="إزالة الصورة"
                  className="absolute top-1 left-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center">
                  <X size={13} />
                </button>
              </div>
            )}
            <label className="inline-flex items-center gap-2 w-fit px-3.5 py-2.5 rounded-tag border border-stone bg-card text-sm font-medium cursor-pointer hover:border-awning transition">
              {uploading ? <Spinner /> : <ImagePlus size={16} />}
              {uploading ? 'جارٍ الرفع...' : 'ارفع صورة من جهازك'}
              <input type="file" accept="image/*" onChange={handleFileSelect} disabled={uploading} className="hidden" />
            </label>
            <input type="url" placeholder="أو الصق رابط صورة جاهز" value={form.image_url}
              onChange={(e) => update('image_url', e.target.value)} className="input" />
          </div>
        </Field>

        {error && (
          <p className="text-brick text-sm text-center bg-brickfaint rounded-tag py-2 px-3">{error}</p>
        )}

        <button type="submit" disabled={saving}
          className="mt-2 w-full py-3 rounded-tag bg-awning text-white font-bold text-sm hover:bg-awningdark active:scale-[0.98] transition disabled:opacity-60 flex items-center justify-center gap-2">
          {saving && <Spinner />}
          {mode === 'create' ? 'إضافة المنتج' : 'حفظ التعديلات'}
        </button>
      </form>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-inkfaint text-xs">{label}</span>
      {children}
    </label>
  )
}
