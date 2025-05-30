import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context Provider
import { AuthProvider } from './contexts/AuthContext';

// Layout Components
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/routes/PrivateRoute';

// Lazy-loaded Pages
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Board = React.lazy(() => import('./pages/Board'));
const CreatePost = React.lazy(() => import('./pages/CreatePost'));
const BoardDetail = React.lazy(() => import('./pages/BoardDetail'));
const Favorites = React.lazy(() => import('./pages/Favorites'));
const PropertyList = React.lazy(() => import('./pages/PropertyList'));
const PropertyDetail = React.lazy(() => import('./pages/PropertyDetail'));
const PropertyUpload = React.lazy(() => import('./pages/PropertyUpload'));
const RegisterAgent = React.lazy(() => import('./pages/RegisterAgent'));
const UserProfile = React.lazy(() => import('./pages/UserProfile'));
const AgentProfile = React.lazy(() => import('./pages/AgentProfile'));
const MyProperties = React.lazy(() => import('./pages/MyProperties'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/properties" element={<PropertyList />} />
            <Route path="/properties/upload" element={<ProtectedRoute><PropertyUpload /></ProtectedRoute>} />
            <Route path="/properties/:id" element={<PropertyDetail />} />
            <Route path="/board" element={<Board />} />
            <Route path="/board/:id" element={<BoardDetail />} />
            <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
            <Route path="/register/agent" element={<RegisterAgent />} />

            {/* Protected */}
            <Route path="/board/create" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
            <Route path="/board/edit/:id" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
            <Route path="/profile/agent" element={<ProtectedRoute><AgentProfile /></ProtectedRoute>} />
            <Route path="/agent/properties" element={<ProtectedRoute><MyProperties /></ProtectedRoute>} />

            {/* ★★★ 여기 추가 ★★★ */}
            {/* 매물 수정 페이지 (연필 버튼) */}
            <Route path="/agent/properties/edit/:id"
                   element={
                     /* 필요하다면 requireAgent 같은 prop을 추가하세요 */
                     <ProtectedRoute><PropertyUpload /></ProtectedRoute>
                   } />
            {/* Admin */}
            
            <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <Footer />
      </Router>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </AuthProvider>
  );
}

export default App;