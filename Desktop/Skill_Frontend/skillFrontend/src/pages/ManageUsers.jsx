import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { Mail, ShieldAlert, ShieldCheck, Info, Star } from "lucide-react";

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, []);
const fetchUsers = async () => {
    try {
        const response = await axiosInstance.get("/api/admin/users");
        console.log("Users fetched successfully:", response.data); // Add this
        setUsers(response.data);
    } catch (error) {
        console.error("Error fetching users:", error.response || error); // Detailed error
    }
};

const toggleUserStatus = async (userId, currentStatus) => {
    try {
        const newStatus = currentStatus === "ACTIVE" ? "BANNED" : "ACTIVE";
        
        // Wait for the server to confirm the save
        const response = await axiosInstance.put(`/api/admin/users/${userId}/status`, { status: newStatus });
        
        // Update local state ONLY after confirming server success
        setUsers(prevUsers => 
            prevUsers.map(user => 
                user.id === userId ? { ...user, status: response.data.status } : user
            )
        );
        console.log("Status successfully saved to database");
    } catch (error) {
        console.error("Backend failed to save status:", error);
        alert("Failed to update status. Please check your connection.");
    }
};

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-indigo-600 p-8 rounded-t-3xl text-white flex justify-between items-center shadow-lg">
                    <h1 className="text-3xl font-bold">All Users ({users.length})</h1>
                    <button onClick={() => navigate('/admin')} className="bg-indigo-800 hover:bg-indigo-900 px-6 py-2 rounded-xl font-medium transition">
                        ← Back to Dashboard
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white rounded-b-3xl shadow-md overflow-hidden mb-8">
                    <table className="w-full text-left">
                        <thead className="border-b bg-gray-50">
                            <tr>
                                <th className="p-6">User</th>
                                <th className="p-6">Contact</th>
                                <th className="p-6">Rating</th>
                                <th className="p-6">Status</th>
                                <th className="p-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className={`border-b ${user.status === 'BANNED' ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                                    <td className="p-6 font-bold">{user.name}</td>
                                    <td className="p-6 text-sm">
                                        <div className="flex items-center gap-1"><Mail size={14}/> {user.email}</div>
                                    </td>
                                    <td className="p-6 text-sm">
                                        {user.averageRating ? (
                                            <div className="flex items-center text-amber-500 font-bold">
                                                {user.averageRating} <Star size={14} className="fill-current ml-1" />
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-xs italic">No ratings</span>
                                        )}
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right">
                                        <button 
                                            onClick={() => toggleUserStatus(user.id, user.status)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm ml-auto ${user.status === 'ACTIVE' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}
                                        >
                                            {user.status === 'ACTIVE' ? <ShieldAlert size={16}/> : <ShieldCheck size={16}/>}
                                            {user.status === 'ACTIVE' ? 'Ban' : 'Unban'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Guidelines */}
                <div className="bg-indigo-900 text-white p-8 rounded-3xl shadow-lg">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Info /> User Management Guidelines</h2>
                    <ul className="space-y-2 text-indigo-100 text-sm list-disc pl-5">
                        <li>Ban users for violating platform policies or spamming.</li>
                        <li>Unban users only after verification of policy compliance.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ManageUsers;