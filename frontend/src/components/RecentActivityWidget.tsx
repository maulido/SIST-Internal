'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface AuditLog {
    id: string;
    action: string;
    entity: string;
    entityId: string;
    createdAt: string;
    user: {
        name: string | null;
        email: string;
    } | null;
}

export default function RecentActivityWidget() {
    const { token } = useAuth();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) return;

        const fetchLogs = async () => {
            try {
                const response = await axios.get('http://localhost:3000/audit', {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { limit: 5 }
                });
                setLogs(response.data);
            } catch (error) {
                console.error('Failed to fetch recent activity', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [token]);

    const getActionColor = (action: string) => {
        switch (action) {
            case 'CREATE': return 'text-green-600 dark:text-green-400';
            case 'UPDATE': return 'text-blue-600 dark:text-blue-400';
            case 'DELETE': return 'text-red-600 dark:text-red-400';
            case 'LOGIN': return 'text-purple-600 dark:text-purple-400';
            default: return 'text-gray-600 dark:text-gray-400';
        }
    };

    if (loading) {
        return (
            <div className="bg-[var(--card-bg)] rounded-xl p-6 border border-[var(--glass-border)] shadow-sm h-full max-h-[400px]">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-4 animate-pulse">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex gap-4">
                            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[var(--card-bg)] rounded-xl p-6 border border-[var(--glass-border)] shadow-sm h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Recent Activity</h3>
                <Link href="/dashboard/activity" className="text-sm text-[var(--primary)] hover:underline">
                    View All
                </Link>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto">
                {logs.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No recent activity.</p>
                ) : (
                    logs.map((log) => (
                        <div key={log.id} className="flex gap-4 items-start">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 shrink-0`}>
                                <span className="text-xs font-bold text-gray-500">
                                    {log.user?.name?.charAt(0) || log.user?.email.charAt(0) || 'S'}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[var(--foreground)] truncate">
                                    <span className={getActionColor(log.action)}>{log.action}</span>
                                    {' '}{log.entity}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    by {log.user?.name || log.user?.email || 'System'}
                                </p>
                            </div>
                            <div className="text-xs text-gray-400 whitespace-nowrap">
                                {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
