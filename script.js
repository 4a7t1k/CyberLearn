// Mock data
const mockCourses = [
    {
        id: 1,
        title: "Introduction to Cybersecurity",
        description: "Learn the fundamentals of cybersecurity, threats, and defense strategies.",
        level: "Beginner",
        price: 49.99,
        cryptoPrice: { BTC: 0.0012, ETH: 0.025, USDT: 49.99 },
        instructor: "Dr. Sarah Chen",
        progress: 75,
        enrolled: true,
        modules: [
            { id: 1, title: "Cybersecurity Basics", completed: true, lessons: 5 },
            { id: 2, title: "Threat Landscape", completed: true, lessons: 4 },
            { id: 3, title: "Defense Strategies", completed: false, lessons: 6 }
        ]
    },
    {
        id: 2,
        title: "Ethical Hacking Fundamentals",
        description: "Master penetration testing and ethical hacking techniques.",
        level: "Intermediate",
        price: 99.99,
        cryptoPrice: { BTC: 0.0024, ETH: 0.05, USDT: 99.99 },
        instructor: "Alex Rodriguez",
        progress: 0,
        enrolled: false,
        modules: [
            { id: 1, title: "Reconnaissance", completed: false, lessons: 3 },
            { id: 2, title: "Scanning & Enumeration", completed: false, lessons: 4 },
            { id: 3, title: "Exploitation", completed: false, lessons: 5 }
        ]
    },
    {
        id: 3,
        title: "Advanced Network Security",
        description: "Deep dive into network security protocols and advanced defense mechanisms.",
        level: "Advanced",
        price: 149.99,
        cryptoPrice: { BTC: 0.0036, ETH: 0.075, USDT: 149.99 },
        instructor: "Prof. Michael Wong",
        progress: 0,
        enrolled: false,
        modules: [
            { id: 1, title: "Firewall Configuration", completed: false, lessons: 4 },
            { id: 2, title: "Intrusion Detection", completed: false, lessons: 5 },
            { id: 3, title: "Secure Network Design", completed: false, lessons: 6 }
        ]
    }
];

// State management
let currentUser = null;

// Initialize the app
function init() {
    const savedUser = localStorage.getItem('cyberlearn_user');
    if (savedUser) currentUser = JSON.parse(savedUser);

    updateUserUI();
    setupPageFunctionality();
}

// Update UI based on current user
function updateUserUI() {
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');
    const dashboardLink = document.getElementById('dashboard-link');
    const adminLink = document.getElementById('admin-link');
    const adminMenuItem = document.getElementById('admin-menu-item');

    if (!authButtons || !userMenu) return;

    if (currentUser) {
        authButtons.style.display = 'none';
        userMenu.style.display = 'flex';
        userAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
        if (userName) userName.textContent = currentUser.name;

        dashboardLink.style.display = 'block';

        if (currentUser.role === 'admin') {
            adminLink.style.display = 'block';
            if (adminMenuItem) adminMenuItem.style.display = 'block';
        } else {
            adminLink.style.display = 'none';
            if (adminMenuItem) adminMenuItem.style.display = 'none';
        }
    } else {
        authButtons.style.display = 'flex';
        userMenu.style.display = 'none';
        dashboardLink.style.display = 'none';
        adminLink.style.display = 'none';
        if (adminMenuItem) adminMenuItem.style.display = 'none';
    }
}

// Page-specific functionality
function setupPageFunctionality() {
    const currentPage = window.location.pathname.split('/').pop();

    switch (currentPage) {
        case 'courses.html':
            setupCoursesPage();
            break;
        case 'dashboard.html':
            if (!currentUser) {
                window.location.href = 'login.html';
                return;
            }
            setupDashboardPage();
            break;
        case 'ai-tutor.html':
            if (!currentUser) {
                window.location.href = 'login.html';
                return;
            }
            setupAITutorPage();
            break;
        case 'wallet.html':
            if (!currentUser) {
                window.location.href = 'login.html';
                return;
            }
            setupWalletPage();
            break;
        case 'admin.html':
            if (!currentUser || currentUser.role !== 'admin') {
                window.location.href = 'dashboard.html';
                return;
            }
            setupAdminPage();
            break;
        case 'login.html':
            setupLoginPage();
            break;
        case 'register.html':
            setupRegisterPage();
            break;
    }
}

// Navigation functions
function navigateTo(page) {
    window.location.href = page;
}

function logout() {
    currentUser = null;
    localStorage.removeItem('cyberlearn_user');
    updateUserUI();
    navigateTo('index.html');
}

// Page-specific setup functions
function setupCoursesPage() {
    populateCourses();

    const searchInput = document.getElementById('search-input');
    const levelFilter = document.getElementById('level-filter');
    const priceFilter = document.getElementById('price-filter');

    if (searchInput) searchInput.addEventListener('input', filterCourses);
    if (levelFilter) levelFilter.addEventListener('change', filterCourses);
    if (priceFilter) priceFilter.addEventListener('change', filterCourses);

    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('enroll-btn')) {
            const courseId = e.target.dataset.courseId;
            enrollInCourse(courseId);
        }
    });
}

function setupDashboardPage() {
    updateDashboard();
}

function setupAITutorPage() {
    const sendMessageBtn = document.getElementById('send-message');
    const messageInput = document.getElementById('message-input');

    if (sendMessageBtn) sendMessageBtn.addEventListener('click', sendMessage);

    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') sendMessage();
        });
    }
}

function setupWalletPage() {
    const toggleAddressBtn = document.getElementById('toggle-address');
    if (toggleAddressBtn) toggleAddressBtn.addEventListener('click', toggleWalletAddress);
}

function setupLoginPage() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        handleLogin(email, password);
    });
}

function setupRegisterPage() {
    const registerForm = document.getElementById('register-form');
    if (!registerForm) return;

    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm').value;
        handleRegister(name, email, password, confirmPassword);
    });
}

// Core functionality
function populateCourses() {
    const coursesGrid = document.getElementById('courses-grid');
    if (!coursesGrid) return;

    coursesGrid.innerHTML = '';
    const filteredCourses = filterCoursesData();

    filteredCourses.forEach(course => {
        const courseCard = document.createElement('div');
        courseCard.className = 'course-card';
        courseCard.innerHTML = `
            <div class="course-content">
                <div class="course-header">
                    <span class="course-level level-${course.level.toLowerCase()}">${course.level}</span>
                    <div class="course-price">
                        <div class="price">$${course.price.toFixed(2)}</div>
                        <div class="crypto">or ${course.cryptoPrice.BTC} BTC</div>
                    </div>
                </div>
                <h3>${course.title}</h3>
                <p>${course.description}</p>
                <div class="course-footer">
                    <div class="course-instructor">Instructor: ${course.instructor}</div>
                    <a href="javascript:void(0)" class="btn btn-primary enroll-btn" data-course-id="${course.id}">
                        ${course.enrolled ? 'Continue' : 'Enroll Now'}
                    </a>
                </div>
            </div>
        `;
        coursesGrid.appendChild(courseCard);
    });
}

// …continued for filterCoursesData, filterCourses, enrollInCourse, updateDashboard, toggleWalletAddress, sendMessage, handleLogin, handleRegister, showError, setupAdminPage

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Expose global functions for inline handlers
window.navigateTo = navigateTo;
window.logout = logout;