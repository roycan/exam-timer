// LEARNING: This file manages all data storage for our classroom tools
// It uses localStorage to save data permanently in the browser

// LEARNING: Constants make our code more maintainable - if we need to change a key, we only change it here
const STORAGE_KEYS = {
    STUDENTS: 'classroom_students',
    CLASSES: 'classroom_classes',
    EXIT_PROMPTS: 'classroom_exit_prompts',
    SETTINGS: 'classroom_settings',
    TIMER_SETTINGS: 'classroom_timer_settings',
    NOISE_SETTINGS: 'classroom_noise_settings'
};

// LEARNING: Initialize default data when the page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeDefaultData();
});

function initializeDefaultData() {
    // Only create default data if none exists
    if (!getClasses().length) {
        createDefaultClasses();
    }
    
    if (!getExitPrompts().length) {
        createDefaultExitPrompts();
    }
    
    // Initialize default settings if they don't exist
    const settings = getSettings();
    if (Object.keys(settings).length === 0) {
        createDefaultSettings();
    }
}

// =============================================================================
// LEARNING: Class Management Functions
// =============================================================================

function getClasses() {
    return safeJSONParse(STORAGE_KEYS.CLASSES, []);
}

function createClass(classData) {
    // LEARNING: Input validation prevents bugs and bad data
    if (!classData.name || classData.name.trim() === '') {
        throw new Error('Class name is required');
    }
    
    const classes = getClasses();
    const newClass = {
        id: generateUUID(),
        name: classData.name.trim(),
        period: classData.period || null,
        createdAt: new Date().toISOString()
    };
    
    classes.push(newClass);
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
    return newClass;
}

function updateClass(id, updates) {
    const classes = getClasses();
    const index = classes.findIndex(cls => cls.id === id);
    
    if (index === -1) return null;
    
    classes[index] = { ...classes[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
    return classes[index];
}

function deleteClass(id) {
    const classes = getClasses();
    const filteredClasses = classes.filter(cls => cls.id !== id);
    
    if (filteredClasses.length === classes.length) return false;
    
    // Also delete all students in this class
    const students = getStudents();
    const filteredStudents = students.filter(student => student.classId !== id);
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(filteredStudents));
    
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(filteredClasses));
    return true;
}

// =============================================================================
// LEARNING: Student Management Functions
// =============================================================================

function getStudents(classId) {
    const allStudents = safeJSONParse(STORAGE_KEYS.STUDENTS, []);
    return classId ? allStudents.filter(student => student.classId === classId) : allStudents;
}

function createStudent(studentData) {
    if (!studentData.name || studentData.name.trim() === '') {
        throw new Error('Student name is required');
    }
    if (!studentData.classId) {
        throw new Error('Class ID is required');
    }
    
    const students = getStudents();
    const newStudent = {
        id: generateUUID(),
        name: studentData.name.trim(),
        studentId: studentData.studentId || null,
        classId: studentData.classId,
        present: studentData.present !== undefined ? studentData.present : true,
        createdAt: new Date().toISOString()
    };
    
    students.push(newStudent);
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    return newStudent;
}

function updateStudent(id, updates) {
    const students = getStudents();
    const index = students.findIndex(student => student.id === id);
    
    if (index === -1) return null;
    
    students[index] = { ...students[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    return students[index];
}

function deleteStudent(id) {
    const students = getStudents();
    const filtered = students.filter(student => student.id !== id);
    
    if (filtered.length === students.length) return false;
    
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(filtered));
    return true;
}

// =============================================================================
// LEARNING: Exit Prompts Management Functions
// =============================================================================

function getExitPrompts(category) {
    const allPrompts = safeJSONParse(STORAGE_KEYS.EXIT_PROMPTS, []);
    return category ? allPrompts.filter(prompt => prompt.category === category) : allPrompts;
}

function createExitPrompt(promptData) {
    if (!promptData.prompt || promptData.prompt.trim() === '') {
        throw new Error('Prompt text is required');
    }
    if (!promptData.category) {
        throw new Error('Category is required');
    }
    
    const prompts = getExitPrompts();
    const newPrompt = {
        id: generateUUID(),
        prompt: promptData.prompt.trim(),
        category: promptData.category,
        isCustom: promptData.isCustom !== undefined ? promptData.isCustom : true,
        usedAt: null,
        createdAt: new Date().toISOString()
    };
    
    prompts.push(newPrompt);
    localStorage.setItem(STORAGE_KEYS.EXIT_PROMPTS, JSON.stringify(prompts));
    return newPrompt;
}

function updateExitPromptUsage(id) {
    const prompts = getExitPrompts();
    const index = prompts.findIndex(prompt => prompt.id === id);
    
    if (index === -1) return null;
    
    prompts[index] = { ...prompts[index], usedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.EXIT_PROMPTS, JSON.stringify(prompts));
    return prompts[index];
}

function deleteExitPrompt(id) {
    const prompts = getExitPrompts();
    const filtered = prompts.filter(prompt => prompt.id !== id);
    
    if (filtered.length === prompts.length) return false;
    
    localStorage.setItem(STORAGE_KEYS.EXIT_PROMPTS, JSON.stringify(filtered));
    return true;
}

// =============================================================================
// LEARNING: Settings Management Functions
// =============================================================================

function getSettings() {
    return safeJSONParse(STORAGE_KEYS.SETTINGS, {});
}

function updateSettings(newSettings) {
    const currentSettings = getSettings();
    const updated = { ...currentSettings, ...newSettings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
}

// LEARNING: Timer and Noise settings have their own functions for organization
function getTimerSettings() {
    return safeJSONParse(STORAGE_KEYS.TIMER_SETTINGS, {
        alertsEnabled: true,
        finalWarning: true,
        lastMinute: true,
        soundType: 'beep'
    });
}

function updateTimerSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.TIMER_SETTINGS, JSON.stringify(settings));
}

function getNoiseSettings() {
    return safeJSONParse(STORAGE_KEYS.NOISE_SETTINGS, {
        quietThreshold: 30,
        acceptableThreshold: 50,
        firmWarningThreshold: 70,
        strongWarningThreshold: 85,
        micSensitivity: 50,
        visualAlerts: true,
        audioAlerts: true,
        audioAlertSound: 'chime'
    });
}

function updateNoiseSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.NOISE_SETTINGS, JSON.stringify(settings));
}

// =============================================================================
// LEARNING: Data Import/Export Functions
// =============================================================================

function exportAppData() {
    return {
        classes: getClasses(),
        students: getStudents(),
        settings: getSettings(),
        exitPrompts: getExitPrompts(),
        timerSettings: getTimerSettings(),
        noiseSettings: getNoiseSettings(),
        exportDate: new Date().toISOString()
    };
}

function importAppData(data) {
    // LEARNING: Validate data before importing to prevent corruption
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid data format');
    }
    
    if (data.classes) localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(data.classes));
    if (data.students) localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(data.students));
    if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
    if (data.exitPrompts) localStorage.setItem(STORAGE_KEYS.EXIT_PROMPTS, JSON.stringify(data.exitPrompts));
    if (data.timerSettings) localStorage.setItem(STORAGE_KEYS.TIMER_SETTINGS, JSON.stringify(data.timerSettings));
    if (data.noiseSettings) localStorage.setItem(STORAGE_KEYS.NOISE_SETTINGS, JSON.stringify(data.noiseSettings));
}

function downloadAppData() {
    const data = exportAppData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `classroom-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function clearAllData() {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    // Reinitialize default data
    initializeDefaultData();
}

// =============================================================================
// LEARNING: Helper Functions
// =============================================================================

// LEARNING: Safe JSON parsing prevents crashes from corrupted data
function safeJSONParse(key, fallback) {
    try {
        const stored = localStorage.getItem(key);
        if (!stored) return fallback;
        return JSON.parse(stored);
    } catch (error) {
        console.warn(`Error parsing localStorage key ${key}:`, error);
        return fallback;
    }
}

// LEARNING: Generate unique IDs using browser's built-in crypto function
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// LEARNING: Create default classes for new users
function createDefaultClasses() {
    const defaultClasses = [
        { name: "Period 1 - Computer Science", period: "Period 1" },
        { name: "Period 3 - Web Development", period: "Period 3" },
        { name: "Period 5 - Programming", period: "Period 5" },
        { name: "Period 7 - Data Structures", period: "Period 7" }
    ];
    
    defaultClasses.forEach(cls => createClass(cls));
}

// LEARNING: Create default exit prompts organized by category
function createDefaultExitPrompts() {
    const defaultPrompts = [
        // Reflection category
        { prompt: "What was the most challenging concept from today's lesson?", category: "reflection", isCustom: false },
        { prompt: "How would you explain today's topic to a friend?", category: "reflection", isCustom: false },
        { prompt: "What questions do you still have?", category: "reflection", isCustom: false },
        { prompt: "Rate your understanding from 1-5 and explain why.", category: "reflection", isCustom: false },
        { prompt: "What's one thing you want to practice more?", category: "reflection", isCustom: false },
        
        // Comprehension category
        { prompt: "What were the three main points from today's lesson?", category: "comprehension", isCustom: false },
        { prompt: "How does today's topic connect to what we learned last week?", category: "comprehension", isCustom: false },
        { prompt: "Define the key terms we discussed today in your own words.", category: "comprehension", isCustom: false },
        { prompt: "What examples helped you understand the concept best?", category: "comprehension", isCustom: false },
        
        // Application category
        { prompt: "How could you use today's concept outside of class?", category: "application", isCustom: false },
        { prompt: "What would happen if we changed one variable in today's problem?", category: "application", isCustom: false },
        { prompt: "Create your own example using today's concept.", category: "application", isCustom: false },
        { prompt: "What tools or resources would help you apply this concept?", category: "application", isCustom: false }
    ];
    
    defaultPrompts.forEach(prompt => createExitPrompt(prompt));
}

function createDefaultSettings() {
    const defaultSettings = {
        appName: "Classroom Management Tools",
        teacherName: "",
        schoolName: "",
        darkMode: false,
        soundEnabled: true,
        autoSaveInterval: 30000 // 30 seconds
    };
    
    updateSettings(defaultSettings);
}

// LEARNING: Make functions available globally for use in HTML pages
window.ClassroomStorage = {
    // Classes
    getClasses,
    createClass,
    updateClass,
    deleteClass,
    
    // Students
    getStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    
    // Exit Prompts
    getExitPrompts,
    createExitPrompt,
    updateExitPromptUsage,
    deleteExitPrompt,
    
    // Settings
    getSettings,
    updateSettings,
    getTimerSettings,
    updateTimerSettings,
    getNoiseSettings,
    updateNoiseSettings,
    
    // Import/Export
    exportAppData,
    importAppData,
    downloadAppData,
    clearAllData,
    
    // Utilities
    generateUUID
};