# 🏥 MEDORA Hospital — In-Person Healthcare & OPD Scheduling Platform

<div align="center">

![Medora Hospital Banner](https://img.shields.io/badge/MEDORA_HOSPITAL-In--Person_OPD_Scheduling-0D9488?style=for-the-badge&logo=hospital&logoColor=white)

[![Live Web Application](https://img.shields.io/badge/Live_App-medora--doctorappointment.vercel.app-0284C7?style=for-the-badge&logo=vercel&logoColor=white)](https://medora-doctorappointment.vercel.app)
[![API Production](https://img.shields.io/badge/Production_API-doctor--appointment--77wu.onrender.com-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://doctor-appointment-77wu.onrender.com)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Doctor--Appointment-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/rahika15046-maker/Doctor-Appointment)

<br/>

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-v20-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas_v7.0-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Postman Docs](https://img.shields.io/badge/Postman-API_Docs-FF6C37?style=flat-square&logo=postman&logoColor=white)](https://documenter.getpostman.com/)
[![Concurrency Engine](https://img.shields.io/badge/Slot_Lock-Atomic_HTTP_409-7C3AED?style=flat-square&logo=shield&logoColor=white)](#-simultaneous-booking-concurrency--double-booking-prevention)
[![Build & Tests](https://img.shields.io/badge/Tests-100%25_Passing-10B981?style=flat-square&logo=jest&logoColor=white)](#-testing--quality-assurance)

<br/>

**A dedicated, production-grade full-stack healthcare platform engineered exclusively for Medora Hospital.**  
*Empowering patients to discover board-certified hospital specialists, bundle in-house diagnostic tests, and confirm zero-conflict in-person OPD appointments with atomic double-booking prevention.*

</div>

---

## 📑 Table of Contents

- [Executive Summary](#-executive-summary)
- [Live Deployments & Key Links](#-live-deployments--key-links)
- [Core Features & Engineering Highlights](#-core-features--engineering-highlights)
- [System Architecture](#-system-architecture)
- [Authentication & Security Flow](#-authentication--security-flow)
- [OPD Doctor & Diagnostic Discovery Flow](#-opd-doctor--diagnostic-discovery-flow)
- [6-Step In-Person Booking Workflow](#-6-step-in-person-booking-workflow)
- [Simultaneous Booking Concurrency & Double-Booking Prevention](#-simultaneous-booking-concurrency--double-booking-prevention)
- [Database Schema & Entity Relationships](#-database-schema--entity-relationships)
- [REST API Specifications](#-rest-api-specifications)
- [Frontend State Architecture](#-frontend-state-architecture)
- [Collaborative Development & Team Contributions](#-collaborative-development--team-contributions)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Key Engineering Best Practices](#-key-engineering-best-practices)

---

## 📌 Executive Summary

**MEDORA Hospital** is a single-hospital OPD appointment and diagnostic scheduling system. Unlike third-party aggregator marketplaces, MEDORA is designed exclusively for **Medora Hospital** and its on-campus clinical divisions.

All physicians, diagnostic equipment, 45-minute OPD time slots, patient intake records, and surgical follow-ups are tied directly to Medora Hospital's departments.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 MEDORA HOSPITAL PLATFORM                               │
├──────────────────────────┬──────────────────────────────┬──────────────────────────────┤
│ 🩺 In-Person OPD Visits  │ 🔬 Diagnostic Test Bundling  │ ⚡ Atomic Concurrency Lock   │
│ Strictly on-campus hospital │ X-Ray, CT, 1.5T MRI, Ultra-  │ Atomic findOneAndUpdate      │
│ consultations with zero  │ sound, and full Blood Panels │ eliminates double-booking    │
│ telemedicine confusion   │ bundled with doctor visits   │ with HTTP 409 Conflict logic │
└──────────────────────────┴──────────────────────────────┴──────────────────────────────┘
```

### Core Problems Solved:
1. **Elimination of OPD Reception Queues**: Patients select their doctor, review transparent session fees, bundle tests, and confirm slots before stepping onto the hospital campus.
2. **Double-Booking Elimination**: Mitigates race conditions when multiple patients submit bookings for the exact same doctor and slot simultaneously.
3. **Transparent Consultation Pricing**: Automatic detection of first-time visits vs. discounted follow-up visits calculated in Indian Rupees (₹).
4. **Unified Diagnostic Integration**: In-house lab and radiology tests can be attached directly to the OPD consultation, preventing fragmented hospital bills.

---

## 🌐 Live Deployments & Key Links

| Environment / Asset | Target URL | Status | Hosting Infrastructure |
|---|---|:---:|---|
| **Production Web Application** | [medora-doctorappointment.vercel.app](https://medora-doctorappointment.vercel.app) | ![Active](https://img.shields.io/badge/Active-10B981?style=flat-square) | Vercel Edge Network |
| **Backend REST API Server** | [doctor-appointment-77wu.onrender.com](https://doctor-appointment-77wu.onrender.com) | ![Active](https://img.shields.io/badge/Active-10B981?style=flat-square) | Render Cloud Services (Node.js) |
| **Database Cluster** | MongoDB Atlas Replica Set | ![Active](https://img.shields.io/badge/Active-10B981?style=flat-square) | MongoDB Atlas Cloud (AWS Mumbai) |
| **API Health Check** | [/api/health](https://doctor-appointment-77wu.onrender.com/api/health) | ![200 OK](https://img.shields.io/badge/200_OK-0284C7?style=flat-square) | Render Express Engine |
| **GitHub Source Repository** | [Doctor-Appointment](https://github.com/rahika15046-maker/Doctor-Appointment) | ![Public](https://img.shields.io/badge/Public-181717?style=flat-square) | Git Version Control |

---

## ✨ Core Features & Engineering Highlights

```
   ┌───────────────────────────────────────────────────────────────────────────────────────┐
   │                                  KEY SYSTEM HIGHLIGHTS                                │
   ├───────────────────────────┬───────────────────────────┬───────────────────────────────┤
   │ 🔐 Enterprise Auth        │ 👨‍⚕️ Verified Doctor OPD    │ ⚡ Atomic Slot Lock           │
   │ • JWT + Secure Cookie     │ • 4 Core Hospital Depts   │ • MongoDB findOneAndUpdate    │
   │ • bcrypt (salt rounds=10) │ • First Visit vs Followup │ • HTTP 409 Conflict Handling  │
   │ • select: false passwords │ • 45-minute OPD slots     │ • Client-side auto-refresh    │
   ├───────────────────────────┼───────────────────────────┼───────────────────────────────┤
   │ 🔬 Diagnostic Bundling    │ 📑 Patient Portal         │ 🛡️ Cloud Resilience           │
   │ • Digital X-Ray, CT Scan  │ • Real-time notifications │ • Non-blocking 0.0.0.0 bind   │
   │ • 1.5 Tesla MRI, Blood    │ • Medical report storage  │ • Central error middleware    │
   │ • Fixed ₹ INR pricing     │ • Year-based visit filter │ • Idempotent booking keys     │
   └───────────────────────────┴───────────────────────────┴───────────────────────────────┘
```

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Client ["Frontend Architecture (React 18 + Tailwind CSS + Vite)"]
        UI["Modern UI Layer (Tailwind CSS Mobile-First)"]
        Nav["Global Navigation & Auth Modals"]
        Hero["Hospital Hero & Quick Actions"]
        DeptDir["Hospital Departments Directory"]
        DocDir["Medora Doctors Catalog & Profile Modals"]
        DiagDir["Diagnostic Lab & Radiology Directory"]
        BookWiz["6-Step In-Person Booking Wizard"]
        PatientPortal["Patient Dashboard & Appointments History"]
        AxiosClient["Axios Client (withCredentials / Interceptors)"]

        UI --> Nav & Hero & DeptDir & DocDir & DiagDir & BookWiz & PatientPortal
        BookWiz & PatientPortal & Nav --> AxiosClient
    end

    subgraph Security ["Transport & Session Security"]
        HTTPS["HTTPS REST Transport"]
        JWTToken["Stateless JWT / Dual Cookie & Bearer"]
    end

    subgraph Server ["Backend Architecture (Node.js + Express.js)"]
        SecurityMW["Security Headers & CORS Whitelist"]
        AuthMW["JWT Verification Middleware (select: '+password')"]
        CentralRouter["Express Router (/api)"]
        AuthCtrl["Auth & Profile Controller"]
        DocCtrl["Doctor & Department Controller"]
        ServiceCtrl["Hospital Diagnostic Services Controller"]
        ApptCtrl["Appointment Controller"]
        LockEngine["Atomic Slot Reservation Engine (claimSlot)"]
        ErrorMW["Centralized Error Handling Middleware"]

        SecurityMW --> CentralRouter
        CentralRouter --> AuthMW
        AuthMW --> AuthCtrl & DocCtrl & ServiceCtrl & ApptCtrl
        ApptCtrl --> LockEngine
        LockEngine --> CentralRouter
        CentralRouter --> ErrorMW
    end

    subgraph Database ["Persistence Layer (MongoDB Atlas Cluster)"]
        AtlasCluster[("MongoDB Atlas Replica Set")]
        UsersCol[("users Collection")]
        DoctorsCol[("doctors Collection")]
        SlotsCol[("appointment_slots Collection")]
        ServicesCol[("services Collection")]
        ApptsCol[("appointments Collection")]
        RecordsCol[("medical_records Collection")]
        NotifsCol[("notifications Collection")]

        AtlasCluster --> UsersCol & DoctorsCol & SlotsCol & ServicesCol & ApptsCol & RecordsCol & NotifsCol
        LockEngine -->|Atomic findOneAndUpdate| SlotsCol
        ApptCtrl --> ApptsCol
        AuthCtrl --> UsersCol
        DocCtrl --> DoctorsCol
        ServiceCtrl --> ServicesCol
    end

    AxiosClient -->|JSON Requests| HTTPS
    HTTPS --> SecurityMW
    JWTToken -.->|Authorization| AuthMW
    Server --> AtlasCluster
```

---

## 🔐 Authentication & Security Flow

```mermaid
sequenceDiagram
    autonumber
    actor Patient as Patient (Browser)
    participant Modal as React Auth Modal
    participant API as /api/auth/login
    participant DB as MongoDB Atlas (users)

    Patient->>Modal: Enter Email & Password
    Modal->>Modal: Client-Side Input Validation (email format & length)
    Modal->>API: POST /api/auth/login { email, password }
    API->>DB: User.findOne({ email }).select('+password')
    
    alt User Not Found
        DB-->>API: null
        API-->>Modal: HTTP 401 Unauthorized: "Invalid credentials"
        Modal-->>Patient: Display inline warning banner
    else User Exists
        DB-->>API: User Document with password hash
        API->>API: bcrypt.compare(password, user.password)
        alt Password Mismatch
            API-->>Modal: HTTP 401 Unauthorized: "Invalid credentials"
            Modal-->>Patient: Display invalid password alert
        else Password Valid
            API->>API: jwt.sign({ id, email, role }, JWT_SECRET, { expiresIn: '7d' })
            API-->>Modal: HTTP 200 OK + JWT Token + User Profile Data
            Modal->>Modal: Store Auth State in Context & update Navigation
            Modal-->>Patient: Instant success confirmation & dashboard access
        end
    end
```

---

## 🩺 OPD Doctor & Diagnostic Discovery Flow

```mermaid
flowchart LR
    Start([Patient visits Medora Hospital]) --> SelectPath{"Discovery Mode"}

    SelectPath -->|Browse Departments| ServicesPage["Explore Services (/services)"]
    SelectPath -->|Browse Specialists| DoctorsPage["Search Doctors (/our-doctors)"]

    subgraph Diagnostics ["Hospital Diagnostics"]
        ServicesPage --> LabGrid["5 Specialized Test Packages\n(MRI, CT, X-Ray, Sonography, Blood Tests)"]
        LabGrid --> ServiceDetail["Test Specs, Prep Instructions & ₹ Starting Prices"]
        ServiceDetail --> AttachTest["Bundle Test with Doctor Visit"]
    end

    subgraph Specialists ["Medora Hospital OPD Specialists"]
        DoctorsPage --> FilterDepts["Filter by Department\n(Cardiology, Orthopedics, Pediatrics, Medicine)"]
        AttachTest --> FilterDepts
        FilterDepts --> DocCards["Doctor Cards with 'In-Person OPD Only' Badge"]
        DocCards --> DocModal["Doctor Profile Modal\n(Degrees, Experience, Reviews, ₹ Fees)"]
        DocModal --> LaunchBooking["Launch 6-Step In-Person Booking Flow"]
    end

    LaunchBooking --> BookingWizard["6-Step In-Person Booking Wizard"]
```

---

## 📅 6-Step In-Person Booking Workflow

```mermaid
stateDiagram-v2
    [*] --> Step1_Department: 1. Select Hospital Department
    Step1_Department --> Step2_Doctor: 2. Choose Board-Certified Specialist
    Step2_Doctor --> Step3_Mode: 3. Consultation Mode (Locked to In-Person OPD)
    Step3_Mode --> Step4_Slots: 4. Calendar Date & Available 45-Min Slot
    Step4_Slots --> Step5_Intake: 5. Chief Complaint & Optional Diagnostic Bundling
    
    state Step6_Confirmation {
        [*] --> PriceCheck: Calculate Fee (First Visit ₹1000 vs Follow-Up ₹600/₹700)
        PriceCheck --> ReviewDetails: Review Patient Info, Doctor & OPD Room
        ReviewDetails --> SubmitLock: Click 'Confirm & Book OPD Appointment'
    }

    Step5_Intake --> Step6_Confirmation
    Step6_Confirmation --> BookingSuccess: Atomic Claim Succeeded (HTTP 201)
    Step6_Confirmation --> Step4_Slots: Slot Taken Concurrently (HTTP 409) -> Auto-Reload Slots
    BookingSuccess --> [*]: Reference ID Issued (MED-YYYY-XXXXXXXX)
```

---

## ⚡ Simultaneous Booking Concurrency & Double-Booking Prevention

A common failure in appointment booking systems occurs when two patients attempt to book the identical time slot of a physician at the exact same moment.

```
       Patient A (Submits 10:00:00.100) ──────┐
                                              ├──►  [ MongoDB Atlas Atomic Transaction ]
       Patient B (Submits 10:00:00.105) ──────┘
                                                              │
                       ┌──────────────────────────────────────┴──────────────────────────────────────┐
                       ▼                                                                             ▼
          [ Patient A Wins Claim ]                                                      [ Patient B Conflict ]
         findOneAndUpdate matches:                                                     findOneAndUpdate matches:
        status: "AVAILABLE" ➔ "BOOKED"                                                status: "AVAILABLE" ➔ FAILS (null)
                       │                                                                             │
                       ▼                                                                             ▼
               HTTP 201 Created                                                              HTTP 409 Conflict
        Booking Confirmed: MED-2026-XXXXXXXX                                      "Slot already booked. Refreshing..."
```

```mermaid
sequenceDiagram
    autonumber
    actor Patient_A as Patient A (Browser 1)
    actor Patient_B as Patient B (Browser 2)
    participant Router as Express Appointment Router
    participant Service as appointment.service.js
    participant SlotDB as MongoDB Atlas (appointment_slots)
    participant ApptDB as MongoDB Atlas (appointments)

    Note over Patient_A,Patient_B: Both patients select Dr. Robert Brown (Cardiology) on Nov 25 at 10:00 AM (Slot #S101)

    par Parallel Requests Dispatched
        Patient_A->>Router: POST /api/appointments { doctorId, slotId: "S101", ... }
        Patient_B->>Router: POST /api/appointments { doctorId, slotId: "S101", ... }
    end

    critical Atomic Slot Acquisition
        Router->>Service: claimSlot("S101", patientA.id)
        Service->>SlotDB: findOneAndUpdate({ _id: "S101", doctorId, status: "AVAILABLE" }, { status: "BOOKED" })
        SlotDB-->>Service: Updated Slot Document (status: 'BOOKED')
        Service-->>Router: Slot Claim Confirmed
        Router->>ApptDB: Appointment.create({ referenceId: "MED-2026-44F2810C", ... })
        Router-->>Patient_A: HTTP 201 Created { referenceId: "MED-2026-44F2810C", status: "CONFIRMED" }
    option Competing Request Attempt
        Router->>Service: claimSlot("S101", patientB.id)
        Service->>SlotDB: findOneAndUpdate({ _id: "S101", doctorId, status: "AVAILABLE" }, { status: "BOOKED" })
        SlotDB-->>Service: null (Condition not met; slot is already 'BOOKED')
        Service-->>Router: Slot Claim Rejected
        Router-->>Patient_B: HTTP 409 Conflict: "This slot was just booked by another patient."
    end

    Patient_A->>Patient_A: Booking Success Modal displayed with Reference ID
    Patient_B->>Patient_B: Toast Alert shown; active slots auto-refreshed; intake data preserved
```

---

## 🗄️ Database Schema & Entity Relationships

```mermaid
erDiagram
    USER ||--o{ APPOINTMENT : "books"
    USER ||--o{ MEDICAL_RECORD : "uploads"
    USER ||--o{ NOTIFICATION : "receives"
    DOCTOR ||--o{ APPOINTMENT : "consults"
    DOCTOR ||--o{ APPOINTMENT_SLOT : "allocates"
    SERVICE ||--o{ APPOINTMENT : "bundled into"
    APPOINTMENT ||--|| APPOINTMENT_SLOT : "claims (1:1)"

    USER {
        ObjectId _id PK
        string name "Patient Full Name"
        string email UK "Unique index"
        string password "bcrypt hash (select: false)"
        string phone "Contact Mobile Number"
        string role "PATIENT | DOCTOR | ADMIN"
        string bloodGroup "A+, B+, O+, AB+"
        string dateOfBirth "YYYY-MM-DD"
        string gender "Male | Female | Other"
        number profileCompletion "0 to 100%"
        date createdAt
    }

    DOCTOR {
        ObjectId _id PK
        string name "Dr. Robert Brown"
        string department "Cardiology | Medicine | Orthopedics"
        string specialization "Board Certified Specialty"
        string qualification "MBBS, MD, DM"
        string hospital "Medora Hospital"
        number consultationFee "INR ₹ Base"
        number firstVisitFee "INR ₹ First Visit"
        number followupFee "INR ₹ Discounted Follow-up"
        string[] consultationTypes "['IN_PERSON']"
        number averageRating "4.8 / 5.0"
        string verificationStatus "VERIFIED"
    }

    APPOINTMENT_SLOT {
        ObjectId _id PK
        ObjectId doctorId FK "Ref: Doctor"
        date startAt "Slot start timestamp (45 min)"
        date endAt "Slot end timestamp"
        string status "AVAILABLE | BOOKED"
        ObjectId appointmentId FK "Sparse 1:1 Link"
    }

    SERVICE {
        ObjectId _id PK
        string title "Digital X-Ray | CT Scan | 1.5T MRI"
        string department "Radiology | Pathology | Lab"
        number startingPrice "INR ₹ (e.g. ₹600, ₹2500, ₹4000)"
        string[] features "1.5 Tesla, High-Resolution, 128 Slice"
    }

    APPOINTMENT {
        ObjectId _id PK
        string referenceId UK "MED-YYYY-XXXXXXXX"
        ObjectId patientId FK "Ref: User"
        ObjectId doctorId FK "Ref: Doctor"
        ObjectId serviceId FK "Ref: Service (optional bundle)"
        ObjectId slotId FK "Ref: AppointmentSlot (1:1)"
        date startAt "Consultation start"
        date endAt "Consultation end"
        string consultationType "IN_PERSON"
        string reason "Chief medical complaint"
        number consultationFee "Calculated fee in INR ₹"
        boolean isFollowup "Discount flag"
        string status "CONFIRMED | CANCELLED"
        string paymentMethod "PAY_ON_VISIT | RAZORPAY"
        string idempotencyKey UK "Sparse unique index"
        date createdAt
    }

    MEDICAL_RECORD {
        ObjectId _id PK
        ObjectId patientId FK "Ref: User"
        string title "Prescription / Scan Name"
        string type "PRESCRIPTION | LAB_REPORT | SCAN"
        string fileUrl "Storage link"
        date createdAt
    }

    NOTIFICATION {
        ObjectId _id PK
        ObjectId userId FK "Ref: User"
        string title "Booking Confirmed"
        string message "Details and OPD room"
        boolean isRead "Read status"
        date createdAt
    }
```

---

## 📡 REST API Specifications

| Method | Endpoint | Description | Auth Required | Status Code |
|:---:|---|---|:---:|:---:|
| `GET` | `/api/health` | Service health status & uptime check | None | `200 OK` |
| `POST` | `/api/auth/register` | Register new patient account with bcrypt hashing | None | `201 Created` |
| `POST` | `/api/auth/login` | Authenticate patient; issue JWT & session cookies | None | `200 OK` |
| `POST` | `/api/auth/logout` | Terminate session & clear cookies | Authenticated | `200 OK` |
| `GET` | `/api/auth/me` | Retrieve active patient profile & metadata | Authenticated | `200 OK` |
| `PATCH` | `/api/auth/profile` | Update address, blood group, emergency contact | Authenticated | `200 OK` |
| `PATCH` | `/api/auth/change-password` | Update account password securely | Authenticated | `200 OK` |
| `GET` | `/api/doctors` | List hospital doctors with department filters | None | `200 OK` |
| `GET` | `/api/doctors/featured` | Fetch featured specialists for landing page | None | `200 OK` |
| `GET` | `/api/doctors/:id` | Fetch doctor profile, fees & credentials | None | `200 OK` |
| `GET` | `/api/doctors/:id/availability` | Fetch live available 45-min OPD slots | None | `200 OK` |
| `GET` | `/api/doctors/:id/fee-preview` | Compute session fee (First Visit vs Follow-up) | Authenticated | `200 OK` |
| `GET` | `/api/services` | List hospital diagnostic & radiology services | None | `200 OK` |
| `POST` | `/api/appointments` | Book appointment with atomic slot claim | Authenticated | `201 / 409` |
| `GET` | `/api/appointments` | List authenticated patient's appointments | Authenticated | `200 OK` |
| `GET` | `/api/appointments/:id` | Fetch booking confirmation by reference ID | Authenticated | `200 OK` |
| `PATCH` | `/api/appointments/:id/cancel` | Cancel OPD appointment (>2 hrs buffer rule) | Authenticated | `200 OK` |
| `GET` | `/api/records` | List patient medical records & prescriptions | Authenticated | `200 OK` |
| `GET` | `/api/notifications` | Fetch unread notifications & alerts | Authenticated | `200 OK` |
| `PATCH` | `/api/notifications/read-all` | Mark all unread patient notifications as read | Authenticated | `200 OK` |

---

## 🗃️ Frontend State Architecture

```
React Application Context Tree
├── AuthContext
│   ├── user: { _id, name, email, phone, role, profileCompletion }
│   ├── token: string (JWT)
│   ├── isAuthenticated: boolean
│   ├── login() / register() / logout()
│   └── updateProfile()
├── NotificationContext
│   ├── notifications: Notification[]
│   ├── unreadCount: number
│   ├── fetchNotifications()
│   └── markAllAsRead()
└── BookingFlow State (Component-Level Wizard)
    ├── selectedDepartment: string
    ├── selectedDoctor: Doctor | null
    ├── consultationType: 'IN_PERSON' (fixed)
    ├── selectedDate: string (YYYY-MM-DD)
    ├── selectedSlot: Slot | null
    ├── bundledService: Service | null
    ├── isFollowup: boolean
    ├── calculatedFee: number (INR ₹)
    ├── patientReason: string
    └── isSubmitting: boolean
```

---

## 👥 Collaborative Development & Team Contributions

The application was collaboratively developed and structured into two feature branches merged into `main`:

```
main (Production Ready)
 ├── feature/patient-auth-dashboard (Developer 1: Radhika Agrawal)
 └── feature/hospital-doctors-appointments (Developer 2: Navnit Kumar)
```

### Developer 1: Radhika Agrawal (`rahika15046-maker`)
- **Assigned Git Branch**: `feature/patient-auth-dashboard`
- **Core Responsibilities & Deliverables**:
  - Patient registration and login with bcrypt hashing and selective password exclusion (`select: false`).
  - Stateless JWT token generation and cross-domain authentication middleware.
  - Patient profile management (`/api/auth/profile`, `/api/auth/me`) and emergency contact updates.
  - Notification alert system with unread counter badges.
  - Automated authentication test suite: `server/tests/collaborator1-patient-auth.test.js`.

### Developer 2: Navnit Kumar (`Navnit1`)
- **Assigned Git Branch**: `feature/hospital-doctors-appointments`
- **Core Responsibilities & Deliverables**:
  - Hospital specialist directory (`/our-doctors`, `/api/doctors`) with department filtering.
  - Diagnostic test bundling (Digital X-Ray, CT Scan, MRI, Sonography, Blood Tests).
  - 6-step in-person OPD booking wizard with dynamic Indian Rupee (₹) pricing.
  - **Simultaneous Booking Concurrency Engine**: Atomic database slot reservation handling competing claims with `HTTP 409 Conflict`.
  - Patient appointments management (`/appointments`, `/api/appointments`) with year-based filtering.
  - Automated booking test suite: `server/tests/collaborator2-hospital-doctors-booking.test.js`.

---

## 🧪 Testing & Quality Assurance

The codebase includes an automated test harness covering individual collaborator deliverables and end-to-end integration workflows.

### Test Execution Command:
```bash
cd server
npm test
```

### Verified Test Suite Results (100% Passing):

```
======================================================
 ALL TEST SUITES SUMMARY
======================================================
 ✓ collaborator1-patient-auth.test.js: PASSED
   - Rejects missing fields and invalid emails: PASS
   - Registers new patient account with bcrypt hash: PASS
   - Duplicate email registration prevention (409): PASS
   - Patient authentication (200) & invalid password rejection (401): PASS
   - Authenticated profile GET & PATCH updates: PASS
   - Password update & re-authentication: PASS
   - Session logout & token cleanup: PASS

 ✓ collaborator2-hospital-doctors-booking.test.js: PASSED
   - Hospital Services GET (radiology & pathology tests): PASS
   - Medora Doctors listing & department filtering: PASS
   - Doctor availability slots listing: PASS
   - Dynamic session fee calculation (First visit vs Follow-up): PASS
   - In-Person OPD booking creation with reference ID (201): PASS
   - CONCURRENT BOOKING SIMULATION TEST:
     * Simultaneous Request 1 -> 201 Created (Slot Claimed)
     * Simultaneous Request 2 -> 409 Conflict (Protected & Rejected)
     * Exactly ONE request succeeded: PASS
   - Patient appointment history listing: PASS
   - Appointment cancellation buffer validation (>2 hrs): PASS
   - Protected route unauthenticated rejection (401): PASS

 ✓ full-system.test.js: PASSED
   - End-to-end integration workflow verified: PASS
======================================================
ALL TEST SUITES PASSED CLEANLY (100% SUCCESS)
```

---

## 🛡️ Key Engineering Best Practices

1. **Selective Field Exclusion**: Passwords are protected with `select: false` in Mongoose schemas, preventing accidental leakage in queries or logs.
2. **Atomic Single-Document Operations**: Slot claims use atomic `findOneAndUpdate` queries rather than read-then-write logic, eliminating race conditions.
3. **Compound & Partial Unique Indexes**: Database-level indexes (`{ doctorId: 1, startAt: 1 }`) guarantee physical prevention of duplicate appointments.
4. **Semantic HTTP Status Codes**: Explicit codes (`200`, `201`, `400`, `401`, `404`, `409 Conflict`) maintain API predictability.
5. **Idempotency Safeguards**: Client booking requests generate unique idempotency tokens, preventing duplicate entries on double clicks.
6. **Non-Blocking Cloud Startup**: Server binds port `0.0.0.0` immediately while connecting to MongoDB Atlas asynchronously, preventing cloud health-check timeouts.
7. **Cross-Domain JWT Security**: Tokens are transmitted via secure Authorization headers and credentials cookies, preventing CSRF vulnerabilities.
8. **Layered MVC Architecture**: Clear separation across routes, controllers, and domain services keeps the codebase modular and maintainable.

---

<div align="center">

**MEDORA Hospital — Enterprise In-Person Healthcare Scheduling Platform**  
*Built with care for Medora Hospital patients and clinical staff.*

</div>
