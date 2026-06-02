'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

type UserRole = 'resident' | 'contractor'

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Math.random().toString(36).slice(2)}-${Date.now()}`
}

function SignupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [role, setRole] = useState<UserRole>('resident')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [trade, setTrade] = useState('')
  const [phone, setPhone] = useState('')
  const [preferredContact, setPreferredContact] = useState<'email' | 'phone'>('email')
  const [newsletterOptIn, setNewsletterOptIn] = useState(true)
  const [marketingOptIn, setMarketingOptIn] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem('neighborlink_user')
    if (storedUser) {
      router.replace('/account')
      return
    }

    const paramRole = searchParams.get('role')
    if (paramRole === 'contractor' || paramRole === 'resident') {
      setRole(paramRole)
    }
  }, [router, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email) {
      alert('Please enter both name and email')
      return
    }

    const user = {
      id: createId(),
      role,
      name,
      email,
      phone: phone || undefined,
      preferred_contact: role === 'resident' ? preferredContact : undefined,
      newsletter_opt_in: role === 'resident' ? newsletterOptIn : undefined,
      marketing_opt_in: role === 'resident' ? marketingOptIn : undefined,
      trade: role === 'contractor' ? trade : undefined,
    }

    localStorage.setItem('neighborlink_user', JSON.stringify(user))

    // Persist to Supabase so admin can manage users
    await fetch('/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    }).catch(() => {/* non-blocking — local session still works */})

    router.push('/account')
  }

  return (
    <div className="min-h-screen bg-[#F9F6F1] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-gray-200 p-10 shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Create your NeighborLink account</h1>
          <p className="text-gray-600 mt-3">Sign up as a resident or contractor to start using in-app messaging and saved requests.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#1B6B4A] focus:outline-none"
            >
              <option value="resident">Resident</option>
              <option value="contractor">Contractor</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#1B6B4A] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#1B6B4A] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(615) 555-0123"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#1B6B4A] focus:outline-none"
            />
          </div>

          {role === 'resident' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Preferred Contact</label>
                <select
                  value={preferredContact}
                  onChange={(e) => setPreferredContact(e.target.value as 'email' | 'phone')}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#1B6B4A] focus:outline-none"
                >
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                </select>
              </div>
              <div className="flex flex-col gap-3">
                <label className="inline-flex items-center gap-3 text-sm text-gray-900">
                  <input
                    type="checkbox"
                    checked={newsletterOptIn}
                    onChange={(e) => setNewsletterOptIn(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-[#1B6B4A] focus:ring-[#1B6B4A]"
                  />
                  Subscribe to newsletter
                </label>
                <label className="inline-flex items-center gap-3 text-sm text-gray-900">
                  <input
                    type="checkbox"
                    checked={marketingOptIn}
                    onChange={(e) => setMarketingOptIn(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-[#1B6B4A] focus:ring-[#1B6B4A]"
                  />
                  Opt in to marketing emails
                </label>
              </div>
            </>
          )}

          {role === 'contractor' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Primary Trade</label>
                <input
                  value={trade}
                  onChange={(e) => setTrade(e.target.value)}
                  placeholder="Plumbing, Electrical, Lawn Care..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#1B6B4A] focus:outline-none"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full px-6 py-3 rounded-xl bg-[#1B6B4A] text-white font-semibold hover:bg-[#134E35] transition"
          >
            Create Account
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-[#1B6B4A] font-semibold hover:underline">
            Log in
          </Link>
          .
        </p>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SignupContent />
    </Suspense>
  )
}
