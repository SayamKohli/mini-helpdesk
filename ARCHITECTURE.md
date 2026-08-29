# Architecture — Mini Helpdesk

## 1. System Overview

Mini Helpdesk is a full-stack support-ticket platform with two user experiences:

- **Customers:** submit tickets and check ticket status without an account.
- **Agents:** authenticate with JWT and manage tickets from the internal dashboard.
- **Admins:** have all agent capabilities plus ticket reassignment and visibility across tickets.

### System Diagram

```text
                         +------------------------------+
                         |          Customers           |
                         | Submit ticket / Check status |
                         +--------------+---------------+
                                        | HTTPS
                                        v
+----------------------+       +--------------------------+
|   React + TypeScript | HTTPS | Node.js + Express API    |
|       Frontend       +------>|                          |
|                      |       | Auth / Validation        |
| Public pages         |       | Ticket services          |
| Agent dashboard      |       | Authorization            |
| Ticket detail        |       | Rate limiting / CORS     |
+----------------------+       +------------+-------------+
                                            |
                                            | Mongoose
                                            v
                                   +----------------------+
                                   |       MongoDB         |
                                   | Agents / Tickets     |
                                   | Ticket timeline      |
                                   +----------------------+

Future extensions:
Email/notifications | Object storage | Redis/queues
WebSockets/SSE      | Search         | Observability
```

The frontend communicates with the backend through a REST API. The backend is the security boundary: authentication, authorization, validation, ticket visibility, and mutations are enforced server-side rather than relying on the React UI.

## 2. Data Model and Indexing

### Agents

An agent record contains `name`, `email`, `passwordHash`, and `role` (`agent` or `admin`). Passwords are stored as Argon2 hashes rather than plaintext. Agent email is normalized before lookup.

### Tickets

A ticket contains:

- internal MongoDB `_id`
- public `ticketId`
- customer name and email
- subject and body
- priority and status
- optional assignee reference
- latest agent reply
- `createdAt` and `updatedAt`

The application uses a generated public ticket identifier instead of exposing the MongoDB document identifier as the primary customer-facing reference.

### Ticket timeline

Ticket history is represented as events associated with a ticket. Events record an event type (`CREATED`, `REASSIGNED`, `REPLIED`, or `STATUS_CHANGED`), actor, metadata, and timestamp.

Metadata is flexible enough to represent status transitions, reassignment, and replies without requiring a separate collection/schema for every event type.

### Index strategy

Indexes should follow the queries issued by the ticket API:

- unique index on `ticketId`
- index on `assignee`
- index on `status`
- index on `priority`
- compound indexes for common filter combinations as query volume grows
- index on customer email where it is used for public status lookup

The dashboard performs server-side filtering, pagination, and subject/body search. At the current scale, MongoDB indexes support equality filters and bounded pagination. At larger scale, subject/body search should move from broad regex-style matching to MongoDB Atlas Search or another dedicated search engine.

### Schema tradeoff

The main schema tradeoff is keeping the **latest agent reply directly on the ticket while also recording replies in the timeline**.

This duplicates a small amount of information, but makes the public status endpoint cheap: it can return the latest reply without reconstructing the complete event history. The timeline remains the historical record while `latestAgentReply` is a read-optimized field for the common customer status-check path.

## 3. Authentication and Authorization

Agent authentication is JWT-based:

1. The agent submits email and password to the login endpoint.
2. The backend normalizes the email and verifies the Argon2 password hash.
3. A signed JWT containing the agent identity and role is created.
4. The token is stored in an **HTTP-only cookie**, preventing normal client-side JavaScript from reading it.
5. Protected requests pass through `requireAuth`.
6. The middleware verifies the JWT and attaches the authenticated user ID and role to the Express request.
7. Role-sensitive operations additionally use `requireRole`.

The API never trusts a role supplied by the frontend.

### Cross-agent data access

Authorization is enforced at the service/query layer, not just through UI visibility.

- **Admins** can view all tickets.
- **Agents** can only access tickets assigned to their own agent identity.
- Replying and changing status require authentication.
- Reassignment requires the `admin` role.
- Public endpoints do not expose internal agent functionality.

Hiding an admin control in React is therefore only a usability measure; the backend remains responsible for preventing unauthorized requests.

The public status endpoint requires both the public ticket ID and the customer's email. A mismatch returns a not-found style response rather than revealing ticket ownership.

## 4. Scaling

### 1,000 tenants / 1M tickets

At 1,000 tenants and roughly 1 million tickets, the first pressure points would be ticket-list queries, search, and large result sets. Broad scans or regex searches over subject/body would become increasingly expensive. The next step would be explicit tenant isolation, compound indexes beginning with `tenantId`, cursor-based pagination for deep pages, and MongoDB Atlas Search for full-text queries. Read-heavy paths could use Redis caching, while notifications and other non-critical work could move to asynchronous jobs.

### 100 concurrent agents

At around 100 concurrent agents, the API should remain manageable if requests stay short and database queries are indexed. The first issues are more likely to be database connection-pool pressure, repeated dashboard polling, expensive searches, and simultaneous ticket updates. I would tune the MongoDB connection pool, enforce sensible query limits, add indexes based on production query metrics, introduce caching where useful, and use WebSockets or Server-Sent Events instead of aggressive polling if real-time updates are required.

## 5. Observability

Production logs should be structured and should capture:

- timestamp
- request ID / correlation ID
- HTTP method and route
- response status
- latency
- authenticated agent ID and role where applicable
- relevant ticket ID
- validation/authentication failures
- database or external-service failures

Passwords, JWT values, and other sensitive data must never be logged.

Important metrics include request rate, p50/p95/p99 latency, error rate, authentication failures, ticket creation rate, database query latency, connection-pool utilization, and rate-limit events.

Alerts should focus on actionable failures: sustained 5xx responses, elevated latency, database connectivity problems, authentication-failure spikes, and unusual public-endpoint traffic.

A production deployment could send structured logs and metrics to an external observability platform and add distributed tracing if the system grows into multiple services.

## 6. Top 3 Priorities for Week 2–3

### 1. Tenant isolation and stronger search

Introduce a tenant model and tenant-scoped indexes, then replace broad subject/body matching with a proper full-text search strategy. This is the foundation for moving from a single helpdesk instance to a multi-tenant product.

### 2. Notifications and asynchronous processing

Add customer email notifications for ticket creation and agent replies, backed by a queue so external email providers never block the ticket API. Retry handling and delivery status would make the workflow production-ready.

### 3. Realtime collaboration and operational hardening

Add real-time ticket updates using WebSockets or SSE, then strengthen the platform with CI, automated integration tests, metrics/tracing, and production deployment checks.

## 7. Future Extensions / Nice-to-Haves

The architecture leaves clear extension points for the optional assignment features:

- **Docker:** containerize frontend/backend services and provide a local Docker Compose environment.
- **Realtime updates:** WebSockets or SSE for ticket changes without manual refresh.
- **Attachments:** store files in object storage and keep only metadata/references in MongoDB.
- **CI:** run type checking, linting, automated tests, and production builds on every push.
- **AI:** add an isolated service for reply drafting, ticket summarization, or classification without putting provider credentials in the frontend.

These additions are intentionally separated from the core ticket workflow so they can be introduced incrementally.
