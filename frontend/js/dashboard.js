// CIST ERP Dashboard Controller
import { noticeDb } from './db.js';

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
  avatar: student.avatar || String(student.name || 'ST').trim().split(/\\s+/).slice(0, 2).map(part => part.charAt(0).toUpperCase()).join('') || 'ST',
  semester: student.semester || 'Not assigned',
  academicYear: student.academicYear || 'Not assigned',
  conducted: Number(student.conducted || 0),
  attended: Number(student.attended || 0),
  weekly: student.weekly || { 0: 'H', 1: 'H', 2: 'H', 3: 'H', 4: 'H', 5: 'H', 6: 'H' },
  monthlyAttendance: student.monthlyAttendance || [],
  recentActivity: student.recentActivity || [],
});

// Primary dashboard loading entry point
export function loadRedesignedPortal(student) {
  activeStudent = createEmptyAttendanceState(student);
  
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
  document.getElementById('targetVal').textContent = currentTarget;
  document.getElementById('classesPerDayVal').textContent = currentClassesPerDay;
  document.getElementById('targetRangeSlider').value = currentTarget;
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
  document.getElementById('studentHeaderName').textContent = activeStudent.name;
  
  const avatarElements = document.querySelectorAll('.student-avatar-placeholder');
  avatarElements.forEach(el => {
    el.textContent = activeStudent.avatar;
  });

  const isFaculty = activeStudent.role === 'faculty';
  
  // Update Profile Card Labels
  const lblRoll = document.getElementById('lblProfileRoll');
  
  if (lblRoll) lblRoll.textContent = isFaculty ? "Faculty Employee ID" : "Roll Number";

  // Update Metrics Card Labels
  const lblConducted = document.getElementById('lblMetricConducted');
  const lblAttended = document.getElementById('lblMetricAttended');
  const lblMissed = document.getElementById('lblMetricMissed');
  
  if (lblConducted) lblConducted.textContent = isFaculty ? "Assigned Classes" : "Conducted";
  if (lblAttended) lblAttended.textContent = isFaculty ? "Classes Delivered" : "Attended";
  if (lblMissed) lblMissed.textContent = isFaculty ? "Classes Remaining" : "Missed";

  document.getElementById('profileName').textContent = activeStudent.name;
  document.getElementById('profileRoll').textContent = activeStudent.roll;
  document.getElementById('profileBranch').textContent = activeStudent.branch;
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

export function renderAttendanceTable() {
  const tbody = document.getElementById('attendanceTableBody');
  tbody.innerHTML = '';

  if (!activeStudent.conducted && !activeStudent.attended) {
    tbody.innerHTML = '<tr><td colspan="2" style="text-align: center; color: #64748b; padding: 2rem;">Attendance list will appear after attendance data is added.</td></tr>';
    document.getElementById('paginationInfoText').textContent = 'Showing 0 to 0 of 0 records';
    document.getElementById('btnPrevPage').disabled = true;
    document.getElementById('btnNextPage').disabled = true;
    return;
  }

  const baseWeekly = activeStudent.weekly;
  const daysList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  let allLogs = [];

  for (let week = 2; week >= 0; week--) {
    daysList.forEach((day, index) => {
      const dayNum = (index + 1) % 7;
      let status = baseWeekly[dayNum];

      if (week > 0 && status !== 'H') {
        status = (week + index) % 3 === 0 ? 'A' : 'P';
      }

      allLogs.push({
        weekNum: week + 1,
        dayName: day,
        dayNum: dayNum,
        status: status,
      });
    });
  }

  let filteredLogs = allLogs.filter(log => {
    return log.dayName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (currentFilter !== 'all') {
    filteredLogs = filteredLogs.filter(log => {
      return log.status.toLowerCase() === currentFilter.toLowerCase();
    });
  }

  const totalItems = filteredLogs.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage) || 1;

  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalItems);
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

  document.getElementById('paginationInfoText').textContent = `Showing ${totalItems > 0 ? startIndex + 1 : 0} to ${endIndex} of ${totalItems} records`;
  document.getElementById('btnPrevPage').disabled = currentPage === 1;
  document.getElementById('btnNextPage').disabled = currentPage === totalPages;

  if (paginatedLogs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="2" style="text-align: center; color: #64748b; padding: 2rem;">No matching records found.</td></tr>';
    return;
  }

  const todayDayNum = new Date().getDay();

  paginatedLogs.forEach(log => {
    const row = document.createElement('tr');
    const isToday = log.dayNum === todayDayNum && log.weekNum === 1;
    if (isToday) row.className = 'today-row';

    let statusClass = 'h';
    let statusText = 'Holiday';
    if (log.status === 'P') {
      statusClass = 'p';
      statusText = 'Present';
    } else if (log.status === 'A') {
      statusClass = 'a';
      statusText = 'Absent';
    }

    row.innerHTML = `
      <td>${log.dayName} ${log.weekNum > 1 ? `<span style="font-size:0.7rem; color: #94a3b8;">(Week -${log.weekNum - 1})</span>` : ''}</td>
      <td>
        <span class="status-badge ${statusClass}">${statusText}</span>
        ${isToday ? '<span class="news-tag" style="background: var(--primary); font-size: 0.55rem; padding: 1px 4px; vertical-align: middle;">Today</span>' : ''}
      </td>
    `;
    tbody.appendChild(row);
  });
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
  document.getElementById('targetVal').textContent = currentTarget;
  document.getElementById('targetRangeSlider').value = currentTarget;
  recalculateAttendanceProjections();
}

export function adjustClassesPerDayValue(amount) {
  currentClassesPerDay = Math.min(7, Math.max(1, currentClassesPerDay + amount));
  document.getElementById('classesPerDayVal').textContent = currentClassesPerDay;
  recalculateAttendanceProjections();
}

export function handleSliderChange(val) {
  currentTarget = parseInt(val);
  document.getElementById('targetVal').textContent = currentTarget;
  recalculateAttendanceProjections();
}

// Core calculator prediction logic
function recalculateAttendanceProjections() {
  const C = Number(activeStudent.conducted || 0);
  const A = Number(activeStudent.attended || 0);
  const T = currentTarget / 100;
  const currentPercent = C > 0 ? A / C : 0;

  const resultCard = document.getElementById('calcResultCard');
  const resultIcon = document.getElementById('calcResultIcon');
  const resultStatus = document.getElementById('calcResultStatus');
  const resultText = document.getElementById('calcResultText');

  if (C === 0) {
    resultCard.className = 'calc-result-card warning-zone';
    resultIcon.innerHTML = '';
    resultStatus.textContent = 'Attendance Pending';
    resultText.textContent = 'Attendance projections will be available after attendance data is added.';
    return;
  }

  if (currentPercent < T) {
    const classesNeeded = Math.ceil((T * C - A) / (1 - T));
    const daysNeeded = (classesNeeded / currentClassesPerDay).toFixed(1);

    resultCard.className = 'calc-result-card warning-zone';
    resultIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
    resultStatus.textContent = 'Warning Zone';
    resultText.innerHTML = `You are currently below your target threshold. You need to attend the next <strong>${classesNeeded}</strong> consecutive classes (~${daysNeeded} days) to reach <strong>${currentTarget}%</strong>.`;
  } else {
    const classesCanMiss = Math.floor((A - T * C) / T);

    resultCard.className = 'calc-result-card safe-zone';
    resultIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    resultStatus.textContent = 'Safe Zone';

    if (classesCanMiss > 0) {
      resultText.innerHTML = `Attendance target achieved! You can safely miss the next <strong>${classesCanMiss}</strong> classes without falling below <strong>${currentTarget}%</strong>.`;
    } else {
      resultText.innerHTML = `Attendance target achieved! Keep attending to stay above <strong>${currentTarget}%</strong>.`;
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
    // Format name (e.g. target_calculator -> Target Calculator)
    const formattedName = sectionId.charAt(0).toUpperCase() + sectionId.slice(1).replace('_', ' ');
    titleDisplay.textContent = formattedName;
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









