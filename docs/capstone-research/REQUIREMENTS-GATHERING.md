# Requirements Gathering  
# EvaTrack / EvacConnect

---

## 1. Purpose

To collect functional and non-functional requirements from barangay officials, DRRM personnel, and evacuation center staff to ensure EvaTrack solves real operational problems.

---

## 2. Interview Guide (Semi-Structured)

**Respondent profile:** Name (optional), position, barangay, years in role, contact (optional).  
**Date / place / interviewer:**

### A. Current practices
1. What types of disasters does your barangay prepare for most often?
2. Walk us through what happens from **warning** to **evacuation** to **return home**.
3. How do you currently record families arriving at an evacuation center?
4. How do you know if a center is full or still accepting evacuees?
5. How are rooms/beds/areas assigned inside the center?
6. How do you request food, medicine, or supplies during an operation?
7. How do you report problems at the center (e.g., no water, overcrowding)?

### B. Problems and risks
8. What are the **top 3 difficulties** during peak evacuation?
9. Have you experienced lost, duplicate, or incomplete evacuee records? Examples?
10. How do residents find out which center to go to?

### C. Technology and acceptance
11. Do you use computers, smartphones, or paper logbooks during disasters?
12. Are staff willing to use a web system if training is provided?
13. Is QR code scanning acceptable for families? Any concerns (privacy, seniors)?
14. Is internet available at the center during disasters? Backup plan?

### D. Desired system features (show demo if available)
15. Which features seem **most useful**: events, alerts, QR admit, map portal, resource requests, analytics?
16. Who should be allowed to: create events, send alerts, admit families, assign rooms, manage users?
17. What reports does the barangay need after an event?

### E. Closing
18. What would make you **trust** this system in a real typhoon?
19. Anything else we should include?

---

## 2b. Survey Questionnaire (Short — Google Forms)

**Section 1 — Demographics**  
- Role: Resident / Barangay staff / DRRM / Center volunteer / Other  
- Age bracket  
- Barangay  

**Section 2 — Awareness (Likert 1–5)**  
- I know where my assigned evacuation center is.  
- I know how to check if a center is full.  
- I receive official evacuation warnings in time.  

**Section 3 — System acceptance (Likert 1–5)**  
- I would pre-register my household if the barangay provides it.  
- I am comfortable using QR for faster check-in.  
- A map showing nearest open centers would help my family.  

**Section 4 — Open-ended**  
- What is your biggest concern during evacuation?  

---

## 3. Sample Documented Findings (Template — replace with real data)

> **Note:** Fill this section after real interviews. Numbers below are **illustrative** for draft structure only.

### Summary of respondents
| # | Role | Experience | Date |
|---|------|------------|------|
| R1 | Barangay DRRM Coordinator | 5 years | ____ |
| R2 | Evacuation Center Head | 3 years | ____ |
| R3 | Barangay Secretary | 4 years | ____ |
| R4 | Center Volunteer | 2 years | ____ |

### Key findings (themes)

| Theme | Finding | Implication for EvaTrack |
|-------|---------|---------------------------|
| Recording | 4/4 use paper logbooks; queues form at entrance | Need fast search + QR admit |
| Capacity | Staff call each other by phone to ask if gym is full | Need real-time capacity on dashboard + public page |
| Events | No single “active disaster” record in digital form | Need **Event Management** module |
| Public info | Residents rely on Facebook; info is unreliable | Need official **Public Portal** + map |
| Supplies | Requests via phone tree; delays | Need **Resource Requests** module |
| Facilities | Issues written on informal notes | Need **Center Issue Reports** |
| Roles | Only few people should send mass alerts | Role-based access: admin vs personnel |
| Connectivity | Internet unstable during typhoon | Document limitation; future offline mode |

### Sample quote (appendix)
> *"Kapag dumami na ang tao, hindi na namin alam kung sino ang nauna at kung ilan na ang nasa loob."* — Center volunteer (R4)

---

## 4. Functional Requirements (derived from system + interviews)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-01 | System shall authenticate users by `user_id` and password | Must |
| FR-02 | System shall support roles: super admin, evac admin, personnel | Must |
| FR-03 | System shall register and manage households and members | Must |
| FR-04 | System shall create disaster events and assign evacuation centers | Must |
| FR-05 | System shall send evacuation alerts with urgency and channel | Must |
| FR-06 | System shall search/scan QR and admit households at assigned center | Must |
| FR-07 | System shall allocate admitted households to accommodation units | Must |
| FR-08 | System shall display center capacity (open/near full/full) publicly | Must |
| FR-09 | System shall show centers on map with routing | Should |
| FR-10 | System shall manage resource requests and issue reports | Should |
| FR-11 | System shall provide analytics dashboard | Should |
| FR-12 | System shall log verifier on each evacuation record | Must |

---

## 5. Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-01 | Web-based, accessible via modern browsers |
| NFR-02 | Response time &lt; 3 seconds for search/admit under normal LAN |
| NFR-03 | Role-based authorization on all sensitive APIs |
| NFR-04 | Passwords stored hashed (bcrypt) |
| NFR-05 | Audit trail via evacuation records and timestamps |
| NFR-06 | Configurable notification providers |

---

## 6. Appendix checklist for researcher

- [ ] Consent form signed/scanned  
- [ ] Interview audio/notes filed  
- [ ] Survey export (CSV) from Google Forms  
- [ ] Requirements traceability matrix (requirement → feature → test case)  
- [ ] Adviser approval on instrument before data collection  
