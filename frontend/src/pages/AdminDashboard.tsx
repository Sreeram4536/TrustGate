import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Search, LogOut, Loader2, ShieldCheck, Eye, X } from 'lucide-react';
import { toast } from 'react-toastify'
import type { AxiosError } from 'axios';


interface UserData {
    id: string;
    email: string;
    role: string;
    joinedAt: string;
    kycStatus: 'pending' | 'approved' | 'rejected' | 'not_submitted';
    kycImage?: string;
    kycVideo?: string;
}

const ITEMS_PER_PAGE = 10;

const AdminDashboard: React.FC = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);

    // Modal State
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

    const navigate = useNavigate();

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/users', {
                params: {
                    page: currentPage,
                    limit: ITEMS_PER_PAGE,
                    search: searchTerm,
                },
            });
            console.log('API Response:', response.data);
            console.log('First user:', response.data.users[0]);
            console.log('KYC Image URL:', response.data.users[0]?.kycImage);
            console.log('KYC Video URL:', response.data.users[0]?.kycVideo);
            setUsers(response.data.users);
            setTotalPages(response.data.totalPages);
            setTotalUsers(response.data.total);
        } catch (err: unknown) {
            const error = err as AxiosError<{ message: string }>;
            console.log(err);
            toast.error(error.response?.data?.message ?? "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchUsers();
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [currentPage, searchTerm]);

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

    const handleApprove = async (userId: string) => {
        try {
            await api.patch(`/kyc/approve/${userId}`);
            toast.success('KYC approved successfully!');
            setSelectedUser(null);
            fetchUsers(); // Refresh the list
        } catch (error) {
            console.error('Error approving KYC:', error);
            toast.error('Failed to approve KYC');
        }
    };

    const handleReject = async (userId: string) => {
        try {
            await api.patch(`/kyc/reject/${userId}`);
            toast.error('KYC rejected');
            setSelectedUser(null);
            fetchUsers(); // Refresh the list
        } catch (error) {
            console.error('Error rejecting KYC:', error);
            toast.error('Failed to reject KYC');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Approved</span>;
            case 'rejected': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Rejected</span>;
            case 'pending': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
            default: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Not Submitted</span>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                                    <ShieldCheck className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-bold text-xl text-gray-800">TrustGate Admin</span>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                <a href="#" className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                    User Management
                                </a>
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
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                        <div className="mt-4 sm:mt-0 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by email..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                className="block w-full sm:w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm transition duration-150 ease-in-out shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">KYC Status</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined Date</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-10 text-center">
                                                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                                            </td>
                                        </tr>
                                    ) : users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold uppercase">
                                                            {user.email.charAt(0)}
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{user.email}</div>
                                                        <div className="text-xs text-gray-500">{user.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(user.kycStatus)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(user.joinedAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {user.kycStatus !== 'not_submitted' && (
                                                    <button
                                                        onClick={() => setSelectedUser(user)}
                                                        className="text-indigo-600 hover:text-indigo-900 flex items-center"
                                                    >
                                                        <Eye className="w-4 h-4 mr-1" /> View KYC
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {!loading && users.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-10 text-center text-gray-500">No users found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination (Simplified) */}
                        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, totalUsers)}</span> of <span className="font-medium">{totalUsers}</span> results
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage(curr => Math.max(curr - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(curr => Math.min(curr + 1, totalPages))}
                                        disabled={currentPage === totalPages || totalPages === 0}
                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* KYC Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setSelectedUser(null)}
                    ></div>

                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">KYC Verification</h3>
                                <p className="text-sm text-gray-500">{selectedUser.email}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                {getStatusBadge(selectedUser.kycStatus)}
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Image Section */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center">
                                            <ShieldCheck className="w-4 h-4 mr-2 text-indigo-600" />
                                            Selfie / ID Image
                                        </h4>
                                        {selectedUser.kycImage && (
                                            <a href={selectedUser.kycImage} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline">
                                                Open Full Size
                                            </a>
                                        )}
                                    </div>
                                    <div className="aspect-[4/3] bg-gray-50 rounded-xl overflow-hidden border-2 border-gray-100 shadow-inner flex items-center justify-center">
                                        {selectedUser.kycImage ? (
                                            <img
                                                src={selectedUser.kycImage}
                                                alt="KYC Image"
                                                className="w-full h-full object-contain"
                                                crossOrigin="anonymous"
                                            />
                                        ) : (
                                            <div className="text-center text-gray-400">
                                                <ShieldCheck className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                                <p>No image available</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Video Section */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center">
                                            <ShieldCheck className="w-4 h-4 mr-2 text-indigo-600" />
                                            Verification Video
                                        </h4>
                                        {selectedUser.kycVideo && (
                                            <a href={selectedUser.kycVideo} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline">
                                                Open in New Tab
                                            </a>
                                        )}
                                    </div>
                                    <div className="aspect-[4/3] bg-black rounded-xl overflow-hidden border-2 border-gray-100 shadow-2xl flex items-center justify-center">
                                        {selectedUser.kycVideo ? (
                                            <video
                                                src={selectedUser.kycVideo}
                                                controls
                                                className="w-full h-full"
                                                crossOrigin="anonymous"
                                            />
                                        ) : (
                                            <div className="text-center text-gray-400">
                                                <ShieldCheck className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                                <p>No video available</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Info & Actions card */}
                            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2 bg-gray-50 rounded-xl p-5 border border-gray-100">
                                    <h4 className="text-sm font-bold text-gray-900 mb-4">User Details</h4>
                                    <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                                        <div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase">Email</span>
                                            <p className="text-sm font-medium text-gray-800">{selectedUser.email}</p>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase">User ID</span>
                                            <p className="text-xs font-mono text-gray-600 truncate">{selectedUser.id}</p>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase">Registration Date</span>
                                            <p className="text-sm font-medium text-gray-800">{new Date(selectedUser.joinedAt).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase">KYC Status</span>
                                            <div className="mt-1">{getStatusBadge(selectedUser.kycStatus)}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 justify-center">
                                    {selectedUser.kycStatus === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => handleApprove(selectedUser.id)}
                                                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-100 transition-all active:scale-95"
                                            >
                                                Approve KYC
                                            </button>
                                            <button
                                                onClick={() => handleReject(selectedUser.id)}
                                                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-100 transition-all active:scale-95"
                                            >
                                                Reject KYC
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => setSelectedUser(null)}
                                        className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
