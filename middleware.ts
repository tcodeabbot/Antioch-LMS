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

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Require authentication for all non-public routes
  if (!userId && !isPublicRoute(req)) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Check onboarding status for authenticated users
  if (userId) {
    const student = await getStudentByClerkIdForMiddleware(userId);
    const hasCompletedOnboarding = student?.onboardingCompleted === true;

    // If user hasn't completed onboarding
    if (!hasCompletedOnboarding) {
      // Allow access to onboarding page
      if (isOnboardingRoute(req)) {
        return NextResponse.next();
      }

      // Redirect to onboarding for any other protected route
      if (!isPublicRoute(req)) {
        return NextResponse.redirect(new URL('/onboarding', req.url));
      }
    }

    // If user has completed onboarding and tries to access onboarding page
    if (hasCompletedOnboarding && isOnboardingRoute(req)) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};