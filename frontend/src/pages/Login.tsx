import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, refreshToken, user } = response.data;


      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('userRole', user.role);

      if (user.role && user.role.toLowerCase() === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/kyc');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-4">
      <div className="max-w-md w-full bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4 animate-bounce-slow">
              <Lock className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
            <p className="text-gray-500">Sign in to access your dashboard</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block" htmlFor="email">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white/50"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700 block" htmlFor="password">Password</label>
                <a href="#" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white/50"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center shadow-lg shadow-indigo-200"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  Sign In <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
        <div className="px-8 py-4 bg-gray-50/50 text-center border-t border-gray-100">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;