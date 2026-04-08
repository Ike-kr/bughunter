import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// 서버 API Route에서 사용하는 Supabase 클라이언트
// 사용자의 access_token을 전달받아 RLS가 적용된 상태로 동작
export async function createServerClient() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('sb-access-token')?.value;

  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : {},
      },
    }
  );

  return client;
}

// Service Role 클라이언트 (RLS 우회, 서버에서만 사용)
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
