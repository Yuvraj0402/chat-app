'use client'

import { useState } from 'react'
import { User } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface CreateGroupModalProps {
  isOpen: boolean
  users: User[]
  currentUserId: string
  onClose: () => void
  onCreate: (groupName: string, memberIds: string[]) => void
}

export default function CreateGroupModal({
  isOpen,
  users,
  currentUserId,
  onClose,
  onCreate,
}: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState('')
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])

  if (!isOpen) return null

  // Filter out current user - handle both _id and id
  const otherUsers = users.filter((u) => (u.id !== currentUserId && u._id !== currentUserId))

  const handleMemberToggle = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  const handleCreate = () => {
    if (groupName.trim() && selectedMembers.length > 0) {
      onCreate(groupName, selectedMembers)
      setGroupName('')
      setSelectedMembers([])
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Create Group Chat</h2>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
            Group Name
          </label>
          <Input
            type="text"
            placeholder="Enter group name..."
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
            Select Members ({selectedMembers.length})
          </label>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {otherUsers.map((user) => {
              const userId = user.id || user._id
              return (
                <label
                  key={userId}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(userId)}
                    onChange={() => handleMemberToggle(userId)}
                    className="w-4 h-4 rounded accent-emerald-500"
                  />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{user.username}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{user.email}</p>
                  </div>
                </label>
              )
            })}
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={onClose}
            className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!groupName.trim() || selectedMembers.length === 0}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-full disabled:opacity-50"
          >
            Create
          </Button>
        </div>
      </div>
    </div>
  )
}
