'use client'

import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { loginUser } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SigninPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
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

    const result = await loginUser(formData.email, formData.password)

    if (result.success) {
      router.push('/chat')
    } else {
      setError(result.error || 'Login failed')
    }

    setLoading(false)
  }

  const handleDemoLogin = () => {
    // Placeholder for demo login logic
    router.push('/chat')
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
          <h1 className="text-center text-3xl font-bold text-slate-900">Welcome Back</h1>
          <p className="mt-2 text-center text-slate-600 text-sm">Sign in to continue chatting</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-900 mb-2">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="rounded-lg border-slate-300 bg-slate-50 focus:bg-white focus:border-emerald-400 focus:ring-emerald-200 py-2.5"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-slate-900 mb-2">
              Password
            </label>
            <Input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="rounded-lg border-slate-300 bg-slate-50 focus:bg-white focus:border-emerald-400 focus:ring-emerald-200 py-2.5"
              required
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-center gap-2">
              <span>⚠️</span>
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-2.5 rounded-lg mt-6 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-center text-slate-600">
            Don't have an account?{' '}
            <Link href="/signup" className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
