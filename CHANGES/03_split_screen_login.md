# Frontend Change Log: Split-Screen Login & Video Integration

This document details the complete design overhaul of `Login.jsx` to create a stunning, responsive two-column layout with background video capabilities and input alignment fixes.

---

## 1. Split-Screen Layout Architecture
* **File**: `src/pages/Login.jsx`
* **Change**:
  * Converted the old single-card layout into a modern grid structure (`grid grid-cols-1 md:grid-cols-12 min-h-screen`).
  * **Left Column (40% Width)**: Dedicated high-contrast white workspace focusing purely on input credentials, secure identity authorization, and error reporting.
  * **Right Column (60% Width)**: A premium dark mode panel `#081424` showcasing system logos, branding, and live telemetry insights to immediate command respect.

---

## 2. Integrated HTML5 Video Backdrop
* **File**: `src/pages/Login.jsx`
* **Change**:
  * Incorporated a fully responsive `<video>` element set to loop, play muted, and scale using `object-cover` with an overlay transparency layer (`bg-slate-950/40`) to preserve text legibility.
  * **CDN / Local Fallbacks**: Structured two `<source>` streams. The player looks for a local asset `/src/assets/login_bg.mp4` first. If not found, it immediately streams an abstract digital sci-fi network animation from a secure CDN so that the visual looks outstanding out-of-the-box.
  * **Telemetry Badge**: Added an active telemetry visual indicator `"Live Visual Feed Active"` under the stacked brand logo.

---

## 3. Polished Form Inputs & Alignments
* **File**: `src/pages/Login.jsx`
* **Change**:
  * **Internal Input Icons**: Added custom Lucide `User` (User ID) and `Lock` (Password) icons inside the left of the input fields, shifting placeholders elegantly with `pl-11`.
  * **Inherited Centering Fix**: Bypassed a global `#root { text-align: center; }` styling rule defined in `index.css` by explicitly adding `text-left` Tailwind utilities to the login title, labels, and forms. This ensures perfect, consistent left alignment across both fields under all viewports.
