# HUSTLR Backend API Documentation

This document describes all API endpoints and WebSocket channels exposed by the HUSTLR backend services.

---

## 1. Authentication Service (`/api/auth`)

All auth endpoints utilize session cookies and authorization header tokens.

### Register User
* **Endpoint:** `POST /api/auth/register`
* **Request Body:**
  ```json
  {
    "email": "student@college.edu",
    "password": "SecurePassword123",
    "name": "Dhruv C.",
    "role": "STUDENT"
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "message": "User registered successfully",
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "usr_90a8f11",
      "name": "Dhruv C.",
      "email": "student@college.edu",
      "role": "STUDENT"
    }
  }
  ```

### Login User
* **Endpoint:** `POST /api/auth/login`
* **Request Body:**
  ```json
  {
    "email": "student@college.edu",
    "password": "SecurePassword123"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "usr_90a8f11",
      "name": "Dhruv C.",
      "email": "student@college.edu",
      "role": "STUDENT"
    }
  }
  ```

---

## 2. Profile System (`/api/profile`)

Handles student bios, resume uploads, and builder card configurations.

### Get Public Profile
* **Endpoint:** `GET /api/profile/:username`
* **Response Payload (200 OK):**
  ```json
  {
    "id": "prof_12019",
    "name": "Dhruv C.",
    "email": "student@college.edu",
    "role": "STUDENT",
    "username": "@dhruvc",
    "headline": "Full Stack Dev",
    "bio": "Building micro-saas.",
    "avatarGradient": "from-blue-600 to-indigo-600",
    "bannerGradient": "from-slate-900 via-blue-900/40 to-slate-900",
    "skills": [{ "name": "TypeScript", "level": "Advanced", "endorsements": 45 }],
    "portfolio": [],
    "experience": [],
    "reviews": []
  }
  ```

### Update Profile Info
* **Endpoint:** `PATCH /api/profile/update`
* **Headers:** `Authorization: Bearer <token>`
* **Request Body:**
  ```json
  {
    "bio": "Updated builder bio.",
    "headline": "Lead Engineer",
    "availability": "AVAILABLE_NOW",
    "github": "github.com/dhruvc",
    "twitter": "twitter.com/dhruvc",
    "portfolioUrl": "dhruv.dev"
  }
  ```

---

## 3. Opportunities & Applications (`/api/opportunities`)

*Note: `/api/gigs` is mapped as an alias routing middleware to `/api/opportunities` for UI compatibility.*

### Fetch Opportunities
* **Endpoint:** `GET /api/opportunities`
* **Query Parameters:**
  - `search`: search term
  - `type`: `startup`, `hackathon`, `freelance`, `all`
  - `category`: optional filters
* **Response Payload (200 OK):**
  ```json
  [
    {
      "id": "opp_1010",
      "title": "React Native Growth Intern",
      "description": "Scale mobile app to 10 campuses.",
      "clientName": "Campus Delivery",
      "type": "STARTUP",
      "budget": "₹15,000/mo",
      "category": "Development",
      "skillsRequired": ["React Native", "Tailwind CSS"],
      "logoGradient": "from-orange-500 to-rose-600"
    }
  ]
  ```

### Apply to Opportunity
* **Endpoint:** `POST /api/opportunities/:id/apply`
* **Headers:** `Authorization: Bearer <token>`
* **Multipart Request Form-Data:**
  - `proposal`: "I have built 3 React Native apps..."
  - `resume`: File buffer (PDF format)
* **Response Payload (201 Created):**
  ```json
  {
    "message": "Application submitted successfully",
    "applicationId": "app_9841"
  }
  ```

---

## 4. Team Hub & Workspaces (`/api/teams`)

Manages collaboration teams, invites, and task kanban boards.

### Create Team Workspace
* **Endpoint:** `POST /api/teams`
* **Headers:** `Authorization: Bearer <token>`
* **Request Body:**
  ```json
  {
    "name": "Nexus AI",
    "description": "AI Study assistant MVP builder."
  }
  ```

### Fetch Team Workspace Details
* **Endpoint:** `GET /api/teams/:teamId`
* **Headers:** `Authorization: Bearer <token>`
* **Response Payload (200 OK):**
  ```json
  {
    "id": "team_110",
    "name": "Nexus AI",
    "description": "AI Study assistant",
    "members": [
      {
        "id": "usr_abc",
        "role": "Lead",
        "user": { "name": "Priya Patel", "email": "priya@startup.io" }
      }
    ],
    "tasks": [
      {
        "id": "tsk_20",
        "title": "Design Landing Page",
        "status": "TODO",
        "priority": "HIGH"
      }
    ]
  }
  ```

### Assign Task
* **Endpoint:** `POST /api/teams/:teamId/tasks`
* **Headers:** `Authorization: Bearer <token>`
* **Request Body:**
  ```json
  {
    "title": "Integrate Auth",
    "description": "Configure server sessions.",
    "assigneeId": "usr_9901"
  }
  ```

### Update Task Status
* **Endpoint:** `PATCH /api/teams/tasks/:taskId/status`
* **Headers:** `Authorization: Bearer <token>`
* **Request Body:**
  ```json
  {
    "status": "IN_PROGRESS"
  }
  ```

---

## 5. Community Forums (`/api/community`)

Feeds and interactions for the student builder community.

### Fetch Posts Feed
* **Endpoint:** `GET /api/community/posts`
* **Response Payload (200 OK):**
  ```json
  [
    {
      "id": "pst_9012",
      "content": "Just launched the HUSTLR backend! 🚀",
      "spaceName": "Startups",
      "author": {
        "name": "Dhruv C.",
        "role": "Student Dev",
        "profile": { "avatarGradient": "from-blue-600 to-indigo-600" }
      },
      "likes": [],
      "comments": []
    }
  ]
  ```

### Toggle Post Like
* **Endpoint:** `POST /api/community/posts/:postId/like`
* **Headers:** `Authorization: Bearer <token>`
* **Response Payload (200 OK):**
  ```json
  {
    "message": "Liked post"
  }
  ```

---

## 6. Real-Time Chat & Sockets (`/api/messages`)

Exposes chat controllers and mounts Socket.io handshakes.

### WebSocket Connections (Socket.io)
- **Namespace:** `/`
- **Authentication Handshake:**
  - Send token in auth payload: `{ token: "eyJhbGciOiJIUzI1..." }`
- **Channels & Subscriptions:**
  - **Join Room:** `socket.emit("join_room", { chatId: "chat_12" })`
  - **Broadcast Message:** Server triggers `"message"` event containing msg payload:
    ```json
    {
      "id": "msg_9401",
      "chatId": "chat_12",
      "senderId": "usr_90a",
      "senderName": "Dhruv C.",
      "text": "Hello World",
      "createdAt": "2026-07-09T09:50:58Z"
    }
    ```

---

## 7. Moderation & Admin Control Center (`/api/admin`)

Requires user role `"ADMIN"`.

### Fetch Platform Command Analytics
* **Endpoint:** `GET /api/admin/analytics`
* **Headers:** `Authorization: Bearer <token>`
* **Response Payload (200 OK):**
  ```json
  {
    "students": 1420,
    "founders": 340,
    "recruiters": 150,
    "activeGigs": 54,
    "pendingReports": 3,
    "pendingVerifications": 8,
    "volumeGMV": "₹12.4 Lakhs"
  }
  ```

### Verify Student Profile
* **Endpoint:** `POST /api/admin/verifications/:id/approve`
* **Headers:** `Authorization: Bearer <token>`
* **Response Payload (200 OK):**
  ```json
  {
    "message": "User profile successfully verified"
  }
  ```
