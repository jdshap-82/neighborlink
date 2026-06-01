'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const SERVICES = [
  { id: 'hvac', label: 'HVAC', icon: '❄️' },
  { id: 'plumbing', label: 'Plumbing', icon: '🔧' },
  { id: 'electrical', label: 'Electrical', icon: '⚡' },
  { id: 'handyman', label: 'Handyman', icon: '🛠️' },
  { id: 'pool', label: 'Pool Services', icon: '🏊' },
  { id: 'roofing', label: 'Roofing', icon: '🏠' },
  { id: 'lawn', label: 'Lawn Care', icon: '🌿' },
  { id: 'irrigation', label: 'Irrigation', icon: '💧' },
  { id: 'pest', label: 'Pest Control', icon: '🐜' },
  { id: 'doggrooming', label: 'Dog Grooming', icon: '🐕' },
  { id: 'babysitter', label: 'Babysitter', icon: '👶' },
  { id: 'dogwalking', label: 'Dog Walking', icon: '🦮' },
  { id: 'appliance', label: 'Appliance Repair', icon: '🔌' },
  { id: 'painting', label: 'Painting', icon: '🎨' },
  { id: 'golfcart', label: 'Golf Cart Repair', icon: '🏌️' },
]

interface ServiceRequest {
  id: string
  resident_id: string | null
  service: string
  title: string
  description: string
  urgency: 'ASAP' | 'This week' | 'Flexible'
  status: 'open' | 'paused' | 'completed'
  address_hint?: string
  response_count: number
  photos?: string[]
  created_at: string
  updated_at: string
}

interface Message {
  id: string
  request_id: string
  contractor_name: string
  contractor_email: string
  message: string
  created_at: string
}

interface Review {
  id: string
  contractor_name: string
  rating: number
  comment: string
  created_at: string
}

interface User {
  id: string
  role: 'resident' | 'contractor'
  name: string
  email: string
  trade?: string
  phone?: string
}

export default function ContractorDashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [messageForm, setMessageForm] = useState({
    subject: '',
    message: '',
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem('neighborlink_user')
    if (storedUser) {
      const parsed = JSON.parse(storedUser)
      setUser(parsed)
      if (parsed.role !== 'contractor') {
        router.push('/login?role=contractor')
      }
      fetchMessages(parsed.email)
    }
    fetchRequests()
    loadReviews()
  }, [])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false })

      if (error) throw error
      setRequests(data || [])
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('contractor_email', email)
        .order('created_at', { ascending: false })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching contractor messages:', error)
    }
  }

  const loadReviews = () => {
    const storedReviews = localStorage.getItem('neighborlink_reviews')
    if (storedReviews) {
      try {
        setReviews(JSON.parse(storedReviews))
      } catch {
        setReviews([])
      }
    }
  }

  const openMessageModal = (request: ServiceRequest) => {
    setSelectedRequest(request)
    setMessageForm({ subject: '', message: '' })
    setShowMessageModal(true)
  }

  const handleSendMessage = async () => {
    if (!user || !selectedRequest) return
    if (!messageForm.subject || !messageForm.message) {
      alert('Please enter a subject and message.')
      return
    }

    try {
      const { error } = await supabase.from('messages').insert([
        {
          request_id: selectedRequest.id,
          contractor_name: user.name,
          contractor_email: user.email,
          message: `${messageForm.subject}\n\n${messageForm.message}`,
        },
      ])
      if (error) throw error
      await fetchMessages(user.email)
      setShowMessageModal(false)
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Unable to send message. Please try again.')
    }
  }

  const filteredReviews = user
    ? reviews.filter((review) => review.contractor_name.toLowerCase().includes(user.name.toLowerCase()))
    : []

  const averageRating =
    filteredReviews.length > 0
      ? (filteredReviews.reduce((sum, review) => sum + review.rating, 0) / filteredReviews.length).toFixed(1)
      : null

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F9F6F1] flex items-center justify-center px-6 py-12">
        <div className="bg-white rounded-3xl border border-gray-200 p-10 text-center max-w-xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Contractor Dashboard</h1>
          <p className="text-gray-600 mb-6">Please log in to access your contractor dashboard and view messages, requests, and ratings.</p>
          <Link href="/login?role=contractor" className="px-6 py-3 rounded-xl bg-[#1B6B4A] text-white font-semibold hover:bg-[#134E35] transition">
            Log In as Contractor
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F9F6F1] pb-12">
      <div className="max-w-7xl mx-auto px-6 pt-10">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Contractor Dashboard</h1>
            <p className="text-gray-600 max-w-2xl">
              Welcome back, {user.name}. Here are the latest open requests, your in-app messages, and your contractor ratings.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-3xl bg-white border border-gray-200 p-6 shadow-sm">
              <p className="text-sm uppercase tracking-wide text-gray-500">Open Requests</p>
              <p className="text-3xl font-bold text-[#1B6B4A] mt-2">{requests.length}</p>
            </div>
            <div className="rounded-3xl bg-white border border-gray-200 p-6 shadow-sm">
              <p className="text-sm uppercase tracking-wide text-gray-500">Messages Sent</p>
              <p className="text-3xl font-bold text-[#1B6B4A] mt-2">{messages.length}</p>
            </div>
            <div className="rounded-3xl bg-white border border-gray-200 p-6 shadow-sm col-span-1 sm:col-span-2">
              <p className="text-sm uppercase tracking-wide text-gray-500">Average Rating</p>
              <p className="text-3xl font-bold text-[#1B6B4A] mt-2">{averageRating ?? 'No reviews yet'}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="space-y-6">
            <div className="rounded-3xl bg-white border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Available Open Requests</h2>
                  <p className="text-sm text-gray-500">Reach out to residents from this list.</p>
                </div>
                <span className="inline-flex items-center rounded-full bg-[#E6F4ED] px-3 py-1 text-xs font-semibold text-[#1B6B4A]">Live</span>
              </div>

              {loading ? (
                <div className="text-center py-10">
                  <div className="animate-spin inline-block w-8 h-8 border-4 border-[#1B6B4A] border-t-transparent rounded-full"></div>
                  <p className="text-gray-600 mt-4">Loading requests…</p>
                </div>
              ) : requests.length === 0 ? (
                <p className="text-gray-500">No open requests available right now. Check back soon.</p>
              ) : (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <div key={request.id} className="rounded-3xl border border-gray-200 p-4 hover:shadow-lg transition">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-gray-500">{request.service}</p>
                          <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                        </div>
                        <span className="rounded-full bg-[#E6F4ED] px-3 py-1 text-sm font-semibold text-[#1B6B4A]">
                          {request.urgency}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{request.description}</p>
                      {request.address_hint && <p className="text-sm text-gray-500 mb-3">📍 {request.address_hint}</p>}
                      <button
                        onClick={() => openMessageModal(request)}
                        className="inline-flex items-center justify-center rounded-full bg-[#1B6B4A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#134E35] transition"
                      >
                        Message Resident
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl bg-white border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Reviews for You</h2>
                  <p className="text-sm text-gray-500">Resident feedback from your completed work.</p>
                </div>
                <span className="text-sm text-gray-500">{filteredReviews.length} reviews</span>
              </div>
              {filteredReviews.length === 0 ? (
                <p className="text-gray-500">No contractor reviews yet. Encourage residents to leave feedback after a job.</p>
              ) : (
                <div className="space-y-4">
                  {filteredReviews.map((review) => (
                    <div key={review.id} className="rounded-3xl bg-[#F9F6F1] p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-gray-900">{review.contractor_name}</p>
                        <p className="text-sm text-[#1B6B4A] font-bold">{review.rating} ★</p>
                      </div>
                      <p className="text-gray-600 text-sm">{review.comment}</p>
                      <p className="text-xs text-gray-400 mt-3">{new Date(review.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-3xl bg-white border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Your Messages</h2>
                  <p className="text-sm text-gray-500">Messages you’ve sent to residents through NeighborLink.</p>
                </div>
                <span className="text-sm text-gray-500">{messages.length}</span>
              </div>
              {messages.length === 0 ? (
                <p className="text-gray-500">No messages sent yet. Message a request to begin the conversation.</p>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className="rounded-3xl bg-[#F9F6F1] p-4 border border-gray-200">
                      <p className="text-sm text-gray-700 line-clamp-3">{message.message}</p>
                      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                        <span>{new Date(message.created_at).toLocaleDateString()}</span>
                        <span>{message.contractor_email}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {showMessageModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white border border-gray-200 p-6 shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Message Resident</h2>
                <p className="text-sm text-gray-500">Request: {selectedRequest.title}</p>
              </div>
              <button
                onClick={() => setShowMessageModal(false)}
                className="text-gray-400 hover:text-gray-600 text-3xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Subject</label>
                <input
                  value={messageForm.subject}
                  onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
                  placeholder="Introduce yourself and your service"
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:border-[#1B6B4A] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Message</label>
                <textarea
                  value={messageForm.message}
                  onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                  rows={5}
                  placeholder="Describe how you can help and your availability."
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:border-[#1B6B4A] focus:outline-none resize-none"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowMessageModal(false)}
                  className="rounded-2xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendMessage}
                  className="rounded-2xl bg-[#1B6B4A] px-5 py-3 text-sm font-semibold text-white hover:bg-[#134E35] transition"
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
