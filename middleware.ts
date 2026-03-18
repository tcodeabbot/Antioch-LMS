import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getStudentByClerkIdForMiddleware } from '@/sanity/lib/student/getStudentByClerkIdForMiddleware';

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

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  if (!userId) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  const role = sessionClaims?.metadata?.role;
  const isAdmin = role === 'admin';
  const isPostSignInRedirect = req.nextUrl.pathname === '/auth-redirect';

  if (isAdmin) {
    if (isOnboardingRoute(req) || isPostSignInRedirect) {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
    return NextResponse.next();
  }

  if (isAdminRoute(req)) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  const student = await getStudentByClerkIdForMiddleware(userId);
  const hasCompletedOnboarding = student?.onboardingCompleted === true;

  if (!hasCompletedOnboarding) {
    if (isOnboardingRoute(req)) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/onboarding', req.url));
  }

  if (hasCompletedOnboarding && isOnboardingRoute(req)) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
