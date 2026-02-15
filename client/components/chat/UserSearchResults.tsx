'use client'

import { User } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { getInitials } from '@/lib/utils'
import UserAvatar from '../shared/UserAvatar'

interface UserSearchResultsProps {
  users: User[]
  onSelectUser: (user: User) => void
}

export default function UserSearchResults({
  users,
  onSelectUser,
}: UserSearchResultsProps) {
  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-700">
      {users.map((user) => (
        <button
          key={user._id}
          onClick={() => onSelectUser(user)}
          className="w-full px-4 py-4 text-left transition-all hover:bg-emerald-50 dark:hover:bg-slate-800 flex items-center gap-3 hover:border-l-4 hover:border-l-emerald-500"
        >
          <div className="flex-shrink-0 relative">
            <UserAvatar user={user} className="w-12 h-12 text-sm" showOnlineStatus={true} isOnline={true} />
            {/* Note: In search results we don't strictly know online status unless passed, but original had a static green dot implying 'available' or just decoration?
                 Original: <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></span>
                 So I'll force isOnline={true} to keep visual consistency or remove it if misleading. Let's keep it as visual flair for now or default true.
             */}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 dark:text-white">{user.username}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
          </div>
          <span className="text-slate-400 text-lg">→</span>
        </button>
      ))}
    </div>
  )
}
