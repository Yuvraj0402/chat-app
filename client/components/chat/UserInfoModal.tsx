'use client'

import { User } from '@/lib/auth'
import { Button } from '@/components/ui/button'

interface UserInfoModalProps {
  user: User
  isOpen: boolean
  onClose: () => void
}

export default function UserInfoModal({ user, isOpen, onClose }: UserInfoModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full border border-emerald-100 dark:border-slate-700 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{user.username}</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 text-2xl font-light"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Avatar */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center text-4xl font-bold shadow-lg border-4 border-emerald-50">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white animate-pulse"></span>
            </div>
          </div>

          {/* Info */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-medium text-emerald-700">Active 2 min ago</span>
            </div>
          </div>

          {/* Email */}
          <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Email</p>
            <p className="text-sm font-medium text-slate-900 dark:text-white">{user.email}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">147</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Messages</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-slate-900 dark:text-white">3d</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Chat since</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">

            <Button
              onClick={onClose}
              className="w-full bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-medium rounded-full border border-slate-200 dark:border-slate-700"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
