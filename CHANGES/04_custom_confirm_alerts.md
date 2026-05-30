# Frontend Change Log: Reusable Custom Alert & Confirm Modals

This document details the creation and integration of the reusable **AlertConfirmModal** designed to replace ugly default browser dialogs (`window.alert()` and `window.confirm()`) that pop up with `"localhost says"`.

---

## 1. Reusable AlertConfirmModal Component
* **File**: [AlertConfirmModal.jsx](file:///c:/CAPSTONE/EvaTrackFrontEnd/src/components/AlertConfirmModal.jsx)
* **Design & Features**:
  * **Dynamic Status Modes**: Supports four custom styled modes:
    * `"danger"`: Red theme (perfect for deletions, styled with a soft animated bouncing Lucide `Trash2` icon).
    * `"warning"`: Orange/Amber theme (for soft cautions, utilizing Lucide `AlertTriangle`).
    * `"success"`: Emerald Green theme (for success alerts, utilizing Lucide `CheckCircle2`).
    * `"info"`: Blue theme (for informational dialogs, utilizing Lucide `Info`).
  * **Aesthetic Backdrop**: Styled with a deep slate translucent overlay (`bg-slate-900/60`) and a smooth, realistic glassmorphic blur backdrop (`backdrop-blur-sm`).
  * **Micro-Animations**: Features zoom-in pop-up scale entries (`zoom-in-95 transform scale-100 transition-all duration-300`) to guarantee an extremely high-end, responsive feel.
  * **State Integration**: Bundles an asynchronous `isLoading` state which renders a spinning CSS loading icon inside the confirm buttons and locks clicks while background calls are pending.

---

## 2. User Management Deletion Overhaul
* **File**: [UserManagement.jsx](file:///c:/CAPSTONE/EvaTrackFrontEnd/src/pages/UserManagement.jsx)
* **Changes**:
  * **Before**: Deleting a personnel record prompted a native browser `confirm("Are you sure you want to delete this user?")` popup.
  * **After**:
    * Triggering a deletion opens the state-driven `<AlertConfirmModal>` with custom messages tailored to system roles.
    * Tracks visual deletion processing using inline spinner buttons.
    * Once verified, triggers the backend controller securely and closes smoothly.
