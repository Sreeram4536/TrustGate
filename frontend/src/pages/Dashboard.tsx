import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { LogOut, User } from 'lucide-react';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Maybe fetch current user profile if needed, or just use what's available
        // For now, we just show a static dashboard
    }, []);

    const handleLogout = async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            await api.post('/auth/logout', { refreshToken });
        } catch (error) {
            console.error('Logout error', error);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userRole');
            navigate('/login');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 flex items-center gap-2">
                                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                                    <User className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-bold text-xl text-gray-800">TrustGate</span>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                <a href="#" className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                    Dashboard
                                </a>
                                <button onClick={() => navigate('/kyc')} className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                    KYC Verification
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <button
                                onClick={handleLogout}
                                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white shadow rounded-lg p-6">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Your Dashboard</h1>
                        <p className="text-gray-600 mb-6">
                            Manage your profile and complete your KYC verification securely.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/kyc')}>
                                <h2 className="text-lg font-semibold text-indigo-600 mb-2">KYC Verification</h2>
                                <p className="text-gray-500">Complete or view the status of your Know Your Customer verification.</p>
                            </div>
                            {/* Add more user features here */}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
