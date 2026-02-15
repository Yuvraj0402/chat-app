'use client'

export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-2">
      <div className="text-xs text-slate-600">Someone is typing</div>
      <div className="flex gap-1">
        <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></span>
        <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce delay-100"></span>
        <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce delay-200"></span>
      </div>
    </div>
  )
}
