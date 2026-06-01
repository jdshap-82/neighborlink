'use client'

import { useEffect, useState } from 'react'
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
  resident_id: string
  service: string
  title: string
  description: string
  urgency: 'ASAP' | 'This week' | 'Flexible'
  status: 'active' | 'paused' | 'completed'
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

export default function BoardPage() {
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
  const [photoPreview, setPhotoPreview] = useState<string>('')
  const [formData, setFormData] = useState({
    service: '',
    title: '',
    description: '',
    urgency: 'This week' as const,
    resident_id: '',
    address_hint: '',
    photos: [] as string[],
  })
  const [submitting, setSubmitting] = useState(false)

  // Fetch requests from Supabase
  useEffect(() => {
    fetchRequests()
    const savedResidentId = localStorage.getItem('neighborlink_resident_id')
    if (savedResidentId) {
      setFormData((prev) => ({ ...prev, resident_id: savedResidentId }))
    }
  }, [])

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

      // Filter user's requests
      const currentResidentId = localStorage.getItem('neighborlink_resident_id')
      if (currentResidentId) {
        const userReqs = allRequests.filter((r: any) => r.resident_id === currentResidentId)
        setUserRequests(userReqs)
      }
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.service || !formData.title || !formData.resident_id) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setSubmitting(true)
      localStorage.setItem('neighborlink_resident_id', formData.resident_id)

      const { error } = await supabase.from('requests').insert([
        {
          resident_id: formData.resident_id,
          service: formData.service,
          title: formData.title,
          description: formData.description,
          urgency: formData.urgency,
          address_hint: formData.address_hint || null,
          photos: formData.photos.length > 0 ? formData.photos : null,
          response_count: 0,
          status: 'active',
        },
      ])

      if (error) throw error

      setFormData({
        service: '',
        title: '',
        description: '',
        urgency: 'This week',
        resident_id: localStorage.getItem('neighborlink_resident_id') || '',
        address_hint: '',
        photos: [],
      })
      setPhotoPreview('')
      setShowPostForm(false)
      fetchRequests()
    } catch (error) {
      console.error('Error posting request:', error)
      alert('Error posting request. Please try again.')
    } finally {
      setSubmitting(false)
    }
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
      const newStatus = currentStatus === 'paused' ? 'active' : 'paused'
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
        .update({ created_at: new Date().toISOString(), status: 'active' })
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
            onClick={() => setShowPostForm(true)}
            className="px-6 py-3 rounded-lg bg-[#1B6B4A] text-white font-semibold hover:bg-[#134E35] transition"
          >
            + Post a Request
          </button>
        </div>

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
          <button
            onClick={() => setShowMyRequests(true)}
            className={`pb-3 px-4 font-semibold transition ${
              showMyRequests ? 'text-[#1B6B4A] border-b-2 border-[#1B6B4A]' : 'text-gray-600'
            }`}
          >
            My Requests ({userRequests.length})
          </button>
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
                      {request.status === 'paused' ? 'Paused' : 'Active'}
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
            ) : filteredRequests.filter((r) => r.status === 'active').length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  {selectedCategory
                    ? 'No active requests for this service yet. Be the first to post!'
                    : 'No active requests posted yet. Be the first!'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRequests
                  .filter((r) => r.status === 'active')
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
                  <h2 className="text-3xl font-bold text-gray-900">Post a Service Request</h2>
                  <button
                    onClick={() => {
                      setShowPostForm(false)
                      setPhotoPreview('')
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

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formData.resident_id}
                        onChange={(e) => setFormData({ ...formData, resident_id: e.target.value })}
                        placeholder="john@example.com"
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#1B6B4A] focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-4 py-3 rounded-lg bg-[#1B6B4A] text-white font-semibold hover:bg-[#134E35] transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Posting...' : 'Post Request'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPostForm(false)
                        setPhotoPreview('')
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

            <div className="p-6">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No messages yet. Contractors will message you here when interested.</p>
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
          </div>
        </div>
      )}
    </div>
  )
}
