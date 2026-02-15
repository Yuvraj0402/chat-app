'use client'

import { useEffect, useState } from 'react'
import { User } from '@/lib/auth'
import { Conversation, getUserConversations } from '@/lib/messages'
import { getAllUsers, searchUsers } from '@/lib/auth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import ConversationList from './ConversationList'
import UserSearchResults from './UserSearchResults'
import ProfileModal from './ProfileModal'
import SidebarMenu from './SidebarMenu'
import CreateGroupModal from './CreateGroupModal'
import { getInitials } from '@/lib/utils'
import UserAvatar from '../shared/UserAvatar'

interface ChatSidebarProps {
  user: User
  selectedConversation: Conversation | null
  onSelectConversation: (conversation: Conversation) => void
  onLogout: () => void
  onShowFeatures: () => void
}

export default function ChatSidebar({
  user,
  selectedConversation,
  onSelectConversation,
  onLogout,
  onShowFeatures,
}: ChatSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [allUsers, setAllUsers] = useState<User[]>([])

  useEffect(() => {
    const loadConversations = async () => {
      const userId = user.id || user._id;
      if (!userId) return;
      const userConversations = await getUserConversations(userId)
      setConversations(userConversations)
    }

    loadConversations()
    loadConversations()
    const { socket } = require('@/lib/api')

    const handleMessagesRead = (data: { conversationId: string, messageIds: string[], userId: string }) => {
      setConversations(prev => prev.map(conv => {
        if (conv.id === data.conversationId || conv._id === data.conversationId) {
          if (conv.lastMessage && (data.messageIds.includes(conv.lastMessage.id || conv.lastMessage._id || ''))) {
            return {
              ...conv,
              lastMessage: { ...conv.lastMessage, status: 'read' }
            }
          }
        }
        return conv
      }))
    }

    const handleMessagesDelivered = (data: { conversationId: string, messageIds: string[], userId: string }) => {
      setConversations(prev => prev.map(conv => {
        if (conv.id === data.conversationId || conv._id === data.conversationId) {
          if (conv.lastMessage && (data.messageIds.includes(conv.lastMessage.id || conv.lastMessage._id || '')) && conv.lastMessage.status !== 'read') {
            return {
              ...conv,
              lastMessage: { ...conv.lastMessage, status: 'delivered' }
            }
          }
        }
        return conv
      }))
    }

    // Listen for single message delivery confirmation (from send-msg event)
    const handleMessageDelivered = (data: { messageId: string, conversationId: string, userId: string }) => {
      setConversations(prev => prev.map(conv => {
        if (conv.id === data.conversationId || conv._id === data.conversationId) {
          if (conv.lastMessage && (conv.lastMessage.id || conv.lastMessage._id) === data.messageId && conv.lastMessage.status !== 'read') {
            return {
              ...conv,
              lastMessage: { ...conv.lastMessage, status: 'delivered' }
            }
          }
        }
        return conv
      }))
    }

    // Also listen for new messages to update the list immediately (optional, as we poll)
    // But polling is 1s, so maybe fine.

    socket.on("messages-read", handleMessagesRead)
    socket.on("messages-delivered", handleMessagesDelivered)
    socket.on("message-delivered", handleMessageDelivered)

    const interval = setInterval(loadConversations, 3000) // Increased poll time since we have sockets

    return () => {
      clearInterval(interval)
      socket.off("messages-read", handleMessagesRead)
      socket.off("messages-delivered", handleMessagesDelivered)
      socket.off("message-delivered", handleMessageDelivered)
    }
  }, [user.id, user._id])

  useEffect(() => {
    const loadUsers = async () => {
      const users = await getAllUsers()
      setAllUsers(users)
    }
    loadUsers()
  }, [])

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      const results = await searchUsers(query, user.id || user._id)
      setSearchResults(results)
      setShowSearch(true)
    } else {
      setSearchResults([])
      setShowSearch(false)
    }
  }

  const handleSelectUser = async (selectedUser: User) => {
    const { getOrCreateConversation } = await import('@/lib/messages')
    const conversation = await getOrCreateConversation(user.id || user._id, selectedUser.id || selectedUser._id)
    if (conversation) {
      onSelectConversation(conversation)
      setSearchQuery('')
      setSearchResults([])
      setShowSearch(false)
    }
  }

  const handleCreateGroup = async (groupName: string, memberIds: string[]) => {
    const { createGroupConversation } = await import('@/lib/messages')
    const newGroup = await createGroupConversation(user.id || user._id, memberIds, groupName)
    if (newGroup) {
      onSelectConversation(newGroup)
      setShowGroupModal(false)
    }
  }

  return (
    <div className="flex w-full max-w-xs flex-col bg-white dark:bg-slate-900 shadow-2xl h-screen transition-colors duration-200">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 px-6 py-4 bg-white dark:bg-slate-900 transition-colors duration-200">
        <div className="flex items-center justify-between mb-4 relative">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Messages</h1>
          <div className="flex items-center gap-1.5">
            <Button
              onClick={() => setShowGroupModal(true)}
              className="h-9 w-9 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 p-0 transition-all"
              title="Create group"
            >
              👥
            </Button>
            <Button
              onClick={() => setShowProfileModal(true)}
              className="h-9 w-9 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 p-0 transition-all"
              title="Profile"
            >
              👤
            </Button>
            <Button
              onClick={() => setShowMenu(!showMenu)}
              className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 p-0 transition-all"
              title="Menu"
            >
              ⋮
            </Button>
          </div>
          <SidebarMenu
            isOpen={showMenu}
            onClose={() => setShowMenu(false)}
            onLogout={onLogout}
            onShowFeatures={() => {
              onShowFeatures()
              setShowMenu(false)
            }}
          />
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-400">
          <div className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <div className="flex items-center gap-2">
              <UserAvatar user={user} className="w-6 h-6 text-xs" />
              <span className="font-semibold text-slate-900 dark:text-white">{user.username}</span> online
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="border-b border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-900/50 transition-colors duration-200">
        <Input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-full px-4 py-2.5 text-sm focus:border-emerald-400 focus:ring-emerald-200 dark:text-white dark:placeholder-slate-400"
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {showSearch && searchResults.length > 0 ? (
          <UserSearchResults users={searchResults} onSelectUser={handleSelectUser} />
        ) : showSearch && searchResults.length === 0 ? (
          <div className="p-4 text-center text-slate-500 dark:text-slate-400">
            <p>No users found</p>
          </div>
        ) : (
          <ConversationList
            conversations={conversations}
            selectedConversation={selectedConversation}
            currentUserId={user.id || user._id}
            onSelectConversation={onSelectConversation}
          />
        )}
      </div>

      {/* Profile Modal */}
      <ProfileModal user={user} isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />

      {/* Group Chat Modal */}
      <CreateGroupModal
        isOpen={showGroupModal}
        users={allUsers}
        currentUserId={user.id || user._id || ''}
        onClose={() => setShowGroupModal(false)}
        onCreate={handleCreateGroup}
      />
    </div>
  )
}
