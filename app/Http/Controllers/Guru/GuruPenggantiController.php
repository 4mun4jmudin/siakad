<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Guru;
use App\Models\JadwalMengajar;
use App\Models\PengajuanGuruPengganti;
use App\Models\PengajuanGuruTarget;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Inertia\Inertia;

class GuruPenggantiController extends Controller
{
    /**
     * Tampilkan form untuk memilih guru pengganti untuk sebuah jadwal.
     */
    public function create(Request $request)
    {
        $id_jadwal = $request->id_jadwal;
        $tanggal = $request->input('tanggal', now()->format('Y-m-d'));

        $jadwal = JadwalMengajar::with(['kelas', 'mapel'])->findOrFail($id_jadwal);
        $guruPeminta = $request->user()->guru;

        // Ambil semua guru aktif selain yang meminta
        $allGuru = Guru::where('status', 'Aktif')
            ->where('id_guru', '!=', $guruPeminta->id_guru)
            ->get();

        $hariJadwal = Carbon::parse($tanggal)->locale('id')->isoFormat('dddd');

        $guruFormatted = $allGuru->map(function ($g) use ($hariJadwal, $jadwal) {
            // Cek apakah guru ini ada jadwal di hari dan jam bersinggungan
            $konflik = JadwalMengajar::where('id_guru', $g->id_guru)
                ->where('hari', $hariJadwal)
                ->where(function ($q) use ($jadwal) {
                    $q->whereBetween('jam_mulai', [$jadwal->jam_mulai, $jadwal->jam_selesai])
                      ->orWhereBetween('jam_selesai', [$jadwal->jam_mulai, $jadwal->jam_selesai])
                      ->orWhere(function ($q2) use ($jadwal) {
                          $q2->where('jam_mulai', '<=', $jadwal->jam_mulai)
                             ->where('jam_selesai', '>=', $jadwal->jam_selesai);
                      });
                })->exists();

            return [
                'id_guru'       => $g->id_guru,
                'nama_lengkap'  => $g->nama_lengkap,
                'nip'           => $g->nip,
                'is_recommended' => !$konflik,
            ];
        });

        return Inertia::render('Guru/Pengganti/Ajukan', [
            'jadwal'   => $jadwal,
            'tanggal'  => $tanggal,
            'guruList' => $guruFormatted,
        ]);
    }

    /**
     * Simpan pengajuan guru pengganti.
     */
    public function store(Request $request)
    {
        $request->validate([
            'id_jadwal'    => 'required|exists:tbl_jadwal_mengajar,id_jadwal',
            'tanggal'      => 'required|date',
            'target_gurus' => 'required|array|min:1',
            'target_gurus.*' => 'exists:tbl_guru,id_guru',
            'keterangan'   => 'nullable|string',
        ]);

        $guruPeminta = $request->user()->guru;

        DB::beginTransaction();
        try {
            $pengajuan = PengajuanGuruPengganti::create([
                'id_jadwal'      => $request->id_jadwal,
                'tanggal'        => $request->tanggal,
                'id_guru_peminta' => $guruPeminta->id_guru,
                'keterangan'     => $request->keterangan,
                'status'         => 'pending',
            ]);

            foreach ($request->target_gurus as $id_guru_target) {
                PengajuanGuruTarget::create([
                    'id_pengajuan'   => $pengajuan->id_pengajuan,
                    'id_guru_target' => $id_guru_target,
                    'status'         => 'pending',
                ]);
            }

            DB::commit();
            return redirect()->route('guru.pengganti.riwayat')
                ->with('success', 'Pengajuan guru pengganti berhasil dikirim. Menunggu konfirmasi dari guru target.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal mengajukan: ' . $e->getMessage());
        }
    }

    /**
     * Tampilkan riwayat pengajuan yang dibuat oleh guru ini.
     */
    public function riwayat(Request $request)
    {
        $guru = $request->user()->guru;

        $pengajuan = PengajuanGuruPengganti::with([
            'jadwal.kelas',
            'jadwal.mapel',
            'guruPengganti',
            'admin',
            'targets.guru',
        ])
        ->where('id_guru_peminta', $guru->id_guru)
        ->orderBy('created_at', 'desc')
        ->paginate(15);

        return Inertia::render('Guru/Pengganti/Riwayat', [
            'pengajuan' => $pengajuan,
        ]);
    }

    /**
     * Tampilkan daftar permintaan mengajar (incoming) untuk guru ini sebagai target.
     */
    public function incomingRequests(Request $request)
    {
        $guru = $request->user()->guru;

        // Permintaan pending yang ditujukan ke guru ini
        $requests = PengajuanGuruTarget::with([
            'pengajuan',
            'pengajuan.jadwal.kelas',
            'pengajuan.jadwal.mapel',
            'pengajuan.guruPeminta',
            'pengajuan.admin',
        ])
        ->where('id_guru_target', $guru->id_guru)
        ->whereHas('pengajuan', function ($q) {
            $q->where('status', 'pending');
        })
        ->orderBy('created_at', 'desc')
        ->get();

        // Format relasi agar konsisten
        $requests = $requests->map(function ($r) {
            return [
                'id_target'    => $r->id_target,
                'id_pengajuan' => $r->pengajuan->id_pengajuan,
                'status'       => $r->status,
                'created_at'   => $r->created_at,
                'tanggal'      => $r->pengajuan->tanggal,
                'keterangan'   => $r->pengajuan->keterangan,
                'jadwal'       => $r->pengajuan->jadwal,
                'guru_peminta' => $r->pengajuan->guruPeminta,
            ];
        });

        return Inertia::render('Guru/Pengganti/Incoming', [
            'requests' => $requests,
        ]);
    }

    /**
     * Terima permintaan mengajar.
     */
    public function accept(Request $request, $id_pengajuan)
    {
        $guru = $request->user()->guru;

        DB::beginTransaction();
        try {
            $pengajuan = PengajuanGuruPengganti::findOrFail($id_pengajuan);

            if ($pengajuan->status !== 'pending') {
                return back()->with('error', 'Pengajuan ini sudah tidak tersedia (mungkin sudah diterima oleh guru lain).');
            }

            $target = PengajuanGuruTarget::where('id_pengajuan', $id_pengajuan)
                ->where('id_guru_target', $guru->id_guru)
                ->firstOrFail();

            // Set target current guru to accepted
            $target->update(['status' => 'accepted']);

            // Set target guru lain ke rejected
            PengajuanGuruTarget::where('id_pengajuan', $id_pengajuan)
                ->where('id_target', '!=', $target->id_target)
                ->update(['status' => 'rejected']);

            // Update status pengajuan utama
            $pengajuan->update([
                'status'            => 'accepted',
                'id_guru_pengganti' => $guru->id_guru,
            ]);

            DB::commit();
            return back()->with('success', 'Permintaan mengajar berhasil diterima. Jadwal ini kini ada di daftar Anda.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal menerima permintaan: ' . $e->getMessage());
        }
    }

    /**
     * Tolak permintaan mengajar (guru menolak, tidak mau menggantikan).
     */
    public function reject(Request $request, $id_pengajuan)
    {
        $guru = $request->user()->guru;

        DB::beginTransaction();
        try {
            $pengajuan = PengajuanGuruPengganti::findOrFail($id_pengajuan);

            if ($pengajuan->status !== 'pending') {
                return back()->with('error', 'Pengajuan ini sudah tidak berstatus pending.');
            }

            $target = PengajuanGuruTarget::where('id_pengajuan', $id_pengajuan)
                ->where('id_guru_target', $guru->id_guru)
                ->firstOrFail();

            $target->update(['status' => 'rejected']);

            // Cek apakah semua target sudah rejected — jika iya, tutup pengajuan
            $masihAdaPending = PengajuanGuruTarget::where('id_pengajuan', $id_pengajuan)
                ->where('status', 'pending')
                ->exists();

            if (!$masihAdaPending) {
                $pengajuan->update(['status' => 'closed']);
            }

            DB::commit();
            return back()->with('success', 'Permintaan berhasil ditolak.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal menolak permintaan: ' . $e->getMessage());
        }
    }
}
