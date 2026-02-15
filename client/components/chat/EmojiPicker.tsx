'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
  onClose: () => void
}

const EMOJI_CATEGORIES = {
  Smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙'],
  Gestures: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🫰', '🤟', '🤘', '🤙', '👍', '👎', '👊', '✊', '👏', '🙌'],
  Hearts: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '💌'],
  Objects: ['🎈', '🎉', '🎊', '🎁', '🎀', '🎂', '🍕', '🍔', '🍟', '🍗', '🍜', '☕', '🍺', '🍷', '🎮', '🎭', '🎪', '🎨', '🎬', '📱'],
  Nature: ['🌈', '☀️', '🌙', '⭐', '✨', '🌟', '⚡', '🔥', '💧', '🌊', '🌺', '🌸', '🌼', '🌻', '🌷', '🌹', '🦋', '🐝', '🐞', '🦗'],
}

export default function EmojiPicker({ onEmojiSelect, onClose }: EmojiPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState('Smileys')

  const emojis = EMOJI_CATEGORIES[selectedCategory as keyof typeof EMOJI_CATEGORIES] || []

  return (
    <div className="absolute bottom-20 right-0 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 w-80">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Pick an emoji</h3>
        <div className="flex gap-2 flex-wrap">
          {Object.keys(EMOJI_CATEGORIES).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-sm transition-all ${selectedCategory === category
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2 mb-4 max-h-64 overflow-y-auto">
        {emojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => {
              onEmojiSelect(emoji)
              // Don't close - let user add multiple emojis
            }}
            className="text-2xl hover:bg-slate-100 rounded-lg p-2 transition-all hover:scale-110"
          >
            {emoji}
          </button>
        ))}
      </div>

      <Button
        onClick={onClose}
        className="w-full bg-slate-100 text-slate-900 hover:bg-slate-200 rounded-full"
      >
        Close
      </Button>
    </div>
  )
}
