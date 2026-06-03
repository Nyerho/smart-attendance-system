"use client";

export const COURSE_CONFIGS_COLLECTION = "courseConfigs";
export const STUDENT_REGISTRATIONS_COLLECTION = "studentRegistrations";
export const ATTENDANCE_LOGS_COLLECTION = "demoAttendanceLogs";
export const DEMO_SESSIONS_COLLECTION = "demoSessions";
export const LOCAL_COURSE_CONFIGS_KEY = "smart-attendance-demo-course-configs";
export const LOCAL_STUDENT_REGISTRATIONS_KEY = "smart-attendance-demo-student-registrations";
export const LOCAL_ATTENDANCE_LOGS_KEY = "smart-attendance-demo-attendance-logs";

export function normalizeCourseCode(value) {
  return (value || "").trim().toUpperCase();
}

export function buildRegistrationId(matNumber, courseCode) {
  return `${(matNumber || "").trim().toUpperCase()}__${normalizeCourseCode(courseCode)}`;
}

export function formatTimestamp(value) {
  if (!value) return "N/A";
  if (typeof value === "string" || typeof value === "number") {
    return new Date(value).toLocaleString();
  }
  if (typeof value?.toDate === "function") {
    return value.toDate().toLocaleString();
  }
  return "N/A";
}

function canUseBrowserStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readLocalArray(key) {
  if (!canUseBrowserStorage()) return [];
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalArray(key, items) {
  if (!canUseBrowserStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(items));
}

function upsertItem(items, item, match) {
  const index = items.findIndex(match);
  if (index === -1) return [item, ...items];
  const next = [...items];
  next[index] = { ...next[index], ...item };
  return next;
}

export function readLocalCourseConfigs() {
  return readLocalArray(LOCAL_COURSE_CONFIGS_KEY);
}

export function saveLocalCourseConfig(config) {
  const normalized = {
    id: normalizeCourseCode(config.courseCode),
    attendanceOpen: false,
    ...config,
    courseCode: normalizeCourseCode(config.courseCode),
    updatedAt: config.updatedAt || new Date().toISOString(),
  };
  const next = upsertItem(
    readLocalCourseConfigs(),
    normalized,
    (item) => normalizeCourseCode(item.courseCode) === normalized.courseCode,
  );
  writeLocalArray(LOCAL_COURSE_CONFIGS_KEY, next);
  return normalized;
}

export function getLocalCourseConfig(courseCode) {
  const normalizedCode = normalizeCourseCode(courseCode);
  return readLocalCourseConfigs().find(
    (item) => normalizeCourseCode(item.courseCode) === normalizedCode,
  );
}

export function updateLocalAttendanceState(courseCode, attendanceOpen) {
  const normalizedCode = normalizeCourseCode(courseCode);
  const config = getLocalCourseConfig(normalizedCode);
  if (!config) return null;
  return saveLocalCourseConfig({
    ...config,
    attendanceOpen,
    attendanceStartedAt: attendanceOpen ? new Date().toISOString() : null,
    attendanceStoppedAt: attendanceOpen ? null : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export function readLocalStudentRegistrations() {
  return readLocalArray(LOCAL_STUDENT_REGISTRATIONS_KEY);
}

export function saveLocalStudentRegistration(registration) {
  const normalized = {
    id:
      registration.id ||
      buildRegistrationId(registration.matNumber, registration.courseCode),
    ...registration,
    matNumber: (registration.matNumber || "").trim().toUpperCase(),
    courseCode: normalizeCourseCode(registration.courseCode),
    updatedAt: registration.updatedAt || new Date().toISOString(),
  };
  const next = upsertItem(
    readLocalStudentRegistrations(),
    normalized,
    (item) => item.id === normalized.id,
  );
  writeLocalArray(LOCAL_STUDENT_REGISTRATIONS_KEY, next);
  return normalized;
}

export function readLocalAttendanceLogs() {
  return readLocalArray(LOCAL_ATTENDANCE_LOGS_KEY);
}

export function saveLocalAttendanceLog(entry) {
  const normalized = {
    ...entry,
    id: entry.id || `attendance-${Date.now()}`,
    at: entry.at || new Date().toISOString(),
  };
  const next = upsertItem(readLocalAttendanceLogs(), normalized, (item) => item.id === normalized.id);
  writeLocalArray(LOCAL_ATTENDANCE_LOGS_KEY, next);
  return normalized;
}
