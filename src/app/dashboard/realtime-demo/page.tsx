"use client"

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { MessageCenter, MessagesList } from '@/components/messaging/message-center'
import { NotificationCenter } from '@/components/notifications/notification-center'
import { LiveAppointments } from '@/components/appointments/live-appointments'
import { 
  MessageSquare, 
  Bell, 
  Calendar, 
  Zap,
  Users,
  Activity
} from 'lucide-react'

export default function RealtimeDemo() {
  const { user, profile, loading } = useAuth()
  const [selectedTab, setSelectedTab] = useState('appointments')

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading real-time features...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-600">Please sign in to access real-time features.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Real-time Features Demo
              </h1>
              <p className="text-gray-600">
                Experience live updates powered by Supabase Realtime
              </p>
            </div>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Activity className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Connection Status</p>
                    <p className="font-semibold text-green-600">Connected</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">User Role</p>
                    <p className="font-semibold">{profile.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Zap className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Real-time Engine</p>
                    <p className="font-semibold">Supabase</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Badge className="bg-orange-600">
                      LIVE
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-semibold">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Real-time Features Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="appointments" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Live Appointments
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Real-time Messaging
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Live Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Live Appointment Updates
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Appointments update in real-time as status changes occur. 
                  Try updating an appointment status to see live updates.
                </p>
              </CardHeader>
              <CardContent>
                <LiveAppointments />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Message Conversations
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Your recent conversations with real-time message delivery.
                  </p>
                </CardHeader>
                <CardContent>
                  <MessagesList />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Live Chat Demo
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Select a conversation to see real-time messaging in action.
                  </p>
                </CardHeader>
                <CardContent>
                  <MessageCenter 
                    recipientId="demo-user"
                    recipientName="Demo User"
                    recipientAvatar=""
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Real-time Notifications
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Notifications appear instantly when events occur. 
                  Check the notification bell in the navbar for live updates.
                </p>
              </CardHeader>
              <CardContent>
                <NotificationCenter />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Feature Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Real-time Features Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold">Live Appointments</h3>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Real-time status updates</li>
                  <li>• Instant appointment notifications</li>
                  <li>• Live scheduling changes</li>
                  <li>• Automatic UI updates</li>
                </ul>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold">Real-time Messaging</h3>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Instant message delivery</li>
                  <li>• Read receipts</li>
                  <li>• Live typing indicators</li>
                  <li>• Message status updates</li>
                </ul>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-orange-600" />
                  <h3 className="font-semibold">Live Notifications</h3>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Instant push notifications</li>
                  <li>• Real-time badge updates</li>
                  <li>• Event-driven alerts</li>
                  <li>• Auto-categorization</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}