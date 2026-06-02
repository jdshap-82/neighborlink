import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  const db = getAdminClient()

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { resident_id, resident_name, resident_email, ...requestData } = body as {
    resident_id: string
    resident_name: string
    resident_email: string
    [key: string]: unknown
  }

  if (!resident_id || !resident_name || !resident_email) {
    return NextResponse.json({ error: 'Missing resident info' }, { status: 400 })
  }

  // Ensure the profile exists so resident_id FK is satisfied
  await db.from('profiles').upsert(
    [{ id: resident_id, role: 'resident', name: resident_name, email: resident_email }],
    { onConflict: 'id' }
  )

  const { error } = await db.from('requests').insert([{ resident_id, ...requestData }])
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
