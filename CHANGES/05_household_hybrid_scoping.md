# System Architecture: Household Hybrid Security Scoping

This document outlines the **Global Search (Read-Only) + Local Action (Write-Scoped)** hybrid scoping paradigm engineered for household management. This ensures that personnel can view households evacuated to other centers to facilitate family reunification, but are strictly prohibited from performing write/edit operations outside their assigned center.

---

## 1. Backend Protection (`HouseholdController.php`)
* **Index & Show Actions (`index()`, `show()`)**:
  * Removed the hard center siloing limits for `evac_personnel`.
  * Personnel can now query and fetch household records across **all evacuation centers** in the system, or look up details for any household.
* **Write Security (`update()`)**:
  * Added a server-side operational guard:
    ```php
    if ($user->isEvacPersonnel()) {
        $evacuation = $household->currentEvacuation()->first();
        $centerId = $evacuation ? $evacuation->center_id : null;
        if ($centerId !== $user->assigned_center_id) {
            return response()->json(['message' => 'Unauthorized. You can only edit households evacuated to your assigned center.'], 403);
        }
    }
    ```
  * Ensures that no manual API mutations or automated requests can bypass security parameters.

---

## 2. Frontend Safeguards

### A. Household Status Board (`HouseholdManagement.jsx`)
* **Global Visibility**: Displays all active and inactive households across the system.
* **Role Scoped Interactions**:
  * Admins and Super Admins retain complete system-wide editing powers.
  * Personnel see the **"Edit"** action styled dynamically. If a household is checked into a center other than their own, the action is disabled (`cursor-not-allowed opacity-40`) and displays a tooltip: `"Read-Only: Managed by assigned center"`.

### B. Profile Detailed Panel (`HouseholdDetail.jsx`)
* **Scoping Verification**:
  * Evaluates household context and determines if the current profile is manageable.
  * If the household belongs to another center, the entire member management toolkit (Add Member, Edit Member, Remove Member, and Evacuee Verification Statuses) is automatically switched to a read-only state.
