# EvaTrack / EvacConnect — Test Cases

**System:** Web-based evacuation management (React + Laravel + MySQL)  
**Use for:** Capstone QA, UAT, defense demo checklist  
**Format:** ID | Module | Steps | Expected | Priority

**Legend:** P1 = Must pass before deployment | P2 = Should pass | P3 = Nice to have

---

## 1. Authentication & Session

| ID | Test case | Steps | Expected | P |
|----|-----------|-------|----------|---|
| AUTH-01 | Valid login (evac_admin) | Open `/login` → enter valid `user_id` + password → Sign In | Redirect to `/dashboard`; `localStorage` has `user` and `token`; no error | P1 |
| AUTH-02 | Valid login (evac_personnel) | Same with personnel account assigned to a center | Dashboard loads; user shows role and center in header | P1 |
| AUTH-03 | Invalid password | Valid `user_id`, wrong password | Error message; stay on login; no token | P1 |
| AUTH-04 | Empty fields | Submit with blank user ID or password | Client validation: "Please enter both User ID and Password." | P1 |
| AUTH-05 | CSRF + API down | Stop backend → login | Error shown (not silent); no redirect | P1 |
| AUTH-06 | Protected route without login | Clear storage → open `/dashboard` | Redirect away (landing `/`); no dashboard data | P1 |
| AUTH-07 | Session persistence | Login → refresh page on `/dashboard` | Still authenticated | P1 |
| AUTH-08 | Logout | Login → Logout from sidebar/header | Redirect to login; storage cleared; `/dashboard` blocked | P1 |
| AUTH-09 | API logout endpoint | After login, call `POST /api/logout` with auth | 200; subsequent `/api/user` returns 401 | P2 |

---

## 2. Role-Based Access (UI + API)

| ID | Test case | Steps | Expected | P |
|----|-----------|-------|----------|---|
| ROLE-01 | Super admin sidebar | Login as `super_admin` | See Dashboard + Users; other items per menu config | P2 |
| ROLE-02 | Admin sidebar | Login as `evac_admin` | See Events, Households, Centers, Alerts, etc.; no Users if not super | P1 |
| ROLE-03 | Personnel sidebar | Login as `evac_personnel` | No Events, no Users; has Verification, Centers | P1 |
| ROLE-04 | Direct URL block (personnel) | Personnel opens `/events` in address bar | Page may load — **verify API blocks create** (see bugs doc) | P1 |
| ROLE-05 | User mgmt API (personnel) | Personnel calls `POST /api/users` (Postman) | 403 Forbidden | P1 |
| ROLE-06 | Center create (personnel) | Personnel calls `POST /api/evacuation-centers` | 403 Forbidden | P1 |

---

## 3. User Management (`/user-management`)

| ID | Test case | Steps | Expected | P |
|----|-----------|-------|----------|---|
| USER-01 | List users | Admin opens User Management | Paginated user list loads | P1 |
| USER-02 | Create evac_personnel | Create user with name, password, role personnel, contact | User appears; can login | P1 |
| USER-03 | Assign center | Assign personnel to a center | `assigned_center` saved; visible in list | P1 |
| USER-04 | Update user | Edit name/contact | Changes persist after refresh | P2 |
| USER-05 | Delete personnel | Admin deletes evac_personnel | Removed; cannot login | P2 |
| USER-06 | Admin cannot delete super_admin | evac_admin tries delete super_admin | Blocked in UI or API 403 | P1 |

---

## 4. Evacuation Centers (`/evacuation-centers`)

| ID | Test case | Steps | Expected | P |
|----|-----------|-------|----------|---|
| CTR-01 | List centers | Open centers list | All centers with capacity info | P1 |
| CTR-02 | Create center (admin) | Create with name, location, capacity | Appears in list and public API | P1 |
| CTR-03 | Center detail | Open `/:id` | Units, occupancy, allocations section load | P1 |
| CTR-04 | Create unit | Add accommodation unit with type + max capacity | Unit listed under center | P1 |
| CTR-05 | Update unit | Change capacity/name | Saved correctly | P2 |
| CTR-06 | Delete unit (empty) | Delete unit with no allocations | Removed | P2 |
| CTR-07 | Public centers API | `GET /api/public/evacuation-centers` (no auth) | JSON with centers + stats | P1 |

---

## 5. Event Management (`/events`) — evac_admin

| ID | Test case | Steps | Expected | P |
|----|-----------|-------|----------|---|
| EVT-01 | Create event | Declare event: name, disaster type, severity | Active event in list; `started_at` set | P1 |
| EVT-02 | Assign centers | Assign 1+ centers to event | Centers show `current_event_id` in DB / UI | P1 |
| EVT-03 | Active event API | `GET /api/events/active` | Returns current active event | P2 |
| EVT-04 | End event | End active event | `ended_at` set; centers unlinked | P1 |
| EVT-05 | Allocate after end | Try assign household to unit when event ended | API rejects with ended-event message | P1 |

---

## 6. Evacuation Alerts (`/evacuation-alerts`)

| ID | Test case | Steps | Expected | P |
|----|-----------|-------|----------|---|
| ALR-01 | List alerts | Open alerts page | Past alerts listed | P2 |
| ALR-02 | Preview recipients | Create modal → set filters → preview | Count/list of recipients returned | P2 |
| ALR-03 | Send alert | Fill message, urgency, channel → send | Success; alert in list | P1 |
| ALR-04 | Cancel alert | Cancel pending alert | Status updated; no further send | P2 |
| ALR-05 | Link to event | Select active event in alert form | Event ID stored on notification | P3 |

---

## 7. Households (`/households`, `/households/:id`)

| ID | Test case | Steps | Expected | P |
|----|-----------|-------|----------|---|
| HH-01 | List households | Open households with search/filter | Results match query | P1 |
| HH-02 | View detail | Open household detail | Members list loads | P1 |
| HH-03 | Add member | Add member with required fields | Member appears | P1 |
| HH-04 | Update household | Edit address/head | Saved | P2 |
| HH-05 | Delete member | Delete a member | Removed from list | P2 |

---

## 8. Household Verification — Admit flow (`/household-verification`)

| ID | Test case | Steps | Expected | P |
|----|-----------|-------|----------|---|
| VER-01 | Personnel without center | Login personnel with no `assigned_center` → admit | Error: no center assigned | P1 |
| VER-02 | Search and admit | Search registered household → select members → admit | Success; evacuation record created | P1 |
| VER-03 | QR scan admit | Scan valid household QR → admit | Same as VER-02; method `qr` | P1 |
| VER-04 | Duplicate admit | Admit same household twice at same center | Error: already evacuated | P1 |
| VER-05 | Admit without event on center | Center has no `current_event_id` → admit without `event_id` | Error: no active event on center | P1 |
| VER-06 | On-site registration | Manual tab → create new household → admit | New household + record | P2 |
| VER-07 | Admin without assigned center | evac_admin with null center tries scan/admit | 403 no center assigned (current behavior) | P2 |

---

## 9. Unit Allocation (Center detail)

| ID | Test case | Steps | Expected | P |
|----|-----------|-------|----------|---|
| ALLOC-01 | List unassigned | Open assign modal on unit | Shows evacuated households not yet in a unit | P1 |
| ALLOC-02 | Assign household | Pick household → assign | Allocation created; unit occupancy +1 | P1 |
| ALLOC-03 | Unit full | Assign when `current_occupancy >= max_capacity` | Blocked with clear message | P1 |
| ALLOC-04 | Household too large for slots | Family size > available slots | Shown disabled or error in modal | P2 |
| ALLOC-05 | Unassign | Unassign allocation | Household back to unassigned pool | P2 |

---

## 10. Resource Requests (`/resource-requests`)

| ID | Test case | Steps | Expected | P |
|----|-----------|-------|----------|---|
| RR-01 | Create request | Personnel creates request with urgency | Appears in list | P2 |
| RR-02 | Update status (admin) | Admin changes status | Updated; personnel may be read-only | P2 |
| RR-03 | Delete request | Delete with permission | Removed | P3 |

---

## 11. Center Issue Reports (`/center-issue-reports`)

| ID | Test case | Steps | Expected | P |
|----|-----------|-------|----------|---|
| CIR-01 | Create report | Create with category + description | Listed as open | P2 |
| CIR-02 | Update status | Admin marks resolved | Status changes | P2 |
| CIR-03 | Personnel own reports | Personnel sees/filters own reports | Correct filter | P3 |

---

## 12. Dashboard & Analytics

| ID | Test case | Steps | Expected | P |
|----|-----------|-------|----------|---|
| DASH-01 | Dashboard load | Open `/dashboard` after login | Stats, charts, recent items load | P1 |
| DASH-02 | Capacity chart | After admits, refresh dashboard | Occupancy numbers increase | P2 |
| AN-01 | Analytics page | Open `/analytics` | Events list / charts load from API | P2 |

---

## 13. Public Portal

| ID | Test case | Steps | Expected | P |
|----|-----------|-------|----------|---|
| PUB-01 | Landing page | Open `/` | Centers + capacity stats (or graceful empty) | P1 |
| PUB-02 | Public portal map | Open `/portal` | Map markers; center popups | P1 |
| PUB-03 | Nearest center routing | Allow geolocation → select center | Route drawn (OSRM) or fallback message | P2 |
| PUB-04 | Responder login link | Click from landing | Goes to `/login` | P3 |

---

## 14. Integration / Disaster day scenario (E2E)

| ID | Test case | Steps | Expected | P |
|----|-----------|-------|----------|---|
| E2E-01 | Full flow | Admin: create event → assign centers → send alert → Personnel: admit family → assign unit → Dashboard shows occupancy | All steps succeed in order | P1 |
| E2E-02 | Public during event | Open landing during active operations | Centers show updated occupancy | P2 |
| E2E-03 | End event | Admin ends event → try new allocation | Allocation blocked | P1 |

---

## 15. Non-functional

| ID | Test case | Steps | Expected | P |
|----|-----------|-------|----------|---|
| NF-01 | CORS from frontend origin | Frontend on `localhost:5174` calls API | No CORS errors in console | P1 |
| NF-02 | Wrong DB credentials | Bad `DB_PASSWORD` in backend `.env` | Login fails; fix password → works | P1 |
| NF-03 | Responsive layout | Test login + dashboard on mobile width | Usable layout | P3 |

---

## Test execution log (fill during QA)

| Date | Tester | Build/branch | Pass | Fail | Blocked | Notes |
|------|--------|--------------|------|------|---------|-------|
| | | | | | | |

---

## Traceability (for capstone paper)

| Objective (Ch. 1) | Test IDs |
|-------------------|----------|
| Secure role-based access | AUTH-*, ROLE-* |
| Event-based operations | EVT-*, E2E-01 |
| Household verification | VER-* |
| Capacity & allocation | ALLOC-*, CTR-*, DASH-* |
| Public information | PUB-* |
