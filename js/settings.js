// LEARNING: This file handles all settings page functionality
// It demonstrates CRUD operations (Create, Read, Update, Delete) for classes and app settings

document.addEventListener('DOMContentLoaded', function() {
    initializeSettings();
});

let importedData = null; // Global variable to store imported data before confirmation

function initializeSettings() {
    // Load and display current settings
    loadGeneralSettings();
    loadClassesList();
    loadAppStatistics();
    
    // Set up form event listeners
    setupFormHandlers();
}

// =============================================================================
// LEARNING: General Settings Management
// =============================================================================

function loadGeneralSettings() {
    // LEARNING: Get settings from localStorage and populate form fields
    const settings = ClassroomStorage.getSettings();
    
    document.getElementById('teacher-name').value = settings.teacherName || '';
    document.getElementById('school-name').value = settings.schoolName || '';
    document.getElementById('sound-enabled').checked = settings.soundEnabled !== false;
}

function saveGeneralSettings() {
    // LEARNING: Get form data and save to localStorage
    const teacherName = document.getElementById('teacher-name').value.trim();
    const schoolName = document.getElementById('school-name').value.trim();
    const soundEnabled = document.getElementById('sound-enabled').checked;
    
    // Validate required fields
    if (!teacherName) {
        ClassroomUtils.showToast('Teacher name is required!', 'danger');
        return;
    }
    
    try {
        // Update settings in localStorage
        ClassroomStorage.updateSettings({
            teacherName,
            schoolName,
            soundEnabled
        });
        
        ClassroomUtils.showToast('Settings saved successfully!', 'success');
        
        // Refresh statistics in case teacher name affects display
        loadAppStatistics();
        
    } catch (error) {
        ClassroomUtils.showToast('Error saving settings: ' + error.message, 'danger');
    }
}

// =============================================================================
// LEARNING: Class Management Functions
// =============================================================================

function loadClassesList() {
    // LEARNING: Display all classes in a list with edit/delete options
    const classes = ClassroomStorage.getClasses();
    const container = document.getElementById('classes-container');
    
    if (classes.length === 0) {
        container.innerHTML = `
            <div class="notification is-info is-light">
                <p>No classes yet. Add your first class above!</p>
            </div>
        `;
        return;
    }
    
    // LEARNING: Use map() to transform data and join() to create HTML
    container.innerHTML = classes.map(cls => {
        const studentCount = ClassroomStorage.getStudents(cls.id).length;
        
        return `
            <div class="box" id="class-${cls.id}">
                <div class="level">
                    <div class="level-left">
                        <div class="level-item">
                            <div>
                                <h5 class="title is-5">${escapeHtml(cls.name)}</h5>
                                <p class="subtitle is-6 has-text-grey">
                                    ${cls.period ? escapeHtml(cls.period) + ' • ' : ''}
                                    ${studentCount} student${studentCount !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="level-right">
                        <div class="level-item">
                            <div class="buttons">
                                <button class="button is-small is-info" 
                                        onclick="editClass('${cls.id}')" title="Edit Class">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="button is-small is-danger" 
                                        onclick="confirmDeleteClass('${cls.id}', '${escapeHtml(cls.name)}')" 
                                        title="Delete Class">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function addClass() {
    // LEARNING: Get form data and validate before creating new class
    const name = document.getElementById('new-class-name').value.trim();
    const period = document.getElementById('new-class-period').value.trim();
    
    if (!name) {
        ClassroomUtils.showToast('Class name is required!', 'danger');
        return;
    }
    
    try {
        ClassroomStorage.createClass({
            name,
            period: period || null
        });
        
        // Clear form
        document.getElementById('new-class-name').value = '';
        document.getElementById('new-class-period').value = '';
        
        // Refresh displays
        loadClassesList();
        loadAppStatistics();
        
        ClassroomUtils.showToast('Class added successfully!', 'success');
        
    } catch (error) {
        ClassroomUtils.showToast('Error adding class: ' + error.message, 'danger');
    }
}

function editClass(classId) {
    // LEARNING: Create an inline edit form for the class
    const classes = ClassroomStorage.getClasses();
    const cls = classes.find(c => c.id === classId);
    
    if (!cls) {
        ClassroomUtils.showToast('Class not found!', 'danger');
        return;
    }
    
    const classElement = document.getElementById(`class-${classId}`);
    
    // LEARNING: Replace the display with an edit form
    classElement.innerHTML = `
        <div class="field">
            <label class="label">Class Name</label>
            <div class="control">
                <input class="input" type="text" id="edit-name-${classId}" 
                       value="${escapeHtml(cls.name)}" required>
            </div>
        </div>
        <div class="field">
            <label class="label">Period/Block</label>
            <div class="control">
                <input class="input" type="text" id="edit-period-${classId}" 
                       value="${cls.period ? escapeHtml(cls.period) : ''}">
            </div>
        </div>
        <div class="field is-grouped">
            <div class="control">
                <button class="button is-success" onclick="saveClassEdit('${classId}')">
                    <i class="fas fa-save mr-2"></i>
                    Save
                </button>
            </div>
            <div class="control">
                <button class="button" onclick="cancelClassEdit()">
                    <i class="fas fa-times mr-2"></i>
                    Cancel
                </button>
            </div>
        </div>
    `;
    
    // Focus on the name input
    document.getElementById(`edit-name-${classId}`).focus();
}

function saveClassEdit(classId) {
    // LEARNING: Get edited values and update the class
    const name = document.getElementById(`edit-name-${classId}`).value.trim();
    const period = document.getElementById(`edit-period-${classId}`).value.trim();
    
    if (!name) {
        ClassroomUtils.showToast('Class name is required!', 'danger');
        return;
    }
    
    try {
        ClassroomStorage.updateClass(classId, {
            name,
            period: period || null
        });
        
        loadClassesList(); // Refresh the display
        ClassroomUtils.showToast('Class updated successfully!', 'success');
        
    } catch (error) {
        ClassroomUtils.showToast('Error updating class: ' + error.message, 'danger');
    }
}

function cancelClassEdit() {
    // LEARNING: Cancel editing and restore original display
    loadClassesList();
}

function confirmDeleteClass(classId, className) {
    // LEARNING: Show confirmation before destructive actions
    const studentCount = ClassroomStorage.getStudents(classId).length;
    let message = `Are you sure you want to delete "${className}"?`;
    
    if (studentCount > 0) {
        message += `\n\nThis will also delete ${studentCount} student${studentCount !== 1 ? 's' : ''} in this class.`;
    }
    
    showConfirmation(message, () => deleteClass(classId));
}

function deleteClass(classId) {
    // LEARNING: Delete class and refresh displays
    try {
        const success = ClassroomStorage.deleteClass(classId);
        
        if (success) {
            loadClassesList();
            loadAppStatistics();
            ClassroomUtils.showToast('Class deleted successfully!', 'success');
        } else {
            ClassroomUtils.showToast('Class not found!', 'danger');
        }
        
    } catch (error) {
        ClassroomUtils.showToast('Error deleting class: ' + error.message, 'danger');
    }
}

// =============================================================================
// LEARNING: Data Import/Export Functions
// =============================================================================

function handleFileImport(input) {
    // LEARNING: Handle file selection and update UI
    const file = input.files[0];
    const fileName = document.getElementById('import-file-name');
    const importButton = document.getElementById('import-button');
    
    if (file) {
        fileName.textContent = file.name;
        importButton.disabled = false;
        
        // Read and validate the file
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                importedData = JSON.parse(e.target.result);
                ClassroomUtils.showToast('File loaded successfully. Click Import to apply changes.', 'info');
            } catch (error) {
                ClassroomUtils.showToast('Invalid JSON file!', 'danger');
                importedData = null;
                importButton.disabled = true;
            }
        };
        reader.readAsText(file);
    } else {
        fileName.textContent = 'No file selected';
        importButton.disabled = true;
        importedData = null;
    }
}

function importData() {
    // LEARNING: Import data with confirmation and validation
    if (!importedData) {
        ClassroomUtils.showToast('No valid file selected!', 'danger');
        return;
    }
    
    showConfirmation(
        'This will replace all your current data. Are you sure you want to continue?',
        () => {
            try {
                ClassroomStorage.importAppData(importedData);
                
                // Refresh all displays
                loadGeneralSettings();
                loadClassesList();
                loadAppStatistics();
                
                // Clear file input
                document.getElementById('import-file').value = '';
                document.getElementById('import-file-name').textContent = 'No file selected';
                document.getElementById('import-button').disabled = true;
                importedData = null;
                
                ClassroomUtils.showToast('Data imported successfully!', 'success');
                
            } catch (error) {
                ClassroomUtils.showToast('Error importing data: ' + error.message, 'danger');
            }
        }
    );
}

function exportData() {
    // LEARNING: Export data using the storage utility
    try {
        ClassroomStorage.downloadAppData();
        ClassroomUtils.showToast('Data exported successfully!', 'success');
    } catch (error) {
        ClassroomUtils.showToast('Error exporting data: ' + error.message, 'danger');
    }
}

function exportSettings() {
    // LEARNING: Alternative export function (same as exportData but with different messaging)
    exportData();
}

function confirmClearData() {
    // LEARNING: Multiple confirmations for dangerous actions
    showConfirmation(
        'WARNING: This will permanently delete ALL your classroom data including classes, students, and settings. This action cannot be undone!\n\nAre you absolutely sure?',
        () => {
            showConfirmation(
                'Last chance! This will delete everything and you will lose all your work. Continue?',
                () => clearAllData()
            );
        }
    );
}

function clearAllData() {
    // LEARNING: Clear all data and reset the interface
    try {
        ClassroomStorage.clearAllData();
        
        // Refresh all displays
        loadGeneralSettings();
        loadClassesList();
        loadAppStatistics();
        
        ClassroomUtils.showToast('All data cleared successfully!', 'info');
        
    } catch (error) {
        ClassroomUtils.showToast('Error clearing data: ' + error.message, 'danger');
    }
}

// =============================================================================
// LEARNING: App Statistics Display
// =============================================================================

function loadAppStatistics() {
    // LEARNING: Calculate and display app usage statistics
    const stats = {
        classes: ClassroomStorage.getClasses().length,
        students: ClassroomStorage.getStudents().length,
        exitPrompts: ClassroomStorage.getExitPrompts().length,
        customPrompts: ClassroomStorage.getExitPrompts().filter(p => p.isCustom).length
    };
    
    const container = document.getElementById('app-statistics');
    
    container.innerHTML = `
        <div class="field">
            <label class="label">Classes</label>
            <div class="control">
                <span class="tag is-info is-large">${stats.classes}</span>
            </div>
        </div>
        
        <div class="field">
            <label class="label">Total Students</label>
            <div class="control">
                <span class="tag is-success is-large">${stats.students}</span>
            </div>
        </div>
        
        <div class="field">
            <label class="label">Exit Prompts</label>
            <div class="control">
                <span class="tag is-warning is-large">${stats.exitPrompts}</span>
                <span class="help">
                    ${stats.customPrompts} custom, ${stats.exitPrompts - stats.customPrompts} built-in
                </span>
            </div>
        </div>
        
        <div class="field">
            <label class="label">Storage Used</label>
            <div class="control">
                <span class="tag is-primary is-large">${calculateStorageUsage()} KB</span>
            </div>
        </div>
    `;
}

function calculateStorageUsage() {
    // LEARNING: Calculate how much localStorage space is being used
    let totalSize = 0;
    
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key) && key.startsWith('classroom_')) {
            totalSize += localStorage[key].length;
        }
    }
    
    // Convert to KB and round to 2 decimal places
    return Math.round((totalSize / 1024) * 100) / 100;
}

// =============================================================================
// LEARNING: Helper Functions
// =============================================================================

function setupFormHandlers() {
    // LEARNING: Set up Enter key handlers for forms
    document.getElementById('add-class-form').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            addClass();
        }
    });
    
    // Set up modal close handlers
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.onclick = () => hideModal('confirm-modal');
    });
}

function showConfirmation(message, onConfirm) {
    // LEARNING: Show confirmation modal with custom message and callback
    document.getElementById('confirm-message').textContent = message;
    ClassroomUtils.showModal('confirm-modal');
    
    // Set up confirm button (remove any existing handlers first)
    const confirmBtn = document.getElementById('confirm-yes');
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    newConfirmBtn.onclick = () => {
        ClassroomUtils.hideModal('confirm-modal');
        onConfirm();
    };
}

function hideModal(modalId) {
    // LEARNING: Helper function to hide modals
    ClassroomUtils.hideModal(modalId);
}

function escapeHtml(text) {
    // LEARNING: Prevent XSS attacks by escaping HTML characters
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// LEARNING: Make functions available globally for onclick handlers
window.SettingsActions = {
    addClass,
    editClass,
    saveClassEdit,
    cancelClassEdit,
    confirmDeleteClass,
    deleteClass,
    saveGeneralSettings,
    handleFileImport,
    importData,
    exportData,
    exportSettings,
    confirmClearData
};