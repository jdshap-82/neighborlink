import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase-admin'

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<'/api/admin/services/[id]'>
) {
  const { id } = await ctx.params
  const db = getAdminClient()
  const { error } = await db.from('services').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
