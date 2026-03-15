# Implementation Plan

## Stack Decisions

| Decision | Choice | Reason |
|---|---|---|
| Backend | Spring Boot 3.5.x + Java 25 | Required by task; 3.5.x targets Java 25 |
| Database | H2 in-memory | Zero setup for evaluator; data is randomly generated anyway |
| Frontend framework | React 19 + Vite | Widest adoption, best SVG/floor-plan ecosystem |
| Floor plan rendering | Plain SVG in React | Tables are just colored rects + click handlers — no graphics library needed |
| Project structure | Monorepo (`/backend`, `/frontend`) | Single repo, single clone for evaluator |
| Dev setup | Vite proxy (`/api → :8080`) + separate servers | Hot reload in dev; single JAR in production |

## Conventions

- Java package root: `com.cgi.restaurant`
- All backend classes use Lombok (`@Data`, `@Builder`, `@RequiredArgsConstructor`)
- DTOs are never JPA entities — always separate classes in `dto/`
- CORS configured globally in `CorsConfig`, not per-controller
- Frontend: components in PascalCase, hooks with `use` prefix, all Axios calls in `src/api/` only
- SVG coordinate space: `viewBox="0 0 100 100"` — all table coordinates are percentages

---

## Phase 1 — Scaffolding and Data Model

**Goal:** both sub-projects compile and start; full domain model is in place.

### 1.1 Backend

Generate with Spring Initializr: **Spring Web, Spring Data JPA, H2, Lombok, DevTools, Validation**

`application.properties`:
```properties
spring.datasource.url=jdbc:h2:mem:restaurant;DB_CLOSE_DELAY=-1
spring.datasource.driver-class-name=org.h2.Driver
spring.jpa.hibernate.ddl-auto=create-drop
spring.h2.console.enabled=true
server.port=8080
```

`CorsConfig.java` — allow all origins from `http://localhost:5173`, all methods including OPTIONS. Must be done now — every browser call depends on it.

### 1.2 Entities

**`Table.java`**
```java
@Entity @Data @Builder
public class Table {
    @Id @GeneratedValue private Long id;
    private int capacity;           // 2, 4, 6, 8
    private String zone;            // INDOOR, TERRACE, PRIVATE_ROOM
    private double x, y;            // SVG coords (0-100)
    private double width, height;   // SVG dimensions
    @ElementCollection @Enumerated(EnumType.STRING)
    private Set<TableFeature> features;
}
```

**`Reservation.java`**
```java
@Entity @Data @Builder
public class Reservation {
    @Id @GeneratedValue private Long id;
    @ManyToOne private Table table;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;       // startTime + 2h
    private int partySize;
    private String guestName;
    private String guestEmail;
    private boolean randomlyGenerated;
}
```

**Enums:** `TableFeature` (QUIET_CORNER, WINDOW_SEAT, NEAR_PLAY_AREA), `Zone` (INDOOR, TERRACE, PRIVATE_ROOM)

**`ReservationRepository`** — custom overlap query (most bug-prone part of the project):
```java
@Query("SELECT r FROM Reservation r WHERE r.table.id = :tableId " +
       "AND r.date = :date AND r.startTime < :end AND r.endTime > :start")
List<Reservation> findConflicting(Long tableId, LocalDate date, LocalTime start, LocalTime end);
```
Condition: `start < existingEnd AND end > existingStart`. Test with: adjacent slots (no conflict), 1-minute overlap (conflict), identical slots (conflict).

### 1.3 Data Seeder

`DataSeeder.java` implements `ApplicationRunner`:
1. Insert ~20 tables: ~12 indoor, ~5 terrace, ~3 private room. Use hardcoded SVG coordinates — **sketch the layout before coding**. Vary capacities (2, 4, 6, 8) and assign features.
2. Randomly pick ~40% of tables and create one reservation each for today ± 3 days (single fixed slot per table, e.g. 12:00–14:00 to avoid overlap).

### 1.4 Frontend

```bash
npm create vite@latest frontend -- --template react
npm install axios
```

Directory structure: `src/api/`, `src/components/`, `src/hooks/`, `src/types/`

`vite.config.js` — add dev proxy:
```js
server: { proxy: { '/api': 'http://localhost:8080' } }
```

---

## Phase 2 — Backend REST API

**Goal:** all endpoints exist, return correct data, testable with curl.

### DTOs

- `TableDTO` — mirrors entity + computed `status` field (`AVAILABLE` / `OCCUPIED`)
- `ReservationRequestDTO` — `date`, `startTime`, `partySize`, `zone?`, `preferences[]`, `tableId?`, `guestName`, `guestEmail` (with `@Valid` annotations)
- `RecommendationResponseDTO` — `tables: List<TableDTO>` + `recommendedTableId: Long?`

### Services

**`TableService.getTablesWithStatus(date, start, end, zone?)`** — fetch all tables (optionally by zone), check each for conflicts via repository query, return list with status set. Core workhorse called by almost everything.

**`ReservationService.createReservation(req)`** — re-validate no conflict (race condition guard), save, return DTO.

**`RecommendationService.recommend(req)`** — see Phase 4.

### Controllers

| Endpoint | Method | Description |
|---|---|---|
| `/api/tables` | GET | `?date=&start=&end=&zone=` → `List<TableDTO>` |
| `/api/recommendations` | POST | body: `ReservationRequestDTO` → `RecommendationResponseDTO` |
| `/api/reservations` | POST | body: `ReservationRequestDTO` → `201 Created` |
| `/api/reservations/{id}` | GET | confirmation lookup |

### Error Handling

`GlobalExceptionHandler.java` (`@RestControllerAdvice`):
- Custom `TableNotAvailableException` → `409 Conflict`
- `MethodArgumentNotValidException` → `400` with field error map
- Generic `Exception` → `500`

Do this now — without it, debugging frontend issues means parsing HTML error pages.

### Verification

After Phase 2, test every endpoint with curl before touching the frontend. Document exact request/response shapes — this becomes the source of truth for frontend types.

---

## Phase 3 — Frontend Floor Plan and Filters

**Goal:** UI renders the floor plan with real data; filter panel controls the query.

### Types (`src/types/index.js`)

```js
// Table: { id, capacity, zone, x, y, width, height, features[], status }
// RecommendationResponse: { tables: Table[], recommendedTableId: number | null }
```

### API Module (`src/api/tables.js`)

- `fetchRecommendation(params)` — POST `/api/recommendations`
- `createReservation(body)` — POST `/api/reservations`

Components never import Axios directly.

### `FilterPanel.jsx`

Controlled form: date (default today), time (default next full hour), party size (select 1–12), zone (All/Indoor/Terrace/Private), preferences (checkboxes). Fires `onSearch(params)` callback — no internal API calls.

### `FloorPlan.jsx` — the visual centrepiece

- `<svg viewBox="0 0 100 100" width="100%">` — coordinates are percentages, browser scales automatically
- Each table → `<TableShape>` component receiving `table`, `isRecommended`, `isSelected`, `onClick`
- Color logic: `OCCUPIED` → `#e74c3c`, `AVAILABLE` → `#3498db`, `RECOMMENDED` → `#2ecc71` + CSS pulse animation
- Table label: `<text>` centered in rect (cx = x + width/2)
- Zone dividers: static `<line>` / `<rect>` elements with `<text>` labels — hardcoded, not data-driven
- Tooltip: `<title>` child inside each `<g>` — browser renders natively, zero JS

### State in `App.jsx`

```
App
 ├── FilterPanel   (onSearch callback)
 ├── FloorPlan     (tables, recommendedId, onTableSelect)
 └── BookingPanel  (selectedTable, searchParams, onConfirm)
```

State: `tables`, `recommendedTableId`, `selectedTableId`, `searchParams`, `bookingState` (idle | confirming | confirmed | error). No Redux needed.

**Important:** only call `/api/recommendations` on button click, not on every filter change.

---

## Phase 4 — Recommendation Engine

**Goal:** `RecommendationService.recommend()` returns the best available table.

### Scoring Algorithm

For each `AVAILABLE` table, compute a score (additive):

**Capacity fit (0–40 pts) — highest weight:**
```
surplus = capacity - partySize
surplus < 0  → -1000  (eliminate)
surplus == 0 → 40
surplus == 1 → 35
surplus == 2 → 25
surplus == 3 → 15
surplus >= 4 → 5
```

**Preference match (0–15 pts per preference, max 45):**
```
for each requested preference:
    if table.features contains preference: +15
```

**Zone match (0–10 pts):**
```
if zone requested && table.zone == requested: +10
```

**Tie-break:** sort `(score DESC, id ASC)` for deterministic results.

```java
public RecommendationResponseDTO recommend(ReservationRequestDTO req) {
    LocalTime end = req.getStartTime().plusHours(2);
    List<TableDTO> all = tableService.getTablesWithStatus(req.getDate(), req.getStartTime(), end, req.getZone());
    TableDTO best = all.stream()
        .filter(t -> t.getStatus() == TableStatus.AVAILABLE)
        .max(Comparator.comparingInt(t -> score(t, req)))
        .orElse(null);
    return RecommendationResponseDTO.builder()
        .tables(all)
        .recommendedTableId(best != null ? best.getId() : null)
        .build();
}
```

Keep `score()` as a pure private method — makes it trivially unit-testable.

### Unit Tests (write these BEFORE implementing the algorithm)

`RecommendationServiceTest.java`:
- Party of 2 prefers a 2-seat table over a 6-seat table
- Party of 4 with WINDOW_SEAT scores higher on a 4-seat window table vs. 4-seat non-window
- Table with capacity < partySize is never recommended
- With no preferences, perfect capacity fit always wins

---

## Phase 5 — Booking Flow

**Goal:** user can select a table, fill in details, confirm, and see a success state.

### Selection UX

- Recommended table is auto-selected when search results arrive (`selectedTableId = recommendedTableId`)
- User can override by clicking any available table
- Occupied tables have no `onClick`

### `BookingPanel.jsx`

Shows: table number, capacity, zone, features, selected date/time, party size. "Recommended for you" badge if applicable. Form: name (required), email (required + HTML5 validation). "Confirm Booking" → `createReservation()`.

### Post-booking

- **Success:** `ConfirmationView.jsx` with booking summary + "Make another reservation" button that resets state. Re-fetch floor plan — confirmed table now appears red.
- **409 Conflict:** "This table was just taken — please choose another." (rare but required)

### Backend Validation (`@Valid` on DTO)

- `@NotNull` on `date`, `startTime`, `tableId`
- `@Min(1) @Max(20)` on `partySize`
- `@NotBlank` on `guestName`, `@Email` on `guestEmail`

---

## Phase 6 — Polish and Documentation

### UI Polish

- Loading spinner overlay on floor plan during API call; disable "Find Table" button while loading
- Empty state inside SVG: "No tables available for this time slot"
- CSS: single `App.css` + `FloorPlan.css` for pulse animation — no CSS modules or styled-components needed

### README

Complete all sections in `docs/DEVLOG.md` (time log, assumptions, difficulties, sources, unresolved problems).

### Optional Extras (priority order)

**A — Auto-release after visit duration** *(low complexity, high value)*
Add `@Scheduled` task (every 5 min) that marks/deletes reservations where `endTime < LocalTime.now()` on today. The `endTime` field is already seeded. One new method in `ReservationService` + a scheduler bean.

**B — Docker** *(medium)*
- `backend/Dockerfile`: `FROM eclipse-temurin:25-jdk-alpine`
- `frontend/Dockerfile`: multi-stage — Node build → nginx serve, with nginx proxying `/api` to backend
- `docker-compose.yml` at repo root

**C — Admin drag-and-drop editor** *(highest complexity)*
- `/admin` route in React
- `onMouseDown/Move/Up` on SVG `<rect>` for drag
- `PUT /api/tables/{id}` to persist new coordinates

---

## Key Risks

1. **Java 25 + Spring Boot compatibility** — verify in the first 30 minutes; fall back to Java 21 if compilation fails
2. **SVG coordinate system** — use viewBox percentages, never pixel values in the DB
3. **Overlap query correctness** — test the JPQL query manually before building the UI
4. **AI attribution** — the task explicitly requires inline comments + doc references for AI-generated code
5. **Commit frequency** — aim for 15–30 commits; evaluators look at the history

---

## File Tree (target state)

```
/
├── README.md
├── CLAUDE.md
├── docs/
│   ├── PLAN.md         ← this file
│   └── DEVLOG.md       ← time log, sources, assumptions
├── backend/
│   ├── pom.xml
│   └── src/main/java/com/cgi/restaurant/
│       ├── RestaurantApplication.java
│       ├── config/          CorsConfig.java
│       ├── domain/          Table.java, Reservation.java, TableFeature.java, Zone.java
│       ├── repository/      TableRepository.java, ReservationRepository.java
│       ├── dto/             TableDTO.java, ReservationRequestDTO.java, RecommendationResponseDTO.java
│       ├── service/         TableService.java, ReservationService.java, RecommendationService.java
│       ├── controller/      TableController.java, RecommendationController.java, ReservationController.java
│       ├── exception/       TableNotAvailableException.java, GlobalExceptionHandler.java
│       └── seeder/          DataSeeder.java
│   └── src/test/java/com/cgi/restaurant/service/
│       └── RecommendationServiceTest.java
└── frontend/
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── App.jsx, App.css, main.jsx
        ├── api/             tables.js
        ├── types/           index.js
        ├── hooks/           useRecommendation.js
        └── components/
            ├── FilterPanel.jsx
            ├── FloorPlan.jsx, FloorPlan.css
            ├── TableShape.jsx
            ├── BookingPanel.jsx
            └── ConfirmationView.jsx
```
