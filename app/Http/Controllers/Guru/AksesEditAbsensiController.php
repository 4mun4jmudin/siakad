<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use App\Models\AksesEditAbsensi;
use App\Models\JadwalMengajar;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AksesEditAbsensiController extends Controller
{
    /**
     * Tampilkan halaman histori dan form pengajuan akses edit absensi.
     */
    public function index()
    {
        $guru = Auth::user()->guru;
        if (!$guru) abort(403, 'Akses ditolak.');

        // Ambil histori pengajuan
        $pengajuan = AksesEditAbsensi::with(['jadwal.kelas', 'jadwal.mataPelajaran'])
            ->where('id_guru', $guru->id_guru)
            ->orderBy('created_at', 'desc')
            ->get();

        // Ambil jadwal mengajar untuk dropdown
        $jadwalOptions = JadwalMengajar::with(['kelas', 'mataPelajaran'])
            ->where('id_guru', $guru->id_guru)
            ->get();

        return Inertia::render('Guru/Absensi/AksesEdit', [
            'pengajuan' => $pengajuan,
            'jadwalOptions' => $jadwalOptions,
        ]);
    }

    /**
     * Simpan pengajuan baru.
     */
    public function store(Request $request)
    {
        $guru = Auth::user()->guru;
        if (!$guru) abort(403, 'Akses ditolak.');

        $request->validate([
            'id_jadwal' => 'required|string|exists:tbl_jadwal_mengajar,id_jadwal',
            'tanggal_absensi' => 'required|date|before_or_equal:today',
            'alasan' => 'required|string|max:500',
        ]);

        $tz = config('app.timezone', 'Asia/Jakarta');
        $tanggal = Carbon::parse($request->tanggal_absensi, $tz)->toDateString();

        // Cek kepemilikan jadwal
        $jadwal = JadwalMengajar::findOrFail($request->id_jadwal);
        if ($jadwal->id_guru !== $guru->id_guru) {
            return back()->with('error', 'Anda tidak berhak mengajukan akses untuk jadwal ini.');
        }

        // Cek batas 30 hari ke belakang
        $maxPast = Carbon::now($tz)->subDays(30)->toDateString();
        if ($tanggal < $maxPast) {
            return back()->with('error', 'Hanya dapat mengajukan maksimal 30 hari ke belakang.');
        }

        // Cek apakah masih dalam batas waktu normal (tidak perlu pengajuan)
        $jamSelesai = $jadwal->jam_selesai ?? '23:59:59';
        $deadline = Carbon::parse($tanggal . ' ' . $jamSelesai, $tz)->addHours(24);
        if (Carbon::now($tz)->lte($deadline)) {
            return back()->with('warning', 'Absensi untuk tanggal ini masih bisa diedit secara langsung (belum lewat 24 jam).');
        }

        // Cek apakah ada pengajuan aktif atau masih pending untuk konteks ini
        $existing = AksesEditAbsensi::forContext($guru->id_guru, $jadwal->id_jadwal, $tanggal)
            ->whereIn('status', ['Diajukan', 'Disetujui'])
            ->get();

        $hasPending = $existing->where('status', 'Diajukan')->first();
        if ($hasPending) {
            return back()->with('error', 'Anda sudah memiliki pengajuan yang belum diproses untuk jadwal dan tanggal ini.');
        }

        $hasActive = $existing->filter(fn($e) => $e->isAktif())->first();
        if ($hasActive) {
            return back()->with('error', 'Anda sudah memiliki akses edit yang sedang aktif untuk jadwal dan tanggal ini.');
        }

        AksesEditAbsensi::create([
            'id_guru' => $guru->id_guru,
            'id_jadwal' => $jadwal->id_jadwal,
            'tanggal_absensi' => $tanggal,
            'alasan' => $request->alasan,
            'status' => 'Diajukan',
        ]);

        return back()->with('success', 'Pengajuan akses edit berhasil dikirim. Menunggu persetujuan admin.');
    }
}
