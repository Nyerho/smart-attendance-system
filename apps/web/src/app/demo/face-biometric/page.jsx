"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import {
  Camera,
  CheckCircle,
  Fingerprint,
  LoaderCircle,
  MapPin,
  RefreshCw,
  Shield,
  Trash2,
  UserCheck,
} from "lucide-react";
import { db, initFirebaseAnalytics } from "@/utils/firebase.client";
import {
  ATTENDANCE_LOGS_COLLECTION,
  buildRegistrationId,
  COURSE_CONFIGS_COLLECTION,
  DEMO_SESSIONS_COLLECTION,
  getLocalCourseConfig,
  normalizeCourseCode,
  saveLocalAttendanceLog,
  saveLocalStudentRegistration,
  STUDENT_REGISTRATIONS_COLLECTION,
} from "@/utils/attendanceDemo";

const MODELS_URL = "https://justadudewhohacks.github.io/face-api.js/models";
const STORAGE_KEY = "smart-attendance-face-biometric-demo";
const SESSION_ID_KEY = "smart-attendance-face-biometric-demo-session-id";
const FACE_DISTANCE_THRESHOLD = 0.52;

function randomBytes(length) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

function toBase64Url(buffer) {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4 || 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function formatDistance(meters) {
  if (meters == null || Number.isNaN(meters)) return "Unknown";
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(2)} km`;
}

function calculateDistanceMeters(from, to) {
  if (!from || !to) return null;
  const R = 6371000;
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((from.lat * Math.PI) / 180) *
      Math.cos((to.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function sanitizeRegisteredProfile(profile) {
  if (!profile) return null;
  return {
    name: profile.name || "",
    matNumber: profile.matNumber || "",
    courseCode: profile.courseCode || "",
    faceRegisteredAt: profile.faceRegisteredAt || null,
    passkeyCredentialId: profile.passkeyCredentialId || null,
    passkeyUserId: profile.passkeyUserId || null,
    passkeyRegisteredAt: profile.passkeyRegisteredAt || null,
  };
}

function StatusPill({ ok, children }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${
        ok
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          : "border-amber-500/30 bg-amber-500/10 text-amber-300"
      }`}
    >
      {ok ? <CheckCircle size={12} /> : <RefreshCw size={12} />}
      {children}
    </span>
  );
}

export default function FaceBiometricDemoPage() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [modelsReady, setModelsReady] = useState(false);
  const [modelsError, setModelsError] = useState("");
  const [cameraOn, setCameraOn] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [busyAction, setBusyAction] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [registeredProfile, setRegisteredProfile] = useState(null);
  const [attendanceLog, setAttendanceLog] = useState([]);
  const [studentName, setStudentName] = useState("Demo Student");
  const [matNumber, setMatNumber] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [courseConfig, setCourseConfig] = useState(null);
  const [presenceConfirmed, setPresenceConfirmed] = useState(false);
  const [lastFaceDistance, setLastFaceDistance] = useState(null);
  const [demoSessionId, setDemoSessionId] = useState("");
  const [firebaseStatus, setFirebaseStatus] = useState("Firebase sync not started yet.");
  const [firebaseSyncOk, setFirebaseSyncOk] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const savedSessionId =
      window.localStorage.getItem(SESSION_ID_KEY) || `demo-${crypto.randomUUID()}`;
    window.localStorage.setItem(SESSION_ID_KEY, savedSessionId);
    setDemoSessionId(savedSessionId);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      setRegisteredProfile(parsed.registeredProfile || null);
      setAttendanceLog(parsed.attendanceLog || []);
      setStudentName(parsed.studentName || "Demo Student");
      setMatNumber(parsed.matNumber || "");
      setCourseCode(parsed.courseCode || "");
      setCourseConfig(parsed.courseConfig || null);
      setPresenceConfirmed(Boolean(parsed.presenceConfirmed));
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function setupFirebase() {
      await initFirebaseAnalytics();
      if (!cancelled) {
        setFirebaseStatus("Firebase configured. Firestore sync will be attempted.");
      }
    }

    setupFirebase();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        registeredProfile,
        attendanceLog,
        studentName,
        matNumber,
        courseCode,
        courseConfig,
        presenceConfirmed,
      }),
    );
  }, [
    attendanceLog,
    courseCode,
    courseConfig,
    matNumber,
    presenceConfirmed,
    registeredProfile,
    studentName,
  ]);

  const classroomLocation = courseConfig?.classroomLocation || null;
  const radiusMeters = Number(courseConfig?.radiusMeters || 0);
  const sessionTitle = courseConfig?.courseTitle
    ? `${courseConfig.courseCode} · ${courseConfig.courseTitle}`
    : "Pending course confirmation";
  const distanceFromClassroom = useMemo(
    () => calculateDistanceMeters(currentLocation, classroomLocation),
    [classroomLocation, currentLocation],
  );
  const insideClassroom =
    classroomLocation && currentLocation && radiusMeters > 0
      ? distanceFromClassroom <= radiusMeters
      : false;

  useEffect(() => {
    if (!demoSessionId) return;
    let cancelled = false;

    async function syncSessionSnapshot() {
      try {
        await setDoc(
          doc(db, DEMO_SESSIONS_COLLECTION, demoSessionId),
          {
            demoSessionId,
            studentName,
            matNumber,
            courseCode: normalizeCourseCode(courseCode),
            courseTitle: courseConfig?.courseTitle || "",
            lecturerName: courseConfig?.lecturerName || "",
            lecturerEmail: courseConfig?.lecturerEmail || "",
            currentLocation,
            classroomLocation,
            radiusMeters,
            presenceConfirmed,
            registeredProfile: sanitizeRegisteredProfile(registeredProfile),
            attendanceLog,
            lastFaceDistance:
              typeof lastFaceDistance === "number"
                ? Number(lastFaceDistance.toFixed(4))
                : null,
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );
        if (!cancelled) {
          setFirebaseSyncOk(true);
          setFirebaseStatus("Firebase sync active. Student demo is saving to Firestore.");
        }
      } catch (error) {
        if (!cancelled) {
          setFirebaseSyncOk(false);
          setFirebaseStatus(
            `Firebase sync unavailable. Enable Firestore or relax demo rules. ${error.code || ""}`.trim(),
          );
        }
      }
    }

    syncSessionSnapshot();

    return () => {
      cancelled = true;
    };
  }, [
    attendanceLog,
    classroomLocation,
    courseCode,
    courseConfig,
    currentLocation,
    demoSessionId,
    lastFaceDistance,
    matNumber,
    presenceConfirmed,
    radiusMeters,
    registeredProfile,
    studentName,
  ]);

  useEffect(() => {
    let cancelled = false;

    async function loadModels() {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODELS_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODELS_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODELS_URL),
        ]);
        if (!cancelled) setModelsReady(true);
      } catch {
        if (!cancelled) {
          setModelsError("Could not load face models. Check internet access before the demo.");
        }
      }
    }

    loadModels();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  async function refreshLocation() {
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported in this browser.");
      return null;
    }
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const nextLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(nextLocation);
          resolve(nextLocation);
        },
        (error) => {
          setLocationError(error.message || "Unable to get current location.");
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    });
  }

  async function fetchCourseConfig(courseCodeInput) {
    const normalizedCode = normalizeCourseCode(courseCodeInput);
    if (!normalizedCode) {
      throw new Error("Enter a valid course code first.");
    }
    try {
      const snapshot = await getDoc(doc(db, COURSE_CONFIGS_COLLECTION, normalizedCode));
      if (snapshot.exists()) {
        return snapshot.data();
      }
    } catch {
      // Fall through to browser-local preview storage.
    }
    const localConfig = getLocalCourseConfig(normalizedCode);
    if (!localConfig) {
      throw new Error("No lecturer classroom setup was found for that course code.");
    }
    setFirebaseStatus("Using browser-saved lecturer course setup for this preview.");
    return localConfig;
  }

  async function syncStudentRegistration(extra = {}) {
    const normalizedCode = normalizeCourseCode(courseCode);
    if (!studentName || !matNumber || !normalizedCode) return;
    const registrationPayload = {
      id: buildRegistrationId(matNumber, normalizedCode),
      studentName: studentName.trim(),
      matNumber: matNumber.trim().toUpperCase(),
      courseCode: normalizedCode,
      courseTitle: courseConfig?.courseTitle || "",
      lecturerName: courseConfig?.lecturerName || "",
      lecturerEmail: courseConfig?.lecturerEmail || "",
      classroomLocation,
      radiusMeters,
      updatedAt: new Date().toISOString(),
      ...extra,
    };
    saveLocalStudentRegistration(registrationPayload);
    try {
      await setDoc(
        doc(db, STUDENT_REGISTRATIONS_COLLECTION, buildRegistrationId(matNumber, normalizedCode)),
        { ...registrationPayload, updatedAt: serverTimestamp() },
        { merge: true },
      );
      setFirebaseSyncOk(true);
    } catch (error) {
      setFirebaseSyncOk(false);
      setFirebaseStatus(
        `Registration saved in browser preview storage. Firestore write failed ${error.code || ""}`.trim(),
      );
    }
  }

  async function confirmCourseAndPresence() {
    if (!studentName || !matNumber || !courseCode) {
      setStatusMessage("Student name, MAT number, and course code are required.");
      return;
    }

    setBusyAction("course-presence");
    setStatusMessage("");
    try {
      const [config, latestLocation] = await Promise.all([
        fetchCourseConfig(courseCode),
        refreshLocation(),
      ]);

      if (!latestLocation) {
        throw new Error("Allow location access so the system can confirm you are in class.");
      }

      setCourseConfig(config);
      if (!config.attendanceOpen) {
        setPresenceConfirmed(false);
        setStatusMessage(
          `Attendance has not been started yet for ${config.courseCode}. Ask the lecturer to open attendance first.`,
        );
        return;
      }
      const distance = calculateDistanceMeters(latestLocation, config.classroomLocation);
      if (typeof distance === "number" && distance > Number(config.radiusMeters || 0)) {
        setPresenceConfirmed(false);
        setStatusMessage(
          `You are outside the approved classroom zone for ${config.courseCode}. Distance is ${Math.round(distance)} m.`,
        );
        return;
      }

      setPresenceConfirmed(true);
      await syncStudentRegistration({
        lastPresenceCheckDistance:
          typeof distance === "number" ? Math.round(distance) : null,
        presenceConfirmedAt: new Date().toISOString(),
      });
      setStatusMessage(
        `Course verified. ${config.courseCode} attendance is now unlocked for face scan or biometric fallback.`,
      );
    } catch (error) {
      setPresenceConfirmed(false);
      setStatusMessage(error.message || "Could not verify course and classroom presence.");
    } finally {
      setBusyAction("");
    }
  }

  async function attachStreamToVideo(stream) {
    const video = videoRef.current;
    if (!video) throw new Error("Camera element is not ready yet.");

    setVideoReady(false);
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.srcObject = stream;

    await new Promise((resolve, reject) => {
      const timeout = window.setTimeout(
        () => reject(new Error("Camera stream took too long to start.")),
        5000,
      );

      const cleanup = () => {
        window.clearTimeout(timeout);
        video.onloadedmetadata = null;
        video.oncanplay = null;
      };

      const handleReady = () => {
        cleanup();
        resolve();
      };

      video.onloadedmetadata = handleReady;
      video.oncanplay = handleReady;
    });

    try {
      await video.play();
    } catch {
      // Some browsers resolve once the stream is attached even if play()
      // throws before the user gesture chain fully settles.
    }

    if ((video.videoWidth || 0) === 0) {
      await new Promise((resolve) => window.setTimeout(resolve, 300));
    }
    setVideoReady(true);
  }

  async function startCamera() {
    if (!courseConfig?.attendanceOpen) {
      setStatusMessage("Attendance is closed. Wait for the lecturer to start attendance.");
      return;
    }
    if (!presenceConfirmed) {
      setStatusMessage("Confirm course and classroom presence before starting the camera.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      await attachStreamToVideo(stream);
      setCameraOn(true);
      setStatusMessage("Camera ready. The live feed should now be visible for face registration.");
    } catch (error) {
      setCameraOn(false);
      setVideoReady(false);
      setStatusMessage(error.message || "Camera access failed. Allow webcam access and retry.");
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause?.();
      videoRef.current.srcObject = null;
    }
    setVideoReady(false);
    setCameraOn(false);
  }

  function capturePhotoDataUrl() {
    if (!videoRef.current) return null;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.9);
  }

  async function getFaceDescriptor() {
    if (!modelsReady) throw new Error("Face models are still loading.");
    if (!videoRef.current || !cameraOn || !videoReady) {
      throw new Error("Start the camera and wait for the live feed to appear first.");
    }

    const detection = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      throw new Error("No clear face detected. Make sure only one face is visible.");
    }

    return Array.from(detection.descriptor);
  }

  async function pushAttendanceEntryToFirebase(entry) {
    if (!demoSessionId) return;
    saveLocalAttendanceLog(entry);
    try {
      await addDoc(collection(db, ATTENDANCE_LOGS_COLLECTION), {
        ...entry,
        demoSessionId,
        createdAt: serverTimestamp(),
      });
      setFirebaseSyncOk(true);
      setFirebaseStatus("Firebase sync active. Attendance event saved.");
    } catch (error) {
      setFirebaseSyncOk(false);
      setFirebaseStatus(
        `Attendance saved in browser preview storage. Firestore write failed ${error.code || ""}`.trim(),
      );
    }
  }

  function logAttendance(method, details = {}) {
    const entry = {
      id: crypto.randomUUID(),
      at: new Date().toISOString(),
      sessionTitle,
      studentName: registeredProfile?.name || studentName,
      matNumber: matNumber.trim().toUpperCase(),
      courseCode: normalizeCourseCode(courseCode),
      courseTitle: courseConfig?.courseTitle || "",
      lecturerName: courseConfig?.lecturerName || "",
      method,
      classroomRadius: radiusMeters,
      distanceFromClassroom:
        typeof distanceFromClassroom === "number"
          ? Math.round(distanceFromClassroom)
          : null,
      ...details,
    };
    setAttendanceLog((prev) => [entry, ...prev].slice(0, 12));
    void pushAttendanceEntryToFirebase(entry);
  }

  async function ensureInsideClassroomForAttendance() {
    if (!courseConfig?.attendanceOpen) {
      throw new Error("Attendance is currently closed by the lecturer.");
    }
    const latestLocation = (await refreshLocation()) || currentLocation;
    const latestDistance = calculateDistanceMeters(latestLocation, classroomLocation);
    if (classroomLocation && latestLocation && latestDistance > radiusMeters) {
      logAttendance("location-check", {
        result: "blocked",
        reason: "outside-geofence",
        distanceFromClassroom: Math.round(latestDistance),
      });
      throw new Error(
        `You are outside the classroom geofence. Move closer to class and try again.`,
      );
    }
    return latestDistance;
  }

  async function handleRegisterFace() {
    if (!presenceConfirmed) {
      setStatusMessage("Confirm course and classroom presence first.");
      return;
    }

    setBusyAction("face-register");
    setStatusMessage("");
    try {
      const descriptor = await getFaceDescriptor();
      const snapshot = capturePhotoDataUrl();
      const profile = {
        ...registeredProfile,
        name: studentName,
        matNumber: matNumber.trim().toUpperCase(),
        courseCode: normalizeCourseCode(courseCode),
        faceDescriptor: descriptor,
        facePreview: snapshot,
        faceRegisteredAt: new Date().toISOString(),
      };
      setRegisteredProfile(profile);
      await syncStudentRegistration({
        faceRegisteredAt: profile.faceRegisteredAt,
      });
      setStatusMessage("Face registered successfully. You can now verify attendance with a live face scan.");
    } catch (error) {
      setStatusMessage(error.message || "Face registration failed.");
    } finally {
      setBusyAction("");
    }
  }

  async function handleVerifyFace() {
    if (!registeredProfile?.faceDescriptor) {
      setStatusMessage("Register a face first.");
      return;
    }

    setBusyAction("face-verify");
    setStatusMessage("");
    try {
      await ensureInsideClassroomForAttendance();
      const candidate = await getFaceDescriptor();
      const distance = faceapi.euclideanDistance(candidate, registeredProfile.faceDescriptor);
      setLastFaceDistance(distance);

      if (distance > FACE_DISTANCE_THRESHOLD) {
        logAttendance("face-scan", {
          result: "rejected",
          faceDistance: Number(distance.toFixed(4)),
        });
        setStatusMessage(
          `Face mismatch. Distance ${distance.toFixed(4)} exceeded the demo threshold.`,
        );
        return;
      }

      logAttendance("face-scan", {
        result: "accepted",
        faceDistance: Number(distance.toFixed(4)),
      });
      setStatusMessage(
        `Attendance accepted for ${normalizeCourseCode(courseCode)}. Face distance ${distance.toFixed(4)} is within range.`,
      );
    } catch (error) {
      setStatusMessage(error.message || "Face verification failed.");
    } finally {
      setBusyAction("");
    }
  }

  async function handleRegisterBiometric() {
    if (!presenceConfirmed) {
      setStatusMessage("Confirm course and classroom presence first.");
      return;
    }
    if (!window.PublicKeyCredential || !navigator.credentials) {
      setStatusMessage("Passkeys/WebAuthn are not supported on this device.");
      return;
    }

    setBusyAction("biometric-register");
    setStatusMessage("");
    try {
      const userId = randomBytes(16);
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: randomBytes(32),
          rp: { name: "Smart Attendance Demo" },
          user: {
            id: userId,
            name: `${matNumber.trim().toLowerCase()}@demo.local`,
            displayName: studentName,
          },
          pubKeyCredParams: [
            { type: "public-key", alg: -7 },
            { type: "public-key", alg: -257 },
          ],
          timeout: 60000,
          authenticatorSelection: {
            residentKey: "preferred",
            userVerification: "preferred",
          },
          attestation: "none",
        },
      });

      if (!credential) throw new Error("Biometric registration was cancelled.");

      const profile = {
        ...registeredProfile,
        name: studentName,
        matNumber: matNumber.trim().toUpperCase(),
        courseCode: normalizeCourseCode(courseCode),
        passkeyCredentialId: toBase64Url(credential.rawId),
        passkeyUserId: toBase64Url(userId),
        passkeyRegisteredAt: new Date().toISOString(),
      };
      setRegisteredProfile(profile);
      await syncStudentRegistration({
        passkeyRegisteredAt: profile.passkeyRegisteredAt,
      });
      setStatusMessage(
        "Biometric fallback registered. This device can now prompt fingerprint, face unlock, or secure device unlock.",
      );
    } catch (error) {
      setStatusMessage(error.message || "Biometric registration failed.");
    } finally {
      setBusyAction("");
    }
  }

  async function handleBiometricAttendance() {
    if (!registeredProfile?.passkeyCredentialId) {
      setStatusMessage("Register the biometric/passkey step first.");
      return;
    }

    setBusyAction("biometric-attendance");
    setStatusMessage("");
    try {
      await ensureInsideClassroomForAttendance();
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: randomBytes(32),
          allowCredentials: [
            {
              id: fromBase64Url(registeredProfile.passkeyCredentialId),
              type: "public-key",
            },
          ],
          timeout: 60000,
          userVerification: "preferred",
        },
      });

      if (!credential) throw new Error("Biometric authentication was cancelled.");

      logAttendance("biometric", {
        result: "accepted",
        userVerification: "prompted",
      });
      setStatusMessage(
        `Biometric attendance accepted for ${normalizeCourseCode(courseCode)}. The device completed a native biometric prompt.`,
      );
    } catch (error) {
      setStatusMessage(error.message || "Biometric attendance failed.");
    } finally {
      setBusyAction("");
    }
  }

  function resetDemo() {
    stopCamera();
    setRegisteredProfile(null);
    setCourseConfig(null);
    setAttendanceLog([]);
    setLastFaceDistance(null);
    setPresenceConfirmed(false);
    setMatNumber("");
    setCourseCode("");
    setFirebaseSyncOk(false);
    setStatusMessage("Demo reset complete.");
    window.localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-3xl border border-amber-500/25 bg-amber-500/10 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-black">Student Face Scan + Biometric Demo</h1>
              <p className="mt-2 max-w-3xl text-sm text-white/65">
                Students now enter MAT number and course code first. The system loads
                the lecturer’s classroom geofence from Firebase, confirms class
                presence with GPS, then unlocks face scan or fingerprint fallback for attendance.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="/demo/admin"
                className="rounded-2xl border border-indigo-500/25 bg-indigo-500/10 px-4 py-2 text-sm font-semibold text-indigo-200 transition hover:bg-indigo-500/20"
              >
                Lecturer Admin
              </a>
              <StatusPill ok={modelsReady}>
                {modelsReady ? "Face Models Ready" : "Loading Face Models"}
              </StatusPill>
              <StatusPill ok={firebaseSyncOk}>
                {firebaseSyncOk ? "Firebase Sync On" : "Firebase Pending"}
              </StatusPill>
            </div>
          </div>
          {modelsError ? (
            <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {modelsError}
            </div>
          ) : null}
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/65">
            {firebaseStatus}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">1. Student Registration + Course Check</h2>
                  <p className="text-sm text-white/50">
                    Enter your MAT number and course code, then verify you are inside the lecturer’s classroom geofence.
                  </p>
                </div>
                <button
                  onClick={refreshLocation}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10"
                >
                  <RefreshCw size={14} />
                  Refresh GPS
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-white/75">Student name</span>
                  <input
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#12121A] px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-white/75">MAT number</span>
                  <input
                    value={matNumber}
                    onChange={(e) => setMatNumber(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#12121A] px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500"
                  />
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-medium text-white/75">Course code</span>
                  <input
                    value={courseCode}
                    onChange={(e) => setCourseCode(normalizeCourseCode(e.target.value))}
                    className="w-full rounded-2xl border border-white/10 bg-[#12121A] px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500"
                  />
                </label>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                    <MapPin size={16} className="text-indigo-400" />
                    Current device location
                  </div>
                  <p className="text-sm text-white/60">
                    {currentLocation
                      ? `${currentLocation.lat.toFixed(5)}, ${currentLocation.lng.toFixed(5)}`
                      : locationError || "Location not loaded yet."}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                    <Shield size={16} className="text-emerald-400" />
                    Lecturer classroom setup
                  </div>
                  <p className="text-sm text-white/60">
                    {courseConfig
                      ? `${courseConfig.courseCode} · ${courseConfig.courseTitle}`
                      : "No course loaded yet."}
                  </p>
                  {courseConfig ? (
                    <div className="mt-2 text-xs text-white/50">
                      Lecturer: {courseConfig.lecturerName || "N/A"} · Radius: {courseConfig.radiusMeters}m
                    </div>
                  ) : null}
                  {courseConfig ? (
                    <div className="mt-2 text-xs text-white/50">
                      Attendance: {courseConfig.attendanceOpen ? "open" : "closed"}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={confirmCourseAndPresence}
                  disabled={busyAction !== ""}
                  className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
                >
                  {busyAction === "course-presence" ? (
                    <LoaderCircle size={16} className="animate-spin" />
                  ) : (
                    <CheckCircle size={16} />
                  )}
                  Confirm Course And Class Presence
                </button>
                <StatusPill ok={presenceConfirmed}>
                  {presenceConfirmed
                    ? `Presence confirmed (${formatDistance(distanceFromClassroom)})`
                    : "Presence not confirmed"}
                </StatusPill>
                <StatusPill ok={!!courseConfig?.attendanceOpen}>
                  {courseConfig?.attendanceOpen ? "Attendance open" : "Attendance closed"}
                </StatusPill>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">2. Face Registration And Attendance</h2>
                  <p className="text-sm text-white/50">
                    After the course is validated, start the camera, register your face, then scan again for attendance.
                  </p>
                </div>
                <div className="flex gap-2">
                  {!cameraOn ? (
                    <button
                      onClick={startCamera}
                      className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
                    >
                      <Camera size={14} />
                      Start Camera
                    </button>
                  ) : (
                    <button
                      onClick={stopCamera}
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10"
                    >
                      Stop Camera
                    </button>
                  )}
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/40">
                  <div className="relative aspect-video">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`h-full w-full object-cover ${cameraOn ? "block" : "hidden"}`}
                    />
                    {!cameraOn ? (
                      <div className="absolute inset-0 flex items-center justify-center text-white/35">
                        <div className="text-center">
                          <Camera size={42} className="mx-auto mb-3" />
                          Camera preview will appear here
                        </div>
                      </div>
                    ) : !videoReady ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/65 text-sm text-white/70">
                        Waiting for live camera feed...
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleRegisterFace}
                    disabled={!cameraOn || !videoReady || !modelsReady || busyAction !== ""}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white transition hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50"
                  >
                    {busyAction === "face-register" ? (
                      <LoaderCircle size={16} className="animate-spin" />
                    ) : (
                      <UserCheck size={16} />
                    )}
                    Register Face
                  </button>

                  <button
                    onClick={handleVerifyFace}
                    disabled={!cameraOn || !videoReady || !registeredProfile?.faceDescriptor || busyAction !== ""}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                  >
                    {busyAction === "face-verify" ? (
                      <LoaderCircle size={16} className="animate-spin" />
                    ) : (
                      <CheckCircle size={16} />
                    )}
                    Scan Face For Attendance
                  </button>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="mb-2 text-sm font-semibold text-white">Registered face profile</div>
                    {registeredProfile?.facePreview ? (
                      <div className="flex items-center gap-3">
                        <img
                          src={registeredProfile.facePreview}
                          alt="Registered student preview"
                          className="h-16 w-16 rounded-2xl object-cover"
                        />
                        <div className="text-sm text-white/65">
                          <div className="font-semibold text-white">{registeredProfile.name}</div>
                          <div>{registeredProfile.matNumber} · {registeredProfile.courseCode}</div>
                          <div>
                            Face registered{" "}
                            {new Date(registeredProfile.faceRegisteredAt).toLocaleTimeString()}
                          </div>
                          {lastFaceDistance != null ? (
                            <div>Last face distance: {lastFaceDistance.toFixed(4)}</div>
                          ) : null}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-white/45">No registered face yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-xl font-bold">3. Fingerprint / Biometric Fallback</h2>
              <p className="mt-1 text-sm text-white/50">
                If the face scan is unavailable, students can register and use a passkey-backed biometric prompt as a secure fallback.
              </p>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <button
                  onClick={handleRegisterBiometric}
                  disabled={busyAction !== ""}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-3 text-sm font-semibold text-indigo-200 transition hover:bg-indigo-500/20 disabled:opacity-50"
                >
                  {busyAction === "biometric-register" ? (
                    <LoaderCircle size={16} className="animate-spin" />
                  ) : (
                    <Fingerprint size={16} />
                  )}
                  Register Device Biometric
                </button>
                <button
                  onClick={handleBiometricAttendance}
                  disabled={!registeredProfile?.passkeyCredentialId || busyAction !== ""}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20 disabled:opacity-50"
                >
                  {busyAction === "biometric-attendance" ? (
                    <LoaderCircle size={16} className="animate-spin" />
                  ) : (
                    <Shield size={16} />
                  )}
                  Use Fingerprint / Biometric
                </button>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/60">
                <div className="font-semibold text-white">Biometric status</div>
                <div className="mt-2">
                  {registeredProfile?.passkeyCredentialId
                    ? "Passkey registered for this browser/device."
                    : "No biometric/passkey registered yet."}
                </div>
                <div className="mt-2">
                  Lecturer approval path: {courseConfig?.lecturerName || "No lecturer course loaded"}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-xl font-bold">Demo Status</h2>
              <div className="mt-4 grid gap-3">
                <StatusPill ok={modelsReady}>
                  {modelsReady ? "Face recognition models loaded" : "Loading models"}
                </StatusPill>
                <StatusPill ok={firebaseSyncOk}>
                  {firebaseSyncOk ? "Firebase sync active" : "Firebase sync pending"}
                </StatusPill>
                <StatusPill ok={presenceConfirmed}>
                  {presenceConfirmed ? "Course and location confirmed" : "Course not confirmed"}
                </StatusPill>
                <StatusPill ok={!!courseConfig?.attendanceOpen}>
                  {courseConfig?.attendanceOpen ? "Lecturer opened attendance" : "Lecturer has not opened attendance"}
                </StatusPill>
                <StatusPill ok={cameraOn && videoReady}>
                  {cameraOn && videoReady ? "Live camera feed visible" : "Camera feed not active"}
                </StatusPill>
                <StatusPill ok={!!registeredProfile?.faceDescriptor}>
                  {registeredProfile?.faceDescriptor ? "Face profile registered" : "Face profile not registered"}
                </StatusPill>
                <StatusPill ok={!!registeredProfile?.passkeyCredentialId}>
                  {registeredProfile?.passkeyCredentialId
                    ? "Biometric/passkey registered"
                    : "Biometric/passkey not registered"}
                </StatusPill>
              </div>

              <div
                className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
                  statusMessage.includes("failed") ||
                  statusMessage.includes("mismatch") ||
                  statusMessage.includes("outside")
                    ? "border-red-500/30 bg-red-500/10 text-red-200"
                    : "border-white/10 bg-black/20 text-white/70"
                }`}
              >
                {statusMessage || "Ready for the live demo."}
              </div>

              <button
                onClick={resetDemo}
                className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-200 transition hover:bg-red-500/20"
              >
                <Trash2 size={14} />
                Reset Demo
              </button>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-xl font-bold">Loaded Course</h2>
              <div className="mt-4 text-sm text-white/65">
                {courseConfig ? (
                  <div className="space-y-2">
                    <div>{courseConfig.courseCode} · {courseConfig.courseTitle}</div>
                    <div>Lecturer: {courseConfig.lecturerName || "N/A"}</div>
                    <div>Classroom radius: {courseConfig.radiusMeters} m</div>
                    <div>
                      Classroom: {classroomLocation?.lat?.toFixed(5)}, {classroomLocation?.lng?.toFixed(5)}
                    </div>
                    <div>Current distance: {formatDistance(distanceFromClassroom)}</div>
                  </div>
                ) : (
                  <div>No lecturer course has been loaded yet.</div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-xl font-bold">Attendance Log</h2>
                <span className="text-xs text-white/40">
                  {attendanceLog.length} event{attendanceLog.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="space-y-3">
                {attendanceLog.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-white/40">
                    No demo attendance events yet.
                  </div>
                ) : (
                  attendanceLog.map((entry) => (
                    <div key={entry.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-white">
                            {entry.studentName} · {entry.matNumber} · {entry.courseCode}
                          </div>
                          <div className="mt-1 text-xs text-white/45">
                            {new Date(entry.at).toLocaleString()}
                          </div>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            entry.result === "accepted"
                              ? "bg-emerald-500/15 text-emerald-300"
                              : entry.result === "blocked" || entry.result === "rejected"
                                ? "bg-red-500/15 text-red-300"
                                : "bg-white/10 text-white/65"
                          }`}
                        >
                          {entry.result || "recorded"}
                        </span>
                      </div>
                      <div className="mt-3 grid gap-2 text-xs text-white/55">
                        <div>Method: {entry.method}</div>
                        <div>Course: {entry.courseTitle || entry.sessionTitle}</div>
                        <div>Distance: {formatDistance(entry.distanceFromClassroom)}</div>
                        {entry.faceDistance != null ? <div>Face distance: {entry.faceDistance}</div> : null}
                        {entry.reason ? <div>Reason: {entry.reason}</div> : null}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
