# 🧠 BIDSHIELD PROJECT BRAIN & ARCHITECTURE COMPASS

> **CRITICAL REFERENCE FOR FUTURE AGENTS & SESSIONS**  
> This file contains the complete architectural map, core business logic, strict invariants ("what NOT to break"), safe modification areas, and operational commands for **BidShield** (Government & PSU Statutory Compliance & Procurement Risk Assessment Portal for CPCL / GeM).

---

## 📌 Executive Summary & Architecture Overview

* **Product:** BidShield — an automated statutory verification and procurement fraud prevention portal tailored for Indian PSUs (Chennai Petroleum Corporation Limited - CPCL / GeM).
* **Dual Portals:**
  1. **Auditor / Officer Portal (`/` or `/officer`):** Allows procurement officers to inspect registered bidders, verify GST/PAN/Udyam certificates, detect statutory discrepancies, review blacklisted entities, inspect live tenders, and track audit logs.
  2. **Vendor / Bidder Portal (`/vendor` or `/user`):** Allows suppliers (e.g., Apex Petrochem, Bharat High-Pressure) to manage profile details, upload & verify statutory certificates with real-time OCR checks, preview & download files, and submit official quotations on open procurement tenders.
* **Dual Runtime Architecture:**
  * **Local Development:** Vite React SPA (`client/`, port 3000) + Express/Node server with Prisma & SQLite (`server/`, port 5000).
  * **Cloudflare Production:** Deployed to [https://bidshield.pages.dev](https://bidshield.pages.dev). Frontend SPA + Cloudflare Pages Functions (`client/functions/api/[[route]].js`) querying a remote **Turso LibSQL** database with identical tables.
  * **GitHub Repository:** [`snuthon1/gemcompliance`](https://github.com/snuthon1/gemcompliance) on branch `main`.

---

## 🗂️ Complete Directory & File Map

```
C:\Users\Bhavya Panchal\Desktop\snuthon\
├── PROJECT_BRAIN.md                     # << THIS MASTER BRAIN FILE >>
├── tools\node-v20.18.0-win-x64\         # Pre-installed Node.js v20 runtime (use $env:Path)
│
├── client\                              # Frontend React 18 + Vite + TailwindCSS
│   ├── index.html                       # HTML root with government aesthetic fonts
│   ├── vite.config.js                   # Vite dev server config (proxies /api to port 5000)
│   ├── tailwind.config.js               # Design tokens (navy #0B2546, gold, emerald, rose)
│   ├── package.json                     # Frontend dependencies (lucide-react, etc.)
│   ├── dist\                            # Production build artifact (deployed to Cloudflare)
│   ├── functions\api\[[route]].js       # Serverless Cloudflare Worker API connected to Turso
│   └── src\
│       ├── App.jsx                      # Root Router & Auth Context provider
│       ├── main.jsx                     # Entry mount
│       ├── components\
│       │   ├── Navbar.jsx               # Top government banner with Ashoka Emblem, role indicator
│       │   ├── Sidebar.jsx              # Officer left sidebar (Bidders, Tenders, Blacklist, Analytics)
│       │   └── NationalEmblem.jsx       # SVG / Styled emblem component
│       ├── pages\
│       │   ├── Dashboard.jsx            # Officer Dashboard (Tenders & Bids landing, Bidder directory)
│       │   ├── BidderDetail.jsx         # Officer In-Depth Company Inspection & Manual Verification
│       │   ├── UserDashboard.jsx        # Vendor Portal (Overview, Profile, Vault, Apply for Bids)
│       │   ├── BlacklistDirectory.jsx   # Dedicated portal for debarred/blacklisted firms
│       │   ├── Analytics.jsx            # Procurement & risk distribution metrics
│       │   └── Login.jsx                # Multi-role authentication (Officer / Vendor selector)
│       └── utils\
│           └── documentScanner.js       # Client-side OCR fallback & entity extraction for certificates
│
└── server\                              # Local Node.js / Express API
    ├── server.js                        # Express server entry point (port 5000)
    ├── package.json                     # Express, Prisma, Multer, etc.
    ├── prisma\
    │   ├── schema.prisma                # SQLite schema (Bidder, Document, Tender, Bid, Blacklist, AuditLog)
    │   └── dev.db                       # Local SQLite database file
    └── routes\
        ├── bidders.js                   # /api/bidders CRUD, compliance evaluation, documents, audit-log
        ├── tenders.js                   # /api/tenders, bid submission, award contract
        ├── blacklist.js                 # /api/blacklist (Ministry/GeM debarred entities list)
        └── auth.js                      # /api/auth login & session verify
```

---

## 🛑 CORE INVARIANTS ("WHAT NOT TO BREAK")

### 1. Scoring & Risk Rules (Hackathon Panel Invariant)
* **Apex Petrochem (`apex-petrochem`):** MUST evaluate as **100/100, Low Risk, Compliant**. All mandatory documents (GST, PAN, Udyam) match statutory records without discrepancies.
* **Bharat High-Pressure Piping (`bharat-pipes`):** MUST evaluate as **85/100, Medium Risk, Needs Clarification**.
  * *Reason:* Has a minor name spelling discrepancy between PAN card and GST certificate ("Bharat High-Pressure Piping Pvt Ltd" vs "Bharat High Pressure Piping Ltd"). The `NAME_MATCH` rule applies a 15-point deduction.
  * **DO NOT** downgrade Bharat to 55 or "High Risk, Non-Compliant" — 85/100 Medium Risk is verified and expected by the evaluation panel.
* **Blacklisted / Debarred Companies:** If a company or director is present in `BlacklistedEntity`, compliance MUST return **0-20/100, High Risk, Non-Compliant** with flag `BLACKLISTED_ENTITY`.

### 2. Tender Bidding State Invariants (Vendor Portal)
* **Never show active `Apply Bid` on closed or awarded tenders:**
  * If the vendor already submitted a bid: Show quotation amount (`formatINR(bid_amount)`) and status (`🏆 Contract Awarded` or `✓ Bid Submitted (Under Review)`), with a `View Bid` button.
  * If tender status is not `Open` or deadline has expired: Show `Bidding Closed (Awarded/Closed)`, NEVER an apply button.
  * If mandatory documents are missing (`!hasAllMandatoryDocs`): Disable quotation submission and prompt `Upload Docs to Bid`.
  * Show active `Apply Bid ↗` **ONLY** when tender is genuinely `status === 'Open'`, deadline is in the future, and vendor has not bid yet.

### 3. Database Schema & Field Name Parity
* **Tender Value:** The column is named **`estimated_value`** (Float/Int). **Do not** assume `estimated_value_inr` or `budget`. Always use:
  ```javascript
  const val = tender.estimated_value || tender.estimated_value_inr || tender.budget || 0;
  ```
* **Deadlines:** `submission_deadline` is stored as an epoch timestamp (numeric string or BigInt ms). Always parse safely:
  ```javascript
  const formatDate = (val) => {
    if (!val) return '—';
    const num = Number(val);
    const d = !isNaN(num) && num > 1000000000 ? new Date(num) : new Date(val);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  ```
* **Cloudflare Turso Parity:** Whenever modifying backend database queries in `server/routes/`, ensure matching logic exists in `client/functions/api/[[route]].js` so Cloudflare production stays in sync.

### 4. Role Navigation Defaults
* **Procurement Officer Login:** Lands by default on **Tenders & Bids** section of `Dashboard.jsx`, with sidebar links to Bidders, Blacklist, Analytics, and Audit Logs.
* **Vendor Login:** Lands on `UserDashboard.jsx` with four streamlined navigation tabs:
  1. `overview`: Profile card, compliance score gauge, active procurement tenders, audit trail.
  2. `profile`: Official enterprise credentials, contact signatory details, banking info.
  3. `docs`: Statutory Vault — upload new documents, view OCR extracted metadata, preview certificate image/base64, and download raw certificate text.
  4. `apply`: Active Tenders Catalog and Submitted Quotations Ledger.

---

## 🎨 DESIGN SYSTEM & UI GUIDELINES

* **Typography & Brand:** Clean, authoritative, government-grade PSU design. Avoid neon/cyberpunk aesthetics.
  * Primary brand navy: `#0B2546` (dark navy header and action buttons)
  * Secondary slate: `#1E293B` / `#334155`
  * Accents: Emerald (`#10B981`) for Verified/Low Risk, Amber (`#F59E0B`) for Medium Risk/Warnings, Rose (`#EF4444`) for Debarred/High Risk.
* **Card Density:** Keep summary statistics compact and cleanly spaced. Avoid oversized empty boxes or redundant metrics.

---

## 🛠️ WHAT CAN BE SAFELY MODIFIED / EXTENDED

1. **New Bidders or Tenders:** Add new mock records to Turso / SQLite using Prisma or LibSQL queries.
2. **Additional Document Types:** Adding support for ISO certificates, Factory Licenses, or ITR acknowledgments in `MANDATORY_DOCS` array.
3. **Analytics Visualizations:** Enhance charts in `client/src/pages/Analytics.jsx` (e.g., procurement spend by category, risk distribution over time).
4. **Export Options:** Adding CSV or PDF export functions for the statutory audit ledger and bidder compliance certificates.
5. **OCR Parsing Heuristics:** Adding new document format regex rules in `client/src/utils/documentScanner.js`.

---

## 🚀 STANDARD OPERATIONAL COMMANDS

### Environment Setup (Always run in PowerShell)
```powershell
$nodeDir = "C:\Users\Bhavya Panchal\Desktop\snuthon\tools\node-v20.18.0-win-x64"
$env:Path = "$nodeDir;$env:Path"
```

### Running Local Development
```powershell
# 1. Run local Express server (port 5000)
cd "C:\Users\Bhavya Panchal\Desktop\snuthon\server"
node server.js

# 2. Run Vite client (port 3000)
cd "C:\Users\Bhavya Panchal\Desktop\snuthon\client"
npx vite --host 127.0.0.1 --port 3000
```

### Building & Deploying to Production (Cloudflare Pages)
```powershell
# 1. Build Vite frontend
cd "C:\Users\Bhavya Panchal\Desktop\snuthon\client"
npm run build

# 2. Deploy to Cloudflare Pages (bidshield.pages.dev)
$env:CLOUDFLARE_API_TOKEN = "cfat_mbNSa5bRrSRmFqrskuQNZQcJzNYEhOaWGXGFPFha818b09a9"
$env:CLOUDFLARE_ACCOUNT_ID = "140e2fc159bb65fe6f9b1873ef52a9c4"
npx wrangler pages deploy dist --project-name bidshield --branch main
```

### Syncing to GitHub Repository
```powershell
node "C:\Users\Bhavya Panchal\.gemini\antigravity\brain\cf9bd1bb-eec0-43ea-b711-e4442e0b276c\scratch\sync_to_github.js"
```
*(Syncs directly to `https://github.com/snuthon1/gemcompliance` using the personal access token).*
