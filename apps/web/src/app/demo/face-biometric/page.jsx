"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as faceapi from "face-api.js";
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
  XCircle,
} from "lucide-react";

const MODELS_URL = "https://justadudewhohacks.github.io/face-api.js/models";
const STORAGE_KEY = "smart-attendance-face-biometric-demo";
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
  const [busyAction, setBusyAction] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [sessionTitle, setSessionTitle] = useState("Vice Chancellor Demo Session");
  const [radiusMeters, setRadiusMeters] = useState(80);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [registeredProfile, setRegisteredProfile] = useState(null);
  const [classroomLocation, setClassroomLocation] = useState(null);
  const [attendanceLog, setAttendanceLog] = useState([]);
  const [studentName, setStudentName] = useState("Demo Student");
  const [lastFaceDistance, setLastFaceDistance] = useState(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      setSessionTitle(parsed.sessionTitle || "Vice Chancellor Demo Session");
      setRadiusMeters(parsed.radiusMeters || 80);
      setRegisteredProfile(parsed.registeredProfile || null);
      setClassroomLocation(parsed.classroomLocation || null);
      setAttendanceLog(parsed.attendanceLog || []);
      setStudentName(parsed.studentName || "Demo Student");
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        sessionTitle,
        radiusMeters,
        registeredProfile,
        classroomLocation,
        attendanceLog,
        studentName,
      }),
    );
  }, [
    attendanceLog,
    classroomLocation,
    radiusMeters,
    registeredProfile,
    sessionTitle,
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
      } catch (error) {
        if (!cancelled) {
          setModelsError(
            "Could not load face models. Check internet access before the demo.",
          );
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

  const distanceFromClassroom = useMemo(
    () => calculateDistanceMeters(currentLocation, classroomLocation),
    [classroomLocation, currentLocation],
  );
  const insideClassroom =
    classroomLocation && currentLocation
      ? distanceFromClassroom <= Number(radiusMeters)
      : false;

  async function refreshLocation() {
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported in this browser.");
      return;
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

  async function startCamera() {
    if (streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      setCameraOn(true);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraOn(true);
      setStatusMessage("Camera ready. Align one face in the frame.");
    } catch (error) {
      setStatusMessage("Camera access failed. Allow webcam access and retry.");
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
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
    if (!videoRef.current || !cameraOn) throw new Error("Turn on the camera first.");

    const detection = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      throw new Error("No clear face detected. Make sure only one face is visible.");
    }

    return Array.from(detection.descriptor);
  }

  function logAttendance(method, details = {}) {
    const entry = {
      id: crypto.randomUUID(),
      at: new Date().toISOString(),
      sessionTitle,
      studentName: registeredProfile?.name || studentName,
      method,
      classroomRadius: Number(radiusMeters),
      distanceFromClassroom:
        typeof distanceFromClassroom === "number"
          ? Math.round(distanceFromClassroom)
          : null,
      ...details,
    };
    setAttendanceLog((prev) => [entry, ...prev].slice(0, 12));
  }

  async function handleRegisterFace() {
    setBusyAction("face-register");
    setStatusMessage("");
    try {
      const descriptor = await getFaceDescriptor();
      const snapshot = capturePhotoDataUrl();
      setRegisteredProfile((prev) => ({
        ...prev,
        name: studentName,
        faceDescriptor: descriptor,
        facePreview: snapshot,
        faceRegisteredAt: new Date().toISOString(),
      }));
      setStatusMessage("Face registered successfully for demo verification.");
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
      await refreshLocation();
      const candidate = await getFaceDescriptor();
      const distance = faceapi.euclideanDistance(
        candidate,
        registeredProfile.faceDescriptor,
      );
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
        `Face matched successfully. Distance ${distance.toFixed(4)} is within range.`,
      );
    } catch (error) {
      setStatusMessage(error.message || "Face verification failed.");
    } finally {
      setBusyAction("");
    }
  }

  async function handleRegisterBiometric() {
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
            name: `${studentName.toLowerCase().replace(/\s+/g, ".")}@demo.local`,
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

      setRegisteredProfile((prev) => ({
        ...prev,
        name: studentName,
        passkeyCredentialId: toBase64Url(credential.rawId),
        passkeyUserId: toBase64Url(userId),
        passkeyRegisteredAt: new Date().toISOString(),
      }));
      setStatusMessage(
        "Biometric/passkey registered. Supported devices will now prompt fingerprint, face, or secure unlock.",
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
      const latestLocation = (await refreshLocation()) || currentLocation;
      const latestDistance = calculateDistanceMeters(latestLocation, classroomLocation);

      if (classroomLocation && latestLocation && latestDistance > Number(radiusMeters)) {
        logAttendance("biometric", {
          result: "blocked",
          reason: "outside-geofence",
          distanceFromClassroom: Math.round(latestDistance),
        });
        setStatusMessage(
          `Biometric fallback blocked. Device is ${Math.round(latestDistance)} m from the classroom zone.`,
        );
        return;
      }

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
        "Biometric attendance accepted. The device completed a native passkey/biometric prompt.",
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
    setClassroomLocation(null);
    setAttendanceLog([]);
    setLastFaceDistance(null);
    setStatusMessage("Demo reset complete.");
    window.localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-3xl border border-amber-500/25 bg-amber-500/10 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-black">Face Scan + Biometric Demo</h1>
              <p className="mt-2 max-w-3xl text-sm text-white/65">
                Demo mode for today’s presentation: face registration and face
                verification run in the browser with `face-api.js`, while biometric
                fallback uses native WebAuthn/passkey prompts on supported devices.
                Attendance logs are stored locally in this browser for a smooth demo.
              </p>
            </div>
            <StatusPill ok={modelsReady}>
              {modelsReady ? "Face Models Ready" : "Loading Face Models"}
            </StatusPill>
          </div>
          {modelsError ? (
            <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {modelsError}
            </div>
          ) : null}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">1. Session + Proximity Setup</h2>
                  <p className="text-sm text-white/50">
                    Use your current position as the classroom zone for the demo.
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
                  <span className="text-sm font-medium text-white/75">Session title</span>
                  <input
                    value={sessionTitle}
                    onChange={(e) => setSessionTitle(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#12121A] px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-white/75">Classroom radius</span>
                  <select
                    value={radiusMeters}
                    onChange={(e) => setRadiusMeters(Number(e.target.value))}
                    className="w-full rounded-2xl border border-white/10 bg-[#12121A] px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500"
                  >
                    {[30, 50, 80, 100, 150].map((value) => (
                      <option key={value} value={value}>
                        {value} meters
                      </option>
                    ))}
                  </select>
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
                    Classroom zone
                  </div>
                  <p className="text-sm text-white/60">
                    {classroomLocation
                      ? `${classroomLocation.lat.toFixed(5)}, ${classroomLocation.lng.toFixed(5)}`
                      : "Not set yet. Capture your current location as the classroom anchor."}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={async () => {
                    const location = currentLocation || (await refreshLocation());
                    if (!location) {
                      setStatusMessage("Could not set classroom location without GPS.");
                      return;
                    }
                    setClassroomLocation(location);
                    setStatusMessage("Classroom location captured from this device.");
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
                >
                  <MapPin size={16} />
                  Use Current Location As Classroom
                </button>
                <StatusPill ok={!!classroomLocation && insideClassroom}>
                  {classroomLocation
                    ? insideClassroom
                      ? "Inside Classroom Zone"
                      : `Outside Zone (${formatDistance(distanceFromClassroom)})`
                    : "Classroom Zone Not Set"}
                </StatusPill>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">2. Camera + Face Registration</h2>
                  <p className="text-sm text-white/50">
                    Register one face, then scan again to prove a live match.
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
                  <div className="aspect-video">
                    {cameraOn ? (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-white/35">
                        <div className="text-center">
                          <Camera size={42} className="mx-auto mb-3" />
                          Camera preview will appear here
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-white/75">Student name</span>
                    <input
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-[#12121A] px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500"
                    />
                  </label>

                  <button
                    onClick={handleRegisterFace}
                    disabled={!cameraOn || !modelsReady || busyAction !== ""}
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
                    disabled={!cameraOn || !registeredProfile?.faceDescriptor || busyAction !== ""}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                  >
                    {busyAction === "face-verify" ? (
                      <LoaderCircle size={16} className="animate-spin" />
                    ) : (
                      <CheckCircle size={16} />
                    )}
                    Verify Face And Mark Attendance
                  </button>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="mb-2 text-sm font-semibold text-white">
                      Registered student
                    </div>
                    {registeredProfile?.facePreview ? (
                      <div className="flex items-center gap-3">
                        <img
                          src={registeredProfile.facePreview}
                          alt="Registered student preview"
                          className="h-16 w-16 rounded-2xl object-cover"
                        />
                        <div className="text-sm text-white/65">
                          <div className="font-semibold text-white">
                            {registeredProfile.name}
                          </div>
                          <div>
                            Face registered{" "}
                            {new Date(
                              registeredProfile.faceRegisteredAt,
                            ).toLocaleTimeString()}
                          </div>
                          {lastFaceDistance != null ? (
                            <div>Last face distance: {lastFaceDistance.toFixed(4)}</div>
                          ) : null}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-white/45">
                        No registered face yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-xl font-bold">3. Biometric Fallback</h2>
              <p className="mt-1 text-sm text-white/50">
                This uses the device’s native passkey/WebAuthn prompt. On supported
                phones and laptops it will trigger fingerprint, face unlock, or the
                secure device unlock method.
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
                  Biometric Check-In
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
                  Geofence check:{" "}
                  {classroomLocation
                    ? insideClassroom
                      ? "inside classroom radius"
                      : "outside classroom radius"
                    : "classroom not configured"}
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
                <StatusPill ok={!!registeredProfile?.faceDescriptor}>
                  {registeredProfile?.faceDescriptor
                    ? "Face profile registered"
                    : "Face profile not registered"}
                </StatusPill>
                <StatusPill ok={!!registeredProfile?.passkeyCredentialId}>
                  {registeredProfile?.passkeyCredentialId
                    ? "Biometric/passkey registered"
                    : "Biometric/passkey not registered"}
                </StatusPill>
                <StatusPill ok={!classroomLocation || insideClassroom}>
                  {classroomLocation
                    ? `Geofence distance: ${formatDistance(distanceFromClassroom)}`
                    : "No classroom geofence set"}
                </StatusPill>
              </div>

              <div
                className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
                  statusMessage.includes("failed") ||
                  statusMessage.includes("mismatch") ||
                  statusMessage.includes("blocked")
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
              <h2 className="text-xl font-bold">Demo Script</h2>
              <div className="mt-4 space-y-3 text-sm text-white/65">
                <p>1. Refresh location and set the classroom zone from your current device.</p>
                <p>2. Start the camera and register the student face.</p>
                <p>3. Register the device biometric or passkey.</p>
                <p>4. Run a face verification check-in.</p>
                <p>5. Move outside the zone or change the radius to show fallback blocking.</p>
                <p>6. Run biometric check-in to show the native fingerprint or face unlock prompt.</p>
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
                    <div
                      key={entry.id}
                      className="rounded-2xl border border-white/10 bg-black/20 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-white">
                            {entry.studentName} · {entry.method}
                          </div>
                          <div className="mt-1 text-xs text-white/45">
                            {new Date(entry.at).toLocaleString()}
                          </div>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            entry.result === "accepted"
                              ? "bg-emerald-500/15 text-emerald-300"
                              : entry.result === "blocked" ||
                                  entry.result === "rejected"
                                ? "bg-red-500/15 text-red-300"
                                : "bg-white/10 text-white/65"
                          }`}
                        >
                          {entry.result || "recorded"}
                        </span>
                      </div>
                      <div className="mt-3 grid gap-2 text-xs text-white/55">
                        <div>Session: {entry.sessionTitle}</div>
                        <div>
                          Geofence distance: {formatDistance(entry.distanceFromClassroom)}
                        </div>
                        {entry.faceDistance != null ? (
                          <div>Face distance: {entry.faceDistance}</div>
                        ) : null}
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
