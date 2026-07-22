// CIST Attendance Shared Data Service
import { studentDb } from './db.js';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 
  ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000/api'
    : '/api');

const STORAGE_KEY = 'cist_attendance_records';

export const getLocalDateString = (d = new Date()) => {
  const offset = d.getTimezoneOffset();
  const localDate = new Date(d.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split('T')[0];
};

export const getLocalAttendanceRecords = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const setLocalAttendanceRecords = (records) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
};

export async function submitFacultyAttendance(records) {
  let apiSuccess = false;
  try {
    const response = await fetch(`${API_BASE_URL}/attendance/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ records }),
    });
    const data = await response.json().catch(() => ({}));
    if (response.ok && data.success) {
      apiSuccess = true;
    }
  } catch (err) {
    // API unreachable, fallback to local storage
  }

  // Update localStorage shared state
  const existing = getLocalAttendanceRecords();
  const mapKey = (r) => `${r.date}_${String(r.semester || '6th Sem').trim()}_${String(r.subject || 'General').trim().toUpperCase()}_${String(r.rollNumber || r.roll).trim().toUpperCase()}`;
  const recordMap = new Map();

  existing.forEach((r) => recordMap.set(mapKey(r), r));
  records.forEach((r) => {
    const cleanRecord = {
      date: String(r.date || getLocalDateString()).trim(),
      rollNumber: String(r.rollNumber || r.roll).trim().toUpperCase(),
      studentName: String(r.studentName || r.name || '').trim(),
      branch: String(r.branch || '').trim(),
      semester: String(r.semester || '6th Sem').trim(),
      subject: String(r.subject || 'General').trim(),
      status: r.status === 'P' || r.status === 'Present' ? 'P' : 'A',
    };
    recordMap.set(mapKey(cleanRecord), cleanRecord);

    // Synchronize memory studentDb
    const s = studentDb[cleanRecord.rollNumber];
    if (s) {
      s.attendanceHistory = s.attendanceHistory || [];
      const idx = s.attendanceHistory.findIndex((x) => x.date === cleanRecord.date && x.subject === cleanRecord.subject);
      if (idx >= 0) s.attendanceHistory[idx] = cleanRecord;
      else s.attendanceHistory.unshift(cleanRecord);

      // Recalculate conducted/attended
      const allStudentLogs = Array.from(recordMap.values()).filter(
        (x) => String(x.rollNumber).trim().toUpperCase() === cleanRecord.rollNumber
      );
      s.conducted = allStudentLogs.length;
      s.attended = allStudentLogs.filter((x) => x.status === 'P').length;
    }
  });

  setLocalAttendanceRecords(Array.from(recordMap.values()));

  return {
    success: true,
    count: records.length,
    apiSuccess,
  };
}

export async function fetchStudentAttendanceRecords(rollNumber) {
  const cleanRoll = String(rollNumber || '').trim().toUpperCase();

  try {
    const response = await fetch(`${API_BASE_URL}/attendance/student/${cleanRoll}`);
    const data = await response.json().catch(() => ({}));
    if (response.ok && data.success && Array.isArray(data.records)) {
      return data;
    }
  } catch (err) {
    // Fallback to local storage
  }

  const allRecords = getLocalAttendanceRecords();
  const studentRecords = allRecords.filter(
    (r) => String(r.rollNumber).trim().toUpperCase() === cleanRoll
  );

  const conducted = studentRecords.length;
  const attended = studentRecords.filter((r) => r.status === 'P').length;

  return {
    success: true,
    rollNumber: cleanRoll,
    conducted,
    attended,
    records: studentRecords,
  };
}
