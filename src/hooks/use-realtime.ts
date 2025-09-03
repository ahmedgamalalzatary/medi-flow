"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth } from './use-auth'
import { Database } from '@/types/database'

type Message = Database['public']['Tables']['messages']['Row']
type Appointment = Database['public']['Tables']['appointments']['Row']

export function useRealtimeMessages() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (!user) return

    // Fetch initial messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: true })

      if (!error && data) {
        setMessages(data)
      }
      setLoading(false)
    }

    fetchMessages()

    // Subscribe to real-time updates
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(sender_id.eq.${user.id},receiver_id.eq.${user.id})`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `or(sender_id.eq.${user.id},receiver_id.eq.${user.id})`
        },
        (payload) => {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === payload.new.id ? payload.new as Message : msg
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, supabase])

  const sendMessage = async (receiverId: string, content: string) => {
    if (!user) return { error: 'Not authenticated' }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        receiver_id: receiverId,
        content,
        status: 'SENT'
      })
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    return { data }
  }

  const markAsRead = async (messageId: string) => {
    const { error } = await supabase
      .from('messages')
      .update({ status: 'READ' })
      .eq('id', messageId)
      .eq('receiver_id', user?.id)

    if (error) {
      return { error: error.message }
    }

    return {}
  }

  return {
    messages,
    loading,
    sendMessage,
    markAsRead
  }
}

export function useRealtimeAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const { user, profile } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (!user || !profile) return

    // Fetch initial appointments
    const fetchAppointments = async () => {
      let query = supabase
        .from('appointments')
        .select('*')
        .order('scheduled_at', { ascending: true })

      // Filter by user role
      if (profile.role === 'PATIENT') {
        query = query.eq('patient_id', user.id)
      } else if (profile.role === 'DOCTOR') {
        query = query.eq('doctor_id', user.id)
      }

      const { data, error } = await query

      if (!error && data) {
        setAppointments(data)
      }
      setLoading(false)
    }

    fetchAppointments()

    // Subscribe to real-time updates
    const channel = supabase
      .channel('appointments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: profile.role === 'PATIENT' 
            ? `patient_id=eq.${user.id}` 
            : `doctor_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setAppointments(prev => [...prev, payload.new as Appointment])
          } else if (payload.eventType === 'UPDATE') {
            setAppointments(prev =>
              prev.map(apt =>
                apt.id === payload.new.id ? payload.new as Appointment : apt
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setAppointments(prev =>
              prev.filter(apt => apt.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, profile, supabase])

  return {
    appointments,
    loading
  }
}

export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<any[]>([])
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (!user) return

    // Subscribe to appointment status changes for notifications
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'appointments',
          filter: `patient_id=eq.${user.id}`
        },
        (payload) => {
          const appointment = payload.new as Appointment
          if (payload.old.status !== appointment.status) {
            const notification = {
              id: Date.now(),
              type: 'appointment_status_change',
              title: 'Appointment Update',
              message: `Your appointment status changed to ${appointment.status}`,
              timestamp: new Date().toISOString(),
              read: false
            }
            setNotifications(prev => [notification, ...prev])
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`
        },
        (payload) => {
          const message = payload.new as Message
          const notification = {
            id: Date.now(),
            type: 'new_message',
            title: 'New Message',
            message: 'You have received a new message',
            timestamp: message.created_at,
            read: false
          }
          setNotifications(prev => [notification, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, supabase])

  const markNotificationAsRead = (notificationId: number) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    )
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  return {
    notifications,
    markNotificationAsRead,
    clearNotifications
  }
}