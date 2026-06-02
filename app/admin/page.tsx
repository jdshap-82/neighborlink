'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface ServiceRequest {
  id: string
  resident_id: string | null
  service: string
  title: string
  description: string
  urgency: 'ASAP' | 'This week' | 'Flexible'
  status: 'pending' | 'open' | 'paused' | 'in_progress' | 'archived' | 'denied'
  address_hint?: string
  response_count: number
  photos?: string[]
  accepted_contractor_name?: string
  accepted_contractor_email?: string
  contractor_complete?: boolean
  resident_complete?: boolean
  created_at: string
  updated_at: string
}

interface User {
  id: string
  role: 'resident' | 'contractor' | 'admin'
  name: string
  email: string
}

const STATUS_TABS = ['pending', 'open', 'in_progress', 'archived', 'denied'] as const
type StatusTab = typeof STATUS_TABS[number]

const STATUS_LABELS: Record<StatusTab, string> = {
  pending: 'Pending Approval',
  open: 'Open',
  in_progress: 'In Progress',
  archived: 'Archived',
  denied: 'Denied',
}

const STATUS_BADGE: Record<StatusTab, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  open: 'bg-green-100 text-green-800',
  in_progress: 'bg-blue-100 text-blue-800',
  archived: 'bg-gray-100 text-gray-500',
  denied: 'bg-red-100 text-red-800',
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null)
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [activeTab, setActiveTab] = useState<StatusTab>('pending')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem('neighborlink_user')
    if (!storedUser) {
      router.replace('/login')
      return
    }
    const parsed = JSON.parse(storedUser)
    if (parsed.role !== 'admin') {
      router.replace('/')
      return
    }
    setUser(parsed)
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setRequests(data || [])
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (requestId: string) => {
    setActionLoading(requestId + '-approve')
    try {
      const { error } = await supabase
        .from('requests')
        .update({ status: 'open' })
        .eq('id', requestId)
      if (error) throw error
      await fetchRequests()
    } catch (error) {
      console.error('Error approving request:', error)
      alert('Error approving request: ' + (error as any)?.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeny = async (requestId: string) => {
    if (!confirm('Deny this request? The resident will see it marked as Denied.')) return
    setActionLoading(requestId + '-deny')
    try {
      const { error } = await supabase
        .from('requests')
        .update({ status: 'denied' })
        .eq('id', requestId)
      if (error) throw error
      await fetchRequests()
    } catch (error) {
      console.error('Error denying request:', error)
      alert('Error denying request: ' + (error as any)?.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (requestId: string) => {
    if (!confirm('Permanently delete this request and all its messages?')) return
    setActionLoading(requestId + '-delete')
    try {
      const res = await fetch('/api/requests/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: requestId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Delete failed')
      await fetchRequests()
    } catch (error) {
      console.error('Error deleting request:', error)
      alert('Error deleting: ' + (error as any)?.message)
    } finally {
      setActionLoading(null)
    }
  }

  const filteredRequests = requests.filter((r) => r.status === activeTab)

  const countByStatus = (status: StatusTab) => requests.filter((r) => r.status === status).length

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#F9F6F1] pb-12">
      <div className="max-w-6xl mx-auto px-6 pt-10">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm uppercase tracking-wide text-gray-500">Admin Dashboard</p>
          <h1 className="text-4xl font-bold text-gray-900 mt-1">Manage Requests</h1>
          <p className="text-gray-600 mt-2">Review, approve, or deny service requests submitted by residents.</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {STATUS_TABS.map((status) => (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className={`rounded-2xl border p-4 text-left transition ${
                activeTab === status
                  ? 'border-[#1B6B4A] bg-[#E6F4ED] shadow-sm'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <p className="text-xs uppercase tracking-wide text-gray-500">{STATUS_LABELS[status]}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{countByStatus(status)}</p>
            </button>
          ))}
        </div>

        {/* Tab bar */}
        <div className="flex gap-2 border-b border-gray-200 mb-6 overflow-x-auto">
          {STATUS_TABS.map((status) => (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className={`pb-3 px-4 font-semibold text-sm whitespace-nowrap transition ${
                activeTab === status
                  ? 'text-[#1B6B4A] border-b-2 border-[#1B6B4A]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {STATUS_LABELS[status]} ({countByStatus(status)})
            </button>
          ))}
        </div>

        {/* Request list */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-[#1B6B4A] border-t-transparent rounded-full"></div>
            <p className="text-gray-600 mt-4">Loading…</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No {STATUS_LABELS[activeTab].toLowerCase()} requests.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE[activeTab]}`}>
                        {STATUS_LABELS[activeTab]}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                        {request.service}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-[#E6F4ED] text-[#1B6B4A] text-xs font-semibold">
                        {request.urgency}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{request.title}</h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-3">{request.description}</p>
                    {request.address_hint && (
                      <p className="text-sm text-gray-500 mb-1">📍 {request.address_hint}</p>
                    )}
                    {request.status === 'in_progress' && request.accepted_contractor_name && (
                      <p className="text-sm text-blue-700 font-semibold">
                        Contractor: {request.accepted_contractor_name} ({request.accepted_contractor_email})
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      Submitted {new Date(request.created_at).toLocaleString()} · ID: {request.id}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    {request.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(request.id)}
                          disabled={actionLoading === request.id + '-approve'}
                          className="px-5 py-2 rounded-xl bg-[#1B6B4A] text-white font-semibold text-sm hover:bg-[#134E35] transition disabled:opacity-50"
                        >
                          {actionLoading === request.id + '-approve' ? 'Approving…' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleDeny(request.id)}
                          disabled={actionLoading === request.id + '-deny'}
                          className="px-5 py-2 rounded-xl bg-red-100 text-red-700 font-semibold text-sm hover:bg-red-200 transition disabled:opacity-50"
                        >
                          {actionLoading === request.id + '-deny' ? 'Denying…' : 'Deny'}
                        </button>
                      </>
                    )}
                    {request.status === 'denied' && (
                      <button
                        onClick={() => handleApprove(request.id)}
                        disabled={actionLoading === request.id + '-approve'}
                        className="px-5 py-2 rounded-xl bg-[#1B6B4A] text-white font-semibold text-sm hover:bg-[#134E35] transition disabled:opacity-50"
                      >
                        Re-approve
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(request.id)}
                      disabled={actionLoading === request.id + '-delete'}
                      className="px-5 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition disabled:opacity-50"
                    >
                      {actionLoading === request.id + '-delete' ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </div>

                {/* Photos */}
                {request.photos && request.photos.length > 0 && (
                  <div className="mt-4 flex gap-2 overflow-x-auto">
                    {request.photos.map((photo, idx) => (
                      <img key={idx} src={photo} alt="Request photo" className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
