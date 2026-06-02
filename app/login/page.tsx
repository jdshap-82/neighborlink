'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

type UserRole = 'resident' | 'contractor'

const ADMIN_EMAIL = 'admin@neighborlink.com'
const ADMIN_PASSWORD = 'neighborlink2024'

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Math.random().toString(36).slice(2)}-${Date.now()}`
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<'user' | 'admin'>('user')
  const [role, setRole] = useState<UserRole>('resident')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')

  useEffect(() => {
    const storedUser = localStorage.getItem('neighborlink_user')
    if (storedUser) {
      const parsed = JSON.parse(storedUser)
      router.replace(parsed.role === 'admin' ? '/admin' : '/account')
      return
    }

    const paramRole = searchParams.get('role')
    if (paramRole === 'contractor' || paramRole === 'resident') {
      setRole(paramRole)
    }
  }, [router, searchParams])

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email) {
      alert('Please enter both name and email')
      return
    }

    const user = { id: createId(), role, name, email }
    localStorage.setItem('neighborlink_user', JSON.stringify(user))

    await fetch('/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    }).catch(() => {})

    router.push('/account')
  }

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (adminEmail !== ADMIN_EMAIL || adminPassword !== ADMIN_PASSWORD) {
      alert('Invalid admin credentials.')
      return
    }

    const user = { id: 'admin', role: 'admin', name: 'Admin', email: ADMIN_EMAIL }
    localStorage.setItem('neighborlink_user', JSON.stringify(user))
    router.push('/admin')
  }

  return (
    <div className="min-h-screen bg-[#F9F6F1] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-gray-200 p-10 shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-600 mt-3">Log in to manage your NeighborLink activity.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-xl bg-gray-100 p-1 mb-8">
          <button
            onClick={() => setTab('user')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${tab === 'user' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Resident / Contractor
          </button>
          <button
            onClick={() => setTab('admin')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${tab === 'admin' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Admin
          </button>
        </div>

        {tab === 'user' ? (
          <form onSubmit={handleUserLogin} className="space-y-6">
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
            <button
              type="submit"
              className="w-full px-6 py-3 rounded-xl bg-[#1B6B4A] text-white font-semibold hover:bg-[#134E35] transition"
            >
              Log In
            </button>
          </form>
        ) : (
          <form onSubmit={handleAdminLogin} className="space-y-6">
            <div className="rounded-2xl bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-800">
              Admin access only. Contact your NeighborLink administrator for credentials.
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Admin Email</label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@neighborlink.com"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#1B6B4A] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Password</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#1B6B4A] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full px-6 py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition"
            >
              Log In as Admin
            </button>
          </form>
        )}

        {tab === 'user' && (
          <p className="text-center text-sm text-gray-600 mt-6">
            Need an account?{' '}
            <Link href="/signup" className="text-[#1B6B4A] font-semibold hover:underline">
              Sign up here
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}
