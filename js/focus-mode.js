// LEARNING: This file handles focus mode functionality
// Focus mode creates a full-screen overlay to get student attention

document.addEventListener('DOMContentLoaded', function() {
    initializeFocusMode();
});

function initializeFocusMode() {
    // Set up keyboard event listener for Escape key
    setupKeyboardShortcuts();
    
    // Load any saved focus settings
    loadFocusSettings();
}

// =============================================================================
// LEARNING: Focus Mode Control Functions
// =============================================================================

function enterFocusMode() {
    // LEARNING: Get the message and color from the form
    const message = document.getElementById('focus-message').value.trim();
    const backgroundColor = document.getElementById('background-color').value;
    
    // Validate message
    if (!message) {
        ClassroomUtils.showToast('Please enter a focus message!', 'warning');
        document.getElementById('focus-message').focus();
        return;
    }
    
    // Save current settings
    saveFocusSettings();
    
    // Set the message and background
    updateFocusDisplay(message, backgroundColor);
    
    // Show the full-screen overlay
    const overlay = document.getElementById('focus-mode-overlay');
    overlay.style.display = 'flex'; // Use flex for centering
    
    // Hide the regular page content (optional - focus mode is full screen anyway)
    document.body.style.overflow = 'hidden'; // Prevent scrolling
    
    // Add a small delay for smooth transition
    setTimeout(() => {
        overlay.classList.add('fade-in');
    }, 10);
}

function exitFocusMode() {
    // LEARNING: Hide the focus mode overlay and restore normal view
    const overlay = document.getElementById('focus-mode-overlay');
    
    // Add exit animation
    overlay.style.opacity = '0';
    
    // After animation completes, hide the overlay
    setTimeout(() => {
        overlay.style.display = 'none';
        overlay.style.opacity = '1'; // Reset for next time
        overlay.classList.remove('fade-in');
        
        // Restore body scrolling
        document.body.style.overflow = 'auto';
    }, 300);
}

function updateFocusDisplay(message, backgroundColor) {
    // LEARNING: Update the focus mode display with new content
    const focusModeText = document.getElementById('focus-mode-text');
    const focusModeOverlay = document.getElementById('focus-mode-overlay');
    
    // Set the message
    focusModeText.textContent = message;
    
    // Set the background color using CSS classes
    // LEARNING: Remove any existing color classes first
    focusModeOverlay.className = 'focus-mode';
    
    // Add the appropriate background color class
    switch (backgroundColor) {
        case 'success':
            focusModeOverlay.style.backgroundColor = '#23d160';
            break;
        case 'warning':
            focusModeOverlay.style.backgroundColor = '#ffdd57';
            focusModeOverlay.style.color = '#363636'; // Dark text on light background
            document.querySelector('.focus-mode-exit').style.color = '#363636';
            document.querySelector('.focus-mode-exit').style.borderColor = '#363636';
            break;
        case 'danger':
            focusModeOverlay.style.backgroundColor = '#ff3860';
            break;
        case 'info':
            focusModeOverlay.style.backgroundColor = '#209cee';
            break;
        case 'dark':
            focusModeOverlay.style.backgroundColor = '#363636';
            break;
        default: // primary
            focusModeOverlay.style.backgroundColor = '#3273dc';
            break;
    }
}

// =============================================================================
// LEARNING: Quick Message Functions
// =============================================================================

function setFocusMessage(message) {
    // LEARNING: Set the focus message input and trigger focus mode immediately
    document.getElementById('focus-message').value = message;
    
    // Optional: automatically enter focus mode
    // Uncomment the line below if you want clicking presets to immediately show focus mode
    // enterFocusMode();
    
    // Or just show a preview toast
    ClassroomUtils.showToast(`Message set: "${message}"`, 'success', 2000);
}

// =============================================================================
// LEARNING: Settings Management
// =============================================================================

function loadFocusSettings() {
    // LEARNING: Load saved focus mode preferences
    const settings = ClassroomStorage.getSettings();
    
    if (settings.lastFocusMessage) {
        document.getElementById('focus-message').value = settings.lastFocusMessage;
    }
    
    if (settings.lastFocusColor) {
        document.getElementById('background-color').value = settings.lastFocusColor;
    }
}

function saveFocusSettings() {
    // LEARNING: Save current focus settings for next time
    const message = document.getElementById('focus-message').value;
    const color = document.getElementById('background-color').value;
    
    ClassroomStorage.updateSettings({
        lastFocusMessage: message,
        lastFocusColor: color
    });
}

// =============================================================================
// LEARNING: Keyboard Shortcuts
// =============================================================================

function setupKeyboardShortcuts() {
    // LEARNING: Listen for keyboard events on the entire document
    document.addEventListener('keydown', function(event) {
        
        // Escape key - exit focus mode if active
        if (event.key === 'Escape') {
            const overlay = document.getElementById('focus-mode-overlay');
            if (overlay.style.display !== 'none') {
                exitFocusMode();
                event.preventDefault(); // Prevent any default escape behavior
            }
        }
        
        // F11 or F key - quick enter focus mode (when not in focus mode)
        if ((event.key === 'F11' || (event.key === 'f' && event.ctrlKey)) && 
            document.getElementById('focus-mode-overlay').style.display === 'none') {
            event.preventDefault();
            enterFocusMode();
        }
    });
}

// =============================================================================
// LEARNING: Enhanced Focus Features
// =============================================================================

function createCustomFocusMessage() {
    // LEARNING: Future enhancement - could add a modal for creating custom messages
    // with more formatting options, emojis, etc.
    ClassroomUtils.showToast('Custom message creator - coming soon!', 'info');
}

function saveFocusPreset() {
    // LEARNING: Future enhancement - allow teachers to save their own preset messages
    const message = document.getElementById('focus-message').value.trim();
    
    if (!message) {
        ClassroomUtils.showToast('Please enter a message to save as preset', 'warning');
        return;
    }
    
    // For now, just save to settings - in a full app we might save to a presets array
    const settings = ClassroomStorage.getSettings();
    const presets = settings.focusPresets || [];
    
    if (!presets.includes(message)) {
        presets.push(message);
        ClassroomStorage.updateSettings({ focusPresets: presets });
        ClassroomUtils.showToast('Message saved as preset!', 'success');
    } else {
        ClassroomUtils.showToast('This message is already saved as a preset', 'info');
    }
}

// =============================================================================
// LEARNING: Accessibility Features
// =============================================================================

function increaseFontSize() {
    // LEARNING: Make text larger for better visibility
    const textElement = document.getElementById('focus-mode-text');
    const currentSize = window.getComputedStyle(textElement).fontSize;
    const newSize = parseFloat(currentSize) + 10;
    textElement.style.fontSize = newSize + 'px';
}

function decreaseFontSize() {
    // LEARNING: Make text smaller
    const textElement = document.getElementById('focus-mode-text');
    const currentSize = window.getComputedStyle(textElement).fontSize;
    const newSize = Math.max(20, parseFloat(currentSize) - 10); // Don't go below 20px
    textElement.style.fontSize = newSize + 'px';
}

function resetFontSize() {
    // LEARNING: Reset to default size
    const textElement = document.getElementById('focus-mode-text');
    textElement.style.fontSize = ''; // Remove inline style to use CSS default
}

// =============================================================================
// LEARNING: Focus Mode Analytics (Educational)
// =============================================================================

function trackFocusModeUsage() {
    // LEARNING: In a real app, you might track how often teachers use focus mode
    const settings = ClassroomStorage.getSettings();
    const focusCount = (settings.focusModeUsageCount || 0) + 1;
    
    ClassroomStorage.updateSettings({
        focusModeUsageCount: focusCount,
        lastFocusModeUsed: new Date().toISOString()
    });
    
    // Show milestone messages
    if (focusCount === 1) {
        setTimeout(() => {
            ClassroomUtils.showToast('First time using focus mode! Great for getting attention.', 'info', 3000);
        }, 500);
    } else if (focusCount === 10) {
        setTimeout(() => {
            ClassroomUtils.showToast('You\'ve used focus mode 10 times! You\'re becoming a pro!', 'success', 3000);
        }, 500);
    }
}

// =============================================================================
// LEARNING: Utility Functions
// =============================================================================

function previewFocusMode() {
    // LEARNING: Show a small preview of what focus mode will look like
    const message = document.getElementById('focus-message').value.trim();
    const color = document.getElementById('background-color').value;
    
    if (!message) {
        ClassroomUtils.showToast('Enter a message to preview', 'warning');
        return;
    }
    
    // Create a temporary preview element
    const preview = document.createElement('div');
    preview.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--primary-color);
        color: white;
        padding: 2rem;
        border-radius: 8px;
        font-size: 1.5rem;
        font-weight: bold;
        text-align: center;
        z-index: 1000;
        box-shadow: 0 8px 16px rgba(0,0,0,0.3);
        max-width: 80%;
    `;
    
    preview.textContent = `Preview: ${message}`;
    document.body.appendChild(preview);
    
    // Remove after 3 seconds
    setTimeout(() => {
        document.body.removeChild(preview);
    }, 3000);
}

// =============================================================================
// LEARNING: Make functions available globally
// =============================================================================

window.FocusModeActions = {
    enterFocusMode,
    exitFocusMode,
    setFocusMessage,
    previewFocusMode,
    saveFocusPreset,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize
};