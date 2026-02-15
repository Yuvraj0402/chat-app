'use client'

import { useEffect, useState } from 'react'
import { getAllUsers, User } from '@/lib/auth'
import { Button } from '@/components/ui/button'

interface GroupMembersProps {
  memberIds: string[]
  groupName: string
  isOpen: boolean
  onClose: () => void
}

export default function GroupMembers({
  memberIds,
  groupName,
  isOpen,
  onClose,
}: GroupMembersProps) {
  const [members, setMembers] = useState<User[]>([])

  useEffect(() => {
    const users = getAllUsers()
    const groupMembers = users.filter((u) => memberIds.includes(u.id))
    setMembers(groupMembers)
  }, [memberIds])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">{groupName}</h2>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">
            Members ({members.length})
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white font-semibold text-sm">
                  {member.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900">{member.username}</p>
                  <p className="text-xs text-slate-600 truncate">{member.email}</p>
                </div>
                <span className="text-emerald-500 text-lg">●</span>
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-full"
        >
          Close
        </Button>
      </div>
    </div>
  )
}
