# Antioch LMS

A comprehensive, modern Learning Management System (LMS) built with cutting-edge web technologies. Antioch LMS provides an intuitive platform for online education, supporting course creation, student enrollment, progress tracking, and secure payment processing.

---

## 📸 Screenshots

<!-- Add your screenshots here -->
<!-- 
![Home Page](./screenshots/home.png)
![Course Dashboard](./screenshots/dashboard.png)
![Course Content](./screenshots/course-content.png)
![Lesson View](./screenshots/lesson.png)
![My Courses](./screenshots/my-courses.png)
![Admin Studio](./screenshots/admin-studio.png)
-->

---

## 🎯 Overview

Antioch LMS is a full-featured learning management system designed to deliver a seamless educational experience. The platform combines the power of Next.js 15, Sanity CMS, Clerk authentication, and Stripe payments to create a robust, scalable solution for online learning.

### Key Highlights

- **Modern Tech Stack**: Built with Next.js 15, React 19, TypeScript, and Tailwind CSS
- **Headless CMS**: Sanity CMS for flexible content management
- **Secure Authentication**: Clerk-powered authentication with OAuth support
- **Payment Processing**: Integrated Stripe checkout for paid courses
- **Progress Tracking**: Real-time lesson completion and course progress monitoring
- **Responsive Design**: Mobile-first approach with dark mode support
- **Type-Safe**: Full TypeScript implementation with generated types

---

## ✨ Features

### Core Features

#### 1. **Course Management**
- Hierarchical course structure (Courses → Modules → Lessons)
- Rich content support with text, images, videos, and Loom embeds
- Free and paid course models
- SEO-optimized URLs with slug-based routing
- Course categorization and organization

#### 2. **Student Enrollment System**
- Seamless enrollment flow for free courses
- Stripe-powered checkout for paid courses
- Real-time enrollment verification
- Automatic access control based on enrollment status
- Webhook-based payment confirmation

#### 3. **Progress Tracking**
- Individual lesson completion tracking
- Course-level progress calculation
- Module completion status
- Visual progress indicators
- Completion statistics and analytics

#### 4. **Content Delivery**
- Video player integration (React Player)
- Loom video embedding
- Rich text content with Portable Text
- Optimized image delivery via Sanity CDN
- Responsive multimedia support

#### 5. **User Interface**
- Modern, clean design with Radix UI components
- Dark mode support with system preference detection
- Responsive layout for all device sizes
- Intuitive navigation and user experience
- Accessible components (WCAG 2.1 AA compliant)

#### 6. **Search & Discovery**
- Full-text course search functionality
- Category-based filtering
- Featured courses display
- Course browsing and exploration

#### 7. **Authentication & Authorization**
- Multi-provider OAuth (Google, GitHub, etc.)
- Email/password authentication
- Secure session management
- Role-based access control
- Protected routes and middleware

#### 8. **Admin Dashboard**
- Sanity Studio integration for content management
- Course creation and editing interface
- Student and enrollment management
- Content structure organization
- Real-time content preview

---

## 📄 Pages & Routes

### Public Routes

#### `/` - Home Page
- Hero section with course introduction
- Featured courses grid
- Course discovery and browsing
- Search functionality

#### `/courses/[slug]` - Course Detail Page
- Course hero section with image
- Course description and details
- Module and lesson overview
- Instructor information
- Enrollment button (free/paid)
- Course pricing display

#### `/search/[term]` - Search Results
- Full-text course search
- Search results display
- Filtering capabilities

#### `/sign-in` - Sign In Page
- Clerk authentication interface
- OAuth provider options
- Email/password login

#### `/sign-up` - Sign Up Page
- User registration
- Account creation flow
- OAuth sign-up options

### Protected Routes (Dashboard)

#### `/dashboard` - Main Dashboard
- User statistics (enrolled courses, progress, completions)
- Quick access to enrolled courses
- Course progress overview
- Learning analytics

#### `/my-courses` - My Courses Page
- List of all enrolled courses
- Course progress indicators
- Quick navigation to course content
- Empty state for new users

#### `/dashboard/courses/[courseId]` - Course Learning Page
- Course navigation sidebar
- Module and lesson structure
- Progress tracking
- Lesson content access

#### `/dashboard/courses/[courseId]/lessons/[lessonId]` - Lesson View
- Lesson content display
- Video player or Loom embed
- Rich text content
- Lesson completion button
- Navigation to next/previous lessons

### Admin Routes

#### `/studio` - Sanity Studio
- Content management interface
- Course, module, and lesson creation
- Student and enrollment management
- Content structure organization
- Draft mode and preview capabilities

---

## 🏗️ Technical Design

### System Architecture

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

## 🛠️ Technology Stack

### Frontend Technologies

- **Framework**: Next.js 15.3.5 with App Router
- **Language**: TypeScript 5
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Component Library**: Radix UI primitives
- **Icons**: Lucide React
- **Theme**: next-themes for dark/light mode
- **Video Player**: react-player for multimedia content
- **Content Rendering**: @portabletext/react for rich text

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

## 📁 Project Structure

```
antioch-lms/
├── app/                          # Next.js App Router
│   ├── (admin)/                 # Admin routes group
│   │   └── studio/              # Sanity Studio
│   ├── (dashboard)/             # Dashboard routes group
│   │   └── dashboard/           # Student dashboard
│   │       └── courses/         # Course learning interface
│   ├── (user)/                  # User-facing routes group
│   │   ├── courses/             # Course browsing
│   │   ├── my-courses/          # Enrolled courses
│   │   └── search/              # Course search
│   ├── api/                     # API routes
│   │   ├── stripe-checkout/     # Stripe webhooks
│   │   └── draft-mode/          # Draft mode controls
│   ├── actions/                 # Server actions
│   ├── sign-in/                 # Authentication pages
│   ├── sign-up/
│   └── layout.tsx               # Root layout
├── components/                   # React components
│   ├── ui/                      # Base UI components
│   │   ├── button.tsx
│   │   ├── accordion.tsx
│   │   ├── progress.tsx
│   │   └── ...
│   ├── dashboard/               # Dashboard components
│   │   ├── DashboardSidebar.tsx
│   │   └── Sidebar.tsx
│   ├── providers/               # Context providers
│   │   └── sidebar-provider.tsx
│   ├── CourseCard.tsx
│   ├── CourseProgress.tsx
│   ├── EnrollButton.tsx
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── LessonCompleteButton.tsx
│   ├── LoomEmbed.tsx
│   ├── SearchInput.tsx
│   └── VideoPlayer.tsx
├── sanity/                      # Sanity CMS configuration
│   ├── lib/                     # Sanity utilities
│   │   ├── courses/             # Course queries
│   │   ├── lessons/             # Lesson queries
│   │   ├── student/             # Student management
│   │   ├── client.ts            # Sanity client
│   │   ├── adminClient.ts       # Admin client
│   │   └── image.ts             # Image utilities
│   ├── schemaTypes/             # Content schemas
│   │   ├── courseType.ts
│   │   ├── moduleType.ts
│   │   ├── lessonType.ts
│   │   ├── studentType.tsx
│   │   ├── enrollmentType.tsx
│   │   ├── lessonCompletionType.tsx
│   │   ├── instructorType.ts
│   │   ├── categoryType.ts
│   │   └── blockContent.ts
│   └── structure.ts             # Studio structure
├── lib/                         # Utility libraries
│   ├── auth.ts                  # Authentication utilities
│   ├── stripe.ts                # Stripe configuration
│   ├── courseProgress.ts        # Progress calculations
│   └── utils.ts                 # General utilities
├── actions/                      # Server actions
│   ├── completeLessonAction.ts
│   ├── uncompleteLessonAction.ts
│   ├── getLessonCompletionStatusAction.ts
│   └── createStripeCheckout.ts
├── middleware.ts                 # Next.js middleware
├── public/                       # Static assets
└── package.json                  # Dependencies
```

---

## 🗄️ Database Schema

### Core Entities

#### Course (`course`)
- `_id`: Unique identifier
- `title`: Course title
- `slug`: URL-friendly identifier
- `description`: Course description
- `price`: Price in USD (0 for free courses)
- `image`: Course cover image
- `category`: Reference to category
- `modules`: Array of module references
- `instructor`: Reference to instructor
- `_createdAt`, `_updatedAt`: Timestamps

#### Module (`module`)
- `_id`: Unique identifier
- `title`: Module title
- `lessons`: Array of lesson references
- `_createdAt`, `_updatedAt`: Timestamps

#### Lesson (`lesson`)
- `_id`: Unique identifier
- `title`: Lesson title
- `slug`: URL-friendly identifier
- `description`: Lesson description
- `videoUrl`: Optional external video URL
- `loomUrl`: Optional Loom share URL
- `content`: Rich text content (Portable Text)
- `_createdAt`, `_updatedAt`: Timestamps

#### Student (`student`)
- `_id`: Unique identifier
- `clerkId`: Clerk user ID (for authentication)
- `email`: Student email
- `firstName`: First name
- `lastName`: Last name
- `imageUrl`: Optional profile image
- `_createdAt`, `_updatedAt`: Timestamps

#### Enrollment (`enrollment`)
- `_id`: Unique identifier
- `student`: Reference to student
- `course`: Reference to course
- `amount`: Payment amount in cents
- `paymentId`: Stripe payment ID or "free"
- `enrolledAt`: Enrollment timestamp
- `_createdAt`, `_updatedAt`: Timestamps

#### Lesson Completion (`lessonCompletion`)
- `_id`: Unique identifier
- `student`: Reference to student
- `lesson`: Reference to lesson
- `module`: Reference to module
- `course`: Reference to course
- `completedAt`: Completion timestamp
- `_createdAt`, `_updatedAt`: Timestamps

#### Instructor (`instructor`)
- `_id`: Unique identifier
- `name`: Instructor name
- `bio`: Instructor biography
- `photo`: Instructor photo
- `_createdAt`, `_updatedAt`: Timestamps

#### Category (`category`)
- `_id`: Unique identifier
- `title`: Category title
- `description`: Category description
- `_createdAt`, `_updatedAt`: Timestamps

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

## 🔐 Authentication & Authorization

### Authentication System (Clerk)

The system uses Clerk for comprehensive authentication management:

#### Features
- **Multi-provider OAuth**: Google, GitHub, and more
- **Email/Password Authentication**: Traditional login method
- **User Management**: Profile management, password reset
- **Session Management**: Secure JWT-based sessions
- **User Metadata**: Custom user attributes

#### Implementation
- Middleware-based route protection
- Server-side authentication checks
- Client-side authentication state
- Automatic user creation in Sanity

### Authorization Model

#### Role-Based Access Control
1. **Students**: Can enroll in courses, view lessons, track progress
2. **Instructors**: Can create and manage courses (future feature)
3. **Administrators**: Full system access via Sanity Studio

#### Access Control
- Route protection via Next.js middleware
- Course access verification before lesson access
- Enrollment status checking
- Payment verification for paid courses

---

## 💳 Payment Integration

### Stripe Integration

#### Payment Flow
1. **Course Selection**: Student selects paid course
2. **Checkout Creation**: Server action creates Stripe session
3. **Payment Processing**: Stripe handles secure payment
4. **Webhook Processing**: Enrollment creation on successful payment
5. **Access Grant**: Student gains immediate course access

#### Payment Models
- **Free Courses**: Direct enrollment without payment
- **Paid Courses**: Stripe checkout integration
- **Future**: Subscription model capability

#### Security
- PCI-compliant payment processing
- Webhook signature verification
- Secure metadata handling
- HTTPS enforcement

---

## 📝 Content Management

### Sanity Studio Integration

#### Admin Interface
- **Course Management**: Create, edit, and organize courses
- **Content Creation**: Rich text editor with media support
- **User Management**: View enrollments and student progress
- **Content Structure**: Hierarchical organization

#### Content Delivery
- **Headless CMS**: API-driven content delivery
- **Real-time Updates**: Live content synchronization
- **Image Optimization**: Automatic image processing
- **SEO Optimization**: Meta tags and structured data

#### Content Types
- Courses with modules and lessons
- Rich text content with Portable Text
- Media assets (images, videos)
- Structured data relationships

---

## 🎨 User Interface Design

### Design System

#### Component Architecture
- **Atomic Design**: Atoms, molecules, organisms, templates
- **Radix UI Primitives**: Accessible, unstyled components
- **Tailwind CSS**: Utility-first styling approach
- **Dark Mode Support**: System preference detection

#### Key Components
- **Button**: Primary, secondary, ghost variants
- **Card**: Course cards, progress cards
- **Progress**: Lesson completion indicators
- **Accordion**: Course module navigation
- **Dropdown**: User menu, course filters
- **Tooltip**: Help text and guidance
- **Sheet**: Mobile navigation
- **Skeleton**: Loading states

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

## 🔌 API Design

### Server Actions

#### Course Management
- `getCourseById(courseId)`: Retrieve course by ID
- `getCourseBySlug(slug)`: Retrieve course by slug
- `getCourses()`: Get all courses
- `searchCourses(query)`: Search courses by query

#### Student Management
- `createStudentIfNotExists(studentData)`: Create student record
- `getStudentByClerkId(clerkId)`: Get student by Clerk ID
- `isEnrolledInCourse(clerkId, courseId)`: Check enrollment status
- `getEnrolledCourses(clerkId)`: Get all enrolled courses
- `createEnrollment(enrollmentData)`: Create enrollment record

#### Progress Tracking
- `completeLessonById({ lessonId, clerkId })`: Mark lesson complete
- `uncompleteLessonById({ lessonId, clerkId })`: Unmark lesson
- `getLessonCompletionStatus(lessonId, clerkId)`: Get completion status
- `getCourseProgress(courseId, clerkId)`: Get course progress
- `getLessonCompletions(courseId, clerkId)`: Get all completions

#### Payment Processing
- `createStripeCheckout(courseId, userId)`: Create Stripe session

### API Routes

#### Webhook Endpoints
- `POST /api/stripe-checkout/webhook`: Stripe webhook handler
  - Handles payment completion events
  - Creates enrollment records
  - Validates webhook signatures

#### Draft Mode
- `POST /api/draft-mode/enable`: Enable draft mode
- `POST /api/draft-mode/disable`: Disable draft mode

---

## 🔒 Security Considerations

### Authentication Security
- **JWT Tokens**: Secure session management via Clerk
- **OAuth Integration**: Secure third-party authentication
- **Session Validation**: Middleware-based route protection
- **CSRF Protection**: Built-in Next.js CSRF protection

### Data Security
- **Input Validation**: Server-side validation for all inputs
- **Query Sanitization**: GROQ query sanitization
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

## ⚡ Performance & Scalability

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

---

## 🚀 Deployment Architecture

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

The application requires the following environment variables:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk publishable key
- `CLERK_SECRET_KEY`: Clerk secret key
- `SANITY_API_TOKEN`: Sanity API token
- `SANITY_API_ADMIN_TOKEN`: Sanity admin token
- `SANITY_PROJECT_ID`: Sanity project ID
- `SANITY_DATASET`: Sanity dataset name
- `STRIPE_SECRET_KEY`: Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret
- `NEXT_PUBLIC_BASE_URL`: Application base URL

---

## 📊 Key Features in Detail

### Course Learning Experience

#### Lesson View
- **Video Integration**: Supports external video URLs and Loom embeds
- **Rich Text Content**: Portable Text rendering with formatting
- **Progress Tracking**: Real-time lesson completion
- **Navigation**: Seamless movement between lessons
- **Responsive Design**: Optimized for all screen sizes

#### Progress Visualization
- **Course Progress Bars**: Visual completion indicators
- **Module Completion**: Track progress through course modules
- **Overall Statistics**: Completion rates and learning analytics
- **Dashboard Metrics**: Enrolled courses, average progress, completions

### Enrollment System

#### Free Courses
- Instant enrollment upon click
- Immediate access to course content
- No payment processing required

#### Paid Courses
- Stripe checkout integration
- Secure payment processing
- Webhook-based enrollment confirmation
- Automatic access upon payment success

### Search & Discovery

#### Search Functionality
- Full-text search across course titles and descriptions
- Real-time search results
- Search result page with course cards
- Integration with course browsing

#### Course Browsing
- Featured courses on homepage
- Category-based organization
- Course cards with images and descriptions
- Direct navigation to course details

---

## 🎯 Future Enhancements

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

## 📚 Additional Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Sanity CMS Documentation](https://www.sanity.io/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs)

### Related Files
- `ANTIOCH_LMS_TECHNICAL_DESIGN.md`: Detailed technical design document
- `sanity.config.ts`: Sanity CMS configuration
- `next.config.ts`: Next.js configuration
- `middleware.ts`: Authentication middleware

---

## 🏆 Conclusion

Antioch LMS represents a modern, scalable, and feature-rich learning management system built with cutting-edge technologies. The architecture provides a solid foundation for current functionality while remaining flexible for future enhancements. The combination of Next.js, Sanity CMS, Clerk authentication, and Stripe payments creates a robust platform that can scale to meet growing educational needs.

The system's modular design, comprehensive security measures, and performance optimizations ensure a reliable and efficient learning experience for students while providing powerful tools for content creators and administrators.

---

## 📄 License

This project is private and proprietary.

---

*Last updated: 2024*
