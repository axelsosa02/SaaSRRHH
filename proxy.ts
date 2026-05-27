import { type NextRequest } from 'next/server'
import { proxy as proxySession } from '@/lib/supabase/proxy'

export async function proxy(request: NextRequest) {
  return await proxySession(request)
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
}