import { clerkMiddleware, clerkClient, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getStudentByClerkIdForMiddleware } from '@/sanity/lib/student/getStudentByClerkIdForMiddleware';

const ONBOARDING_COOKIE = 'onboarding_done';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/courses(.*)',
  '/search(.*)',
  '/api/draft-mode(.*)',
  '/api/stripe-checkout(.*)',
]);

const isOnboardingRoute = createRouteMatcher(['/onboarding(.*)']);

const isAdminRoute = createRouteMatcher(['/admin(.*)']);

const isStudioRoute = createRouteMatcher(['/studio(.*)']);

async function checkIsAdmin(userId: string, sessionClaims: CustomJwtSessionClaims | null): Promise<boolean> {
  if (sessionClaims?.metadata?.role === 'admin') {
    return true;
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  return user.publicMetadata?.role === 'admin';
}

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req) || isStudioRoute(req)) {
    return NextResponse.next();
  }

  const { userId, sessionClaims } = await auth();

  if (!userId) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  const isPostSignInRedirect = req.nextUrl.pathname === '/auth-redirect';
  const needsAdminCheck = isAdminRoute(req) || isOnboardingRoute(req) || isPostSignInRedirect;

  if (needsAdminCheck) {
    const isAdmin = await checkIsAdmin(userId, sessionClaims as CustomJwtSessionClaims | null);

    if (isAdmin) {
      if (isOnboardingRoute(req) || isPostSignInRedirect) {
        return NextResponse.redirect(new URL('/admin', req.url));
      }
      return NextResponse.next();
    }

    if (isAdminRoute(req)) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  // Fast path: skip Sanity call if this Clerk user already passed onboarding this session
  // (value is userId so multiple accounts on the same browser don't share state)
  const hasOnboardingCookie =
    req.cookies.get(ONBOARDING_COOKIE)?.value === userId;

  if (hasOnboardingCookie) {
    if (isOnboardingRoute(req)) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  }

  // Slow path: first visit this session — check Sanity once, then set cookie
  let student: { onboardingCompleted?: boolean } | null = null;
  try {
    student = await getStudentByClerkIdForMiddleware(userId);
  } catch (err) {
    console.error('[middleware] getStudentByClerkIdForMiddleware', err);
    if (isOnboardingRoute(req)) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/onboarding', req.url));
  }
  const hasCompletedOnboarding = student?.onboardingCompleted === true;

  if (!hasCompletedOnboarding) {
    if (isOnboardingRoute(req)) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/onboarding', req.url));
  }

  // Onboarding done — set cookie so we never call Sanity again this session
  const response = isOnboardingRoute(req)
    ? NextResponse.redirect(new URL('/dashboard', req.url))
    : NextResponse.next();

  response.cookies.set(ONBOARDING_COOKIE, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
  });

  return response;
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
