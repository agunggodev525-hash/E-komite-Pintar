const axios = require('axios');

const BASE_URL = 'https://e-komite-pintar-dfxmr3gki-agung-developer-s-projects.vercel.app/api/v1';

async function run() {
  try {
    // 1. Request OTP (will bypass to 123456)
    console.log("Requesting OTP...");
    await axios.post(`${BASE_URL}/auth/request-otp`, { no_whatsapp: '085609847854' });

    // 2. Verify OTP to get token
    console.log("Verifying OTP...");
    const loginRes = await axios.post(`${BASE_URL}/auth/verify-otp`, {
      no_whatsapp: '085609847854',
      otp: '123456'
    });
    
    const token = loginRes.data.data.token;
    console.log("Login Success! Token obtained.");

    // 3. Get Tagihan
    console.log("Fetching Tagihan...");
    const tagihanRes = await axios.get(`${BASE_URL}/tagihan/siswa/dummy-siswa-id`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const tagihanList = tagihanRes.data.data.tagihan;
    if (!tagihanList || tagihanList.length === 0) {
      console.log("No tagihan found.");
      return;
    }

    const firstTagihanId = tagihanList[0].id;
    console.log(`Found Tagihan ID: ${firstTagihanId}`);

    // 4. Checkout
    console.log("Attempting Checkout...");
    const checkoutRes = await axios.post(`${BASE_URL}/pembayaran/checkout`, {
      tagihan_id: firstTagihanId,
      siswa_id: 'dummy-siswa-id'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log("Checkout Success!");
    console.log(checkoutRes.data);

  } catch (error) {
    console.error("ERROR OCCURRED:");
    if (error.response) {
      console.error(JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

run();
