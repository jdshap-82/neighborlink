import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase-admin'

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<'/api/admin/users/[id]'>
) {
  const { id } = await ctx.params
  const db = getAdminClient()
  const body = await request.json()
  const { data, error } = await db
    .from('profiles')
    .update(body)
    .eq('id', id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<'/api/admin/users/[id]'>
) {
  const { id } = await ctx.params
  const db = getAdminClient()

  // Cascade: delete messages belonging to this resident's requests, then their requests
  const { data: userRequests } = await db
    .from('requests')
    .select('id')
    .eq('resident_id', id)

  if (userRequests && userRequests.length > 0) {
    const requestIds = userRequests.map((r: any) => r.id)
    await db.from('messages').delete().in('request_id', requestIds)
    await db.from('requests').delete().eq('resident_id', id)
  }

  const { error } = await db.from('profiles').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
