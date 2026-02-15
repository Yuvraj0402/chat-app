'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getCurrentUser, logoutUser } from '@/lib/auth'
import { User } from '@/lib/auth'
import { Conversation, getUserConversations } from '@/lib/messages'
import ChatSidebar from '@/components/chat/ChatSidebar'
import ChatWindow from '@/components/chat/ChatWindow'
import FeaturesGuide from '@/components/chat/FeaturesGuide'

function ChatPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const openConversationId = searchParams.get('open')
  const [user, setUser] = useState<User | null>(null)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [showFeatures, setShowFeatures] = useState(false)

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push('/signin')
    } else {
      setUser(currentUser)
      setLoading(false)

      // Initialize socket
      const { socket } = require('@/lib/api')
      socket.connect()
      socket.emit("add-user", currentUser.id || currentUser._id)
    }

    return () => {
      const { socket } = require('@/lib/api')
      socket.disconnect()
    }
  }, [router])

  useEffect(() => {
    if (!openConversationId || !user) return
    getUserConversations(user.id || user._id).then((conversations) => {
      const conv = conversations.find((c) => (c.id || c._id) === openConversationId)
      if (conv) setSelectedConversation(conv)
    })
  }, [openConversationId, user])

  const handleLogout = () => {
    logoutUser()
    router.push('/signin')
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100">
        <div className="text-slate-600">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen bg-slate-100 uppercase-none">
      <ChatSidebar
        user={user}
        selectedConversation={selectedConversation}
        onSelectConversation={setSelectedConversation}
        onLogout={handleLogout}
        onShowFeatures={() => setShowFeatures(true)}
      />
      {selectedConversation ? (
        <ChatWindow
          conversation={selectedConversation}
          currentUser={user}
          onBack={() => setSelectedConversation(null)}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-emerald-50 via-slate-50 to-emerald-50">
          <div className="text-center">
            <div className="text-7xl mb-6 animate-pulse">💬</div>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Select a conversation</h2>
            <p className="text-slate-600 text-lg">Choose a chat from the sidebar to start messaging</p>
          </div>
        </div>
      )}
      <FeaturesGuide isOpen={showFeatures} onClose={() => setShowFeatures(false)} />
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-slate-100">
        <div className="text-slate-600">Loading...</div>
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  )
}
