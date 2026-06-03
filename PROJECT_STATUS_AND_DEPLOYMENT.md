# Project Status And Deployment

## Current State

This repository currently ships:

- A web application in `apps/web`
- A mobile application in `apps/mobile`
- A PostgreSQL-backed attendance workflow using Neon-compatible SQL access
- Session creation, QR/token check-in, GPS radius validation, attendance history, exports, and dashboard views

This repository does not currently ship:

- A Python `FastAPI` backend
- `face_recognition`, `OpenCV`, or `dlib` processing
- `react-native-biometrics`
- `react-native-vision-camera`
- `react-native-ble-plx`
- Device public key registration for biometric fallback
- BLE classroom proximity enforcement

## What Matches Your Blueprint

- QR-based attendance sessions exist
- GPS/geofence checks exist in the check-in API
- Attendance records, audit logs, notifications, and exports exist
- Mobile and web clients already exist and can be extended
- PostgreSQL is already the backing database

## What Does Not Match Yet

- Face recognition is not implemented end-to-end
- Fingerprint or Face ID fallback is not implemented
- BLE proximity verification is not implemented
- The current backend is JavaScript server routes, not Python FastAPI
- There is no face-embedding registration pipeline
- There is no crowd-photo upload or server-side classroom face matching flow

## Recommended Architecture Going Forward

Use the current web/mobile apps as the product shell and add a new Python service for vision work:

1. Keep `apps/mobile` as the student and professor mobile client
2. Keep `apps/web` as the admin/dashboard and session management portal
3. Add a new service such as `services/vision-api` using `FastAPI`
4. Move face registration, crowd matching, and biometric signature verification into that Python service
5. Keep PostgreSQL as the shared system of record

## Suggested Modules

### Module A: Registration

- Student signs in on mobile
- Student captures a selfie
- Backend extracts and stores face embeddings
- Mobile generates and registers a biometric public key

### Module B: Crowd Scan

- Teacher captures classroom photos on mobile
- Mobile uploads images to FastAPI
- FastAPI detects faces, computes embeddings, compares against registered students, and records attendance

### Module C: Biometric Fallback

- Student taps biometric sign-in on mobile
- Phone verifies fingerprint or device biometric locally
- App signs a payload with the device private key
- Backend verifies the signature and marks attendance

### Module D: BLE Proximity

- Mobile scans for a classroom beacon UUID
- App only enables biometric fallback when the beacon is nearby

## Environment Needed Today

### Web

- `DATABASE_URL`

The web app depends on a PostgreSQL database containing tables such as:

- `auth_users`
- `auth_accounts`
- `auth_sessions`
- `attendance_sessions`
- `attendance_records`
- `audit_logs`
- `notifications`
- `classes`
- `departments`

### Mobile

- The mobile app currently talks to the same web API routes
- Make sure the mobile runtime can reach the web server URL

## Current Deployment Steps

### 1. Database

- Provision PostgreSQL or Neon
- Set `DATABASE_URL` for `apps/web`
- Apply your schema before starting the app

### 2. Web App

From `apps/web`:

```bash
npm install
npm run dev
```

Expected result:

- The dashboard and API routes become available
- Sign-up and sign-in use the database-backed auth tables

### 3. Seed Demo Data

After the web app starts, call:

- `POST /api/seed-demo`

Demo accounts:

- `admin@demo.com`
- `teacher@demo.com`
- `student@demo.com`
- Password: `demo1234`

### 4. Mobile App

From `apps/mobile`:

```bash
npm install
npx expo start
```

Important:

- Point mobile requests at the running web app host
- Confirm authentication and `/api/*` calls resolve correctly from the device or emulator

## How To Use The System Today

### Teacher/Admin Flow

1. Sign in to the web dashboard
2. Create a session in `Dashboard -> Sessions`
3. Set title, late threshold, and GPS radius
4. Open the session page
5. Display the QR code to students
6. Watch attendance records update live
7. End the session when class finishes
8. Export CSV from attendance or reports pages

### Student Flow

1. Sign in on mobile or web
2. Open the scan screen in mobile, or open the attendance link from the QR code
3. Allow location access if GPS validation is required
4. Scan the session QR code
5. Receive a present or late result
6. Review attendance history in the mobile history tab

## How To Deploy The Full Blueprint

### Add A Python Service

Create a new service, for example:

- `services/vision-api`

Recommended packages:

```bash
pip install fastapi uvicorn face_recognition opencv-python psycopg2-binary sqlalchemy pydantic
```

Recommended endpoints:

- `POST /register-face`
- `POST /recognize-crowd`
- `POST /register-device-key`
- `POST /biometric-checkin`
- `POST /verify-device-signature`

### Add Mobile Libraries

In `apps/mobile`, install:

```bash
npm install react-native-vision-camera
npm install react-native-biometrics
npm install react-native-ble-plx
npm install axios
```

Then implement:

- Selfie capture for registration
- Classroom photo batch upload
- Local biometric prompt and payload signing
- BLE beacon scanning before fallback check-in

## Next Build Order

Recommended sequence:

1. Create the Python FastAPI service and database tables for embeddings and device keys
2. Build registration first
3. Build biometric fallback with signed payload verification
4. Build BLE proximity enforcement
5. Build crowd-photo recognition last

## Immediate Next Steps

- Add a proper schema migration file for all required tables
- Add a `README.md` with one-command local setup
- Extract a shared API base URL config for mobile and web
- Add a real FastAPI service instead of simulated or placeholder face features
- Add deployment targets for web, mobile, database, and FastAPI as separate services
