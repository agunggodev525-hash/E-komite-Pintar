const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Buat SUPER ADMIN
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@ekomite.id' },
    update: { password_hash: passwordHash, role: 'SUPER_ADMIN' },
    create: {
      nama_lengkap: 'SaaS Super Admin',
      email: 'superadmin@ekomite.id',
      password_hash: passwordHash,
      role: 'SUPER_ADMIN',
      status: true
    },
  });

  // 2. Buat Sekolah Dummy (Tenant)
  let sekolahDummy = await prisma.sekolah.findFirst();
  if (!sekolahDummy) {
    sekolahDummy = await prisma.sekolah.create({
      data: {
        nama_sekolah: 'SMA Negeri 1 Nusantara',
        alamat: 'Jl. Pendidikan No. 1, Jakarta',
        status: 'AKTIF'
      }
    });
  }

  // 3. Upsert Admin Komite (Terikat Sekolah)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sekolah.id' },
    update: { password_hash: passwordHash, role: 'ADMIN_KOMITE', sekolah_id: sekolahDummy.id },
    create: {
      nama_lengkap: 'Admin Komite',
      email: 'admin@sekolah.id',
      password_hash: passwordHash,
      role: 'ADMIN_KOMITE',
      no_whatsapp: '081234567890',
      status: true,
      sekolah_id: sekolahDummy.id
    },
  });

  // 4. Upsert Orang Tua (Terikat Sekolah)
  const ortu = await prisma.user.upsert({
    where: { email: 'orangtua@sekolah.id' },
    update: { password_hash: passwordHash, role: 'ORANG_TUA', sekolah_id: sekolahDummy.id },
    create: {
      nama_lengkap: 'Orang Tua Siswa',
      email: 'orangtua@sekolah.id',
      password_hash: passwordHash,
      role: 'ORANG_TUA',
      no_whatsapp: '081234567891',
      status: true,
      sekolah_id: sekolahDummy.id
    },
  });

  // 5. Upsert Pihak Sekolah (Terikat Sekolah)
  const pihakSekolah = await prisma.user.upsert({
    where: { email: 'sekolah@sekolah.id' },
    update: { password_hash: passwordHash, role: 'SEKOLAH', sekolah_id: sekolahDummy.id },
    create: {
      nama_lengkap: 'Pihak Sekolah',
      email: 'sekolah@sekolah.id',
      password_hash: passwordHash,
      role: 'SEKOLAH',
      no_whatsapp: '081234567892',
      status: true,
      sekolah_id: sekolahDummy.id
    },
  });

  console.log('Seeding selesai!');
  console.log('Super Admin:', superAdmin.email);
  console.log('Admin Komite:', admin.email);
  console.log('Orang Tua:', ortu.email);
  console.log('Sekolah:', pihakSekolah.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
