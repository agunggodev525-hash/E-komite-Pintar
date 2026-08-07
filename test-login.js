const axios = require('axios');

async function testLogin() {
  try {
    const res = await axios.post('https://e-komite-pintar-dfxmr3gki-agung-developer-s-projects.vercel.app/api/v1/auth/login', {
      email: 'admin@sekolah.com',
      password: 'password123'
    });
    console.log(res.data);
  } catch (err) {
    if (err.response) {
      console.error(err.response.data);
    } else {
      console.error(err.message);
    }
  }
}

testLogin();
