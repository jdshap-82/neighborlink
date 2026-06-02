import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function DELETE(request: NextRequest) {
  const { id } = await request.json()

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Missing request id' }, { status: 400 })
  }

  // Delete messages first, then the request (bypasses RLS via service role key)
  const { error: msgError } = await adminSupabase
    .from('messages')
    .delete()
    .eq('request_id', id)

  if (msgError) {
    return NextResponse.json({ error: msgError.message }, { status: 500 })
  }

  const { error } = await adminSupabase
    .from('requests')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
