// ----------------------- Mock Data -----------------------
const mockCourses = [
    {
        id: 1,
        title: "Introduction to Cybersecurity",
        description: "Learn the fundamentals of cybersecurity, threats, and defense strategies.",
        level: "Beginner",
        price: 49.99,
        cryptoPrice: { BTC: 0.0012, ETH: 0.025, USDT: 49.99 },
        instructor: "Dr. Sarah Chen",
        modules: [
            { id: 1, title: "Cybersecurity Basics", lessons: 5 },
            { id: 2, title: "Threat Landscape", lessons: 4 },
            { id: 3, title: "Defense Strategies", lessons: 6 }
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
        modules: [
            { id: 1, title: "Reconnaissance", lessons: 3 },
            { id: 2, title: "Scanning & Enumeration", lessons: 4 },
            { id: 3, title: "Exploitation", lessons: 5 }
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
        modules: [
            { id: 1, title: "Firewall Configuration", lessons: 4 },
            { id: 2, title: "Intrusion Detection", lessons: 5 },
            { id: 3, title: "Secure Network Design", lessons: 6 }
        ]
    }
];

// ----------------------- State -----------------------
let currentUser = null;
let chatHistory = [];

// ----------------------- Initialization -----------------------
document.addEventListener('DOMContentLoaded', init);

function init() {
    const savedUser = localStorage.getItem('cyberlearn_user');
    if (savedUser) currentUser = JSON.parse(savedUser);

    updateUserUI();
    setupPageFunctionality();
}

// ----------------------- UI Update -----------------------
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

        if (dashboardLink) dashboardLink.style.display = 'block';

        if (currentUser.role === 'admin') {
            if (adminLink) adminLink.style.display = 'block';
            if (adminMenuItem) adminMenuItem.style.display = 'block';
        } else {
            if (adminLink) adminLink.style.display = 'none';
            if (adminMenuItem) adminMenuItem.style.display = 'none';
        }
    } else {
        authButtons.style.display = 'flex';
        userMenu.style.display = 'none';
        if (dashboardLink) dashboardLink.style.display = 'none';
        if (adminLink) adminLink.style.display = 'none';
        if (adminMenuItem) adminMenuItem.style.display = 'none';
    }
}

// ----------------------- Page Setup -----------------------
function setupPageFunctionality() {
    const currentPage = window.location.pathname.split('/').pop();

    switch (currentPage) {
        case 'courses.html': setupCoursesPage(); break;
        case 'dashboard.html':
            if (!currentUser) return navigateTo('login.html');
            setupDashboardPage();
            break;
        case 'ai-tutor.html':
            if (!currentUser) return navigateTo('login.html');
            setupAITutorPage();
            break;
        case 'wallet.html':
            if (!currentUser) return navigateTo('login.html');
            setupWalletPage();
            break;
        case 'admin.html':
            if (!currentUser || currentUser.role !== 'admin') return navigateTo('dashboard.html');
            setupAdminPage();
            break;
        case 'login.html': setupLoginPage(); break;
        case 'register.html': setupRegisterPage(); break;
    }
}

// ----------------------- Navigation -----------------------
function navigateTo(page) {
    window.location.href = page;
}

function logout() {
    currentUser = null;
    localStorage.removeItem('cyberlearn_user');
    updateUserUI();
    navigateTo('index.html');
}

// ----------------------- Login/Register -----------------------
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

function handleLogin(email, password) {
    let users = JSON.parse(localStorage.getItem('cyberlearn_user_list') || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        alert("Invalid email or password");
        return;
    }

    currentUser = user;
    localStorage.setItem('cyberlearn_user', JSON.stringify(currentUser));
    updateUserUI();
    navigateTo('dashboard.html');
}

function handleRegister(name, email, password, confirmPassword) {
    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }

    let users = JSON.parse(localStorage.getItem('cyberlearn_user_list') || '[]');
    if (users.find(u => u.email === email)) {
        alert("Email already registered");
        return;
    }

    const newUser = {
        name, email, password,
        role: 'user',
        enrolledCourses: []
    };
    users.push(newUser);
    localStorage.setItem('cyberlearn_user_list', JSON.stringify(users));
    alert("Registration successful! Please login.");
    navigateTo('login.html');
}

// ----------------------- Courses -----------------------
function setupCoursesPage() {
    populateCourses();
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('enroll-btn')) {
            enrollInCourse(parseInt(e.target.dataset.courseId));
        }
    });
}

function populateCourses() {
    const coursesGrid = document.getElementById('courses-grid');
    if (!coursesGrid) return;

    coursesGrid.innerHTML = '';
    mockCourses.forEach(course => {
        let userCourse = currentUser?.enrolledCourses?.find(c => c.courseId === course.id);
        const status = userCourse ? userCourse.status : null;

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
                        ${status === "enrolled" ? "Continue" : status === "pending_payment" ? "Pending Approval" : "Enroll Now"}
                    </a>
                </div>
            </div>
        `;
        coursesGrid.appendChild(courseCard);
    });
}

function enrollInCourse(courseId) {
    if (!currentUser) return navigateTo('login.html');

    if (!currentUser.enrolledCourses) currentUser.enrolledCourses = [];
    const existing = currentUser.enrolledCourses.find(c => c.courseId === courseId);
    if (existing) {
        alert(existing.status === "enrolled" ? "You are already enrolled" : "Payment pending admin approval");
        return;
    }

    const course = mockCourses.find(c => c.id === courseId);
    if (!course) return;

    const confirmPay = confirm(`The course "${course.title}" costs $${course.price}. Click OK to simulate payment.`);
    if (confirmPay) {
        currentUser.enrolledCourses.push({ courseId, status: "pending_payment" });
        localStorage.setItem('cyberlearn_user', JSON.stringify(currentUser));

        // Update global user list
        let users = JSON.parse(localStorage.getItem('cyberlearn_user_list') || '[]');
        const userIndex = users.findIndex(u => u.email === currentUser.email);
        if (userIndex > -1) users[userIndex] = currentUser;
        localStorage.setItem('cyberlearn_user_list', JSON.stringify(users));

        alert("Payment done. Waiting for admin approval.");
        populateCourses();
    }
}

// ----------------------- Dashboard -----------------------
function setupDashboardPage() {
    const continueDiv = document.getElementById('continue-learning');
    if (!continueDiv) return;

    continueDiv.innerHTML = '';
    currentUser.enrolledCourses?.forEach(uc => {
        const course = mockCourses.find(c => c.id === uc.courseId);
        const div = document.createElement('div');
        div.className = 'course-item';
        div.innerHTML = `
            <h4>${course.title}</h4>
            <p>Status: ${uc.status}</p>
            ${uc.status === "enrolled" ? `<button class="btn btn-primary" onclick="viewCourse(${course.id})">View Course</button>` : ""}
        `;
        continueDiv.appendChild(div);
    });
}

function viewCourse(courseId) {
    const userCourse = currentUser.enrolledCourses.find(c => c.courseId === courseId);
    if (!userCourse || userCourse.status !== "enrolled") {
        alert("Cannot access course yet. Payment approval pending.");
        return;
    }
    const course = mockCourses.find(c => c.id === courseId);
    alert(`Welcome to "${course.title}" course!`);
}

// ----------------------- Wallet -----------------------
function setupWalletPage() {
    const toggleBtn = document.getElementById('toggle-address');
    if (toggleBtn) toggleBtn.addEventListener('click', toggleWalletAddress);
}

function toggleWalletAddress() {
    const addrDiv = document.getElementById('wallet-address');
    if (!addrDiv) return;
    if (addrDiv.textContent.includes('•')) {
        addrDiv.textContent = "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"; // Example address
        this.textContent = "Hide Address";
    } else {
        addrDiv.textContent = "••••••••••••••••••••••••••••••••••••••••••••";
        this.textContent = "Show Address";
    }
}

// ----------------------- AI Tutor -----------------------
function setupAITutorPage() {
    const sendBtn = document.getElementById('send-message');
    const input = document.getElementById('message-input');
    const chat = document.getElementById('chat-messages');
    if (!sendBtn || !input || !chat) return;

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', e => { if (e.key === 'Enter') sendMessage(); });
}

function sendMessage() {
    const input = document.getElementById('message-input');
    const chat = document.getElementById('chat-messages');
    const userMsg = input.value.trim();
    if (!userMsg) return;

    chatHistory.push({ sender: 'user', text: userMsg });

    const userDiv = document.createElement('div');
    userDiv.className = 'message user';
    userDiv.textContent = userMsg;
    chat.appendChild(userDiv);

    input.value = '';
    chat.scrollTop = chat.scrollHeight;

    setTimeout(() => {
        const aiDiv = document.createElement('div');
        aiDiv.className = 'message ai';
        if (userMsg.toLowerCase().includes('enroll')) aiDiv.textContent = "To enroll, go to Courses page and click Enroll. Payment may be required.";
        else if (userMsg.toLowerCase().includes('payment')) aiDiv.textContent = "Payments are simulated. Admin approval is required for access.";
        else aiDiv.textContent = "I’m here to help! Ask me about courses, enrollment, or cybersecurity topics.";
        chat.appendChild(aiDiv);
        chatHistory.push({ sender: 'ai', text: aiDiv.textContent });
        chat.scrollTop = chat.scrollHeight;
    }, 500);
}

// ----------------------- Admin Panel -----------------------
function setupAdminPage() {
    const usersDiv = document.getElementById('admin-users');
    const pendingDiv = document.getElementById('admin-pending');

    if (!usersDiv || !pendingDiv) return;

    // Load all users
    let users = JSON.parse(localStorage.getItem('cyberlearn_user_list') || '[]');
    usersDiv.innerHTML = '';
    users.forEach(u => {
        const div = document.createElement('div');
        div.className = 'user-item';
        div.innerHTML = `
            <strong>${u.name}</strong> (${u.email}) - Role: ${u.role}<br>
            Enrolled Courses: ${u.enrolledCourses?.length || 0}
        `;
        usersDiv.appendChild(div);
    });

    // Load pending payments
    pendingDiv.innerHTML = '';
    users.forEach(u => {
        u.enrolledCourses?.forEach(c => {
            if (c.status === 'pending_payment') {
                const course = mockCourses.find(mc => mc.id === c.courseId);
                const div = document.createElement('div');
                div.className = 'pending-item';
                div.innerHTML = `
                    <strong>${u.name}</strong> - ${course.title} 
                    <button class="btn btn-success" onclick="approvePayment('${u.email}', ${c.courseId})">Approve</button>
                `;
                pendingDiv.appendChild(div);
            }
        });
    });
}

function approvePayment(userEmail, courseId) {
    let users = JSON.parse(localStorage.getItem('cyberlearn_user_list') || '[]');
    const userIndex = users.findIndex(u => u.email === userEmail);
    if (userIndex === -1) return;

    const courseIndex = users[userIndex].enrolledCourses.findIndex(c => c.courseId === courseId);
    if (courseIndex === -1) return;

    users[userIndex].enrolledCourses[courseIndex].status = 'enrolled';
    localStorage.setItem('cyberlearn_user_list', JSON.stringify(users));

    if (currentUser && currentUser.email === userEmail) currentUser = users[userIndex];
    localStorage.setItem('cyberlearn_user', JSON.stringify(currentUser));

    alert(`Payment approved for ${users[userIndex].name}`);
    setupAdminPage();
}

// ----------------------- Expose Functions Globally -----------------------
window.navigateTo = navigateTo;
window.logout = logout;
window.viewCourse = viewCourse;
window.approvePayment = approvePayment;