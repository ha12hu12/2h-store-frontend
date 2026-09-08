import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Moon, Sun, Sunset } from 'lucide-react'
import { api } from '../lib/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { useToast } from '../components/Toast.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import Spinner from '../components/Spinner.jsx'

export default function Settings() {
  const auth = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-6 pb-6">
      <AppearanceSection />
      <UsernameSection />
      <PasswordSection />
      <MoneySection />

      <div className="border-t border-stone pt-5">
        <button
          onClick={() => {
            auth.logout()
            navigate('/login')
          }}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-tag bg-stone text-ink font-medium text-sm hover:bg-stone/70 transition"
        >
          <LogOut size={16} />
          تسجيل الخروج
        </button>
      </div>

      <DeleteAccountSection />
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="font-display font-bold text-sm mb-2.5">{title}</h3>
      {children}
    </div>
  )
}

function AppearanceSection() {
  const { theme, cycleTheme } = useTheme()

  const modes = {
    light: { label: 'نهاري',  icon: <Sun size={16} /> },
    dim:   { label: 'خافت',   icon: <Sunset size={16} /> },
    dark:  { label: 'ليلي',   icon: <Moon size={16} /> },
  }
  const current = modes[theme] ?? modes.light

  return (
    <Section title="المظهر">
      <button
        onClick={cycleTheme}
        className="w-full flex items-center justify-between rounded-tag border border-stone bg-card px-3.5 py-3 text-sm hover:border-awning transition"
      >
        <span className="flex items-center gap-2 font-medium">
          {current.icon}
          {current.label}
        </span>
        <div className="flex gap-1">
          {['light', 'dim', 'dark'].map((m) => (
            <span key={m} className={`w-2.5 h-2.5 rounded-full border transition-colors ${
              theme === m ? 'bg-awning border-awning' : 'bg-stone border-stone'
            }`} />
          ))}
        </div>
      </button>
      <p className="text-[11px] text-inkfaint mt-1.5 text-center">
        اضغط للتبديل: نهاري ← خافت ← ليلي
      </p>
    </Section>
  )
}

function UsernameSection() {
  const auth = useAuth()
  const toast = useToast()
  const [value, setValue] = useState(auth.username || '')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await api.updateUsername(value, auth.token)
      auth.renameLocally(value)
      toast.push('تم تعديل اسم المستخدم')
    } catch (err) {
      toast.push(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Section title="اسم المستخدم">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
          className="input flex-1"
        />
        <button
          type="submit"
          disabled={loading || value === auth.username}
          className="px-4 rounded-tag bg-awning text-white text-sm font-bold hover:bg-awningdark transition disabled:opacity-50"
        >
          {loading ? <Spinner /> : 'حفظ'}
        </button>
      </form>
    </Section>
  )
}

function PasswordSection() {
  const auth = useAuth()
  const toast = useToast()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await api.updatePassword(current, next, auth.token)
      toast.push('تم تغيير كلمة المرور')
      setCurrent('')
      setNext('')
    } catch (err) {
      toast.push(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Section title="كلمة المرور">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input
          type="password"
          placeholder="كلمة المرور الحالية"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          required
          className="input"
        />
        <input
          type="password"
          placeholder="كلمة المرور الجديدة"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          required
          className="input"
        />
        <button
          type="submit"
          disabled={loading}
          className="py-2.5 rounded-tag bg-awning text-white text-sm font-bold hover:bg-awningdark transition disabled:opacity-50"
        >
          {loading ? <Spinner /> : 'تغيير كلمة المرور'}
        </button>
      </form>
    </Section>
  )
}

function MoneySection() {
  const auth = useAuth()
  const toast = useToast()
  const [value, setValue] = useState(auth.money ?? '')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const num = Number(value)
      await api.updateMoney(num, auth.token)
      auth.setMoney(num)
      toast.push('تم تعديل رصيدك')
    } catch (err) {
      toast.push(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Section title="رصيدك">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="number"
          step="any"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
          className="input flex-1"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 rounded-tag bg-awning text-white text-sm font-bold hover:bg-awningdark transition disabled:opacity-50"
        >
          {loading ? <Spinner /> : 'حفظ'}
        </button>
      </form>
      <p className="text-xs text-inkfaint mt-1.5">
        عدّل رصيدك يدويًا بعد ما تسدد فلوسك بالواقع.
      </p>
    </Section>
  )
}

function DeleteAccountSection() {
  const auth = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function confirmDelete() {
    setLoading(true)
    try {
      await api.deleteAccount(auth.token)
      auth.logout()
      navigate('/login')
    } catch (err) {
      toast.push(err.message, 'error')
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-brick font-medium hover:underline self-start"
      >
        حذف الحساب نهائيًا
      </button>

      <ConfirmModal
        open={open}
        title="تحذف حسابك نهائيًا؟"
        body="كل بياناتك ومنتجاتك بتنحذف، وما راح تقدر تتراجع."
        confirmLabel="حذف الحساب"
        danger
        loading={loading}
        onConfirm={confirmDelete}
        onCancel={() => setOpen(false)}
      />
    </>
  )
}
