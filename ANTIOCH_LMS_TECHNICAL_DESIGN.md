# Antioch LMS - Technical Design Document

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Database Design](#database-design)
5. [Authentication & Authorization](#authentication--authorization)
6. [Core Features](#core-features)
7. [Payment Integration](#payment-integration)
8. [Content Management](#content-management)
9. [User Interface Design](#user-interface-design)
10. [API Design](#api-design)
11. [Security Considerations](#security-considerations)
12. [Performance & Scalability](#performance--scalability)
13. [Deployment Architecture](#deployment-architecture)
14. [Development Workflow](#development-workflow)
15. [Testing Strategy](#testing-strategy)
16. [Monitoring & Analytics](#monitoring--analytics)
17. [Future Enhancements](#future-enhancements)

---

## Executive Summary

**Antioch LMS** is a comprehensive Learning Management System built with modern web technologies to provide an intuitive, scalable, and feature-rich platform for online education. The system supports course creation, student enrollment, progress tracking, payment processing, and content delivery through a sophisticated architecture that combines headless CMS capabilities with real-time user interactions.

### Key Objectives
- Provide a seamless learning experience for students
- Enable instructors to create and manage courses efficiently
- Support both free and paid course models
- Track student progress and engagement
- Ensure secure payment processing
- Maintain high performance and scalability

---

## System Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (Next.js)     │◄──►│   (Next.js API) │◄──►│   Services      │
│                 │    │                 │    │                 │
│ • React 19      │    │ • Server Actions│    │ • Sanity CMS    │
│ • TypeScript    │    │ • API Routes    │    │ • Stripe        │
│ • Tailwind CSS  │    │ • Middleware    │    │ • Clerk Auth    │
│ • Radix UI      │    │ • Database      │    │ • Loom Videos   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Component Architecture

The system follows a modular architecture with clear separation of concerns:

1. **Presentation Layer**: React components with TypeScript
2. **Business Logic Layer**: Server actions and API routes
3. **Data Access Layer**: Sanity CMS integration
4. **External Services Layer**: Third-party integrations

---

## Technology Stack

### Frontend Technologies
- **Framework**: Next.js 15.3.5 with App Router
- **Language**: TypeScript 5
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Component Library**: Radix UI primitives
- **Icons**: Lucide React
- **Theme**: next-themes for dark/light mode
- **Video Player**: react-player for multimedia content

### Backend Technologies
- **Runtime**: Node.js with Next.js API routes
- **Server Actions**: Next.js server actions for data mutations
- **Middleware**: Next.js middleware for authentication
- **Database**: Sanity CMS (headless CMS)
- **Query Language**: GROQ (Graph-Relational Object Queries)

### External Services
- **Authentication**: Clerk (OAuth, email/password)
- **Payment Processing**: Stripe
- **Content Management**: Sanity Studio
- **Video Hosting**: Loom integration
- **Image Processing**: Sanity Image URL builder

### Development Tools
- **Package Manager**: pnpm
- **Linting**: ESLint with Next.js config
- **Type Generation**: Sanity TypeGen
- **Build Tool**: Turbopack (Next.js)
- **Version Control**: Git

---

## Database Design

### Sanity CMS Schema

The system uses Sanity CMS as a headless content management system with the following document types:

#### Core Entities

**1. Course (`course`)**
```typescript
interface Course {
  _id: string;
  _type: "course";
  title: string;
  slug: Slug;
  description: string;
  price: number; // USD
  image: SanityImage;
  category: Reference<Category>;
  modules: Reference<Module>[];
  instructor: Reference<Instructor>;
  _createdAt: string;
  _updatedAt: string;
}
```

**2. Module (`module`)**
```typescript
interface Module {
  _id: string;
  _type: "module";
  title: string;
  lessons: Reference<Lesson>[];
  _createdAt: string;
  _updatedAt: string;
}
```

**3. Lesson (`lesson`)**
```typescript
interface Lesson {
  _id: string;
  _type: "lesson";
  title: string;
  slug: Slug;
  description: string;
  videoUrl?: string; // External video URL
  loomUrl?: string;  // Loom share URL
  content: BlockContent[]; // Rich text content
  _createdAt: string;
  _updatedAt: string;
}
```

**4. Student (`student`)**
```typescript
interface Student {
  _id: string;
  _type: "student";
  clerkId: string; // Clerk user ID
  email: string;
  firstName: string;
  lastName: string;
  imageUrl?: string;
  _createdAt: string;
  _updatedAt: string;
}
```

**5. Instructor (`instructor`)**
```typescript
interface Instructor {
  _id: string;
  _type: "instructor";
  name: string;
  bio: string;
  photo: SanityImage;
  _createdAt: string;
  _updatedAt: string;
}
```

**6. Enrollment (`enrollment`)**
```typescript
interface Enrollment {
  _id: string;
  _type: "enrollment";
  student: Reference<Student>;
  course: Reference<Course>;
  amount: number; // Payment amount in cents
  paymentId: string; // Stripe payment ID or "free"
  enrolledAt: string;
  _createdAt: string;
  _updatedAt: string;
}
```

**7. Lesson Completion (`lessonCompletion`)**
```typescript
interface LessonCompletion {
  _id: string;
  _type: "lessonCompletion";
  student: Reference<Student>;
  lesson: Reference<Lesson>;
  module: Reference<Module>;
  course: Reference<Course>;
  completedAt: string;
  _createdAt: string;
  _updatedAt: string;
}
```

**8. Category (`category`)**
```typescript
interface Category {
  _id: string;
  _type: "category";
  title: string;
  description: string;
  _createdAt: string;
  _updatedAt: string;
}
```

### Data Relationships

```
Course (1) ──→ (N) Module (1) ──→ (N) Lesson
  │                                    │
  │                                    │
  └──→ (N) Enrollment ←── (1) Student ─┘
  │
  └──→ (1) Instructor
  │
  └──→ (1) Category

Student (1) ──→ (N) LessonCompletion ──→ (1) Lesson
```

---

## Authentication & Authorization

### Authentication System (Clerk)

The system uses Clerk for comprehensive authentication management:

#### Features
- **Multi-provider OAuth**: Google, GitHub, etc.
- **Email/Password Authentication**
- **User Management**: Profile management, password reset
- **Session Management**: Secure JWT-based sessions
- **User Metadata**: Custom user attributes

#### Implementation
```typescript
// Middleware for route protection
export default clerkMiddleware();

// Authentication check in components
const { userId } = await auth();
if (!userId) redirect("/sign-in");

// User data access
const clerkUser = await clerkClient().users.getUser(userId);
```

### Authorization Model

#### Role-Based Access Control
1. **Students**: Can enroll in courses, view lessons, track progress
2. **Instructors**: Can create and manage courses (future feature)
3. **Administrators**: Full system access via Sanity Studio

#### Access Control Implementation
```typescript
// Course access verification
export async function checkCourseAccess(
  clerkId: string | null,
  courseId: string
): Promise<AuthResult> {
  if (!clerkId) return { isAuthorized: false, redirect: "/" };
  
  const student = await getStudentByClerkId(clerkId);
  if (!student) return { isAuthorized: false, redirect: "/" };
  
  const isEnrolled = await isEnrolledInCourse(clerkId, courseId);
  if (!isEnrolled) {
    return { 
      isAuthorized: false, 
      redirect: `/courses/${course?.slug?.current}` 
    };
  }
  
  return { isAuthorized: true, studentId: student._id };
}
```

---

## Core Features

### 1. Course Management

#### Course Creation & Structure
- **Hierarchical Organization**: Courses → Modules → Lessons
- **Rich Content Support**: Text, images, videos, Loom embeds
- **Pricing Models**: Free and paid courses
- **SEO Optimization**: Slug-based URLs, metadata

#### Course Discovery
- **Search Functionality**: Full-text search across courses
- **Category Filtering**: Organized by subject areas
- **Featured Courses**: Highlighted course recommendations

### 2. Student Enrollment System

#### Enrollment Process
```typescript
// Free course enrollment
if (priceInCents === 0) {
  await createEnrollment({
    studentId: user._id,
    courseId: course._id,
    paymentId: "free",
    amount: 0,
  });
  return { url: `/courses/${course.slug?.current}` };
}

// Paid course enrollment via Stripe
const session = await stripe.checkout.sessions.create({
  line_items: [/* course details */],
  mode: "payment",
  success_url: `${baseUrl}/courses/${slug.current}`,
  metadata: { courseId: course._id, userId: userId },
});
```

#### Enrollment Verification
- **Real-time Access Control**: Middleware-based route protection
- **Enrollment Status Tracking**: Database queries for access verification
- **Payment Verification**: Stripe webhook integration

### 3. Progress Tracking

#### Lesson Completion System
```typescript
// Mark lesson as complete
export async function completeLessonById({
  lessonId,
  clerkId,
}: {
  lessonId: string;
  clerkId: string;
}) {
  const student = await getStudentByClerkId(clerkId);
  const lesson = await getLessonById(lessonId);
  
  return client.create({
    _type: "lessonCompletion",
    student: { _type: "reference", _ref: student._id },
    lesson: { _type: "reference", _ref: lessonId },
    module: { _type: "reference", _ref: lesson.module._ref },
    course: { _type: "reference", _ref: lesson.course._ref },
    completedAt: new Date().toISOString(),
  });
}
```

#### Progress Visualization
- **Course Progress Bars**: Visual completion indicators
- **Module Completion**: Track progress through course modules
- **Overall Statistics**: Completion rates and learning analytics

### 4. Content Delivery

#### Multimedia Support
- **Video Integration**: React Player for external videos
- **Loom Integration**: Embedded Loom video player
- **Rich Text Content**: Portable Text with Sanity
- **Image Optimization**: Sanity Image URL builder

#### Content Structure
```typescript
// Lesson content rendering
{lesson.videoUrl && <VideoPlayer url={lesson.videoUrl} />}
{lesson.loomUrl && <LoomEmbed shareUrl={lesson.loomUrl} />}
{lesson.content && (
  <div className="prose prose-blue dark:prose-invert max-w-none">
    <PortableText value={lesson.content} />
  </div>
)}
```

---

## Payment Integration

### Stripe Integration

#### Payment Flow
1. **Course Selection**: Student selects paid course
2. **Checkout Creation**: Server action creates Stripe session
3. **Payment Processing**: Stripe handles payment
4. **Webhook Processing**: Enrollment creation on successful payment
5. **Access Grant**: Student gains course access

#### Implementation Details
```typescript
// Stripe checkout session creation
const session = await stripe.checkout.sessions.create({
  line_items: [{
    price_data: {
      currency: "usd",
      product_data: {
        name: title,
        description: description,
        images: [urlFor(image).url()],
      },
      unit_amount: priceInCents,
    },
    quantity: 1,
  }],
  mode: "payment",
  success_url: `${baseUrl}/courses/${slug.current}`,
  cancel_url: `${baseUrl}/courses/${slug.current}?canceled=true`,
  metadata: { courseId: course._id, userId: userId },
});
```

#### Webhook Processing
```typescript
// Stripe webhook handler
if (event.type === "checkout.session.completed") {
  const session = event.data.object as Stripe.Checkout.Session;
  const { courseId, userId } = session.metadata;
  
  await createEnrollment({
    studentId: student._id,
    courseId,
    paymentId: session.id,
    amount: session.amount_total! / 100,
  });
}
```

### Payment Models
- **Free Courses**: Direct enrollment without payment
- **Paid Courses**: Stripe checkout integration
- **Subscription Model**: Future enhancement capability

---

## Content Management

### Sanity Studio Integration

#### Admin Interface
- **Course Management**: Create, edit, and organize courses
- **Content Creation**: Rich text editor with media support
- **User Management**: View enrollments and student progress
- **Analytics Dashboard**: Course performance metrics

#### Content Structure
```typescript
// Sanity Studio structure
export const structure = (S: StructureBuilder) =>
  S.list()
    .title("Admin Dashboard")
    .items([
      S.listItem()
        .title("Course Content")
        .child(S.documentTypeList("course")),
      S.listItem()
        .title("User Management")
        .child(S.documentTypeList("student")),
      S.listItem()
        .title("System Management")
        .child(S.documentTypeList("category")),
    ]);
```

### Content Delivery
- **Headless CMS**: API-driven content delivery
- **Real-time Updates**: Live content synchronization
- **Image Optimization**: Automatic image processing
- **SEO Optimization**: Meta tags and structured data

---

## User Interface Design

### Design System

#### Component Architecture
- **Atomic Design**: Atoms, molecules, organisms, templates
- **Radix UI Primitives**: Accessible, unstyled components
- **Tailwind CSS**: Utility-first styling approach
- **Dark Mode Support**: System preference detection

#### Key Components
```typescript
// Reusable UI components
- Button: Primary, secondary, ghost variants
- Card: Course cards, progress cards
- Progress: Lesson completion indicators
- Accordion: Course module navigation
- Dropdown: User menu, course filters
- Tooltip: Help text and guidance
- Sheet: Mobile navigation
- Skeleton: Loading states
```

### Responsive Design
- **Mobile-First**: Optimized for mobile devices
- **Breakpoints**: sm, md, lg, xl responsive design
- **Touch-Friendly**: Large touch targets for mobile
- **Progressive Enhancement**: Works without JavaScript

### User Experience
- **Intuitive Navigation**: Clear information architecture
- **Search Functionality**: Global course search
- **Progress Indicators**: Visual feedback for completion
- **Accessibility**: WCAG 2.1 AA compliance

---

## API Design

### Server Actions

#### Course Management
```typescript
// Get course by ID
export async function getCourseById(courseId: string): Promise<Course | null>

// Get course by slug
export async function getCourseBySlug(slug: string): Promise<Course | null>

// Search courses
export async function searchCourses(query: string): Promise<Course[]>
```

#### Student Management
```typescript
// Create student if not exists
export async function createStudentIfNotExists(studentData: CreateStudentProps)

// Get student by Clerk ID
export async function getStudentByClerkId(clerkId: string): Promise<Student | null>

// Check enrollment status
export async function isEnrolledInCourse(clerkId: string, courseId: string): Promise<boolean>
```

#### Progress Tracking
```typescript
// Complete lesson
export async function completeLessonById({ lessonId, clerkId }: CompleteLessonParams)

// Get lesson completion status
export async function getLessonCompletionStatus(lessonId: string, clerkId: string): Promise<boolean>

// Get course progress
export async function getCourseProgress(courseId: string, clerkId: string): Promise<ProgressData>
```

### API Routes

#### Webhook Endpoints
```typescript
// Stripe webhook handler
POST /api/stripe-checkout/webhook
- Handles payment completion events
- Creates enrollment records
- Validates webhook signatures
```

#### Draft Mode (Future)
```typescript
// Enable/disable draft mode
POST /api/draft-mode/enable
POST /api/draft-mode/disable
```

---

## Security Considerations

### Authentication Security
- **JWT Tokens**: Secure session management via Clerk
- **OAuth Integration**: Secure third-party authentication
- **Session Validation**: Middleware-based route protection
- **CSRF Protection**: Built-in Next.js CSRF protection

### Data Security
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: GROQ query sanitization
- **XSS Protection**: React's built-in XSS protection
- **Content Security Policy**: Strict CSP headers

### Payment Security
- **PCI Compliance**: Stripe handles sensitive payment data
- **Webhook Verification**: Stripe signature validation
- **HTTPS Enforcement**: All communications encrypted
- **Environment Variables**: Secure secret management

### Access Control
- **Route Protection**: Middleware-based authentication
- **Role-Based Access**: Different permission levels
- **API Rate Limiting**: Prevent abuse and DoS attacks
- **CORS Configuration**: Restrict cross-origin requests

---

## Performance & Scalability

### Frontend Performance
- **Next.js Optimization**: Automatic code splitting and optimization
- **Image Optimization**: Next.js Image component with Sanity
- **Lazy Loading**: Dynamic imports for heavy components
- **Caching Strategy**: ISR and static generation where appropriate

### Backend Performance
- **Database Optimization**: Efficient GROQ queries
- **CDN Integration**: Sanity CDN for content delivery
- **Caching**: Sanity client caching configuration
- **Server Actions**: Optimized data fetching

### Scalability Considerations
- **Horizontal Scaling**: Stateless application design
- **Database Scaling**: Sanity's managed infrastructure
- **CDN Distribution**: Global content delivery
- **Load Balancing**: Ready for load balancer deployment

### Performance Monitoring
- **Core Web Vitals**: LCP, FID, CLS tracking
- **Bundle Analysis**: Webpack bundle analyzer
- **Database Queries**: Query performance monitoring
- **Error Tracking**: Comprehensive error logging

---

## Deployment Architecture

### Production Environment
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CDN           │    │   Application   │    │   Database      │
│   (Vercel)      │◄──►│   (Vercel)      │◄──►│   (Sanity)      │
│                 │    │                 │    │                 │
│ • Static Assets │    │ • Next.js App   │    │ • Content Store │
│ • Global Edge   │    │ • API Routes    │    │ • Real-time     │
│ • SSL/TLS       │    │ • Server Actions│    │ • Backups       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Environment Configuration
```bash
# Production Environment Variables
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
SANITY_API_TOKEN=sk...
SANITY_API_ADMIN_TOKEN=sk...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_BASE_URL=https://antioch-lms.vercel.app
```

### Deployment Process
1. **Code Push**: Git push to main branch
2. **Build Process**: Vercel automatic build
3. **Testing**: Automated test suite execution
4. **Deployment**: Zero-downtime deployment
5. **Health Checks**: Post-deployment verification

---

## Development Workflow

### Project Structure
```
antioch-lms/
├── app/                    # Next.js App Router
│   ├── (dashboard)/       # Dashboard routes
│   ├── (user)/           # User-facing routes
│   ├── (admin)/          # Admin routes
│   ├── api/              # API routes
│   └── globals.css       # Global styles
├── components/           # React components
│   ├── ui/              # Base UI components
│   ├── dashboard/       # Dashboard components
│   └── providers/       # Context providers
├── sanity/              # Sanity CMS configuration
│   ├── lib/            # Sanity utilities
│   ├── schemaTypes/    # Content schemas
│   └── structure.ts    # Studio structure
├── lib/                # Utility libraries
├── actions/            # Server actions
└── public/             # Static assets
```

### Development Commands
```bash
# Development
pnpm dev                 # Start development server
pnpm build              # Build for production
pnpm start              # Start production server
pnpm lint               # Run ESLint

# Sanity
pnpm typegen            # Generate TypeScript types
sanity dev              # Start Sanity Studio
sanity build            # Build Sanity Studio
```

### Code Quality
- **TypeScript**: Strict type checking
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting (via ESLint)
- **Husky**: Git hooks for quality gates
- **Conventional Commits**: Standardized commit messages

---

## Testing Strategy

### Testing Pyramid
1. **Unit Tests**: Component and utility function testing
2. **Integration Tests**: API route and server action testing
3. **E2E Tests**: Full user journey testing
4. **Visual Regression**: UI component testing

### Testing Tools
- **Jest**: Unit testing framework
- **React Testing Library**: Component testing
- **Playwright**: End-to-end testing
- **MSW**: API mocking for tests

### Test Coverage
- **Component Testing**: All UI components
- **API Testing**: All server actions and routes
- **Integration Testing**: Payment flows and authentication
- **Accessibility Testing**: WCAG compliance verification

---

## Monitoring & Analytics

### Application Monitoring
- **Error Tracking**: Comprehensive error logging
- **Performance Monitoring**: Core Web Vitals tracking
- **User Analytics**: Learning behavior analysis
- **Business Metrics**: Enrollment and completion rates

### Infrastructure Monitoring
- **Uptime Monitoring**: Service availability tracking
- **Performance Metrics**: Response time monitoring
- **Resource Usage**: CPU, memory, and storage monitoring
- **Security Monitoring**: Threat detection and prevention

### Analytics Implementation
```typescript
// User engagement tracking
- Course enrollment rates
- Lesson completion rates
- Time spent on content
- User retention metrics
- Payment conversion rates
```

---

## Future Enhancements

### Phase 2 Features
1. **Instructor Dashboard**: Course creation and management tools
2. **Advanced Analytics**: Detailed learning analytics
3. **Discussion Forums**: Student-instructor communication
4. **Certificates**: Course completion certificates
5. **Mobile App**: React Native mobile application

### Phase 3 Features
1. **AI-Powered Recommendations**: Personalized course suggestions
2. **Live Streaming**: Real-time video lessons
3. **Gamification**: Points, badges, and leaderboards
4. **Multi-language Support**: Internationalization
5. **Enterprise Features**: Team management and bulk enrollment

### Technical Improvements
1. **Microservices Architecture**: Service decomposition
2. **Real-time Features**: WebSocket integration
3. **Advanced Caching**: Redis implementation
4. **Search Enhancement**: Elasticsearch integration
5. **Performance Optimization**: Advanced optimization techniques

---

## Conclusion

Antioch LMS represents a modern, scalable, and feature-rich learning management system built with cutting-edge technologies. The architecture provides a solid foundation for current functionality while remaining flexible for future enhancements. The combination of Next.js, Sanity CMS, Clerk authentication, and Stripe payments creates a robust platform that can scale to meet growing educational needs.

The system's modular design, comprehensive security measures, and performance optimizations ensure a reliable and efficient learning experience for students while providing powerful tools for content creators and administrators.

---

*This document serves as a comprehensive guide for developers, stakeholders, and technical teams working with the Antioch LMS platform. It should be updated regularly to reflect system changes and new feature implementations.*
