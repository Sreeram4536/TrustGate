import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { UserPlus, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

const Register: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setError('');
        setLoading(true);
        try {
            await api.post('/auth/register', { email, password });
            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-indigo-50 to-blue-100 p-4">
            <div className="max-w-md w-full bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
                            <UserPlus className="w-8 h-8 text-purple-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
                        <p className="text-gray-500">Join us to start your journey</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 block" htmlFor="email">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-white/50"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 block" htmlFor="password">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-white/50"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 block" htmlFor="confirmPassword">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-white/50"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center shadow-lg shadow-purple-200"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>
                                    Get Started <ArrowRight className="ml-2 w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
                <div className="px-8 py-4 bg-gray-50/50 text-center border-t border-gray-100">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-purple-600 hover:text-purple-800 hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
