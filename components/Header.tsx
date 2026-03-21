"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { BookMarkedIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import DarkModeToggle from "./DarkModeToggle";
import { NotificationBell } from "./NotificationBell";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4">
          {/* Logo */}
          <Link
            href="/"
            prefetch={false}
            className="flex items-center space-x-2 hover:opacity-90 transition-opacity flex-shrink-0"
            aria-label="Antioch LMS Home"
          >
            <Image
              src="/svgviewer-output.svg"
              alt="Antioch Christian Resource Center Logo"
              width={120}
              height={40}
              priority
              className="h-7 w-auto sm:h-8 md:h-9"
            />
            <span className="sr-only">Antioch LMS</span>
          </Link>

          {/* Right section: Navigation and Auth */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 flex-shrink-0">
            <SignedIn>
              <nav className="hidden sm:block">
                <Link
                  prefetch={false}
                  href="/dashboard"
                  className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors md:border md:border-border md:rounded-md md:px-3 md:py-1.5 lg:px-4 lg:py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label="My Courses"
                >
                  <BookMarkedIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="hidden lg:block">Dashboard</span>
                </Link>
              </nav>

              <Link
                prefetch={false}
                href="/my-courses"
                className="sm:hidden flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="My Courses"
              >
                <BookMarkedIcon className="h-4 w-4" />
              </Link>
              <NotificationBell />
            </SignedIn>

            <div className="flex-shrink-0">
              <DarkModeToggle />
            </div>

            <div className="flex-shrink-0">
              <SignedIn>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "h-8 w-8 sm:h-9 sm:w-9"
                    }
                  }}
                />
              </SignedIn>

              <SignedOut>
                <SignInButton mode="modal">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2.5 sm:h-9 sm:px-3 md:px-4 text-xs sm:text-sm"
                  >
                    Sign In
                  </Button>
                </SignInButton>
              </SignedOut>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
