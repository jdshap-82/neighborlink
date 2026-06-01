'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

type User = {
  id: string
  role: 'resident' | 'contractor'
  name: string
  email: string
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('neighborlink_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('neighborlink_user')
    setUser(null)
    window.location.href = '/'
  }

  return (
    <nav className="flex flex-wrap items-center justify-between px-6 py-4 bg-white border-b border-gray-200 sticky top-0 z-50">
      <Link href="/" className="text-2xl font-bold text-[#1B6B4A] flex items-center gap-2">
        <span>🏘️</span> NeighborLink
      </Link>
      <div className="flex flex-wrap gap-3 items-center">
        <Link
          href="/board"
          className="px-4 py-2 rounded-lg border-2 border-[#1B6B4A] text-[#1B6B4A] font-semibold text-sm hover:bg-[#E6F4ED] transition"
        >
          I'm a Resident
        </Link>
        <Link
          href="/join"
          className="px-4 py-2 rounded-lg bg-[#1B6B4A] text-white font-semibold text-sm hover:bg-[#134E35] transition"
        >
          I'm a Contractor
        </Link>
        {user ? (
          <>
            <Link
              href="/account"
              className="px-4 py-2 rounded-lg border border-[#1B6B4A] text-[#1B6B4A] text-sm font-semibold hover:bg-[#E6F4ED] transition"
            >
              My Account
            </Link>
            {user.role === 'contractor' ? (
              <Link
                href="/contractor"
                className="px-4 py-2 rounded-lg border border-[#1B6B4A] text-[#1B6B4A] text-sm font-semibold hover:bg-[#E6F4ED] transition"
              >
                Dashboard
              </Link>
            ) : null}
            <span className="hidden md:inline text-sm text-gray-600">Signed in as {user.name}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-100 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-100 transition"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 rounded-lg bg-[#1B6B4A] text-white text-sm font-semibold hover:bg-[#134E35] transition"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
