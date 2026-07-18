// CIST Portal - Authentication & Session Manager
import { supabaseClient } from './supabase-config.js';

let currentMode = 'student';
let activeStudent = null;

// Tab switcher slider animation
export function switchTab(mode) {
  if (currentMode === mode) return;
  currentMode = mode;

  const glider = document.getElementById('tabGlider');
  const studentTab = document.getElementById('studentTab');
  const facultyTab = document.getElementById('facultyTab');
  const idLabel = document.getElementById('idLabel');
  const userIdentifier = document.getElementById('userIdentifier');
  const btnText = document.getElementById('btnText');
  const errorAlert = document.getElementById('errorAlert');

  if (errorAlert) errorAlert.style.display = 'none';

  if (mode === 'student') {
    glider.style.transform = 'translateX(0)';
    studentTab.classList.add('active');
    facultyTab.classList.remove('active');
    
    idLabel.textContent = "Roll Number / Registration ID";
    userIdentifier.placeholder = "Enter your college Roll Number";
    btnText.textContent = "Sign In to Student Portal";
  } else {
    glider.style.transform = 'translateX(100%)';
    facultyTab.classList.add('active');
    studentTab.classList.remove('active');
    
    idLabel.textContent = "Faculty Employee ID";
    userIdentifier.placeholder = "Enter your Employee ID";
    btnText.textContent = "Sign In to Faculty Portal";
  }

  userIdentifier.value = '';
  document.getElementById('password').value = '';
}

// Show/Hide password text
export function togglePasswordVisibility() {
  const passwordInput = document.getElementById('password');
  const toggleBtn = document.getElementById('togglePasswordBtn');

  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    toggleBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
      <span>Hide</span>
    `;
  } else {
    passwordInput.type = 'password';
    toggleBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
      <span>Show</span>
    `;
  }
}

// Process login credentials
export async function handleLoginSubmit(event) {
  event.preventDefault();
  
  const identifier = document.getElementById('userIdentifier').value.trim();
  const password = document.getElementById('password').value;
  const errorAlert = document.getElementById('errorAlert');
  const errorAlertText = document.getElementById('errorAlertText');
  const submitBtn = document.getElementById('submitBtn');
  
  if (errorAlert) errorAlert.style.display = 'none';

  // Toggle loading state
  submitBtn.disabled = true;
  const originalBtnContent = submitBtn.innerHTML;
  submitBtn.innerHTML = `
    <div class="spinner"></div>
    <span>Authenticating...</span>
  `;

  // Simulate network latency (1.2 seconds) to display the premium loaders
  await new Promise(resolve => setTimeout(resolve, 1200));

  if (currentMode === 'faculty') {
    const { data: faculty, error } = await supabaseClient.authenticateFaculty(identifier, password);
    
    if (faculty && !error) {
      activeStudent = faculty;
      window.activeStudent = faculty;
      
      // Show toast
      window.Toast.success(`Welcome back, ${faculty.name}!`, "Login Successful");
      
      // Reset login button
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnContent;

      // Load portal details
      window.loadRedesignedPortal(activeStudent);
    } else {
      errorAlertText.textContent = "Invalid faculty Employee ID or password credentials.";
      errorAlert.style.display = 'flex';
      
      // Reset login button
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnContent;
      window.Toast.error("Authentication failed. Please verify your credentials.", "Error");
    }
    return;
  }

  const { data: student, error } = await supabaseClient.authenticateStudent(identifier, password);
  
  if (student && !error) {
    activeStudent = student;
    window.activeStudent = student;
    
    // Show toast
    window.Toast.success(`Welcome back, ${student.name}!`, "Login Successful");
    
    // Reset login button
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnContent;

    // Load portal details
    window.loadRedesignedPortal(activeStudent);
  } else {
    errorAlertText.textContent = "Invalid student Roll Number or password credentials.";
    errorAlert.style.display = 'flex';
    
    // Reset login button
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnContent;
    window.Toast.error("Authentication failed. Please verify your credentials.", "Error");
  }
}

// Sign out logic
export function handleLogOut() {
  const loginPageWrapper = document.getElementById('loginPageWrapper');
  const loginCard = document.getElementById('loginCard');
  const dashboardPanel = document.getElementById('dashboardPanel');

  dashboardPanel.classList.remove('active');
  window.Toast.info("Successfully signed out.", "Session Closed");
  
  setTimeout(() => {
    dashboardPanel.style.display = 'none';
    loginPageWrapper.style.display = 'flex';
    
    document.getElementById('userIdentifier').value = '';
    document.getElementById('password').value = '';
    activeStudent = null;
    window.activeStudent = null;
    
    loginCard.offsetHeight;
    loginCard.style.opacity = '1';
    loginCard.style.transform = 'scale(1)';
  }, 500);
}

// Forgot Password dialog
export function handleForgotPassword() {
  const portalType = currentMode.charAt(0).toUpperCase() + currentMode.slice(1);
  window.Toast.warning("Please contact the CIST IT Helpdesk or your department coordinator to reset your password.", `${portalType} Reset`);
}

// Expose functions globally for element listeners
window.switchTab = switchTab;
window.togglePasswordVisibility = togglePasswordVisibility;
window.handleLoginSubmit = handleLoginSubmit;
window.handleLogOut = handleLogOut;
window.handleForgotPassword = handleForgotPassword;
