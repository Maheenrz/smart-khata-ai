export default function AitbaarScoreBadge({ score }) {
  const config = score >= 70
    ? { dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Acha — اچھا' }
    : score >= 40
    ? { dot: 'bg-orange-400', text: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', label: 'Theek — ٹھیک' }
    : { dot: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', label: 'Kharab — خراب' }

  return (
    <div className="inline-flex flex-col items-center gap-0.5">
      <div className={`${config.bg} ${config.border} border rounded-full px-3 py-1 flex items-center gap-1.5`}>
        <div className={`w-2 h-2 rounded-full ${config.dot}`} />
        <span className={`${config.text} font-semibold text-sm`}>{score}</span>
      </div>
      <span className="text-gray-400 text-[10px]">{config.label}</span>
    </div>
  )
}