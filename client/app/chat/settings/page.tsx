'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { logoutUser } from '@/lib/auth'
import { useTheme } from '@/components/providers/ThemeProvider'

export default function SettingsPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Track if we are mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleDeleteAccount = async () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        const userStr = localStorage.getItem('chat_current_user') || localStorage.getItem('chat-app-user')
        if (userStr) {
          const user = JSON.parse(userStr)
          const userId = user.id || user._id

          // Using generic fetch for now
          const response = await fetch(`http://localhost:5000/api/users/delete/${userId}`, {
            method: 'DELETE',
          })

          if (response.ok) {
            alert("Account deleted successfully.")
            logoutUser()
            router.push('/signin')
          } else {
            alert("Failed to delete account.")
          }
        }
      } catch (error) {
        console.error(error)
        alert("An error occurred.")
      }
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-200">
      <div className="max-w-2xl mx-auto p-6">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 mb-8 font-medium transition-colors"
        >
          ← Back
        </button>

        {/* Settings Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-emerald-100 dark:border-slate-700 transition-colors duration-200">
          {/* Header */}
          <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-emerald-50 to-white dark:from-slate-800 dark:to-slate-800">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Customize your chat experience</p>
          </div>

          {/* Settings List */}
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {/* Dark Mode Toggle */}
            <div className="px-8 py-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Dark Mode</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Enable dark theme</p>
              </div>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${theme === 'dark' ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <Button
              onClick={handleDeleteAccount}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-medium rounded-full"
            >
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
