import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase-admin'

export async function GET() {
  const db = getAdminClient()
  const { data, error } = await db
    .from('services')
    .select('*')
    .order('label', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const db = getAdminClient()
  const body = await request.json()

  if (!body.id || !body.label) {
    return NextResponse.json({ error: 'id and label are required' }, { status: 400 })
  }

  // Normalise id: lowercase, no spaces
  body.id = body.id.toLowerCase().replace(/\s+/g, '')

  const { data, error } = await db.from('services').insert([body]).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
