export default function EmptyState({ title, hint, action }) {
  return (
    <div className="text-center py-16 px-6">
      <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-stone flex items-center justify-center text-2xl">
        ٠
      </div>
      <p className="font-display font-bold text-base mb-1">{title}</p>
      {hint && <p className="text-sm text-inkfaint mb-4">{hint}</p>}
      {action}
    </div>
  )
}
