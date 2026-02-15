'use client'

import { useEffect, useState } from 'react'
import { Conversation, getConversationMessages } from '@/lib/messages'
import { getAllUsers } from '@/lib/auth'
import UserAvatar from '../shared/UserAvatar'

import { getInitials } from '@/lib/utils'

interface ConversationItemProps {
  conversation: Conversation
  currentUserId: string
  isSelected: boolean
  onSelect: () => void
}

export default function ConversationItem({
  conversation,
  currentUserId,
  isSelected,
  onSelect,
}: ConversationItemProps) {
  const [otherUser, setOtherUser] = useState<any>(null)
  const [lastMessage, setLastMessage] = useState('')
  const [isOnline, setIsOnline] = useState(false)

  useEffect(() => {
    const loadUser = async () => {
      if (conversation.isGroup) {
        setOtherUser({ username: conversation.groupName || 'Group Chat' })
      } else {
        const users = await getAllUsers()
        const other = conversation.participantIds.find((id) => id !== currentUserId)
        const user = users.find((u: any) => u._id === other || u.id === other)
        setOtherUser(user)

        // Listen for online/offline status
        const { socket } = require('@/lib/api')

        // Check initial online status
        socket.emit('get-online-status', other)

        const handleOnlineUsers = (onlineUserIds: string[]) => {
          if (other && onlineUserIds.includes(other)) {
            setIsOnline(true)
          } else {
            setIsOnline(false)
          }
        }

        const handleUserOnline = (userId: string) => {
          if (userId === other) setIsOnline(true)
        }

        const handleUserOffline = (userId: string) => {
          if (userId === other) setIsOnline(false)
        }

        socket.on('online-users', handleOnlineUsers)
        socket.on('user-online', handleUserOnline)
        socket.on('user-offline', handleUserOffline)

        return () => {
          socket.off('online-users', handleOnlineUsers)
          socket.off('user-online', handleUserOnline)
          socket.off('user-offline', handleUserOffline)
        }
      }
    }
    loadUser()

    if (conversation.lastMessage) {
      setLastMessage(conversation.lastMessage.content.substring(0, 50))
    }
  }, [conversation, currentUserId])

  if (!otherUser) return null

  return (
    <button
      onClick={onSelect}
      className={`w-full border-b border-slate-200 dark:border-slate-700 px-4 py-3.5 text-left transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800 ${isSelected
        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-l-emerald-500'
        : ''
        }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 relative">
          {conversation.isGroup ? (
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md bg-gradient-to-br from-blue-500 to-blue-600">
              👥
            </div>
          ) : (
            <UserAvatar
              user={otherUser}
              className="w-12 h-12 text-lg"
              showOnlineStatus={true}
              isOnline={isOnline}
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-slate-900 dark:text-white truncate">{otherUser.username}</h3>
            {conversation.lastMessage && (
              <span className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
                {new Date(conversation.lastMessage.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {conversation.isGroup
              ? `${conversation.participantIds.length} members`
              : conversation.lastMessage
                ? (conversation.lastMessage.senderId === currentUserId || conversation.lastMessage.sender?._id === currentUserId)
                  ? (
                    <span className="flex items-center gap-1">
                      <span className="flex">
                        {/* Status Ticks */}
                        {conversation.lastMessage.status === 'read' || (conversation.lastMessage.readBy && conversation.lastMessage.readBy.length > 0) ? (
                          <span className="text-blue-500 flex text-[10px]">
                            <span>✓</span><span className="-ml-1">✓</span>
                          </span>
                        ) : conversation.lastMessage.status === 'delivered' ? (
                          <span className="text-slate-400 flex text-[10px]">
                            <span>✓</span><span className="-ml-1">✓</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">✓</span>
                        )}
                      </span>
                      <span>You: {lastMessage || 'sent a message'}</span>
                    </span>
                  )
                  : lastMessage || 'No messages yet'
                : 'No messages yet'}
          </p>
        </div>
      </div>
    </button>
  )
}
