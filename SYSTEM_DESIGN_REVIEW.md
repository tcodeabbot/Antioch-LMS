# Antioch LMS - System Design Review & Scale Plan

Date: 2026-01-31  
Scope: Application architecture, data flows, scalability readiness, and a phased plan for high-traffic readiness.

---

## Executive Summary

Antioch LMS is a Next.js 15 App Router application using Sanity for content and operational data (students, enrollments, lesson completions), Clerk for auth, and Stripe for payments. The current architecture is clean for MVP traffic, but high-traffic readiness will require stronger caching, idempotency, data partitioning between content and transactional data, and improved observability. The biggest risks at scale are: unbounded Sanity reads/writes for dynamic user data, lack of caching and pagination, and webhook/server action idempotency gaps.

This document outlines concrete recommendations and a phased delivery plan to make the system suitable for scale and high traffic.

---

## Current Architecture (Observed)

### Key Services
- Frontend + backend: Next.js App Router with server actions and route handlers.
- Content/DB: Sanity (used for both course content and student/enrollment data).
- Auth: Clerk middleware and server-side user reads.
- Payments: Stripe checkout + webhook creates enrollment.

### Key Data Flows
- Course browse/search: `sanityFetch` from Sanity with live queries and no revalidation caching.
- Enrollment: server action creates Stripe session; webhook writes enrollment in Sanity.
- Progress: lesson completion writes to Sanity; course progress computed from Sanity queries.

---

## Scale & High-Traffic Risks

### 1) No effective caching for read-heavy content
`sanityFetch` is configured with `revalidate: 0`, which bypasses caching and increases read load on Sanity for high-traffic endpoints. This can create latency spikes and RPS limits.

### 2) Sanity used for transactional user data
Sanity is used for `student`, `enrollment`, and `lessonCompletion` writes. These are high-write, low-latency operations under traffic. Sanity is great for content; for transactional data it can become a bottleneck (rate limits, indexing delays, complex queries).

### 3) Idempotency gaps in enrollment and completion flows
- Stripe webhook handler does not guard against replayed events, leading to possible duplicate enrollments.
- Free enrollment path directly creates enrollment without uniqueness checks.
- Student creation is read-then-create, which can race under concurrent requests.

### 4) Unbounded queries and missing pagination
Course listing and search queries can return unbounded results. At scale, this increases latency and response size.

### 5) Missing rate limiting and abuse protection
No per-user/IP rate limits for server actions or API routes, which makes the system susceptible to spikes or abuse.

### 6) Observability gaps
No structured logging, request tracing, or performance telemetry. This will slow down incident response and capacity planning.

---

## Recommendations

### A) Data Architecture: Separate Content from Operational Data
**Target:** Keep Sanity for content; move transactional data to a dedicated DB.
- Use Postgres (or similar) for students, enrollments, lesson completions, and onboarding data.
- Enforce unique constraints: `(clerk_id)`, `(student_id, course_id)` for enrollments, `(student_id, lesson_id)` for completions.
- Add a small service layer for read/write of operational data (Prisma or Drizzle).
- Keep course/module/lesson content in Sanity; cache or snapshot key fields into the operational DB for fast joins if needed.

### B) Caching Strategy
**Target:** Reduce read load and improve latency.
- Enable Next.js caching with `revalidate` and tag-based invalidation for course content.
- Use CDN caching for public course pages.
- Add server-side cache for repeated reads (Redis) if higher scale is expected.
- Avoid `revalidate: 0` globally; only enable true live preview on admin/draft pages.

### C) Idempotency & Consistency
- Stripe webhook: persist processed event IDs and ignore duplicates.
- Enrollment creation: check for existing enrollment before insert.
- Student creation: use upsert by `clerkId` to avoid duplicates.
- Lesson completion: enforce unique constraint or use an upsert pattern.

### D) API & Workload Isolation
- Move write-heavy operations into dedicated route handlers with controlled execution.
- Introduce a background job queue for webhook processing, email, analytics events.
- Consider separating the public read app from admin/write workloads for traffic isolation.

### E) Search & Discovery
- Add pagination to course listing and search.
- For large catalogs, offload search to Algolia/Elasticsearch/Meilisearch.
- Cache search results for common terms.

### F) Observability & Reliability
- Add structured logs (request id, user id, latency, route).
- Add APM (Sentry/Datadog) for performance and errors.
- Track core metrics: RPS, p95 latency, error rate, webhook retries, cache hit rates.

---

## Proposed Target Architecture (High Level)

```
┌──────────────────────────────┐
│          Frontend            │
│  Next.js (RSC + ISR/Cache)   │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Backend API / Server Actions │
│  - Auth (Clerk)              │
│  - Cache (Redis)             │
│  - Queue (SQS/Cloud Tasks)   │
└──────────────┬───────────────┘
               │
   ┌───────────┴───────────┐
   ▼                       ▼
Sanity (Content)     Postgres (Ops)
Courses, modules     Students, enrollments,
lessons, media       completions, onboarding
```

---

## Phased Plan

### Phase 0 - Baseline (1-2 weeks)
- Add pagination to course lists and search.
- Add basic rate limiting for server actions and API routes.
- Implement Stripe webhook idempotency (store event IDs).
- Add enrollment and completion uniqueness checks.
- Reduce global `revalidate: 0` usage; use caching on public pages.

### Phase 1 - Operational Data Layer (2-4 weeks)
- Introduce Postgres with Prisma/Drizzle.
- Migrate `student`, `enrollment`, `lessonCompletion` to Postgres.
- Add background queue for webhook processing and async tasks.
- Add metrics and tracing for core routes.

### Phase 2 - Scaling & Isolation (4-8 weeks)
- Separate read traffic from admin/write traffic (optional app split).
- Add Redis for cache, rate limiting, and session-like data.
- Move search to external search engine if catalog size grows.

### Phase 3 - Hardening (Ongoing)
- Multi-region deployment strategy with read replicas.
- Add load tests and scale testing environment.
- Cost monitoring and budget alerts for Sanity, Stripe, and compute.

---

## Concrete Next Steps (Recommended Order)

1. **Cache enablement:** remove global live mode for public reads; add revalidate with tags.
2. **Idempotency:** webhook event tracking + upsert logic for enrollments/completions.
3. **Pagination:** course list/search pagination and UI updates.
4. **Operational DB:** introduce Postgres + migrate high-write entities.
5. **Observability:** logs, tracing, alerting, and dashboards.

---

## Appendix: Code References (Current)

- `sanity/lib/live.ts`: live queries set `revalidate: 0`.
- `app/api/stripe-checkout/webhook/route.ts`: webhook enrollment creation.
- `sanity/lib/student/createStudentIfNotExists.ts`: read-then-create pattern.
- `sanity/lib/lessons/completeLessonById.ts`: completion insert without uniqueness constraint.
- `sanity/lib/courses/getCourses.ts`: unbounded course list.

