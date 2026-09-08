// src/components/ProductCard.jsx

function parsePledge(pledge_shares, username, isOwn) {
  if (!pledge_shares) return { kind: 'regular' }
  if (pledge_shares.message) return { kind: 'locked' }

  if (isOwn) {
    const participants = Object.entries(pledge_shares)
    const myShare = pledge_shares[username] ?? null
    return { kind: 'owner', participants, myShare }
  }

  const myShare = Object.values(pledge_shares)[0]
  return { kind: 'participant', myShare }
}

export default function ProductCard({ product, isOwn, currentUsername, onBuy, onPledge, buying, pledging }) {
  const outOfStock = product.amount <= 0
  const pledge = parsePledge(product.pledge_shares, currentUsername, isOwn)
  const isPledgeProduct = pledge.kind !== 'regular'

  return (
    <div className="bg-card/70 border border-stone rounded-2xl overflow-hidden flex flex-col">

      {/* image */}
      <div className={`aspect-square bg-stone flex items-center justify-center relative ${outOfStock ? 'grayscale opacity-60' : ''}`}>
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.product_name}
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        ) : (
          <span className="text-3xl select-none">{isPledgeProduct ? '💰' : '٠'}</span>
        )}

        {isPledgeProduct && (
          <span className="absolute top-2 right-2 text-[10px] font-bold bg-mustard/90 text-ink px-2 py-0.5 rounded-full">
            قطة
          </span>
        )}

        {pledge.kind === 'locked' && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <span className="text-white text-[11px] font-bold bg-black/50 px-2 py-1 rounded-lg">
              🔒 مو من المشاركين
            </span>
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col gap-1 flex-1">
        <h3 className="font-display font-bold text-sm leading-snug line-clamp-1">
          {product.product_name}
        </h3>

        {/* owner name — faint */}
        {product.owner?.username && (
          <p className="text-[10px] text-inkfaint leading-none">
            {product.owner.username}
          </p>
        )}

        {product.description && (
          <p className="text-xs text-inkfaint line-clamp-2 flex-1 mt-0.5">
            {product.description}
          </p>
        )}

        {/* pledge progress bar — visible to owner only */}
        {pledge.kind === 'owner' && (() => {
          const total = pledge.participants.reduce((s, [, v]) => s + v, 0)
          const paid  = Math.max(0, total - product.price)
          const pct   = total > 0 ? Math.min(100, (paid / total) * 100) : 0
          return (
            <div className="mt-1.5">
              <div className="w-full bg-stone rounded-full h-1.5 mb-1">
                <div
                  className="h-1.5 rounded-full bg-awning transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-awning">{paid.toLocaleString('en-US')} ر.س دُفع</span>
                <span className="text-inkfaint">باقي {product.price.toLocaleString('en-US')} ر.س</span>
              </div>
            </div>
          )
        })()}

        <div className="flex items-center justify-between mt-1.5 gap-1.5">

          {/* price tag */}
          <span className="price-tag bg-mustard/15 text-mustarddark text-xs shrink-0">
            {pledge.kind === 'participant'
              ? `${pledge.myShare.toLocaleString('en-US')} ر.س`
              : `${product.price.toLocaleString('en-US')} ر.س`}
          </span>

          {/* action button */}
          {outOfStock ? (
            <span className="text-xs font-medium text-inkfaint">غير متوفر</span>
          ) : pledge.kind === 'locked' ? (
            <span className="text-xs font-medium text-inkfaint">قطة مغلقة</span>
          ) : pledge.kind === 'participant' ? (
            <button
              onClick={onPledge}
              disabled={pledging}
              className="text-xs font-bold bg-mustard text-ink rounded-tag px-2.5 py-1.5 hover:bg-mustarddark active:scale-95 transition disabled:opacity-60 whitespace-nowrap"
            >
              {pledging ? 'جارٍ...' : 'قط معنا 💰'}
            </button>
          ) : pledge.kind === 'owner' && pledge.myShare != null ? (
            <button
              onClick={onPledge}
              disabled={pledging}
              className="text-xs font-bold bg-mustard text-ink rounded-tag px-2.5 py-1.5 hover:bg-mustarddark active:scale-95 transition disabled:opacity-60 whitespace-nowrap"
            >
              {pledging ? 'جارٍ...' : 'قط 💰'}
            </button>
          ) : pledge.kind === 'owner' ? (
            <span className="text-xs font-medium text-inkfaint">قطتك</span>
          ) : (
            <button
              onClick={onBuy}
              disabled={buying}
              className="text-xs font-bold bg-awning text-white rounded-tag px-3 py-1.5 hover:bg-awningdark active:scale-95 transition disabled:opacity-60"
            >
              {buying ? 'جارٍ...' : 'شراء'}
            </button>
          )}

        </div>
      </div>
    </div>
  )
}
