import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  const db = getAdminClient()
  const body = await request.json()

  if (!body.id || !body.name || !body.email || !body.role) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { error } = await db.from('profiles').upsert([body], { onConflict: 'id' })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
