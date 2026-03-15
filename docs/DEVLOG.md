# Development Log

## Time Log

| Phase | Task | Time Spent     |
|---|---|----------------|
| 1 | Scaffolding, entities, seeder | ✅ Done - 1h    |
| 2 | Backend REST API | ✅ Done - 15min |
| 3 | Frontend floor plan + filters | ✅ Done - 2h    |
| 4 | Recommendation engine | ✅ Done - 15min |
| 5 | Booking flow | ✅ Done - 15min |
| 6 | Polish, bug fixes + documentation | ✅ Done - 1h    |
| **Total** | | *4h 45min*     |

---

## Assumptions

- A reservation blocks a table for exactly **2 hours** from the selected start time
- Party size of **1** is valid
- The floor plan layout is **fixed** — tables cannot be repositioned by guests
- Zone filtering influences which table gets **recommended**, but the full floor plan always shows all tables. Tables outside the selected zone are visually dimmed.
- Randomly generated seed reservations are spread across today ± 2 days, up to one time slot per table, to avoid overlap complexity in the seeder
- Occupied tables are not clickable — the user can only select available tables
- Maximum booking start time is **22:00** — this prevents `LocalTime.plusHours(2)` from wrapping past midnight, which would break the overlap detection query
- Party size cannot exceed the selected table's capacity — enforced on both frontend and backend
- Reservations whose `endTime` has passed are automatically marked as expired by a background scheduler (runs every 60 seconds) and no longer block new bookings

---

## What Was Difficult

**LocalTime midnight wrap bug** — The time overlap query uses `startTime < :end AND endTime > :start`. When a booking at 23:00 has `endTime = 01:00` (next day), `LocalTime.plusHours(2)` wraps around to 01:00. The query then checks `23:00 < 01:00` which is false in LocalTime comparison, so no conflict is detected and the table appears available. Fixed by capping the booking time input at 22:00.

**Zone filtering vs. floor plan completeness** — Initially, zone filtering removed tables from the API response entirely. This meant filtering by "Terrace" hid 13 of 19 tables from the floor plan — defeating the purpose of a visual floor plan. Fixed by removing zone from `TableService.getTablesWithStatus()` and using it only inside `RecommendationService` to determine candidates for recommendation. The floor plan always shows all 19 tables.

**Floor plan not updating after booking** — After confirming a reservation and clicking "Make Another Reservation", the booked table would revert to showing as available. Root cause: the post-booking floor plan refresh was async and the reset handler was clearing the tables state before the refresh completed. Fixed by (1) immediately applying an optimistic update to the local tables array and (2) re-fetching on reset.

**Booking button silently blocked** — If a user clicked a table from the initial floor plan load (before doing any search), `searchParams` was null. `handleConfirm` silently returned early with no feedback. Fixed by intercepting the table click when `searchParams` is null and showing an explanatory error message.

**Backend accepted oversized party bookings** — No server-side validation prevented booking 10 people at a 2-seat table. Only the frontend checked this. Fixed by adding a capacity check in `ReservationService` and proper `@Valid` on the controller.

---

## Sources and AI Usage

Claude Code (claude.ai/code) was used to assist with parts of this project. The split was roughly:
- **Backend**: ~75% written by me, ~25% assisted by Claude Code (primarily `DataSeeder`, `MealService`, `ReservationExpiryService`, and bug fixes)
- **Frontend**: built by Claude Code under my supervision and direction — component structure, SVG floor plan, booking flow, and styles

| Source | Used For | Code Location |
|---|---|---|
| Claude Code AI | Frontend components, SVG floor plan, booking flow | `frontend/src/` — all files |
| Claude Code AI | Data seeder layout and random reservation logic | `DataSeeder.java` |
| Claude Code AI | TheMealDB integration and auto-expiry scheduler | `MealService.java`, `ReservationExpiryService.java` |
| Claude Code AI | Bug fixes (overlap query, zone filtering, DTO cleanup) | `RecommendationService.java`, `ReservationService.java`, `TableService.java` |
| TheMealDB (themealdb.com) | Public meal API for daily food suggestion | `MealService.java`, `ConfirmationView.jsx` |
| Spring Initializr (start.spring.io) | Backend project generation | `backend/pom.xml` |

---

## Unresolved Problems

**Dynamic table merging** — The task brief mentions recommending adjacent tables that can be pushed together for large groups. This is not implemented. It would require storing adjacency relationships in the data model (a `adjacentTableIds` field or a join table) and adding logic in `RecommendationService` to find pairs of adjacent tables whose combined capacity fits the party.

**Admin drag-and-drop editor** — Not implemented. Would require a `/admin` route, `onMouseDown/Move/Up` handlers on the SVG table rects, and a `PUT /api/tables/{id}` endpoint to persist new coordinates.

**Time slots crossing midnight** — Bookings are capped at 22:00 as a workaround. A proper fix would use `LocalDateTime` instead of `LocalDate` + `LocalTime` for reservations, which would handle midnight crossings correctly in the overlap query.

**Dialect warning** — `spring.jpa.database-platform=org.hibernate.dialect.H2Dialect` in `application.properties` triggers a Hibernate deprecation warning. Removing the property resolves it (Hibernate auto-detects H2), but it is harmless.

---

## What I Would Do Differently

- Use `LocalDateTime` instead of separate `LocalDate` + `LocalTime` for reservations from the start — avoids the midnight edge case entirely
- Write backend integration tests (MockMvc) alongside each controller, not just unit tests for the scoring service
- Define the API contract (request/response shapes) explicitly before writing either the backend or frontend — reduces DTO refactoring mid-project
