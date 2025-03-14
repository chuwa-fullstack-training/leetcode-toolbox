import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from './server';

export const updateSession = async (request: NextRequest) => {
  // This `try/catch` block is only here for the interactive tutorial.
  // Feel free to remove once you have Supabase connected.
  try {
    // Create an unmodified response
    let response = NextResponse.next({
      request: {
        headers: request.headers
      }
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({
              request
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          }
        }
      }
    );

    // This will refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const {
      data: { user },
      error
    } = await supabase.auth.getUser();

    const isAdmin =
      user?.app_metadata?.role === 'admin' ||
      user?.user_metadata?.role === 'admin' ||
      user?.app_metadata?.is_admin === true ||
      user?.user_metadata?.is_admin === true;

    // protected routes
    if (request.nextUrl.pathname.startsWith('/protected') && error) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    if (request.nextUrl.pathname === '/' && !error) {
      return NextResponse.redirect(new URL('/protected', request.url));
    }

    if (request.nextUrl.pathname.startsWith('/leetcode/overview') && !isAdmin) {
      return NextResponse.redirect(new URL('/leetcode', request.url));
    }

    return response;
  } catch (e) {
    // If you are here, a Supabase client could not be created!
    // This is likely because you have not set up environment variables.
    // Check out http://localhost:3000 for Next Steps.
    return NextResponse.next({
      request: {
        headers: request.headers
      }
    });
  }
};
