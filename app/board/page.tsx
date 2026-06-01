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
  service_type: string
  title: string
  description: string
  urgency: 'ASAP' | 'This week' | 'Flexible'
  posted_by: string
  created_at: string
  contractor_responses: number
}

export default function BoardPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<ServiceRequest[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPostForm, setShowPostForm] = useState(false)
  const [formData, setFormData] = useState({
    service_type: '',
    title: '',
    description: '',
    urgency: 'This week',
    posted_by: '',
  })
  const [submitting, setSubmitting] = useState(false)

  // Fetch requests from Supabase
  useEffect(() => {
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
      setFilteredRequests(data || [])
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
        requests.filter((req) => req.service_type === categoryId)
      )
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.service_type || !formData.title || !formData.posted_by) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setSubmitting(true)
      const { error } = await supabase.from('requests').insert([
        {
          service_type: formData.service_type,
          title: formData.title,
          description: formData.description,
          urgency: formData.urgency,
          posted_by: formData.posted_by,
          contractor_responses: 0,
        },
      ])

      if (error) throw error

      setFormData({
        service_type: '',
        title: '',
        description: '',
        urgency: 'This week',
        posted_by: '',
      })
      setShowPostForm(false)
      fetchRequests()
    } catch (error) {
      console.error('Error posting request:', error)
      alert('Error posting request. Please try again.')
    } finally {
      setSubmitting(false)
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
      {/* Page Title */}
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Service Requests</h1>
        <p className="text-gray-600">Browse requests from your neighbors</p>
      </div>

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
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {selectedCategory
                ? 'No requests for this service yet. Be the first to post!'
                : 'No requests posted yet. Be the first!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-lg border-2 border-gray-200 p-5 hover:shadow-lg transition hover:border-[#1B6B4A]"
              >
                {/* Service Type Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{getServiceIcon(request.service_type)}</span>
                  <span className="inline-block px-3 py-1 rounded-full bg-[#E6F4ED] text-[#1B6B4A] text-xs font-semibold">
                    {getServiceLabel(request.service_type)}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  {request.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {request.description}
                </p>

                {/* Urgency Badge */}
                <div className="flex items-center gap-2 mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getUrgencyColor(request.urgency)}`}>
                    {request.urgency}
                  </span>
                </div>

                {/* Posted By & Responses */}
                <div className="border-t border-gray-200 pt-3 mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="text-gray-500">Posted by</p>
                      <p className="font-semibold text-gray-900">{request.posted_by}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500">Responses</p>
                      <p className="font-bold text-lg text-[#1B6B4A]">
                        {request.contractor_responses}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Posted Date */}
                <p className="text-xs text-gray-400 mt-3">
                  {new Date(request.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post Request Modal */}
      {showPostForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Post a Request</h2>
              <button
                onClick={() => setShowPostForm(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Service Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Service Type *
                </label>
                <select
                  value={formData.service_type}
                  onChange={(e) =>
                    setFormData({ ...formData, service_type: e.target.value })
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
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="What do you need?"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#1B6B4A] focus:outline-none"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Provide details about what you need..."
                  rows={3}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#1B6B4A] focus:outline-none resize-none"
                />
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
                        onChange={(e) =>
                          setFormData({ ...formData, urgency: e.target.value })
                        }
                        className="w-4 h-4 accent-[#1B6B4A]"
                      />
                      <span className="text-sm text-gray-700">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Posted By */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={formData.posted_by}
                  onChange={(e) =>
                    setFormData({ ...formData, posted_by: e.target.value })
                  }
                  placeholder="John Smith"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#1B6B4A] focus:outline-none"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-6 px-4 py-3 rounded-lg bg-[#1B6B4A] text-white font-semibold hover:bg-[#134E35] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Posting...' : 'Post Request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
