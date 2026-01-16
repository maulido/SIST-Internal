'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const { token } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        role: 'USER' // USER, ADMIN, OWNER, INVESTOR
    });

    const fetchUsers = () => {
        // Note: backend implementation of findAll users might be needed in UsersController. 
        // I likely only made 'findOne'. I should check UsersController or add findAll if missing.
        // For now, I will assume I need to add it or it exists.
        // Actually, looking back at UsersController, I only saw `create` and `findOne`.
        // I will need to update backend UsersController to support `findAll`.
        if (token) {
            axios.get('http://localhost:3000/users', {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => setUsers(Array.isArray(res.data) ? res.data : []))
                .catch(err => console.error(err));
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3000/users', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('User created!');
            setFormData({ email: '', password: '', name: '', role: 'USER' });
            fetchUsers();
        } catch (err) {
            console.error(err);
            alert('Failed to create user');
        }
    };

    return (
        <div>
            <h3 className="text-2xl font-bold text-gray-800">User Management</h3>

            <div className="mt-6 rounded-lg bg-white p-6 shadow">
                <h4 className="mb-4 font-semibold">Create New User</h4>
                <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-5 items-end">
                    <div>
                        <label className="mb-1 block text-sm">Name</label>
                        <input type="text" className="w-full rounded border p-2"
                            value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm">Email</label>
                        <input type="email" className="w-full rounded border p-2"
                            value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm">Password</label>
                        <input type="password" className="w-full rounded border p-2"
                            value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm">Role</label>
                        <select className="w-full rounded border p-2"
                            value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                            <option value="USER">User</option>
                            <option value="ADMIN">Admin</option>
                            <option value="OWNER">Owner</option>
                            <option value="INVESTOR">Investor</option>
                        </select>
                    </div>
                    <button type="submit" className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">Create</button>
                </form>
            </div>

            <div className="mt-6 overflow-hidden rounded-lg bg-white shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Role</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {users.map((u: any) => (
                            <tr key={u.id}>
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{u.name}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{u.email}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{u.role}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
