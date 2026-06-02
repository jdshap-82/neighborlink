'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  role: 'resident' | 'contractor'
  name: string
  email: string
  trade?: string
  phone?: string
  preferred_contact?: 'email' | 'phone'
  newsletter_opt_in?: boolean
  marketing_opt_in?: boolean
}

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem('neighborlink_user')
    if (!storedUser) {
      router.replace('/login')
      return
    }

    setUser(JSON.parse(storedUser))
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F6F1] px-6 py-12">
        <div className="rounded-3xl bg-white border border-gray-200 p-10 shadow-sm text-center">
          <p className="text-gray-600">Loading your account...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#F9F6F1] py-16 px-6">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="rounded-3xl bg-white border border-gray-200 p-10 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-wide text-gray-500">Account</p>
              <h1 className="text-4xl font-bold text-gray-900">Hello, {user.name}</h1>
              <p className="text-gray-600 mt-2">Manage your NeighborLink profile and quick links to your dashboard.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                href={user.role === 'contractor' ? '/contractor' : '/board'}
                className="rounded-2xl bg-[#1B6B4A] px-5 py-3 text-center text-sm font-semibold text-white hover:bg-[#134E35] transition"
              >
                Go to {user.role === 'contractor' ? 'Contractor Dashboard' : 'Service Board'}
              </Link>
              <Link
                href="/"
                className="rounded-2xl border border-gray-300 px-5 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>

        {user.role === 'resident' && (
          <div className="rounded-3xl bg-white border border-gray-200 p-10 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Manage your service requests</h2>
                <p className="text-gray-600 mt-2">Edit or delete your open requests from the board to keep your needs up to date.</p>
              </div>
              <Link
                href="/board"
                className="rounded-2xl bg-[#1B6B4A] px-5 py-3 text-center text-sm font-semibold text-white hover:bg-[#134E35] transition"
              >
                View My Requests
              </Link>
            </div>
          </div>
        )}

        <div className="rounded-3xl bg-white border border-gray-200 p-10 shadow-sm">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Profile details</h2>
              <div className="rounded-3xl bg-[#F9F6F1] p-6 border border-gray-200">
                <p className="text-sm text-gray-500">Name</p>
                <p className="mt-2 text-lg font-semibold text-gray-900">{user.name}</p>
              </div>
              <div className="rounded-3xl bg-[#F9F6F1] p-6 border border-gray-200">
                <p className="text-sm text-gray-500">Email</p>
                <p className="mt-2 text-lg font-semibold text-gray-900">{user.email}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-3xl bg-[#F9F6F1] p-6 border border-gray-200">
                <p className="text-sm text-gray-500">Role</p>
                <p className="mt-2 text-lg font-semibold text-gray-900 capitalize">{user.role}</p>
              </div>
              {user.role === 'contractor' && (
                <>
                  <div className="rounded-3xl bg-[#F9F6F1] p-6 border border-gray-200">
                    <p className="text-sm text-gray-500">Trade</p>
                    <p className="mt-2 text-lg font-semibold text-gray-900">{user.trade || 'Not specified'}</p>
                  </div>
                  <div className="rounded-3xl bg-[#F9F6F1] p-6 border border-gray-200">
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="mt-2 text-lg font-semibold text-gray-900">{user.phone || 'Not specified'}</p>
                  </div>
                </>
              )}
              {user.role === 'resident' && (
                <>
                  <div className="rounded-3xl bg-[#F9F6F1] p-6 border border-gray-200">
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="mt-2 text-lg font-semibold text-gray-900">{user.phone || 'Not specified'}</p>
                  </div>
                  <div className="rounded-3xl bg-[#F9F6F1] p-6 border border-gray-200">
                    <p className="text-sm text-gray-500">Preferred Contact</p>
                    <p className="mt-2 text-lg font-semibold text-gray-900 capitalize">{user.preferred_contact || 'Email'}</p>
                  </div>
                  <div className="rounded-3xl bg-[#F9F6F1] p-6 border border-gray-200">
                    <p className="text-sm text-gray-500">Newsletter Subscription</p>
                    <p className="mt-2 text-lg font-semibold text-gray-900">{user.newsletter_opt_in ? 'Subscribed' : 'Unsubscribed'}</p>
                  </div>
                  <div className="rounded-3xl bg-[#F9F6F1] p-6 border border-gray-200">
                    <p className="text-sm text-gray-500">Marketing Emails</p>
                    <p className="mt-2 text-lg font-semibold text-gray-900">{user.marketing_opt_in ? 'Opted in' : 'Opted out'}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
