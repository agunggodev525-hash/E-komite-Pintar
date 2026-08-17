const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 
async function main() { 
  const user = await prisma.user.findFirst({where: {nama_lengkap: {contains: 'Oki'}}}); 
  console.log('User:', user); 
  if(!user) return; 
  const siswa = await prisma.siswa.findMany({where: {orang_tua_id: user.id}}); 
  console.log('Siswa:', siswa); 
  for(const s of siswa) { 
    const bills = await prisma.pembayaran.findMany({where: {siswa_id: s.id}, include: {tagihan: true}}); 
    console.log('Bills for', s.nama_siswa, ':', bills.map(b => ({id: b.id, status: b.status, judul: b.tagihan.judul}))); 
  } 
} 
main().catch(console.error).finally(()=>prisma.$disconnect());
