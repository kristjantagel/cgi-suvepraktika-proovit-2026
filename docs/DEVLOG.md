# Development Log

## Time Log

| Phase | Task | Time Spent     |
|---|---|----------------|
| 1 | Scaffolding, entities, seeder | ✅ Done - 30min |
| 2 | Backend REST API |                |
| 3 | Frontend floor plan + filters |                |
| 4 | Recommendation engine |                |
| 5 | Booking flow |                |
| 6 | Polish + documentation | 30min          |
| **Total** | | 30min          |

---

## Assumptions

- A reservation blocks a table for exactly **2 hours** from the selected start time
- Party size of **1** is valid
- The floor plan layout is **fixed** — tables cannot be repositioned by guests
- "Zone" filtering is optional; leaving it blank shows all zones
- Randomly generated seed reservations are spread across today ± 2 days, up to one time slot per table, to avoid overlap complexity in the seeder
- Occupied tables are not clickable — the user can only select available tables

---

## What Was Difficult

*(Fill in as you work — be specific, e.g. "SVG coordinate normalization between backend percentages and browser pixels took 2 hours to debug")*

---

## Sources and AI Usage

*(List every external source that influenced a non-trivial piece of code. Include the URL or tool name and a brief description of what it was used for. Reference the relevant code sections with inline comments like `// source: ...`)*

| Source | Used For | Code Location |
|---|---|---|
| | | |

---

## Unresolved Problems

*(Describe any features that are incomplete or known issues, and how you would approach solving them with more time)*

---

## What I Would Do Differently

*(Retrospective notes — fill in near the end)*
