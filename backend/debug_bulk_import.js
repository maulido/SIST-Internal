const axios = require('axios');

async function debugBulkImport() {
    try {
        console.log('Login as admin...');
        const loginRes = await axios.post('http://localhost:3000/auth/login', {
            email: 'admin@sist.com',
            password: 'admin123'
        });
        const token = loginRes.data.accessToken;
        console.log('Login success. Token obtained.');

        console.log('Sending Bulk Import Request...');
        const payload = [
            {
                name: 'Debug Bulk Item',
                price: 15000,
                stock: 100,
                category: 'Debug',
                type: 'GOODS'
            }
        ];

        const res = await axios.post('http://localhost:3000/products/bulk', payload, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Success:', res.status);
        console.log('Data:', res.data);

    } catch (error) {
        if (error.response) {
            console.error('Error Status:', error.response.status);
            console.error('Error Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
    }
}

debugBulkImport();
