'use client'

import { useState } from 'react'
import Link from 'next/link'

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

export default function JoinPage() {
  const [formData, setFormData] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    trade: '',
    licenseNumber: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    setSubmitted(true)
    setTimeout(() => {
      setFormData({
        businessName: '',
        contactName: '',
        email: '',
        phone: '',
        trade: '',
        licenseNumber: '',
      })
      setSubmitted(false)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-[#F9F6F1]">
      {/* Hero Section */}
      <div className="max-w-3xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="inline-block px-4 py-1.5 rounded-full bg-[#E6F4ED] text-[#1B6B4A] text-xs font-semibold tracking-wide mb-5">
          FOR CONTRACTORS
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-5">
          Work where you already are
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
          Pick up extra jobs from neighbors in Westhaven without traveling across town.
          You're already in the neighborhood — let residents know you're available.
        </p>
      </div>

      {/* Value Prop Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Value Prop 1: Free Trial */}
            <div className="text-center">
              <div className="text-5xl mb-4">⏱️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">14-Day Free Trial</h3>
              <p className="text-gray-600">
                Try NeighborLink risk-free. See your first jobs before you pay a dime.
              </p>
            </div>

            {/* Value Prop 2: Affordable */}
            <div className="text-center">
              <div className="text-5xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Just <span className="text-[#1B6B4A]">$39/month</span>
              </h3>
              <p className="text-gray-600">
                No hidden fees. One flat rate to access all incoming neighborhood requests.
              </p>
            </div>

            {/* Value Prop 3: Local Jobs */}
            <div className="text-center">
              <div className="text-5xl mb-4">📍</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Same Neighborhood</h3>
              <p className="text-gray-600">
                Eliminate travel time. Pick up extra work while already working in Westhaven.
              </p>
            </div>
          </div>

          {/* Social Proof / CTA */}
          <div className="bg-[#E6F4ED] rounded-lg p-8 text-center mb-0">
            <p className="text-gray-700 mb-4">
              Join dozens of contractors already using NeighborLink to find their next job.
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Average contractor:</span> Picks up 2-3 extra jobs per month
            </p>
          </div>
        </div>
      </div>

      {/* Sign-Up Form Section */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg border-2 border-gray-200 p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Get Started</h2>
          <p className="text-gray-600 mb-8">
            Start your 14-day free trial. No credit card required.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Business Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Business Name *
              </label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="Smith's Plumbing"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#1B6B4A] focus:outline-none transition"
                required
              />
            </div>

            {/* Contact Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Contact Name *
              </label>
              <input
                type="text"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                placeholder="John Smith"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#1B6B4A] focus:outline-none transition"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@smithsplumbing.com"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#1B6B4A] focus:outline-none transition"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(615) 555-0123"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#1B6B4A] focus:outline-none transition"
                required
              />
            </div>

            {/* Trade Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Primary Trade *
              </label>
              <select
                name="trade"
                value={formData.trade}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#1B6B4A] focus:outline-none transition"
                required
              >
                <option value="">Select your primary service</option>
                {SERVICES.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.icon} {service.label}
                  </option>
                ))}
              </select>
            </div>

            {/* License Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                License Number
              </label>
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                placeholder="TN-12345678"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#1B6B4A] focus:outline-none transition"
              />
              <p className="text-xs text-gray-500 mt-1">Optional — helps build trust with residents</p>
            </div>

            {/* Terms */}
            <div className="pt-4">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  required
                  className="w-5 h-5 mt-0.5 accent-[#1B6B4A] rounded"
                />
                <span className="text-sm text-gray-600">
                  I agree to the Terms of Service and understand I'll be charged $39/month after the 14-day free trial
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitted}
              className="w-full mt-8 px-6 py-3 rounded-lg bg-[#1B6B4A] text-white font-bold text-lg hover:bg-[#134E35] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitted ? '✓ Got it! Check your console' : 'Start Free Trial'}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              No credit card required. 14-day free trial.
            </p>
          </form>
        </div>

        {/* Additional Info */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">How it works</h3>
            <ol className="space-y-3 text-gray-600">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#E6F4ED] text-[#1B6B4A] flex items-center justify-center font-bold text-sm">
                  1
                </span>
                <span>Sign up and get your profile live</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#E6F4ED] text-[#1B6B4A] flex items-center justify-center font-bold text-sm">
                  2
                </span>
                <span>Residents post requests in your trade</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#E6F4ED] text-[#1B6B4A] flex items-center justify-center font-bold text-sm">
                  3
                </span>
                <span>See new jobs as they come in</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#E6F4ED] text-[#1B6B4A] flex items-center justify-center font-bold text-sm">
                  4
                </span>
                <span>Reach out directly to potential clients</span>
              </li>
            </ol>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">FAQ</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-semibold text-gray-900 mb-1">Can I cancel anytime?</p>
                <p className="text-gray-600">Yes. Cancel your subscription at any time, no questions asked.</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">How do I get paid?</p>
                <p className="text-gray-600">You negotiate directly with residents. We don't take a cut.</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">What if I do multiple services?</p>
                <p className="text-gray-600">Add more trades to your profile after signing up.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-white border-t border-gray-200 mt-16 py-12">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-gray-600 mb-6">
            Already have enough jobs? Check out the{' '}
            <Link href="/board" className="text-[#1B6B4A] font-semibold hover:underline">
              resident board
            </Link>{' '}
            to refer neighbors.
          </p>
        </div>
      </div>
    </div>
  )
}
