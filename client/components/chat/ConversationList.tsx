'use client'

import { User } from '@/lib/auth'
import { Conversation, getConversationMessages } from '@/lib/messages'
import { getAllUsers } from '@/lib/auth'
import ConversationItem from './ConversationItem'

interface ConversationListProps {
  conversations: Conversation[]
  selectedConversation: Conversation | null
  currentUserId: string
  onSelectConversation: (conversation: Conversation) => void
}

export default function ConversationList({
  conversations,
  selectedConversation,
  currentUserId,
  onSelectConversation,
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center">
        <div>
          <div className="text-5xl mb-4 animate-bounce">👋</div>
          <p className="text-slate-900 font-semibold mb-2">No conversations yet</p>
          <p className="text-slate-600 text-sm">
            Search for users or click the search icon to start your first chat!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          currentUserId={currentUserId}
          isSelected={selectedConversation?.id === conversation.id}
          onSelect={() => onSelectConversation(conversation)}
        />
      ))}
    </div>
  )
}
