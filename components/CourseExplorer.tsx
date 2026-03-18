"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { CourseCard } from "@/components/CourseCard";
import { GetCoursesQueryResult } from "@/sanity.types";

type Course = GetCoursesQueryResult[number];

interface Category {
  _id: string;
  name: string | null;
  slug: string | null;
}

type PriceFilter = "all" | "free" | "paid";

interface CourseExplorerProps {
  courses: Course[];
  categories: Category[];
}

export function CourseExplorer({ courses, categories }: CourseExplorerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [showFilters, setShowFilters] = useState(false);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchesTitle = course.title?.toLowerCase().includes(q);
        const matchesDesc = course.description?.toLowerCase().includes(q);
        const matchesInstructor = course.instructor?.name
          ?.toLowerCase()
          .includes(q);
        const matchesCategory = course.category?.name
          ?.toLowerCase()
          .includes(q);
        if (!matchesTitle && !matchesDesc && !matchesInstructor && !matchesCategory) {
          return false;
        }
      }

      if (selectedCategory && course.category?.name !== selectedCategory) {
        return false;
      }

      if (priceFilter === "free" && (course.price ?? 0) !== 0) {
        return false;
      }
      if (priceFilter === "paid" && (course.price ?? 0) === 0) {
        return false;
      }

      return true;
    });
  }, [courses, searchQuery, selectedCategory, priceFilter]);

  const activeFilterCount =
    (selectedCategory ? 1 : 0) + (priceFilter !== "all" ? 1 : 0);

  const clearAll = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setPriceFilter("all");
  };

  return (
    <div className="container mx-auto px-4">
      {/* Search & filter bar */}
      <div className="py-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search input */}
          <div className="relative flex-1 max-w-3xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search by title, description, instructor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 rounded-lg bg-card border border-border pl-11 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter toggle (mobile) + price pills (desktop) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden flex items-center gap-2 h-11 px-4 rounded-lg border border-border bg-card text-sm font-medium hover:bg-accent transition-colors"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Price filter pills — always visible on sm+ */}
            <div className="hidden sm:flex items-center gap-1 p-1 rounded-lg bg-card border border-border">
              {(["all", "free", "paid"] as PriceFilter[]).map((value) => (
                <button
                  key={value}
                  onClick={() => setPriceFilter(value)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    priceFilter === value
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  {value === "all" ? "All" : value === "free" ? "Free" : "Paid"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile filter panel */}
        {showFilters && (
          <div className="sm:hidden space-y-3 p-4 rounded-lg border border-border bg-card animate-in slide-in-from-top-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Price
              </p>
              <div className="flex gap-1">
                {(["all", "free", "paid"] as PriceFilter[]).map((value) => (
                  <button
                    key={value}
                    onClick={() => setPriceFilter(value)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      priceFilter === value
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground bg-accent/50 hover:bg-accent"
                    }`}
                  >
                    {value === "all"
                      ? "All"
                      : value === "free"
                        ? "Free"
                        : "Paid"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Category
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    !selectedCategory
                      ? "bg-primary text-primary-foreground"
                      : "bg-accent/50 text-muted-foreground hover:bg-accent"
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === cat.name
                        ? "bg-primary text-primary-foreground"
                        : "bg-accent/50 text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Category pills — desktop */}
        {categories.length > 0 && (
          <div className="hidden sm:flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                !selectedCategory
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
              }`}
            >
              All Courses
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === cat.name ? null : cat.name
                  )
                }
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  selectedCategory === cat.name
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Active filter summary */}
        {(searchQuery || selectedCategory || priceFilter !== "all") && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {filteredCourses.length}
              </span>{" "}
              {filteredCourses.length === 1 ? "course" : "courses"}
              {searchQuery && (
                <span>
                  {" "}
                  for &ldquo;
                  <span className="text-foreground">{searchQuery}</span>&rdquo;
                </span>
              )}
            </p>
            <button
              onClick={clearAll}
              className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline transition-colors"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Course grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-16">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              href={`/courses/${course.slug}`}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Search className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No courses found</h3>
          <p className="text-muted-foreground text-sm max-w-md">
            Try adjusting your search or filters to find what you&apos;re
            looking for.
          </p>
          <button
            onClick={clearAll}
            className="mt-4 text-sm font-medium text-primary hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
