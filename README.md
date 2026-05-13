# TaskFlow 🚀
**Live Application:** [https://taskflow-fullstack-assessment-production-d505.up.railway.app](https://taskflow-fullstack-assessment-production-d505.up.railway.app)

A project and task management tool built for teams. 

A project and task management tool built for teams. Admins can create projects, assign tasks, and track overall progress. Team members can view their assigned work, update task status, and leave comments.

## What it does

- **Dashboard** – see project/task stats, overdue items, deadline risks, and recent activity at a glance
- **Projects** – create, edit, and organize projects with team members and deadlines
- **Tasks** – kanban-style board view per project + a global task list with filters
- **Comments** – leave notes on tasks for team communication
- **Roles** – admin vs. user. Admins manage everything, users manage their own tasks
- **Deadline Risk Indicator** – tasks approaching their deadline get color-coded warnings

## Tech Stack

| What | Tech |
|------|------|
| Frontend | React 18, Vite, TailwindCSS, React Router v6 |
| Backend | Node.js, Express |
| Database | MongoDB with Mongoose |
| Auth | JWT tokens |
| Other | Axios, react-hot-toast, react-icons |

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB running locally (or a MongoDB Atlas connection string)

### Setup

**1. Clone the repo**

```bash
git clone <your-repo-url>
cd full-stack_app
```

**2. Backend setup**

```bash
cd server
npm install
```

Create a `.env` file in the `server/` folder (or edit the existing one):

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=your_secret_key_here
```

Start the server:

```bash
npm run dev
```

**3. Frontend setup**

```bash
cd client
npm install
npm run dev
```

The app should be running at `http://localhost:3000`

### Quick Start

1. Register an account (pick "Admin" role to access all features)
2. Create a project from the Projects page
3. Add tasks to the project and assign them to team members
4. Switch between dashboard, project board, and task list views

## Folder Structure

```
full-stack_app/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Sidebar, Navbar, Modal, etc.
│   │   ├── context/         # Auth context (login state)
│   │   ├── pages/           # Dashboard, Projects, Tasks, Login
│   │   └── utils/           # Axios config, helper functions
│   └── ...config files
├── server/                  # Express backend
│   ├── config/              # MongoDB connection
│   ├── controllers/         # Request handlers
│   ├── middleware/           # Auth + error handling
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API route definitions
│   └── server.js            # Entry point
└── README.md
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | No | Create account |
| POST | /api/auth/login | No | Sign in |
| GET | /api/auth/me | Yes | Get current user |
| GET | /api/users | Admin | List users |
| GET/POST | /api/projects | Yes | List or create projects |
| GET/PUT/DELETE | /api/projects/:id | Yes | Single project ops |
| GET/POST | /api/tasks | Yes | List or create tasks |
| GET/PUT/DELETE | /api/tasks/:id | Yes | Single task ops |
| GET/POST | /api/tasks/:id/comments | Yes | Task comments |
| GET | /api/dashboard/stats | Yes | Dashboard stats |

## Design Decisions

- **Context API over Redux** – app state is simple enough that Context handles auth fine. No need for a state management library.
- **Flat-ish structure** – no deeply nested folders. Easy to find things and explain in interviews.
- **Kanban board per project** – tasks are grouped by status columns within each project detail page.
- **Table + card views for tasks** – desktop gets a table, mobile gets cards. Responsive without being complicated.
- **Deadline risk feature** – color-coded indicators show overdue (red), due today (red), due within 3 days (yellow), or safe (green). This is calculated client-side and also aggregated in the dashboard API.

## Deployment

### Backend (e.g., Render)

1. Push code to GitHub
2. Create a new Web Service on Render
3. Set build command: `cd server && npm install`
4. Set start command: `cd server && npm start`
5. Add environment variables (MONGO_URI, JWT_SECRET)

### Frontend (e.g., Vercel or Netlify)

1. Set root directory to `client`
2. Build command: `npm run build`
3. Output directory: `dist`
4. Add env variable for API URL if needed

## Screenshots

*Screenshots will be added after deployment*

---

Built for the Ethara.AI Full-Stack Assessment, May 2026.
