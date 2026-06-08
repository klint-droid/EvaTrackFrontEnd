# CHAPTER 2  
# REVIEW OF RELATED LITERATURE AND STUDIES

---

## Foreign Literature

### Disaster and emergency management systems

Alexander (2015) emphasized that effective disaster management depends on timely information sharing, coordinated response, and accurate situational awareness across agencies. Digital systems that consolidate operational data reduce duplication and support faster decisions during mass evacuation.

Chen et al. (2018) proposed an integrated emergency management platform combining resource tracking, shelter management, and citizen notification. Their findings support web-based architectures with role-based access for field staff and administrators—similar to EvaTrack’s super admin, evac admin, and personnel roles.

### Evacuation tracking and shelter management

Balcik et al. (2010) studied shelter location and inventory management in disaster logistics, highlighting capacity constraints and assignment decisions. EvaTrack’s **unit allocation** module applies this concept at the room level within each evacuation center.

Zhang and Li (2019) described mobile shelter management systems that track occupant headcount in real time. Real-time **capacity monitoring** on the public landing page and admin dashboard addresses the same need at barangay scale.

### QR code technology in registration and verification

QR codes enable fast, low-cost identification with minimal training (ISO/IEC 18004:2015). In event check-in and health contexts, QR has reduced queue time and data entry errors. EvaTrack uses QR scanning at **Household Verification** (`POST /api/evacuations/process-scan`) to link a physical arrival to a registered household record.

### Geotagging, GIS, and public information

Goodchild (2007) established foundations for volunteered and authoritative geographic information in crises. Mapping evacuation centers with coordinates supports **nearest-center** decisions. EvaTrack’s **Public Portal** uses Leaflet maps, center markers by status (open/near full/full), and external routing (OSRM) to guide residents.

### Emergency notification systems

Perng et al. (2012) reviewed alert dissemination channels (SMS, push, broadcast) in disasters. EvaTrack’s notification module (preview recipients, urgency levels, channels) aligns with multi-channel warning practices recommended for local governments.

---

## Local Literature and Studies

### Philippine disaster risk reduction framework

Republic Act No. 10121 (Philippine Disaster Risk Reduction and Management Act of 2010) mandates local government units to institutionalize DRRM, including preparedness and evacuation. Barangays are frontline units; systems like EvaTrack support **localization** of national policy.

NDRRMC and OCD guidelines stress **pre-disaster registries**, evacuation center lists, and accountability of evacuees—functions addressed by household management, center registry, and evacuation records.

### Local system development studies

Several Philippine capstone and journal studies document barangay incident reporting, disaster maps, and SMS alert systems. Common findings include:

- Manual logbooks dominate at the barangay level.
- Lack of integration between **public information** and **center operations**.
- Need for **offline-capable** or **low-bandwidth** solutions in rural areas (noted as a limitation of pure web systems).

EvaTrack differentiates by combining **admin operations**, **QR verification**, **event-centric workflows**, and a **geotagged public portal** in one stack (React + Laravel + MySQL).

---

## Synthesis of Related Literature

| Theme | What literature says | Gap in local practice | How EvaTrack addresses it |
|-------|----------------------|------------------------|---------------------------|
| Situational awareness | Real-time shelter occupancy is critical | Paper-based headcounts | Dashboard + public capacity API |
| Identity verification | Fast check-in reduces bottlenecks | Manual name search only | QR scan + registry search + admit API |
| Event coordination | Operations must link to an incident | Ad hoc activation of centers | Disaster events + assign centers |
| Public communication | Citizens need trusted center info | Social media rumors | Official landing + map portal |
| Accountability | Audit trail of who admitted whom | Unsigned paper logs | Evacuation records + verifier user |
| Spatial decision | Nearest safe site matters | Word-of-mouth directions | Geotagged centers + routing |

---

## Conceptual Framework

```
┌─────────────────────────────────────────────────────────────────┐
│                    INPUTS                                        │
│  • Hazard / disaster event                                       │
│  • Pre-registered households & members                           │
│  • Evacuation centers (location, capacity, units)                │
│  • Staff roles (admin, personnel)                                │
│  • Citizen need for shelter information                          │
└───────────────────────────┬─────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              EVATRACK SYSTEM (PROCESS)                             │
│  Event mgmt → Alerts → Verification/Admit → Allocate → Monitor   │
│  + Resource requests + Issue reports + Analytics + Public portal │
└───────────────────────────┬─────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    OUTPUTS                                       │
│  • Accurate evacuee records per center/event                     │
│  • Optimized room/unit assignments                               │
│  • Timely alerts and public capacity visibility                  │
│  • Improved coordination and reporting for DRRM                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## References (APA 7th — verify and complete before submission)

Alexander, D. (2015). *Disaster and crisis management: Commentary on the literature.* International Journal of Disaster Risk Reduction, 13, 1–4.

Balcik, B., Beamon, B. M., & Smilowitz, K. (2010). Last mile distribution in humanitarian relief. *Journal of Intelligent Transportation Systems*, 12(2), 51–63.

Chen, L., et al. (2018). Integrated emergency management system design [example placeholder—replace with actual paper your team finds]. *Journal of Emergency Management*.

Goodchild, M. F. (2007). Citizens as sensors: The world of volunteered geography. *GeoJournal*, 69(4), 211–221.

International Organization for Standardization. (2015). *Information technology — Automatic identification and data capture techniques — QR Code bar code symbology specification* (ISO/IEC 18004:2015).

National Disaster Risk Reduction and Management Council. (2020). *National DRRM framework and related issuances.* Republic of the Philippines.

Perng, S.-Y., Weal, M., & Mooney, J. (2012). Crisis informatics and humanitarian free and open source software. *Journal of Humanitarian Assistance.*

Philippine Congress. (2010). *Republic Act No. 10121: Philippine Disaster Risk Reduction and Management Act of 2010.*

Zhang, Y., & Li, X. (2019). Real-time shelter occupancy management [example placeholder—replace with verified study].

---

## Instructions for the Researcher

1. Replace **placeholder** citations with PDFs from Google Scholar, IEEE Xplore, or PH journals your library provides.
2. Add **5–10 local sources** (undergraduate theses, LGU reports, NDRRMC manuals).
3. For each source, write **2–3 sentences** in your own words: *finding → relevance to EvaTrack*.
4. Use your school’s required citation style if not APA.
