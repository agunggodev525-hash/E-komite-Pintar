// Native fetch used instead of axios
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runTest() {
  console.log('🔄 Mempersiapkan Data Dummy...');
  
  // 1. Ambil admin & sekolah
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN_KOMITE' } });
  const sekolah = await prisma.sekolah.findFirst();
  const ortu = await prisma.user.findFirst({ where: { role: 'ORANG_TUA' } });

  // 2. Buat Siswa Dummy
  const siswa = await prisma.siswa.create({
    data: {
      nama_siswa: 'Siswa Uji Coba Webhook',
      nisn: `NISN-${Date.now()}`,
      kelas: '10A',
      orang_tua_id: ortu.id,
      sekolah_id: sekolah.id
    }
  });

  // 3. Buat Tagihan Dummy
  const tagihan = await prisma.tagihan.create({
    data: {
      judul: 'Tagihan Uji Coba Webhook',
      nominal: 150000,
      tenggat_waktu: new Date(),
      admin_id: admin.id,
      sekolah_id: sekolah.id
    }
  });

  // 4. Buat Pembayaran PENDING
  const token = `PAY-TEST-${Date.now()}`;
  await prisma.pembayaran.create({
    data: {
      tagihan_id: tagihan.id,
      siswa_id: siswa.id,
      status: 'PENDING',
      payment_token: token
    }
  });

  console.log(`✅ Data Pembayaran PENDING Dibuat dengan Token: ${token}`);
  console.log('🚀 Mengirim Webhook Simulasi...');

  // 5. Siapkan payload webhook (Simulasi Midtrans/Xendit)
  const payload = {
    order_id: token,
    transaction_status: 'settlement',
    gross_amount: 150000
  };

  // 6. Generate Signature HMAC-SHA256
  const secret = 'rahasia-webhook-payment-gateway-123';
  const signature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  // 7. Tembak Endpoint Webhook API Backend
  try {
    const response = await fetch('http://localhost:5000/api/payment/webhook', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'x-signature': signature,
        'Content-Type': 'application/json'
      }
    });

    const responseData = await response.json();
    console.log(`📡 Respons HTTP Webhook: ${response.status} ${response.statusText}`);
    console.log(`📦 Data:`, responseData);

    // 8. Verifikasi Perubahan Database
    const cekPembayaran = await prisma.pembayaran.findFirst({
      where: { payment_token: token }
    });

    if (cekPembayaran.status === 'LUNAS') {
      console.log('🎉 SUKSES! Status pembayaran di database berhasil berubah menjadi LUNAS!');
    } else {
      console.log('❌ GAGAL! Status pembayaran tidak berubah:', cekPembayaran.status);
    }

  } catch (error) {
    console.error('❌ Gagal mengirim webhook:', error.response?.data || error.message);
  } finally {
    await prisma.$disconnect();
  }
}

runTest();
