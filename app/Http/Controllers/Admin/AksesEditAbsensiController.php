<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AksesEditAbsensi;
use App\Models\Notification;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Str;

class AksesEditAbsensiController extends Controller
{
    /**
     * Tampilkan halaman kelola pengajuan akses edit absensi.
     */
    public function index(Request $request)
    {
        $status = $request->input('status', 'Semua');

        $query = AksesEditAbsensi::with(['guru', 'jadwal.kelas', 'jadwal.mataPelajaran', 'approvedBy']);

        if ($status !== 'Semua') {
            $query->where('status', $status);
        }

        $pengajuan = $query->orderBy('created_at', 'desc')->get();

        return Inertia::render('Admin/AksesEditAbsensi/Index', [
            'pengajuan' => $pengajuan,
            'filters' => ['status' => $status],
        ]);
    }

    /**
     * Setujui pengajuan akses edit.
     */
    public function approve($id)
    {
        $pengajuan = AksesEditAbsensi::with('guru')->findOrFail($id);

        if ($pengajuan->status !== 'Diajukan') {
            return back()->with('error', 'Hanya pengajuan dengan status Diajukan yang dapat disetujui.');
        }

        $now = Carbon::now();
        $pengajuan->update([
            'status' => 'Disetujui',
            'disetujui_oleh' => Auth::user()->id_pengguna,
            'disetujui_pada' => $now,
            'expired_at' => (clone $now)->addHours(24),
        ]);

        // Kirim notifikasi ke Guru
        $this->kirimNotifikasi(
            $pengajuan->guru->id_pengguna,
            "Pengajuan Akses Edit Absensi Disetujui",
            "Akses edit untuk jadwal {$pengajuan->jadwal->mataPelajaran->nama_mapel} kelas {$pengajuan->jadwal->kelas->nama_kelas} tanggal {$pengajuan->tanggal_absensi->format('d/m/Y')} telah disetujui. Akses berlaku selama 24 jam."
        );

        return back()->with('success', 'Pengajuan berhasil disetujui. Akses terbuka selama 24 jam.');
    }

    /**
     * Tolak pengajuan akses edit.
     */
    public function reject(Request $request, $id)
    {
        $request->validate([
            'catatan_admin' => 'required|string|max:500',
        ]);

        $pengajuan = AksesEditAbsensi::with('guru')->findOrFail($id);

        if ($pengajuan->status !== 'Diajukan') {
            return back()->with('error', 'Hanya pengajuan dengan status Diajukan yang dapat ditolak.');
        }

        $pengajuan->update([
            'status' => 'Ditolak',
            'catatan_admin' => $request->catatan_admin,
        ]);

        // Kirim notifikasi ke Guru
        $this->kirimNotifikasi(
            $pengajuan->guru->id_pengguna,
            "Pengajuan Akses Edit Absensi Ditolak",
            "Pengajuan edit absensi Anda ditolak. Catatan: {$request->catatan_admin}. Silakan hubungi admin secara langsung."
        );

        return back()->with('success', 'Pengajuan berhasil ditolak.');
    }

    private function kirimNotifikasi($idPengguna, $judul, $deskripsi)
    {
        Notification::create([
            'id' => Str::uuid()->toString(),
            'type' => 'App\Notifications\AksesEditAbsensi',
            'notifiable_type' => 'App\Models\User',
            'notifiable_id' => $idPengguna,
            'data' => [
                'message' => $judul,
                'description' => $deskripsi,
            ],
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
