'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { User } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({ username: '', email: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push('/signin')
    } else {
      setUser(currentUser)
      setFormData({ username: currentUser.username, email: currentUser.email })
      setLoading(false)
    }
  }, [router])

  const handleSave = () => {
    if (user) {
      const updatedUser = { ...user, ...formData }
      localStorage.setItem('currentUser', JSON.stringify(updatedUser))
      setUser(updatedUser)
      setIsEditing(false)
    }
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-200">
      <div className="max-w-2xl mx-auto p-6">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 mb-8 font-medium transition-colors"
        >
          ← Back
        </button>

        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-emerald-100 dark:border-slate-700 transition-all duration-200">
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500"></div>

          {/* Profile Content */}
          <div className="px-8 py-8 relative">
            {/* Avatar */}
            <div className="absolute -top-16 left-8">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center text-5xl font-bold shadow-lg border-4 border-white dark:border-slate-900 transition-colors duration-200">
                {user.username.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Profile Info */}
            <div className="mt-20">
              {!isEditing ? (
                <>
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{user.username}</h1>
                    <p className="text-slate-600 dark:text-slate-400">{user.email}</p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-8 pb-8 border-b border-slate-100 dark:border-slate-800">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">12</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Conversations</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">156</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Messages Sent</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Online</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Status</div>
                    </div>
                  </div>

                  {/* Bio Section */}
                  <div className="mb-8">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">About</h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      Hey! I'm available on this chat app. Feel free to reach out and send me a message anytime.
                    </p>
                  </div>

                  <Button
                    onClick={() => setIsEditing(true)}
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium py-3 rounded-full transition-all"
                  >
                    Edit Profile
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">Username</label>
                      <Input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">Email</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 mt-8">
                    <Button
                      onClick={handleSave}
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium py-3 rounded-full"
                    >
                      Save Changes
                    </Button>
                    <Button
                      onClick={() => setIsEditing(false)}
                      className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-medium py-3 rounded-full"
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
