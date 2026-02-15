import { useRef, useState } from 'react'
import { User } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { uploadFile } from '@/lib/api'
import UserAvatar from '../shared/UserAvatar'
import { getInitials } from '@/lib/utils'

interface ProfileModalProps {
  user: User
  isOpen: boolean
  onClose: () => void
}

export default function ProfileModal({ user, isOpen, onClose }: ProfileModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  if (!isOpen) return null

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      const { url } = await uploadFile(file)

      // Update user avatar in backend
      // We need to call the specialized endpoint for this
      // Assuming api.ts has a way or we use raw axios/fetch

      // We need to import 'api' to make authenticated request
      const { api } = require('@/lib/api') // Dynamic import to avoid cycles if any, or just standard import

      await api.post(`/users/startAvatar/${user.id || user._id}`, {
        image: url
      })

      // Update local storage user data to reflect change immediately
      const CURRENT_USER_KEY = 'chat_current_user';
      const currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || '{}')

      if (currentUser && currentUser._id) {
        const updatedUser = { ...currentUser, avatarImage: url, isAvatarImageSet: true }
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser))

        // Force reload to reflect changes
        window.location.reload()
      } else {
        // Fallback if local storage was empty (rare but possible if key mismatch)
        // Just reload.
        window.location.reload()
      }

    } catch (error) {
      console.error("Failed to upload avatar", error)
      alert("Failed to upload profile picture.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full border border-emerald-100 dark:border-slate-700 animate-in fade-in duration-200">
        {/* Close Button */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Profile</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 text-2xl font-light"
          >
            ×
          </button>
        </div>

        {/* Profile Content */}
        <div className="p-6">
          {/* Avatar */}
          <div className="flex justify-center mb-6 relative group">
            <div
              className="relative cursor-pointer transition-transform hover:scale-105"
              onClick={handleAvatarClick}
              title="Click to upload profile picture"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />

              {/* Use the new UserAvatar component logic but explicitly sized */}
              {/* Actually, let's just use UserAvatar with a large size class */}
              <UserAvatar
                user={user}
                className="w-24 h-24 text-4xl" // text-4xl for initials if fallback
              />

              {uploading && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}

              <div className="absolute bottom-0 right-0 bg-white dark:bg-slate-800 rounded-full p-1.5 shadow-md border border-slate-100 dark:border-slate-700 text-emerald-600 dark:text-emerald-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{user.username}</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">{user.email}</p>
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-medium text-emerald-700">Active now</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={onClose}
              className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-medium rounded-full"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
