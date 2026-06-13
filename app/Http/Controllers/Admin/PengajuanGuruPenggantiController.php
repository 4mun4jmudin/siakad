<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Guru;
use App\Models\JadwalMengajar;
use App\Models\PengajuanGuruPengganti;
use App\Models\PengajuanGuruTarget;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PengajuanGuruPenggantiController extends Controller
{
    /**
     * Tampilkan semua pengajuan guru pengganti (untuk admin monitor).
     */
    public function index(Request $request)
    {
        $query = PengajuanGuruPengganti::with([
            'jadwal.kelas',
            'jadwal.mapel',
            'guruPeminta',
            'guruPengganti',
            'admin',
            'targets.guru'
        ]);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('guruPeminta', fn($g) => $g->where('nama_lengkap', 'like', "%{$search}%"))
                    ->orWhereHas('jadwal.mapel', fn($m) => $m->where('nama_mapel', 'like', "%{$search}%"))
                    ->orWhereHas('jadwal.kelas', fn($k) => $k->where('nama_kelas', 'like', "%{$search}%"));
            });
        }

        $pengajuan = $query->orderBy('created_at', 'desc')->paginate(20)->withQueryString();

        // Stats summary
        $stats = [
            'total' => PengajuanGuruPengganti::count(),
            'pending' => PengajuanGuruPengganti::where('status', 'pending')->count(),
            'accepted' => PengajuanGuruPengganti::where('status', 'accepted')->count(),
            'closed' => PengajuanGuruPengganti::where('status', 'closed')->count(),
        ];

        return Inertia::render('admin/PengajuanGuru/Index', [
            'pengajuan' => $pengajuan,
            'stats' => $stats,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    /**
     * Tampilkan detail pengajuan satu.
     */
    public function show($id)
    {
        $pengajuan = PengajuanGuruPengganti::with([
            'jadwal.kelas',
            'jadwal.mapel',
            'guruPeminta',
            'guruPengganti',
            'admin',
            'targets.guru'
        ])->findOrFail($id);

        return Inertia::render('admin/PengajuanGuru/Show', [
            'pengajuan' => $pengajuan,
        ]);
    }

    /**
     * Admin memaksa menutup/menolak pengajuan (status = closed).
     */
    public function close(Request $request, $id)
    {
        $pengajuan = PengajuanGuruPengganti::with('targets')->findOrFail($id);

        DB::beginTransaction();
        try {
            // Reject semua target yang masih pending
            $pengajuan->targets()->where('status', 'pending')->update(['status' => 'rejected']);

            $pengajuan->update([
                'status' => 'closed',
                'id_admin' => $request->user()->id_pengguna ?? $request->user()->id,
            ]);

            DB::commit();
            return back()->with('success', 'Pengajuan berhasil ditutup oleh admin.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal menutup pengajuan: ' . $e->getMessage());
        }
    }

    /**
     * Admin menugaskan (assign) guru pengganti secara langsung.
     */
    public function assign(Request $request, $id)
    {
        $request->validate([
            'id_guru_pengganti' => 'required|exists:tbl_guru,id_guru',
        ]);

        $pengajuan = PengajuanGuruPengganti::with('targets')->findOrFail($id);

        DB::beginTransaction();
        try {
            // Reject semua target
            $pengajuan->targets()->update(['status' => 'rejected']);

            // Set target yang dipilih admin ke accepted (atau buat baru jika tidak ada)
            $target = PengajuanGuruTarget::firstOrCreate(
                [
                    'id_pengajuan' => $pengajuan->id_pengajuan,
                    'id_guru_target' => $request->id_guru_pengganti,
                ],
                ['status' => 'accepted']
            );
            $target->update(['status' => 'accepted']);

            // Update pengajuan utama
            $pengajuan->update([
                'status' => 'accepted',
                'id_guru_pengganti' => $request->id_guru_pengganti,
                'id_admin' => $request->user()->id_pengguna ?? $request->user()->id,
            ]);

            DB::commit();
            return back()->with('success', 'Guru pengganti berhasil ditugaskan oleh admin.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal menugaskan guru: ' . $e->getMessage());
        }
    }

    /**
     * Hapus pengajuan.
     */
    public function destroy($id)
    {
        $pengajuan = PengajuanGuruPengganti::findOrFail($id);
        $pengajuan->delete();

        return back()->with('success', 'Pengajuan berhasil dihapus.');
    }
}
