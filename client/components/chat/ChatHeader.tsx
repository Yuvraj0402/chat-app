'use client'

import { User } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import UserInfoModal from './UserInfoModal'
import UserAvatar from '../shared/UserAvatar'

interface ChatHeaderProps {
  otherUser: User | any
  onBack: () => void
  isGroup?: boolean
  onShowSharedMedia?: () => void
}

export default function ChatHeader({ otherUser, onBack, isGroup, onShowSharedMedia }: ChatHeaderProps) {
  const [showInfo, setShowInfo] = useState(false)

  return (
    <>
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 py-4 shadow-sm transition-colors duration-200">
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={onBack}
            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white md:hidden transition-colors p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            title="Back"
          >
            ← Back
          </button>
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-shrink-0">
              {isGroup ? (
                <div className="flex h-11 w-11 items-center justify-center rounded-full text-white font-semibold text-sm shadow-md transition-all hover:scale-105 bg-gradient-to-br from-blue-400 to-blue-600">
                  👥
                </div>
              ) : (
                <UserAvatar
                  user={otherUser}
                  className="w-11 h-11 text-sm transition-all hover:scale-105"
                  showOnlineStatus={true}
                  isOnline={true} // As per original code, it had an unconditional green dot. 
                // Or maybe we should improve this later to use real status if available in props.
                />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white truncate">{otherUser.username}</h2>
              <p className="text-xs text-emerald-600 font-medium">
                {isGroup ? 'Group Chat' : 'Active now'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            onClick={() => setShowInfo(true)}
            className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white p-0 transition-all"
            title="Info"
          >
            ℹ️
          </Button>
          {onShowSharedMedia && (
            <Button
              onClick={onShowSharedMedia}
              className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white p-0 transition-all"
              title="Shared media"
            >
              🖼️
            </Button>
          )}

        </div>
      </div>

      <UserInfoModal user={otherUser} isOpen={showInfo} onClose={() => setShowInfo(false)} />
    </>
  )
}
