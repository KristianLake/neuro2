import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import BetaRoute from './components/BetaRoute';
import { ErrorBoundary } from './components/error';
import Navbar from './components/Navbar';
import Course from './pages/Course';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Courses from './pages/Courses';
import Profile from './pages/Profile';
import Introduction from './pages/lessons/Introduction';
import Variables from './pages/lessons/Variables';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ResetPassword from './pages/auth/ResetPassword';
import Comments from './pages/learn/Comments';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Purchase from './pages/purchase/Purchase';
import AdminDashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import Purchases from './pages/admin/Purchases';
import Security from './pages/admin/Security';
import AccessManagement from './pages/admin/AccessManagement';
import AuditLogs from './pages/admin/AuditLogs';
import AdminRoute from './components/AdminRoute'; 
import MasterArchitecture from './pages/lessons/mock/MasterArchitecture';
import MiniCourses from './pages/lessons/mock/MiniCourses';

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <ErrorBoundary>
            <BetaRoute>
              <div className="min-h-screen flex flex-col transition-colors">
                <Navbar />
                <main className="flex-grow">
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/courses" element={<Courses />} />
                    <Route path="/courses/:courseId" element={<Course />} />
                    <Route path="/courses/:courseId/:moduleId" element={<Course />} />
                    <Route path="/auth/login" element={<Login />} />
                    <Route path="/auth/register" element={<Register />} />
                    <Route path="/auth/reset-password" element={<ResetPassword />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/purchase/:moduleId" element={<Purchase />} />
                    <Route path="/lessons/introduction" element={<Introduction />} />
                    <Route path="/lessons/variables" element={<Variables />} />
                    <Route path="/learn/comments" element={<Comments />} />
                    <Route path="/lessons/master-architecture/*" element={<MasterArchitecture />} />
                    <Route path="/lessons/mini-courses/*" element={<MiniCourses />} />

                    {/* Protected route */}
                    <Route 
                      path="/profile" 
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      } 
                    />

                    {/* Admin Routes (Fixed Nested Structure) */}
                    <Route 
                      path="/admin/*" 
                      element={
                        <AdminRoute>
                          <AdminDashboard />
                        </AdminRoute>
                      }
                    >
                      <Route path="users" element={<Users />} />
                      <Route path="purchases" element={<Purchases />} />
                      <Route path="security" element={<Security />} />
                      <Route path="access" element={<AccessManagement />} />
                      <Route path="audit-logs" element={<AuditLogs />} />
                    </Route>
                  </Routes>
                </main>
                <Footer />
              </div>
            </BetaRoute>
          </ErrorBoundary>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}