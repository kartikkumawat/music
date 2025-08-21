import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
// import { MusicProvider } from './contexts/MusicContext';
import { MusicPlayerProvider } from './contexts/MusicPlayerContext';
import { MusicTimeProvider } from './contexts/MusicTimeContext';
import { MusicActionsProvider } from './contexts/MusicActionsContext';
import { PlaylistProvider } from './contexts/PlaylistContext';
import Home from './pages/Home';
import Search from './pages/Search';
import Playlists from './pages/Playlists';
import PlaylistDetail from './components/playlist/PlaylistDetail';
import AdminPanel from './pages/AdminPanel';
import AdminLogin from './components/admin/AdminLogin';
import AudioPlayer from './components/audio/AudioPlayer';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import SongDetail from './components/music/SongDetail';
import './styles/globals.css';

const HiddenAdminRoute = () => {
  const { isAdmin } = useAuth();
  return isAdmin ? <AdminPanel /> : <AdminLogin />;
};

const MainLayout = ({ children }) => (
  <PlaylistProvider>
    <div className="min-h-screen bg-dark-300 flex flex-col">
      <Header />
      <main className="flex-1 pb-24 relative">
        {children}
        <AudioPlayer />
      </main>
      <Footer />
    </div>
  </PlaylistProvider>
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={
        <MainLayout>
          <Home />
        </MainLayout>
      } />

      <Route path="/search" element={
        <MainLayout>
          <Search />
        </MainLayout>
      } />

      <Route path="/playlists" element={
        <MainLayout>
          <Playlists />
        </MainLayout>
      } />

      {/* Playlist Detail Route */}
      <Route path="/playlist/:playlistId" element={
        <MainLayout>
          <PlaylistDetail />
        </MainLayout>
      } />
      <Route path="/song/:songId" element={
        <MainLayout>
        <SongDetail />
        </MainLayout>
        } />

      <Route path="/music-admin" element={<HiddenAdminRoute />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <MusicPlayerProvider>
          <MusicTimeProvider>
            <MusicActionsProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <AppRoutes />
        </Router>
      </MusicActionsProvider>
          </MusicTimeProvider>
        </MusicPlayerProvider>
    </AuthProvider>
  );
}

export default App;
