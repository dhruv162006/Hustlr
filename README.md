# HUSTLR — Campus Freelance Marketplace

HUSTLR is a full-stack platform that helps students discover freelance opportunities, collaborate on projects, build startup teams, and showcase their skills within a unified ecosystem.

The platform combines opportunity discovery, real-time collaboration, team management, community engagement, and professional portfolio building into a single experience designed specifically for student builders, freelancers, founders, and recruiters.

---

## Features

### Authentication & Security

* JWT-based authentication
* Refresh token rotation
* Role-based access control
* Email verification workflow
* Password reset functionality
* Protected routes
* Secure file uploads
* Request validation and rate limiting

### Opportunity Marketplace

* Create and manage opportunities
* Apply to projects and gigs
* Resume and portfolio submissions
* Opportunity search and filtering
* Bookmark opportunities
* Application pipeline tracking

### Talent Directory

* Discover student talent
* Skill-based profile search
* Availability indicators
* Portfolio showcase
* Public profile pages

### Team Formation

* Create project teams
* Invite collaborators
* Accept or reject invitations
* Team member management
* Team discovery

### Team Workspace

* Kanban task management
* Task assignment
* Progress tracking
* Milestone management
* Real-time collaboration

### Real-Time Messaging

* Direct messaging
* Team chat channels
* Online presence indicators
* Typing indicators
* Read receipts
* Socket.io-powered communication

### Community Hub

* Create posts
* Like and comment on discussions
* Save posts
* Community engagement features
* Activity feeds

### Notification System

* Real-time notifications
* Team invitations
* Application updates
* Community interactions
* System alerts

### Admin Dashboard

* User management
* Verification management
* Moderation tools
* Platform analytics
* Reports management

---

## Tech Stack

### Frontend

* React.js
* TypeScript
* Tailwind CSS
* Vite
* React Context API
* Axios
* Socket.io Client

### Backend

* Node.js
* Express.js
* TypeScript
* Socket.io
* JWT Authentication
* Prisma ORM
* Zod Validation

### Database

* PostgreSQL
* Prisma ORM

### Cloud Services

* Cloudinary (File Storage)

---

## System Architecture

```text
React Frontend
       │
       ▼
Express REST API
       │
       ├── JWT Authentication
       ├── Role-Based Authorization
       ├── Socket.io Gateway
       ├── Prisma ORM
       │
       ▼
 PostgreSQL Database

       │
       ▼

 Cloudinary Storage
```

---

## Core Modules

### User Management

* User registration
* Authentication
* Profile creation
* Portfolio management
* Skill tracking

### Marketplace

* Opportunity creation
* Applications
* Search and discovery
* Bookmarks

### Teams

* Team creation
* Invitations
* Workspace collaboration
* Task management

### Messaging

* Real-time communication
* Direct messages
* Team channels

### Community

* Posts
* Comments
* Likes
* Saved content

---

## Database Models

* User
* Profile
* Skill
* Experience
* Portfolio
* Opportunity
* Application
* Team
* TeamMember
* Task
* Chat
* ChatParticipant
* Message
* Notification
* Review
* Post
* Comment
* PostLike
* Bookmark
* File
* ActivityLog
* Report
* Admin

---

## Installation

### Clone Repository

```bash
git clone <repository-url>
cd hustlr
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file:

```env
DATABASE_URL=

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Generate Prisma Client

```bash
npx prisma generate
```

### Run Migrations

```bash
npx prisma migrate dev
```

### Seed Database

```bash
npm run seed
```

### Start Development Server

```bash
npm run dev
```

---

## API Modules

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

### Profile

```http
GET    /api/profile/:username
PATCH  /api/profile/update
POST   /api/profile/skills
POST   /api/profile/portfolio
```

### Opportunities

```http
GET    /api/opportunities
POST   /api/opportunities
PUT    /api/opportunities/:id
DELETE /api/opportunities/:id
POST   /api/opportunities/:id/apply
```

### Teams

```http
GET    /api/teams
POST   /api/teams
POST   /api/teams/:id/invite
POST   /api/teams/:id/accept
```

### Community

```http
GET    /api/community/posts
POST   /api/community/posts
POST   /api/community/posts/:id/like
POST   /api/community/posts/:id/comment
```

---

## Security Features

* Password hashing with bcrypt
* JWT authentication
* Refresh token rotation
* Protected routes
* Role-based permissions
* Input validation using Zod
* XSS protection
* Rate limiting
* Secure file upload validation

---

## Future Enhancements

* AI-powered opportunity recommendations
* Advanced analytics dashboard
* Video collaboration rooms
* Team performance insights
* Mobile application
* Interview scheduling
* Payment integration
* Skill endorsement system

---

## Project Status

HUSTLR is a full-stack campus collaboration platform focused on helping students transform skills into opportunities through freelancing, startup collaboration, project building, and professional networking.

Built with scalability, real-time communication, and production-grade architecture in mind.
