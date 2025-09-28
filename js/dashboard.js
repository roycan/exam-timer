// LEARNING: This file handles the main dashboard/homepage functionality
// It provides an overview and quick access to all classroom tools

document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

function initializeDashboard() {
    // LEARNING: Load and display app statistics
    displayAppStats();
    
    // Set up quick action buttons
    setupQuickActions();
    
    // Show welcome message for new users
    checkForFirstVisit();
}

function displayAppStats() {
    // Get data from localStorage to show overview
    const classes = ClassroomStorage.getClasses();
    const students = ClassroomStorage.getStudents();
    const exitPrompts = ClassroomStorage.getExitPrompts();
    const settings = ClassroomStorage.getSettings();
    
    // LEARNING: Create info cards dynamically if they exist in the HTML
    const statsContainer = document.getElementById('app-stats');
    if (statsContainer) {
        const stats = [
            { label: 'Classes', value: classes.length, icon: 'fas fa-school' },
            { label: 'Students', value: students.length, icon: 'fas fa-users' },
            { label: 'Exit Prompts', value: exitPrompts.length, icon: 'fas fa-clipboard-check' },
            { label: 'Days Used', value: getDaysUsed(), icon: 'fas fa-calendar-alt' }
        ];
        
        statsContainer.innerHTML = stats.map(stat => `
            <div class="column is-3">
                <div class="box has-text-centered">
                    <i class="${stat.icon} fa-2x has-text-primary mb-2"></i>
                    <p class="title is-3">${stat.value}</p>
                    <p class="subtitle is-6">${stat.label}</p>
                </div>
            </div>
        `).join('');
    }
}

function setupQuickActions() {
    // LEARNING: Add event listeners to quick action buttons
    const quickActionButtons = document.querySelectorAll('.quick-action');
    
    quickActionButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            const action = this.getAttribute('data-action');
            handleQuickAction(action, event);
        });
    });
}

function handleQuickAction(action, event) {
    // LEARNING: Handle different quick actions from the dashboard
    switch (action) {
        case 'start-timer':
            // Could show a quick timer setup modal or navigate directly
            showQuickTimerSetup();
            break;
            
        case 'random-student':
            // Quick student selection without going to full page
            showQuickStudentSelector();
            break;
            
        case 'create-class':
            showQuickClassCreator();
            break;
            
        case 'export-data':
            ClassroomStorage.downloadAppData();
            ClassroomUtils.showToast('Data exported successfully!', 'success');
            break;
            
        default:
            console.log('Unknown quick action:', action);
    }
}

function showQuickTimerSetup() {
    // LEARNING: Create a modal for quick timer setup
    const modal = document.createElement('div');
    modal.className = 'modal is-active';
    modal.innerHTML = `
        <div class="modal-background"></div>
        <div class="modal-card">
            <header class="modal-card-head">
                <p class="modal-card-title">Quick Timer Setup</p>
                <button class="delete close-modal" aria-label="close"></button>
            </header>
            <section class="modal-card-body">
                <div class="field">
                    <label class="label">Timer Duration</label>
                    <div class="control">
                        <div class="buttons">
                            <button class="button" onclick="setQuickTimer(300)">5 min</button>
                            <button class="button" onclick="setQuickTimer(600)">10 min</button>
                            <button class="button" onclick="setQuickTimer(900)">15 min</button>
                            <button class="button" onclick="setQuickTimer(1500)">25 min</button>
                        </div>
                    </div>
                </div>
            </section>
            <footer class="modal-card-foot">
                <button class="button close-modal">Cancel</button>
                <a href="timer.html" class="button is-primary">Go to Timer</a>
            </footer>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Set up close functionality
    modal.querySelectorAll('.close-modal').forEach(btn => {
        btn.onclick = () => document.body.removeChild(modal);
    });
    
    modal.querySelector('.modal-background').onclick = () => {
        document.body.removeChild(modal);
    };
}

function setQuickTimer(seconds) {
    // Store timer setting and navigate
    localStorage.setItem('quick_timer_duration', seconds);
    window.location.href = 'timer.html';
}

function showQuickStudentSelector() {
    // LEARNING: Quick student selection modal
    const classes = ClassroomStorage.getClasses();
    
    if (classes.length === 0) {
        ClassroomUtils.showToast('Please create a class first!', 'warning');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal is-active';
    modal.innerHTML = `
        <div class="modal-background"></div>
        <div class="modal-card">
            <header class="modal-card-head">
                <p class="modal-card-title">Quick Student Selection</p>
                <button class="delete close-modal" aria-label="close"></button>
            </header>
            <section class="modal-card-body">
                <div class="field">
                    <label class="label">Select Class</label>
                    <div class="control">
                        <div class="select is-fullwidth">
                            <select id="quick-class-select">
                                <option value="">Choose a class...</option>
                                ${classes.map(cls => 
                                    `<option value="${cls.id}">${cls.name}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                </div>
                <div id="quick-student-result" class="has-text-centered mt-4" style="display: none;">
                    <div class="student-avatar mb-3">
                        <i class="fas fa-user"></i>
                    </div>
                    <p class="title is-4" id="selected-student-name"></p>
                    <button class="button is-primary" onclick="selectAnotherStudent()">
                        <i class="fas fa-shuffle mr-2"></i>
                        Select Another
                    </button>
                </div>
            </section>
            <footer class="modal-card-foot">
                <button class="button close-modal">Close</button>
                <button class="button is-primary" id="select-student-btn" disabled onclick="selectRandomStudent()">
                    <i class="fas fa-shuffle mr-2"></i>
                    Select Student
                </button>
            </footer>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Set up functionality
    const classSelect = modal.querySelector('#quick-class-select');
    const selectBtn = modal.querySelector('#select-student-btn');
    
    classSelect.addEventListener('change', function() {
        selectBtn.disabled = !this.value;
    });
    
    // Set up close functionality
    modal.querySelectorAll('.close-modal').forEach(btn => {
        btn.onclick = () => document.body.removeChild(modal);
    });
    
    modal.querySelector('.modal-background').onclick = () => {
        document.body.removeChild(modal);
    };
    
    // Make functions available to the modal
    window.selectRandomStudent = function() {
        const classId = classSelect.value;
        if (!classId) return;
        
        const students = ClassroomStorage.getStudents(classId).filter(s => s.present);
        if (students.length === 0) {
            ClassroomUtils.showToast('No present students in this class!', 'warning');
            return;
        }
        
        const randomStudent = students[Math.floor(Math.random() * students.length)];
        document.getElementById('selected-student-name').textContent = randomStudent.name;
        document.getElementById('quick-student-result').style.display = 'block';
    };
    
    window.selectAnotherStudent = function() {
        selectRandomStudent();
    };
}

function showQuickClassCreator() {
    // LEARNING: Quick class creation modal
    const modal = document.createElement('div');
    modal.className = 'modal is-active';
    modal.innerHTML = `
        <div class="modal-background"></div>
        <div class="modal-card">
            <header class="modal-card-head">
                <p class="modal-card-title">Create New Class</p>
                <button class="delete close-modal" aria-label="close"></button>
            </header>
            <section class="modal-card-body">
                <form id="quick-class-form">
                    <div class="field">
                        <label class="label">Class Name *</label>
                        <div class="control">
                            <input class="input" type="text" id="class-name" placeholder="e.g., Period 1 - Computer Science" required>
                        </div>
                    </div>
                    <div class="field">
                        <label class="label">Period/Block</label>
                        <div class="control">
                            <input class="input" type="text" id="class-period" placeholder="e.g., Period 1, Block A">
                        </div>
                    </div>
                </form>
            </section>
            <footer class="modal-card-foot">
                <button class="button close-modal">Cancel</button>
                <button class="button is-primary" onclick="createQuickClass()">Create Class</button>
            </footer>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Set up close functionality
    modal.querySelectorAll('.close-modal').forEach(btn => {
        btn.onclick = () => document.body.removeChild(modal);
    });
    
    modal.querySelector('.modal-background').onclick = () => {
        document.body.removeChild(modal);
    };
    
    // Focus on name input
    modal.querySelector('#class-name').focus();
    
    // Make function available to the modal
    window.createQuickClass = function() {
        const name = document.getElementById('class-name').value.trim();
        const period = document.getElementById('class-period').value.trim();
        
        if (!name) {
            ClassroomUtils.showToast('Class name is required!', 'danger');
            return;
        }
        
        try {
            ClassroomStorage.createClass({ name, period: period || null });
            ClassroomUtils.showToast('Class created successfully!', 'success');
            document.body.removeChild(modal);
            displayAppStats(); // Refresh stats
        } catch (error) {
            ClassroomUtils.showToast('Error creating class: ' + error.message, 'danger');
        }
    };
}

function checkForFirstVisit() {
    // LEARNING: Show welcome message for first-time users
    const hasVisited = localStorage.getItem('classroom_has_visited');
    
    if (!hasVisited) {
        setTimeout(() => {
            ClassroomUtils.showToast('Welcome to Classroom Management Tools! Click on any tool above to get started.', 'info', 5000);
            localStorage.setItem('classroom_has_visited', 'true');
        }, 1000);
    }
}

function getDaysUsed() {
    // LEARNING: Calculate how many days the app has been used
    const firstVisit = localStorage.getItem('classroom_first_visit');
    
    if (!firstVisit) {
        localStorage.setItem('classroom_first_visit', new Date().toISOString());
        return 1;
    }
    
    const firstVisitDate = new Date(firstVisit);
    const today = new Date();
    const diffTime = Math.abs(today - firstVisitDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
}

// LEARNING: Make dashboard functions available globally if needed
window.DashboardActions = {
    setQuickTimer,
    displayAppStats
};