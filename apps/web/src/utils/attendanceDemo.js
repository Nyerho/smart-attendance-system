"use client";

export const COURSE_CONFIGS_COLLECTION = "courseConfigs";
export const STUDENT_REGISTRATIONS_COLLECTION = "studentRegistrations";
export const ATTENDANCE_LOGS_COLLECTION = "demoAttendanceLogs";
export const DEMO_SESSIONS_COLLECTION = "demoSessions";

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
