"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import {
  CheckCircle,
  MapPin,
  Play,
  RefreshCw,
  Save,
  Shield,
  Square,
  Users,
} from "lucide-react";
import { db, initFirebaseAnalytics } from "@/utils/firebase.client";
import {
  ATTENDANCE_LOGS_COLLECTION,
  COURSE_CONFIGS_COLLECTION,
  STUDENT_REGISTRATIONS_COLLECTION,
  formatTimestamp,
  normalizeCourseCode,
} from "@/utils/attendanceDemo";

function groupByCourse(items) {
  return items.reduce((acc, item) => {
    const key = normalizeCourseCode(item.courseCode || "UNASSIGNED");
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

export default function DemoAdminPage() {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("Ready to configure lecturer attendance.");
  const [configs, setConfigs] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [form, setForm] = useState({
    lecturerName: "",
    lecturerEmail: "",
    courseCode: "",
    courseTitle: "",
    radiusMeters: 80,
    classroomLocation: null,
  });

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
          setLocationError(error.message || "Unable to read current location.");
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    });
  }

  async function refreshData() {
    setBusy(true);
    try {
      await initFirebaseAnalytics();
      const [configSnapshot, registrationSnapshot, attendanceSnapshot] = await Promise.all([
        getDocs(collection(db, COURSE_CONFIGS_COLLECTION)),
        getDocs(collection(db, STUDENT_REGISTRATIONS_COLLECTION)),
        getDocs(collection(db, ATTENDANCE_LOGS_COLLECTION)),
      ]);

      setConfigs(
        configSnapshot.docs
          .map((entry) => ({ id: entry.id, ...entry.data() }))
          .sort((a, b) => normalizeCourseCode(a.courseCode).localeCompare(normalizeCourseCode(b.courseCode))),
      );
      setRegistrations(
        registrationSnapshot.docs
          .map((entry) => ({ id: entry.id, ...entry.data() }))
          .sort((a, b) => normalizeCourseCode(a.courseCode).localeCompare(normalizeCourseCode(b.courseCode))),
      );
      setAttendanceLogs(
        attendanceSnapshot.docs
          .map((entry) => ({ id: entry.id, ...entry.data() }))
          .sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0)),
      );
      setStatus("Lecturer setup and attendance data refreshed from Firebase.");
    } catch (error) {
      setStatus(`Firebase read failed. Check Firestore rules. ${error.code || ""}`.trim());
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    refreshData();
  }, []);

  const groupedLogs = useMemo(() => groupByCourse(attendanceLogs), [attendanceLogs]);
  const groupedRegistrations = useMemo(() => groupByCourse(registrations), [registrations]);

  async function handleSaveCourseConfig() {
    const courseCode = normalizeCourseCode(form.courseCode);
    if (!courseCode || !form.lecturerName || !form.courseTitle) {
      setStatus("Lecturer name, course code, and course title are required.");
      return;
    }
    if (!form.classroomLocation) {
      setStatus("Set the classroom location before saving this course.");
      return;
    }

    setBusy(true);
    try {
      await setDoc(
        doc(db, COURSE_CONFIGS_COLLECTION, courseCode),
        {
          lecturerName: form.lecturerName.trim(),
          lecturerEmail: form.lecturerEmail.trim(),
          courseCode,
          courseTitle: form.courseTitle.trim(),
          radiusMeters: Number(form.radiusMeters),
          classroomLocation: form.classroomLocation,
          attendanceOpen: false,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      setStatus(`Course ${courseCode} saved. Students can now register and attend with this geofence.`);
      await refreshData();
    } catch (error) {
      setStatus(`Could not save course config. ${error.code || ""}`.trim());
    } finally {
      setBusy(false);
    }
  }

  async function updateAttendanceState(courseCode, attendanceOpen) {
    setBusy(true);
    try {
      await setDoc(
        doc(db, COURSE_CONFIGS_COLLECTION, courseCode),
        {
          attendanceOpen,
          attendanceStartedAt: attendanceOpen ? serverTimestamp() : null,
          attendanceStoppedAt: attendanceOpen ? null : serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      setStatus(
        attendanceOpen
          ? `Attendance started for ${courseCode}. Students can now check in.`
          : `Attendance stopped for ${courseCode}. Students can no longer check in.`,
      );
      await refreshData();
    } catch (error) {
      setStatus(`Could not update attendance state. ${error.code || ""}`.trim());
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-3xl border border-indigo-500/25 bg-indigo-500/10 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-black">Lecturer Admin Attendance</h1>
              <p className="mt-2 max-w-3xl text-sm text-white/65">
                Configure a course, set the classroom geofence from the lecturer’s
                current location, and review registrations plus attendance grouped
                by course code.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="/demo/face-biometric"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10"
              >
                Student Demo
              </a>
              <button
                onClick={refreshData}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
              >
                <RefreshCw size={14} />
                Refresh Data
              </button>
            </div>
          </div>
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/70">
            {status}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-xl font-bold">Course Setup</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-white/75">Lecturer name</span>
                <input
                  value={form.lecturerName}
                  onChange={(e) => setForm((prev) => ({ ...prev, lecturerName: e.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-[#12121A] px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-white/75">Lecturer email</span>
                <input
                  value={form.lecturerEmail}
                  onChange={(e) => setForm((prev) => ({ ...prev, lecturerEmail: e.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-[#12121A] px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-white/75">Course code</span>
                <input
                  value={form.courseCode}
                  onChange={(e) => setForm((prev) => ({ ...prev, courseCode: normalizeCourseCode(e.target.value) }))}
                  className="w-full rounded-2xl border border-white/10 bg-[#12121A] px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-white/75">Course title</span>
                <input
                  value={form.courseTitle}
                  onChange={(e) => setForm((prev) => ({ ...prev, courseTitle: e.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-[#12121A] px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
                />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-white/75">Allowed classroom radius</span>
                <select
                  value={form.radiusMeters}
                  onChange={(e) => setForm((prev) => ({ ...prev, radiusMeters: Number(e.target.value) }))}
                  className="w-full rounded-2xl border border-white/10 bg-[#12121A] px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
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
                  Current lecturer location
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
                  Classroom geofence
                </div>
                <p className="text-sm text-white/60">
                  {form.classroomLocation
                    ? `${form.classroomLocation.lat.toFixed(5)}, ${form.classroomLocation.lng.toFixed(5)}`
                    : "Not set yet."}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={refreshLocation}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/10 disabled:opacity-50"
              >
                <MapPin size={16} />
                Refresh Location
              </button>
              <button
                onClick={async () => {
                  const location = currentLocation || (await refreshLocation());
                  if (!location) {
                    setStatus("Could not read current lecturer location.");
                    return;
                  }
                  setForm((prev) => ({ ...prev, classroomLocation: location }));
                  setStatus("Classroom location copied from the lecturer’s current position.");
                }}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
              >
                <CheckCircle size={16} />
                Use Current Location As Classroom
              </button>
              <button
                onClick={handleSaveCourseConfig}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
              >
                <Save size={16} />
                Save Lecturer Course
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-xl font-bold">Saved Course Configurations</h2>
            <div className="mt-4 space-y-3">
              {configs.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-white/40">
                  No lecturer course configs saved yet.
                </div>
              ) : (
                configs.map((config) => (
                  <div key={config.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-white">
                          {config.courseCode} · {config.courseTitle}
                        </div>
                        <div className="mt-1 text-xs text-white/50">
                          Lecturer: {config.lecturerName || "N/A"} · {config.lecturerEmail || "No email"}
                        </div>
                      </div>
                      <span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-300">
                        {config.radiusMeters || 0}m radius
                      </span>
                    </div>
                    <div className="mt-3 text-xs text-white/55">
                      Classroom:{" "}
                      {config.classroomLocation
                        ? `${config.classroomLocation.lat.toFixed(5)}, ${config.classroomLocation.lng.toFixed(5)}`
                        : "Not set"}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          config.attendanceOpen
                            ? "bg-emerald-500/15 text-emerald-300"
                            : "bg-amber-500/15 text-amber-300"
                        }`}
                      >
                        {config.attendanceOpen ? "Attendance Open" : "Attendance Closed"}
                      </span>
                      <button
                        onClick={() => updateAttendanceState(config.courseCode, true)}
                        disabled={busy || config.attendanceOpen}
                        className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                      >
                        <Play size={12} />
                        Start
                      </button>
                      <button
                        onClick={() => updateAttendanceState(config.courseCode, false)}
                        disabled={busy || !config.attendanceOpen}
                        className="inline-flex items-center gap-1 rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
                      >
                        <Square size={12} />
                        Stop
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="mb-4 flex items-center gap-2">
              <Users size={18} className="text-indigo-300" />
              <h2 className="text-xl font-bold">Registered Students By Course</h2>
            </div>
            <div className="space-y-4">
              {Object.keys(groupedRegistrations).length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-white/40">
                  No student registrations yet.
                </div>
              ) : (
                Object.entries(groupedRegistrations).map(([courseCode, items]) => (
                  <div key={courseCode} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="mb-3 text-sm font-semibold text-white">
                      {courseCode} · {items.length} student{items.length === 1 ? "" : "s"}
                    </div>
                    <div className="space-y-2">
                      {items.map((student) => (
                        <div key={student.id} className="rounded-xl bg-white/5 px-3 py-2 text-xs text-white/70">
                          {student.studentName} · {student.matNumber} · {student.courseTitle || "Untitled course"}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="mb-4 flex items-center gap-2">
              <CheckCircle size={18} className="text-emerald-300" />
              <h2 className="text-xl font-bold">Attendance By Course</h2>
            </div>
            <div className="space-y-4">
              {Object.keys(groupedLogs).length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-white/40">
                  No attendance logs yet.
                </div>
              ) : (
                Object.entries(groupedLogs).map(([courseCode, items]) => (
                  <div key={courseCode} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="mb-3 text-sm font-semibold text-white">
                      {courseCode} · {items.length} event{items.length === 1 ? "" : "s"}
                    </div>
                    <div className="space-y-2">
                      {items.slice(0, 8).map((entry) => (
                        <div key={entry.id} className="rounded-xl bg-white/5 px-3 py-2 text-xs text-white/70">
                          {entry.studentName} · {entry.matNumber || "No MAT"} · {entry.method} · {entry.result || "recorded"} · {formatTimestamp(entry.at)}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
