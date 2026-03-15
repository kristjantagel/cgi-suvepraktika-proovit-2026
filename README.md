# Smart Restaurant Reservation System

A web application for restaurant table booking with intelligent table recommendations, built as a CGI summer internship 2026 trial project.

## What This Does

Guests browse an interactive visual floor plan of the restaurant and reserve a table in a few steps:

1. **Filter** — pick a date, time, party size, and zone (indoor / terrace / private room)
2. **Get a recommendation** — the system scores all available tables based on how well they fit the party size and any preferences (quiet corner, window seat, near kids' play area) and highlights the best match on the floor plan
3. **Select and confirm** — the guest accepts the recommendation or picks another table, enters their name and email, and confirms the booking
4. **See the result** — the reserved table immediately turns red on the floor plan

Existing reservations are randomly generated on startup to simulate a realistic occupancy state.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Spring Boot 3.5.x, Java 25 |
| Database | H2 (in-memory, no setup required) |
| Frontend | React 19 + Vite, plain SVG for floor plan |
| API | REST (JSON) |

## How to Run

### Prerequisites

- Java 25 JDK
- Node.js 22+

### Quick start (single command after build)

```bash
# 1. Build the frontend
cd frontend
npm install
npm run build

# 2. Copy dist to Spring Boot static resources
cp -r dist ../backend/src/main/resources/static/

# 3. Run the backend — serves both API and frontend
cd ../backend
./mvnw spring-boot:run
```

Open [http://localhost:8080](http://localhost:8080).

### Development (two terminals, with hot reload)

```bash
# Terminal 1 — backend
cd backend
./mvnw spring-boot:run

# Terminal 2 — frontend (proxies /api to localhost:8080)
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### H2 Console

The database inspector is available at [http://localhost:8080/h2-console](http://localhost:8080/h2-console) while the backend is running.
JDBC URL: `jdbc:h2:mem:restaurant`

### Run backend tests

```bash
cd backend
./mvnw test
```

---

## Documentation

See [`docs/`](docs/) for:
- [`PLAN.md`](docs/PLAN.md) — phased implementation plan
- [`DEVLOG.md`](docs/DEVLOG.md) — time log, difficulties, sources, and assumptions

---

*Proovitöö CGI suvepraktikaks 2026*
