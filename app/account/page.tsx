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
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState<Partial<User>>({})
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem('neighborlink_user')
    if (!storedUser) {
      router.replace('/login')
      return
    }

    const parsed = JSON.parse(storedUser)
    setUser(parsed)
    setLoading(false)
  }, [router])

  const handleStartEdit = () => {
    if (!user) return
    setEditForm({
      name: user.name,
      phone: user.phone || '',
      trade: user.trade || '',
      preferred_contact: user.preferred_contact || 'email',
      newsletter_opt_in: user.newsletter_opt_in ?? true,
      marketing_opt_in: user.marketing_opt_in ?? false,
    })
    setEditMode(true)
  }

  const handleSave = () => {
    if (!user) return
    if (!editForm.name?.trim()) {
      alert('Name is required.')
      return
    }

    setSaving(true)
    const updated: User = {
      ...user,
      name: editForm.name!.trim(),
      phone: editForm.phone || undefined,
      trade: user.role === 'contractor' ? editForm.trade || undefined : user.trade,
      preferred_contact: user.role === 'resident' ? editForm.preferred_contact : user.preferred_contact,
      newsletter_opt_in: user.role === 'resident' ? editForm.newsletter_opt_in : user.newsletter_opt_in,
      marketing_opt_in: user.role === 'resident' ? editForm.marketing_opt_in : user.marketing_opt_in,
    }

    localStorage.setItem('neighborlink_user', JSON.stringify(updated))
    setUser(updated)
    setEditMode(false)
    setSaving(false)
  }

  const handleCancel = () => {
    setEditMode(false)
    setEditForm({})
  }

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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Profile details</h2>
            {!editMode ? (
              <button
                onClick={handleStartEdit}
                className="rounded-2xl bg-[#1B6B4A] px-5 py-2 text-sm font-semibold text-white hover:bg-[#134E35] transition"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-2xl bg-[#1B6B4A] px-5 py-2 text-sm font-semibold text-white hover:bg-[#134E35] transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={handleCancel}
                  className="rounded-2xl border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="rounded-3xl bg-[#F9F6F1] p-6 border border-gray-200">
                <p className="text-sm text-gray-500 mb-2">Name</p>
                {editMode ? (
                  <input
                    type="text"
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:border-[#1B6B4A] focus:outline-none text-gray-900 font-semibold bg-white"
                  />
                ) : (
                  <p className="text-lg font-semibold text-gray-900">{user.name}</p>
                )}
              </div>

              <div className="rounded-3xl bg-[#F9F6F1] p-6 border border-gray-200">
                <p className="text-sm text-gray-500 mb-2">Email</p>
                <p className="text-lg font-semibold text-gray-900">{user.email}</p>
              </div>

              <div className="rounded-3xl bg-[#F9F6F1] p-6 border border-gray-200">
                <p className="text-sm text-gray-500 mb-2">Phone</p>
                {editMode ? (
                  <input
                    type="tel"
                    value={editForm.phone || ''}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="(615) 555-0123"
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:border-[#1B6B4A] focus:outline-none text-gray-900 font-semibold bg-white"
                  />
                ) : (
                  <p className="text-lg font-semibold text-gray-900">{user.phone || 'Not specified'}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl bg-[#F9F6F1] p-6 border border-gray-200">
                <p className="text-sm text-gray-500 mb-2">Role</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">{user.role}</p>
              </div>

              {user.role === 'contractor' && (
                <div className="rounded-3xl bg-[#F9F6F1] p-6 border border-gray-200">
                  <p className="text-sm text-gray-500 mb-2">Trade</p>
                  {editMode ? (
                    <input
                      type="text"
                      value={editForm.trade || ''}
                      onChange={(e) => setEditForm({ ...editForm, trade: e.target.value })}
                      placeholder="Plumbing, Electrical, Lawn Care..."
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:border-[#1B6B4A] focus:outline-none text-gray-900 font-semibold bg-white"
                    />
                  ) : (
                    <p className="text-lg font-semibold text-gray-900">{user.trade || 'Not specified'}</p>
                  )}
                </div>
              )}

              {user.role === 'resident' && (
                <>
                  <div className="rounded-3xl bg-[#F9F6F1] p-6 border border-gray-200">
                    <p className="text-sm text-gray-500 mb-2">Preferred Contact</p>
                    {editMode ? (
                      <select
                        value={editForm.preferred_contact || 'email'}
                        onChange={(e) => setEditForm({ ...editForm, preferred_contact: e.target.value as 'email' | 'phone' })}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:border-[#1B6B4A] focus:outline-none text-gray-900 font-semibold bg-white"
                      >
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                      </select>
                    ) : (
                      <p className="text-lg font-semibold text-gray-900 capitalize">{user.preferred_contact || 'Email'}</p>
                    )}
                  </div>

                  <div className="rounded-3xl bg-[#F9F6F1] p-6 border border-gray-200">
                    <p className="text-sm text-gray-500 mb-3">Email Preferences</p>
                    {editMode ? (
                      <div className="space-y-3">
                        <label className="flex items-center gap-3 text-sm text-gray-900 font-semibold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editForm.newsletter_opt_in ?? true}
                            onChange={(e) => setEditForm({ ...editForm, newsletter_opt_in: e.target.checked })}
                            className="h-4 w-4 rounded border-gray-300 accent-[#1B6B4A]"
                          />
                          Newsletter
                        </label>
                        <label className="flex items-center gap-3 text-sm text-gray-900 font-semibold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editForm.marketing_opt_in ?? false}
                            onChange={(e) => setEditForm({ ...editForm, marketing_opt_in: e.target.checked })}
                            className="h-4 w-4 rounded border-gray-300 accent-[#1B6B4A]"
                          />
                          Marketing emails
                        </label>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-900">
                          Newsletter: <span className="font-semibold">{user.newsletter_opt_in ? 'Subscribed' : 'Unsubscribed'}</span>
                        </p>
                        <p className="text-sm text-gray-900">
                          Marketing: <span className="font-semibold">{user.marketing_opt_in ? 'Opted in' : 'Opted out'}</span>
                        </p>
                      </div>
                    )}
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
