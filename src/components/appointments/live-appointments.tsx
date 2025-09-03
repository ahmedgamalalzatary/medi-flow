"use client"

import { useState } from 'react'
import { useRealtimeAppointments } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { format, formatDistanceToNow, isToday, isTomorrow } from 'date-fns'
import { createClient } from '@/lib/supabase'

export function LiveAppointments() {
  const { appointments, loading } = useRealtimeAppointments()
  const { profile } = useAuth()
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const supabase = createClient()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'REQUESTED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'DECLINED':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'RESCHEDULED':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'REQUESTED':
        return <AlertCircle className="h-4 w-4" />
      case 'ACCEPTED':
        return <CheckCircle className="h-4 w-4" />
      case 'DECLINED':
        return <XCircle className="h-4 w-4" />
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />
      case 'CANCELLED':
        return <XCircle className="h-4 w-4" />
      case 'RESCHEDULED':
        return <RefreshCw className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const formatAppointmentDate = (dateString: string) => {
    const date = new Date(dateString)
    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`
    } else if (isTomorrow(date)) {
      return `Tomorrow at ${format(date, 'h:mm a')}`
    } else {
      return format(date, 'MMM d, yyyy \'at\' h:mm a')
    }
  }

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    setUpdatingStatus(appointmentId)
    
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId)

      if (error) {
        console.error('Error updating appointment status:', error)
      }
    } catch (error) {
      console.error('Error updating appointment status:', error)
    } finally {
      setUpdatingStatus(null)
    }
  }

  const canUpdateStatus = (appointment: any) => {
    if (profile?.role === 'DOCTOR') {
      return ['REQUESTED', 'ACCEPTED'].includes(appointment.status)
    }
    if (profile?.role === 'PATIENT') {
      return ['REQUESTED', 'ACCEPTED'].includes(appointment.status)
    }
    return false
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Live Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center space-x-3 p-4 border rounded-lg animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const upcomingAppointments = appointments
    .filter(apt => new Date(apt.scheduled_at) > new Date())
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())

  const recentAppointments = appointments
    .filter(apt => new Date(apt.scheduled_at) <= new Date())
    .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Appointments
            <Badge variant="secondary" className="ml-2">
              {upcomingAppointments.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No upcoming appointments</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {profile?.role === 'PATIENT' ? (
                            <Stethoscope className="h-5 w-5" />
                          ) : (
                            <User className="h-5 w-5" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">
                            {profile?.role === 'PATIENT' ? 'Dr. ' : 'Patient: '}
                            {appointment.doctor_id || appointment.patient_id}
                          </h4>
                          <Badge className={getStatusColor(appointment.status)}>
                            {getStatusIcon(appointment.status)}
                            <span className="ml-1">{appointment.status}</span>
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {formatAppointmentDate(appointment.scheduled_at)}
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Duration: {appointment.duration.replace('_', ' ')}
                          </div>
                          {appointment.illness && (
                            <p className="text-sm">
                              <strong>Concern:</strong> {appointment.illness}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {canUpdateStatus(appointment) && (
                      <div className="flex gap-2">
                        {profile?.role === 'DOCTOR' && appointment.status === 'REQUESTED' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateAppointmentStatus(appointment.id, 'ACCEPTED')}
                              disabled={updatingStatus === appointment.id}
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateAppointmentStatus(appointment.id, 'DECLINED')}
                              disabled={updatingStatus === appointment.id}
                            >
                              Decline
                            </Button>
                          </>
                        )}
                        {appointment.status === 'ACCEPTED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateAppointmentStatus(appointment.id, 'COMPLETED')}
                            disabled={updatingStatus === appointment.id}
                          >
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Appointments */}
      {recentAppointments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {profile?.role === 'PATIENT' ? (
                          <Stethoscope className="h-4 w-4" />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {profile?.role === 'PATIENT' ? 'Dr. ' : 'Patient: '}
                        {appointment.doctor_id || appointment.patient_id}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(appointment.scheduled_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(appointment.status)}>
                    {appointment.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}