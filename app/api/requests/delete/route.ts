import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase-admin'

export async function DELETE(request: NextRequest) {
  let id: string
  try {
    const body = await request.json()
    id = body.id
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Missing request id' }, { status: 400 })
  }

  let db: ReturnType<typeof getAdminClient>
  try {
    db = getAdminClient()
  } catch (e: any) {
    return NextResponse.json({ error: 'Server config error: ' + e.message }, { status: 500 })
  }

  // Delete related messages first (ignore error if none exist)
  await db.from('messages').delete().eq('request_id', id)

  // Delete the request itself
  const { error } = await db.from('requests').delete().eq('id', id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
