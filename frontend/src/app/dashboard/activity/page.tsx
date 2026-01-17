'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { SystemModal } from '@/components/SystemModal';
import { Pagination } from '@/components/Pagination';
import { usePagination } from '@/hooks/usePagination';

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
    const [modal, setModal] = useState<any>({ isOpen: false, type: 'info', message: '' });

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

    // Pagination
    const { currentItems, currentPage, paginate, totalItems } = usePagination(logs, 10);

    const getActionColor = (action: string) => {
        switch (action) {
            case 'CREATE': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
            case 'UPDATE': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
            case 'DELETE': return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800';
            case 'LOGIN': return 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300 border border-violet-200 dark:border-violet-800';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700';
        }
    };

    const handleViewDetails = (log: AuditLog) => {
        let message = 'No details available.';
        try {
            if (log.details) {
                const parsed = JSON.parse(log.details);
                message = JSON.stringify(parsed, null, 2);
            }
        } catch (e) {
            message = log.details || '';
        }

        setModal({
            isOpen: true,
            type: 'info',
            title: 'Audit Details',
            message: (
                <div className="mt-2 p-3 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-x-auto">
                    <pre className="text-xs font-mono text-gray-700 dark:text-gray-300">
                        {message}
                    </pre>
                </div>
            )
        });
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">System Activity Log</h1>
                    <p className="text-sm text-gray-500">Track all changes and user actions across the platform.</p>
                </div>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <select
                        value={filterEntity}
                        onChange={(e) => setFilterEntity(e.target.value)}
                        className="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] transition-all"
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
                        className="px-4 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-sm font-medium text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-all"
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
                                setModal({
                                    isOpen: true,
                                    type: 'error',
                                    message: 'Failed to export audit log'
                                });
                            }
                        }}
                        className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-[var(--primary)]/20"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                        Export Log
                    </button>
                </div>
            </header>

            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-sm backdrop-blur-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[var(--card-border)]">
                        <thead className="bg-[var(--foreground)]/5">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Timestamp</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Action</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Entity</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--card-border)]">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 animate-pulse">
                                        Loading activity logs...
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No activity recorded yet.
                                    </td>
                                </tr>
                            ) : (
                                currentItems.map((log) => (
                                    <tr key={log.id} className="hover:bg-[var(--foreground)]/5 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 group-hover:text-[var(--foreground)] transition-colors">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-[var(--foreground)]/10 flex items-center justify-center text-xs font-bold text-[var(--foreground)]">
                                                    {log.user?.name?.charAt(0) || '?'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-[var(--foreground)]">
                                                        {log.user?.name || log.user?.email || 'System'}
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                                        {log.user?.role?.toLowerCase() || 'System'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${getActionColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-[var(--foreground)]">{log.entity}</span>
                                                <span className="text-xs text-gray-400 font-mono" title={log.entityId}>
                                                    #{log.entityId.substring(0, 8)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <button
                                                onClick={() => handleViewDetails(log)}
                                                className="text-[var(--primary)] hover:text-[var(--primary)]/80 hover:underline text-sm font-medium transition-colors"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalItems={totalItems}
                    itemsPerPage={10}
                    onPageChange={paginate}
                />
            </div>

            <SystemModal
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                type={modal.type}
                message={modal.message}
                title={modal.title}
                onConfirm={modal.onConfirm}
            />
        </div>
    );
}
