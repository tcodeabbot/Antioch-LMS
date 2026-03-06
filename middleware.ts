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

  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Require authentication for all non-public routes
  if (!userId) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Check admin role — Clerk stores publicMetadata in sessionClaims.
  // Try both paths since it depends on JWT template configuration.
  const metadataRole =
    (sessionClaims?.metadata as { role?: string } | undefined)?.role ||
    (sessionClaims?.publicMetadata as { role?: string } | undefined)?.role;

  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map((e) => e.trim()) ?? [];

  // Check email-based admin (from sessionClaims if available, fallback to Sanity)
  const sessionEmail = (sessionClaims?.email as string | undefined) ?? '';
  const isAdminEmail = adminEmails.length > 0 && adminEmails.includes(sessionEmail);

  const isAdminByJwt = metadataRole === 'admin' || isAdminEmail;

  const isPostSignInRedirect = req.nextUrl.pathname === '/auth-redirect';

  if (isAdminByJwt) {
    if (isOnboardingRoute(req) || isPostSignInRedirect) {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
    return NextResponse.next();
  }

  // For users where JWT doesn't have role/email, fetch from Sanity as fallback
  const student = await getStudentByClerkIdForMiddleware(userId);

  // Check ADMIN_EMAILS against the Sanity student email
  const isAdminBySanityEmail =
    adminEmails.length > 0 && student?.email && adminEmails.includes(student.email);

  if (isAdminBySanityEmail) {
    if (isOnboardingRoute(req) || isPostSignInRedirect) {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
    return NextResponse.next();
  }

  // Block non-admins from /admin
  if (isAdminRoute(req)) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

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
