'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

interface AuditLog {
    id: string;
    action: string;
    entity: string;
    entityId: string;
    details: string | null;
    createdAt: string;
    user: {
        name: string | null;
        email: string;
        role: string;
    } | null;
}

export default function ActivityPage() {
    const { token } = useAuth();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterEntity, setFilterEntity] = useState('');

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const params: any = { limit: 100 };
            if (filterEntity) params.entity = filterEntity;

            const response = await axios.get('http://localhost:3000/audit', {
                headers: { Authorization: `Bearer ${token}` },
                params
            });
            setLogs(response.data);
        } catch (error) {
            console.error('Failed to fetch audit logs', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchLogs();
    }, [token, filterEntity]);

    const formatDetails = (details: string | null) => {
        if (!details) return '-';
        try {
            const parsed = JSON.parse(details);
            return (
                <pre className="text-xs whitespace-pre-wrap font-mono bg-gray-50 dark:bg-gray-800 p-2 rounded max-h-32 overflow-y-auto">
                    {JSON.stringify(parsed, null, 2)}
                </pre>
            );
        } catch (e) {
            return <div className="text-sm text-gray-600 dark:text-gray-300">{details}</div>;
        }
    };

    const getActionColor = (action: string) => {
        switch (action) {
            case 'CREATE': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'UPDATE': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'DELETE': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            case 'LOGIN': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">System Activity Log</h1>
                    <p className="text-sm text-gray-500">Track all changes and user actions across the platform.</p>
                </div>
                <div className="flex gap-2">
                    <select
                        value={filterEntity}
                        onChange={(e) => setFilterEntity(e.target.value)}
                        className="rounded-lg border border-[var(--glass-border)] bg-[var(--background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    >
                        <option value="">All Entities</option>
                        <option value="Product">Products</option>
                        <option value="Transaction">Transactions</option>
                        <option value="User">Users</option>
                        <option value="Investor">Investors</option>
                        <option value="Supplier">Suppliers</option>
                        <option value="Asset">Assets</option>
                        <option value="Auth">Authentication</option>
                        <option value="Refund">Refunds</option>
                    </select>
                    <button
                        onClick={() => fetchLogs()}
                        className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
                    >
                        Refresh
                    </button>
                    <button
                        onClick={async () => {
                            if (!token) return;
                            try {
                                const response = await axios.get('http://localhost:3000/audit/export', {
                                    headers: { Authorization: `Bearer ${token}` },
                                    responseType: 'blob',
                                });
                                const url = window.URL.createObjectURL(new Blob([response.data]));
                                const link = document.createElement('a');
                                link.href = url;
                                link.setAttribute('download', 'Audit_Log.xlsx');
                                document.body.appendChild(link);
                                link.click();
                                link.parentNode?.removeChild(link);
                            } catch (error) {
                                console.error('Export failed', error);
                                alert('Failed to export audit log');
                            }
                        }}
                        className="rounded-lg border border-[var(--glass-border)] bg-[var(--card-bg)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-colors flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-green-600">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        Export
                    </button>
                </div>
            </header>

            <div className="border border-[var(--glass-border)] rounded-xl overflow-hidden bg-[var(--background)] shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-gray-500 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4">Timestamp</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Action</th>
                                <th className="px-6 py-4">Entity</th>
                                <th className="px-6 py-4 w-96">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--glass-border)]">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        Loading activity logs...
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No activity recorded yet.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-[var(--foreground)]">
                                                    {log.user?.name || log.user?.email || 'System'}
                                                </span>
                                                <span className="text-xs text-gray-500 capitalize">
                                                    {log.user?.role?.toLowerCase() || 'System'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{log.entity}</span>
                                                <span className="text-xs text-gray-400 font-mono" title={log.entityId}>
                                                    ID: {log.entityId.substring(0, 8)}...
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {formatDetails(log.details)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
