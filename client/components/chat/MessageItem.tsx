'use client'

import { Message } from '@/lib/messages'
import EnhancedMessageDisplay from './EnhancedMessageDisplay'
import UserAvatar from '../shared/UserAvatar'

import { getInitials } from '@/lib/utils'

interface MessageItemProps {
  message: Message
  isOwn: boolean
  isGroup?: boolean
  currentUserId?: string
}

export default function MessageItem({ message, isOwn, isGroup, currentUserId }: MessageItemProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  const sender = typeof message.sender === 'string' ? { username: 'User' } : message.sender

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} items-end gap-2.5 mb-2 animate-fade-in`}>
      {!isOwn && (
        <UserAvatar user={sender} className="w-7 h-7 text-xs" />
      )}
      <div
        className={`max-w-xs lg:max-w-md rounded-2xl px-4 py-2.5 shadow-md transition-all duration-200 ${isOwn
          ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-br-none shadow-emerald-200'
          : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 rounded-bl-none border border-slate-200 dark:border-slate-700'
          }`}
      >
        {/* Show sender name in group chats for received messages */}
        {isGroup && !isOwn && message.sender && (
          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
            {sender.username}
          </p>
        )}
        <div className="text-sm leading-relaxed break-words">
          <EnhancedMessageDisplay message={message} isOwn={isOwn} currentUserId={currentUserId} />
        </div>
        {!message.viewOnce && (
          <p
            className={`mt-1 text-xs font-medium opacity-75 ${isOwn ? 'text-emerald-50' : 'text-slate-500 dark:text-slate-400'
              }`}
          >
            {formatTime(message.timestamp)}
          </p>
        )}
      </div>
      {isOwn && (
        <UserAvatar user={sender} className="w-7 h-7 text-xs" />
      )}
    </div>
  )
}
