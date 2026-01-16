'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, logout, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // If not authenticated, redirect to login
        // Note: In a real app, middleware is better for this.
        // We check isAuthenticated but it might be false initially until hydration.
        // For now, we rely on the protected route logic or simple redirects.
        if (!localStorage.getItem('token')) {
            router.push('/login');
        }
    }, [router]);

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-indigo-800 text-white">
                <div className="p-4">
                    <h1 className="text-2xl font-bold">SIST Admin</h1>
                </div>
                <nav className="mt-6">
                    <a href="/dashboard" className="block px-4 py-2 hover:bg-indigo-700">Dashboard</a>
                    <a href="/dashboard/investors" className="block px-4 py-2 hover:bg-indigo-700">Investors</a>
                    <a href="/dashboard/assets" className="block px-4 py-2 hover:bg-indigo-700">Assets</a>
                    <a href="/dashboard/products" className="block px-4 py-2 hover:bg-indigo-700">Products</a>
                    <a href="/dashboard/transactions" className="block px-4 py-2 hover:bg-indigo-700">History</a>
                    <a href="/dashboard/sales" className="block px-4 py-2 hover:bg-indigo-700">POS (Sale)</a>
                    <a href="/dashboard/expenses" className="block px-4 py-2 hover:bg-indigo-700">Expenses</a>
                    <a href="/dashboard/reports" className="block px-4 py-2 hover:bg-indigo-700">Reports</a>
                    <a href="/dashboard/analysis" className="block px-4 py-2 hover:bg-indigo-700">Analysis</a>
                    <a href="/dashboard/users" className="block px-4 py-2 hover:bg-indigo-700">Users</a>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Header */}
                <header className="flex items-center justify-between border-b bg-white px-6 py-4 shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-800">Overview</h2>
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-600">Hello, {user?.email}</span>
                        <button
                            onClick={logout}
                            className="rounded bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600"
                        >
                            Logout
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
