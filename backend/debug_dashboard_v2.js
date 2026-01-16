
const LOGIN_URL = 'http://localhost:3000/auth/login';
const DASHBOARD_URL = 'http://localhost:3000/reports/dashboard';

async function verify() {
    try {
        console.log('🔄 Logging in...');
        const loginRes = await fetch(LOGIN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@sist.com', password: 'admin123' })
        });

        if (!loginRes.ok) throw new Error('Login failed: ' + await loginRes.text());
        const { access_token } = await loginRes.json();
        console.log('✅ Login Successful');

        console.log('🔄 Fetching Dashboard 2.0 stats...');
        const start = Date.now();
        const dashRes = await fetch(DASHBOARD_URL, {
            headers: { 'Authorization': `Bearer ${access_token}` }
        });

        const duration = Date.now() - start;
        console.log(`⏱️ Duration: ${duration}ms`);

        if (!dashRes.ok) {
            console.error('❌ Dashboard Error Status:', dashRes.status);
            const text = await dashRes.text();
            console.error('❌ Dashboard Error Body:', text);
        } else {
            const data = await dashRes.json();
            if (data.error) {
                console.error('❌ API Returned Error:', data.error);
                console.error('Stack:', data.stack);
            }
            console.log('✅ Keys received:', Object.keys(data));
            console.log('✅ Recent Tx Count:', data.recentTransactions?.length);
            console.log('✅ Top Products Count:', data.topProducts?.length);
            console.log('✅ Low Stock Alerts Count:', data.lowStockAlerts?.length);
        }

    } catch (err) {
        console.error('❌ Failed:', err.message);
    }
}

verify();
