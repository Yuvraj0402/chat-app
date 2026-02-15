'use client'

import { Message } from '@/lib/messages'
import { useEffect, useRef, useState } from 'react'
import { BASE_URL } from '@/lib/api'
import ViewOnceImage from './ViewOnceImage'

function fullFileUrl(url: string): string {
  if (!url) return ''
  return url.startsWith('http') ? url : `${BASE_URL}${url}`
}

interface EnhancedMessageDisplayProps {
  message: Message
  isOwn: boolean
  currentUserId?: string
}

export default function EnhancedMessageDisplay({
  message,
  isOwn,
  currentUserId = '',
}: EnhancedMessageDisplayProps) {
  const [playing, setPlaying] = useState(false)
  const [showImagePreview, setShowImagePreview] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Keep playing state in sync with the actual audio element
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleEnded = () => setPlaying(false)
    const handlePause = () => setPlaying(false)
    const handlePlay = () => setPlaying(true)

    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('play', handlePlay)

    return () => {
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('play', handlePlay)
    }
  }, [])

  const toggleAudio = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
    } else {
      audio.play().catch(() => {
        // ignore play errors (e.g. autoplay restrictions)
      })
    }
  }

  if (message.type === 'emoji') {
    return <div className="text-6xl animate-bounce">{message.content}</div>
  }

  // Render status ticks for own messages
  const renderStatus = () => {
    if (!isOwn) return null

    let color = 'text-slate-300'
    if (message.status === 'read' || (message.readBy && message.readBy.length > 0)) {
      color = 'text-blue-500 dark:text-blue-400' // Blue for read, explicit dark mode support if needed
    } else if (message.status === 'delivered') {
      color = 'text-slate-300'
    }

    return (
      <div className={`flex justify-end mt-1 ${color}`}>
        <span className="text-[10px] flex">
          {message.status === 'read' || (message.readBy && message.readBy.length > 0) ? (
            // Double tick blue
            <span className="flex">
              <span>✓</span>
              <span className="-ml-1">✓</span>
            </span>
          ) : message.status === 'delivered' ? (
            // Double tick gray
            <span className="flex">
              <span>✓</span>
              <span className="-ml-1">✓</span>
            </span>
          ) : (
            // Single tick
            <span>✓</span>
          )}
        </span>
      </div>
    )
  }

  const content = () => {
    if (message.type === 'image' && message.fileData) {
      // Check if this is a view once image
      if (message.viewOnce) {
        return <ViewOnceImage message={message} currentUserId={currentUserId} isOwn={isOwn} />
      }

      const imgUrl = fullFileUrl(message.fileData.url) || '/placeholder.svg'

      const handleDownload = async () => {
        try {
          const response = await fetch(imgUrl)
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = message.fileData?.name || 'image.jpg'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          window.URL.revokeObjectURL(url)
        } catch (error) {
          console.error('Download failed:', error)
        }
      }

      return (
        <>
          <div className="relative inline-block min-w-[200px]">
            <img
              src={imgUrl}
              alt="shared image"
              onClick={() => setShowImagePreview(true)}
              className="max-w-xs sm:max-w-sm md:max-w-md rounded-2xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer block"
              loading="eager"
              style={{ minHeight: '150px' }}
            />
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDownload()
              }}
              className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full hover:bg-black/80 transition-colors"
            >
              ↓ Download
            </button>
          </div>

          {showImagePreview && (
            <div
              className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
              onClick={() => setShowImagePreview(false)}
            >
              <img
                src={imgUrl}
                alt="shared image full"
                className="max-h-[90vh] max-w-full rounded-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
        </>
      )
    }

    if (message.type === 'file' && message.fileData) {
      const getFileIcon = (mimeType: string) => {
        if (mimeType.includes('pdf')) return '📄'
        if (mimeType.includes('image')) return '🖼️'
        if (mimeType.includes('video')) return '🎬'
        if (mimeType.includes('audio')) return '🎵'
        return '📎'
      }

      const fileUrl = fullFileUrl(message.fileData.url)
      return (
        <a
          href={fileUrl}
          download={message.fileData.name}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl hover:opacity-80 transition-opacity ${isOwn
            ? 'bg-emerald-500 text-white'
            : 'bg-slate-200 text-slate-900'
            }`}
        >
          <span className="text-2xl">{getFileIcon(message.fileData.mimeType || '')}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{message.fileData.name}</p>
            <p className="text-xs opacity-75">
              {message.fileData.size ? `${(message.fileData.size / 1024).toFixed(1)} KB` : ''}
            </p>
          </div>
          <span className="text-lg">↓</span>
        </a>
      )
    }

    if (message.type === 'audio' && message.fileData) {
      return <AudioPlayer audioUrl={fullFileUrl(message.fileData.url)} isOwn={isOwn} />
    }

    return <span className="break-words">{message.content}</span>
  }

  return (
    <div className="flex flex-col">
      {content()}
      {renderStatus()}
    </div>
  )
}

// WhatsApp-style Audio Player Component
interface AudioPlayerProps {
  audioUrl: string
  isOwn: boolean
}

function AudioPlayer({ audioUrl, isOwn }: AudioPlayerProps) {
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      setPlaying(false)
      setCurrentTime(0)
    }

    const handlePause = () => setPlaying(false)
    const handlePlay = () => setPlaying(true)

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('play', handlePlay)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('play', handlePlay)
    }
  }, [])

  const toggleAudio = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
    } else {
      audio.play().catch(() => {
        // ignore play errors
      })
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio) return

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    audio.currentTime = percentage * duration
  }

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="flex items-center gap-2 py-1 min-w-[200px]">
      <button
        onClick={toggleAudio}
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 ${isOwn
          ? 'bg-white/20 hover:bg-white/30 text-white'
          : 'bg-emerald-500 hover:bg-emerald-600 text-white'
          }`}
      >
        {playing ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <rect x="1" y="1" width="4" height="10" rx="1" />
            <rect x="7" y="1" width="4" height="10" rx="1" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M2 1.5v9l8-4.5z" />
          </svg>
        )}
      </button>

      <div className="flex-1 flex flex-col gap-1">
        <div
          className={`h-1 rounded-full cursor-pointer ${isOwn ? 'bg-white/30' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          onClick={handleProgressClick}
        >
          <div
            className={`h-full rounded-full transition-all ${isOwn ? 'bg-white' : 'bg-emerald-500'
              }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className={`text-[10px] font-medium ${isOwn ? 'text-white/80' : 'text-slate-600 dark:text-slate-400'
          }`}>
          {playing ? formatTime(currentTime) : formatTime(duration)}
        </div>
      </div>

      <audio
        ref={audioRef}
        src={audioUrl}
        className="hidden"
        preload="metadata"
      />
    </div>
  )
}
