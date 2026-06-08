# CHAPTER 1  
# INTRODUCTION

> **Project title (suggested):** EvaTrack: A Web-Based Evacuation Center Management and Disaster Response System with Real-Time Capacity Monitoring, QR-Enabled Household Verification, and Geotagged Public Portal  
> **Also branded in UI as:** EvacConnect (admin dashboard)  
> **Replace:** university name, barangay name, adviser, date, and group members.

---

## Background of the Study

The Philippines is among the most disaster-prone countries in the world, facing typhoons, floods, landslides, and other hazards that displace communities at the barangay level (National Disaster Risk Reduction and Management Council [NDRRMC], 2020). Barangay officials and Disaster Risk Reduction and Management (DRRM) personnel are responsible for pre-disaster preparedness, evacuation, and accounting for evacuees at designated evacuation centers.

Many barangays still rely on **manual processes**: paper logbooks, spreadsheets, phone calls, and social media posts to track evacuee arrivals, center capacity, and resource needs. These methods are slow, error-prone, difficult to audit, and do not provide citizens with reliable real-time information about which centers are open or full.

Recent advances in **web technologies**, **QR codes**, **geographic information systems (GIS)**, and **mobile notifications** enable digital evacuation management systems. However, locally deployable systems that integrate **household registration**, **center operations**, **event-based disaster response**, **alerts**, and a **public-facing map portal** remain limited at the grassroots level.

This study develops **EvaTrack** (EvacConnect admin module), a web-based system designed to support barangay-level evacuation operations from disaster declaration through evacuee admission, room allocation, resource tracking, and public information dissemination.

---

## Statement of the Problem

Barangay DRRM teams and evacuation center personnel encounter the following problems during disaster operations:

1. **Delayed and inaccurate evacuee tracking** — Manual registration at center entrances causes long queues and duplicate or missing records.
2. **No real-time visibility of center capacity** — Command staff and the public cannot easily see which centers are open, near full, or full.
3. **Weak linkage between disaster events and center operations** — Active incidents are not consistently tied to which centers are activated and which households are admitted under that event.
4. **Inefficient verification of households** — Identifying pre-registered families at the gate is slow without digital search or QR scanning.
5. **Poor coordination of resources and facility issues** — Requests for supplies and reports of center problems are not centralized.
6. **Limited public access to actionable information** — Residents lack an official channel to find the nearest suitable evacuation center with routing support.

**General Problem:** How can barangay-level disaster response teams efficiently manage evacuation center operations and provide timely information to the public during emergencies?

**Specific Problem:** How can a web-based system integrate household verification, evacuation event management, real-time capacity monitoring, geotagged center discovery, and role-based administration to improve evacuation operations?

---

## Objectives of the Study

### General Objective
To design, develop, and evaluate a web-based evacuation center management and disaster response system (EvaTrack) for barangay-level operations.

### Specific Objectives
1. To analyze the **current evacuation management process** and identify operational gaps through interviews with barangay officials and DRRM personnel.
2. To review **related literature and systems** on disaster management, evacuation tracking, QR technology, geotagging, and emergency response.
3. To gather and document **functional and non-functional requirements** from target end users.
4. To design and implement a system that supports:
   - role-based admin access (super admin, evacuation admin, center personnel);
   - disaster **event** creation and center assignment;
   - **evacuation alerts** to affected populations;
   - **household registration** and **QR/manual verification** at centers;
   - **admission** and **accommodation unit allocation**;
   - **resource requests** and **center issue reporting**;
   - **analytics dashboard** for command monitoring;
   - **public portal** with geotagged centers and routing.
5. To **test and evaluate** the system using ISO/IEC 25010-inspired criteria (functionality, usability, reliability) with selected users.

---

## Scope and Limitations

### Scope
- Web application with **React (Vite)** frontend and **Laravel REST API** backend.
- MySQL database for households, members, centers, units, evacuation records, events, alerts, resources, and issues.
- Target users: **barangay DRRM/admin**, **evacuation center personnel**, and **general public** (read-only portal).
- Geographic scope: configurable for a **specific barangay/municipality** (PSGC address hierarchy in database).
- Features within system routes: dashboard, user management, events, alerts, household management, household verification, evacuation centers, resource requests, center issue reports, analytics, public landing and map portal.

### Limitations
- Requires **internet connectivity** and running API/database servers during operations.
- **SMS/push notifications** depend on third-party services (e.g., OneSignal, TextBee) configured in the backend; delivery is not guaranteed in all network conditions.
- **QR adoption** assumes households are pre-registered; walk-in registration is supported but still needs staff intervention.
- System does **not** replace national NDRRMC command systems; it is intended for **local/barangay** operations.
- **Hardware** (QR scanners, printers, tablets) is not provided by the study.
- Evaluation sample size and duration are limited to the capstone timeline.

---

## Significance of the Study

### To barangay officials and DRRM personnel
Provides a centralized tool to declare events, activate centers, send alerts, monitor occupancy, and coordinate resources.

### To evacuation center staff
Speeds up household lookup, QR verification, admission, and room assignment with fewer recording errors.

### To residents and evacuees
Offers a public portal to view center status and find directions to the nearest open center.

### To researchers and future developers
Contributes a documented local implementation model integrating QR, geotagging, and event-based evacuation workflows.

### To the institution (capstone)
Demonstrates application of software engineering, database design, and user-centered requirements in a socially relevant domain.

---

## Definition of Terms

| Term | Definition |
|------|------------|
| **EvaTrack / EvacConnect** | The evacuation management system; public branding and admin dashboard naming used in the project. |
| **Evacuation center** | A designated facility (school, gym, etc.) that shelters evacuees. |
| **Household** | A family group registered in the system with a head and members. |
| **Evacuation event** | A declared disaster incident with start/end time and linked centers. |
| **Evacuation record** | A record that a household has been admitted/verified at a center during an operation. |
| **Unit allocation** | Assignment of an admitted household to a specific room/unit inside a center. |
| **DRRM** | Disaster Risk Reduction and Management. |
| **QR code** | Quick Response code used to identify a household for fast verification. |
| **Geotagging** | Storing latitude/longitude of centers for map display and routing. |

---

*Continue to Chapter 2 and 3 in companion files. Insert List of Figures/Tables per school format.*
