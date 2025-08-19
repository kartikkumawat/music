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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900">
      <div className="w-full max-w-md bg-white dark:bg-dark-200 rounded-xl shadow-2xl p-8 glass-effect">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-primary-500 rounded-full p-3 shadow">
            <Lock className="text-white" size={28} />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Admin Login</h2>
          <p className="text-gray-500 text-sm text-center mt-1">Secure administrative panel</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              type="email"
              autoFocus
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 dark:bg-dark-100 text-gray-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-primary-500 transition"
              placeholder="admin@yourdomain.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 dark:bg-dark-100 text-gray-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-primary-500 transition pr-12"
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
            <div className="bg-red-100 text-red-700 border border-red-300 px-4 py-2 rounded-md text-sm font-semibold">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-100"
          >
            {loading ? 'Authenticating...' : 'Access Admin Panel'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
