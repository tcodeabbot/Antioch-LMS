# Contributing to Antioch LMS

Thank you for your interest in contributing to Antioch LMS! This guide walks you through everything you need to get started — from setting up your local environment to opening a pull request.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Project Architecture](#project-architecture)
- [Development Workflow](#development-workflow)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Code Style & Conventions](#code-style--conventions)
- [Environment Variables](#environment-variables)
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)
- [Code of Conduct](#code-of-conduct)

---

## Prerequisites

Before you begin, make sure you have the following installed:

| Tool | Version | Purpose |
|------|---------|---------|
| [Node.js](https://nodejs.org/) | v20.x or later | JavaScript runtime |
| [pnpm](https://pnpm.io/) | v10.x or later | Package manager |
| [Git](https://git-scm.com/) | Latest | Version control |

You will also need accounts on the following services (for full local development):

- [Clerk](https://clerk.com/) — Authentication
- [Sanity](https://www.sanity.io/) — Headless CMS
- [Stripe](https://stripe.com/) — Payment processing (optional, only for payment-related work)

> **Note:** If you're contributing to UI components or non-integration features, you can often work without Stripe keys. Reach out to the maintainers if you need access to shared development credentials.

---

## Getting Started

### 1. Fork the Repository

Click the **Fork** button on the [Antioch LMS GitHub repository](https://github.com/tcodeabbot/Antioch-LMS) to create your own copy.

### 2. Clone Your Fork

```bash
git clone https://github.com/<your-username>/Antioch-LMS.git
cd Antioch-LMS
```

### 3. Add the Upstream Remote

```bash
git remote add upstream https://github.com/tcodeabbot/Antioch-LMS.git
```

### 4. Install Dependencies

```bash
pnpm install
```

### 5. Set Up Environment Variables

Copy the example environment file and fill in the required values:

```bash
cp .env.example .env.local
```

See [Environment Variables](#environment-variables) for details on each variable.

### 6. Start the Development Server

```bash
pnpm dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

> **Tip:** If you encounter slow startup with Turbopack, you can run `npx next dev` (without Turbopack) as a fallback.

---

## Project Architecture

```
antioch-lms/
├── app/                    # Next.js App Router (pages & API routes)
│   ├── (admin)/            # Admin routes (Sanity Studio)
│   ├── (dashboard)/        # Student dashboard routes
│   ├── (user)/             # Public-facing user routes
│   ├── admin/              # Admin dashboard pages
│   ├── api/                # API route handlers
│   ├── actions/            # Server actions
│   └── layout.tsx          # Root layout
├── components/             # Reusable React components
│   ├── ui/                 # Base UI primitives (Radix + Tailwind)
│   ├── admin/              # Admin-specific components
│   ├── dashboard/          # Dashboard-specific components
│   └── providers/          # React context providers
├── sanity/                 # Sanity CMS configuration
│   ├── lib/                # GROQ queries & data-fetching utilities
│   └── schemaTypes/        # Sanity document schemas
├── lib/                    # Shared utility functions
├── actions/                # Server action files
├── middleware.ts            # Auth & routing middleware (Clerk)
└── public/                 # Static assets
```

### Key Technologies

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5
- **UI:** React 19, Tailwind CSS 4, Radix UI
- **CMS:** Sanity with GROQ queries
- **Auth:** Clerk
- **Payments:** Stripe
- **Package Manager:** pnpm

---

## Development Workflow

### Branching Strategy

We use a simple branch-based workflow:

- `main` — Production branch. Always deployable. **Never push directly to `main`.**
- Feature branches — Create from `main` for all changes.

### Branch Naming Convention

Use descriptive, kebab-case branch names:

```
feature/add-certificate-generation
fix/enrollment-redirect-loop
refactor/simplify-middleware-logic
docs/update-contributing-guide
```

---

## Making Changes

### 1. Sync with Upstream

Before starting work, make sure your fork is up to date:

```bash
git checkout main
git pull upstream main
git push origin main
```

### 2. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 3. Make Your Changes

- Write clean, type-safe TypeScript
- Follow the existing code patterns and conventions
- Keep commits focused — one logical change per commit

### 4. Run Linting

```bash
pnpm lint
```

Fix any linting errors before committing.

### 5. Test Locally

Verify your changes work correctly:

- Check the feature in the browser at `http://localhost:3000`
- Test on both light and dark mode
- Test responsive behavior at mobile, tablet, and desktop breakpoints
- Verify there are no console errors

### 6. Commit Your Changes

Write clear, concise commit messages:

```bash
git add .
git commit -m "Add certificate generation for completed courses"
```

**Commit message guidelines:**

- Use the imperative mood: "Add feature" not "Added feature"
- Keep the first line under 72 characters
- Reference related issues when applicable: `Fix enrollment redirect loop (#42)`

---

## Pull Request Process

### 1. Push Your Branch

```bash
git push origin feature/your-feature-name
```

### 2. Open a Pull Request

Go to the [Antioch LMS repository](https://github.com/tcodeabbot/Antioch-LMS) and click **New Pull Request**. Select your fork and branch.

### 3. Fill Out the PR Template

Your pull request description should include:

```markdown
## Summary
Brief description of what this PR does and why.

## Changes
- List of specific changes made
- Another change
- Another change

## How to Test
1. Step-by-step instructions to test the change
2. Another step
3. Expected result

## Screenshots (if applicable)
Include screenshots for any UI changes.

## Related Issues
Closes #<issue-number>
```

### 4. Review Process

- A maintainer will review your PR
- Address any requested changes by pushing new commits to your branch
- Once approved, a maintainer will merge your PR

### What We Look For in Reviews

- Code follows existing patterns and conventions
- TypeScript is used correctly (no `any` types without justification)
- UI changes are responsive and support dark mode
- No new console warnings or errors
- Changes are focused and don't include unrelated modifications

---

## Code Style & Conventions

### TypeScript

- Use strict TypeScript — avoid `any` when possible
- Define interfaces for component props
- Use generated Sanity types from `sanity.types.ts` (run `pnpm typegen` to regenerate)

### React Components

- Use functional components with hooks
- Server Components by default; add `"use client"` only when necessary
- Keep components focused and composable
- Place reusable components in `components/`, page-specific ones alongside their route

### Styling

- Use Tailwind CSS utility classes
- Follow the existing design token system (colors via CSS variables like `bg-background`, `text-foreground`, etc.)
- Ensure dark mode compatibility — use semantic color tokens, not hardcoded values
- Use the `cn()` utility from `lib/utils.ts` for conditional class merging

### File Naming

- React components: `PascalCase.tsx` (e.g., `CourseCard.tsx`)
- Utilities and queries: `camelCase.ts` (e.g., `getCourses.ts`)
- Route files: follow Next.js conventions (`page.tsx`, `layout.tsx`, `loading.tsx`)

### Imports

- Use path aliases: `@/components/...`, `@/sanity/lib/...`, `@/lib/...`
- Group imports: external packages first, then internal modules

---

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_STUDIO_PROJECT_ID=your_project_id
SANITY_STUDIO_DATASET=production
SANITY_API_TOKEN=your_api_token
SANITY_API_ADMIN_TOKEN=your_admin_token

# Next.js
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Stripe (optional — only needed for payment features)
NEXT_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Admin Access
ADMIN_EMAILS=your-email@example.com
```

> **Important:** Never commit `.env.local` or any file containing secrets. The `.gitignore` already excludes it.

If you need test credentials for Clerk or Sanity, reach out to the maintainers by opening an issue.

---

## Common Tasks

### Regenerate Sanity Types

After modifying Sanity schemas, regenerate the TypeScript types:

```bash
pnpm typegen
```

### Access Sanity Studio

The embedded Sanity Studio is available at `/studio` when running locally.

### Run a Production Build Locally

```bash
pnpm build
pnpm start
```

### Check for Lint Errors

```bash
pnpm lint
```

---

## Troubleshooting

### `pnpm install` fails with build script errors

Some native dependencies (`esbuild`, `sharp`) need to run post-install scripts. If pnpm blocks them, make sure your `pnpm-workspace.yaml` includes:

```yaml
onlyBuiltDependencies:
  - esbuild
  - sharp
  - unrs-resolver
```

### Dev server hangs on "Compiling..."

If `pnpm dev` (Turbopack) hangs during compilation, use the webpack dev server instead:

```bash
npx next dev
```

### Clerk authentication not working locally

- Ensure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are set in `.env.local`
- Make sure you're accessing the app via `http://localhost:3000`, not an IP address

### Sanity CORS errors

If you see CORS errors related to Sanity, add `http://localhost:3000` as an allowed origin in your [Sanity project settings](https://sanity.io/manage).

---

## Questions?

If you have questions or need help getting started, feel free to [open an issue](https://github.com/tcodeabbot/Antioch-LMS/issues) on GitHub. 
