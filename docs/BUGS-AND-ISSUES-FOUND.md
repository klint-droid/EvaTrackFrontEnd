# Bugs & Issues Found — EvaTrack / EvacConnect

**Review date:** Based on static code review of `EvaTrackFrontEnd` + `capstone backbone\EvaTrack`  
**Severity:** Critical | High | Medium | Low

---

## Critical

### BUG-001 — Logout calls wrong API path
**Location:** `src/api/auth/logout.ts`  
**Issue:** Frontend calls `POST /logout` but Laravel route is `POST /api/logout` (see `routes/api.php`).  
**Symptom:** Logout may fail silently (404); session/token may remain; user appears logged out in UI but API might still accept requests.  
**Fix:** Change to `API.post("/api/logout")`.

---

### BUG-002 — CORS allows wrong frontend origins
**Location:** `capstone backbone/EvaTrack/config/cors.php`  
**Issue:** `allowed_origins` only includes `http://localhost:5173` and `http://10.150.111.114:5173`.  
**Symptom:** Vite often runs on **5174** or `127.0.0.1:5174` → browser blocks API calls; login shows generic "Invalid User ID or Password."  
**Fix:** Add all dev origins you use:
```php
'allowed_origins' => [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    // production URL when deployed
],
```
Also align `SANCTUM_STATEFUL_DOMAINS` in backend `.env`.

---

### BUG-003 — Database password mismatch (environment)
**Location:** Backend `.env` (`DB_PASSWORD`)  
**Issue:** Documented during testing: password in `.env` did not match MySQL Workbench (e.g. `klint554687` vs actual `root`).  
**Symptom:** `php artisan db:show` → `Access denied for user 'root'@'localhost'`; login fails.  
**Fix:** Set `DB_PASSWORD` to match MySQL Workbench **Test Connection** password; run `php artisan config:clear`.

---

## High

### BUG-004 — Auth token stored but never sent
**Location:** `src/pages/Login.jsx`, `src/api.ts`  
**Issue:** Login saves `localStorage.token` but axios never sets `Authorization: Bearer {token}`.  
**Symptom:** Auth relies on Sanctum cookies/session only; token is dead code; `apiLogout` deletes token while UI may use session — inconsistent logout behavior.  
**Fix (choose one approach):**  
- **A)** Add interceptor: `config.headers.Authorization = \`Bearer ${localStorage.getItem('token')}\``; or  
- **B)** Remove token from login response usage and use session-only + `Auth::logout()` on backend.

---

### BUG-005 — Logout may not clear web session
**Location:** `AuthController::apiLogout`  
**Issue:** Only `$request->user()->currentAccessToken()->delete()` — does not call `Auth::logout()` for session guard.  
**Symptom:** If session cookie still valid, `/api/user` might work after "logout" until cookie expires.  
**Fix:** Also `Auth::guard('web')->logout()` and invalidate session when using SPA cookies.

---

### BUG-006 — Event APIs lack role middleware
**Location:** `routes/api.php` — `events` routes under `auth:sanctum` only  
**Issue:** `POST /api/events`, `PATCH .../assign-centers`, `PATCH .../end` have **no** `role:evac_admin` middleware.  
**Symptom:** `evac_personnel` can create/end events via Postman even though UI hides Events menu.  
**Fix:** Wrap event routes in `middleware(['role:super_admin,evac_admin'])`.

---

### BUG-007 — Admit/scan requires assigned center for ALL roles including admin
**Location:** `EvacuationController` — `scan`, `verifyManual`, `admit`  
**Issue:** Checks `if (!$user->assigned_center_id)` for everyone including `evac_admin` / `super_admin`.  
**Symptom:** Admin without assigned center cannot admit at gate; must use personnel account or assign self a center.  
**Fix:** Allow admin to pass `center_id` in request OR auto-select when only one center assigned to event.

---

## Medium

### BUG-008 — Protected route redirects to landing, not login
**Location:** `src/components/ProtectedRoute.jsx`  
**Issue:** `if (!user) return <Navigate to="/" />` instead of `/login`.  
**Symptom:** Logged-out user hits `/dashboard` → public landing, not login page (extra click).  
**Fix:** `<Navigate to="/login" replace />`.

---

### BUG-009 — super_admin limited sidebar vs page permissions
**Location:** `src/components/SideBar.jsx`  
**Issue:** `super_admin` only sees Dashboard + Users in menu; does NOT see Households, Centers, Verification — but `HouseholdManagement` allows `isSuperAdmin()` for edit.  
**Symptom:** Super admin must type URLs manually to reach modules.  
**Fix:** Add `super_admin` to relevant `roles` arrays in `menuItems`.

---

### BUG-010 — super_admin excluded from creating alerts (UI)
**Location:** `src/pages/EvacuationAlerts.jsx` — `canCreate = isAdmin() \|\| isPersonnel()`  
**Issue:** `isSuperAdmin()` not included.  
**Symptom:** Super admin cannot create alerts from UI (API may still allow).  
**Fix:** `canCreate = isAdmin() || isSuperAdmin() || isPersonnel()`.

---

### BUG-011 — Misleading login error on server/DB failure
**Location:** `src/pages/Login.jsx` catch block  
**Issue:** Falls back to "Invalid User ID or Password" for any error (500, CORS, DB).  
**Symptom:** Hard to debug MySQL or CORS issues.  
**Fix:** If `!err.response` show "Cannot reach server"; if status 500 show server message.

---

### BUG-012 — Duplicate SESSION_DRIVER in `.env`
**Location:** Backend `.env`  
**Issue:** `SESSION_DRIVER=database` then later `SESSION_DRIVER=file` — last wins.  
**Symptom:** Confusing for team; if only first line read, sessions break without DB sessions table.  
**Fix:** Keep one line only.

---

### BUG-013 — Personnel can open `/events` via URL
**Location:** `src/App.jsx` — no route-level role guard  
**Issue:** Routes only wrapped in `ProtectedRoute`, not role-specific.  
**Symptom:** Personnel sees Event Management UI if they navigate directly (API may allow create — BUG-006).  
**Fix:** Add `RoleRoute` component or hide + API middleware.

---

## Low

### BUG-014 — Invalid HTML in Landing alert banner
**Location:** `src/pages/Landing.jsx`  
**Issue:** Uses `<center>` tag inside flex layout (deprecated HTML).  
**Fix:** Replace with `<div className="text-center w-full">`.

---

### BUG-015 — `roles.js` without safe parse fallback
**Location:** `src/utils/roles.js`  
**Issue:** `JSON.parse(localStorage.getItem("user"))` — if corrupted string, throws and breaks UI.  
**Fix:** try/catch or `|| "{}"` like Sidebar.

---

### BUG-016 — Public portal depends on external OSRM
**Location:** `src/pages/PublicPortal.jsx`  
**Issue:** Routing uses `routing.openstreetmap.de` — fails offline or if service down.  
**Symptom:** Falls back to straight line (handled) but user should see message.  
**Fix:** Document limitation; optional self-hosted OSRM.

---

## Configuration checklist (not code bugs)

| Item | Check |
|------|--------|
| `VITE_API_URL` matches running API | ☐ |
| MySQL running, `klint` exists | ☐ |
| `php artisan migrate` + `db:seed` done | ☐ |
| CORS + Sanctum domains include your Vite port | ☐ |
| Personnel users have `assigned_center_id` | ☐ |
| Centers assigned to active event before admit | ☐ |

---

## Suggested fix priority for dev team

1. BUG-001, BUG-002, BUG-003 (blocking login/logout/API)  
2. BUG-006, BUG-007 (security + operations)  
3. BUG-004, BUG-005 (auth consistency)  
4. BUG-008–BUG-011 (UX / roles)  

---

*Re-test after fixes using `docs/TEST-CASES.md`.*
