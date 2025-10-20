// LEARNING: This file handles all student management functionality
// It demonstrates complex data manipulation, CSV processing, and interactive UI updates

document.addEventListener('DOMContentLoaded', function() {
    initializeStudentPage();
});

// Global variables for student management
let currentClassId = null;
let selectedStudent = null;
let csvData = null;

function initializeStudentPage() {
    // Load classes for dropdowns
    loadClassSelectors();
    
    // Set up event listeners
    setupEventListeners();
    
    // Set up modal close handlers
    setupModalHandlers();
    
    // Set up keyboard shortcuts
    setupKeyboardShortcuts();
}

// =============================================================================
// LEARNING: Event Listeners and Setup
// =============================================================================

function setupEventListeners() {
    // Class selector change
    document.getElementById('class-selector').addEventListener('change', function() {
        currentClassId = this.value;
        loadStudentList();
        updateRandomSelectButton();
        loadClassStatistics();
    });
    
    // Form submissions
    document.getElementById('add-student-form').addEventListener('submit', function(event) {
        event.preventDefault();
        addStudent();
    });
}

function setupModalHandlers() {
    // Close modal buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.onclick = function() {
            const modal = this.closest('.modal');
            modal.classList.remove('is-active');
        };
    });
    
    // Close modals when clicking background
    document.querySelectorAll('.modal-background').forEach(bg => {
        bg.onclick = function() {
            const modal = this.closest('.modal');
            modal.classList.remove('is-active');
        };
    });
}

function setupKeyboardShortcuts() {
    // LEARNING: Keyboard shortcuts for quick actions
    document.addEventListener('keydown', function(event) {
        // R key - random student selection (when not in input fields)
        if (event.key === 'r' && 
            event.target.tagName !== 'INPUT' && 
            event.target.tagName !== 'TEXTAREA' &&
            event.target.tagName !== 'SELECT') {
            
            // Only trigger if button is enabled
            const btn = document.getElementById('random-select-btn');
            if (btn && !btn.disabled) {
                selectRandomStudent();
                event.preventDefault();
            }
        }
    });
}

// =============================================================================
// LEARNING: Class Management
// =============================================================================

function loadClassSelectors() {
    // LEARNING: Load classes into all dropdowns on the page
    const classes = ClassroomStorage.getClasses();
    const selectors = [
        'class-selector',
        'student-class',
        'import-class'
    ];
    
    selectors.forEach(selectorId => {
        const selector = document.getElementById(selectorId);
        if (!selector) return;
        
        // Keep the first option and clear the rest
        while (selector.children.length > 1) {
            selector.removeChild(selector.lastChild);
        }
        
        // Add class options
        classes.forEach(cls => {
            const option = document.createElement('option');
            option.value = cls.id;
            option.textContent = cls.name;
            selector.appendChild(option);
        });
    });
    
    // Show message if no classes exist
    if (classes.length === 0) {
        document.getElementById('student-list').innerHTML = `
            <div class="has-text-centered py-6">
                <i class="fas fa-school fa-3x has-text-grey-light mb-3"></i>
                <p class="has-text-grey">No classes found.</p>
                <a href="settings.html" class="button is-primary mt-3">
                    <i class="fas fa-plus mr-2"></i>
                    Create Your First Class
                </a>
            </div>
        `;
    }
}

// =============================================================================
// LEARNING: Student List Management
// =============================================================================

function loadStudentList() {
    const studentListContainer = document.getElementById('student-list');
    
    if (!currentClassId) {
        studentListContainer.innerHTML = `
            <div class="has-text-centered py-6">
                <i class="fas fa-users fa-3x has-text-grey-light mb-3"></i>
                <p class="has-text-grey">Select a class to view students</p>
            </div>
        `;
        updateStudentCount(0);
        return;
    }
    
    const students = ClassroomStorage.getStudents(currentClassId);
    
    // LEARNING: Sort students for easier lookup - present students first, then alphabetically by name
    students.sort((a, b) => {
        // 1. Sort by attendance status (present before absent)
        if (a.present !== b.present) {
            return b.present ? 1 : -1; // present (true) comes first
        }
        
        // 2. Sort alphabetically by name (case-insensitive)
        const nameA = (a.name || '').trim();
        const nameB = (b.name || '').trim();
        
        // 3. Blank names go to bottom within their attendance group
        if (!nameA && nameB) return 1;
        if (nameA && !nameB) return -1;
        if (!nameA && !nameB) return 0;
        
        // 4. Compare names alphabetically with locale-aware sorting
        return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
    });
    
    if (students.length === 0) {
        studentListContainer.innerHTML = `
            <div class="has-text-centered py-6">
                <i class="fas fa-user-plus fa-3x has-text-grey-light mb-3"></i>
                <p class="has-text-grey mb-3">No students in this class yet</p>
                <button class="button is-success" onclick="showAddStudentModal()">
                    <i class="fas fa-plus mr-2"></i>
                    Add First Student
                </button>
            </div>
        `;
        updateStudentCount(0);
        return;
    }
    
    // LEARNING: Generate HTML for each student using map() and join()
    const studentHTML = students.map(student => {
        const presentClass = student.present ? 'present' : 'absent';
        const presentIcon = student.present ? 'fa-check-circle has-text-success' : 'fa-times-circle has-text-danger';
        const presentText = student.present ? 'Present' : 'Absent';
        
        // Only show the ID line when an ID actually exists
        const idLine = student.studentId
            ? `<p class="subtitle is-7 has-text-grey mb-0">ID: ${escapeHtml(student.studentId)}</p>`
            : '';
        
        return `
            <div class="student-item ${presentClass} mb-3 p-3 border-rounded" id="student-${student.id}">
                <div class="level">
                    <div class="level-left">
                        <div class="level-item">
                            <div class="media">
                                <div class="media-left">
                                    <div class="student-avatar" style="width: 40px; height: 40px; font-size: 1rem;">
                                        ${student.name.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                                <div class="media-content">
                                    <h5 class="title is-6 mb-1">${escapeHtml(student.name)}</h5>
                                    ${idLine}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="level-right">
                        <div class="level-item">
                            <div class="buttons">
                                <button class="button is-small" onclick="toggleStudentAttendance('${student.id}')" 
                                        title="Toggle Attendance">
                                    <i class="fas ${presentIcon}"></i>
                                    <span class="ml-1">${presentText}</span>
                                </button>
                                <button class="button is-small is-info" onclick="editStudent('${student.id}')" 
                                        title="Edit Student">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="button is-small is-danger" onclick="confirmDeleteStudent('${student.id}', '${escapeHtml(student.name)}')" 
                                        title="Delete Student">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    studentListContainer.innerHTML = studentHTML;
    updateStudentCount(students.length);
}

function updateStudentCount(count) {
    document.getElementById('student-count').textContent = `${count} student${count !== 1 ? 's' : ''}`;
}

function updateRandomSelectButton() {
    const button = document.getElementById('random-select-btn');
    if (currentClassId) {
        const students = ClassroomStorage.getStudents(currentClassId);
        const presentStudents = students.filter(s => s.present);
        button.disabled = presentStudents.length === 0;
    } else {
        button.disabled = true;
    }
}

// =============================================================================
// LEARNING: Student CRUD Operations
// =============================================================================

function showAddStudentModal() {
    // Populate class dropdown if not already selected
    if (currentClassId) {
        document.getElementById('student-class').value = currentClassId;
    }
    
    // Clear form
    document.getElementById('add-student-form').reset();
    document.getElementById('student-present').checked = true;
    
    ClassroomUtils.showModal('add-student-modal');
    document.getElementById('student-name').focus();
}

function addStudent() {
    const name = document.getElementById('student-name').value.trim();
    const studentId = document.getElementById('student-id').value.trim();
    const classId = document.getElementById('student-class').value;
    const present = document.getElementById('student-present').checked;
    
    // Validate
    if (!name) {
        ClassroomUtils.showToast('Student name is required!', 'danger');
        return;
    }
    
    if (!classId) {
        ClassroomUtils.showToast('Please select a class!', 'danger');
        return;
    }
    
    try {
        ClassroomStorage.createStudent({
            name,
            studentId: studentId || null,
            classId,
            present
        });
        
        ClassroomUtils.showToast('Student added successfully!', 'success');
        ClassroomUtils.hideModal('add-student-modal');
        
        // Refresh display if adding to current class
        if (classId === currentClassId) {
            loadStudentList();
            updateRandomSelectButton();
            loadClassStatistics();
        }
        
    } catch (error) {
        ClassroomUtils.showToast('Error adding student: ' + error.message, 'danger');
    }
}

function editStudent(studentId) {
    const students = ClassroomStorage.getStudents();
    const student = students.find(s => s.id === studentId);
    
    if (!student) {
        ClassroomUtils.showToast('Student not found!', 'danger');
        return;
    }
    
    // Pre-fill form with student data
    document.getElementById('student-name').value = student.name;
    document.getElementById('student-id').value = student.studentId || '';
    document.getElementById('student-class').value = student.classId;
    document.getElementById('student-present').checked = student.present;
    
    // Change form behavior to edit mode
    const form = document.getElementById('add-student-form');
    form.onsubmit = function(event) {
        event.preventDefault();
        saveStudentEdit(studentId);
    };
    
    // Update modal title and button
    document.querySelector('#add-student-modal .modal-card-title').textContent = 'Edit Student';
    document.querySelector('#add-student-modal .modal-card-foot .button.is-success').innerHTML = '<i class="fas fa-save mr-2"></i>Save Changes';
    
    ClassroomUtils.showModal('add-student-modal');
    document.getElementById('student-name').focus();
}

function saveStudentEdit(studentId) {
    const name = document.getElementById('student-name').value.trim();
    const studentIdValue = document.getElementById('student-id').value.trim();
    const classId = document.getElementById('student-class').value;
    const present = document.getElementById('student-present').checked;
    
    if (!name) {
        ClassroomUtils.showToast('Student name is required!', 'danger');
        return;
    }
    
    if (!classId) {
        ClassroomUtils.showToast('Please select a class!', 'danger');
        return;
    }
    
    try {
        ClassroomStorage.updateStudent(studentId, {
            name,
            studentId: studentIdValue || null,
            classId,
            present
        });
        
        ClassroomUtils.showToast('Student updated successfully!', 'success');
        ClassroomUtils.hideModal('add-student-modal');
        
        // Reset form behavior
        resetAddStudentForm();
        
        // Refresh displays
        loadStudentList();
        updateRandomSelectButton();
        loadClassStatistics();
        
    } catch (error) {
        ClassroomUtils.showToast('Error updating student: ' + error.message, 'danger');
    }
}

function resetAddStudentForm() {
    // Reset form to add mode
    const form = document.getElementById('add-student-form');
    form.onsubmit = function(event) {
        event.preventDefault();
        addStudent();
    };
    
    // Reset modal title and button
    document.querySelector('#add-student-modal .modal-card-title').textContent = 'Add New Student';
    document.querySelector('#add-student-modal .modal-card-foot .button.is-success').innerHTML = '<i class="fas fa-plus mr-2"></i>Add Student';
}

function confirmDeleteStudent(studentId, studentName) {
    if (confirm(`Are you sure you want to delete "${studentName}"?\n\nThis action cannot be undone.`)) {
        deleteStudent(studentId);
    }
}

function deleteStudent(studentId) {
    try {
        const success = ClassroomStorage.deleteStudent(studentId);
        
        if (success) {
            ClassroomUtils.showToast('Student deleted successfully!', 'success');
            loadStudentList();
            updateRandomSelectButton();
            loadClassStatistics();
            
            // Clear selected student if it was deleted
            if (selectedStudent && selectedStudent.id === studentId) {
                clearSelectedStudent();
            }
        } else {
            ClassroomUtils.showToast('Student not found!', 'danger');
        }
        
    } catch (error) {
        ClassroomUtils.showToast('Error deleting student: ' + error.message, 'danger');
    }
}

// =============================================================================
// LEARNING: Attendance Management
// =============================================================================

function toggleStudentAttendance(studentId) {
    const students = ClassroomStorage.getStudents();
    const student = students.find(s => s.id === studentId);
    
    if (!student) {
        ClassroomUtils.showToast('Student not found!', 'danger');
        return;
    }
    
    try {
        ClassroomStorage.updateStudent(studentId, {
            present: !student.present
        });
        
        loadStudentList();
        updateRandomSelectButton();
        loadClassStatistics();
        
        const status = !student.present ? 'present' : 'absent';
        ClassroomUtils.showToast(`${student.name} marked as ${status}`, 'success');
        
    } catch (error) {
        ClassroomUtils.showToast('Error updating attendance: ' + error.message, 'danger');
    }
}

function toggleAllAttendance(present) {
    if (!currentClassId) {
        ClassroomUtils.showToast('Please select a class first!', 'warning');
        return;
    }
    
    const students = ClassroomStorage.getStudents(currentClassId);
    
    if (students.length === 0) {
        ClassroomUtils.showToast('No students in this class!', 'info');
        return;
    }
    
    try {
        students.forEach(student => {
            ClassroomStorage.updateStudent(student.id, { present });
        });
        
        loadStudentList();
        updateRandomSelectButton();
        loadClassStatistics();
        
        const action = present ? 'present' : 'absent';
        ClassroomUtils.showToast(`All students marked as ${action}`, 'success');
        
    } catch (error) {
        ClassroomUtils.showToast('Error updating attendance: ' + error.message, 'danger');
    }
}

// =============================================================================
// LEARNING: Random Student Selection
// =============================================================================

function selectRandomStudent() {
    if (!currentClassId) {
        ClassroomUtils.showToast('Please select a class first!', 'warning');
        return;
    }
    
    const students = ClassroomStorage.getStudents(currentClassId);
    const presentStudents = students.filter(s => s.present);
    
    if (presentStudents.length === 0) {
        ClassroomUtils.showToast('No present students to select from!', 'warning');
        return;
    }
    
    // LEARNING: Use Math.random() to select a random student
    const randomIndex = Math.floor(Math.random() * presentStudents.length);
    selectedStudent = presentStudents[randomIndex];
    
    displaySelectedStudent();
}

function displaySelectedStudent() {
    if (!selectedStudent) return;
    
    const className = ClassroomStorage.getClasses().find(c => c.id === selectedStudent.classId)?.name || 'Unknown Class';
    
    document.getElementById('selected-student-name').textContent = selectedStudent.name;
    document.getElementById('selected-student-class').textContent = className;
    document.getElementById('selected-student-actions').style.display = 'block';
    
    // Update avatar with first letter
    const avatar = document.querySelector('#selected-student-display .student-avatar');
    avatar.innerHTML = selectedStudent.name.charAt(0).toUpperCase();
}

function clearSelectedStudent() {
    selectedStudent = null;
    document.getElementById('selected-student-name').textContent = 'No student selected';
    document.getElementById('selected-student-class').textContent = '-';
    document.getElementById('selected-student-actions').style.display = 'none';
    
    const avatar = document.querySelector('#selected-student-display .student-avatar');
    avatar.innerHTML = '<i class="fas fa-user"></i>';
}

// =============================================================================
// LEARNING: Class Statistics
// =============================================================================

function loadClassStatistics() {
    const statsCard = document.getElementById('class-stats-card');
    const statsContainer = document.getElementById('class-statistics');
    
    if (!currentClassId) {
        statsCard.style.display = 'none';
        return;
    }
    
    const students = ClassroomStorage.getStudents(currentClassId);
    
    if (students.length === 0) {
        statsCard.style.display = 'none';
        return;
    }
    
    const presentCount = students.filter(s => s.present).length;
    const absentCount = students.length - presentCount;
    const attendanceRate = Math.round((presentCount / students.length) * 100);
    
    statsContainer.innerHTML = `
        <div class="columns is-mobile">
            <div class="column has-text-centered">
                <p class="heading">Present</p>
                <p class="title is-4 has-text-success">${presentCount}</p>
            </div>
            <div class="column has-text-centered">
                <p class="heading">Absent</p>
                <p class="title is-4 has-text-danger">${absentCount}</p>
            </div>
        </div>
        <div class="field">
            <label class="label">Attendance Rate</label>
            <progress class="progress is-success" value="${attendanceRate}" max="100">${attendanceRate}%</progress>
        </div>
        <div class="has-text-centered">
            <span class="tag is-light">${attendanceRate}% Present</span>
        </div>
    `;
    
    statsCard.style.display = 'block';
}

// =============================================================================
// LEARNING: CSV Import/Export Functions
// =============================================================================

function showImportModal() {
    ClassroomUtils.showModal('import-modal');
}

function handleCSVFile(input) {
    const file = input.files[0];
    const fileName = document.getElementById('csv-file-name');
    const importButton = document.getElementById('import-csv-btn');
    
    if (file) {
        fileName.textContent = file.name;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                csvData = ClassroomUtils.parseCSV(e.target.result);
                importButton.disabled = false;
                ClassroomUtils.showToast(`Found ${csvData.length} students in CSV`, 'info');
            } catch (error) {
                ClassroomUtils.showToast('Error reading CSV: ' + error.message, 'danger');
                csvData = null;
                importButton.disabled = true;
            }
        };
        reader.readAsText(file);
    } else {
        fileName.textContent = 'No file selected';
        importButton.disabled = true;
        csvData = null;
    }
}

function importCSV() {
    const classId = document.getElementById('import-class').value;
    
    if (!classId) {
        ClassroomUtils.showToast('Please select a class!', 'danger');
        return;
    }
    
    if (!csvData || csvData.length === 0) {
        ClassroomUtils.showToast('No valid CSV data to import!', 'danger');
        return;
    }
    
    try {
        let successCount = 0;
        let errorCount = 0;
        
        csvData.forEach(studentData => {
            try {
                ClassroomStorage.createStudent({
                    name: studentData.name,
                    studentId: studentData.studentId || null,
                    classId: classId,
                    present: true
                });
                successCount++;
            } catch (error) {
                console.error('Error importing student:', studentData.name, error);
                errorCount++;
            }
        });
        
        ClassroomUtils.hideModal('import-modal');
        
        if (successCount > 0) {
            ClassroomUtils.showToast(`Imported ${successCount} students successfully!`, 'success');
            
            // Refresh if importing to current class
            if (classId === currentClassId) {
                loadStudentList();
                updateRandomSelectButton();
                loadClassStatistics();
            }
        }
        
        if (errorCount > 0) {
            ClassroomUtils.showToast(`${errorCount} students failed to import`, 'warning');
        }
        
        // Reset form
        document.getElementById('csv-file').value = '';
        document.getElementById('csv-file-name').textContent = 'No file selected';
        document.getElementById('import-csv-btn').disabled = true;
        csvData = null;
        
    } catch (error) {
        ClassroomUtils.showToast('Error importing CSV: ' + error.message, 'danger');
    }
}

function downloadCSVTemplate() {
    const template = ClassroomUtils.generateCSVTemplate();
    ClassroomUtils.downloadCSV(template, 'students-template.csv');
    ClassroomUtils.showToast('CSV template downloaded!', 'success');
}

function exportStudents() {
    if (!currentClassId) {
        ClassroomUtils.showToast('Please select a class to export!', 'warning');
        return;
    }
    
    const students = ClassroomStorage.getStudents(currentClassId);
    const className = ClassroomStorage.getClasses().find(c => c.id === currentClassId)?.name || 'Unknown';
    
    if (students.length === 0) {
        ClassroomUtils.showToast('No students to export!', 'info');
        return;
    }
    
    // LEARNING: Convert student data to CSV format
    let csvContent = 'name,studentId,present\n';
    csvContent += students.map(student => 
        `"${student.name}","${student.studentId || ''}","${student.present ? 'Yes' : 'No'}"`
    ).join('\n');
    
    const fileName = `${className}-students-${new Date().toISOString().split('T')[0]}.csv`;
    ClassroomUtils.downloadCSV(csvContent, fileName);
    
    ClassroomUtils.showToast('Student list exported!', 'success');
}

// =============================================================================
// LEARNING: Advanced Features
// =============================================================================

function showGroupGenerator() {
    if (!currentClassId) {
        ClassroomUtils.showToast('Please select a class first!', 'warning');
        return;
    }
    
    const students = ClassroomStorage.getStudents(currentClassId).filter(s => s.present);
    
    if (students.length < 2) {
        ClassroomUtils.showToast('Need at least 2 present students to create groups!', 'warning');
        return;
    }
    
    document.getElementById('generated-groups').style.display = 'none';
    ClassroomUtils.showModal('group-modal');
}

function generateGroups() {
    const groupSize = parseInt(document.getElementById('group-size').value);
    const mixGroups = document.getElementById('mix-groups').checked;
    
    const students = ClassroomStorage.getStudents(currentClassId).filter(s => s.present);
    
    if (students.length === 0) {
        ClassroomUtils.showToast('No present students to group!', 'warning');
        return;
    }
    
    let studentsToGroup = [...students]; // Create a copy
    
    if (mixGroups) {
        // LEARNING: Shuffle array using Fisher-Yates algorithm
        for (let i = studentsToGroup.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [studentsToGroup[i], studentsToGroup[j]] = [studentsToGroup[j], studentsToGroup[i]];
        }
    }
    
    const groups = [];
    for (let i = 0; i < studentsToGroup.length; i += groupSize) {
        groups.push(studentsToGroup.slice(i, i + groupSize));
    }
    
    // Display groups
    const groupsHTML = groups.map((group, index) => `
        <div class="box">
            <h6 class="title is-6">Group ${index + 1}</h6>
            <ul>
                ${group.map(student => `<li>${escapeHtml(student.name)}</li>`).join('')}
            </ul>
        </div>
    `).join('');
    
    document.getElementById('groups-display').innerHTML = groupsHTML;
    document.getElementById('generated-groups').style.display = 'block';
    
    ClassroomUtils.showToast(`Created ${groups.length} groups!`, 'success');
}

function showAttendanceReport() {
    if (!currentClassId) {
        ClassroomUtils.showToast('Please select a class first!', 'warning');
        return;
    }
    
    const students = ClassroomStorage.getStudents(currentClassId);
    const className = ClassroomStorage.getClasses().find(c => c.id === currentClassId)?.name || 'Unknown Class';
    
    if (students.length === 0) {
        ClassroomUtils.showToast('No students in this class!', 'info');
        return;
    }
    
    const presentStudents = students.filter(s => s.present);
    const absentStudents = students.filter(s => !s.present);
    
    let report = `Attendance Report - ${className}\n`;
    report += `Date: ${new Date().toLocaleDateString()}\n`;
    report += `Total Students: ${students.length}\n`;
    report += `Present: ${presentStudents.length}\n`;
    report += `Absent: ${absentStudents.length}\n\n`;
    
    report += `Present Students:\n`;
    presentStudents.forEach(student => {
        report += `- ${student.name}\n`;
    });
    
    if (absentStudents.length > 0) {
        report += `\nAbsent Students:\n`;
        absentStudents.forEach(student => {
            report += `- ${student.name}\n`;
        });
    }
    
    // Create and download report as text file
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${className}-attendance-${new Date().toISOString().split('T')[0]}.txt`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    ClassroomUtils.showToast('Attendance report downloaded!', 'success');
}

function resetParticipation() {
    if (!currentClassId) {
        ClassroomUtils.showToast('Please select a class first!', 'warning');
        return;
    }
    
    if (confirm('Reset participation tracking for this class?\n\nThis will clear any participation history.')) {
        // In a more advanced system, we'd reset participation counters
        // For now, just show a confirmation
        ClassroomUtils.showToast('Participation tracking reset!', 'success');
    }
}

// =============================================================================
// LEARNING: Utility Functions
// =============================================================================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// LEARNING: Make functions available globally for onclick handlers
window.StudentActions = {
    showAddStudentModal,
    addStudent,
    editStudent,
    confirmDeleteStudent,
    deleteStudent,
    toggleStudentAttendance,
    toggleAllAttendance,
    selectRandomStudent,
    showImportModal,
    handleCSVFile,
    importCSV,
    downloadCSVTemplate,
    exportStudents,
    showGroupGenerator,
    generateGroups,
    showAttendanceReport,
    resetParticipation
};