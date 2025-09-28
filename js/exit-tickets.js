// LEARNING: This file handles exit ticket functionality
// Exit tickets are quick reflection questions for students at the end of class

document.addEventListener('DOMContentLoaded', function() {
    initializeExitTickets();
});

// Global variables for exit ticket management
let currentPrompt = null;
let currentCategory = 'all';

function initializeExitTickets() {
    // Load all prompts
    loadPromptsGrid();
    
    // Set up modal handlers
    setupModalHandlers();
    
    // Set up keyboard shortcuts
    setupKeyboardShortcuts();
}

// =============================================================================
// LEARNING: Prompt Display and Management
// =============================================================================

function loadPromptsGrid() {
    // LEARNING: Get prompts from storage and filter by category
    const allPrompts = ClassroomStorage.getExitPrompts();
    const filteredPrompts = currentCategory === 'all' ? 
        allPrompts : 
        allPrompts.filter(prompt => prompt.category === currentCategory);
    
    const promptsGrid = document.getElementById('prompts-grid');
    
    if (filteredPrompts.length === 0) {
        promptsGrid.innerHTML = `
            <div class="column is-12">
                <div class="notification is-info is-light">
                    <p><strong>No prompts found in this category.</strong></p>
                    <p>Try creating a custom prompt or selecting a different category.</p>
                </div>
            </div>
        `;
        return;
    }
    
    // LEARNING: Generate HTML for each prompt using map() and join()
    const promptsHTML = filteredPrompts.map(prompt => {
        const categoryColor = getCategoryColor(prompt.category);
        const lastUsed = prompt.usedAt ? 
            `Used: ${ClassroomUtils.getTimeAgo(prompt.usedAt)}` : 
            'Never used';
        
        return `
            <div class="column is-6">
                <div class="card">
                    <div class="card-content">
                        <div class="media">
                            <div class="media-left">
                                <span class="tag ${categoryColor}">${capitalizeFirst(prompt.category)}</span>
                            </div>
                            <div class="media-right">
                                ${prompt.isCustom ? '<i class="fas fa-user-edit has-text-info" title="Custom Prompt"></i>' : '<i class="fas fa-star has-text-warning" title="Built-in Prompt"></i>'}
                            </div>
                        </div>
                        <div class="content">
                            <p>${escapeHtml(prompt.prompt)}</p>
                            <small class="has-text-grey">${lastUsed}</small>
                        </div>
                    </div>
                    <footer class="card-footer">
                        <button class="card-footer-item button is-white" onclick="selectPrompt('${prompt.id}')">
                            <i class="fas fa-eye mr-2"></i>
                            Use This Prompt
                        </button>
                        ${prompt.isCustom ? 
                            `<button class="card-footer-item button is-white has-text-danger" onclick="deletePrompt('${prompt.id}')" title="Delete Custom Prompt">
                                <i class="fas fa-trash"></i>
                            </button>` : 
                            ''
                        }
                    </footer>
                </div>
            </div>
        `;
    }).join('');
    
    promptsGrid.innerHTML = promptsHTML;
}

function selectPrompt(promptId) {
    // LEARNING: Find the prompt by ID and display it
    const prompts = ClassroomStorage.getExitPrompts();
    const prompt = prompts.find(p => p.id === promptId);
    
    if (!prompt) {
        ClassroomUtils.showToast('Prompt not found!', 'danger');
        return;
    }
    
    currentPrompt = prompt;
    displaySelectedPrompt();
    
    // Update usage tracking
    ClassroomStorage.updateExitPromptUsage(promptId);
    
    // Refresh the grid to show updated usage time
    loadPromptsGrid();
}

function displaySelectedPrompt() {
    if (!currentPrompt) return;
    
    const display = document.getElementById('exit-ticket-display');
    const categoryColor = getCategoryColor(currentPrompt.category);
    
    display.innerHTML = `
        <div class="has-text-centered">
            <div class="mb-4">
                <span class="tag ${categoryColor} is-large">${capitalizeFirst(currentPrompt.category)}</span>
            </div>
            <h2 class="title is-3 mb-4">${escapeHtml(currentPrompt.prompt)}</h2>
            <p class="subtitle is-6 has-text-grey mb-4">
                ${currentPrompt.isCustom ? 'Custom prompt' : 'Built-in prompt'} • 
                Last used: ${currentPrompt.usedAt ? ClassroomUtils.getTimeAgo(currentPrompt.usedAt) : 'Never'}
            </p>
            <div class="buttons is-centered">
                <button class="button is-primary" onclick="getRandomPrompt()">
                    <i class="fas fa-shuffle mr-2"></i>
                    Get Another Prompt
                </button>
                <button class="button is-info" onclick="showFullScreen()">
                    <i class="fas fa-expand-alt mr-2"></i>
                    Full Screen
                </button>
                <button class="button is-warning" onclick="printTicket()">
                    <i class="fas fa-print mr-2"></i>
                    Print
                </button>
            </div>
        </div>
    `;
    
    // Show additional buttons in header
    document.getElementById('fullscreen-btn').style.display = 'inline-block';
    document.getElementById('print-btn').style.display = 'inline-block';
}

function getRandomPrompt() {
    // LEARNING: Get a random prompt from all available prompts
    const prompts = ClassroomStorage.getExitPrompts();
    
    if (prompts.length === 0) {
        ClassroomUtils.showToast('No prompts available! Create some first.', 'warning');
        return;
    }
    
    // LEARNING: Use Math.random() to select a random prompt
    const randomIndex = Math.floor(Math.random() * prompts.length);
    const randomPrompt = prompts[randomIndex];
    
    selectPrompt(randomPrompt.id);
    
    ClassroomUtils.showToast('Random prompt selected!', 'success');
}

// =============================================================================
// LEARNING: Category Filtering
// =============================================================================

function filterByCategory(category) {
    currentCategory = category;
    
    // Update button states
    const buttons = {
        'all': document.getElementById('filter-all'),
        'reflection': document.getElementById('filter-reflection'),
        'comprehension': document.getElementById('filter-comprehension'),
        'application': document.getElementById('filter-application'),
        'feedback': document.getElementById('filter-feedback')
    };
    
    // Reset all buttons to default state
    Object.values(buttons).forEach(btn => {
        if (btn) btn.className = 'button';
    });
    
    // Highlight active button
    if (buttons[category]) {
        buttons[category].className = 'button is-primary';
    }
    
    // Reload the grid with filtered prompts
    loadPromptsGrid();
    
    const categoryText = category === 'all' ? 'All Categories' : capitalizeFirst(category);
    ClassroomUtils.showToast(`Showing ${categoryText} prompts`, 'info');
}

// =============================================================================
// LEARNING: Full Screen Mode
// =============================================================================

function showFullScreen() {
    if (!currentPrompt) {
        ClassroomUtils.showToast('Please select a prompt first!', 'warning');
        return;
    }
    
    // Set content for full screen display
    document.getElementById('fullscreen-prompt-text').textContent = currentPrompt.prompt;
    document.getElementById('fullscreen-category').textContent = `Category: ${capitalizeFirst(currentPrompt.category)}`;
    
    // Show full screen overlay
    const overlay = document.getElementById('exit-ticket-fullscreen');
    overlay.style.display = 'flex';
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
}

function exitFullScreen() {
    // Hide full screen overlay
    document.getElementById('exit-ticket-fullscreen').style.display = 'none';
    
    // Restore body scrolling
    document.body.style.overflow = 'auto';
}

// =============================================================================
// LEARNING: Custom Prompt Creation
// =============================================================================

function showCreatePromptModal() {
    // Clear form
    document.getElementById('create-prompt-form').reset();
    
    ClassroomUtils.showModal('create-prompt-modal');
    document.getElementById('prompt-text').focus();
}

function createCustomPrompt() {
    const promptText = document.getElementById('prompt-text').value.trim();
    const category = document.getElementById('prompt-category').value;
    
    // Validate input
    if (!promptText) {
        ClassroomUtils.showToast('Please enter a prompt question!', 'danger');
        return;
    }
    
    if (!category) {
        ClassroomUtils.showToast('Please select a category!', 'danger');
        return;
    }
    
    try {
        const newPrompt = ClassroomStorage.createExitPrompt({
            prompt: promptText,
            category: category,
            isCustom: true
        });
        
        ClassroomUtils.showToast('Custom prompt created successfully!', 'success');
        ClassroomUtils.hideModal('create-prompt-modal');
        
        // Refresh the grid and select the new prompt
        loadPromptsGrid();
        selectPrompt(newPrompt.id);
        
    } catch (error) {
        ClassroomUtils.showToast('Error creating prompt: ' + error.message, 'danger');
    }
}

function deletePrompt(promptId) {
    const prompts = ClassroomStorage.getExitPrompts();
    const prompt = prompts.find(p => p.id === promptId);
    
    if (!prompt) {
        ClassroomUtils.showToast('Prompt not found!', 'danger');
        return;
    }
    
    if (!prompt.isCustom) {
        ClassroomUtils.showToast('Cannot delete built-in prompts!', 'warning');
        return;
    }
    
    if (confirm(`Delete the custom prompt:\n"${prompt.prompt}"\n\nThis action cannot be undone.`)) {
        try {
            ClassroomStorage.deleteExitPrompt(promptId);
            ClassroomUtils.showToast('Custom prompt deleted!', 'success');
            
            // Clear current prompt if it was deleted
            if (currentPrompt && currentPrompt.id === promptId) {
                currentPrompt = null;
                document.getElementById('exit-ticket-display').innerHTML = `
                    <div class="has-text-centered py-6">
                        <i class="fas fa-clipboard fa-3x has-text-grey-light mb-4"></i>
                        <h3 class="title is-4 has-text-grey">No Exit Ticket Selected</h3>
                        <p class="has-text-grey mb-4">Choose a prompt category or create your own to get started</p>
                    </div>
                `;
                document.getElementById('fullscreen-btn').style.display = 'none';
                document.getElementById('print-btn').style.display = 'none';
            }
            
            loadPromptsGrid();
            
        } catch (error) {
            ClassroomUtils.showToast('Error deleting prompt: ' + error.message, 'danger');
        }
    }
}

// =============================================================================
// LEARNING: Usage Statistics
// =============================================================================

function showUsageStats() {
    const prompts = ClassroomStorage.getExitPrompts();
    const usedPrompts = prompts.filter(p => p.usedAt);
    
    // Calculate statistics
    const totalPrompts = prompts.length;
    const customPrompts = prompts.filter(p => p.isCustom).length;
    const usedCount = usedPrompts.length;
    const neverUsedCount = totalPrompts - usedCount;
    
    // Category breakdown
    const categoryStats = {};
    prompts.forEach(prompt => {
        categoryStats[prompt.category] = (categoryStats[prompt.category] || 0) + 1;
    });
    
    // Most recently used prompts
    const recentlyUsed = usedPrompts
        .sort((a, b) => new Date(b.usedAt) - new Date(a.usedAt))
        .slice(0, 5);
    
    const statsHTML = `
        <div class="columns is-multiline">
            <div class="column is-6">
                <div class="box has-text-centered">
                    <p class="heading">Total Prompts</p>
                    <p class="title is-3">${totalPrompts}</p>
                </div>
            </div>
            <div class="column is-6">
                <div class="box has-text-centered">
                    <p class="heading">Custom Prompts</p>
                    <p class="title is-3">${customPrompts}</p>
                </div>
            </div>
            <div class="column is-6">
                <div class="box has-text-centered">
                    <p class="heading">Used</p>
                    <p class="title is-3 has-text-success">${usedCount}</p>
                </div>
            </div>
            <div class="column is-6">
                <div class="box has-text-centered">
                    <p class="heading">Never Used</p>
                    <p class="title is-3 has-text-warning">${neverUsedCount}</p>
                </div>
            </div>
        </div>
        
        <h5 class="title is-5">Category Breakdown</h5>
        <div class="columns is-multiline">
            ${Object.entries(categoryStats).map(([category, count]) => `
                <div class="column is-3">
                    <div class="box has-text-centered">
                        <p class="heading">${capitalizeFirst(category)}</p>
                        <p class="title is-4">${count}</p>
                    </div>
                </div>
            `).join('')}
        </div>
        
        ${recentlyUsed.length > 0 ? `
            <h5 class="title is-5">Recently Used</h5>
            <div class="content">
                ${recentlyUsed.map(prompt => `
                    <div class="box">
                        <span class="tag ${getCategoryColor(prompt.category)}">${capitalizeFirst(prompt.category)}</span>
                        <p class="mt-2">${escapeHtml(prompt.prompt)}</p>
                        <p class="help">Used ${ClassroomUtils.getTimeAgo(prompt.usedAt)}</p>
                    </div>
                `).join('')}
            </div>
        ` : ''}
    `;
    
    document.getElementById('usage-stats-content').innerHTML = statsHTML;
    ClassroomUtils.showModal('stats-modal');
}

function exportUsageData() {
    const prompts = ClassroomStorage.getExitPrompts();
    
    // Create CSV data
    let csvContent = 'prompt,category,isCustom,usedAt\n';
    csvContent += prompts.map(prompt => 
        `"${prompt.prompt.replace(/"/g, '""')}","${prompt.category}","${prompt.isCustom ? 'Yes' : 'No'}","${prompt.usedAt || 'Never'}"`
    ).join('\n');
    
    const fileName = `exit-tickets-data-${new Date().toISOString().split('T')[0]}.csv`;
    ClassroomUtils.downloadCSV(csvContent, fileName);
    
    ClassroomUtils.showToast('Usage data exported!', 'success');
}

// =============================================================================
// LEARNING: Print Functionality
// =============================================================================

function printTicket() {
    if (!currentPrompt) {
        ClassroomUtils.showToast('Please select a prompt first!', 'warning');
        return;
    }
    
    // LEARNING: Create a print-friendly version
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Exit Ticket - ${currentPrompt.category}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .header {
                    text-align: center;
                    border-bottom: 2px solid #333;
                    padding-bottom: 10px;
                    margin-bottom: 20px;
                }
                .prompt {
                    font-size: 18px;
                    font-weight: bold;
                    margin: 20px 0;
                    padding: 15px;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                }
                .response-area {
                    margin: 20px 0;
                    height: 200px;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                }
                .footer {
                    margin-top: 40px;
                    font-size: 12px;
                    color: #666;
                    text-align: center;
                }
                @media print {
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Exit Ticket</h1>
                <p>Category: ${capitalizeFirst(currentPrompt.category)} | Date: ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div class="prompt">
                ${escapeHtml(currentPrompt.prompt)}
            </div>
            
            <div>
                <h3>Your Response:</h3>
                <div class="response-area"></div>
            </div>
            
            <div>
                <p><strong>Name:</strong> ___________________________ <strong>Class:</strong> _______________</p>
            </div>
            
            <div class="footer">
                <p>Generated by Classroom Management Tools</p>
            </div>
            
            <script>
                window.onload = function() {
                    window.print();
                    window.onafterprint = function() {
                        window.close();
                    };
                };
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// =============================================================================
// LEARNING: Keyboard Shortcuts
// =============================================================================

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(event) {
        // Escape key - exit full screen mode
        if (event.key === 'Escape' && document.getElementById('exit-ticket-fullscreen').style.display === 'flex') {
            exitFullScreen();
            event.preventDefault();
        }
        
        // R key - random prompt (when not in input fields)
        if (event.key === 'r' && event.target.tagName !== 'INPUT' && event.target.tagName !== 'TEXTAREA') {
            getRandomPrompt();
            event.preventDefault();
        }
        
        // F key - full screen (when not in input fields and prompt is selected)
        if (event.key === 'f' && event.target.tagName !== 'INPUT' && event.target.tagName !== 'TEXTAREA' && currentPrompt) {
            showFullScreen();
            event.preventDefault();
        }
    });
}

// =============================================================================
// LEARNING: Modal Setup
// =============================================================================

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
    
    // Form submission for create prompt
    document.getElementById('create-prompt-form').addEventListener('submit', function(event) {
        event.preventDefault();
        createCustomPrompt();
    });
}

// =============================================================================
// LEARNING: Utility Functions
// =============================================================================

function getCategoryColor(category) {
    // LEARNING: Map categories to Bulma color classes
    const colorMap = {
        'reflection': 'is-info',
        'comprehension': 'is-success', 
        'application': 'is-warning',
        'feedback': 'is-primary'
    };
    
    return colorMap[category] || 'is-light';
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// LEARNING: Make functions available globally for onclick handlers
window.ExitTicketActions = {
    filterByCategory,
    selectPrompt,
    getRandomPrompt,
    showFullScreen,
    exitFullScreen,
    showCreatePromptModal,
    createCustomPrompt,
    deletePrompt,
    showUsageStats,
    exportUsageData,
    printTicket
};