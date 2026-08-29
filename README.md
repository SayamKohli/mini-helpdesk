# Mini Helpdesk

Customers can submit support tickets without logging in and check their ticket status using their ticket ID and email. Internal agents authenticate through a JWT-based login and can triage, respond to, and update tickets. Admins have the additional ability to reassign tickets and view all tickets.

## Features

### Customer

- Public ticket submission
- Captures name, email, subject, message, and priority
- Returns a unique ticket ID after successful submission
- Public ticket status lookup using ticket ID + email
- Displays current status, priority, and latest agent reply
- No customer account required

### Agent

- JWT-based authentication
- HTTP-only authentication cookie
- Paginated ticket dashboard
- Server-side search
- Filters by status, priority, and assignee
- Ticket detail view
- Ticket event timeline
- Reply to tickets
- Change ticket status

### Admin

Everything an agent can do, plus:

- View all tickets
- Reassign tickets to agents

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Material UI
- React Router
- Axios

### Backend

- Node.js
- Express
- TypeScript
- Mongoose
- Zod
- JWT
- Argon2
- express-rate-limit

### Database

- MongoDB

## Architecture

```text
Customer / Agent
       |
       | HTTPS
       v
+-------------------+
| React + TypeScript|
|      Frontend     |
+---------+---------+
          |
          | REST API
          v
+-------------------+
| Node + Express    |
|                   |
| Auth              |
| Validation        |
| Authorization     |
| Ticket Services   |
| Rate Limiting     |
+---------+---------+
          |
          | Mongoose
          v
+-------------------+
|     MongoDB       |
|                   |
| Agents            |
| Tickets           |
| Timeline Events   |
+-------------------+
```

Detailed architecture decisions are documented in [`ARCHITECTURE.md`](./ARCHITECTURE.md).

## Role Model

| Capability | Agent | Admin |
|---|:---:|:---:|
| Login | ✓ | ✓ |
| View assigned tickets | ✓ | ✓ |
| View all tickets | — | ✓ |
| Reply to ticket | ✓ | ✓ |
| Change ticket status | ✓ | ✓ |
| Reassign ticket | — | ✓ |

Authorization is enforced by the backend. Frontend controls are not treated as a security boundary.

## Authentication

Agents log in with email and password.

The backend:

1. Normalizes the email.
2. Looks up the agent.
3. Verifies the password using Argon2.
4. Creates a signed JWT containing the agent identity and role.
5. Stores the JWT in an HTTP-only cookie.

Protected API routes verify the cookie before allowing access.

The frontend does not store or manage the JWT itself.

## API Overview

Base URL:

```text
/api
```

### Authentication

```text
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

### Tickets

```text
POST  /api/tickets
GET   /api/tickets
GET   /api/tickets/:ticketId
POST  /api/tickets/:ticketId/reply
PATCH /api/tickets/:ticketId/status
PATCH /api/tickets/:ticketId/assignee
GET   /api/tickets/:ticketId/status
```

The public endpoints are intentionally separated from authenticated agent operations.

## Project Structure

```text
mini-helpdesk/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── validators/
│   │   └── ...
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   └── ...
│   └── package.json
│
├── ARCHITECTURE.md
├── README.md
└── .gitignore
```

## Local Setup

### Prerequisites

- Node.js
- npm
- MongoDB

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd mini-helpdesk
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file from the example:

```bash
copy .env.example .env
```

On macOS/Linux:

```bash
cp .env.example .env
```

Configure the required values in `.env`.

Start the backend in development mode:

```bash
npm run dev
```

The API runs on the configured backend port, for example:

```text
http://localhost:5000
```

### 3. Frontend setup

Open another terminal:

```bash
cd frontend
npm install
```

Configure the frontend API base URL according to the frontend environment configuration.

Start the frontend:

```bash
npm run dev
```

The Vite development server will print the local URL in the terminal.

## Environment Variables

Do not commit a real `.env` file.

Use `.env.example` as the template for local development and deployment.

Typical backend configuration includes:

```text
NODE_ENV=
PORT=
MONGODB_URI=
JWT_SECRET=
CORS_ORIGIN=
```

The exact variables should match the committed `.env.example`.

## Seeded Agents

The application seeds 3 agents for role-based testing:

```text
agent1@example.com
agent2@example.com
admin@example.com
```

Use the passwords defined by the project's seed configuration. Passwords are never stored in plaintext in the database; they are hashed with Argon2.

## Validation and Error Handling

The backend validates request bodies and query parameters with Zod before service operations execute.

API errors use a consistent response structure:

```json
{
  "status": "error",
  "code": "VALIDATION_ERROR",
  "message": "Invalid request data",
  "details": {}
}
```

Authentication and authorization failures return appropriate HTTP status codes without exposing stack traces or internal implementation details.

## Security

The application includes:

- Argon2 password hashing
- JWT authentication
- HTTP-only auth cookie
- Server-side authorization
- Role-based access control
- Server-side input validation
- Public endpoint rate limiting
- CORS configuration
- `.env` exclusion from Git
- No API secrets in frontend source
- Generic invalid-login errors to reduce account enumeration
- No stack traces returned to clients

## UI Quality

The frontend includes:

- Responsive layouts
- Loading states
- Error states
- Empty ticket-list handling
- Form validation through browser and server validation
- Keyboard-accessible form controls
- Protected routing for agent pages
- Reusable ticket filtering/table components
- Clear success feedback after ticket creation

## Build

### Backend

Use the backend's configured production build command, then start the generated JavaScript output.

### Frontend

```bash
npm run build
```

The production build is generated in:

```text
frontend/dist/
```

The current production build completes successfully. Vite reports a bundle-size warning because the main JavaScript chunk is above 500 KB; this is a performance optimization opportunity rather than a build failure.

## Testing

The project includes automated tests for the application logic that matters most.

Before submission, run the project's test and type-check commands from the relevant package directories.

Manual API verification was also performed against the local backend, including ticket creation and validation flows.

## Deployment

The application is designed to be deployed as separate frontend and backend services.

### Backend

Deploy the Node/Express backend to a free-tier Node-compatible host and configure:

- MongoDB connection string
- JWT secret
- CORS origin
- production environment
- application port

### Frontend

Deploy the Vite production build to a static hosting provider and configure its API base URL to point to the deployed backend.

### SPA routing

The frontend uses React Router. Production static hosting must therefore serve `index.html` as the fallback for application routes such as:

```text
/login
/tickets
/tickets/:ticketId
/check-status
/submit-ticket
```

Without SPA fallback/rewrite configuration, directly opening `/login` or refreshing a nested route can result in a 404 from the hosting provider.

## Known Limitations

- Ticket search is intentionally kept simple at the current scale; a dedicated full-text search solution would be preferable for a much larger dataset.
- Real-time ticket updates are not currently required for the core workflow.
- File attachments are not part of the core implementation.
- Email notifications are not part of the core implementation.
- The application is currently designed around a single helpdesk dataset; explicit tenant isolation would be added before supporting multiple organizations.
- The frontend production JavaScript bundle is larger than Vite's default 500 KB warning threshold and can be improved with code splitting.

## Future Improvements

The highest-priority follow-up work is:

1. Multi-tenant isolation and scalable full-text search.
2. Asynchronous customer notifications and background jobs.
3. Real-time ticket updates plus stronger production observability and CI.

Optional extensions include Docker Compose, file attachments, CI/CD, and an AI-assisted ticket feature.

## Assignment Deliverables

- `README.md` — setup, features, architecture decisions, security, and limitations
- `ARCHITECTURE.md` — detailed system architecture and scaling/observability decisions
- `.env.example` — environment variable template
- Public GitHub repository
- Deployed frontend/backend URLs
- Optional 2–3 minute walkthrough

