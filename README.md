# Event Management Platform

Microservices-based event management application with:

- Frontend: Next.js
- API Gateway: Node.js + Express
- Services:
	- Auth Service (Node.js)
	- Attendee Service (Node.js)
	- Event Service (Spring Boot)
	- Budget Service (Spring Boot)
- Database: PostgreSQL

This guide helps a new developer clone, configure, and run the project locally.

## 1) Clone The Repository

```bash
git clone <your-repository-url>
cd event-management
```

## 2) Prerequisites

Install the following before running locally:

- Git
- Node.js 18+ and npm
- Java 21
- Maven (optional, wrappers are included for Java services)
- PostgreSQL 14+ (or compatible)

Quick version checks:

```bash
node -v
npm -v
java -version
psql --version
```

## 3) Configure Environment Variables

Create or update root `.env` file:

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

Create or update `frontend/.env.local` file:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

Notes:

- API Gateway, Auth Service, Attendee Service, Event Service, and Budget Service read values from the root `.env`.
- Frontend reads `NEXT_PUBLIC_API_BASE_URL` from `frontend/.env.local`.
- `JWT_SECRET` must be the same for Auth Service and API Gateway.

## 4) Set Up PostgreSQL Databases

The code currently expects PostgreSQL on:

- host: `localhost`
- port: `5432`
- user: `postgres`

Create required databases:

```sql
CREATE DATABASE auth_db;
CREATE DATABASE attendee_db;
CREATE DATABASE event_db;
CREATE DATABASE budget_db;
```

Important:

- DB credentials are now read from root `.env`.
- `auth_db` and `attendee_db` database names are currently fixed in Node service code.

## 5) Install Dependencies

Run in project root:

```bash
cd api-gateway && npm install && cd ..
cd services/auth-service && npm install && cd ../..
cd services/attendee-service && npm install && cd ../..
cd frontend && npm install && cd ..
```

## 6) Run Services (Use Separate Terminals)

Start services in this order.

### Terminal 1: Auth Service (`AUTH_SERVICE_PORT`, default 5001)

```bash
cd services/auth-service
node src/app.js
```

### Terminal 2: Event Service (`EVENT_SERVICE_PORT`, default 5002)

Windows CMD/PowerShell:

```bat
cd services\event-service
mvnw.cmd spring-boot:run
```

Git Bash:

```bash
cd services/event-service
./mvnw spring-boot:run
```

### Terminal 3: Budget Service (`BUDGET_SERVICE_PORT`, default 5003)

Windows CMD/PowerShell:

```bat
cd services\budget-service
mvnw.cmd spring-boot:run
```

Git Bash:

```bash
cd services/budget-service
./mvnw spring-boot:run
```

### Terminal 4: Attendee Service (`ATTENDEE_SERVICE_PORT`, default 5004)

```bash
cd services/attendee-service
node src/app.js
```

### Terminal 5: API Gateway (`API_GATEWAY_PORT`, default 5000)

```bash
cd api-gateway
node src/app.js
```

### Terminal 6: Frontend (3000)

```bash
cd frontend
npm run dev
```

Open:

- Frontend: http://localhost:3000
- API Gateway: http://localhost:5000

## 7) Quick Smoke Checks

After all services start:

```bash
curl http://localhost:5000/events
curl http://localhost:5000/events/venues
curl http://localhost:5000/events/vendors
```

If these return JSON (including empty arrays), the gateway pathing is working.

Gateway responses are standardized as:

```json
{
	"status": "success",
	"message": "Data fetched successfully",
	"data": {}
}
```

## 8) Service And Port Map

| Component | Port | Notes |
|---|---:|---|
| Frontend (Next.js) | 3000 | Calls gateway at `http://localhost:5000` |
| API Gateway | 5000 | Aggregates and proxies all backend services |
| Auth Service | 5001 | JWT + user/admin auth |
| Event Service | 5002 | Event, venue, vendor operations |
| Budget Service | 5003 | Budget and expense operations |
| Attendee Service | 5004 | RSVP and attendee records |
| PostgreSQL | 5432 | Stores all service databases |

## 9) API Gateway Base Routes

Gateway prefixes:

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

## 10) Docker Status

Currently, Docker artifacts in this repository are not fully configured:

- Root `docker-compose.yml` is empty.
- Dockerfiles under `infrastructure/docker/` are empty.

Use the manual local run steps above.

## 11) Troubleshooting

### Port already in use

Stop the process using the conflicting port, then restart the service.

### Database connection failed

Check PostgreSQL is running, database names exist, and credentials in root `.env` are correct.

If you still see auth failures, verify there is no trailing space in `DB_PASSWORD`.

### JWT errors (`Invalid token`)

Ensure the same `JWT_SECRET` is used across Auth Service and API Gateway from the root `.env`.

### CORS issues

Set `FRONTEND_ORIGIN=http://localhost:3000` in root `.env` and restart API Gateway.

## 12) Current Limitations To Be Aware Of

- `auth_db` and `attendee_db` names are currently fixed in Node service DB configs.
- No unified root-level start script yet.
- Docker setup is present in structure but not yet implemented.

## 13) Suggested Next Improvements

1. Move `auth_db` and `attendee_db` names to environment variables for full DB configurability.
2. Add root scripts (or a process manager) to start all services with one command.
3. Complete Dockerfiles and `docker-compose.yml` for one-command container startup.
