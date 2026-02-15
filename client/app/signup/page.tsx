'use client'

import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { registerUser } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validation
    if (!formData.email || !formData.username || !formData.password) {
      setError('All fields are required')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    const result = await registerUser(formData.email, formData.username, formData.password)

    if (result.success) {
      router.push('/signin')
    } else {
      setError(result.error || 'Registration failed')
    }

    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4">
      {/* Decorative elements */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-emerald-200 rounded-full mix-blend-multiply filter blur-2xl opacity-20"></div>
      <div className="absolute bottom-10 left-10 w-32 h-32 bg-teal-200 rounded-full mix-blend-multiply filter blur-2xl opacity-20"></div>

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl border border-slate-200 relative z-10">
        <div className="mb-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white text-2xl shadow-lg mb-4">
              💬
            </div>
          </div>
          <h1 className="text-center text-3xl font-bold text-slate-900">Create Account</h1>
          <p className="mt-2 text-center text-slate-600 text-sm">Join our chat community and start connecting</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-center gap-2">
              <span>⚠️</span>
              {error}
            </div>
          )}
          <div>
            <label className="text-sm font-semibold text-slate-900 block mb-2">Email Address</label>
            <Input
              type="email"
              name="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              className="rounded-lg border-slate-300 bg-slate-50 focus:bg-white focus:border-emerald-400 focus:ring-emerald-200 py-2.5"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-900 block mb-2">Username</label>
            <Input
              type="text"
              name="username"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
              className="rounded-lg border-slate-300 bg-slate-50 focus:bg-white focus:border-emerald-400 focus:ring-emerald-200 py-2.5"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-900 block mb-2">Password</label>
            <Input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="rounded-lg border-slate-300 bg-slate-50 focus:bg-white focus:border-emerald-400 focus:ring-emerald-200 py-2.5"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-2.5 rounded-lg mt-6 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-center text-slate-600">
            Already have an account?{' '}
            <Link href="/signin" className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
