// Toast Notification Manager

class ToastManager {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    // Create container if it doesn't exist
    this.container = document.querySelector('.toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  }

  show({ title, message, type = 'info', duration = 4000 }) {
    this.init(); // Ensure container exists

    const toast = document.createElement('div');
    toast.className = `toast-item ${type}`;

    // Get icons based on type
    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
    } else if (type === 'warning') {
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
    } else {
      // Info
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `
      <div class="toast-icon">
        ${iconSvg}
      </div>
      <div class="toast-details">
        ${title ? `<div class="toast-title">${title}</div>` : ''}
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" aria-label="Close notification">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    `;

    // Add to container
    this.container.appendChild(toast);

    // Trigger animation in next frame
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Close button event listener
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
      this.dismiss(toast);
    });

    // Auto dismiss
    let dismissTimeout = setTimeout(() => {
      this.dismiss(toast);
    }, duration);

    // Pause on hover
    toast.addEventListener('mouseenter', () => {
      clearTimeout(dismissTimeout);
    });

    toast.addEventListener('mouseleave', () => {
      dismissTimeout = setTimeout(() => {
        this.dismiss(toast);
      }, duration / 2); // dismiss faster if hovered and left
    });
  }

  dismiss(toast) {
    if (!toast.classList.contains('show')) return;
    toast.classList.replace('show', 'hide');
    toast.addEventListener('transitionend', () => {
      toast.remove();
    });
  }
}

// Instantiate and export
const toastManager = new ToastManager();

// Expose helper functions globally
window.Toast = {
  success: (message, title = 'Success') => toastManager.show({ title, message, type: 'success' }),
  error: (message, title = 'Error') => toastManager.show({ title, message, type: 'error' }),
  warning: (message, title = 'Warning') => toastManager.show({ title, message, type: 'warning' }),
  info: (message, title = 'Info') => toastManager.show({ title, message, type: 'info' })
};

export default window.Toast;
