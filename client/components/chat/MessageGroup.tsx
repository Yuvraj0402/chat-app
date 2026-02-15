'use client'

import MessageItem from './MessageItem'

interface Message {
  id: string
  content: string
  senderId: string
  timestamp: number
}

interface MessageGroupProps {
  messages: Message[]
  currentUserId: string
}

export default function MessageGroup({ messages, currentUserId }: MessageGroupProps) {
  // Group messages by sender and time proximity
  const groupedMessages = messages.reduce(
    (groups: { senderId: string; messages: Message[] }[], message) => {
      const lastGroup = groups[groups.length - 1]
      const timeDiff = lastGroup ? message.timestamp - lastGroup.messages[lastGroup.messages.length - 1].timestamp : Infinity

      if (
        lastGroup &&
        lastGroup.senderId === message.senderId &&
        timeDiff < 60000 // 1 minute
      ) {
        lastGroup.messages.push(message)
      } else {
        groups.push({ senderId: message.senderId, messages: [message] })
      }
      return groups
    },
    [],
  )

  return (
    <div className="space-y-6">
      {groupedMessages.map((group, index) => (
        <div key={index} className="flex gap-2">
          {group.messages.map((message) => (
            <div key={message.id} className="flex-1">
              <MessageItem message={message} isOwn={message.senderId === currentUserId} />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
