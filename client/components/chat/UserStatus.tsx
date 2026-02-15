'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface UserStatusProps {
  username: string
  currentStatus?: 'online' | 'away' | 'busy' | 'offline'
}

const statusConfig = {
  online: { label: 'Online', color: 'bg-emerald-500', icon: '●' },
  away: { label: 'Away', color: 'bg-yellow-500', icon: '●' },
  busy: { label: 'Busy', color: 'bg-red-500', icon: '●' },
  offline: { label: 'Offline', color: 'bg-slate-400', icon: '●' },
}

export default function UserStatus({ username, currentStatus = 'online' }: UserStatusProps) {
  const [status, setStatus] = useState<keyof typeof statusConfig>(currentStatus)
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium transition-colors"
      >
        <span className={`${statusConfig[status].color} w-2 h-2 rounded-full animate-pulse`}></span>
        {statusConfig[status].label}
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50 min-w-max">
          {Object.entries(statusConfig).map(([key, value]) => (
            <button
              key={key}
              onClick={() => {
                setStatus(key as keyof typeof statusConfig)
                setIsOpen(false)
              }}
              className={`w-full px-6 py-3 text-left flex items-center gap-3 transition-colors ${
                status === key ? 'bg-emerald-50 text-emerald-700 border-l-4 border-l-emerald-500' : 'hover:bg-slate-50'
              }`}
            >
              <span className={`${value.color} w-2 h-2 rounded-full`}></span>
              <span className="font-medium">{value.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
