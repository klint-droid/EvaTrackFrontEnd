# Frontend Change Log: Dashboard Personnel Center-Scoping

This document details the front-end modifications made to `Dashboard.jsx` to tailor the interface dynamically to the authenticated user's role.

---

## 1. Dynamic Greeting & Header Titles
* **File**: `src/pages/Dashboard.jsx`
* **Change**:
  * Added conditional state checks utilizing the authenticated user metadata stored in `localStorage`.
  * If the user is `evac_personnel`, the dashboard header dynamically renders their custom **assigned center name** (e.g., `"Mabolo Gym Evacuation Center — Personnel Dashboard"`) instead of the general admin `"Operations Command Center"`.

---

## 2. Contextualized Metric Labels
* **File**: `src/pages/Dashboard.jsx`
* **Change**:
  * Adjusted global metrics labels for personnel view to reflect center-level data.
  * For example, the labels are updated to `"Center Occupancy"` (instead of System Occupancy), `"Center Concerns"` (instead of System Concerns), and `"Center Logistics"` (instead of System Logistics).
  * This guarantees that the user has a clear context of their limited operational boundary.

---

## 3. Dynamic Feature Access Restrictions
* **File**: `src/pages/Dashboard.jsx`
* **Change**:
  * Hidden global system links that are irrelevant for personnel role contexts.
  * Specifically, the `"View Centers"` control button/link is completely hidden from the personnel user interface, as they are restricted to their single assigned center.
