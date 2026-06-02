'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ServiceRequest {
  id: string
  resident_id: string | null
  service: string
  title: string
  description: string
  urgency: string
  status: string
  address_hint?: string
  response_count: number
  accepted_contractor_name?: string
  accepted_contractor_email?: string
  contractor_complete?: boolean
  resident_complete?: boolean
  created_at: string
}

interface Profile {
  id: string
  role: 'resident' | 'contractor'
  name: string
  email: string
  phone?: string
  trade?: string
  preferred_contact?: string
  newsletter_opt_in?: boolean
  marketing_opt_in?: boolean
  created_at: string
}

interface Service {
  id: string
  label: string
  icon: string
  created_at: string
}

type AdminTab = 'requests' | 'users' | 'services'

const REQUEST_STATUSES = ['pending', 'open', 'in_progress', 'archived', 'denied'] as const
type RequestStatus = typeof REQUEST_STATUSES[number]

const STATUS_LABEL: Record<RequestStatus, string> = {
  pending: 'Pending Approval',
  open: 'Open',
  in_progress: 'In Progress',
  archived: 'Archived',
  denied: 'Denied',
}
const STATUS_BADGE: Record<RequestStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  open: 'bg-green-100 text-green-800',
  in_progress: 'bg-blue-100 text-blue-800',
  archived: 'bg-gray-100 text-gray-500',
  denied: 'bg-red-100 text-red-800',
}

const EMPTY_USER: Omit<Profile, 'id' | 'created_at'> = {
  role: 'resident',
  name: '',
  email: '',
  phone: '',
  trade: '',
  preferred_contact: 'email',
  newsletter_opt_in: true,
  marketing_opt_in: false,
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter()
  const [adminUser, setAdminUser] = useState<{ role: string } | null>(null)

  // Tab state
  const [tab, setTab] = useState<AdminTab>('requests')

  // ── Requests state
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [requestTab, setRequestTab] = useState<RequestStatus>('pending')
  const [requestsLoading, setRequestsLoading] = useState(true)
  const [requestActionId, setRequestActionId] = useState<string | null>(null)

  // ── Users state
  const [users, setUsers] = useState<Profile[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'resident' | 'contractor'>('all')
  const [showUserModal, setShowUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState<Profile | null>(null)
  const [userForm, setUserForm] = useState<Omit<Profile, 'id' | 'created_at'>>(EMPTY_USER)
  const [userSaving, setUserSaving] = useState(false)

  // ── Services state
  const [services, setServices] = useState<Service[]>([])
  const [servicesLoading, setServicesLoading] = useState(false)
  const [serviceForm, setServiceForm] = useState({ id: '', label: '', icon: '📋' })
  const [serviceAdding, setServiceAdding] = useState(false)

  // ── Auth guard
  useEffect(() => {
    const stored = localStorage.getItem('neighborlink_user')
    if (!stored) { router.replace('/login'); return }
    const parsed = JSON.parse(stored)
    if (parsed.role !== 'admin') { router.replace('/'); return }
    setAdminUser(parsed)
    fetchRequests()
  }, [])

  // ── Fetch on tab switch
  useEffect(() => {
    if (tab === 'users') fetchUsers()
    if (tab === 'services') fetchServices()
  }, [tab])

  // ── Requests ──────────────────────────────────────────────────────────────

  const fetchRequests = async () => {
    setRequestsLoading(true)
    const { data } = await supabase.from('requests').select('*').order('created_at', { ascending: false })
    setRequests(data || [])
    setRequestsLoading(false)
  }

  const requestAction = async (id: string, key: string, fn: () => Promise<void>) => {
    setRequestActionId(id + '-' + key)
    await fn()
    setRequestActionId(null)
  }

  const handleApprove = (id: string) =>
    requestAction(id, 'approve', async () => {
      await supabase.from('requests').update({ status: 'open' }).eq('id', id)
      await fetchRequests()
    })

  const handleDeny = (id: string) =>
    requestAction(id, 'deny', async () => {
      if (!confirm('Deny this request?')) return
      await supabase.from('requests').update({ status: 'denied' }).eq('id', id)
      await fetchRequests()
    })

  const handleDeleteRequest = (id: string) =>
    requestAction(id, 'delete', async () => {
      if (!confirm('Permanently delete this request and its messages?')) return
      const res = await fetch('/api/requests/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert('Delete failed: ' + (data.error || res.statusText))
        return
      }
      await fetchRequests()
    })

  const filteredRequests = requests.filter((r) => r.status === requestTab)

  // ── Users ─────────────────────────────────────────────────────────────────

  const fetchUsers = async () => {
    setUsersLoading(true)
    const res = await fetch('/api/admin/users')
    if (res.ok) setUsers(await res.json())
    setUsersLoading(false)
  }

  const openAddUser = () => {
    setEditingUser(null)
    setUserForm(EMPTY_USER)
    setShowUserModal(true)
  }

  const openEditUser = (u: Profile) => {
    setEditingUser(u)
    setUserForm({
      role: u.role,
      name: u.name,
      email: u.email,
      phone: u.phone || '',
      trade: u.trade || '',
      preferred_contact: u.preferred_contact || 'email',
      newsletter_opt_in: u.newsletter_opt_in ?? true,
      marketing_opt_in: u.marketing_opt_in ?? false,
    })
    setShowUserModal(true)
  }

  const handleSaveUser = async () => {
    if (!userForm.name || !userForm.email) { alert('Name and email are required.'); return }
    setUserSaving(true)

    if (editingUser) {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm),
      })
      if (!res.ok) { alert((await res.json()).error || 'Save failed'); setUserSaving(false); return }
    } else {
      const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Math.random().toString(36).slice(2)}-${Date.now()}`
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...userForm, id }),
      })
      if (!res.ok) { alert((await res.json()).error || 'Create failed'); setUserSaving(false); return }
    }

    setUserSaving(false)
    setShowUserModal(false)
    fetchUsers()
  }

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Delete user "${name}" and all their requests?`)) return
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    if (!res.ok) { alert((await res.json()).error || 'Delete failed'); return }
    fetchUsers()
  }

  const displayedUsers = userRoleFilter === 'all' ? users : users.filter((u) => u.role === userRoleFilter)

  // ── Services ──────────────────────────────────────────────────────────────

  const fetchServices = async () => {
    setServicesLoading(true)
    const res = await fetch('/api/admin/services')
    if (res.ok) setServices(await res.json())
    setServicesLoading(false)
  }

  const handleAddService = async () => {
    if (!serviceForm.id || !serviceForm.label) { alert('ID and label are required.'); return }
    setServiceAdding(true)
    const res = await fetch('/api/admin/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(serviceForm),
    })
    if (!res.ok) { alert((await res.json()).error || 'Add failed'); setServiceAdding(false); return }
    setServiceForm({ id: '', label: '', icon: '📋' })
    setServiceAdding(false)
    fetchServices()
  }

  const handleDeleteService = async (id: string, label: string) => {
    if (!confirm(`Delete service "${label}"? Existing requests using this service won't be affected.`)) return
    const res = await fetch(`/api/admin/services/${id}`, { method: 'DELETE' })
    if (!res.ok) { alert((await res.json()).error || 'Delete failed'); return }
    fetchServices()
  }

  if (!adminUser) return null

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#F9F6F1] pb-16">
      <div className="max-w-6xl mx-auto px-6 pt-10">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm uppercase tracking-wide text-gray-500">Admin</p>
          <h1 className="text-4xl font-bold text-gray-900 mt-1">Admin Dashboard</h1>
        </div>

        {/* Top-level tabs */}
        <div className="flex gap-1 rounded-xl bg-gray-100 p-1 mb-8 w-fit">
          {(['requests', 'users', 'services'] as AdminTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-2 rounded-lg text-sm font-semibold capitalize transition ${
                tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── REQUESTS TAB ───────────────────────────────────────────────── */}
        {tab === 'requests' && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
              {REQUEST_STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setRequestTab(s)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    requestTab === s ? 'border-[#1B6B4A] bg-[#E6F4ED]' : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <p className="text-xs uppercase tracking-wide text-gray-500">{STATUS_LABEL[s]}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {requests.filter((r) => r.status === s).length}
                  </p>
                </button>
              ))}
            </div>

            <div className="flex gap-2 border-b border-gray-200 mb-6 overflow-x-auto">
              {REQUEST_STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setRequestTab(s)}
                  className={`pb-3 px-4 font-semibold text-sm whitespace-nowrap transition ${
                    requestTab === s ? 'text-[#1B6B4A] border-b-2 border-[#1B6B4A]' : 'text-gray-500'
                  }`}
                >
                  {STATUS_LABEL[s]} ({requests.filter((r) => r.status === s).length})
                </button>
              ))}
            </div>

            {requestsLoading ? (
              <div className="text-center py-16">
                <div className="animate-spin inline-block w-8 h-8 border-4 border-[#1B6B4A] border-t-transparent rounded-full" />
              </div>
            ) : filteredRequests.length === 0 ? (
              <p className="text-center text-gray-500 py-16">No {STATUS_LABEL[requestTab].toLowerCase()} requests.</p>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((r) => (
                  <div key={r.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE[requestTab]}`}>
                            {STATUS_LABEL[requestTab]}
                          </span>
                          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">{r.service}</span>
                          <span className="px-3 py-1 rounded-full bg-[#E6F4ED] text-[#1B6B4A] text-xs font-semibold">{r.urgency}</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{r.title}</h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{r.description}</p>
                        {r.address_hint && <p className="text-sm text-gray-500">📍 {r.address_hint}</p>}
                        {r.status === 'in_progress' && r.accepted_contractor_name && (
                          <p className="text-sm text-blue-700 font-semibold mt-1">
                            Contractor: {r.accepted_contractor_name} · {r.accepted_contractor_email}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(r.created_at).toLocaleString()} · ID: {r.id}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        {r.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(r.id)}
                              disabled={requestActionId === r.id + '-approve'}
                              className="px-5 py-2 rounded-xl bg-[#1B6B4A] text-white font-semibold text-sm hover:bg-[#134E35] transition disabled:opacity-50"
                            >
                              {requestActionId === r.id + '-approve' ? 'Approving…' : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleDeny(r.id)}
                              disabled={requestActionId === r.id + '-deny'}
                              className="px-5 py-2 rounded-xl bg-red-100 text-red-700 font-semibold text-sm hover:bg-red-200 transition disabled:opacity-50"
                            >
                              {requestActionId === r.id + '-deny' ? 'Denying…' : 'Deny'}
                            </button>
                          </>
                        )}
                        {r.status === 'denied' && (
                          <button
                            onClick={() => handleApprove(r.id)}
                            disabled={requestActionId === r.id + '-approve'}
                            className="px-5 py-2 rounded-xl bg-[#1B6B4A] text-white font-semibold text-sm hover:bg-[#134E35] transition disabled:opacity-50"
                          >
                            Re-approve
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteRequest(r.id)}
                          disabled={requestActionId === r.id + '-delete'}
                          className="px-5 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition disabled:opacity-50"
                        >
                          {requestActionId === r.id + '-delete' ? 'Deleting…' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── USERS TAB ──────────────────────────────────────────────────── */}
        {tab === 'users' && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex gap-2">
                {(['all', 'resident', 'contractor'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setUserRoleFilter(f)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition ${
                      userRoleFilter === f
                        ? 'bg-[#1B6B4A] text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {f === 'all' ? `All (${users.length})` : `${f}s (${users.filter((u) => u.role === f).length})`}
                  </button>
                ))}
              </div>
              <button
                onClick={openAddUser}
                className="px-5 py-2 rounded-xl bg-[#1B6B4A] text-white font-semibold text-sm hover:bg-[#134E35] transition"
              >
                + Add User
              </button>
            </div>

            {usersLoading ? (
              <div className="text-center py-16">
                <div className="animate-spin inline-block w-8 h-8 border-4 border-[#1B6B4A] border-t-transparent rounded-full" />
              </div>
            ) : displayedUsers.length === 0 ? (
              <p className="text-center text-gray-500 py-16">No users found.</p>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left px-5 py-3 font-semibold text-gray-700">Name</th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-700">Email</th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-700">Role</th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-700">Phone</th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-700">Trade</th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-700">Joined</th>
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {displayedUsers.map((u) => (
                      <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="px-5 py-3 font-semibold text-gray-900">{u.name}</td>
                        <td className="px-5 py-3 text-gray-600">{u.email}</td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                            u.role === 'contractor' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-600">{u.phone || '—'}</td>
                        <td className="px-5 py-3 text-gray-600">{u.trade || '—'}</td>
                        <td className="px-5 py-3 text-gray-400 text-xs">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => openEditUser(u)}
                              className="px-3 py-1 rounded-lg bg-indigo-100 text-indigo-700 font-semibold text-xs hover:bg-indigo-200 transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              className="px-3 py-1 rounded-lg bg-red-100 text-red-700 font-semibold text-xs hover:bg-red-200 transition"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ── SERVICES TAB ───────────────────────────────────────────────── */}
        {tab === 'services' && (
          <>
            {/* Add service form */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Add New Service</h2>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">ID (no spaces)</label>
                  <input
                    value={serviceForm.id}
                    onChange={(e) => setServiceForm({ ...serviceForm, id: e.target.value })}
                    placeholder="e.g. junkremoval"
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:border-[#1B6B4A] focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Label</label>
                  <input
                    value={serviceForm.label}
                    onChange={(e) => setServiceForm({ ...serviceForm, label: e.target.value })}
                    placeholder="e.g. Junk Removal"
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:border-[#1B6B4A] focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Icon (emoji)</label>
                  <input
                    value={serviceForm.icon}
                    onChange={(e) => setServiceForm({ ...serviceForm, icon: e.target.value })}
                    placeholder="🗑️"
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:border-[#1B6B4A] focus:outline-none text-sm"
                  />
                </div>
                <button
                  onClick={handleAddService}
                  disabled={serviceAdding}
                  className="px-5 py-2 rounded-xl bg-[#1B6B4A] text-white font-semibold text-sm hover:bg-[#134E35] transition disabled:opacity-50"
                >
                  {serviceAdding ? 'Adding…' : '+ Add Service'}
                </button>
              </div>
            </div>

            {servicesLoading ? (
              <div className="text-center py-16">
                <div className="animate-spin inline-block w-8 h-8 border-4 border-[#1B6B4A] border-t-transparent rounded-full" />
              </div>
            ) : services.length === 0 ? (
              <p className="text-center text-gray-500 py-16">
                No services yet. Add one above or run the SQL migration to seed defaults.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {services.map((s) => (
                  <div key={s.id} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-col items-center gap-2 text-center">
                    <span className="text-3xl">{s.icon}</span>
                    <p className="font-semibold text-gray-900 text-sm">{s.label}</p>
                    <p className="text-xs text-gray-400 font-mono">{s.id}</p>
                    <button
                      onClick={() => handleDeleteService(s.id, s.label)}
                      className="mt-1 px-3 py-1 rounded-lg bg-red-100 text-red-700 font-semibold text-xs hover:bg-red-200 transition"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── User Modal (Add / Edit) ─────────────────────────────────────── */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-gray-200 p-8 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingUser ? 'Edit User' : 'Add User'}
              </h2>
              <button onClick={() => setShowUserModal(false)} className="text-gray-400 hover:text-gray-600 text-3xl font-bold leading-none">×</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Role</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value as 'resident' | 'contractor' })}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:border-[#1B6B4A] focus:outline-none"
                >
                  <option value="resident">Resident</option>
                  <option value="contractor">Contractor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Name *</label>
                <input
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  placeholder="Jane Doe"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:border-[#1B6B4A] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Email *</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  placeholder="jane@example.com"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:border-[#1B6B4A] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Phone</label>
                <input
                  value={userForm.phone || ''}
                  onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                  placeholder="(615) 555-0123"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:border-[#1B6B4A] focus:outline-none"
                />
              </div>
              {userForm.role === 'contractor' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">Trade</label>
                  <input
                    value={userForm.trade || ''}
                    onChange={(e) => setUserForm({ ...userForm, trade: e.target.value })}
                    placeholder="Plumbing, HVAC…"
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:border-[#1B6B4A] focus:outline-none"
                  />
                </div>
              )}
              {userForm.role === 'resident' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1">Preferred Contact</label>
                    <select
                      value={userForm.preferred_contact || 'email'}
                      onChange={(e) => setUserForm({ ...userForm, preferred_contact: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:border-[#1B6B4A] focus:outline-none"
                    >
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-3 text-sm text-gray-900">
                      <input
                        type="checkbox"
                        checked={userForm.newsletter_opt_in ?? true}
                        onChange={(e) => setUserForm({ ...userForm, newsletter_opt_in: e.target.checked })}
                        className="h-4 w-4 accent-[#1B6B4A]"
                      />
                      Newsletter
                    </label>
                    <label className="flex items-center gap-3 text-sm text-gray-900">
                      <input
                        type="checkbox"
                        checked={userForm.marketing_opt_in ?? false}
                        onChange={(e) => setUserForm({ ...userForm, marketing_opt_in: e.target.checked })}
                        className="h-4 w-4 accent-[#1B6B4A]"
                      />
                      Marketing emails
                    </label>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveUser}
                disabled={userSaving}
                className="flex-1 py-3 rounded-xl bg-[#1B6B4A] text-white font-semibold hover:bg-[#134E35] transition disabled:opacity-50"
              >
                {userSaving ? 'Saving…' : editingUser ? 'Save Changes' : 'Create User'}
              </button>
              <button
                onClick={() => setShowUserModal(false)}
                className="flex-1 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
