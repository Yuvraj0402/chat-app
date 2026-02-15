'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface CallModalProps {
  isOpen: boolean
  userName: string
  callType: 'voice' | 'video'
  onAccept?: () => void
  onReject?: () => void
  onEnd?: () => void
  isInCall?: boolean
}

export default function CallModal({ isOpen, userName, callType, onAccept, onReject, onEnd, isInCall = false }: CallModalProps) {
  const [duration, setDuration] = useState(0)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 max-w-sm w-full text-center text-white shadow-2xl">
        {/* Avatar */}
        <div className="mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center text-5xl font-bold shadow-lg mx-auto mb-6">
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* User Name */}
        <h2 className="text-3xl font-bold mb-2">{userName}</h2>

        {/* Call Type */}
        <p className="text-slate-300 mb-8">
          {isInCall ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-pulse">●</span>
              {callType === 'video' ? 'Video call' : 'Voice call'} in progress
            </span>
          ) : (
            <span>{callType === 'video' ? 'Incoming video call' : 'Incoming voice call'}</span>
          )}
        </p>

        {/* Call Duration (if in call) */}
        {isInCall && <p className="text-2xl font-mono mb-8">{Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')}</p>}

        {/* Call Icons */}
        <div className="mb-8 flex justify-center gap-8 text-4xl">
          {callType === 'video' && (
            <>
              <span className="animate-bounce">📹</span>
              <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>
                🎤
              </span>
            </>
          )}
          {callType === 'voice' && (
            <>
              <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>
                🎵
              </span>
              <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>
                🎵
              </span>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          {!isInCall ? (
            <>
              <Button
                onClick={onReject}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-full transition-all"
              >
                ✕ Reject
              </Button>
              <Button
                onClick={onAccept}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-full transition-all"
              >
                ✓ Accept
              </Button>
            </>
          ) : (
            <Button
              onClick={onEnd}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-full transition-all"
            >
              ✕ End Call
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
