'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

interface SidebarMenuProps {
  isOpen: boolean
  onClose: () => void
  onLogout: () => void
  onShowFeatures: () => void
}

export default function SidebarMenu({ isOpen, onClose, onLogout, onShowFeatures }: SidebarMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={menuRef}
      className="absolute top-16 right-6 z-50 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 w-56 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
    >


      <Link href="/chat/settings">
        <button className="w-full px-6 py-3 text-left hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <span className="text-lg">⚙️</span>
          <span className="font-medium text-slate-900 dark:text-white">Settings</span>
        </button>
      </Link>



      <button
        onClick={() => {
          onLogout()
          onClose()
        }}
        className="w-full px-6 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center gap-3"
      >
        <span className="text-lg">🚪</span>
        <span className="font-medium text-red-600 dark:text-red-400">Logout</span>
      </button>
    </div>
  )
}
