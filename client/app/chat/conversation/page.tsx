'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import SharedMedia from '@/components/chat/SharedMedia'
import { getCurrentUser } from '@/lib/auth'
import { getOrCreateConversation, getConversationStats } from '@/lib/messages'
import { getAllUsers } from '@/lib/auth'
import { User } from '@/lib/auth'

export default function ConversationDetailsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userName = searchParams.get('user') || ''
  const conversationIdParam = searchParams.get('conversationId')

  const [conversationId, setConversationId] = useState<string | null>(conversationIdParam)
  const [resolvedUser, setResolvedUser] = useState<User | null>(null)
  const [stats, setStats] = useState({ totalMessages: 0, filesShared: 0 })
  const [loading, setLoading] = useState(true)
  const [muted, setMuted] = useState(false)
  const [pinned, setPinned] = useState(false)

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push('/signin')
      return
    }

    if (conversationIdParam) {
      setConversationId(conversationIdParam)
      getConversationStats(conversationIdParam).then(setStats).finally(() => setLoading(false))
      return
    }

    if (!userName.trim()) {
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    ;(async () => {
      const users = await getAllUsers()
      const other = users.find(
        (u) => u.username?.toLowerCase() === userName.toLowerCase() || u.email?.toLowerCase() === userName.toLowerCase()
      )
      if (cancelled) return
      if (!other) {
        setLoading(false)
        return
      }
      setResolvedUser(other)
      const conv = await getOrCreateConversation(currentUser.id || currentUser._id, other.id || other._id)
      if (cancelled || !conv) {
        setLoading(false)
        return
      }
      setConversationId(conv.id || conv._id)
      const s = await getConversationStats(conv.id || conv._id)
      if (!cancelled) setStats(s)
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [conversationIdParam, userName, router])

  const displayName = resolvedUser?.username || userName || 'User'

  const handleVoice = () => {
    if (conversationId) router.push(`/chat?open=${conversationId}`)
    else router.push('/chat')
  }

  const handleVideo = () => {
    if (conversationId) router.push(`/chat?open=${conversationId}`)
    else router.push('/chat')
  }

  const handleSearch = () => router.push('/chat')

  const handleBlock = () => {
    if (typeof window !== 'undefined') window.alert('Block feature can be wired to your backend.')
  }

  const handleMute = () => setMuted((m) => !m)
  const handlePin = () => setPinned((p) => !p)
  const handleClearChat = () => {
    if (typeof window !== 'undefined' && window.confirm('Clear all messages in this chat? (This can be wired to an API)')) {
      setStats((s) => ({ ...s, totalMessages: 0, filesShared: 0 }))
    }
  }
  const handleDeleteConversation = () => {
    if (typeof window !== 'undefined' && window.confirm('Delete this conversation? (This can be wired to an API)')) {
      router.push('/chat')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-50">
      <div className="max-w-3xl mx-auto p-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-8 font-medium transition-colors"
        >
          ← Back
        </button>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-emerald-100 mb-6">
          <div className="h-32 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500"></div>
          <div className="px-8 py-6 relative -mt-16 pt-20">
            <div className="flex items-end gap-6 mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center text-5xl font-bold shadow-lg border-4 border-white">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{displayName}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  <span className="text-slate-600">Active now</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 mt-8 pt-6 border-t border-slate-100">
              <Button onClick={handleVoice} className="flex flex-col items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl py-4 h-auto">
                <span className="text-2xl">📞</span>
                <span className="text-xs font-medium">Voice</span>
              </Button>
              <Button onClick={handleVideo} className="flex flex-col items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl py-4 h-auto">
                <span className="text-2xl">📹</span>
                <span className="text-xs font-medium">Video</span>
              </Button>
              <Button onClick={handleSearch} className="flex flex-col items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl py-4 h-auto">
                <span className="text-2xl">🔍</span>
                <span className="text-xs font-medium">Search</span>
              </Button>
              <Button onClick={handleBlock} className="flex flex-col items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl py-4 h-auto">
                <span className="text-2xl">🚫</span>
                <span className="text-xs font-medium">Block</span>
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-slate-500 py-4">Loading stats...</div>
        ) : (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
              <div className="text-2xl font-bold text-emerald-600">{stats.totalMessages}</div>
              <p className="text-sm text-slate-600 mt-1">Total Messages</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
              <div className="text-2xl font-bold text-emerald-600">—</div>
              <p className="text-sm text-slate-600 mt-1">Chat Duration</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
              <div className="text-2xl font-bold text-emerald-600">{stats.filesShared}</div>
              <p className="text-sm text-slate-600 mt-1">Files Shared</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-lg p-8 border border-slate-100 mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">About</h2>
          <div className="space-y-4">
            <div className="pb-4 border-b border-slate-100">
              <p className="text-xs text-slate-600 font-semibold uppercase mb-2">Email</p>
              <p className="text-slate-900">{resolvedUser?.email || `${displayName.toLowerCase().replace(/\s/g, '')}@example.com`}</p>
            </div>
            <div className="pb-4 border-b border-slate-100">
              <p className="text-xs text-slate-600 font-semibold uppercase mb-2">Status</p>
              <p className="text-slate-900">Online</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 font-semibold uppercase mb-2">Joined</p>
              <p className="text-slate-900">—</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <SharedMedia conversationId={conversationId} />
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-8 border border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Privacy & Settings</h2>
          <div className="space-y-3">
            <Button onClick={handleMute} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-full justify-start px-6">
              {muted ? '🔔 Unmute Conversation' : '🔇 Mute Conversation'}
            </Button>
            <Button onClick={handlePin} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-full justify-start px-6">
              {pinned ? '📌 Unpin Conversation' : '📌 Pin Conversation'}
            </Button>
            <Button onClick={handleClearChat} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-full justify-start px-6">
              🗑️ Clear Chat History
            </Button>
            <Button onClick={handleDeleteConversation} className="w-full bg-red-50 hover:bg-red-100 text-red-700 rounded-full justify-start px-6">
              🚫 Delete Conversation
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
