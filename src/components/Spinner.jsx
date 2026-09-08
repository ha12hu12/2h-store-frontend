export default function Spinner({ className = '' }) {
  return (
    <div
      role="status"
      aria-label="جارٍ التحميل"
      className={`inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin ${className}`}
    />
  )
}
