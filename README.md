# Event Management Platform

A full-stack, microservices-based event management system with Dockerized local development.

## Stack

- Frontend: Next.js 16 + React 19
- API Gateway: Node.js + Express
- Backend Services:
  - Auth Service (Node.js)
  - Attendee Service (Node.js)
  - Event Service (Spring Boot, Java 21)
  - Budget Service (Spring Boot, Java 21)
- Database: PostgreSQL 16
- Orchestration: Docker Compose

## Architecture

Frontend (3000) calls API Gateway (5000), and the gateway routes requests to:

- Auth Service (5001)
- Event Service (5002)
- Budget Service (5003)
- Attendee Service (5004)

All services use PostgreSQL (5432). Databases are auto-created by `infrastructure/db/init-dbs.sql` when containers start.

## Prerequisites

For Docker-first setup (recommended):

- Docker Desktop (latest stable)
- Docker Compose v2

For non-Docker local run:

- Node.js 20+
- Java 21
- Maven (or Maven Wrapper)
- PostgreSQL 14+

## Quick Start (Recommended: Docker)

1. Clone and open project root.

```bash
git clone <your-repository-url>
cd event-management
```

2. Ensure `.env.docker` exists at project root.

3. Build and start all services.

```bash
docker compose up -d --build
```

4. Verify running containers.

```bash
docker compose ps
```

5. Open app.

- Frontend: http://localhost:3000
- API Gateway: http://localhost:5000

## Docker Reset Commands

Clean stop (keep DB volume):

```bash
docker compose down --remove-orphans
```

Full reset including PostgreSQL volume/data:

```bash
docker compose down -v --remove-orphans
```

Rebuild from scratch (no cache):

```bash
docker compose build --no-cache
docker compose up -d
```

## Important Update: Faster Docker Builds

This project now includes a root `.dockerignore` tuned for this monorepo.

It prevents large local artifacts from being sent to Docker build context, especially:

- `frontend/.next`
- `frontend/node_modules`
- all `node_modules`
- Java `target` directories

This significantly improves frontend image build time and reduces context transfer size.

## Service Port Map

| Component | Port | Purpose |
|---|---:|---|
| Frontend | 3000 | UI (Next.js) |
| API Gateway | 5000 | Single backend entry point |
| Auth Service | 5001 | User/admin auth and JWT |
| Event Service | 5002 | Events, venues, vendors |
| Budget Service | 5003 | Budgets and expenses |
| Attendee Service | 5004 | Bookings and attendee data |
| PostgreSQL | 5432 | Data store |

## Environment Variables

### Docker runtime

`docker-compose.yml` loads backend service env from `.env.docker`.

Frontend in Docker gets:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

### Local non-Docker runtime

Create root `.env`:

```env
JWT_SECRET=change-this-to-a-long-random-secret

AUTH_SERVICE_URL=http://localhost:5001
EVENT_SERVICE_URL=http://localhost:5002
BUDGET_SERVICE_URL=http://localhost:5003
ATTENDEE_SERVICE_URL=http://localhost:5004

FRONTEND_ORIGIN=http://localhost:3000

API_GATEWAY_PORT=5000
AUTH_SERVICE_PORT=5001
EVENT_SERVICE_PORT=5002
BUDGET_SERVICE_PORT=5003
ATTENDEE_SERVICE_PORT=5004

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=change-this-db-password

EVENT_DB_URL=jdbc:postgresql://localhost:5432/event_db
BUDGET_DB_URL=jdbc:postgresql://localhost:5432/budget_db

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-this-password
ADMIN_NAME=Platform Admin
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

Notes:

- `JWT_SECRET` must match between Auth Service and API Gateway.
- `auth_db` and `attendee_db` names are fixed in Node service DB config.

## Run Without Docker (Optional)

1. Create PostgreSQL databases:

```sql
CREATE DATABASE auth_db;
CREATE DATABASE attendee_db;
CREATE DATABASE event_db;
CREATE DATABASE budget_db;
```

2. Install dependencies:

```bash
cd api-gateway && npm install && cd ..
cd services/auth-service && npm install && cd ../..
cd services/attendee-service && npm install && cd ../..
cd frontend && npm install && cd ..
```

3. Start services (separate terminals):

```bash
cd services/auth-service && node src/app.js
cd services/event-service && ./mvnw spring-boot:run
cd services/budget-service && ./mvnw spring-boot:run
cd services/attendee-service && node src/app.js
cd api-gateway && node src/app.js
cd frontend && npm run dev
```

On Windows CMD/PowerShell for Java services, use `mvnw.cmd spring-boot:run`.

## API Gateway Routes

Base route groups:

- `/auth`
- `/events`
- `/budget`
- `/attendees`

Examples:

- `POST /auth/register`
- `POST /auth/login`
- `GET /events`
- `GET /events/:id`
- `POST /budget`
- `POST /attendees/book`

## Smoke Test

```bash
curl http://localhost:5000/events
curl http://localhost:5000/events/venues
curl http://localhost:5000/events/vendors
```

## Logs and Debugging

All logs:

```bash
docker compose logs -f
```

Specific service logs:

```bash
docker compose logs -f frontend
docker compose logs -f api-gateway
docker compose logs -f auth-service
docker compose logs -f event-service
docker compose logs -f budget-service
docker compose logs -f attendee-service
```

## Troubleshooting

### Build context is too large / frontend build is slow

- Ensure root `.dockerignore` exists and is committed.
- Rebuild with no cache:

```bash
docker compose build --no-cache frontend
```

### Port already in use

- Stop conflicting process or change port mapping in `docker-compose.yml`.

### Database connection issues

- Check `postgres` container is healthy: `docker compose ps`.
- Confirm env values in `.env.docker` (Docker) or `.env` (local).

### JWT or auth errors

- Verify `JWT_SECRET` is set and consistent between gateway and auth service.


