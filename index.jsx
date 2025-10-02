import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate, useParams } from 'react-router-dom'; // ✅ Added useParams + Navigate

// Auth Context
const AuthContext = createContext();
const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

  const login = (email, password) => {
    const fakeUser = { id: 1, email, role: 'student' };
    setUser(fakeUser);
    localStorage.setItem('user', JSON.stringify(fakeUser));
    return true;
  };

  const register = (email, password) => {
    const fakeUser = { id: 2, email, role: 'student' };
    setUser(fakeUser);
    localStorage.setItem('user', JSON.stringify(fakeUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Fixed ProtectedRoute
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;

  return children;
};

// Mock Data
const mockCourses = [
  { id: 1, title: "Intro to Cybersecurity", level: "Beginner", progress: 20, price: 0 },
  { id: 2, title: "Ethical Hacking Basics", level: "Intermediate", progress: 0, price: 50 },
];

const mockLessons = {
  1: [
    { id: 1, title: "What is Cybersecurity?", content: "Cybersecurity basics..." },
    { id: 2, title: "Types of Threats", content: "Malware, phishing..." },
  ],
  2: [
    { id: 1, title: "Reconnaissance", content: "Gathering information..." },
    { id: 2, title: "Scanning", content: "Finding vulnerabilities..." },
  ],
};

// Components
const Navbar = () => {
  const { user, logout } = useAuth();
  return (
    <nav className="p-4 bg-gray-800 text-white flex justify-between">
      <Link to="/">CyberLearn</Link>
      <div>
        {user ? (
          <>
            <Link to="/dashboard" className="mr-4">Dashboard</Link>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="mr-4">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

const HomePage = () => (
  <div className="p-6">
    <h1 className="text-2xl">Welcome to CyberLearn</h1>
    <p>Learn cybersecurity from beginner to master level.</p>
    <Link to="/courses" className="text-blue-500">Browse Courses</Link>
  </div>
);

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (login(email, password)) navigate('/dashboard');
  };

  return (
    <form onSubmit={handleLogin} className="p-6 max-w-md mx-auto">
      <h2 className="text-xl mb-4">Login</h2>
      <input type="email" placeholder="Email" value={email}
             onChange={(e) => setEmail(e.target.value)} className="block mb-2 p-2 border w-full"/>
      <input type="password" placeholder="Password" value={password}
             onChange={(e) => setPassword(e.target.value)} className="block mb-2 p-2 border w-full"/>
      <button type="submit" className="bg-blue-500 text-white px-4 py-2">Login</button>
    </form>
  );
};

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    if (register(email, password)) navigate('/dashboard');
  };

  return (
    <form onSubmit={handleRegister} className="p-6 max-w-md mx-auto">
      <h2 className="text-xl mb-4">Register</h2>
      <input type="email" placeholder="Email" value={email}
             onChange={(e) => setEmail(e.target.value)} className="block mb-2 p-2 border w-full"/>
      <input type="password" placeholder="Password" value={password}
             onChange={(e) => setPassword(e.target.value)} className="block mb-2 p-2 border w-full"/>
      <button type="submit" className="bg-green-500 text-white px-4 py-2">Register</button>
    </form>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  return (
    <div className="p-6">
      <h2 className="text-xl">Dashboard</h2>
      <p>Welcome, {user.email}</p>
      <Link to="/courses" className="text-blue-500">My Courses</Link>
    </div>
  );
};

const CoursesPage = () => (
  <div className="p-6">
    <h2 className="text-xl mb-4">Courses</h2>
    <div className="grid gap-4">
      {mockCourses.map((course) => (
        <div key={course.id} className="border p-4">
          <h3 className="font-bold">{course.title}</h3>
          <p>Level: {course.level}</p>
          <p>Price: {course.price ? `$${course.price}` : "Free"}</p>
          <Link to={`/courses/${course.id}`} className="text-blue-500">View</Link>
        </div>
      ))}
    </div>
  </div>
);

const CourseDetailPage = () => {
  const { courseId } = useParams(); // ✅ fixed useParams
  const course = mockCourses.find((c) => c.id === parseInt(courseId));

  if (!course) return <p>Course not found</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl">{course.title}</h2>
      <p>Level: {course.level}</p>
      <button className="bg-green-500 text-white px-4 py-2">Enroll</button>
    </div>
  );
};

// App
const App = () => (
  <AuthProvider>
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['student', 'instructor', 'admin']}>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/courses" element={
          <ProtectedRoute allowedRoles={['student', 'instructor', 'admin']}>
            <CoursesPage />
          </ProtectedRoute>
        } />
        <Route path="/courses/:courseId" element={
          <ProtectedRoute allowedRoles={['student', 'instructor', 'admin']}>
            <CourseDetailPage />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  </AuthProvider>
);

export default App;