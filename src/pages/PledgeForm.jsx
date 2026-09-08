import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { ArrowRight, ImagePlus, X, Users } from 'lucide-react'
import { api } from '../lib/api.js'
import { uploadImage } from '../lib/cloudinary.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../components/Toast.jsx'
import Spinner from '../components/Spinner.jsx'

const EMPTY = { product_name: '', description: '', amount: '1', price: '', image_url: '' }

export default function PledgeForm({ mode = 'create' }) {
  const { token } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const { name: originalName } = useParams()
  const location = useLocation()

  const [form, setForm] = useState(EMPTY)
  const [users, setUsers] = useState([])
  const [shares, setShares] = useState({})
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // pre-fill if editing
    const p = location.state?.product
    if (p) {
      setForm({
        product_name: p.product_name ?? '',
        description: p.description ?? '',
        amount: p.amount ?? '1',
        price: p.price ?? '',
        image_url: p.image_url ?? '',
      })
      if (p.pledge_shares && !p.pledge_shares.message) {
        // pre-fill shares from existing pledge_shares
        const initial = {}
        Object.entries(p.pledge_shares).forEach(([u, v]) => {
          initial[u] = String(v)
        })
        setShares(initial)
      }
    }

    api.getAllUsers(token)
      .then(setUsers)
      .catch(() => toast.push('ما قدرنا نحمّل قائمة المستخدمين', 'error'))
      .finally(() => setLoadingUsers(false))
  }, []) // eslint-disable-line

  function update(field, value) { setForm((f) => ({ ...f, [field]: value })) }
  function updateShare(username, value) { setShares((s) => ({ ...s, [username]: value })) }

  const totalShares = Object.values(shares).reduce((sum, v) => sum + (parseFloat(v) || 0), 0)
  const priceNum = parseFloat(form.price) || 0
  const pct = priceNum > 0 ? Math.min(100, (totalShares / priceNum) * 100) : 0

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

    const pledge_shares = {}
    for (const [uname, val] of Object.entries(shares)) {
      const num = parseFloat(val)
      if (!isNaN(num) && num > 0) pledge_shares[uname] = num
    }

    if (Object.keys(pledge_shares).length === 0) {
      setError('لازم تحدد نصيب واحد على الأقل')
      return
    }
    if (priceNum <= 0) {
      setError('السعر لازم يكون أكبر من صفر')
      return
    }
    if (totalShares > priceNum) {
      setError(`مجموع الأنصبة (${totalShares.toLocaleString('en-US')} ر.س) أكبر من السعر (${priceNum.toLocaleString('en-US')} ر.س)`)
      return
    }

    setSaving(true)
    try {
      const payload = {
        product_name: form.product_name,
        description: form.description || undefined,
        amount: Number(form.amount) || 1,
        price: priceNum,
        image_url: form.image_url || undefined,
        pledge_shares,
      }

      if (mode === 'edit') {
        await api.updateProduct(originalName, payload, token)
        toast.push('تم تعديل القطة, المستخدمين الذين دفعوا حصتهم لن يتم تعديلهم')
      } else {
        await api.createProduct(payload, token)
        toast.push(`تم إنشاء قطة "${form.product_name}" 💰`)
      }
      navigate('/my-products')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rise-in">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-inkfaint mb-4 hover:text-ink transition">
        <ArrowRight size={16} /> رجوع
      </button>

      <div className="flex items-center gap-2 mb-5">
        <span className="text-2xl">💰</span>
        <h2 className="font-display font-bold text-lg">
          {mode === 'edit' ? 'تعديل القطة' : 'إنشاء قَطّة'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* product info */}
        <div className="bg-card/70 border border-stone rounded-2xl p-4 flex flex-col gap-3">
          <p className="text-xs font-medium text-inkfaint mb-1">تفاصيل المنتج</p>

          <Field label="اسم المنتج">
            <input type="text" required value={form.product_name}
              onChange={(e) => update('product_name', e.target.value)}
              className="input" placeholder="مثال: سيارة كبيرة" />
          </Field>

          <Field label="الوصف (اختياري)">
            <textarea rows={2} value={form.description}
              onChange={(e) => update('description', e.target.value)}
              className="input resize-none" placeholder="وصف قصير..." />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="المبلغ الكامل (ر.س)">
              <input type="number" min="0.01" step="any" required value={form.price}
                onChange={(e) => update('price', e.target.value)}
                className="input" placeholder="0.00" />
            </Field>
            <Field label="الكمية">
              <input type="number" min="1" required value={form.amount}
                onChange={(e) => update('amount', e.target.value)} className="input" />
            </Field>
          </div>

          <Field label="صورة (اختياري)">
            <div className="flex flex-col gap-2">
              {form.image_url && (
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-stone">
                  <img src={form.image_url} alt="" className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none' }} />
                  <button type="button" onClick={() => update('image_url', '')}
                    className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center">
                    <X size={11} />
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-tag border border-stone bg-card text-xs font-medium cursor-pointer hover:border-awning transition">
                  {uploading ? <Spinner /> : <ImagePlus size={14} />}
                  {uploading ? 'جارٍ...' : 'رفع صورة'}
                  <input type="file" accept="image/*" onChange={handleFileSelect} disabled={uploading} className="hidden" />
                </label>
                <input type="url" placeholder="أو رابط صورة" value={form.image_url}
                  onChange={(e) => update('image_url', e.target.value)} className="input flex-1 text-xs" />
              </div>
            </div>
          </Field>
        </div>

        {/* pledge shares */}
        <div className="bg-card/70 border border-stone rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users size={15} className="text-awning" />
            <p className="text-xs font-medium text-inkfaint">أنصبة المشاركين</p>
          </div>

          {loadingUsers ? (
            <div className="flex justify-center py-4 text-awning"><Spinner /></div>
          ) : (
            <div className="flex flex-col gap-2">
              {users.map((u) => (
                <div key={u.id} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-awning/10 text-awning flex-shrink-0 flex items-center justify-center font-display font-bold text-xs">
                    {u.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="flex-1 text-sm font-medium">{u.username}</span>
                  <div className="relative w-28">
                    <input type="number" min="0" step="any"
                      value={shares[u.username] ?? ''}
                      onChange={(e) => updateShare(u.username, e.target.value)}
                      placeholder="0"
                      className="input w-full text-sm pr-3 pl-9" />
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-inkfaint pointer-events-none">ر.س</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* total indicator */}
          {priceNum > 0 && (
            <div className="mt-3 pt-3 border-t border-stone">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-inkfaint">المجموع</span>
                <span className={`font-mono font-bold ${totalShares > priceNum ? 'text-brick' : totalShares === priceNum ? 'text-awning' : 'text-mustard'}`}>
                  {totalShares.toLocaleString('en-US')} / {priceNum.toLocaleString('en-US')} ر.س
                </span>
              </div>
              <div className="w-full bg-stone rounded-full h-1.5">
                <div className={`h-1.5 rounded-full transition-all ${totalShares > priceNum ? 'bg-brick' : totalShares === priceNum ? 'bg-awning' : 'bg-mustard'}`}
                  style={{ width: `${pct}%` }} />
              </div>
              {totalShares === priceNum && (
                <p className="text-[10px] text-awning mt-1">✓ مكتمل — جاهز للنشر</p>
              )}
            </div>
          )}
        </div>

        {error && (
          <p className="text-brick text-sm text-center bg-brickfaint rounded-tag py-2 px-3">{error}</p>
        )}

        <button type="submit" disabled={saving}
          className="mt-1 w-full py-3 rounded-tag bg-awning text-white font-bold text-sm hover:bg-awningdark active:scale-[0.98] transition disabled:opacity-60 flex items-center justify-center gap-2">
          {saving && <Spinner />}
          {mode === 'edit' ? 'حفظ التعديلات' : 'انشر القَطّة 💰'}
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
