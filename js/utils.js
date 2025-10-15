// LEARNING: This file contains utility functions used across multiple pages
// These are "helper functions" that make common tasks easier

// LEARNING: Wait for DOM to load before setting up utilities
document.addEventListener('DOMContentLoaded', function() {
    setupGlobalUtilities();
});

function setupGlobalUtilities() {
    // Set up any global event listeners or utilities here
    setupToastNotifications();
    setupModalHelpers();
}

// =============================================================================
// LEARNING: Toast Notification System
// =============================================================================

function showToast(message, type = 'info', duration = 3000) {
    // LEARNING: Create DOM elements programmatically with JavaScript
    const toast = document.createElement('div');
    toast.className = `notification is-${type} toast-notification`;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        max-width: 500px;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.className = 'delete';
    closeButton.onclick = () => hideToast(toast);
    
    // Add message text
    const messageText = document.createElement('span');
    messageText.textContent = message;
    
    toast.appendChild(closeButton);
    toast.appendChild(messageText);
    document.body.appendChild(toast);
    
    // LEARNING: Use setTimeout to create smooth animations
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    }, 10);
    
    // Auto-hide after duration
    if (duration > 0) {
        setTimeout(() => hideToast(toast), duration);
    }
    
    return toast;
}

function hideToast(toast) {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}

function setupToastNotifications() {
    // Add CSS for toast notifications if not already added
    if (!document.querySelector('#toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            .toast-notification {
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
        `;
        document.head.appendChild(style);
    }
}

// =============================================================================
// LEARNING: Modal Helper Functions
// =============================================================================

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('is-active');
        
        // Close modal when clicking on background or close button
        const background = modal.querySelector('.modal-background');
        const closeButtons = modal.querySelectorAll('.modal-close, .close-modal');
        
        if (background) {
            background.onclick = () => hideModal(modalId);
        }
        
        closeButtons.forEach(button => {
            button.onclick = () => hideModal(modalId);
        });
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('is-active');
    }
}

function setupModalHelpers() {
    // Set up keyboard shortcuts for modals
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            // Close any open modals
            const openModals = document.querySelectorAll('.modal.is-active');
            openModals.forEach(modal => {
                modal.classList.remove('is-active');
            });
        }
    });
}

// =============================================================================
// LEARNING: Form Validation Helpers
// =============================================================================

function validateForm(formElement) {
    let isValid = true;
    const errors = [];
    
    // Check required fields
    const requiredFields = formElement.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            errors.push(`${field.name || 'Field'} is required`);
            field.classList.add('is-danger');
        } else {
            field.classList.remove('is-danger');
        }
    });
    
    // Check email fields
    const emailFields = formElement.querySelectorAll('[type="email"]');
    emailFields.forEach(field => {
        if (field.value && !isValidEmail(field.value)) {
            isValid = false;
            errors.push('Please enter a valid email address');
            field.classList.add('is-danger');
        }
    });
    
    return { isValid, errors };
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// =============================================================================
// LEARNING: File Upload Helpers
// =============================================================================

function handleFileUpload(inputElement, callback, options = {}) {
    const file = inputElement.files[0];
    if (!file) return;
    
    // Check file type if specified
    if (options.allowedTypes) {
        if (!options.allowedTypes.includes(file.type)) {
            showToast(`Please select a ${options.allowedTypes.join(' or ')} file`, 'danger');
            return;
        }
    }
    
    // Check file size if specified (in MB)
    if (options.maxSizeMB) {
        const sizeInMB = file.size / (1024 * 1024);
        if (sizeInMB > options.maxSizeMB) {
            showToast(`File size must be less than ${options.maxSizeMB}MB`, 'danger');
            return;
        }
    }
    
    // Read file content
    const reader = new FileReader();
    reader.onload = function(event) {
        callback(event.target.result, file);
    };
    
    reader.onerror = function() {
        showToast('Error reading file', 'danger');
    };
    
    // Read as text or data URL based on file type
    if (file.type.startsWith('text/') || file.name.endsWith('.csv') || file.name.endsWith('.json')) {
        reader.readAsText(file);
    } else {
        reader.readAsDataURL(file);
    }
}

// =============================================================================
// LEARNING: CSV Processing Functions
// =============================================================================

function parseCSV(csvContent) {
    // LEARNING: Split CSV into lines and process headers
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) {
        throw new Error('CSV must have at least a header row and one data row');
    }
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const nameIndex = headers.findIndex(h => h.includes('name'));
    
    if (nameIndex === -1) {
        throw new Error('CSV must contain a "name" column');
    }
    
    const students = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length <= nameIndex) continue;
        
        const name = values[nameIndex];
        if (!name) continue;
        
        students.push({ name });
    }
    
    return students;
}

function generateCSVTemplate() {
    return 'name\nJohn Doe\nJane Smith\nMike Johnson\nSarah Wilson\nDavid Brown';
}

function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// =============================================================================
// LEARNING: Audio Utility Functions
// =============================================================================

function playBeep(frequency = 800, duration = 200) {
    // LEARNING: Web Audio API lets us create sounds programmatically
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (error) {
        console.warn('Audio not supported:', error);
    }
}

// =============================================================================
// LEARNING: Time Formatting Functions
// =============================================================================

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function parseTimeInput(timeString) {
    // Parse formats like "25:30" or "1:25:30"
    const parts = timeString.split(':').map(part => parseInt(part, 10));
    
    if (parts.length === 2) {
        // MM:SS format
        return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
        // HH:MM:SS format
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    
    throw new Error('Invalid time format. Use MM:SS or HH:MM:SS');
}

// =============================================================================
// LEARNING: Date Formatting Functions
// =============================================================================

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
}

function getTimeAgo(dateString) {
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now - past) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
}

// =============================================================================
// LEARNING: Make utilities available globally
// =============================================================================

window.ClassroomUtils = {
    // Toast notifications
    showToast,
    hideToast,
    
    // Modals
    showModal,
    hideModal,
    
    // Form validation
    validateForm,
    isValidEmail,
    
    // File handling
    handleFileUpload,
    
    // CSV processing
    parseCSV,
    generateCSVTemplate,
    downloadCSV,
    
    // Audio
    playBeep,
    
    // Time formatting
    formatTime,
    parseTimeInput,
    
    // Date formatting
    formatDate,
    formatDateTime,
    getTimeAgo
};