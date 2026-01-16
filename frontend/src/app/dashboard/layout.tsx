'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';

type MenuItem = {
    name: string;
    path?: string;
    icon?: React.ReactNode;
    children?: MenuItem[];
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, token, isLoading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({
        'Business': true,
        'Management': true
    });

    useEffect(() => {
        if (!isLoading && !token) {
            router.push('/login');
        }
    }, [isLoading, token, router]);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[var(--background)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
            </div>
        );
    }

    if (!token) return null; // Prevent flash of unauthenticated content

    const toggleSubMenu = (name: string) => {
        setOpenSubMenus(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const menuGroups: MenuItem[] = [
        {
            name: 'Main',
            children: [
                { name: 'Dashboard', path: '/dashboard' }
            ]
        },
        {
            name: 'Business',
            children: [
                { name: 'POS / Sales', path: '/dashboard/sales' },
                { name: 'Products', path: '/dashboard/products' },
                { name: 'Expenses', path: '/dashboard/expenses' },
                { name: 'Transactions', path: '/dashboard/transactions' },
            ]
        },
        {
            name: 'Management',
            children: [
                ...(user?.role === 'OWNER' ? [
                    { name: 'Users', path: '/dashboard/users' },
                    { name: 'Suppliers', path: '/dashboard/suppliers' },
                    { name: 'Assets', path: '/dashboard/assets' },
                    { name: 'Investors', path: '/dashboard/investors' },
                    { name: 'Activity Log', path: '/dashboard/activity' },
                ] : [])
            ]
        },
        {
            name: 'Analytics',
            children: [
                ...(user?.role === 'OWNER' || user?.role === 'INVESTOR' ? [
                    { name: 'Reports', path: '/dashboard/reports' },
                    { name: 'Analysis', path: '/dashboard/analysis' },
                ] : [])
            ]
        }
    ].filter(group => group.children && group.children.length > 0);

    const getPageTitle = () => {
        for (const group of menuGroups) {
            if (group.children) {
                const found = group.children.find(item => item.path === pathname);
                if (found) return found.name;
            }
        }
        return 'Overview';
    };

    return (
        <div className="flex h-screen bg-[var(--background)] text-[var(--foreground)] overflow-hidden transition-colors duration-300 font-sans">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Responsive Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-30 w-64 bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)] backdrop-blur-xl transition-transform duration-300 ease-in-out
                md:relative md:translate-x-0 flex flex-col
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-6 border-b border-[var(--sidebar-border)] flex justify-between items-center bg-[var(--sidebar-bg)]">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
                        SIST <span className="text-xs text-gray-500 font-normal">v2.1</span>
                    </h1>
                    <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-[var(--primary)]">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-6">
                    {menuGroups.map((group) => (
                        <div key={group.name} className="space-y-1">
                            <div
                                onClick={() => group.name !== 'Main' && toggleSubMenu(group.name)}
                                className={`
                                    px-3 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex justify-between items-center
                                    ${group.name !== 'Main' ? 'cursor-pointer hover:text-[var(--primary)]' : ''}
                                `}
                            >
                                {group.name}
                                {group.name !== 'Main' && (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className={`w-3 h-3 transition-transform duration-200 ${openSubMenus[group.name] ? 'rotate-180' : ''}`}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                    </svg>
                                )}
                            </div>

                            <div className={`space-y-1 transition-all duration-300 overflow-hidden ${
                                // Always open Main, others conditional
                                group.name === 'Main' || openSubMenus[group.name] ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                                }`}>
                                {group.children?.map((item) => {
                                    const isActive = pathname === item.path;
                                    return (
                                        <Link
                                            key={item.path}
                                            href={item.path!}
                                            onClick={() => setIsSidebarOpen(false)}
                                            className={`block px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ml-1 border-l-2 ${isActive
                                                ? 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)] shadow-sm'
                                                : 'border-transparent text-gray-500 hover:text-[var(--foreground)] hover:bg-[var(--primary)]/5'
                                                }`}
                                        >
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                <div className="p-4 border-t border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[var(--secondary)] to-[var(--primary)] flex items-center justify-center text-xs font-bold text-white shadow-lg">
                            {user?.role?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium truncate text-[var(--foreground)]">{user?.email}</p>
                            <p className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase()}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full rounded-lg border border-red-500/30 bg-red-500/10 py-2 text-sm text-red-500 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                        </svg>
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-hidden relative w-full">
                {/* Top Header */}
                <div className="h-16 border-b border-[var(--glass-border)] bg-[var(--glass)] backdrop-blur-md flex items-center justify-between px-4 md:px-8 z-20">
                    <div className="flex items-center gap-4">
                        {/* Hamburger Button */}
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="-ml-2 p-2 rounded-md text-gray-400 hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] md:hidden transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                        </button>

                        <h2 className="text-lg font-semibold truncate max-w-[150px] md:max-w-none tracking-tight">
                            {getPageTitle()}
                        </h2>
                    </div>

                    <div className="flex gap-3 md:gap-4 items-center">
                        <ThemeToggle />
                        {/* Status Indicators */}
                        <div className="hidden md:flex items-center gap-2 text-xs text-gray-500 ml-4 border-l border-[var(--sidebar-border)] pl-4">
                            <div className="relative h-2 w-2">
                                <div className="absolute animate-ping inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></div>
                                <div className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></div>
                            </div>
                            System Online
                        </div>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
                    <div className="relative z-10 w-full max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
