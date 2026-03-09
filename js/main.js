// main.js - ESM Version with iframe approach
const appState = {
    currentPage: 'dashboard',
    isMobileMenuOpen: false
};

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    setupMenuToggle();
    setupNavigation();
    window.addEventListener('resize', handleResize);
}

// Menu toggle functionality
function setupMenuToggle() {
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');

    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMobileMenu();
    });

    document.addEventListener('click', (e) => {
        if (appState.isMobileMenuOpen && 
            !sidebar.contains(e.target) && 
            e.target !== menuToggle) {
            closeMobileMenu();
        }
    });

    function toggleMobileMenu() {
        sidebar.classList.toggle('active');
        mainContent.classList.toggle('active');
        appState.isMobileMenuOpen = !appState.isMobileMenuOpen;
    }
}

// Navigation setup
function setupNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.currentTarget.getAttribute('data-page');
            if (page && page !== appState.currentPage) {
                loadPage(page);
            }
            if (window.innerWidth <= 768) {
                closeMobileMenu();
            }
        });
    });
}

// Page loader
function loadPage(page) {
    appState.currentPage = page;
    updateActiveMenuItem();
    document.title = `Sky Lounge Admin - ${formatPageTitle(page)}`;
    
    const frame = document.getElementById('content-frame');
    frame.src = `pages/${page}.html`;
}

// Helper functions
function updateActiveMenuItem() {
    document.querySelectorAll('.sidebar-menu li').forEach(item => {
        item.classList.remove('active');
        const link = item.querySelector('.nav-link');
        if (link?.dataset.page === appState.currentPage) {
            item.classList.add('active');
        }
    });
}

function formatPageTitle(page) {
    return page.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

function handleResize() {
    if (window.innerWidth > 768 && appState.isMobileMenuOpen) {
        closeMobileMenu();
    }
}

function closeMobileMenu() {
    document.getElementById('sidebar').classList.remove('active');
    document.getElementById('main-content').classList.remove('active');
    appState.isMobileMenuOpen = false;
}

// Make functions available globally
window.loadPage = loadPage;
window.closeMobileMenu = closeMobileMenu;