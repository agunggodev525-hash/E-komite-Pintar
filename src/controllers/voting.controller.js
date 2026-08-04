// ============================================
// Controller: E-Voting
// ============================================

const prisma = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Mengambil daftar voting yang sedang aktif
 * GET /api/v1/voting
 */
const getActiveVoting = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Ambil voting yang statusnya aktif dan batas waktu belum berlalu
    const votingList = await prisma.voting.findMany({
      where: {
        sekolah_id: req.user.sekolah_id,
        status: 'AKTIF',
        tanggal_berakhir: {
          gt: new Date() // Pastikan belum lewat
        }
      },
      include: {
        kandidat: {
          select: {
            id: true,
            nama_kandidat: true
          }
        },
        suara: {
          where: {
            user_id: userId
          },
          select: {
            kandidat_id: true
          }
        }
      },
      orderBy: {
        tanggal_berakhir: 'asc'
      }
    });

    // Formatting response: tandai apakah user sudah vote
    const formattedData = votingList.map(v => {
      const hasVoted = v.suara.length > 0;
      return {
        id: v.id,
        judul: v.judul,
        deskripsi: v.deskripsi,
        tanggal_berakhir: v.tanggal_berakhir,
        hasVoted: hasVoted,
        voted_kandidat_id: hasVoted ? v.suara[0].kandidat_id : null,
        kandidat: v.kandidat
      };
    });

    return successResponse(res, 'Berhasil mengambil daftar E-Voting', formattedData);
  } catch (error) {
    next(error);
  }
};

/**
 * Menyimpan suara orang tua
 * POST /api/v1/voting/vote
 */
const submitVote = async (req, res, next) => {
  try {
    const { voting_id, kandidat_id } = req.body;
    const userId = req.user.id;

    if (!voting_id || !kandidat_id) {
      return errorResponse(res, 'voting_id dan kandidat_id wajib diisi.', 400);
    }

    // Pastikan voting masih aktif
    const voting = await prisma.voting.findFirst({
      where: { 
        id: voting_id,
        sekolah_id: req.user.sekolah_id 
      }
    });

    if (!voting) {
      return errorResponse(res, 'Voting tidak ditemukan.', 404);
    }

    if (voting.status !== 'AKTIF' || new Date() > new Date(voting.tanggal_berakhir)) {
      return errorResponse(res, 'Voting sudah ditutup.', 400);
    }

    // Pastikan kandidat valid dan merupakan bagian dari voting tersebut
    const kandidat = await prisma.votingKandidat.findFirst({
      where: {
        id: kandidat_id,
        voting_id: voting_id
      }
    });

    if (!kandidat) {
      return errorResponse(res, 'Kandidat tidak valid untuk voting ini.', 400);
    }

    // Karena kita memakai @@unique([voting_id, user_id]), jika insert gagal, itu berarti sudah vote
    try {
      await prisma.votingSuara.create({
        data: {
          voting_id,
          kandidat_id,
          user_id: userId
        }
      });
      return successResponse(res, 'Suara berhasil dikirimkan.', null, 201);
    } catch (e) {
      // Prisma error code P2002: Unique constraint failed
      if (e.code === 'P2002') {
        return errorResponse(res, 'Anda sudah memberikan suara pada voting ini.', 409);
      }
      throw e; // lempar error jika bukan karena unique constraint
    }

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActiveVoting,
  submitVote
};
