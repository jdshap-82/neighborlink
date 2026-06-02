'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
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

export default function BoardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<ServiceRequest[]>([])
  const [userRequests, setUserRequests] = useState<ServiceRequest[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPostForm, setShowPostForm] = useState(false)
  const [showMyRequests, setShowMyRequests] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null)
  const [showMessages, setShowMessages] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [photoPreview, setPhotoPreview] = useState<string>('')
  const [editingRequestId, setEditingRequestId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    service: '',
    title: '',
    description: '',
    urgency: 'This week' as const,
    address_hint: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    contact_note: '',
    photos: [] as string[],
  })
  const [messageForm, setMessageForm] = useState({
    contractor_name: '',
    contractor_email: '',
    message: '',
  })
  const [reviewData, setReviewData] = useState({
    contractor_name: '',
    rating: 5,
    comment: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  // Fetch requests from Supabase
  useEffect(() => {
    const savedUser = localStorage.getItem('neighborlink_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    fetchRequests()
    loadReviews()
  }, [])

  useEffect(() => {
    if (user?.role === 'resident') {
      setUserRequests(requests.filter((r) => r.resident_id === user.id))
    } else {
      setUserRequests([])
    }
  }, [user, requests])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const allRequests = data || []
      setRequests(allRequests)
      setFilteredRequests(allRequests)
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
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

  // Filter requests by category
  const handleCategoryFilter = (categoryId: string | null) => {
    setSelectedCategory(categoryId)
    if (categoryId === null) {
      setFilteredRequests(requests)
    } else {
      setFilteredRequests(
        requests.filter((req) => req.service === categoryId)
      )
    }
  }

  const handleEditRequest = (request: ServiceRequest) => {
    setEditingRequestId(request.id)
    setFormData({
      service: request.service,
      title: request.title,
      description: request.description,
      urgency: request.urgency,
      address_hint: request.address_hint || '',
      contact_name: '',
      contact_email: '',
      contact_phone: '',
      contact_note: '',
      photos: request.photos || [],
    })
    setPhotoPreview(request.photos?.[0] || '')
    setShowPostForm(true)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.service || !formData.title) {
      alert('Please fill in all required fields')
      return
    }

    if (!user || user.role !== 'resident') {
      alert('Please log in as a resident to post a request.')
      return
    }

    try {
      setSubmitting(true)

      const contactInfoParts = []
      if (formData.contact_name) contactInfoParts.push(`Contact: ${formData.contact_name}`)
      if (formData.contact_email) contactInfoParts.push(`Email: ${formData.contact_email}`)
      if (formData.contact_phone) contactInfoParts.push(`Phone: ${formData.contact_phone}`)
      if (formData.contact_note) contactInfoParts.push(`Note: ${formData.contact_note}`)
      const contactInfo = contactInfoParts.length > 0 ? `\n\n${contactInfoParts.join('\n')}` : ''

      let error = null
      if (editingRequestId) {
        const updatePayload = {
          service: formData.service,
          title: formData.title,
          description: `${formData.description}${contactInfo}`.trim(),
          urgency: formData.urgency,
          address_hint: formData.address_hint || null,
          photos: formData.photos.length > 0 ? formData.photos : null,
        }
        const updateResult = await supabase
          .from('requests')
          .update(updatePayload)
          .eq('id', editingRequestId)
        error = updateResult.error
      } else {
        const insertResult = await supabase.from('requests').insert([
          {
            resident_id: user.id,
            service: formData.service,
            title: formData.title,
            description: `${formData.description}${contactInfo}`.trim(),
            urgency: formData.urgency,
            address_hint: formData.address_hint || null,
            photos: formData.photos.length > 0 ? formData.photos : null,
            response_count: 0,
            status: 'open',
          },
        ])
        error = insertResult.error
      }

      if (error) throw error

      setFormData({
        service: '',
        title: '',
        description: '',
        urgency: 'This week',
        address_hint: '',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        contact_note: '',
        photos: [],
      })
      setPhotoPreview('')
      setShowPostForm(false)
      setEditingRequestId(null)
      fetchRequests()
    } catch (error) {
      console.error('Error posting request:', error)
      alert('Error posting request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSendMessage = async (requestId: string) => {
    if (!messageForm.contractor_name || !messageForm.contractor_email || !messageForm.message) {
      alert('Please enter your name, email, and a message.')
      return
    }

    try {
      const { error } = await supabase.from('messages').insert([
        {
          request_id: requestId,
          contractor_name: messageForm.contractor_name,
          contractor_email: messageForm.contractor_email,
          message: messageForm.message,
        },
      ])

      if (error) throw error

      setMessageForm({ contractor_name: '', contractor_email: '', message: '' })
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}`,
          request_id: requestId,
          contractor_name: messageForm.contractor_name,
          contractor_email: messageForm.contractor_email,
          message: messageForm.message,
          created_at: new Date().toISOString(),
        },
      ])
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Unable to send message. Please try again.')
    }
  }

  const handleSubmitReview = (requestId: string) => {
    if (!reviewData.contractor_name || !reviewData.comment) {
      alert('Please provide the contractor name and your review.')
      return
    }

    const newReview: Review = {
      id: `${Date.now()}`,
      contractor_name: reviewData.contractor_name,
      rating: reviewData.rating,
      comment: reviewData.comment,
      created_at: new Date().toISOString(),
    }

    setReviews((prev) => {
      const next = [newReview, ...prev]
      localStorage.setItem('neighborlink_reviews', JSON.stringify(next))
      return next
    })
    setReviewData({ contractor_name: '', rating: 5, comment: '' })
  }

  // Handle photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64 = reader.result as string
          setFormData((prev) => ({
            ...prev,
            photos: [...prev.photos, base64],
          }))
          setPhotoPreview(base64)
        }
        reader.readAsDataURL(file)
      })
    }
  }

  // Remove photo
  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }))
  }

  // Delete request
  const handleDeleteRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to delete this request?')) return
    try {
      const { error } = await supabase.from('requests').delete().eq('id', requestId)
      if (error) throw error
      fetchRequests()
    } catch (error) {
      console.error('Error deleting request:', error)
      alert('Error deleting request')
    }
  }

  // Pause/Resume request
  const handleTogglePause = async (requestId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'paused' ? 'open' : 'paused'
      const { error } = await supabase
        .from('requests')
        .update({ status: newStatus })
        .eq('id', requestId)
      if (error) throw error
      fetchRequests()
    } catch (error) {
      console.error('Error updating request:', error)
      alert('Error updating request')
    }
  }

  // Republish request
  const handleRepublish = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('requests')
        .update({ created_at: new Date().toISOString(), status: 'open' })
        .eq('id', requestId)
      if (error) throw error
      fetchRequests()
      alert('Request republished!')
    } catch (error) {
      console.error('Error republishing request:', error)
      alert('Error republishing request')
    }
  }

  // Fetch messages for a request
  const handleViewMessages = async (request: ServiceRequest) => {
    setSelectedRequest(request)
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('request_id', request.id)
        .order('created_at', { ascending: true })
      if (error) throw error
      setMessages(data || [])
      setShowMessages(true)
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'ASAP':
        return 'bg-red-100 text-red-800'
      case 'This week':
        return 'bg-yellow-100 text-yellow-800'
      case 'Flexible':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getServiceIcon = (serviceId: string) => {
    const service = SERVICES.find((s) => s.id === serviceId)
    return service?.icon || '📋'
  }

  const getServiceLabel = (serviceId: string) => {
    const service = SERVICES.find((s) => s.id === serviceId)
    return service?.label || serviceId
  }

  return (
    <div className="min-h-screen bg-[#F9F6F1]">
      {/* Page Title & Tabs */}
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Service Requests</h1>
            <p className="text-gray-600">Post your needs and connect with local contractors</p>
          </div>
          <button
            onClick={() => {
              if (user?.role === 'resident') {
                setShowPostForm(true)
              } else {
                router.push('/login?role=resident')
              }
            }}
            className="px-6 py-3 rounded-lg bg-[#1B6B4A] text-white font-semibold hover:bg-[#134E35] transition"
          >
            + Post a Request
          </button>
        </div>
        {!user ? (
          <div className="max-w-7xl mx-auto px-6 pb-4">
            <div className="rounded-2xl bg-[#E6F4ED] p-4 text-sm text-gray-700">
              <span className="font-semibold">Resident?</span> <Link href="/login?role=resident" className="text-[#1B6B4A] underline">Log in</Link> or <Link href="/signup" className="text-[#1B6B4A] underline">sign up</Link> to save requests and use My Requests.
            </div>
          </div>
        ) : user.role === 'contractor' ? (
          <div className="max-w-7xl mx-auto px-6 pb-4">
            <div className="rounded-2xl bg-[#E6F4ED] p-4 text-sm text-gray-700">
              You are logged in as a contractor. Browse requests and message residents directly in the app.
            </div>
          </div>
        ) : null}

        {/* Tab Navigation */}
        <div className="flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setShowMyRequests(false)}
            className={`pb-3 px-4 font-semibold transition ${
              !showMyRequests ? 'text-[#1B6B4A] border-b-2 border-[#1B6B4A]' : 'text-gray-600'
            }`}
          >
            Browse Requests
          </button>
          {user?.role === 'resident' && (
            <button
              onClick={() => setShowMyRequests(true)}
              className={`pb-3 px-4 font-semibold transition ${
                showMyRequests ? 'text-[#1B6B4A] border-b-2 border-[#1B6B4A]' : 'text-gray-600'
              }`}
            >
              My Requests ({userRequests.length})
            </button>
          )}
        </div>
      </div>

      {/* Show "My Requests" Section */}
      {showMyRequests ? (
        <div className="max-w-7xl mx-auto px-6 py-8">
          {userRequests.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-6">You haven't posted any requests yet</p>
              <button
                onClick={() => {
                  setShowMyRequests(false)
                  setShowPostForm(true)
                }}
                className="px-6 py-3 rounded-lg bg-[#1B6B4A] text-white font-semibold hover:bg-[#134E35]"
              >
                Post Your First Request
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userRequests.map((request) => (
                <div key={request.id} className="bg-white rounded-lg border-2 border-[#1B6B4A] p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{request.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{request.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${request.status === 'paused' ? 'bg-gray-200 text-gray-800' : 'bg-green-100 text-green-800'}`}>
                      {request.status === 'paused' ? 'Paused' : 'Open'}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4 text-sm">
                    {request.address_hint && (
                      <p className="text-gray-700">
                        <span className="font-semibold">Location:</span> {request.address_hint}
                      </p>
                    )}
                    <p className="text-gray-700">
                      <span className="font-semibold">Contractor Responses:</span> {request.response_count}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleViewMessages(request)}
                      className="px-3 py-2 rounded-lg bg-blue-100 text-blue-700 font-semibold text-sm hover:bg-blue-200 transition"
                    >
                      💬 Messages
                    </button>
                    <button
                      onClick={() => handleEditRequest(request)}
                      className="px-3 py-2 rounded-lg bg-indigo-100 text-indigo-700 font-semibold text-sm hover:bg-indigo-200 transition"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleTogglePause(request.id, request.status)}
                      className={`px-3 py-2 rounded-lg font-semibold text-sm transition ${
                        request.status === 'paused'
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      }`}
                    >
                      {request.status === 'paused' ? '▶️ Resume' : '⏸️ Pause'}
                    </button>
                    <button
                      onClick={() => handleRepublish(request.id)}
                      className="px-3 py-2 rounded-lg bg-purple-100 text-purple-700 font-semibold text-sm hover:bg-purple-200 transition"
                    >
                      🔄 Republish
                    </button>
                    <button
                      onClick={() => handleDeleteRequest(request.id)}
                      className="px-3 py-2 rounded-lg bg-red-100 text-red-700 font-semibold text-sm hover:bg-red-200 transition"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="bg-white border-b border-gray-200 sticky top-20 z-40">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                <button
                  onClick={() => handleCategoryFilter(null)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition ${
                    selectedCategory === null
                      ? 'bg-[#1B6B4A] text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  All Services
                </button>
                {SERVICES.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => handleCategoryFilter(service.id)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition flex items-center gap-1 ${
                      selectedCategory === service.id
                        ? 'bg-[#1B6B4A] text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <span>{service.icon}</span>
                    {service.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Requests Grid */}
          <div className="max-w-7xl mx-auto px-6 py-8">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin inline-block w-8 h-8 border-4 border-[#1B6B4A] border-t-transparent rounded-full"></div>
                <p className="text-gray-600 mt-4">Loading requests...</p>
              </div>
            ) : filteredRequests.filter((r) => r.status === 'open').length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  {selectedCategory
                    ? 'No open requests for this service yet. Be the first to post!'
                    : 'No open requests posted yet. Be the first!'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRequests
                  .filter((r) => r.status === 'open')
                  .map((request) => (
                    <div
                      key={request.id}
                      className="bg-white rounded-lg border-2 border-gray-200 p-5 hover:shadow-lg transition hover:border-[#1B6B4A]"
                    >
                      {/* Service Type Badge */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl">{getServiceIcon(request.service)}</span>
                        <span className="inline-block px-3 py-1 rounded-full bg-[#E6F4ED] text-[#1B6B4A] text-xs font-semibold">
                          {getServiceLabel(request.service)}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                        {request.title}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{request.description}</p>

                      {/* Photos */}
                      {request.photos && request.photos.length > 0 && (
                        <div className="mb-3">
                          <div className="flex gap-2 overflow-x-auto">
                            {request.photos.map((photo, idx) => (
                              <img
                                key={idx}
                                src={photo}
                                alt="Request photo"
                                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Details */}
                      <div className="space-y-2 mb-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getUrgencyColor(request.urgency)}`}>
                            {request.urgency}
                          </span>
                        </div>
                        {request.address_hint && (
                          <p className="text-gray-600">📍 {request.address_hint}</p>
                        )}
                      </div>

                      {/* Posted By & Responses */}
                      <div className="border-t border-gray-200 pt-3 mt-3">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <div>
                            <p className="text-gray-500 text-xs">Request ID</p>
                            <p className="font-semibold text-gray-900">{request.id}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-500 text-xs">Responses</p>
                            <p className="font-bold text-lg text-[#1B6B4A]">
                              {request.response_count}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Posted Date */}
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Embedded Post Request Form */}
          {showPostForm && (
            <div className="bg-white border-t-2 border-[#1B6B4A] py-8">
              <div className="max-w-4xl mx-auto px-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold text-gray-900">
                    {editingRequestId ? 'Edit Service Request' : 'Post a Service Request'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowPostForm(false)
                      setPhotoPreview('')
                      setEditingRequestId(null)
                    }}
                    className="text-gray-400 hover:text-gray-600 text-3xl font-bold"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Service Type */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Service Type *
                      </label>
                      <select
                        value={formData.service}
                        onChange={(e) =>
                          setFormData({ ...formData, service: e.target.value })
                        }
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#1B6B4A] focus:outline-none"
                        required
                      >
                        <option value="">Select a service</option>
                        {SERVICES.map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.icon} {service.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Title */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="What do you need?"
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#1B6B4A] focus:outline-none"
                        required
                      />
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Provide details about what you need (size, scope, specific requirements)..."
                        rows={4}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#1B6B4A] focus:outline-none resize-none"
                      />
                    </div>

                    {/* Photos */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Photos (helps contractors understand your needs better)
                      </label>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
                      />
                      {formData.photos.length > 0 && (
                        <div className="flex gap-2 mt-3 flex-wrap">
                          {formData.photos.map((photo, idx) => (
                            <div key={idx} className="relative">
                              <img src={photo} alt="Preview" className="w-16 h-16 rounded-lg object-cover" />
                              <button
                                type="button"
                                onClick={() => removePhoto(idx)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Urgency */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Urgency
                      </label>
                      <div className="space-y-2">
                        {['ASAP', 'This week', 'Flexible'].map((level) => (
                          <label key={level} className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="urgency"
                              value={level}
                              checked={formData.urgency === level}
                              onChange={(e) => setFormData({ ...formData, urgency: e.target.value as any })}
                              className="w-4 h-4 accent-[#1B6B4A]"
                            />
                            <span className="text-sm text-gray-700">{level}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        value={formData.address_hint}
                        onChange={(e) => setFormData({ ...formData, address_hint: e.target.value })}
                        placeholder="Street address or area"
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#1B6B4A] focus:outline-none"
                      />
                    </div>

                    {/* Contact Info */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Contact Name
                      </label>
                      <input
                        type="text"
                        value={formData.contact_name}
                        onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                        placeholder="Jane Doe"
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#1B6B4A] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={formData.contact_email}
                        onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                        placeholder="jane@example.com"
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#1B6B4A] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.contact_phone}
                        onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                        placeholder="(615) 555-0123"
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#1B6B4A] focus:outline-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Contact Note
                      </label>
                      <input
                        type="text"
                        value={formData.contact_note}
                        onChange={(e) => setFormData({ ...formData, contact_note: e.target.value })}
                        placeholder="Best times to reach me or preferred method"
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#1B6B4A] focus:outline-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500">
                        Contractors can message you through NeighborLink without exposing your personal details publicly.
                      </p>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-4 py-3 rounded-lg bg-[#1B6B4A] text-white font-semibold hover:bg-[#134E35] transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (editingRequestId ? 'Saving...' : 'Posting...') : (editingRequestId ? 'Save Changes' : 'Post Request')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPostForm(false)
                        setPhotoPreview('')
                        setEditingRequestId(null)
                      }}
                      className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      {/* Messages Modal */}
      {showMessages && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
                <p className="text-sm text-gray-600 mt-1">{selectedRequest.title}</p>
              </div>
              <button
                onClick={() => setShowMessages(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Private Contractor Messages</h3>
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No messages yet. Contractors can reach out here without your contact info being published.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div key={message.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">{message.contractor_name}</p>
                            <p className="text-xs text-gray-600">{message.contractor_email}</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(message.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-gray-700 text-sm">{message.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-[#F9F6F1] rounded-xl border border-gray-200 p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Send a Contractor Message</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Contractors can communicate with you through NeighborLink without exposing your personal details publicly.
                </p>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Your Name</label>
                    <input
                      type="text"
                      value={messageForm.contractor_name}
                      onChange={(e) => setMessageForm({ ...messageForm, contractor_name: e.target.value })}
                      placeholder="Contractor name"
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#1B6B4A] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Your Email</label>
                    <input
                      type="email"
                      value={messageForm.contractor_email}
                      onChange={(e) => setMessageForm({ ...messageForm, contractor_email: e.target.value })}
                      placeholder="contractor@example.com"
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#1B6B4A] focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Message</label>
                    <textarea
                      value={messageForm.message}
                      onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                      rows={4}
                      placeholder="Send a private message to the resident about this job."
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#1B6B4A] focus:outline-none resize-none"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleSendMessage(selectedRequest.id)}
                      className="px-5 py-3 rounded-lg bg-[#1B6B4A] text-white font-semibold hover:bg-[#134E35] transition"
                    >
                      Send Message
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Leave a Contractor Review</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Add a rating and note for a contractor after you’ve had a conversation or completed a job.
                </p>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Contractor Name</label>
                    <input
                      type="text"
                      value={reviewData.contractor_name}
                      onChange={(e) => setReviewData({ ...reviewData, contractor_name: e.target.value })}
                      placeholder="John’s Plumbing"
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#1B6B4A] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Rating</label>
                    <select
                      value={reviewData.rating}
                      onChange={(e) => setReviewData({ ...reviewData, rating: Number(e.target.value) })}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#1B6B4A] focus:outline-none"
                    >
                      {[5, 4, 3, 2, 1].map((value) => (
                        <option key={value} value={value}>
                          {value} Star{value > 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Review</label>
                    <textarea
                      value={reviewData.comment}
                      onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                      rows={3}
                      placeholder="Share your experience or recommendation."
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#1B6B4A] focus:outline-none resize-none"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleSubmitReview(selectedRequest.id)}
                      className="px-5 py-3 rounded-lg bg-[#1B6B4A] text-white font-semibold hover:bg-[#134E35] transition"
                    >
                      Submit Review
                    </button>
                  </div>
                </div>
              </div>

              {reviews.length > 0 && (
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Contractor Reviews</h3>
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="rounded-lg bg-white p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-gray-900">{review.contractor_name}</p>
                          <p className="text-sm text-[#1B6B4A] font-semibold">{review.rating} ★</p>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{review.comment}</p>
                        <p className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
