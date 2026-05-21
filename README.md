# DevSphere 🚀

Welcome to **DevSphere** — a full-stack social networking and project showcase application built for developers. This application fulfills the Abbey full-stack engineering challenge.

DevSphere allows software engineers to log in, customize their developer profile (bio, avatar, skills tech-stack, GitHub portfolio link), find other developers in a searchable network, establish follow relationships, and post project updates to a collective activity feed.

---

## 🛠️ Architecture & Tech Stack

The application is structured as a TypeScript monorepo, keeping installation and execution simple:

- **Frontend**: React + Vite + TypeScript
  - Styled with HSL CSS variables, custom glassmorphism components, and subtle micro-animations.
  - Leverages **Lucide React** for icons.
  - Built-in Vite dev proxy directing API calls (e.g., `/api/*`) to the backend server.
- **Backend**: Node.js + Express + TypeScript
  - Modular router endpoints managing Authentication, Users/Profiles, Relationships, and Posts.
  - Custom JWT verification middleware.
- **Database**: SQLite (`sqlite` & `sqlite3` driver)
  - Selected for **zero-dependency, instant local spin-up** (creates a single local file `database.sqlite` inside the `/server` folder upon startup).
  - Uses foreign keys with cascade deletions (`PRAGMA foreign_keys = ON`) to ensure data integrity.

---

## ⚡ Quick Start

Follow these steps to spin up the entire application locally:

### 1. Prerequisite
Ensure you have **Node.js** (v18+) and **npm** installed on your system.

### 2. Install Dependencies
From the repository root, install dependencies for the root orchestrator, the client, and the server concurrently:
```bash
npm run install:all
```

### 3. Spin Up Dev Servers
Launch both the Vite dev server (frontend) and the Express API server (backend) concurrently using a single command:
```bash
npm run dev
```

- **Frontend Interface**: Access at [http://localhost:5173](http://localhost:5173)
- **Backend API**: Running at [http://localhost:5000](http://localhost:5000)
- **API Health Check**: Verify backend connectivity at [http://localhost:5000/health](http://localhost:5000/health)

---

## 📂 Key Features & Routing

1. **Authentication** (`/server/src/routes/auth.ts`)
   - Signup with bcrypt password hashing.
   - Login with JWT token creation (7-day session validity).
   - Current session check endpoint `/me`.
2. **Account Profiles** (`/server/src/routes/users.ts`)
   - Update personal name, bio, skills, GitHub URL, and avatar URL.
   - Browse other developer profiles and retrieve stats (follower/following counts).
3. **Developer Directory** (`/server/src/routes/users.ts`)
   - Search developers by name, username, or particular skills (e.g., React, TypeScript).
4. **Follow Connections** (`/server/src/routes/relationships.ts`)
   - Establishes follow links between developers to connect peers.
5. **Timeline Feed** (`/server/src/routes/posts.ts`)
   - Composite feed displaying updates from the user themselves plus any developers they follow.
   - Attach project names and repository links to posts.

---

## 🧪 Production Build

To test production bundling of both the Express API and the React SPA:
```bash
npm run build
```
The Express server is configured to serve the production-compiled frontend assets statically, creating a single unified hosting package. Run `npm start` to run the production server.
