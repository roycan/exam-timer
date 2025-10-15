// LEARNING: This file handles all timer functionality
// It demonstrates setInterval, time calculations, and state management in vanilla JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeTimer();
});

// LEARNING: Global variables to manage timer state
let timerInterval = null;
let currentTime = 1500; // Default 25 minutes in seconds
let initialTime = 1500; // Store the original time for progress calculation
let isRunning = false;
let mode = 'countdown'; // 'countdown' or 'stopwatch'
let settings = {
    alertsEnabled: true,
    finalWarning: true,
    lastMinute: true,
    soundType: 'beep'
};

// Track whether alerts have been triggered (prevent multiple alerts)
let finalWarningTriggered = false;
let lastMinuteTriggered = false;

function initializeTimer() {
    // Load saved settings
    loadTimerSettings();
    
    // Set up event listeners
    setupEventListeners();
    
    // Update display
    updateDisplay();
    updateAlertInfo();
    
    // Check for quick timer from dashboard
    checkQuickTimerSetup();
}

// =============================================================================
// LEARNING: Event Listener Setup
// =============================================================================

function setupEventListeners() {
    // LEARNING: Get DOM elements and attach event listeners
    document.getElementById('start-btn').addEventListener('click', startTimer);
    document.getElementById('pause-btn').addEventListener('click', pauseTimer);
    document.getElementById('reset-btn').addEventListener('click', resetTimer);
    
    // Mode toggle buttons
    document.getElementById('countdown-mode-btn').addEventListener('click', () => setMode('countdown'));
    document.getElementById('stopwatch-mode-btn').addEventListener('click', () => setMode('stopwatch'));
    
    // Alert settings
    document.getElementById('alerts-enabled').addEventListener('change', toggleAlertOptions);
    
    // Custom time inputs - update timer when Enter is pressed
    ['custom-hours', 'custom-minutes', 'custom-seconds'].forEach(id => {
        document.getElementById(id).addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                setCustomTime();
            }
        });
    });
}

// =============================================================================
// LEARNING: Timer Control Functions
// =============================================================================

function startTimer() {
    // LEARNING: Only start if not already running
    if (isRunning) return;
    
    isRunning = true;
    updateButtons();
    updateStatus('Running');
    
    // LEARNING: setInterval runs a function repeatedly at specified intervals
    timerInterval = setInterval(() => {
        if (mode === 'countdown') {
            currentTime--;
            
            // Check for alerts
            checkAlerts();
            
            // Check if countdown finished
            if (currentTime <= 0) {
                currentTime = 0;
                timerFinished();
                return;
            }
        } else {
            // Stopwatch mode - count up
            currentTime++;
        }
        
        updateDisplay();
    }, 1000); // Run every 1000 milliseconds (1 second)
}

function pauseTimer() {
    if (!isRunning) return;
    
    isRunning = false;
    
    // LEARNING: clearInterval stops the timer
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    updateButtons();
    updateStatus('Paused');
}

function resetTimer() {
    // Stop the timer if running
    if (isRunning) {
        pauseTimer();
    }
    
    // Reset time based on mode
    if (mode === 'countdown') {
        currentTime = initialTime;
    } else {
        currentTime = 0;
    }
    
    // Reset alert flags
    finalWarningTriggered = false;
    lastMinuteTriggered = false;
    
    updateDisplay();
    updateStatus('Ready');
}

function timerFinished() {
    // Stop the timer
    pauseTimer();
    
    // Play completion sound
    if (settings.alertsEnabled) {
        playAlertSound(settings.soundType);
        
        // Play a longer completion sound
        setTimeout(() => playAlertSound(settings.soundType), 300);
        setTimeout(() => playAlertSound(settings.soundType), 600);
    }
    
    // Show completion modal
    ClassroomUtils.showModal('timer-finished-modal');
    
    updateStatus('Finished');
}

// =============================================================================
// LEARNING: Mode Management
// =============================================================================

function setMode(newMode) {
    // LEARNING: Only change mode if timer is not running
    if (isRunning) {
        ClassroomUtils.showToast('Stop the timer before changing modes', 'warning');
        return;
    }
    
    mode = newMode;
    
    // Update UI based on mode
    const countdownBtn = document.getElementById('countdown-mode-btn');
    const stopwatchBtn = document.getElementById('stopwatch-mode-btn');
    const progressContainer = document.getElementById('progress-container');
    const timerTitle = document.getElementById('timer-title');
    
    if (mode === 'countdown') {
        countdownBtn.className = 'button is-primary is-medium';
        stopwatchBtn.className = 'button is-light is-medium';
        progressContainer.style.display = 'block';
        timerTitle.textContent = 'Exam Timer';
        
        // Reset to default countdown time
        currentTime = initialTime;
        updateDisplay();
    } else {
        countdownBtn.className = 'button is-light is-medium';
        stopwatchBtn.className = 'button is-primary is-medium';
        progressContainer.style.display = 'none';
        timerTitle.textContent = 'Stopwatch';
        
        // Reset to zero for stopwatch
        currentTime = 0;
        updateDisplay();
    }
    
    updateStatus('Ready');
}

// =============================================================================
// LEARNING: Time Setting Functions
// =============================================================================

function setPresetTime(seconds) {
    // LEARNING: Only allow time changes when timer is stopped
    if (isRunning) {
        ClassroomUtils.showToast('Stop the timer before changing time', 'warning');
        return;
    }
    
    if (mode === 'stopwatch') {
        ClassroomUtils.showToast('Presets only work in countdown mode', 'info');
        return;
    }
    
    currentTime = seconds;
    initialTime = seconds;
    
    // Update custom time inputs to reflect the preset
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    document.getElementById('custom-hours').value = hours;
    document.getElementById('custom-minutes').value = minutes;
    document.getElementById('custom-seconds').value = remainingSeconds;
    
    updateDisplay();
    updateStatus('Ready');
    
    ClassroomUtils.showToast(`Timer set to ${formatTime(seconds)}`, 'success');
}

function setCustomTime() {
    if (isRunning) {
        ClassroomUtils.showToast('Stop the timer before changing time', 'warning');
        return;
    }
    
    if (mode === 'stopwatch') {
        ClassroomUtils.showToast('Custom time only works in countdown mode', 'info');
        return;
    }
    
    // LEARNING: Get values from input fields and validate them
    const hours = parseInt(document.getElementById('custom-hours').value) || 0;
    const minutes = parseInt(document.getElementById('custom-minutes').value) || 0;
    const seconds = parseInt(document.getElementById('custom-seconds').value) || 0;
    
    // Validate input ranges
    if (hours < 0 || hours > 23) {
        ClassroomUtils.showToast('Hours must be between 0 and 23', 'danger');
        return;
    }
    if (minutes < 0 || minutes > 59) {
        ClassroomUtils.showToast('Minutes must be between 0 and 59', 'danger');
        return;
    }
    if (seconds < 0 || seconds > 59) {
        ClassroomUtils.showToast('Seconds must be between 0 and 59', 'danger');
        return;
    }
    
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    
    if (totalSeconds === 0) {
        ClassroomUtils.showToast('Timer must be at least 1 second', 'warning');
        return;
    }
    
    currentTime = totalSeconds;
    initialTime = totalSeconds;
    
    updateDisplay();
    updateStatus('Ready');
    
    ClassroomUtils.showToast(`Custom timer set to ${formatTime(totalSeconds)}`, 'success');
}

// =============================================================================
// LEARNING: Alert System
// =============================================================================

function checkAlerts() {
    if (!settings.alertsEnabled) return;
    
    // 5-minute warning (300 seconds)
    if (settings.finalWarning && !finalWarningTriggered && currentTime === 300) {
        finalWarningTriggered = true;
        playAlertSound(settings.soundType);
        ClassroomUtils.showToast('5 minutes remaining!', 'warning', 2000);
    }
    
    // Last minute beeps
    if (settings.lastMinute && currentTime <= 60 && currentTime > 0) {
        if (!lastMinuteTriggered) {
            lastMinuteTriggered = true;
        }
        // Beep every 10 seconds in the last minute
        if (currentTime % 10 === 0) {
            playAlertSound(settings.soundType);
        }
    }
}

function playAlertSound(soundType) {
    // LEARNING: Use Web Audio API to create different sound types
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Different frequencies for different sound types
        switch (soundType) {
            case 'chime':
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
                break;
            case 'bell':
                oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.15);
                break;
            default: // beep
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                break;
        }
        
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
        console.warn('Audio not supported:', error);
    }
}

function testAlertSound() {
    const soundType = document.getElementById('alert-sound').value;
    playAlertSound(soundType);
    ClassroomUtils.showToast(`Playing ${soundType} sound`, 'info');
}

// =============================================================================
// LEARNING: Settings Management
// =============================================================================

function loadTimerSettings() {
    // LEARNING: Load settings from localStorage using our storage utility
    const savedSettings = ClassroomStorage.getTimerSettings();
    
    // Merge with defaults
    settings = { ...settings, ...savedSettings };
    
    // Update UI elements
    document.getElementById('alerts-enabled').checked = settings.alertsEnabled;
    document.getElementById('final-warning').checked = settings.finalWarning;
    document.getElementById('last-minute').checked = settings.lastMinute;
    document.getElementById('alert-sound').value = settings.soundType;
    
    toggleAlertOptions();
}

function saveTimerSettings() {
    // LEARNING: Get current form values and save them
    settings = {
        alertsEnabled: document.getElementById('alerts-enabled').checked,
        finalWarning: document.getElementById('final-warning').checked,
        lastMinute: document.getElementById('last-minute').checked,
        soundType: document.getElementById('alert-sound').value
    };
    
    ClassroomStorage.updateTimerSettings(settings);
    updateAlertInfo();
    
    ClassroomUtils.showToast('Timer settings saved!', 'success');
}

function toggleAlertOptions() {
    // LEARNING: Show/hide alert options based on main checkbox
    const alertsEnabled = document.getElementById('alerts-enabled').checked;
    const alertOptions = document.getElementById('alert-options');
    
    alertOptions.style.display = alertsEnabled ? 'block' : 'none';
    
    // Update our settings object
    settings.alertsEnabled = alertsEnabled;
    
    updateAlertInfo();
}

function updateAlertInfo() {
    // LEARNING: Update the alert info display
    const alertInfo = document.getElementById('alert-info');
    
    if (settings.alertsEnabled) {
        const alerts = [];
        if (settings.finalWarning) alerts.push('5-minute warning');
        if (settings.lastMinute) alerts.push('last minute beeps');
        
        alertInfo.innerHTML = `
            <p><i class="fas fa-bell mr-2"></i>
            Alerts enabled: ${alerts.join(', ')}</p>
        `;
        alertInfo.className = 'notification is-info is-light mt-4';
    } else {
        alertInfo.innerHTML = `
            <p><i class="fas fa-bell-slash mr-2"></i>
            Audio alerts disabled</p>
        `;
        alertInfo.className = 'notification is-warning is-light mt-4';
    }
}

// =============================================================================
// LEARNING: Display Update Functions
// =============================================================================

function updateDisplay() {
    // Update the main timer display
    document.getElementById('timer-display').textContent = formatTime(currentTime);
    
    // Update progress bar for countdown mode
    if (mode === 'countdown' && initialTime > 0) {
        const progress = ((initialTime - currentTime) / initialTime) * 100;
        document.getElementById('progress-bar').style.width = progress + '%';
    }
}

function updateButtons() {
    // LEARNING: Enable/disable buttons based on timer state
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    
    if (isRunning) {
        startBtn.disabled = true;
        startBtn.className = 'button is-success is-large-classroom';
        pauseBtn.disabled = false;
        pauseBtn.className = 'button is-warning is-large-classroom';
    } else {
        startBtn.disabled = false;
        startBtn.className = 'button is-success is-large-classroom';
        pauseBtn.disabled = true;
        pauseBtn.className = 'button is-warning is-large-classroom';
    }
}

function updateStatus(status) {
    // LEARNING: Update status display with appropriate styling
    const statusElement = document.getElementById('timer-status');
    statusElement.textContent = status;
    
    // Change color based on status
    statusElement.className = 'tag is-large';
    
    switch (status) {
        case 'Running':
            statusElement.className += ' is-success';
            break;
        case 'Paused':
            statusElement.className += ' is-warning';
            break;
        case 'Finished':
            statusElement.className += ' is-danger';
            break;
        default: // Ready
            statusElement.className += ' is-info';
            break;
    }
}

// =============================================================================
// LEARNING: Utility Functions
// =============================================================================

function formatTime(totalSeconds) {
    // LEARNING: Convert seconds to readable time format
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function checkQuickTimerSetup() {
    // LEARNING: Check if user came from dashboard with a preset time
    const quickTimer = localStorage.getItem('quick_timer_duration');
    if (quickTimer) {
        const duration = parseInt(quickTimer);
        localStorage.removeItem('quick_timer_duration'); // Clean up
        setPresetTime(duration);
        ClassroomUtils.showToast('Quick timer loaded from dashboard!', 'info');
    }
}

function closeTimerFinishedModal() {
    ClassroomUtils.hideModal('timer-finished-modal');
}

// LEARNING: Make functions available globally for onclick handlers
window.TimerActions = {
    setPresetTime,
    setCustomTime,
    testAlertSound,
    saveTimerSettings,
    closeTimerFinishedModal,
    resetTimer: resetTimer // For the modal button
};