
// using native fetch
async function run() {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await fetch('http://localhost:3000/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@sist.com', password: 'admin' })
        });
        const loginData = await loginRes.json();

        if (!loginData.access_token) {
            console.error('Login Failed:', loginData);
            return;
        }
        console.log('Login Success. Token:', loginData.access_token.substring(0, 20) + '...');

        // 2. Get Product ID
        // (Hardcoded from previous logs or fetch one)
        const productId = '98803ca9-e7fe-472f-839f-037800ca60fc'; // Kopi Susu Gula Aren from previous logs

        // 3. Restock
        console.log('Restocking...');
        const stockRes = await fetch(`http://localhost:3000/products/${productId}/stock`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${loginData.access_token}`
            },
            body: JSON.stringify({
                quantity: 5,
                cost: 10000,
                note: 'API Verification UserID'
            })
        });
        const stockData = await stockRes.json();
        console.log('Restock Response:', JSON.stringify(stockData, null, 2));

    } catch (e) {
        console.error('Error:', e);
    }
}

run();
