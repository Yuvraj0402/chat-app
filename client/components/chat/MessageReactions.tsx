'use client'

interface MessageReactionsProps {
  reactions?: { [key: string]: string[] }
  onReact?: (emoji: string) => void
}

const reactionEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡']

export default function MessageReactions({ reactions, onReact }: MessageReactionsProps) {
  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {reactionEmojis.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onReact?.(emoji)}
          className="text-xs px-2 py-1 rounded-full bg-slate-100 hover:bg-emerald-100 transition-colors"
          title={`React with ${emoji}`}
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}
