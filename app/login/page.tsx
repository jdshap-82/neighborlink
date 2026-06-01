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

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [role, setRole] = useState<UserRole>('resident')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

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

  const handleSubmit = (e: React.FormEvent) => {
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
    }

    localStorage.setItem('neighborlink_user', JSON.stringify(user))
    router.push('/account')
  }

  return (
    <div className="min-h-screen bg-[#F9F6F1] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-gray-200 p-10 shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-600 mt-3">Log in as a resident or contractor to manage your NeighborLink activity.</p>
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

          <button
            type="submit"
            className="w-full px-6 py-3 rounded-xl bg-[#1B6B4A] text-white font-semibold hover:bg-[#134E35] transition"
          >
            Log In
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Need an account?{' '}
          <Link href="/signup" className="text-[#1B6B4A] font-semibold hover:underline">
            Sign up here
          </Link>
          .
        </p>
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
