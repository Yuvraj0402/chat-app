'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface FeaturesGuideProps {
  isOpen: boolean
  onClose: () => void
}

export default function FeaturesGuide({ isOpen, onClose }: FeaturesGuideProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto border border-emerald-100">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-slate-900">Chat Features</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 text-2xl font-light"
          >
            ×
          </button>
        </div>

        {/* Features Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/chat/profile">
            <div className="p-4 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all cursor-pointer">
              <div className="text-3xl mb-2">👤</div>
              <h3 className="font-semibold text-slate-900 mb-1">View Profile</h3>
              <p className="text-xs text-slate-600">Edit your profile and see your stats</p>
            </div>
          </Link>

          <Link href="/chat/settings">
            <div className="p-4 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all cursor-pointer">
              <div className="text-3xl mb-2">⚙️</div>
              <h3 className="font-semibold text-slate-900 mb-1">Settings</h3>
              <p className="text-xs text-slate-600">Customize notifications and privacy</p>
            </div>
          </Link>

          <div className="p-4 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all">
            <div className="text-3xl mb-2">💬</div>
            <h3 className="font-semibold text-slate-900 mb-1">Real-time Chat</h3>
            <p className="text-xs text-slate-600">Send and receive messages instantly</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all">
            <div className="text-3xl mb-2">🔍</div>
            <h3 className="font-semibold text-slate-900 mb-1">Search Users</h3>
            <p className="text-xs text-slate-600">Find and start new conversations</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all">
            <div className="text-3xl mb-2">ℹ️</div>
            <h3 className="font-semibold text-slate-900 mb-1">User Info</h3>
            <p className="text-xs text-slate-600">View detailed conversation info</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all">
            <div className="text-3xl mb-2">📱</div>
            <h3 className="font-semibold text-slate-900 mb-1">Responsive Design</h3>
            <p className="text-xs text-slate-600">Beautiful on desktop and mobile</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all">
            <div className="text-3xl mb-2">🎨</div>
            <h3 className="font-semibold text-slate-900 mb-1">Modern UI</h3>
            <p className="text-xs text-slate-600">Beautiful gradients and animations</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all">
            <div className="text-3xl mb-2">🔔</div>
            <h3 className="font-semibold text-slate-900 mb-1">Notifications</h3>
            <p className="text-xs text-slate-600">Stay updated with notifications</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50">
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-full py-3"
          >
            Got It! Continue Chatting
          </Button>
        </div>
      </div>
    </div>
  )
}
