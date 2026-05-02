# Ethara 2.0

Ethara 2.0 is a full-stack project and task management application with role-based access for Admin and Member users. Admins can create projects and tasks, assign work, and track team progress. Members can view the projects they are involved in, manage their assigned tasks, and update task status.

## Features

- Role-based authentication with JWT
- Admin and Member user roles
- Project creation and assignment
- Task creation, status updates, and deletion
- Member management (Admins can remove members from projects)
- Task reassignment when members are removed from projects
- Member-focused project visibility
- Dashboard overview with project and task statistics
- Protected routes on both frontend and backend
- Auto-refresh for real-time updates in project details

## Tech Stack

- Frontend: React, Vite, React Router, Axios, Tailwind CSS
- Backend: Node.js, Express, MongoDB, Mongoose
- Authentication: JSON Web Token

## Project Structure

```text
Ethara 2.0/
	Backend/
	Frontend/
```

### Backend

- `server.js` - Express app entry point
- `config/db.js` - MongoDB connection
- `controllers/` - request handlers
- `models/` - Mongoose schemas
- `routes/` - API routes
- `middleware/` - auth and error handling

### Frontend

- `src/pages/` - main application pages
- `src/components/` - reusable UI components
- `src/context/` - auth state
- `src/api/axios.js` - API client

## Prerequisites

- Node.js 18+ recommended
- MongoDB connection string

## Environment Variables

Create a `.env` file inside `Backend/` with:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
NODE_ENV=development
```

If `MONGO_URI` is not provided, the backend falls back to an in-memory MongoDB instance for local development.

## Installation

Clone the repository and install dependencies for both apps.

### Backend

```bash
cd Backend
npm install
```

### Frontend

```bash
cd Frontend
npm install
```

## Running the Application

### Start the backend

```bash
cd Backend
npm run dev
```

The backend runs on `http://localhost:5000` by default.

### Start the frontend

```bash
cd Frontend
npm run dev
```

The frontend runs on the Vite dev server URL shown in the terminal.

## Build for Production

### Frontend

```bash
cd Frontend
npm run build
```

### Backend

```bash
cd Backend
npm start
```

## API Overview

- `POST /api/auth/signup` - register a user
- `POST /api/auth/login` - log in
- `GET /api/auth/users` - get users for admin workflows
- `GET /api/projects` - list accessible projects
- `GET /api/projects/:id` - project details
- `PUT /api/projects/:id` - update project and manage members
- `DELETE /api/projects/:id` - delete project (admin only)
- `GET /api/tasks` - list tasks
- `POST /api/tasks` - create task
- `PUT /api/tasks/:id` - update task status or assignee
- `DELETE /api/tasks/:id` - delete task (admin only)
- `GET /api/dashboard` - dashboard statistics

## Notes

- Admin users can create and manage projects and tasks.
- Members see the projects they are associated with through direct membership or task assignment.
- Task status changes are reflected on the project detail and task views.
- Admins can manage project members via the "Manage Members" button in the project details page.
  - Members can only be removed, not added, from the project member list.
  - The admin's own name does not appear in the member management list.
  - When a member is removed from a project, their assigned tasks are automatically reassigned to the project admin.
- Dashboard shows:
  - Admins: total projects, tasks by status across all projects, and total users
  - Members: projects they're associated with and tasks assigned to them by status

