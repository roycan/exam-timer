// LEARNING: This file handles navigation across all pages in our classroom tools app
// It makes the navbar interactive and shows which page is currently active

document.addEventListener('DOMContentLoaded', function() {
    // LEARNING: DOMContentLoaded event fires when HTML is loaded, but before all images/stylesheets
    initializeNavigation();
});

function initializeNavigation() {
    // Get the current page name from the URL
    const currentPage = getCurrentPageName();
    
    // Highlight the active page in the navbar
    highlightActivePage(currentPage);
    
    // Set up mobile menu toggle functionality
    setupMobileMenu();
    
    // Add click tracking for navigation items
    trackNavigationClicks();
}

// LEARNING: This function extracts the current page name from the browser's URL
function getCurrentPageName() {
    // Get the current page filename (e.g., "timer.html" from full URL)
    const path = window.location.pathname;
    const filename = path.substring(path.lastIndexOf('/') + 1);
    
    // Remove the .html extension to get just the page name
    // If no filename (root), return 'index'
    if (!filename || filename === 'index.html') {
        return 'index';
    }
    
    return filename.replace('.html', '');
}

// LEARNING: This function adds visual highlighting to show which page is currently active
function highlightActivePage(currentPage) {
    // Remove any existing active highlights
    const navItems = document.querySelectorAll('.navbar-item');
    navItems.forEach(item => {
        item.classList.remove('is-active', 'has-background-primary-light');
    });
    
    // Add active class to current page
    const activeItem = document.querySelector(`[data-page="${currentPage}"]`);
    if (activeItem) {
        activeItem.classList.add('is-active', 'has-background-primary-light');
    } else if (currentPage === 'index') {
        // Highlight the home/brand item for the index page
        const brandItem = document.querySelector('.navbar-brand .navbar-item');
        if (brandItem) {
            brandItem.classList.add('has-background-primary-light');
        }
    }
}

// LEARNING: Bulma's mobile menu needs JavaScript to work properly
function setupMobileMenu() {
    const burger = document.getElementById('navbar-burger');
    const menu = document.getElementById('navbar-menu');
    
    if (!burger || !menu) return;
    
    // LEARNING: addEventListener is better than onclick because you can add multiple listeners
    burger.addEventListener('click', function() {
        // Toggle the mobile menu visibility
        burger.classList.toggle('is-active');
        menu.classList.toggle('is-active');
    });
    
    // Close mobile menu when clicking on a navigation item
    const menuItems = menu.querySelectorAll('.navbar-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            burger.classList.remove('is-active');
            menu.classList.remove('is-active');
        });
    });
}

// LEARNING: This function helps us understand how users navigate our app
function trackNavigationClicks() {
    const navItems = document.querySelectorAll('.navbar-item[data-page]');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(event) {
            const pageName = this.getAttribute('data-page');
            
            // Store navigation history in localStorage for analytics
            const navigationHistory = getNavigationHistory();
            navigationHistory.push({
                from: getCurrentPageName(),
                to: pageName,
                timestamp: new Date().toISOString()
            });
            
            // Keep only the last 50 navigation events
            if (navigationHistory.length > 50) {
                navigationHistory.splice(0, navigationHistory.length - 50);
            }
            
            localStorage.setItem('classroom_navigation_history', JSON.stringify(navigationHistory));
            
            // LEARNING: We don't prevent default here because we want normal navigation to happen
            console.log(`Navigating from ${getCurrentPageName()} to ${pageName}`);
        });
    });
}

// LEARNING: Helper function to get navigation history from localStorage
function getNavigationHistory() {
    try {
        const stored = localStorage.getItem('classroom_navigation_history');
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.warn('Error loading navigation history:', error);
        return [];
    }
}

// LEARNING: Export functions for use in other files (if needed)
// In a module system, we would use 'export', but for simple HTML we use global functions
window.ClassroomNav = {
    getCurrentPageName,
    highlightActivePage,
    getNavigationHistory
};