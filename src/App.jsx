import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MusicProvider } from './contexts/MusicContext';
import { PlaylistProvider } from './contexts/PlaylistContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import AudioPlayer from './components/audio/AudioPlayer';
import Home from './pages/Home';
import Search from './pages/Search';
import Playlists from './pages/Playlists';
import AdminPanel from './pages/AdminPanel';
import AdminLogin from './components/admin/AdminLogin';
import Loading from './components/common/Loading';
import './styles/globals.css';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isAdmin, loading } = useAuth();
  
  if (loading) return <Loading />;
  
  if (adminOnly) {
    if (!user || !isAdmin) {
      return <AdminLogin />;
    }
  }
  
  return children;
};

// App Layout Component
const AppLayout = ({ children }) => (
  <div className="min-h-screen bg-gradient-to-br from-dark-300 via-dark-200 to-dark-100 text-white">
    <Header />
    <main className="pb-24">
      {children}
    </main>
    <AudioPlayer />
    <Footer />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <MusicProvider>
        <PlaylistProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={
                <AppLayout>
                  <Home />
                </AppLayout>
              } />
              
              <Route path="/search" element={
                <AppLayout>
                  <Search />
                </AppLayout>
              } />
              
              <Route path="/playlists" element={
                <AppLayout>
                  <Playlists />
                </AppLayout>
              } />
              
              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute adminOnly>
                  <AdminPanel />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/login" element={<AdminLogin />} />
              
              {/* Fallback Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </PlaylistProvider>
      </MusicProvider>
    </AuthProvider>
  );
}

export default App;