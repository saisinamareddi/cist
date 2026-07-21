// CIST ERP Dashboard Controller
import { noticeDb, studentDb } from './db.js';
import { submitFacultyAttendance, fetchStudentAttendanceRecords } from './attendanceService.js';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 
  ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000/api'
    : '/api');

let activeStudent = null;
let currentTab = 'dashboard';
let currentFilter = 'all'; // 'all', 'p', 'a', 'h'
let searchQuery = '';
let currentPage = 1;
const rowsPerPage = 5;

// Variables for Calculator
let currentTarget = 75;
let currentClassesPerDay = 7;

// Initial setup of theme mode on load
document.addEventListener('DOMContentLoaded', () => {
  const isDark = localStorage.getItem('theme-mode') === 'dark';
  if (isDark) {
    document.body.classList.add('dark-theme');
    const toggle = document.getElementById('themeToggleBtn');
    if (toggle) toggle.textContent = '🌙';
  }
});

const createEmptyAttendanceState = (student) => ({
  ...student,
  roll: student.roll || student.rollNumber || '',
  avatar: student.avatar || String(student.name || 'ST').trim().split(/\s+/).slice(0, 2).map(part => part.charAt(0).toUpperCase()).join('') || 'ST',
  semester: student.semester || 'Not assigned',
  academicYear: student.academicYear || 'Not assigned',
  conducted: Number(student.conducted || 0),
  attended: Number(student.attended || 0),
  weekly: student.weekly || { 0: 'H', 1: 'H', 2: 'H', 3: 'H', 4: 'H', 5: 'H', 6: 'H' },
  monthlyAttendance: student.monthlyAttendance || [],
  recentActivity: student.recentActivity || [],
  attendanceHistory: [],
});

let headerDateInterval = null;

export function updateHeaderDateTime() {
  const renderDate = () => {
    const dateEl = document.getElementById('headerDateTime');
    if (dateEl) {
      const now = new Date();
      const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
      dateEl.textContent = now.toLocaleDateString('en-US', options);
    }
  };

  renderDate();

  if (!headerDateInterval) {
    headerDateInterval = setInterval(renderDate, 60000);
  }
}

// Primary dashboard loading entry point
export async function loadRedesignedPortal(student) {
  activeStudent = createEmptyAttendanceState(student);
  
  if (activeStudent.role === 'student') {
    const roll = activeStudent.roll || activeStudent.rollNumber;
    try {
      const res = await fetchStudentAttendanceRecords(roll);
      if (res && res.success && Array.isArray(res.records)) {
        if (res.conducted > 0) {
          activeStudent.conducted = res.conducted;
          activeStudent.attended = res.attended;
        }
        activeStudent.attendanceHistory = res.records;
      }
    } catch (e) {
      console.error('Error loading student attendance records:', e);
    }
  }

  // Set default subject options and date picker for faculty vs HOD
  if (activeStudent.role === 'faculty') {
    const isHod = activeStudent?.isHod || activeStudent?.roll === 'CSEHOD1' || activeStudent?.assignedSubjects?.includes('*');
    const hodDateGroup = document.getElementById('hodDateGroup');
    const dateInput = document.getElementById('facultyDateInput');
    const todayStr = new Date().toISOString().split('T')[0];

    if (hodDateGroup) {
      if (isHod) {
        hodDateGroup.style.display = 'block';
        if (dateInput) {
          if (!dateInput.value) dateInput.value = todayStr;
          dateInput.max = todayStr;
          dateInput.removeAttribute('min');
        }
      } else {
        hodDateGroup.style.display = 'none';
      }
    }
    handleFacultySemesterChange();
  }
  
  // Update header current date readout dynamically
  updateHeaderDateTime();

  // Set student profile detail readouts
  updateStudentProfileDOM();
  
  // Reset navigation to default Dashboard tab
  switchSection('dashboard');
  
  // Render dashboard elements
  renderDashboardOverview();
  
  // Render attendance table list (first load)
  renderAttendanceTable();
  
  // Initialize target calculator values
  currentTarget = 75;
  currentClassesPerDay = 7;
  const targetValEl = document.getElementById('targetVal');
  if (targetValEl) targetValEl.textContent = currentTarget;
  const classesPerDayValEl = document.getElementById('classesPerDayVal');
  if (classesPerDayValEl) classesPerDayValEl.textContent = currentClassesPerDay;
  const sliderEl = document.getElementById('targetRangeSlider');
  if (sliderEl) sliderEl.value = currentTarget;
  recalculateAttendanceProjections();

  // Load notices dynamically
  renderNoticeBoard();

  // Page wrapper transition animations
  const loginPageWrapper = document.getElementById('loginPageWrapper');
  const loginCard = document.getElementById('loginCard');
  const dashboardPanel = document.getElementById('dashboardPanel');

  loginCard.style.opacity = '0';
  loginCard.style.transform = 'scale(0.95)';
  
  setTimeout(() => {
    loginPageWrapper.style.display = 'none';
    dashboardPanel.style.display = 'flex';
    dashboardPanel.offsetHeight; // Force reflow
    dashboardPanel.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 400);
}

// Render student details in the profile card and header
function updateStudentProfileDOM() {
  const nameHeader = document.getElementById('studentHeaderName');
  if (nameHeader) nameHeader.textContent = activeStudent.name;
  
  const avatarElements = document.querySelectorAll('.student-avatar-placeholder');
  avatarElements.forEach(el => {
    el.textContent = activeStudent.avatar;
  });

  const isFaculty = activeStudent.role === 'faculty';
  
  // Update Profile Card Labels
  const lblRoll = document.getElementById('lblProfileRoll');
  if (lblRoll) lblRoll.textContent = isFaculty ? "Faculty Employee ID" : "Roll Number";

  const lblAttendance = document.getElementById('lblAttendanceMenuItemText');
  if (lblAttendance) {
    lblAttendance.textContent = isFaculty ? "Upload Attendance" : "Attendance List";
  }

  // Update Metrics Card Labels
  const lblConducted = document.getElementById('lblMetricConducted');
  const lblAttended = document.getElementById('lblMetricAttended');
  const lblMissed = document.getElementById('lblMetricMissed');
  
  if (lblConducted) lblConducted.textContent = isFaculty ? "Assigned Classes" : "Conducted";
  if (lblAttended) lblAttended.textContent = isFaculty ? "Classes Delivered" : "Attended";
  if (lblMissed) lblMissed.textContent = isFaculty ? "Classes Remaining" : "Missed";

  const profileName = document.getElementById('profileName');
  if (profileName) profileName.textContent = activeStudent.name;
  const profileRoll = document.getElementById('profileRoll');
  if (profileRoll) profileRoll.textContent = activeStudent.roll;
  const profileBranch = document.getElementById('profileBranch');
  if (profileBranch) profileBranch.textContent = activeStudent.branch;
}

// Render Dashboard Tab Overview (Summary Cards, Circle Progress, Monthly Chart, Activities)
function renderDashboardOverview() {
  const conducted = Number(activeStudent.conducted || 0);
  const attended = Number(activeStudent.attended || 0);
  const missed = Math.max(conducted - attended, 0);
  const hasAttendance = conducted > 0;
  const percentage = hasAttendance ? (attended / conducted) * 100 : 0;

  document.getElementById('conductedClassesVal').textContent = conducted;
  document.getElementById('attendedClassesVal').textContent = attended;
  document.getElementById('missedClassesVal').textContent = missed;

  const circle = document.getElementById('progressCircleRing');
  const percentText = document.getElementById('circlePercentNum');
  const statusText = document.getElementById('circleStatusText');

  if (!hasAttendance) {
    percentText.textContent = '0.0';
    circle.style.stroke = 'var(--primary)';
    circle.style.strokeDashoffset = 440;
    statusText.textContent = 'Pending';
    statusText.style.color = 'var(--primary)';
    renderMonthlyBarChart();
    renderRecentActivity();
    return;
  }

  percentText.textContent = percentage.toFixed(1);
  const offset = 440 - (percentage / 100) * 440;
  circle.style.strokeDashoffset = 440;

  if (percentage >= 75) {
    circle.style.stroke = 'var(--success)';
    statusText.textContent = 'Good';
    statusText.style.color = 'var(--success)';
  } else if (percentage >= 65) {
    circle.style.stroke = 'var(--warning)';
    statusText.textContent = 'Warning';
    statusText.style.color = 'var(--warning)';
  } else {
    circle.style.stroke = 'var(--danger)';
    statusText.textContent = 'Critical';
    statusText.style.color = 'var(--danger)';
  }

  requestAnimationFrame(() => {
    setTimeout(() => {
      circle.style.strokeDashoffset = offset;
    }, 50);
  });

  renderMonthlyBarChart();
  renderRecentActivity();
}
// Custom bar chart rendering with slide-up animations
function renderMonthlyBarChart() {
  const chartWrapper = document.getElementById('monthlyChartContainer');
  chartWrapper.innerHTML = '';

  if (!activeStudent.monthlyAttendance.length) {
    chartWrapper.innerHTML = '<div style="display:flex; align-items:center; justify-content:center; min-height:180px; color:#64748b; font-weight:700; text-align:center;">Monthly attendance chart will appear after attendance data is added.</div>';
    return;
  }

  activeStudent.monthlyAttendance.forEach(data => {
    const rate = data.conducted > 0 ? (data.attended / data.conducted) * 100 : 0;

    const barGroup = document.createElement('div');
    barGroup.className = 'chart-bar-group';
    barGroup.innerHTML = `
      <div class="chart-bar-container" aria-label="Attendance for ${data.month}: ${rate.toFixed(1)}%">
        <div class="chart-bar-fill" style="height: 0%"></div>
        <div class="chart-tooltip">${rate.toFixed(1)}% (${data.attended}/${data.conducted} classes)</div>
      </div>
      <div class="chart-month-label">${data.month}</div>
    `;
    chartWrapper.appendChild(barGroup);

    setTimeout(() => {
      const fill = barGroup.querySelector('.chart-bar-fill');
      if (fill) fill.style.height = `${rate}%`;
    }, 100);
  });
}
// Render recent academic and attendance activities
function renderRecentActivity() {
  const timeline = document.getElementById('activityTimelineList');
  timeline.innerHTML = '';

  if (!activeStudent.recentActivity.length) {
    timeline.innerHTML = '<div style="color:#64748b; font-weight:700; padding:0.75rem 0;">Recent activities will appear after attendance data is added.</div>';
    return;
  }

  activeStudent.recentActivity.forEach(activity => {
    const item = document.createElement('div');
    item.className = 'activity-item';

    let indicatorClass = 'notice';
    if (activity.type === 'attendance') {
      indicatorClass = activity.status === 'Present' ? 'present' : 'absent';
    }

    item.innerHTML = `
      <div class="activity-indicator ${indicatorClass}"></div>
      <div class="activity-details">
        <div class="activity-title">${activity.title}</div>
        <div class="activity-meta">
          <span>${activity.status}</span>
          <span>${activity.time}</span>
        </div>
      </div>
    `;
    timeline.appendChild(item);
  });
}
// Render dynamic notice board notices
function renderNoticeBoard() {
  const container = document.getElementById('noticeBoardList');
  if (!container) return;
  container.innerHTML = '';

  noticeDb.forEach(notice => {
    const card = document.createElement('div');
    card.className = 'activity-item';
    card.innerHTML = `
      <div class="activity-indicator notice"></div>
      <div class="activity-details">
        <div class="activity-title" style="font-weight: 750;">${notice.title}</div>
        <div style="font-size: 0.82rem; color: var(--table-text); margin: 4px 0;">${notice.content}</div>
        <div class="activity-meta">
          <span class="news-tag" style="margin-left: 0; background: var(--primary);">${notice.category}</span>
          <span>${notice.date}</span>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// ==========================================================================
// ATTENDANCE TAB MANAGEMENT (SEARCH, FILTERS, PAGINATION)
// ==========================================================================

// Parse day string into week index
function getDayIndex(dayName) {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days.indexOf(dayName.toLowerCase());
}

export function matchBranch(studentBranch, selectedBranch) {
  if (!selectedBranch || selectedBranch === 'ALL') return true;

  const sb = String(studentBranch || '').trim().toUpperCase();
  const sel = String(selectedBranch).trim().toUpperCase();

  if (sel === 'CSE') {
    return sb.includes('COMPUTER SCIENCE AND ENGINEERING') || sb.includes('COMPUTER SCIENCE ENGINEERING') || sb === 'CSE';
  }
  if (sel === 'CST') {
    return sb.includes('TECHNOLOGY') || sb.includes('CST');
  }
  if (sel === 'AI & DS' || sel === 'AIDS') {
    return sb.includes('ARTIFICIAL') || sb.includes('DATA SCIENCE') || sb.includes('AI');
  }
  if (sel === 'CSE-AIML') {
    return sb.includes('AIML') || sb.includes('MACHINE LEARNING');
  }
  if (sel === 'CSE-DS') {
    return sb.includes('DATA SCIENCE') || sb.includes('DS');
  }
  if (sel === 'ECE') {
    return sb.includes('ELECTRONICS') || sb === 'ECE';
  }
  if (sel === 'EEE') {
    return sb.includes('ELECTRICAL') || sb === 'EEE';
  }
  if (sel === 'CIVIL') {
    return sb.includes('CIVIL');
  }
  if (sel === 'MECHANICAL' || sel === 'MECH') {
    return sb.includes('MECHANICAL') || sb === 'ME';
  }

  return sb.includes(sel);
}

export function handleFacultyBranchOrDateChange() {
  renderFacultyStudentTable();
}

export function setAllFacultyCheckboxes(checked) {
  const checkboxes = document.querySelectorAll('.faculty-chk-present');
  checkboxes.forEach(chk => chk.checked = checked);
  updateFacultyAttendanceCounts();
}

const semesterSubjectsMap = {
  'Sem 1': [
    { value: 'M1', label: 'M1 (Mathematics-I)' },
    { value: 'EP', label: 'EP (Engineering Physics)' },
    { value: 'BEE', label: 'BEE (Basic Electrical Engg)' },
    { value: 'CP', label: 'CP (C Programming)' },
  ],
  'Sem 2': [
    { value: 'M2', label: 'M2 (Mathematics-II)' },
    { value: 'EC', label: 'EC (Engineering Chemistry)' },
    { value: 'DS', label: 'DS (Data Structures)' },
    { value: 'EG', label: 'EG (Engineering Graphics)' },
  ],
  'Sem 3': [
    { value: 'MFCS', label: 'MFCS (Math Foundations)' },
    { value: 'OOP', label: 'OOP (Object Oriented Prog)' },
    { value: 'DE', label: 'DE (Digital Electronics)' },
    { value: 'DMS', label: 'DMS (Discrete Math)' },
  ],
  'Sem 4': [
    { value: 'DBMS', label: 'DBMS (Database Management)' },
    { value: 'OS', label: 'OS (Operating Systems)' },
    { value: 'COA', label: 'COA (Computer Architecture)' },
    { value: 'P&S', label: 'P&S (Probability & Stats)' },
  ],
  'Sem 5': [
    { value: 'WT', label: 'WT (Web Technologies)' },
    { value: 'CN', label: 'CN (Computer Networks)' },
    { value: 'FLAT', label: 'FLAT (Formal Languages)' },
    { value: 'DAA', label: 'DAA (Design & Analysis of Algo)' },
  ],
  'Sem 6': [
    { value: 'REL', label: 'REL (Renewable Energy & Logistics)' },
    { value: 'HR&PM', label: 'HR&PM (Human Resources & Project Mgmt)' },
    { value: 'BCT', label: 'BCT (Blockchain Technology)' },
    { value: 'BDA', label: 'BDA (Big Data Analytics)' },
    { value: 'EMI', label: 'EMI (Electromagnetic Induction)' },
    { value: 'OM', label: 'OM (Operations Management)' },
    { value: 'CD', label: 'CD (Compiler Design)' },
    { value: 'SE', label: 'SE (Software Engineering)' },
  ],
  'Sem 7': [
    { value: 'AI', label: 'AI (Artificial Intelligence)' },
    { value: 'CNS', label: 'CNS (Cryptography & Network Security)' },
    { value: 'CC', label: 'CC (Cloud Computing)' },
    { value: 'ML', label: 'ML (Machine Learning)' },
  ],
  'Sem 8': [
    { value: 'DL', label: 'DL (Deep Learning)' },
    { value: 'IOT', label: 'IOT (Internet of Things)' },
    { value: 'PROJECT', label: 'PROJECT (Major Project Work)' },
  ]
};

const semToYearMap = {
  'Sem 1': '1',
  'Sem 2': '1',
  'Sem 3': '2',
  'Sem 4': '2',
  'Sem 5': '3',
  'Sem 6': '3',
  'Sem 7': '4',
  'Sem 8': '4'
};

const yearToSemMap = {
  '1': 'Sem 1',
  '2': 'Sem 3',
  '3': 'Sem 6',
  '4': 'Sem 7'
};

export function handleFacultySemesterChange() {
  const semVal = document.getElementById('facultySemesterSelect')?.value || 'Sem 6';
  const yearSelect = document.getElementById('facultyYearSelect');
  if (yearSelect && semToYearMap[semVal]) {
    yearSelect.value = semToYearMap[semVal];
  }

  const subjSelect = document.getElementById('facultySubjectSelect');
  if (!subjSelect) return;

  const allSemesterSubjects = semesterSubjectsMap[semVal] || semesterSubjectsMap['Sem 6'];
  subjSelect.innerHTML = '';

  const isHod = activeStudent?.isHod || activeStudent?.roll === 'CSEHOD1' || activeStudent?.assignedSubjects?.includes('*');
  const assigned = activeStudent?.assignedSubjects || [];

  let allowedSubjects = allSemesterSubjects;
  if (!isHod && Array.isArray(assigned)) {
    allowedSubjects = allSemesterSubjects.filter(s => assigned.includes(s.value));
  }

  if (allowedSubjects.length === 0) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = `-- No Subjects Assigned for ${semVal} --`;
    subjSelect.appendChild(opt);
  } else {
    allowedSubjects.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.value;
      opt.textContent = s.label;
      subjSelect.appendChild(opt);
    });
  }

  renderFacultyStudentTable();
}

export function handleFacultyYearChange() {
  const yearVal = document.getElementById('facultyYearSelect')?.value;
  const semSelect = document.getElementById('facultySemesterSelect');

  if (yearVal && yearVal !== 'ALL' && yearToSemMap[yearVal]) {
    if (semSelect) semSelect.value = yearToSemMap[yearVal];
    handleFacultySemesterChange();
  } else {
    renderFacultyStudentTable();
  }
}

export function updateFacultyAttendanceCounts() {
  const checkboxes = document.querySelectorAll('.faculty-chk-present');
  const total = checkboxes.length;
  let present = 0;
  checkboxes.forEach(chk => { if (chk.checked) present++; });
  const absent = total - present;

  const summary = document.getElementById('facultySummaryStats');
  if (summary) {
    summary.textContent = `Total Students: ${total} | Present: ${present} | Absent: ${absent}`;
  }
}

export async function submitFacultyAttendanceHandler() {
  const checkboxes = document.querySelectorAll('.faculty-chk-present');
  const dateInput = document.getElementById('facultyDateInput');
  const isHod = activeStudent?.isHod || activeStudent?.roll === 'CSEHOD1' || activeStudent?.assignedSubjects?.includes('*');
  const todayStr = new Date().toISOString().split('T')[0];
  let dateVal = todayStr;
  if (isHod && dateInput && dateInput.value) {
    dateVal = dateInput.value;
    if (dateVal > todayStr) {
      window.Toast.warning("Future dates cannot be modified for attendance.", "Invalid Date");
      return;
    }
  }

  const semesterVal = document.getElementById('facultySemesterSelect')?.value || 'Sem 6';
  const subjectVal = document.getElementById('facultySubjectSelect')?.value || '';

  if (!subjectVal) {
    window.Toast.warning("Please select a valid assigned subject to upload attendance.", "Subject Required");
    return;
  }

  if (checkboxes.length === 0) {
    window.Toast.warning("No students selected for attendance.", "Selection Empty");
    return;
  }

  const records = Array.from(checkboxes).map(chk => ({
    date: dateVal,
    rollNumber: chk.dataset.roll,
    studentName: chk.dataset.name,
    branch: chk.dataset.branch,
    semester: semesterVal,
    subject: subjectVal,
    status: chk.checked ? 'P' : 'A'
  }));

  const btn = document.getElementById('btnSubmitFacultyAttendance');
  if (btn) btn.disabled = true;

  try {
    const res = await submitFacultyAttendance(records);
    if (res && res.success) {
      window.Toast.success(`Attendance for ${semesterVal} - ${subjectVal} on ${dateVal} submitted for ${records.length} students!`, 'Attendance Saved');
    }
  } catch (err) {
    window.Toast.error("Failed to upload attendance records.", "Error");
  } finally {
    if (btn) btn.disabled = false;
  }
}

export function renderFacultyStudentTable() {
  const tbody = document.getElementById('facultyStudentTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const selectedBranch = document.getElementById('facultyBranchSelect')?.value || 'ALL';
  const selectedYear = document.getElementById('facultyYearSelect')?.value || 'ALL';

  // Deduplicate students by unique roll number
  const uniqueStudentsMap = new Map();
  Object.values(studentDb).forEach(student => {
    const cleanRoll = String(student.roll || student.rollNumber || '').trim().toUpperCase();
    if (cleanRoll && !uniqueStudentsMap.has(cleanRoll)) {
      uniqueStudentsMap.set(cleanRoll, student);
    }
  });

  const studentsArray = Array.from(uniqueStudentsMap.values());
  const filteredStudents = studentsArray.filter(student => {
    const branchMatch = matchBranch(student.branch, selectedBranch);
    let yearMatch = true;
    if (selectedYear !== 'ALL') {
      const studentYear = Number(student.year || 4);
      yearMatch = studentYear === Number(selectedYear);
    }
    return branchMatch && yearMatch;
  });

  if (filteredStudents.length === 0) {
    const yrLabel = selectedYear !== 'ALL' ? `${selectedYear}${selectedYear === '1' ? 'st' : selectedYear === '2' ? 'nd' : selectedYear === '3' ? 'rd' : 'th'} Year` : '';
    const msg = yrLabel ? `No student records available for ${yrLabel} currently.` : `No students found matching selected filters.`;
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #64748b; padding: 2rem; font-weight: 600;">${msg}</td></tr>`;
    updateFacultyAttendanceCounts();
    return;
  }

  filteredStudents.forEach(student => {
    const row = document.createElement('tr');
    const yr = student.year || 4;
    const sec = student.section || 'A';
    row.innerHTML = `
      <td style="text-align: center;">
        <input type="checkbox" class="faculty-chk-present" data-roll="${student.roll}" data-name="${student.name}" data-branch="${student.branch}" onchange="updateFacultyAttendanceCounts()">
      </td>
      <td style="font-weight: 750;">${student.roll} <span style="font-size:0.7rem; color:#94a3b8; font-weight:600;">(Yr ${yr}-${sec})</span></td>
      <td>${student.name}</td>
      <td><span class="news-tag" style="background: var(--light-gray); color: var(--dark); font-size: 0.72rem; padding: 2px 8px;">${student.branch}</span></td>
    `;
    tbody.appendChild(row);
  });

  updateFacultyAttendanceCounts();
}

let currentSubjectTimeFilter = 'today';

export function setSubjectTimeFilter(filter) {
  currentSubjectTimeFilter = filter;
  ['today', 'overall', 'yesterday'].forEach(f => {
    const btn = document.getElementById(`subpill-${f}`);
    if (btn) {
      if (f === filter) btn.classList.add('active');
      else btn.classList.remove('active');
    }
  });
  renderStudentAttendanceLogs();
}

function renderStudentAttendanceLogs() {
  const container = document.getElementById('studentSubjectAttendanceList');
  if (!container) return;
  container.innerHTML = '';

  const allRecords = activeStudent?.attendanceHistory || [];

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

  let filteredRecords = allRecords;
  if (currentSubjectTimeFilter === 'today') {
    filteredRecords = allRecords.filter(r => r.date === todayStr);
  } else if (currentSubjectTimeFilter === 'yesterday') {
    filteredRecords = allRecords.filter(r => r.date === yesterdayStr);
  }

  // Pre-defined subjects list matching reference image
  const defaultSubjects = ['REL', 'HR&PM', 'BCT', 'BDA', 'EMI', 'OM'];

  // Map of subject statistics
  const subjectMap = new Map();
  defaultSubjects.forEach(s => {
    subjectMap.set(s, { subject: s, conducted: 0, attended: 0 });
  });

  filteredRecords.forEach(r => {
    const subjName = r.subject || 'General';
    if (!subjectMap.has(subjName)) {
      subjectMap.set(subjName, { subject: subjName, conducted: 0, attended: 0 });
    }
    const item = subjectMap.get(subjName);
    item.conducted += 1;
    if (r.status === 'P' || r.status === 'Present') {
      item.attended += 1;
    }
  });

  const subjectsList = Array.from(subjectMap.values());

  subjectsList.forEach(item => {
    const conducted = item.conducted;
    const attended = item.attended;
    
    let conductedDisplay = conducted;
    let attendedDisplay = attended;
    if (conducted === 0) {
      conductedDisplay = 1;
      attendedDisplay = 0;
    }

    const percentage = conductedDisplay > 0 ? Math.round((attendedDisplay / conductedDisplay) * 100) : 0;
    const isSuccess = percentage > 0;

    const card = document.createElement('div');
    card.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.1rem 1.25rem;
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 14px;
      transition: var(--transition);
      box-shadow: 0 2px 6px rgba(0,0,0,0.02);
    `;

    card.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <span style="font-family: 'Outfit', sans-serif; font-weight: 850; font-size: 1.05rem; color: var(--dark); letter-spacing: 0.5px;">${item.subject}</span>
        <span style="font-size: 0.82rem; font-weight: 600; color: #64748b;">${attendedDisplay}/${conductedDisplay}</span>
      </div>
      <div style="
        width: 44px;
        height: 44px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid ${isSuccess ? '#3b82f6' : '#cbd5e1'};
        color: ${isSuccess ? '#2563eb' : '#ef4444'};
        font-family: 'Outfit', sans-serif;
        font-weight: 850;
        font-size: 0.95rem;
        background: ${isSuccess ? 'rgba(59, 130, 246, 0.05)' : 'rgba(241, 245, 249, 0.5)'};
      ">
        ${percentage}
      </div>
    `;

    container.appendChild(card);
  });
}

export function renderAttendanceTable() {
  const isFaculty = activeStudent?.role === 'faculty';
  const facultyView = document.getElementById('facultyAttendanceView');
  const studentView = document.getElementById('studentAttendanceView');

  if (isFaculty) {
    if (facultyView) facultyView.style.display = 'block';
    if (studentView) studentView.style.display = 'none';
    renderFacultyStudentTable();
  } else {
    if (facultyView) facultyView.style.display = 'none';
    if (studentView) studentView.style.display = 'block';
    renderStudentAttendanceLogs();
  }
}
// Live search listener
export function handleSearch(event) {
  searchQuery = event.target.value;
  currentPage = 1; // Reset to page 1
  renderAttendanceTable();
}

// Status filter pill click handler
export function setFilterPill(filter) {
  currentFilter = filter;
  currentPage = 1;
  
  // Toggle active class on pills
  const pills = ['all', 'p', 'a', 'h'];
  pills.forEach(p => {
    const btn = document.getElementById(`pill-${p}`);
    if (btn) {
      if (p === filter) btn.classList.add('active');
      else btn.classList.remove('active');
    }
  });

  renderAttendanceTable();
}

// Page controls
export function nextPage() {
  currentPage++;
  renderAttendanceTable();
}

export function prevPage() {
  currentPage--;
  renderAttendanceTable();
}


// ==========================================================================
// TARGET CALCULATOR TAB ALGORITHMS
// ==========================================================================

export function adjustTargetValue(amount) {
  currentTarget = Math.min(100, Math.max(1, currentTarget + amount));
  const el = document.getElementById('targetVal');
  if (el) el.textContent = currentTarget;
  recalculateAttendanceProjections();
}

export function adjustClassesPerDayValue(amount) {
  currentClassesPerDay = Math.min(12, Math.max(1, currentClassesPerDay + amount));
  const el = document.getElementById('classesPerDayVal');
  if (el) el.textContent = currentClassesPerDay;
  recalculateAttendanceProjections();
}

export function handleSliderChange(val) {
  currentTarget = parseInt(val);
  const el = document.getElementById('targetVal');
  if (el) el.textContent = currentTarget;
  recalculateAttendanceProjections();
}

// Core calculator prediction logic
function recalculateAttendanceProjections() {
  const resultMsg = document.getElementById('targetCalcResultMsg');
  if (!resultMsg) return;

  const C = Number(activeStudent?.conducted || 0);
  const A = Number(activeStudent?.attended || 0);
  const T = currentTarget / 100;

  if (C === 0) {
    resultMsg.className = 'target-calc-result';
    resultMsg.textContent = 'Attendance projections will be available after attendance records are uploaded.';
    return;
  }

  const currentPercent = A / C;

  if (currentPercent < T) {
    const classesNeeded = Math.ceil((T * C - A) / (1 - T));
    const daysNeeded = (classesNeeded / currentClassesPerDay).toFixed(1);

    resultMsg.className = 'target-calc-result';
    resultMsg.innerHTML = `You need to attend ${classesNeeded} classes (~${daysNeeded} days).`;
  } else {
    const classesCanMiss = Math.floor((A - T * C) / T);
    const daysCanMiss = (classesCanMiss / currentClassesPerDay).toFixed(1);

    resultMsg.className = 'target-calc-result safe';
    if (classesCanMiss > 0) {
      resultMsg.innerHTML = `Target achieved! You can safely miss ${classesCanMiss} classes (~${daysCanMiss} days).`;
    } else {
      resultMsg.innerHTML = `Target achieved! Keep attending classes to maintain ${currentTarget}%.`;
    }
  }
}

export async function handleChangePasswordSubmit(event) {
  event.preventDefault();

  if (!activeStudent?.rollNumber && !activeStudent?.roll) {
    window.Toast.error('Please log in again before changing password.', 'Session Missing');
    return;
  }

  const currentPasswordInput = document.getElementById('currentPassword');
  const newPasswordInput = document.getElementById('newPassword');
  const confirmPasswordInput = document.getElementById('confirmNewPassword');
  const saveBtn = document.getElementById('savePasswordBtn');

  const currentPassword = currentPasswordInput.value;
  const newPassword = newPasswordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  if (newPassword !== confirmPassword) {
    window.Toast.error('New password and re-entered password do not match.', 'Password Mismatch');
    return;
  }

  saveBtn.disabled = true;
  const originalContent = saveBtn.innerHTML;
  saveBtn.innerHTML = '<div class="spinner"></div><span>Saving...</span>';

  try {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rollNumber: activeStudent.rollNumber || activeStudent.roll,
        currentPassword,
        newPassword,
        confirmPassword,
      }),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Unable to update password');
    }

    currentPasswordInput.value = '';
    newPasswordInput.value = '';
    confirmPasswordInput.value = '';
    window.Toast.success('Use your new password next time you log in.', 'Password Updated');
  } catch (error) {
    window.Toast.error(error.message, 'Password Update Failed');
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = originalContent;
  }
}
// Quick action focuses
export function focusCalculator() {
  switchSection('calculator');
  window.Toast.info("Recalculate attendance projections here.");
}

// Print attendance format
export function downloadReport() {
  window.print();
}

// Raise attendance issue
export function raiseQuery() {
  window.Toast.success("Attendance correction request submitted to CIST admin office.", "Request Sent");
}

// ==========================================================================
// NAVIGATION CONTROLLERS & SKELETON LOADERS
// ==========================================================================

export function switchSection(sectionId) {
  // Hide active sidebar drawer on mobile
  document.getElementById('portalSidebar').classList.remove('drawer-open');
  
  if (currentTab === sectionId) return;
  currentTab = sectionId;

  // Toggle active styling on sidebar items
  const menuItems = document.querySelectorAll('.menu-item');
  menuItems.forEach(item => {
    if (item.getAttribute('onclick')?.includes(`'${sectionId}'`)) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Display page title
  const titleDisplay = document.getElementById('headerPageTitle');
  if (titleDisplay) {
    if (sectionId === 'attendance') {
      titleDisplay.textContent = activeStudent?.role === 'faculty' ? 'Upload Attendance' : 'Attendance List';
    } else {
      const formattedName = sectionId.charAt(0).toUpperCase() + sectionId.slice(1).replace('_', ' ');
      titleDisplay.textContent = formattedName;
    }
  }

  const sections = document.querySelectorAll('.portal-section');
  const skeleton = document.getElementById('portalSkeleton');

  // Trigger Skeleton Loading simulator (400ms)
  skeleton.style.display = 'block';
  sections.forEach(sec => {
    sec.classList.remove('active');
  });

  setTimeout(() => {
    skeleton.style.display = 'none';
    const targetSection = document.getElementById(`${sectionId}Section`);
    if (targetSection) {
      targetSection.classList.add('active');
    }
  }, 350);
}

// Sidebar Drawer toggles for mobile viewports
export function toggleSidebar() {
  const sidebar = document.getElementById('portalSidebar');
  sidebar.classList.toggle('drawer-open');
}

// Light vs Dark Mode Theme Engine
export function toggleThemeMode() {
  const body = document.body;
  const toggle = document.getElementById('themeToggleBtn');
  
  body.classList.toggle('dark-theme');
  
  if (body.classList.contains('dark-theme')) {
    toggle.textContent = '🌙';
    localStorage.setItem('theme-mode', 'dark');
    window.Toast.info("Switched to Night Portal mode.", "Dark Theme");
  } else {
    toggle.textContent = '☀️';
    localStorage.setItem('theme-mode', 'light');
    window.Toast.info("Switched to Day Portal mode.", "Light Theme");
  }
}

// Locked feature alert modal
export function openLockedFeature(featureName) {
  // Close sidebar drawer
  document.getElementById('portalSidebar').classList.remove('drawer-open');
  
  // Format Title
  const formatted = featureName.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  // Set title and body in our Locked View panel
  const lockedTitle = document.getElementById('lockedModuleTitle');
  const lockedDesc = document.getElementById('lockedModuleDesc');
  
  lockedTitle.textContent = `${formatted} Module`;
  lockedDesc.innerHTML = `The <strong>${formatted}</strong> management module is locked in this deployment database version. <br>Integrating this will require connecting live Supabase REST/PostgreSQL API tables.`;
  
  switchSection('locked');
}

// Expose dashboard controllers globally
window.loadRedesignedPortal = loadRedesignedPortal;
window.switchSection = switchSection;
window.toggleSidebar = toggleSidebar;
window.toggleThemeMode = toggleThemeMode;
window.openLockedFeature = openLockedFeature;
window.adjustTargetValue = adjustTargetValue;
window.adjustClassesPerDayValue = adjustClassesPerDayValue;
window.handleSliderChange = handleSliderChange;
window.handleSearch = handleSearch;
window.setFilterPill = setFilterPill;
window.nextPage = nextPage;
window.prevPage = prevPage;
window.downloadReport = downloadReport;
window.raiseQuery = raiseQuery;
window.focusCalculator = focusCalculator;
window.handleChangePasswordSubmit = handleChangePasswordSubmit;
window.handleFacultyBranchOrDateChange = handleFacultyBranchOrDateChange;
window.setAllFacultyCheckboxes = setAllFacultyCheckboxes;
window.updateFacultyAttendanceCounts = updateFacultyAttendanceCounts;
window.submitFacultyAttendanceHandler = submitFacultyAttendanceHandler;
window.setSubjectTimeFilter = setSubjectTimeFilter;
window.handleFacultySemesterChange = handleFacultySemesterChange;
window.handleFacultyYearChange = handleFacultyYearChange;









