// LEARNING: This file handles noise monitoring functionality using Web Audio API
// It demonstrates real-time audio processing and microphone access in browsers

document.addEventListener('DOMContentLoaded', function() {
    initializeNoiseMonitor();
});

// LEARNING: Global variables for noise monitoring state
let audioContext = null;
let analyser = null;
let microphone = null;
let dataArray = null;
let isMonitoring = false;
let animationId = null;
let alertHistory = [];
let lastAlertTime = 0;
let settings = {
    acceptableThreshold: 50,
    warningThreshold: 70,
    micSensitivity: 50,
    visualAlerts: true,
    audioAlerts: true,
    audioAlertSound: 'chime'
};

function initializeNoiseMonitor() {
    // Load saved settings
    loadNoiseSettings();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize visualization
    setupVisualization();
    
    // Set up audio alert options
    updateAudioAlertOptions();
}

// =============================================================================
// LEARNING: Event Listeners and Setup
// =============================================================================

function setupEventListeners() {
    // Threshold sliders
    document.getElementById('acceptable-threshold').addEventListener('input', updateAcceptableThreshold);
    document.getElementById('warning-threshold').addEventListener('input', updateWarningThreshold);
    document.getElementById('mic-sensitivity').addEventListener('input', updateSensitivity);
    
    // Alert settings
    document.getElementById('visual-alerts').addEventListener('change', updateAudioAlertOptions);
    document.getElementById('audio-alerts').addEventListener('change', updateAudioAlertOptions);
}

function setupVisualization() {
    // LEARNING: Create visual noise bars for display
    const container = document.getElementById('noise-visualization');
    container.innerHTML = '';
    
    // Create 20 bars for visualization
    for (let i = 0; i < 20; i++) {
        const bar = document.createElement('div');
        bar.className = 'noise-bar';
        bar.style.height = '10px'; // Start with minimum height
        container.appendChild(bar);
    }
}

// =============================================================================
// LEARNING: Audio Context and Microphone Access
// =============================================================================

async function startMonitoring() {
    try {
        // LEARNING: Request microphone access from user
        const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false
            } 
        });
        
        // LEARNING: Create Web Audio API context for processing
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create audio nodes
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        
        // Configure analyser
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.3;
        
        // Connect microphone to analyser
        microphone.connect(analyser);
        
        // Set up data array for frequency analysis
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        
        // Start monitoring
        isMonitoring = true;
        updateMonitoringUI();
        
        // Start the monitoring loop
        monitorNoise();
        
        ClassroomUtils.showToast('Noise monitoring started!', 'success');
        
    } catch (error) {
        console.error('Error accessing microphone:', error);
        
        if (error.name === 'NotAllowedError') {
            ClassroomUtils.showToast('Microphone access denied. Please allow microphone access and try again.', 'danger');
        } else if (error.name === 'NotFoundError') {
            ClassroomUtils.showToast('No microphone found. Please connect a microphone and try again.', 'danger');
        } else {
            ClassroomUtils.showToast('Error accessing microphone: ' + error.message, 'danger');
        }
    }
}

function stopMonitoring() {
    if (!isMonitoring) return;
    
    // Stop monitoring
    isMonitoring = false;
    
    // Cancel animation
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    
    // Clean up audio context
    if (microphone) {
        microphone.disconnect();
        microphone = null;
    }
    
    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }
    
    analyser = null;
    dataArray = null;
    
    // Reset visualization
    resetVisualization();
    
    // Update UI
    updateMonitoringUI();
    
    ClassroomUtils.showToast('Noise monitoring stopped', 'info');
}

// =============================================================================
// LEARNING: Noise Level Analysis
// =============================================================================

function monitorNoise() {
    if (!isMonitoring || !analyser || !dataArray) return;
    
    // LEARNING: Get frequency data from microphone
    analyser.getByteFrequencyData(dataArray);
    
    // Calculate average noise level
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
    }
    
    // LEARNING: Apply sensitivity adjustment
    let averageLevel = (sum / dataArray.length) * (settings.micSensitivity / 50);
    
    // Clamp to 0-100 range
    averageLevel = Math.max(0, Math.min(100, averageLevel));
    
    // Update displays
    updateNoiseDisplay(averageLevel);
    updateVisualization(averageLevel, dataArray);
    
    // Check for alerts
    checkNoiseAlerts(averageLevel);
    
    // Continue monitoring
    animationId = requestAnimationFrame(monitorNoise);
}

function updateNoiseDisplay(level) {
    // Update main display
    document.getElementById('noise-level-display').textContent = Math.round(level);
    
    // Update text description
    const textElement = document.getElementById('noise-level-text');
    const displayElement = document.getElementById('noise-level-display');
    
    if (level <= 30) {
        textElement.textContent = 'Quiet';
        textElement.className = 'subtitle has-text-success';
        displayElement.className = 'title is-1 has-text-success';
    } else if (level <= settings.acceptableThreshold) {
        textElement.textContent = 'Acceptable';
        textElement.className = 'subtitle has-text-info';
        displayElement.className = 'title is-1 has-text-info';
    } else if (level <= settings.warningThreshold) {
        textElement.textContent = 'Getting Loud';
        textElement.className = 'subtitle has-text-warning';
        displayElement.className = 'title is-1 has-text-warning';
    } else {
        textElement.textContent = 'Too Loud!';
        textElement.className = 'subtitle has-text-danger';
        displayElement.className = 'title is-1 has-text-danger';
    }
}

function updateVisualization(level, frequencyData) {
    const bars = document.querySelectorAll('#noise-visualization .noise-bar');
    
    // LEARNING: Map frequency data to visual bars
    bars.forEach((bar, index) => {
        // Calculate height based on frequency data
        const dataIndex = Math.floor((index / bars.length) * frequencyData.length);
        const height = (frequencyData[dataIndex] / 255) * 180; // Max height 180px
        
        bar.style.height = Math.max(10, height) + 'px';
        
        // Apply color based on current noise level
        bar.classList.remove('quiet', 'acceptable', 'warning', 'danger', 'active');
        
        if (height > 20) { // Only show active bars
            bar.classList.add('active');
            
            if (level <= 30) {
                bar.classList.add('quiet');
            } else if (level <= settings.acceptableThreshold) {
                bar.classList.add('acceptable');
            } else if (level <= settings.warningThreshold) {
                bar.classList.add('warning');
            } else {
                bar.classList.add('danger');
            }
        }
    });
}

function resetVisualization() {
    const bars = document.querySelectorAll('#noise-visualization .noise-bar');
    bars.forEach(bar => {
        bar.style.height = '10px';
        bar.classList.remove('quiet', 'acceptable', 'warning', 'danger', 'active');
    });
    
    // Reset display
    document.getElementById('noise-level-display').textContent = '0';
    document.getElementById('noise-level-display').className = 'title is-1';
    document.getElementById('noise-level-text').textContent = 'Quiet';
    document.getElementById('noise-level-text').className = 'subtitle';
}

// =============================================================================
// LEARNING: Alert System
// =============================================================================

function checkNoiseAlerts(level) {
    const now = Date.now();
    
    // LEARNING: Prevent too many alerts (throttling)
    if (now - lastAlertTime < 3000) return; // Max one alert every 3 seconds
    
    if (level > settings.warningThreshold) {
        triggerAlert('danger', level);
        lastAlertTime = now;
    } else if (level > settings.acceptableThreshold) {
        // Only warn occasionally about acceptable level
        if (now - lastAlertTime > 10000) { // Warn every 10 seconds
            triggerAlert('warning', level);
            lastAlertTime = now;
        }
    }
}

function triggerAlert(type, level) {
    // Add to alert history
    alertHistory.unshift({
        timestamp: new Date(),
        type: type,
        level: Math.round(level),
        message: type === 'danger' ? 'Noise level too high!' : 'Noise level getting high'
    });
    
    // Keep only last 10 alerts
    if (alertHistory.length > 10) {
        alertHistory = alertHistory.slice(0, 10);
    }
    
    // Show visual alert
    if (settings.visualAlerts) {
        showVisualAlert(type);
    }
    
    // Play audio alert
    if (settings.audioAlerts) {
        playAlertSound(settings.audioAlertSound);
    }
    
    // Update alert history display
    updateAlertHistoryDisplay();
    
    // Show toast notification
    const message = type === 'danger' ? 
        `Noise too loud! (${Math.round(level)})` : 
        `Noise getting high (${Math.round(level)})`;
    ClassroomUtils.showToast(message, type === 'danger' ? 'danger' : 'warning', 2000);
}

function showVisualAlert(type) {
    // LEARNING: Add visual alert animation to the page
    const body = document.body;
    body.classList.add('noise-alert');
    
    // Set border color based on alert type
    if (type === 'danger') {
        body.style.borderColor = '#ff3860';
        body.style.backgroundColor = 'rgba(255, 56, 96, 0.1)';
    } else {
        body.style.borderColor = '#ffdd57';
        body.style.backgroundColor = 'rgba(255, 221, 87, 0.1)';
    }
    
    // Remove alert styling after animation
    setTimeout(() => {
        body.classList.remove('noise-alert');
        body.style.borderColor = '';
        body.style.backgroundColor = '';
    }, 500);
}

function playAlertSound(soundType) {
    // LEARNING: Create different alert sounds using Web Audio API
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        // Different sound patterns for different alert types
        switch (soundType) {
            case 'chime':
                // Ascending chime
                oscillator.frequency.setValueAtTime(523, audioCtx.currentTime); // C5
                oscillator.frequency.setValueAtTime(659, audioCtx.currentTime + 0.1); // E5
                oscillator.frequency.setValueAtTime(784, audioCtx.currentTime + 0.2); // G5
                break;
            case 'bell':
                // Bell-like sound
                oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.5);
                break;
            default: // beep
                oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
                break;
        }
        
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.5);
        
    } catch (error) {
        console.warn('Audio alert not supported:', error);
    }
}

function testAlertSound() {
    const soundType = document.getElementById('alert-sound').value;
    playAlertSound(soundType);
    ClassroomUtils.showToast(`Testing ${soundType} alert sound`, 'info');
}

// =============================================================================
// LEARNING: Alert History Management
// =============================================================================

function updateAlertHistoryDisplay() {
    const historyCard = document.getElementById('alert-history-card');
    const historyList = document.getElementById('alert-history-list');
    
    if (alertHistory.length === 0) {
        historyCard.style.display = 'none';
        return;
    }
    
    historyCard.style.display = 'block';
    
    const historyHTML = alertHistory.map(alert => {
        const timeString = alert.timestamp.toLocaleTimeString();
        const typeClass = alert.type === 'danger' ? 'has-text-danger' : 'has-text-warning';
        const icon = alert.type === 'danger' ? 'fa-exclamation-triangle' : 'fa-exclamation-circle';
        
        return `
            <div class="level">
                <div class="level-left">
                    <div class="level-item">
                        <i class="fas ${icon} ${typeClass} mr-2"></i>
                        ${alert.message} (Level: ${alert.level})
                    </div>
                </div>
                <div class="level-right">
                    <div class="level-item">
                        <small class="has-text-grey">${timeString}</small>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    historyList.innerHTML = historyHTML;
}

function clearAlertHistory() {
    alertHistory = [];
    updateAlertHistoryDisplay();
    ClassroomUtils.showToast('Alert history cleared', 'success');
}

// =============================================================================
// LEARNING: Settings Management
// =============================================================================

function loadNoiseSettings() {
    // LEARNING: Load settings from localStorage
    const savedSettings = ClassroomStorage.getNoiseSettings();
    settings = { ...settings, ...savedSettings };
    
    // Update UI elements
    document.getElementById('acceptable-threshold').value = settings.acceptableThreshold;
    document.getElementById('warning-threshold').value = settings.warningThreshold;
    document.getElementById('mic-sensitivity').value = settings.micSensitivity;
    document.getElementById('visual-alerts').checked = settings.visualAlerts;
    document.getElementById('audio-alerts').checked = settings.audioAlerts;
    document.getElementById('alert-sound').value = settings.audioAlertSound;
    
    // Update display values
    updateAcceptableThreshold();
    updateWarningThreshold();
    updateSensitivity();
    updateAudioAlertOptions();
}

function saveNoiseSettings() {
    // Get current settings from UI
    settings = {
        acceptableThreshold: parseInt(document.getElementById('acceptable-threshold').value),
        warningThreshold: parseInt(document.getElementById('warning-threshold').value),
        micSensitivity: parseInt(document.getElementById('mic-sensitivity').value),
        visualAlerts: document.getElementById('visual-alerts').checked,
        audioAlerts: document.getElementById('audio-alerts').checked,
        audioAlertSound: document.getElementById('alert-sound').value
    };
    
    // Save to localStorage
    ClassroomStorage.updateNoiseSettings(settings);
    
    ClassroomUtils.showToast('Noise monitor settings saved!', 'success');
}

function updateAcceptableThreshold() {
    const value = document.getElementById('acceptable-threshold').value;
    document.getElementById('acceptable-value').textContent = value;
    settings.acceptableThreshold = parseInt(value);
}

function updateWarningThreshold() {
    const value = document.getElementById('warning-threshold').value;
    document.getElementById('warning-value').textContent = value;
    settings.warningThreshold = parseInt(value);
}

function updateSensitivity() {
    const value = document.getElementById('mic-sensitivity').value;
    document.getElementById('sensitivity-value').textContent = value;
    settings.micSensitivity = parseInt(value);
}

function updateAudioAlertOptions() {
    const audioAlertsEnabled = document.getElementById('audio-alerts').checked;
    const audioOptions = document.getElementById('audio-alert-options');
    
    audioOptions.style.display = audioAlertsEnabled ? 'block' : 'none';
    
    settings.visualAlerts = document.getElementById('visual-alerts').checked;
    settings.audioAlerts = audioAlertsEnabled;
}

// =============================================================================
// LEARNING: UI State Management
// =============================================================================

function updateMonitoringUI() {
    const startBtn = document.getElementById('start-monitoring-btn');
    const stopBtn = document.getElementById('stop-monitoring-btn');
    const statusTag = document.getElementById('monitoring-status');
    const permissionNotice = document.getElementById('permission-notice');
    
    if (isMonitoring) {
        startBtn.style.display = 'none';
        stopBtn.style.display = 'inline-block';
        statusTag.textContent = 'Monitoring Active';
        statusTag.className = 'tag is-success';
        permissionNotice.style.display = 'none';
    } else {
        startBtn.style.display = 'inline-block';
        stopBtn.style.display = 'none';
        statusTag.textContent = 'Not Monitoring';
        statusTag.className = 'tag is-light';
        permissionNotice.style.display = 'block';
    }
}

// =============================================================================
// LEARNING: Cleanup and Error Handling
// =============================================================================

// LEARNING: Clean up when user leaves the page
window.addEventListener('beforeunload', function() {
    if (isMonitoring) {
        stopMonitoring();
    }
});

// LEARNING: Handle visibility change (when user switches tabs)
document.addEventListener('visibilitychange', function() {
    if (document.hidden && isMonitoring) {
        // Optionally pause monitoring when tab is hidden
        // stopMonitoring();
        // ClassroomUtils.showToast('Monitoring paused (tab hidden)', 'info');
    }
});

// LEARNING: Make functions available globally for onclick handlers
window.NoiseMonitorActions = {
    startMonitoring,
    stopMonitoring,
    testAlertSound,
    saveNoiseSettings,
    clearAlertHistory
};