'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface Notification {
  id: string
  type: 'message' | 'status' | 'call'
  title: string
  description: string
  avatar: string
  timestamp: string
  read: boolean
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'message',
    title: 'Alice sent you a message',
    description: 'Hey! How are you doing?',
    avatar: 'A',
    timestamp: '2 min ago',
    read: false,
  },
  {
    id: '2',
    type: 'status',
    title: 'Bob updated their status',
    description: 'Bob is now online',
    avatar: 'B',
    timestamp: '15 min ago',
    read: true,
  },
  {
    id: '3',
    type: 'call',
    title: 'Missed call from Charlie',
    description: 'Charlie called you',
    avatar: 'C',
    timestamp: '1 hour ago',
    read: true,
  },
]

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const clearAll = () => {
    setNotifications([])
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold">
                {unreadCount}
              </span>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {notifications.length > 0 ? (
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
                className={`w-full px-6 py-4 text-left transition-colors ${
                  notification.read ? 'bg-white hover:bg-slate-50' : 'bg-emerald-50 hover:bg-emerald-100'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center font-semibold">
                    {notification.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900">{notification.title}</h3>
                    <p className="text-xs text-slate-600 truncate">{notification.description}</p>
                    <p className="text-xs text-slate-500 mt-1">{notification.timestamp}</p>
                  </div>
                  {!notification.read && (
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-emerald-500"></div>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <div className="text-3xl mb-2">🔔</div>
            <p className="text-slate-600 text-sm">No notifications yet</p>
          </div>
        )}

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="px-6 py-3 border-t border-slate-100 bg-slate-50">
            <Button
              onClick={clearAll}
              className="w-full text-sm bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-full py-2"
            >
              Clear All
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
