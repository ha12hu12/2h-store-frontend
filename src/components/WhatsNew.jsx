import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

const STORAGE_KEY = '2h-store-seen-v3'

export default function WhatsNew() {
  const [open, setOpen] = useState(false)
  const [isNew, setIsNew] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setIsNew(true)
  }, [])

  function openModal() {
    setOpen(true)
    setIsNew(false)
    localStorage.setItem(STORAGE_KEY, '1')
  }

  return (
    <>
      <button
        onClick={openModal}
        className="flex items-center gap-1 text-xs font-medium text-inkfaint hover:text-ink transition"
      >
        <span className="font-mono font-semibold text-awning text-[11px]">
          v3
        </span>

        {isNew && (
          <span className="inline-flex items-center bg-brick text-white text-[9px] font-bold px-1.5 py-px rounded-full leading-none">
            جديد
          </span>
        )}

        <span className="text-[11px] text-inkfaint">
          ما الجديد؟
        </span>
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <div
              className="relative bg-paper w-full max-w-xl rounded-t-3xl px-5 pt-5 pb-8 shadow-2xl rise-in max-h-[75vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-stone rounded-full mx-auto mb-4 flex-shrink-0" />

              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 left-4 text-inkfaint hover:text-ink transition"
              >
                <X size={20} />
              </button>

              <h2 className="font-display font-bold text-base mb-4 text-center flex-shrink-0">
                سجل التحديثات
              </h2>

              <div className="overflow-y-auto flex flex-col gap-4 pb-2">

                {/* v3 */}
                <div className="bg-awning/10 border border-awning/25 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono font-bold text-awning text-sm">
                      2h-store v3
                    </span>

                    <span className="text-[10px] bg-awning text-white font-bold px-2 py-0.5 rounded-full">
                      الأحدث
                    </span>
                  </div>

                  <p className="text-sm text-ink leading-relaxed font-medium">
                    🔔 تمت إضافة ميزة الإشعارات
                  </p>

                  <p className="text-xs text-inkfaint mt-1.5 leading-relaxed">
                    من قائمة الإعدادات  اكبس: تفعيل الإشعارات، فَعّلها  الآن! لتكون أول من يعلم بأحدث العروض، وتتابع حالة طلباتك في المتجر لحظة بلحظة.
                  </p>
                </div>

                {/* v2 */}
                <div className="bg-awning/10 border border-awning/25 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono font-bold text-awning text-sm">
                      2h-store v2
                    </span>

                    <span className="text-[10px] bg-awning text-white font-bold px-2 py-0.5 rounded-full">
                      تحديث
                    </span>
                  </div>

                  <p className="text-sm text-ink leading-relaxed font-medium">
                    🆕 ميزة جديدة من مقترحاتكم: القَطّة 💰
                  </p>

                  <p className="text-xs text-inkfaint mt-1.5 leading-relaxed">
                    من صفحة إنشاء منتج، ستجد في الأعلى زرًا ينقلك إلى صفحة
                    إنشاء قَطّة. حدد المبلغ الكامل، واختر الأشخاص المشاركين،
                    ثم حدد كم سيقط كل شخص، وأضف باقي تفاصيل المنتج. انشر
                    القَطّة وخلي التجميع يبدأ 🤑
                  </p>

                  <p className="text-xs text-inkfaint mt-2 leading-relaxed border-t border-awning/20 pt-2">
                    🎨 وضع جديد في الإعدادات:{' '}
                    <strong className="text-ink">الخافت</strong> — درجة بين
                    النهاري والليلي، أقل إجهادًا للعين في الإضاءة المنخفضة.
                  </p>
                </div>

                {/* v1 */}
                <div className="bg-stone/40 rounded-2xl p-4">
                  <span className="font-mono font-bold text-inkfaint text-sm">
                    2h-store v1
                  </span>

                  <p className="text-xs text-inkfaint mt-1.5 leading-relaxed">
                    الأساسيات: إضافة المنتجات، حذفها وتعديلها، شراء المنتجات،
                    تحصيل الديون، حذف المشتريات، تغيير إعدادات الحساب وغيرها.
                  </p>
                </div>

              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}