'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Drawer } from '@/components/Drawer';

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const { token, isLoading } = useAuth();

    // Drawer States
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState<'CREATE' | 'EDIT' | 'VIEW'>('CREATE');
    const [selectedUser, setSelectedUser] = useState<any>(null);

    // Form Data
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        role: 'USER'
    });

    const fetchUsers = () => {
        if (token && !isLoading) { // Ensure token is loaded
            axios.get('http://localhost:3000/users', {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => setUsers(Array.isArray(res.data) ? res.data : []))
                .catch(err => console.error(err));
        }
    };

    useEffect(() => {
        if (!isLoading) fetchUsers();
    }, [token, isLoading]);

    const handleOpenCreate = () => {
        setFormData({ email: '', password: '', name: '', role: 'USER' });
        setDrawerMode('CREATE');
        setIsDrawerOpen(true);
    };

    const handleOpenEdit = (user: any) => {
        setSelectedUser(user);
        setFormData({
            email: user.email,
            password: '', // Leave empty to keep unchanged
            name: user.name,
            role: user.role
        });
        setDrawerMode('EDIT');
        setIsDrawerOpen(true);
    };

    const handleOpenView = (user: any) => {
        setSelectedUser(user);
        setDrawerMode('VIEW');
        setIsDrawerOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (drawerMode === 'CREATE') {
                await axios.post('http://localhost:3000/users', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('User created successfully!');
            } else if (drawerMode === 'EDIT' && selectedUser) {
                // Determine what to send. If password is empty, maybe don't send it? 
                // For simplicity assuming backend handles partial updates or we send everything.
                // NOTE: Standard PATCH usually preferred for updates.
                const updateData = { ...formData };
                if (!updateData.password) delete (updateData as any).password;

                await axios.patch(`http://localhost:3000/users/${selectedUser.id}`, updateData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('User updated successfully!');
            }
            setIsDrawerOpen(false);
            fetchUsers();
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.message || 'Operation failed');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-3xl font-bold text-[var(--foreground)]">User Management</h3>
                    <p className="text-gray-500">Manage system access and roles</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-2 bg-[var(--primary)] text-[var(--background)] px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add New User
                </button>
            </div>

            {/* Users Table */}
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] backdrop-blur-sm overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[var(--card-border)]">
                        <thead className="bg-[var(--primary)]/5">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">User Info</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--card-border)]">
                            {users.map((u: any) => (
                                <tr key={u.id} className="hover:bg-[var(--foreground)]/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[var(--secondary)]/80 to-[var(--primary)]/80 flex items-center justify-center text-white font-bold text-sm">
                                                {u.name?.charAt(0).toUpperCase() || '?'}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-[var(--foreground)]">{u.name}</div>
                                                <div className="text-sm text-gray-500">{u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                                            ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                                                u.role === 'OWNER' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                                    u.role === 'INVESTOR' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                                        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-3">
                                        <button
                                            onClick={() => handleOpenView(u)}
                                            className="text-blue-400 hover:text-blue-500 transition-colors"
                                            title="View Details"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleOpenEdit(u)}
                                            className="text-[var(--primary)] hover:opacity-80 transition-colors"
                                            title="Edit User"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                                        No users found. Create one to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Reusable Drawer for Create / Edit / View */}
            <Drawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                title={drawerMode === 'CREATE' ? 'New User' : drawerMode === 'EDIT' ? 'Edit User' : 'User Details'}
            >
                {drawerMode === 'VIEW' ? (
                    <div className="space-y-6">
                        <div className="text-center p-6 bg-[var(--foreground)]/5 rounded-xl">
                            <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-tr from-[var(--secondary)] to-[var(--primary)] flex items-center justify-center text-white font-bold text-3xl shadow-lg">
                                {selectedUser?.name?.charAt(0).toUpperCase()}
                            </div>
                            <h3 className="mt-4 text-xl font-bold text-[var(--foreground)]">{selectedUser?.name}</h3>
                            <p className="text-[var(--primary)] font-medium">{selectedUser?.email}</p>
                            <div className="mt-2 inline-block px-3 py-1 rounded-full bg-[var(--foreground)]/10 text-xs font-bold tracking-widest text-[var(--foreground)] opacity-70">
                                {selectedUser?.role}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 rounded-lg border border-[var(--card-border)]">
                                <label className="text-xs text-gray-500 uppercase tracking-wide">Account ID</label>
                                <p className="font-mono text-sm text-[var(--foreground)]">{selectedUser?.id}</p>
                            </div>
                            <div className="p-4 rounded-lg border border-[var(--card-border)]">
                                <label className="text-xs text-gray-500 uppercase tracking-wide">Joined Date</label>
                                <p className="text-sm text-[var(--foreground)]">{new Date().toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--foreground)]">Full Name</label>
                            <input
                                type="text"
                                className="w-full rounded-lg bg-[var(--background)] border border-gray-300 dark:border-[var(--card-border)] p-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] focus:outline-none transition-all shadow-sm"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. John Doe"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--foreground)]">Email Address</label>
                            <input
                                type="email"
                                className="w-full rounded-lg bg-[var(--background)] border border-gray-300 dark:border-[var(--card-border)] p-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] focus:outline-none transition-all shadow-sm"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                placeholder="john@company.com"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--foreground)]">
                                {drawerMode === 'EDIT' ? 'Password (leave blank to keep)' : 'Password'}
                            </label>
                            <input
                                type="password"
                                className="w-full rounded-lg bg-[var(--background)] border border-gray-300 dark:border-[var(--card-border)] p-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] focus:outline-none transition-all shadow-sm"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                                required={drawerMode === 'CREATE'}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--foreground)]">Role Permission</label>
                            <select
                                className="w-full rounded-lg bg-[var(--background)] border border-[var(--card-border)] p-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none transition-colors appearance-none"
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                            >
                                <option value="USER">User (Standard Access)</option>
                                <option value="ADMIN">Admin (Full Control)</option>
                                <option value="OWNER">Owner (System Owner)</option>
                                <option value="INVESTOR">Investor (Read Only)</option>
                            </select>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setIsDrawerOpen(false)}
                                className="flex-1 px-4 py-3 rounded-lg border border-[var(--card-border)] text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-3 rounded-lg bg-[var(--primary)] text-[var(--background)] font-bold hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                            >
                                {drawerMode === 'CREATE' ? 'Create Account' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                )}
            </Drawer>
        </div>
    );
}
