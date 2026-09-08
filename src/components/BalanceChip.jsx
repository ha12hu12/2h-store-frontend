export default function BalanceChip({ money }) {
  const known = typeof money === 'number'
  const negative = known && money < 0

  return (
    <div
      className={`price-tag ${
        !known
          ? 'bg-stone text-inkfaint'
          : negative
          ? 'bg-brickfaint text-brick'
          : 'bg-awning/10 text-awning'
      }`}
      style={{ transform: 'rotate(-1.5deg)' }}
      title={negative ? 'عليك ديون' : 'رصيدك'}
    >
      <span className="text-xs font-body font-medium opacity-70">رصيدك</span>
      <span>{known ? `${money.toLocaleString('en-US')} ر.س` : '—'}</span>
    </div>
  )
}
