'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await axios.post('http://localhost:3000/auth/login', { email, password });
            const { access_token } = res.data;

            // Fetch user profile to ensure we have the User object for the context
            const profileRes = await axios.get('http://localhost:3000/profile', {
                headers: { Authorization: `Bearer ${access_token}` }
            });

            login(access_token, profileRes.data);
            router.push('/dashboard');
        } catch (error) {
            console.error(error);
            alert('Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-purple-600/20 blur-[100px]" />
            <div className="absolute bottom-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-cyan-500/20 blur-[100px]" />

            <div className="relative z-10 w-full max-w-md p-8">
                {/* Glass Card */}
                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl ring-1 ring-white/5">
                    <div className="mb-8 text-center">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                            SIST
                        </h1>
                        <p className="mt-2 text-sm text-gray-400 tracking-widest uppercase">
                            Enterprise Access
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-white placeholder-gray-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
                                placeholder="name@company.com"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group w-full relative overflow-hidden rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 p-3 font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-cyan-500/25 active:scale-95 disabled:opacity-50"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full transition-transform group-hover:translate-y-0" />
                            <span className="relative">
                                {isLoading ? 'Authenticating...' : 'Initialize System'}
                            </span>
                        </button>
                    </form>

                    <div className="mt-6 text-center text-xs text-gray-600">
                        Secure Connection • Encrypted v2.0
                    </div>
                </div>
            </div>
        </div>
    );
}
