# TaskFlow — Modern Full-Stack Task & Workflow Management

TaskFlow is a production-grade, full-stack task management web application engineered with **React**, **Express.js**, and **MongoDB**. Designed to streamline daily workflows, eliminate missed deadlines, and provide clear visibility into personal and team productivity.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Problem Statement & Solution](#problem-statement--solution)
3. [Key Features](#key-features)
4. [Technology Stack](#technology-stack)
5. [System Architecture](#system-architecture)
6. [Folder Structure](#folder-structure)
7. [Prerequisites](#prerequisites)
8. [Quick Start & Setup Instructions](#quick-start--setup-instructions)
9. [Database Setup (Local & MongoDB Atlas)](#database-setup-local--mongodb-atlas)
10. [Environment Variables](#environment-variables)
11. [Running the Application](#running-the-application)
12. [Testing & Quality Assurance](#testing--quality-assurance)
13. [Database Seeder](#database-seeder)
14. [REST API Documentation](#rest-api-documentation)
15. [Security & Reliability Architecture](#security--reliability-architecture)
16. [How the Full Stack Works Together (Beginner Guide)](#how-the-full-stack-works-together-beginner-guide)
17. [Deployment Walkthrough (Render, Vercel & Atlas)](#deployment-walkthrough-render-vercel--atlas)
18. [Screenshots](#screenshots)
19. [Future Enhancements](#future-enhancements)

---

## Project Overview

TaskFlow bridges the gap between chaotic to-do lists and heavyweight project tools. It delivers a fast, minimal, responsive SaaS dashboard where users can create, categorize, prioritize, schedule, and track tasks through interactive list and Kanban views.

---

## Problem Statement & Solution

- **The Problem**: Students and working professionals juggle multiple assignments, projects, and daily tasks across sticky notes, notebooks, and chat threads. This leads to forgotten tasks, missed deadlines, anxiety, and a total lack of visibility into actual work completed.
- **The Solution**: TaskFlow provides a centralized cloud workspace with:
  - Strict user authentication and data privacy.
  - Granular task categorization (Work, Study, Personal, Project, Other) and priority tiers (Low, Medium, High).
  - Visual Kanban workflow pipeline to monitor work from conception to completion.
  - Real-time deadline agendas highlighting overdue items and tasks due today.
  - Interactive productivity analytics powered by real database metrics.

---

## Key Features

### 1. Robust Authentication & Session Management
- **Registration**: Full name, email, password confirmation, server-side format and duplicate email checks.
- **Secure Password Hashing**: Passwords are encrypted using `bcryptjs` with 12 salt rounds; plaintext passwords or hashes are never exposed.
- **HttpOnly Cookie Storage**: JWT tokens are transmitted and stored in secure, `HttpOnly`, `SameSite` cookies to protect against Cross-Site Scripting (XSS) and token theft.
- **Session Persistence**: On reload, the client automatically restores session identity through `/api/v1/auth/me`.

### 2. Comprehensive Task Management (CRUD)
- **Create**: Add tasks with title, description, priority, category, status, and due date.
- **Read**: Dynamic queries with full-text search, multi-factor filtering, sorting, and pagination.
- **Update**: Edit task details, transition statuses, or toggle completion with automatic `completedAt` timestamps.
- **Delete**: Permanent deletion guarded by confirmation modal dialogs.
- **Strict Data Isolation**: Server enforces user ownership on every database operation (`userId: req.user._id`). Users can never view or modify another user's tasks.

### 3. Visual Kanban Pipeline
- 3 Dedicated status columns: **To Do**, **In Progress**, and **Completed**.
- Single-click status transitions with optimistic UI feedback and automatic fallback on network error.
- Quick card editing and deletion directly from the board.

### 4. Deadlines & Calendar Agenda
- Chronological breakdown: **Overdue Tasks**, **Due Today**, **Due This Week**, and **Later Deadlines**.
- Visual badge indicators with color-coded countdowns and urgent warning badges for overdue assignments.

### 5. Real-Time Analytics Dashboard
- Dynamic summary cards: Total Tasks, In Progress, Overdue, and Completed.
- Overall completion progress bar with percentage indicator.
- Interactive **Recharts** visualizations:
  - Status Distribution Donut Chart.
  - Priority Distribution Bar Chart.
- Live Upcoming Deadlines feed and Recent Tasks log.

### 6. User Account & Security Settings
- View account profile and registration timestamp.
- Update display name with immediate client-wide synchronization.
- Change password with mandatory current-password verification.

---

## Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, JavaScript (ESM), Tailwind CSS v3, React Router v6, Axios, Lucide React, Recharts |
| **Backend** | Node.js (v20+), Express.js (REST API `/api/v1`), Mongoose ODM |
| **Database** | MongoDB (Local Community Server or MongoDB Atlas Cloud) |
| **Auth & Security** | JWT, HttpOnly SameSite Cookies, Bcryptjs, Express Rate Limit, Helmet, CORS |
| **Testing** | Vitest, React Testing Library, Supertest, MongoDB Memory Server, JSDOM |

---

## System Architecture

```
[ Web Browser / Client ]
      │
      │  HTTPS / HTTP Requests with HttpOnly Cookie credentials
      ▼
[ Express REST API (/api/v1) ]
      ├── Helmet Security Headers
      ├── CORS (Configured for http://localhost:5173 with credentials)
      ├── Rate Limiting (Prevents auth brute-force)
      ├── Cookie Parser
      ├── Express JSON Parser (10KB safety limit)
      │
      ├── Route Controllers:
      │     ├── /api/v1/auth       -> Register, Login, Logout, Session Verification
      │     ├── /api/v1/tasks      -> Scoped CRUD, Search, Filter, Sort, Pagination
      │     ├── /api/v1/dashboard  -> Aggregate stats, charts, upcoming deadlines
      │     └── /api/v1/users      -> Profile name update, password change
      │
      └── Mongoose ODM Layer (userId Indexed Ownership Guards)
            │
            ▼
     [ MongoDB Database ]
```

---

## Folder Structure

```
TASKFLOW/
├── client/                     # Frontend React + Vite Application
│   ├── public/                 # Static assets & favicon
│   ├── src/
│   │   ├── assets/             # Images and design graphics
│   │   ├── components/         # Reusable UI components
│   │   │   ├── common/         # Badges, Navbar, Sidebar, Modals, Spinners, Skeletons
│   │   │   └── tasks/          # TaskCard, TaskModal form
│   │   ├── context/            # AuthContext, ToastContext
│   │   ├── layouts/            # DashboardLayout (Sidebar + Top Navbar)
│   │   ├── pages/              # Landing, Login, Register, Dashboard, Tasks, Kanban, Calendar, Profile, 404
│   │   ├── services/           # Axios API service client
│   │   ├── tests/              # Vitest + React Testing Library component tests
│   │   ├── App.jsx             # React Router configuration
│   │   ├── index.css           # Tailwind directives and custom scrollbars
│   │   └── main.jsx            # React root mount
│   ├── .env.example            # Client environment sample
│   ├── index.html              # HTML entry with Inter font & SEO meta tags
│   ├── package.json            # Client dependencies & scripts
│   ├── tailwind.config.js      # Tailwind theme & color tokens
│   └── vite.config.js          # Vite & Vitest configuration
│
├── server/                     # Backend Node.js + Express REST API
│   ├── src/
│   │   ├── config/             # Database connection (Mongoose)
│   │   ├── controllers/        # Auth, Task, Dashboard, User controllers
│   │   ├── middleware/         # Auth guard (JWT cookie verification), Error Handler
│   │   ├── models/             # User and Task Mongoose schemas & indexes
│   │   ├── routes/             # Versioned express routers (/api/v1/*)
│   │   ├── utils/              # JWT helper, seed script
│   │   ├── validators/         # Input validation rules
│   │   ├── app.js              # Express app setup & security middleware
│   │   └── server.js           # Server bootstrap & graceful shutdown
│   ├── tests/                  # Integration test suite (Supertest + In-Memory MongoDB)
│   ├── .env.example            # Backend environment sample
│   ├── package.json            # Server dependencies & scripts
│   └── vitest.config.js        # Vitest backend configuration
│
├── .gitignore                  # Git exclusions for node_modules, dist, .env
├── package.json                # Root workspace orchestration scripts
└── README.md                   # Full documentation
```

---

## Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: `v18.0.0` or higher (`v20.x` recommended). Verify with `node -v`.
- **npm**: `v9.x` or higher (`v11.x` recommended). Verify with `npm -v`.
- **MongoDB**: Either a local MongoDB instance running on `mongodb://127.0.0.1:27017` OR a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).

---

## Quick Start & Setup Instructions

### 1. Clone or Open Workspace
```bash
cd TASKFLOW
```

### 2. Install All Dependencies
You can install dependencies for both server and client with one command from the project root:
```bash
npm run install:all
```
*(Or navigate into `server` and `client` individually and run `npm install`).*

---

## Database Setup (Local & MongoDB Atlas)

### Option A: Local MongoDB (Default)
1. Ensure your local MongoDB service or daemon is running:
   ```bash
   # If installed via MongoDB Community Server:
   mongod --dbpath <path-to-data-directory>
   ```
2. Your connection string in `server/.env` will be:
   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/taskflow
   ```

### Option B: MongoDB Atlas (Cloud - Free)
1. Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. Create a free **M0 Sandbox** cluster.
3. Under **Database Access**, create a user with a password (e.g., `taskflow_user`).
4. Under **Network Access**, click **Add IP Address** and choose **Allow Access from Anywhere (`0.0.0.0/0`)**.
5. Click **Connect** -> **Drivers (Node.js)** and copy your connection string:
   ```
   mongodb+srv://taskflow_user:<password>@cluster0.mongodb.net/taskflow?retryWrites=true&w=majority
   ```
6. Paste this string into your `server/.env` file under `MONGODB_URI`.

---

## Environment Variables

### Backend (`server/.env`)
Create a file named `.env` in the `server/` directory:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/taskflow
JWT_SECRET=super_secret_jwt_key_taskflow_change_in_production_32char_minimum
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### Frontend (`client/.env`)
Create a file named `.env` in the `client/` directory:
```env
VITE_API_URL=http://localhost:5000/api/v1
```

---

## Running the Application

### Method 1: Start Server and Client Separately

**Terminal 1 (Backend Server):**
```bash
cd server
npm run dev
```
*The server will start on `http://localhost:5000`.*

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
```
*The frontend Vite dev server will start on `http://localhost:5173`.*

### Method 2: Root Orchestration Commands
From the project root directory:
```bash
# Start backend
npm run dev:server

# In a second terminal, start frontend
npm run dev:client
```

Now open your browser at **`http://localhost:5173`**.

---

## Database Seeder

Want to test TaskFlow immediately with realistic sample tasks across all priorities, categories, and due dates? Run the seeder script:

```bash
cd server
npm run seed
```
*(Or from the root directory: `npm run seed`)*

This creates a demo account with 7 realistic tasks:
- **Email**: `demo@taskflow.dev`
- **Password**: `TaskFlowDemo123!`

You can also click the **"Fill Demo Credentials"** button on the `/login` screen to populate these credentials with 1 click.

---

## Testing & Quality Assurance

Both the backend and frontend include automated test suites.

### 1. Run Backend Integration Tests
```bash
cd server
npm test
```
- **What it tests**: User registration, duplicate email rejection (409), login authentication, HttpOnly cookie generation, protected route authorization (401), task creation, updates, deletions, status filters, search queries, pagination, real-time dashboard analytics, and **cross-user data isolation (User B cannot read/edit/delete User A's tasks)**.
- **Self-contained**: Uses `mongodb-memory-server`. Tests run and pass without needing any live database installed!

### 2. Run Frontend Component Tests
```bash
cd client
npm test
```
- **What it tests**: Badge rendering, TaskCard click handlers, status badge color mapping, EmptyState action buttons, ConfirmationModal behavior, and LandingPage rendering using **Vitest** and **React Testing Library**.

### 3. Run Production Build Verification
```bash
cd client
npm run build
```
- Compiles React JSX and Tailwind CSS into an optimized production bundle inside `client/dist/`.

---

## REST API Documentation

Base URL: `/api/v1`

### Authentication Endpoints
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Public | Register user, hash password, set HttpOnly cookie |
| `POST` | `/api/v1/auth/login` | Public | Authenticate credentials and set HttpOnly cookie |
| `POST` | `/api/v1/auth/logout` | Public | Clear authentication cookie |
| `GET` | `/api/v1/auth/me` | Private | Fetch authenticated user data from active cookie session |

### Task Endpoints
| Method | Endpoint | Access | Query Parameters / Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/tasks` | Private | `search`, `status`, `priority`, `category`, `dueDateFilter`, `sortBy`, `sortOrder`, `page`, `limit`, `all` | Fetch user's tasks with search, filtering, and pagination |
| `POST` | `/api/v1/tasks` | Private | `{ title, description, status, priority, category, dueDate }` | Create a new task linked to authenticated user |
| `GET` | `/api/v1/tasks/:id` | Private | - | Get specific task details (ownership enforced) |
| `PATCH` | `/api/v1/tasks/:id` | Private | `{ title, description, status, priority, category, dueDate }` | Update task details or change status |
| `DELETE` | `/api/v1/tasks/:id` | Private | - | Delete task (ownership enforced) |

### Dashboard Endpoints
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/dashboard/stats` | Private | Computes real-time totals, overdue counts, completion rate, charts distribution, and upcoming deadlines |

### User Profile Endpoints
| Method | Endpoint | Access | Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/users/me` | Private | - | Get current profile details |
| `PATCH` | `/api/v1/users/me` | Private | `{ name }` | Update full name |
| `PATCH` | `/api/v1/users/me/password` | Private | `{ currentPassword, newPassword, confirmNewPassword }` | Change password with current password verification |

---

## Security & Reliability Architecture

1. **HttpOnly Cookie Authentication**:
   - Authentication tokens are never stored in browser `localStorage` or `sessionStorage` (which are vulnerable to XSS).
   - Cookies are configured with `httpOnly: true`, `sameSite: 'lax'` (or `'none'` in cross-site production), and `secure: true` when deployed under HTTPS.
2. **Password Security**:
   - Hashed using `bcryptjs` with salt rounds = 12.
   - Plaintext passwords and hashes are explicitly stripped from Mongoose models before JSON serialization (`toJSON` hook).
3. **Strict Cross-User Resource Isolation**:
   - Every single task query, update, and deletion includes `{ _id: taskId, userId: req.user._id }`.
   - Modifying a task ID in request parameters returns `404 Not Found`, completely preventing unauthorized access or enumeration of other users' data.
4. **Rate Limiting**:
   - `express-rate-limit` guards `/api/v1/auth/*` endpoints against automated credential stuffing and brute-force attacks.
5. **Helmet Security Headers**:
   - Automatically applies HTTP security headers protecting against clickjacking, MIME sniffing, and cross-site injection.
6. **Centralized Safe Error Handling**:
   - Catches MongoDB duplicate key errors, Mongoose schema validation errors, and invalid ObjectIds.
   - Stack traces are only exposed in development; production clients receive clean, sanitized error messages.

---

## How the Full Stack Works Together (Beginner Guide)

If you are learning full-stack development, here is how the pieces communicate:

1. **The User Interface (React + Tailwind CSS)**:
   - When you load the page in your browser, React renders components like the **Navbar**, **Sidebar**, and **TaskCard**.
   - React state (`useState`, `useEffect`) manages the dynamic data you see on screen, such as the search query or list of tasks.
2. **The API Service (Axios)**:
   - When you click "Create Task" or type in the search bar, the React component calls a function in `client/src/services/api.js`.
   - Axios sends an asynchronous HTTP request (e.g. `POST /api/v1/tasks`) with `withCredentials: true`, attaching your authentication cookie.
3. **The Backend Router & Middleware (Express.js)**:
   - Express receives the HTTP request on port 5000.
   - The `protect` middleware reads the HttpOnly cookie, verifies the JWT signature, and identifies that you are user `660a...`.
   - The validation middleware checks that your title is not empty and that the due date is valid.
4. **The Database Layer (MongoDB & Mongoose)**:
   - The controller executes `Task.create({ ...req.body, userId: req.user._id })`.
   - Mongoose validates the schema rules and writes the document into the MongoDB database.
5. **The Response Loop**:
   - Express responds with HTTP status `201 Created` and the new task JSON object.
   - React receives the response, shows a green success toast notification, and updates your screen immediately without requiring a full page reload!

---

## Deployment Walkthrough (Render, Vercel & Atlas)

### Step 1: Deploy Database (MongoDB Atlas)
1. Create a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Set Network Access to `0.0.0.0/0`.
3. Copy your connection URI:
   `mongodb+srv://<username>:<password>@cluster0.mongodb.net/taskflow?retryWrites=true&w=majority`

### Step 2: Deploy Backend (Render)
1. Push your project to GitHub.
2. Log into [Render](https://render.com) and click **New Web Service**.
3. Connect your repository:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
4. Add Environment Variables on Render:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: *Your MongoDB Atlas connection URI*
   - `JWT_SECRET`: *A secure 32+ character random string*
   - `JWT_EXPIRES_IN`: `7d`
   - `CLIENT_URL`: *Your Vercel frontend URL (e.g. `https://your-taskflow.vercel.app`)*
5. Deploy service and copy your live backend URL (e.g., `https://taskflow-api.onrender.com`).

### Step 3: Deploy Frontend (Vercel)
1. Log into [Vercel](https://vercel.com) and click **Add New Project**.
2. Select your repository:
   - **Root Directory**: `client`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variable:
   - `VITE_API_URL`: `https://taskflow-api.onrender.com/api/v1`
4. Click **Deploy**.

---

## Screenshots

To add screenshots to your GitHub repository:
1. Start the application locally or open your deployed link.
2. Capture screenshots of:
   - `01-dashboard.png`: Dashboard showing statistics and Recharts distribution.
   - `02-tasks-list.png`: Tasks list with search, filter badges, and pagination.
   - `03-kanban-board.png`: Kanban columns with active cards.
   - `04-deadlines-calendar.png`: Upcoming and overdue deadlines view.
   - `05-profile-security.png`: Account and password management.
3. Place images in `client/src/assets/screenshots/` and embed them:
   ```markdown
   ![Dashboard Overview](client/src/assets/screenshots/01-dashboard.png)
   ```

---

## Future Enhancements
- [ ] Email and browser push notifications for deadlines due in 24 hours.
- [ ] Drag-and-drop HTML5 drag events on Kanban board.
- [ ] Shared team workspaces and task assignment to collaborators.
- [ ] Export tasks to CSV / PDF reports.
- [ ] Dark Mode theme toggle.

---

## License

This project is licensed under the MIT License — feel free to use it for learning, portfolios, and commercial projects.
