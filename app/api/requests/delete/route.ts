import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function getAdminSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    return null
  }

  return createClient(supabaseUrl, supabaseKey, {
    db: { schema: 'public' },
  })
}

async function checkMessagesTable(adminSupabase: any) {
  const { error } = await adminSupabase
    .from('messages')
    .select('id', { head: true, count: 'exact' })
    .limit(1)

  if (error) {
    const missingTable = error.message?.includes("Could not find the table 'public.messages' in the schema cache")
    console.error('Messages table check failed:', error.message)
    return { ok: false, missingTable }
  }

  return { ok: true, missingTable: false }
}

export async function DELETE(request: NextRequest) {
  const adminSupabase = getAdminSupabase()
  if (!adminSupabase) {
    return NextResponse.json(
      { error: 'Supabase admin configuration is missing. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.' },
      { status: 500 }
    )
  }

  const { id } = await request.json()

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Missing request id' }, { status: 400 })
  }

  const messagesTableCheck = await checkMessagesTable(adminSupabase)
  if (!messagesTableCheck.ok && !messagesTableCheck.missingTable) {
    return NextResponse.json(
      { error: 'Unable to validate messages table before delete: ' + (messagesTableCheck as any).message },
      { status: 500 }
    )
  }

  if (!messagesTableCheck.missingTable) {
    const { error: msgError } = await adminSupabase
      .from('messages')
      .delete()
      .eq('request_id', id)

    if (msgError) {
      return NextResponse.json({ error: msgError.message }, { status: 500 })
    }
  } else {
    console.error('Skipping messages delete because public.messages table is not present.')
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
