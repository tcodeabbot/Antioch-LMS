"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { BookMarkedIcon, BookOpen, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { SearchInput } from "./SearchInput";
import { Button } from "./ui/button";
import DarkModeToggle from "./DarkModeToggle";

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4">
          {/* Left section: Logo and Search */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
            <Link
              href="/"
              prefetch={false}
              className="flex items-center space-x-1.5 sm:space-x-2 hover:opacity-90 transition-opacity flex-shrink-0"
              aria-label="Antioch LMS Home"
            >
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
              <span className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent whitespace-nowrap">
                <span className="hidden min-[375px]:inline">Antioch LMS</span>
                <span className="min-[375px]:hidden">Antioch</span>
              </span>
            </Link>

            {/* Desktop Search - Always visible on md+ */}
            <div className="hidden md:block flex-1 max-w-md">
              <SearchInput onSearch={() => setIsSearchOpen(false)} />
            </div>

            {/* Mobile Search Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden flex-shrink-0 h-9 w-9"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Toggle search"
            >
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>

          {/* Right section: Navigation and Auth */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 flex-shrink-0">
            {/* Dashboard Link */}
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

              {/* Mobile My Courses Icon */}
              <Link
                prefetch={false}
                href="/my-courses"
                className="sm:hidden flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="My Courses"
              >
                <BookMarkedIcon className="h-4 w-4" />
              </Link>
            </SignedIn>

            {/* Dark Mode Toggle */}
            <div className="flex-shrink-0">
              <DarkModeToggle />
            </div>

            {/* Auth Section */}
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
                    <span className="hidden sm:inline">Sign In</span>
                    <span className="sm:hidden">Sign In</span>
                  </Button>
                </SignInButton>
              </SignedOut>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar - Expandable */}
        {isSearchOpen && (
          <div className="md:hidden border-t border-border px-3 py-2.5 animate-in slide-in-from-top-2">
            <SearchInput onSearch={() => setIsSearchOpen(false)} />
          </div>
        )}
      </div>
    </header>
  );
}
