import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Lock, Eye, EyeOff } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigator('/admin')
    } catch (error) {
      setError('Invalid credentials. Access denied.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 p-4">
      <div className="w-full max-w-md bg-gradient-to-br from-[#1a1a1a] via-[#111827] to-[#1a1a1a] rounded-xl shadow-xl p-8 border border-gray-700  glass-effect">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-blue-600 rounded-full p-3 shadow">
            <Lock className="text-white" size={28} />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-white">Admin Login</h2>
          <p className="text-gray-400 text-sm text-center mt-1">Secure administrative panel</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              type="email"
              autoFocus
              className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-[#1f2937] text-white placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-600 transition glass-effect"
              placeholder="admin@yourdomain.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-[#1f2937] text-white placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-600 transition pr-12 glass-effect"
                placeholder="Your secure password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="absolute right-3 top-3.5 text-gray-400 hover:text-blue-500 focus:outline-none"
                onClick={() => setShowPassword(p => !p)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          {error && (
            <div className="bg-red-500/10 text-red-400 border border-red-500/30 px-4 py-2 rounded-md text-sm font-medium">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {loading ? 'Authenticating...' : 'Access Admin Panel'}
          </button>
        </form>
      </div>

    </div>
  );
};

export default AdminLogin;
