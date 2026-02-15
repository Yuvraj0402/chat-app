'use client'

import React from "react"

import { useEffect, useRef, useState } from 'react'
import { Conversation, getConversationMessages, sendMessage, Message, MessageType } from '@/lib/messages'
import { uploadDataUrl } from '@/lib/api'
import { User, getAllUsers } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import MessageItem from './MessageItem'
import ChatHeader from './ChatHeader'
import EmojiPicker from './EmojiPicker'
import FileAttachment from './FileAttachment'
import AudioRecorder from './AudioRecorder'
import SharedMedia from './SharedMedia'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ChatWindowProps {
  conversation: Conversation
  currentUser: User
  onBack: () => void
}

export default function ChatWindow({
  conversation,
  currentUser,
  onBack,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [otherUser, setOtherUser] = useState<User | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [selectedFile, setSelectedFile] = useState<any>(null)
  const [viewOnce, setViewOnce] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [typingUser, setTypingUser] = useState<string>('')
  const [showSharedMedia, setShowSharedMedia] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const loadOtherUser = async () => {
      if (conversation.isGroup) {
        setOtherUser({
          _id: conversation.id || conversation._id,
          id: conversation.id || conversation._id,
          username: conversation.groupName || 'Group Chat',
          email: 'group',
        })
      } else {
        const users = await getAllUsers()
        // Ensure ID matching handles both _id and id
        const otherId = conversation.participantIds?.find((id) => id !== (currentUser.id || currentUser._id) && id !== undefined)
        if (otherId) {
          const user = users.find((u) => u.id === otherId || u._id === otherId)
          setOtherUser(user || null)
        }
      }
    }
    loadOtherUser()
  }, [conversation, currentUser.id, currentUser._id])

  useEffect(() => {
    const loadMessages = async () => {
      const msgs = await getConversationMessages(conversation.id || conversation._id)
      setMessages(msgs)
    }

    loadMessages()

    const { socket } = require('@/lib/api')

    // Mark messages as read when entering chat
    if (messages.length > 0) {
      const unreadMessages = messages
        .filter(m => m.senderId !== (currentUser.id || currentUser._id) && m.status !== 'read')
        .map(m => m.id || m._id)

      if (unreadMessages.length > 0) {
        socket.emit('mark-read', {
          conversationId: conversation.id || conversation._id,
          userId: currentUser.id || currentUser._id,
          messageIds: unreadMessages
        })
      }
    }

    socket.emit("join-chat", conversation.id || conversation._id)

    const handleNewMessage = (newMessage: any) => {
      const msgConvId = newMessage.conversationId || newMessage.conversation?._id || newMessage.conversation
      const currentConvId = conversation.id || conversation._id

      if (msgConvId === currentConvId) {
        setMessages((prev) => {
          if (prev.some(m => (m?.id === newMessage.id || m?._id === newMessage._id))) {
            return prev
          }
          // Mark this new message as read if we are in the chat
          if (newMessage.senderId !== (currentUser.id || currentUser._id)) {
            socket.emit('mark-read', {
              conversationId: currentConvId,
              userId: currentUser.id || currentUser._id,
              messageIds: [newMessage.id || newMessage._id]
            })
          } else {
            // If we are sender, we don't mark as delivered usually, 
            // but if we receive a message that implies we are online and theoretically 'delivered' to us
            // Logic: If I receive a message from YOU, it is DELIVERED to ME.
            // Implemented in server-side msg-recieve now, so this might be redundant but safe.
            socket.emit('mark-delivered', {
              conversationId: currentConvId,
              userId: currentUser.id || currentUser._id,
              messageIds: [newMessage.id || newMessage._id]
            })
          }
          return [...prev, newMessage]
        })
      }
    }

    const handleMessagesRead = (data: { conversationId: string, messageIds: string[], userId: string }) => {
      if (data.conversationId === (conversation.id || conversation._id)) {
        setMessages(prev => prev.map(msg => {
          if (data.messageIds.includes(msg.id || msg._id)) {
            return { ...msg, status: 'read' }
          }
          return msg
        }))
      }
    }

    const handleMessagesDelivered = (data: { conversationId: string, messageIds: string[], userId: string }) => {
      if (data.conversationId === (conversation.id || conversation._id)) {
        setMessages(prev => prev.map(msg => {
          if (data.messageIds.includes(msg.id || msg._id) && msg.status !== 'read') {
            return { ...msg, status: 'delivered' }
          }
          return msg
        }))
      }
    }

    // Listen for single message delivery confirmation (from send-msg event)
    const handleMessageDelivered = (data: { messageId: string, conversationId: string, userId: string }) => {
      if (data.conversationId === (conversation.id || conversation._id)) {
        setMessages(prev => prev.map(msg => {
          if ((msg.id || msg._id) === data.messageId && msg.status !== 'read') {
            return { ...msg, status: 'delivered' }
          }
          return msg
        }))
      }
    }


    socket.on("msg-recieve", handleNewMessage)
    socket.on("message-received", handleNewMessage)
    socket.on("messages-read", handleMessagesRead)
    socket.on("messages-delivered", handleMessagesDelivered)
    socket.on("message-delivered", handleMessageDelivered)

    // Typing indicators
    const handleUserTyping = (data: { userId: string; username: string }) => {
      if (data.userId !== (currentUser.id || currentUser._id)) {
        setIsTyping(true)
        setTypingUser(data.username || 'User')
      }
    }

    const handleUserStoppedTyping = (data: { userId: string }) => {
      if (data.userId !== (currentUser.id || currentUser._id)) {
        setIsTyping(false)
        setTypingUser('')
      }
    }

    socket.on("user-typing", handleUserTyping)
    socket.on("user-stopped-typing", handleUserStoppedTyping)

    const interval = setInterval(loadMessages, 3000)
    return () => {
      socket.off("msg-recieve", handleNewMessage)
      socket.off("message-received", handleNewMessage)
      socket.off("messages-read", handleMessagesRead)
      socket.off("messages-delivered", handleMessagesDelivered)
      socket.off("message-delivered", handleMessageDelivered)
      socket.off("user-typing", handleUserTyping)
      socket.off("user-stopped-typing", handleUserStoppedTyping)
      clearInterval(interval)
    }
  }, [conversation.id, conversation._id, messages.length]) // Added messages.length dependency to trigger initial read mark

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() && !selectedFile) return

    setSending(true)

    try {
      if (selectedFile) {
        // Determine file type
        let messageType: MessageType = 'file'
        if (selectedFile.type.startsWith('image/')) {
          messageType = 'image'
        } else if (selectedFile.type.startsWith('audio/')) {
          messageType = 'audio'
        }

        // Upload to MongoDB (GridFS) if current url is a data URL, then send message with server URL
        let fileData = {
          name: selectedFile.name,
          size: selectedFile.size,
          mimeType: selectedFile.type,
          url: selectedFile.url as string
        }
        if (typeof selectedFile.url === 'string' && selectedFile.url.startsWith('data:')) {
          const uploaded = await uploadDataUrl(selectedFile.url, selectedFile.name, selectedFile.type)
          fileData = {
            name: uploaded.name,
            size: uploaded.size,
            mimeType: uploaded.mimeType,
            url: uploaded.url
          }
        }

        await sendMessage(
          conversation.id || conversation._id || '',
          currentUser.id || currentUser._id || '',
          selectedFile.name || 'File',
          messageType,
          fileData,
          messageType === 'image' ? viewOnce : false
        )
        setSelectedFile(null)
        setViewOnce(false)
      } else if (newMessage.trim()) {
        // Send text message
        await sendMessage(
          conversation.id || conversation._id || '',
          currentUser.id || currentUser._id || '',
          newMessage,
          'text'
        )
        setNewMessage('')
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }

    setSending(false)
  }

  const handleEmojiSelect = (emoji: string) => {
    // Add emoji to the message input instead of sending immediately
    setNewMessage((prev) => prev + emoji)
  }

  const handleAudioRecorded = async (audioData: any) => {
    try {
      let fileData = {
        name: audioData.name,
        size: audioData.size,
        mimeType: audioData.type,
        url: audioData.url
      }
      if (typeof audioData.url === 'string' && audioData.url.startsWith('data:')) {
        const uploaded = await uploadDataUrl(audioData.url, audioData.name, audioData.type)
        fileData = { name: uploaded.name, size: uploaded.size, mimeType: uploaded.mimeType, url: uploaded.url }
      }
      await sendMessage(
        conversation.id || conversation._id || '',
        currentUser.id || currentUser._id || '',
        'Audio message',
        'audio',
        fileData
      )
    } catch (error) {
      console.error('Error sending audio:', error)
    }
  }

  const handleFileSelect = (fileData: any) => {
    setSelectedFile(fileData)
  }

  // Drag and drop state and handlers
  const [isDragging, setIsDragging] = useState(false)

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]

      // Check file size (limit to 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        alert(`File too large! Maximum size is 10MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        return;
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string
        setSelectedFile({
          name: file.name,
          size: file.size,
          type: file.type,
          url: dataUrl,
        })
      }
      reader.readAsDataURL(file)
    }
  }

  if (!otherUser) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 transition-colors duration-200">
      {/* Chat Header */}
      <ChatHeader
        otherUser={otherUser}
        onBack={onBack}
        isGroup={conversation.isGroup}
        onShowSharedMedia={() => setShowSharedMedia(true)}
      />

      <Dialog open={showSharedMedia} onOpenChange={setShowSharedMedia}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Shared media</DialogTitle>
          </DialogHeader>
          <SharedMedia conversationId={conversation.id || conversation._id} />
        </DialogContent>
      </Dialog>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto bg-white dark:bg-slate-900 p-6 space-y-0 relative transition-colors duration-200"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Drag overlay */}
        {isDragging && (
          <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-sm z-50 flex items-center justify-center border-4 border-dashed border-emerald-500">
            <div className="text-center">
              <div className="text-6xl mb-4">📁</div>
              <p className="text-emerald-700 text-2xl font-bold">Drop file here</p>
            </div>
          </div>
        )}
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="text-5xl mb-4 animate-bounce">💬</div>
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                Start the conversation with {otherUser.username}
              </p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">Say hello to get started!</p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            // Properly check if message is from current user - handle both _id and id
            const messageSenderId = message.senderId || message.sender?._id || message.sender?.id
            const currentUserId = currentUser.id || currentUser._id
            const isOwn = messageSenderId === currentUserId

            return (
              <MessageItem
                key={message._id || message.id}
                message={message}
                isOwn={isOwn}
                isGroup={conversation.isGroup}
                currentUserId={currentUserId}
              />
            )
          })
        )}
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start items-end gap-2.5 mb-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex-shrink-0 flex items-center justify-center text-white text-xs font-semibold shadow-md">
              U
            </div>
            <div className="max-w-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl rounded-bl-none px-4 py-2.5 shadow-sm">
              <div className="flex items-center gap-1 text-sm italic">
                <span>{typingUser} is typing</span>
                <span className="flex gap-0.5">
                  <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                </span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 py-4 shadow-lg transition-colors duration-200">
        {selectedFile && (
          <div className="mb-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-slate-800 dark:to-slate-700 rounded-xl border border-blue-200 dark:border-slate-600">
            <div className="flex items-start gap-3">
              {/* Image preview for images */}
              {selectedFile.type.startsWith('image/') && selectedFile.url && (
                <img
                  src={selectedFile.url}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded-lg border-2 border-blue-300 dark:border-slate-500 flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">
                    {selectedFile.type.startsWith('image/') ? '🖼️' :
                      selectedFile.type.includes('pdf') ? '📄' :
                        selectedFile.type.startsWith('audio/') ? '🎵' : '📎'}
                  </span>
                  <span className="text-sm font-medium text-blue-900 dark:text-white truncate">{selectedFile.name}</span>
                </div>
                <span className="text-xs text-blue-700 dark:text-slate-300">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </span>

                {/* View Once Toggle for Images */}
                {selectedFile.type.startsWith('image/') && (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="viewOnce"
                      checked={viewOnce}
                      onChange={(e) => setViewOnce(e.target.checked)}
                      className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                    />
                    <label htmlFor="viewOnce" className="text-xs font-medium text-blue-900 dark:text-white cursor-pointer flex items-center gap-1">
                      <span>👁️</span>
                      <span>View once</span>
                    </label>
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  setSelectedFile(null)
                  setViewOnce(false)
                }}
                className="text-blue-600 dark:text-slate-300 hover:text-blue-800 dark:hover:text-white hover:bg-blue-200 dark:hover:bg-slate-600 rounded-full p-1 transition-colors flex-shrink-0"
              >
                ✕
              </button>
            </div>
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex gap-2.5 items-end relative">
          <FileAttachment onFileSelect={handleFileSelect} />
          <AudioRecorder onAudioRecorded={handleAudioRecorded} />
          <Input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value)

              // Emit typing event
              const { socket } = require('@/lib/api')
              socket.emit('typing', {
                conversationId: conversation.id || conversation._id,
                userId: currentUser.id || currentUser._id,
                username: currentUser.username
              })

              // Clear previous timeout
              if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current)
              }

              // Stop typing after 2 seconds of inactivity
              typingTimeoutRef.current = setTimeout(() => {
                socket.emit('stop-typing', {
                  conversationId: conversation.id || conversation._id,
                  userId: currentUser.id || currentUser._id
                })
              }, 2000)
            }}
            disabled={sending}
            className="flex-1 rounded-full border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-400 focus:ring-emerald-200 dark:text-white dark:placeholder-slate-400 py-2.5 px-5 text-sm transition-colors duration-200"
          />
          <div className="relative">
            <Button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 p-2.5 rounded-full h-auto transition-all"
              title="Emoji"
            >
              😊
            </Button>
            {showEmojiPicker && (
              <EmojiPicker
                onEmojiSelect={handleEmojiSelect}
                onClose={() => setShowEmojiPicker(false)}
              />
            )}
          </div>
          <Button
            type="submit"
            disabled={sending || (!newMessage.trim() && !selectedFile)}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-2.5 rounded-full font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {sending ? '⏳' : '✓'}
          </Button>
        </form>
      </div>
    </div>
  )
}
