"use client"

import { useState, useEffect, useRef } from 'react'
import { useRealtimeMessages } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Send, MessageCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface MessageCenterProps {
  recipientId?: string
  recipientName?: string
  recipientAvatar?: string
}

export function MessageCenter({ recipientId, recipientName, recipientAvatar }: MessageCenterProps) {
  const { user, profile } = useAuth()
  const { messages, loading, sendMessage, markAsRead } = useRealtimeMessages()
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Filter messages for current conversation
  const conversationMessages = messages.filter(msg => 
    (msg.sender_id === user?.id && msg.receiver_id === recipientId) ||
    (msg.sender_id === recipientId && msg.receiver_id === user?.id)
  )

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversationMessages])

  // Mark messages as read when component mounts or messages change
  useEffect(() => {
    const unreadMessages = conversationMessages.filter(
      msg => msg.receiver_id === user?.id && msg.status === 'SENT'
    )

    unreadMessages.forEach(msg => {
      markAsRead(msg.id)
    })
  }, [conversationMessages, user?.id, markAsRead])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !recipientId || sending) return

    setSending(true)
    const result = await sendMessage(recipientId, newMessage.trim())
    
    if (!result.error) {
      setNewMessage('')
    }
    setSending(false)
  }

  if (loading) {
    return (
      <Card className="h-[500px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading messages...</p>
        </div>
      </Card>
    )
  }

  if (!recipientId) {
    return (
      <Card className="h-[500px] flex items-center justify-center">
        <div className="text-center text-gray-500">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Select a conversation to start messaging</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="h-[500px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={recipientAvatar} alt={recipientName} />
            <AvatarFallback>
              {recipientName?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{recipientName}</p>
            <p className="text-xs text-gray-500">
              {profile?.role === 'PATIENT' ? 'Doctor' : 'Patient'}
            </p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 py-4">
            {conversationMessages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              conversationMessages.map((message) => {
                const isOwnMessage = message.sender_id === user?.id
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-3 py-2 ${
                        isOwnMessage
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className={`flex items-center gap-2 mt-1 ${
                        isOwnMessage ? 'justify-end' : 'justify-start'
                      }`}>
                        <span className={`text-xs ${
                          isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                        </span>
                        {isOwnMessage && (
                          <Badge 
                            variant={message.status === 'READ' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {message.status === 'READ' ? 'Read' : 'Sent'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <form onSubmit={handleSendMessage} className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={sending}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={!newMessage.trim() || sending}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export function MessagesList() {
  const { messages, loading } = useRealtimeMessages()
  const { user } = useAuth()
  const [conversations, setConversations] = useState<any[]>([])

  useEffect(() => {
    if (!user || !messages.length) return

    // Group messages by conversation
    const conversationMap = new Map()

    messages.forEach(message => {
      const otherUserId = message.sender_id === user.id ? message.receiver_id : message.sender_id
      
      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, {
          userId: otherUserId,
          lastMessage: message,
          unreadCount: 0
        })
      } else {
        const existing = conversationMap.get(otherUserId)
        if (new Date(message.created_at) > new Date(existing.lastMessage.created_at)) {
          existing.lastMessage = message
        }
      }

      // Count unread messages
      if (message.receiver_id === user.id && message.status === 'SENT') {
        const existing = conversationMap.get(otherUserId)
        existing.unreadCount++
      }
    })

    setConversations(Array.from(conversationMap.values()))
  }, [messages, user])

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg animate-pulse">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {conversations.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No conversations yet</p>
        </div>
      ) : (
        conversations.map(conversation => (
          <div
            key={conversation.userId}
            className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {conversation.lastMessage.sender_id === user?.id ? 'You' : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium truncate">
                  {conversation.userId}
                </p>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(conversation.lastMessage.created_at), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm text-gray-600 truncate">
                {conversation.lastMessage.content}
              </p>
            </div>
            {conversation.unreadCount > 0 && (
              <Badge variant="default" className="ml-2">
                {conversation.unreadCount}
              </Badge>
            )}
          </div>
        ))
      )}
    </div>
  )
}