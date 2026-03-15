# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the CGI Summer Internship 2026 trial project: a **Smart Restaurant Reservation System**. The task is to build a web application for restaurant table booking with intelligent table recommendations displayed on a visual floor plan.

Full requirements are in `CGI_suvepraktika_proovitöö_2026.pdf`.

## Required Stack

- **Backend**: Spring Boot 3.5.x + Java 25 (latest LTS as of Sept 2025)
- **Frontend**: React 19 + Vite — plain SVG for floor plan rendering (no canvas library)
- **Database**: H2 in-memory — zero setup for evaluator, data is randomly seeded
- **Version control**: Git (commit early and often — evaluators look at commit history)

## Core Features to Implement

1. **Reservation search & filtering** — filter by date/time, party size, zone (terrace, indoor, private room)
2. **Table recommendation engine** — score-based algorithm that matches party size to table capacity and user preferences (quiet corner, window seat, near kids' play area). Avoid placing small groups at large tables.
3. **Visual floor plan** — restaurant layout (grid or free-form) where occupied tables (randomly generated), available tables, and the recommended table are visually distinct
4. **Booking flow** — user selects time slot, party size, preferences → system recommends best table → user confirms

## Architecture

Monorepo with two sub-projects: `backend/` (Spring Boot) and `frontend/` (React + Vite).

```
/
├── backend/    Spring Boot REST API (port 8080)
├── frontend/   React + Vite (port 5173 in dev)
└── docs/       PLAN.md (implementation plan), DEVLOG.md (time log, sources)
```

### Backend package structure (`com.cgi.restaurant`)

- `domain/` — JPA entities: `Table`, `Reservation`, enums `TableFeature`, `Zone`
- `repository/` — Spring Data repos; the overlap JPQL query in `ReservationRepository` is critical
- `dto/` — `TableDTO` (includes computed `status`), `ReservationRequestDTO`, `RecommendationResponseDTO`
- `service/` — `TableService` (availability checks), `ReservationService`, `RecommendationService` (scoring)
- `controller/` — `/api/tables`, `/api/recommendations`, `/api/reservations`
- `exception/` — `GlobalExceptionHandler` (`@RestControllerAdvice`)
- `seeder/` — `DataSeeder` (`ApplicationRunner`) seeds tables and random reservations on startup
- `config/` — `CorsConfig` (allows `localhost:5173`)

### Frontend structure (`src/`)

- `api/tables.js` — all Axios calls; components never import Axios directly
- `components/FloorPlan.jsx` — SVG `viewBox="0 0 100 100"`, tables as `<rect>` with CSS classes for status colors
- `components/TableShape.jsx` — individual table rect + pulse animation for recommended table
- `components/FilterPanel.jsx` — date, time, party size, zone, preferences; fires `onSearch` callback
- `components/BookingPanel.jsx` — name/email form + confirmation
- `App.jsx` — holds all state; no Redux/Context needed

### Key architectural decisions

- **SVG coordinates**: stored as percentages (0–100) so they scale with viewport — never pixel values in DB
- **Recommendation flow**: `POST /api/recommendations` returns all tables with statuses AND the recommended table ID in one response — single round trip for the floor plan render
- **Dev proxy**: `vite.config.js` proxies `/api → localhost:8080` — frontend never needs to know the backend port
- **Scoring algorithm**: capacity fit (0–40 pts) + preference match (0–15 pts each) + zone match (0–10 pts); pure method, no side effects, unit-testable

## Development Commands

```bash
# Backend
cd backend
./mvnw spring-boot:run
./mvnw test

# Frontend
cd frontend
npm install
npm run dev    # dev server on :5173
npm run build  # production build → dist/
```

## Documentation Requirements (from task)

The evaluator must be able to run the project without prior knowledge of it. The README must include:
- How to start the application
- Time spent on the task
- Notes on what was difficult
- Sources used (Stack Overflow, AI tools, sample projects) with inline code comments referencing them
- Assumptions made about ambiguous requirements
- Any unresolved problems and how they could be solved
