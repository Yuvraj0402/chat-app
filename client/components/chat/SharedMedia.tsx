'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { getConversationMedia } from '@/lib/messages'
import { Message } from '@/lib/messages'
import { BASE_URL } from '@/lib/api'

const typeIcons: Record<string, string> = {
  image: '🖼️',
  video: '🎬',
  file: '📄',
  document: '📄',
  audio: '🎵',
}

function formatTimestamp(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week(s) ago`
  return date.toLocaleDateString()
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface SharedMediaProps {
  conversationId?: string | null
}

export default function SharedMedia({ conversationId }: SharedMediaProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'images' | 'videos' | 'documents' | 'audio'>('all')
  const [media, setMedia] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!conversationId) {
      setMedia([])
      return
    }
    let cancelled = false
    setLoading(true)
    getConversationMedia(conversationId)
      .then((data) => {
        if (!cancelled) setMedia(data)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [conversationId])

  const filteredMedia = media.filter((msg) => {
    if (!msg.fileData?.url) return false
    if (activeTab === 'all') return true
    if (activeTab === 'images') return msg.type === 'image'
    if (activeTab === 'videos') return msg.type === 'video' || (msg.fileData.mimeType || '').startsWith('video/')
    if (activeTab === 'documents') return msg.type === 'file'
    if (activeTab === 'audio') return msg.type === 'audio'
    return true
  })

  const fullUrl = (url: string) => (url.startsWith('http') ? url : `${BASE_URL}${url}`)

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden max-w-2xl">
      <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-white">
        <h3 className="text-lg font-bold text-slate-900">Shared Media</h3>
      </div>

      <div className="flex border-b border-slate-100 px-6 py-0 flex-wrap">
        {(['all', 'images', 'videos', 'documents', 'audio'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === tab ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="p-6">
        {!conversationId ? (
          <div className="text-center py-8">
            <div className="text-3xl mb-2">💬</div>
            <p className="text-slate-600">Select a conversation to view shared media</p>
          </div>
        ) : loading ? (
          <div className="text-center py-8 text-slate-500">Loading...</div>
        ) : filteredMedia.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {filteredMedia.map((msg) => {
              const url = msg.fileData!.url
              const absUrl = fullUrl(url)
              const icon = typeIcons[msg.type] ?? typeIcons.file
              return (
                <div
                  key={msg._id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  {msg.type === 'image' ? (
                    <a href={absUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                      <img
                        src={absUrl}
                        alt={msg.fileData!.name}
                        className="w-14 h-14 object-cover rounded-lg border border-slate-200"
                      />
                    </a>
                  ) : (
                    <div className="text-3xl flex-shrink-0">{icon}</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{msg.fileData!.name}</p>
                    <p className="text-xs text-slate-600">
                      {formatTimestamp(msg.timestamp)} · {formatSize(msg.fileData!.size || 0)}
                    </p>
                  </div>
                  <a href={absUrl} download={msg.fileData!.name} target="_blank" rel="noopener noreferrer">
                    <Button className="bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-full p-2" title="Download">
                      ↓
                    </Button>
                  </a>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-3xl mb-2">📭</div>
            <p className="text-slate-600">No media shared yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
