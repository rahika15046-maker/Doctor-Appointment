# 🏥 MEDORA Hospital — Enterprise Single-Hospital Healthcare Platform

[![Build Status](https://img.shields.io/badge/Build-Passing-emerald?style=for-the-badge&logo=vite)](https://github.com/rahika15046-maker/Doctor-Appointment)
[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18-cyan?style=for-the-badge&logo=react)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20Ready-darkgreen?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Tests](https://img.shields.io/badge/Tests-100%25%20Passing-brightgreen?style=for-the-badge&logo=jest)](https://github.com/rahika15046-maker/Doctor-Appointment)
[![Concurrency](https://img.shields.io/badge/Slot%20Lock-HTTP%20409%20Atomic-blueviolet?style=for-the-badge)](https://github.com/rahika15046-maker/Doctor-Appointment)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

---

## 📌 Executive Summary & Clinical Mission

**MEDORA Hospital** is a modern, single-hospital web platform engineered specifically for **Medora Hospital** — an accredited multi-specialty healthcare institution. Unlike doctor marketplaces, multi-clinic aggregators, or third-party discovery apps, MEDORA is dedicated exclusively to Medora Hospital's clinical departments, board-certified physicians, and patients.

All clinical facilities, doctors, appointment scheduling schedules, surgical consults, inpatient/outpatient admissions, and diagnostic lab reports belong strictly to **Medora Hospital**.

### Key Architectural Tenets:
1. **Single-Hospital Domain**: Zero third-party marketplace clutter, zero GPS/geolocation prompts, zero arbitrary city filters. Every doctor and department is physically or digitally connected to Medora Hospital.
2. **Predictable Session Pricing in Indian Rupees (₹)**: Transparent, flat session fees with automated discounts on clinical follow-ups. No ambiguous per-minute charges.
3. **Atomic Slot Reservation & Concurrency Lock**: Backend database-level slot reservation that eliminates race conditions and double bookings. If two patients attempt to book the identical slot simultaneously, the transaction commits atomically for the first patient (HTTP 201) and issues an immediate, friendly HTTP 409 Conflict with auto-slot refresh for the competing patient.
4. **Comprehensive 6-Step Clinical Booking Journey**: Service Selection ➔ Doctor Selection ➔ Consultation Mode (In-Person OPD vs Encrypted Video) ➔ Date & Slot Picker ➔ Patient Notes & Lab Report Upload ➔ Review & Instant Reference Lock (`MED-YYYY-XXXXXXXX`).
5. **Dual Database Engine**: Operates seamlessly with production MongoDB Atlas or an embedded zero-setup in-memory data engine seeded with Priya Sharma, 8 doctors, appointments, medical records, notifications, and 10 hospital departments.

---

## 🖼️ User Interface & Platform Overview

The Medora user interface was built to meet pixel-perfect hospital design specifications with 3D volumetric visual accents, responsive layouts, accessible contrast, and fluid modal workflows.

![Medora Healthcare Platform Interface](docs/screenshots/medora-ui-overview.jpg)

*Figure 1: Medora Hospital Clinical Web Platform — Landing Page, Authentication, 6-Step Booking Flow, Patient Dashboard, My Appointments with Year Filtering, and Confirmation Modals.*

---

## 🏗️ 1. System Architecture

```mermaid
flowchart TD
    subgraph Client ["Frontend Architecture (React 18 + Redux Thunk + Vite)"]
        UI[Responsive UI Layer / Tailwind CSS]
        Nav[Navbar & Global Routing]
        HeroSec[Hero & Department Badges]
        SrvSec[Hospital Services Directory]
        DocDir[Medora Doctors Directory]
        BookWiz[6-Step Booking Wizard]
        Dash[Patient Dashboard & Stats]
        ApptList[My Appointments & Year Filter]
        ReduxStore[(Redux Store)]
        APIService[Axios API Client / Interceptors]

        UI --> Nav & HeroSec & SrvSec & DocDir & BookWiz & Dash & ApptList
        Nav & DocDir & BookWiz & Dash & ApptList --> ReduxStore
        ReduxStore --> APIService
    end

    subgraph Transport ["Secure Transport & Session Layer"]
        HTTP[HTTPS REST APIs / Credentials Mode]
        Cookies[HTTP-Only JWT Cookie / Bearer Token]
    end

    subgraph Server ["Backend Architecture (Node.js + Express.js)"]
        Middleware[Security Middleware: Helmet / CORS / Rate-Limit]
        AuthMW[Auth Middleware / Token Verification]
        Router[Centralized Express Router /api]
        AuthCtrl[Auth Controller & Bcrypt]
        DocCtrl[Doctor & Department Controller]
        SrvCtrl[Hospital Services Controller]
        ApptCtrl[Appointment Controller]
        SlotService[Atomic Slot Reservation Engine]

        Middleware --> Router
        Router --> AuthMW
        AuthMW --> AuthCtrl & DocCtrl & SrvCtrl & ApptCtrl
        ApptCtrl --> SlotService
    end

    subgraph Storage ["Data Persistence Engine"]
        EngineRouter{Engine Router: MONGODB_URI?}
        MongoAtlas[(MongoDB Atlas / Replica Set)]
        InMemory[(Medora Resilient In-Memory DB)]

        SlotService & DocCtrl & SrvCtrl & AuthCtrl --> EngineRouter
        EngineRouter -- "Configured" --> MongoAtlas
        EngineRouter -- "Fallback / Dev" --> InMemory
    end

    APIService -->|JSON / multipart-form| HTTP
    HTTP --> Middleware
    Cookies -.->|Session Token| AuthMW
```

---

## 🔐 2. Patient Registration & Authentication Flow

```mermaid
sequenceDiagram
    autonumber
    actor Patient
    participant UI as Medora Auth Modal
    participant API as /api/auth/register
    participant DB as Medora DB Engine

    Patient->>UI: Enter Full Name, Email, Phone, Password, Confirm Password
    UI->>UI: Client-Side Validation (Strength meter, matching passwords, phone regex)
    
    alt Validation Failed
        UI-->>Patient: Display inline error message (e.g. "Passwords must match")
    else Validation Successful
        UI->>API: POST /api/auth/register { name, email, phone, password }
        API->>DB: User.findOne({ email })
        
        alt Duplicate Email Exists
            DB-->>API: Existing user record found
            API-->>UI: HTTP 409 Conflict: "Email already registered"
            UI-->>Patient: Display "Email already registered. Please login instead."
        else Unique Email
            API->>API: bcrypt.hash(password, 10)
            API->>DB: User.create({ name, email, phone, passwordHash, role: 'PATIENT' })
            DB-->>API: Saved User Document (ID, Name, Email)
            API->>API: Generate signed JWT (Expires in 7 days)
            API-->>UI: HTTP 201 Created + Set-Cookie: token (httpOnly)
            UI->>Patient: Instant login success notification & redirect to Dashboard
        end
    end
```

---

## 🩺 3. Hospital Services & Medora Doctor Discovery Flow

```mermaid
flowchart LR
    Start([Patient visits Medora Website]) --> Browse{"Browse Mode"}
    
    Browse -->|Explore Departments| ServicesPage["/services (Hospital Services)"]
    Browse -->|Find by Doctor Name| DoctorsPage["/our-doctors (Medora Doctors)"]

    subgraph ServiceFlow ["Hospital Services Discovery"]
        ServicesPage --> ViewCards["10 Accredited Departments\n(Cardiology, Neurology, Pediatrics, etc.)"]
        ViewCards --> SrvDetail["Service Overview, Clinical Benefits & ₹ Session Rates"]
        SrvDetail --> FilterDoc["Click 'Consult Specialist'"]
    end

    subgraph DoctorFlow ["Medora Doctors Directory"]
        DoctorsPage --> FilterBar["Filter by Medora Department & Search Name"]
        FilterDoc --> FilterBar
        FilterBar --> DocList["Medora Doctors Grid (Hospital: Medora Hospital)"]
        DocList --> ViewProfile["Doctor Profile Modal\n(Experience, Credentials, Rating, Availability)"]
        ViewProfile --> StartBooking["Initiate Booking Flow with Doctor Pre-Selected"]
    end

    StartBooking --> BookingWiz["6-Step Booking Wizard"]
```

---

## 📅 4. 6-Step Appointment Booking Workflow

```mermaid
stateDiagram-v2
    [*] --> Step1_ServiceSelection
    Step1_ServiceSelection --> Step2_DoctorSelection: Select Hospital Department / Service
    Step2_DoctorSelection --> Step3_ConsultationMode: Select Board-Certified Medora Doctor
    Step3_ConsultationMode --> Step4_DateTimeSlots: Choose In-Person OPD or Encrypted Video
    Step4_DateTimeSlots --> Step5_DetailsAndReports: Pick Calendar Date & Live Available Slot
    Step5_DetailsAndReports --> Step6_ReviewAndLock: Enter Reason, Medical History & Upload Reports
    
    state Step6_ReviewAndLock {
        [*] --> CheckFee: Dynamic Fee Calculation (First Visit ₹1000 vs Follow-Up ₹600/₹700)
        CheckFee --> ReviewSummary: Review Patient Info, Doctor & Slot
        ReviewSummary --> SubmitLock: Click 'Confirm & Book Appointment'
    }

    Step6_ReviewAndLock --> BookingSuccess: Atomic Slot Lock (HTTP 201)
    Step6_ReviewAndLock --> Step4_DateTimeSlots: Slot Conflict (HTTP 409) -> Auto Refresh Slots
    BookingSuccess --> [*]: Reference ID Generated (MED-YYYY-XXXXXXXX)
```

---

## ⚡ 5. Simultaneous Booking Concurrency & Double-Booking Prevention

```mermaid
sequenceDiagram
    autonumber
    actor Patient_A as Patient A (Aarav)
    actor Patient_B as Patient B (Rohit)
    participant Server as Medora Backend Router
    participant Service as Appointment Service (claimSlot)
    participant SlotDB as Slots & Appointment DB

    Note over Patient_A,Patient_B: Both patients select Dr. Sarah Johnson on 2026-11-06 at 10:00 AM (Slot #S101)

    par Simultaneous Requests Arrive
        Patient_A->>Server: POST /api/appointments { doctorId, slotId: "S101", ... }
        Patient_B->>Server: POST /api/appointments { doctorId, slotId: "S101", ... }
    end

    Note over Server,SlotDB: Atomic Claim Execution (Atomic findOneAndUpdate / Mutex Lock)

    critical Slot S101 Acquisition
        Server->>Service: claimSlot("S101", patientA.id)
        Service->>SlotDB: findOneAndUpdate({ _id: "S101", status: "AVAILABLE" }, { status: "BOOKED", bookedBy: patientA.id })
        SlotDB-->>Service: Updated Slot Document (Status: BOOKED)
        Service-->>Server: Claim SUCCESS (Patient A)
        Server->>SlotDB: Appointment.create({ referenceId: "MED-2026-0B1017CC", ... })
        Server-->>Patient_A: HTTP 201 Created { referenceId: "MED-2026-0B1017CC", status: "CONFIRMED" }
    option Competing Claim by Patient B
        Server->>Service: claimSlot("S101", patientB.id)
        Service->>SlotDB: findOneAndUpdate({ _id: "S101", status: "AVAILABLE" }, { status: "BOOKED", bookedBy: patientB.id })
        SlotDB-->>Service: NULL (Slot is no longer AVAILABLE)
        Service-->>Server: Claim FAILED (Slot already occupied)
        Server-->>Patient_B: HTTP 409 Conflict: "Slot already reserved. Please select another time."
    end

    Patient_A->>Patient_A: Shows Booking Success Modal with Reference ID & Email Confirmation
    Patient_B->>Patient_B: Shows Warning Alert & Instantly Refreshes Available Slots for that Date
```

---

## 🗄️ 6. Database Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    USER ||--o{ APPOINTMENT : books
    USER ||--o{ MEDICAL_RECORD : owns
    USER ||--o{ NOTIFICATION : receives
    DOCTOR ||--o{ APPOINTMENT : attends
    DOCTOR ||--o{ AVAILABILITY_SLOT : schedules
    SERVICE ||--o{ DOCTOR : employs
    SERVICE ||--o{ APPOINTMENT : categorizes
    APPOINTMENT ||--|| AVAILABILITY_SLOT : occupies

    USER {
        ObjectId _id PK
        string name
        string email UK
        string phone
        string passwordHash
        string role "PATIENT | DOCTOR | ADMIN"
        string bloodGroup
        string dateOfBirth
        string gender
        string avatar
        boolean isActive
        date createdAt
    }

    DOCTOR {
        ObjectId _id PK
        string name
        string email UK
        string phone
        string hospital "Medora Hospital"
        string designation "Senior Consultant | HOD"
        string department
        string specialization
        number experienceYears
        number rating
        number reviewCount
        number firstVisitFee "INR ₹"
        number followupFee "INR ₹"
        string[] servicesOffered
        string bio
        string avatar
        boolean isAvailable
    }

    SERVICE {
        ObjectId _id PK
        string name
        string department
        string category
        string description
        string overview
        string[] benefits
        number startingPrice "INR ₹"
        string icon
        boolean isActive
    }

    AVAILABILITY_SLOT {
        ObjectId _id PK
        ObjectId doctorId FK
        string date "YYYY-MM-DD"
        string startTime "HH:mm"
        string endTime "HH:mm"
        string status "AVAILABLE | BOOKED | BLOCKED"
        ObjectId bookedBy FK
    }

    APPOINTMENT {
        ObjectId _id PK
        string referenceId UK "MED-YYYY-XXXXXXXX"
        ObjectId patientId FK
        ObjectId doctorId FK
        ObjectId serviceId FK
        string serviceName
        date startAt
        date endAt
        string consultationType "IN_PERSON | ONLINE"
        number consultationFee "INR ₹"
        boolean isFollowup
        string status "CONFIRMED | PENDING | COMPLETED | CANCELLED"
        string reason
        string additionalComments
        json medicalReports
        date createdAt
    }

    MEDICAL_RECORD {
        ObjectId _id PK
        ObjectId patientId FK
        string title
        string recordType "LAB_REPORT | PRESCRIPTION | SCAN"
        string doctorName
        date recordDate
        string fileUrl
    }

    NOTIFICATION {
        ObjectId _id PK
        ObjectId userId FK
        string title
        string message
        string type "APPOINTMENT | REPORT | SYSTEM"
        boolean read
        date createdAt
    }
```

---

## 📡 REST API Reference

| Method | Endpoint | Description | Auth Required | Success Code |
|---|---|---|:---:|:---:|
| `POST` | `/api/auth/register` | Register new patient account with validation | No | `201 Created` |
| `POST` | `/api/auth/login` | Login patient with email/password; issues JWT cookie | No | `200 OK` |
| `POST` | `/api/auth/google` | Google OAuth one-click authentication | No | `200 OK` |
| `POST` | `/api/auth/logout` | Clear patient session token cookie | Yes | `200 OK` |
| `GET` | `/api/auth/me` | Fetch active patient profile & session | Yes | `200 OK` |
| `PATCH` | `/api/auth/profile` | Update patient profile details & medical info | Yes | `200 OK` |
| `PATCH` | `/api/auth/change-password`| Update patient account password securely | Yes | `200 OK` |
| `GET` | `/api/services` | List all 10 accredited Medora hospital services | No | `200 OK` |
| `GET` | `/api/services/:id` | Fetch specific Medora hospital service details | No | `200 OK` |
| `GET` | `/api/services/:id/doctors`| Fetch Medora doctors assigned to service | No | `200 OK` |
| `GET` | `/api/doctors` | List Medora Hospital doctors (filters: dept, search) | No | `200 OK` |
| `GET` | `/api/doctors/featured` | Fetch featured board-certified Medora doctors | No | `200 OK` |
| `GET` | `/api/doctors/:id` | Fetch full profile of a Medora doctor | No | `200 OK` |
| `GET` | `/api/doctors/:id/availability` | Fetch available slots for requested date | No | `200 OK` |
| `GET` | `/api/doctors/:id/fee-preview` | Calculate session fee (First Visit vs Follow-up) | Yes | `200 OK` |
| `POST` | `/api/appointments` | Book appointment with atomic slot reservation | Yes | `201 / 409` |
| `GET` | `/api/appointments` | List authenticated patient's appointments (year filter) | Yes | `200 OK` |
| `GET` | `/api/appointments/:id` | Fetch specific appointment details & reports | Yes | `200 OK` |
| `PATCH` | `/api/appointments/:id/cancel` | Cancel scheduled appointment (>2 hrs buffer) | Yes | `200 OK` |
| `PATCH` | `/api/appointments/:id/reschedule` | Reschedule appointment to another slot | Yes | `200 OK` |
| `GET` | `/api/records` | List authenticated patient's medical records | Yes | `200 OK` |
| `POST` | `/api/records` | Upload new medical report or prescription | Yes | `201 Created` |
| `GET` | `/api/notifications` | Fetch real-time patient notifications | Yes | `200 OK` |
| `PATCH` | `/api/notifications/read-all` | Mark all unread notifications as read | Yes | `200 OK` |

---

## 🗃️ Redux State Architecture

The frontend state management is structured with Redux Toolkit slices:

```
RootState
├── auth
│   ├── user (id, name, email, phone, avatar, role, profileCompletion)
│   ├── isAuthenticated (boolean)
│   ├── loading (boolean)
│   └── error (string | null)
├── doctor
│   ├── doctors (MedoraDoctor[])
│   ├── featuredDoctors (MedoraDoctor[])
│   ├── selectedDoctor (MedoraDoctor | null)
│   ├── specializations (string[])
│   ├── availabilitySlots (Slot[])
│   └── loading (boolean)
├── service
│   ├── services (HospitalService[])
│   ├── selectedService (HospitalService | null)
│   └── loading (boolean)
├── appointment
│   ├── appointments (Appointment[])
│   ├── upcomingCount (number)
│   ├── activeBookingStep (1..6)
│   ├── bookingDraft (doctorId, serviceId, date, slotId, fee, reports)
│   ├── conflictError (string | null)
│   └── loading (boolean)
└── notification
    ├── items (Notification[])
    └── unreadCount (number)
```

---

## 👥 GitHub Collaboration & Team Responsibilities

The project is structured into two clean full-stack modules developed by two designated collaborators:

### Collaborator 1: Developer 1 (`rahika15046-maker`)
- **Git Branch**: `feature/patient-auth-dashboard`
- **Scope & Deliverables**:
  - Patient registration with bcrypt hashing, password strength computation, and duplicate email prevention.
  - JWT authentication with secure httpOnly cookie session persistence and Bearer fallback.
  - Google OAuth authentication integration.
  - Patient profile management (`/api/auth/me`, `/api/auth/profile`), avatar handling, and profile completion scoring.
  - Password change security validation (`/api/auth/change-password`).
  - Route guards and centralized authentication middleware.
  - Automated test suite: `server/tests/collaborator1-patient-auth.test.js`.
- **Commit History**:
  - `feat(auth): implement patient registration`
  - `feat(auth): implement JWT login`
  - `feat(profile): add patient profile`
  - `feat(profile): implement profile update`
  - `test(auth): add authentication tests`

### Collaborator 2: Developer 2 (`Navnit1`)
- **Git Branch**: `feature/hospital-doctors-appointments`
- **Scope & Deliverables**:
  - Hospital services directory (`/services`, `/api/services`) and service-to-doctor clinical links.
  - Medora Hospital doctors directory (`/our-doctors`, `/api/doctors`) with department filtering.
  - 6-step appointment booking wizard with dynamic Indian Rupee (₹) session pricing.
  - **Simultaneous Booking Concurrency Protection**: Database-level atomic slot locking returning HTTP 409 Conflict upon competing submissions.
  - Patient appointments management (`/appointments`, `/api/appointments`) with year dropdown filtering (`ALL`, `2026`, `2025`, `2024`) and medical report attachments.
  - Automated test suite: `server/tests/collaborator2-hospital-doctors-booking.test.js`.
- **Commit History**:
  - `feat(hospital): implement hospital services`
  - `feat(doctors): add Medora doctors`
  - `feat(appointments): implement appointment booking`
  - `fix(appointments): prevent duplicate slot booking`
  - `feat(appointments): implement appointment history`
  - `test(appointments): add booking tests`

---

## 🧪 Testing & Quality Assurance Summary

The test harness evaluates both collaborator modules and the end-to-end hospital workflow:

```bash
# Execute full Medora automated test suite:
cd server
npm test
```

### Verified Test Results (100% Passing):

```
======================================================
 ALL TEST SUITES SUMMARY
======================================================
 ✓ collaborator1-patient-auth.test.js: PASSED
   - Rejects short names, invalid emails, weak passwords: PASS
   - Registers new patient (201): PASS
   - Duplicate email prevention (409): PASS
   - Patient login (200) & invalid password rejection (401): PASS
   - Google OAuth session creation: PASS
   - Authenticated profile GET & PATCH updates: PASS
   - Password change & re-authentication: PASS
   - Patient session logout: PASS

 ✓ collaborator2-hospital-doctors-booking.test.js: PASSED
   - Hospital Services GET (10 accredited services): PASS
   - Service-to-Doctor linking: PASS
   - Medora Doctors listing & department filters: PASS
   - Doctor availability slots (9 slots): PASS
   - Dynamic session fee preview (First visit vs Follow-up): PASS
   - Booking creation with unique reference (201): PASS
   - CONCURRENT BOOKING TEST: 
     * Simultaneous Request 1 -> 201 Created (Claimed)
     * Simultaneous Request 2 -> 409 Conflict (Protected)
     * Exactly ONE request succeeded: PASS
   - My Appointments listing & year filtering: PASS
   - Appointment cancellation (>2 hr rule): PASS
   - Protected routes unauthenticated rejection (401): PASS

 ✓ full-system.test.js: PASSED
   - Comprehensive end-to-end integration verified: PASS
======================================================
ALL TEST SUITES PASSED CLEANLY (100% SUCCESS)
```

---

## 🚀 Local Development Setup

### 1. Prerequisites
- Node.js (v18.0 or higher)
- npm (v9.0 or higher)
- Optional: MongoDB Community or MongoDB Atlas URI (falls back automatically to in-memory engine if omitted)

### 2. Backend Server Setup
```bash
cd server
npm install
npm run dev
# Server listening on http://localhost:5000
```

### 3. Frontend Client Setup
```bash
cd client
npm install
npm run dev
# Frontend accessible at http://localhost:5173
```

### 4. Demo Credentials:
- **Email**: `patient@demo.medora`
- **Password**: `Demo@1234`
- *Note: One-click instant login is also available directly in the Login modal.*
