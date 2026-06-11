<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Kelas;
use App\Models\Guru;
use App\Models\MataPelajaran;
use App\Models\JadwalMengajar;
use App\Models\TahunAjaran;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class JadwalInteractiveController extends Controller
{
    /**
     * Menampilkan halaman Drag & Drop.
     */
    public function index()
    {
        $tahunAjaranAktif = TahunAjaran::where('status', 'Aktif')->first();

        // Mapel dengan default gurunya
        $mapels = MataPelajaran::with('guruDefault:id_guru,nama_lengkap')
            ->where('status', 'Aktif')
            ->orderBy('nama_mapel')
            ->get();

        $pengaturan = \App\Models\Pengaturan::first();

        return Inertia::render('admin/JadwalMengajar/Interactive', [
            'kelasOptions' => Kelas::orderBy('tingkat')->get(),
            'guruOptions' => Guru::where('status', 'Aktif')->orderBy('nama_lengkap')->get(),
            'mapels' => $mapels,
            'tahunAjaranAktif' => $tahunAjaranAktif,
            'pengaturan' => $pengaturan
        ]);
    }

    /**
     * Mengambil data jadwal untuk satu kelas (dipanggil via API / reload)
     */
    public function fetchClassData(Request $request)
    {
        $request->validate([
            'id_kelas' => 'required|exists:tbl_kelas,id_kelas'
        ]);

        $tahunAjaranAktif = TahunAjaran::where('status', 'Aktif')->first();

        $jadwal = JadwalMengajar::with(['guru:id_guru,nama_lengkap', 'mapel:id_mapel,nama_mapel'])
            ->where('id_kelas', $request->id_kelas)
            ->when($tahunAjaranAktif, function($q) use ($tahunAjaranAktif) {
                return $q->where('id_tahun_ajaran', $tahunAjaranAktif->id_tahun_ajaran);
            })
            ->get();

        return response()->json([
            'jadwal' => $jadwal
        ]);
    }

    /**
     * API Drag & Drop
     */
    public function storeDragDrop(Request $request)
    {
        $request->validate([
            'id_kelas' => 'required|exists:tbl_kelas,id_kelas',
            'id_mapel' => 'required|exists:tbl_mata_pelajaran,id_mapel',
            'id_guru' => 'required|exists:tbl_guru,id_guru',
            'hari' => 'required|string',
            'jam_mulai' => 'required|date_format:H:i',
            'jam_selesai' => 'required|date_format:H:i|after:jam_mulai',
            'id_jadwal' => 'nullable|string' // Jika update jadwal yg di-drag ulang
        ]);

        $tahunAjaranAktif = TahunAjaran::where('status', 'Aktif')->first();
        if (!$tahunAjaranAktif) {
            return response()->json(['message' => 'Tahun Ajaran Aktif tidak ditemukan.'], 400);
        }

        try {
            // Cek Bentrok
            $this->validateConflict([
                'id_tahun_ajaran' => $tahunAjaranAktif->id_tahun_ajaran,
                'id_kelas' => $request->id_kelas,
                'id_mapel' => $request->id_mapel,
                'id_guru' => $request->id_guru,
                'hari' => $request->hari,
                'jam_mulai' => $request->jam_mulai,
                'jam_selesai' => $request->jam_selesai
            ], $request->id_jadwal);

            if ($request->id_jadwal) {
                // Update
                $jadwal = JadwalMengajar::where('id_jadwal', $request->id_jadwal)->firstOrFail();
                $jadwal->update([
                    'hari' => $request->hari,
                    'jam_mulai' => $request->jam_mulai,
                    'jam_selesai' => $request->jam_selesai,
                    'id_guru' => $request->id_guru
                ]);
            } else {
                // Create
                $id_jadwal = 'JDW-' . now()->format('ymdHis') . Str::random(4);
                $jadwal = JadwalMengajar::create([
                    'id_jadwal' => $id_jadwal,
                    'id_tahun_ajaran' => $tahunAjaranAktif->id_tahun_ajaran,
                    'id_kelas' => $request->id_kelas,
                    'id_mapel' => $request->id_mapel,
                    'id_guru' => $request->id_guru,
                    'hari' => $request->hari,
                    'jam_mulai' => $request->jam_mulai,
                    'jam_selesai' => $request->jam_selesai
                ]);
            }

            return response()->json([
                'message' => 'Jadwal berhasil disimpan.',
                'jadwal' => $jadwal->load(['guru:id_guru,nama_lengkap', 'mapel:id_mapel,nama_mapel'])
            ]);

        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /**
     * API Ganti Guru (Tukar Jadwal)
     */
    public function updateTeacher(Request $request)
    {
        $request->validate([
            'id_jadwal' => 'required|exists:tbl_jadwal_mengajar,id_jadwal',
            'id_guru' => 'required|exists:tbl_guru,id_guru'
        ]);

        $jadwal = JadwalMengajar::findOrFail($request->id_jadwal);

        try {
            // Cek Bentrok untuk guru baru
            $this->validateConflict([
                'id_tahun_ajaran' => $jadwal->id_tahun_ajaran,
                'id_kelas' => $jadwal->id_kelas,
                'id_mapel' => $jadwal->id_mapel,
                'id_guru' => $request->id_guru,
                'hari' => $jadwal->hari,
                'jam_mulai' => $jadwal->jam_mulai,
                'jam_selesai' => $jadwal->jam_selesai
            ], $jadwal->id_jadwal);

            $jadwal->update(['id_guru' => $request->id_guru]);

            return response()->json([
                'message' => 'Guru pengampu berhasil diubah.',
                'jadwal' => $jadwal->load(['guru:id_guru,nama_lengkap', 'mapel:id_mapel,nama_mapel'])
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function deleteSchedule($id)
    {
        JadwalMengajar::where('id_jadwal', $id)->delete();
        return response()->json(['message' => 'Jadwal dihapus.']);
    }

    /**
     * Auto Schedule Algorithm
     */
    public function autoSchedule(Request $request)
    {
        $tahunAjaranAktif = TahunAjaran::where('status', 'Aktif')->first();
        if (!$tahunAjaranAktif) {
            return response()->json(['message' => 'Tahun Ajaran Aktif tidak ditemukan.'], 400);
        }

        $pengaturan = \App\Models\Pengaturan::first();
        $days = $pengaturan->jadwal_hari ?? ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        $waktu = $pengaturan->jadwal_waktu ?? [];
        
        // Hanya ambil blok waktu pelajaran
        $slots = collect($waktu)
            ->filter(function($w) {
                return isset($w['type']) && $w['type'] === 'pelajaran';
            })
            ->map(function($w) {
                return [
                    'start' => $w['start'],
                    'end' => $w['end']
                ];
            })
            ->values()
            ->toArray();

        if (empty($slots)) {
            return response()->json(['message' => 'Blok jam pelajaran belum diatur di Pengaturan.'], 400);
        }

        $classes = Kelas::all();
        $mapels = MataPelajaran::whereNotNull('id_guru_default')
            ->where('status', 'Aktif')
            ->get();

        $createdCount = 0;

        foreach ($classes as $kelas) {
            foreach ($mapels as $mapel) {
                // Cek apakah mapel ini sudah dijadwalkan di kelas ini
                $existing = JadwalMengajar::where('id_tahun_ajaran', $tahunAjaranAktif->id_tahun_ajaran)
                    ->where('id_kelas', $kelas->id_kelas)
                    ->where('id_mapel', $mapel->id_mapel)
                    ->exists();

                if ($existing) continue;

                // Cari slot kosong di kelas ini dan guru ini tidak bentrok
                $scheduled = false;
                foreach ($days as $day) {
                    if ($scheduled) break;
                    foreach ($slots as $slot) {
                        try {
                            $this->validateConflict([
                                'id_tahun_ajaran' => $tahunAjaranAktif->id_tahun_ajaran,
                                'id_kelas' => $kelas->id_kelas,
                                'id_mapel' => $mapel->id_mapel,
                                'id_guru' => $mapel->id_guru_default,
                                'hari' => $day,
                                'jam_mulai' => $slot['start'],
                                'jam_selesai' => $slot['end']
                            ]);
                            
                            // Jika lolos validasi (tidak ada exception), simpan jadwal
                            $id_jadwal = 'JDW-' . now()->format('ymdHis') . Str::random(4);
                            JadwalMengajar::create([
                                'id_jadwal' => $id_jadwal,
                                'id_tahun_ajaran' => $tahunAjaranAktif->id_tahun_ajaran,
                                'id_kelas' => $kelas->id_kelas,
                                'id_mapel' => $mapel->id_mapel,
                                'id_guru' => $mapel->id_guru_default,
                                'hari' => $day,
                                'jam_mulai' => $slot['start'],
                                'jam_selesai' => $slot['end']
                            ]);

                            $scheduled = true;
                            $createdCount++;
                            break;
                        } catch (\Exception $e) {
                            // Bentrok, lanjut ke slot berikutnya
                            continue;
                        }
                    }
                }
            }
        }

        return response()->json([
            'message' => "Auto-Schedule selesai. $createdCount jadwal baru berhasil dibuat."
        ]);
    }

    private function validateConflict($data, $ignoreId = null)
    {
        $query = JadwalMengajar::where('id_tahun_ajaran', $data['id_tahun_ajaran'])
            ->where('hari', $data['hari'])
            ->where(function ($q) use ($data) {
                $q->where(function ($sq) use ($data) {
                    $sq->where('jam_mulai', '<', $data['jam_selesai'])
                        ->where('jam_selesai', '>', $data['jam_mulai']);
                });
            });

        if ($ignoreId) {
            $query->where('id_jadwal', '!=', $ignoreId);
        }

        // Cek konflik di kelas yang sama
        $kelasConflict = (clone $query)->where('id_kelas', $data['id_kelas'])->first();
        if ($kelasConflict) {
            throw new \Exception('Jadwal bentrok! Sudah ada pelajaran lain di kelas ini pada jam tersebut.');
        }

        // Cek konflik untuk guru yang sama
        $guruConflict = (clone $query)->where('id_guru', $data['id_guru'])->first();
        if ($guruConflict) {
            throw new \Exception('Jadwal bentrok! Guru tersebut sudah mengajar di kelas lain pada jam ini.');
        }
    }

    /**
     * API Get Recommendations for Empty Slot
     */
    public function getRecommendations(Request $request)
    {
        $request->validate([
            'id_kelas' => 'required|exists:tbl_kelas,id_kelas',
            'hari' => 'required|string',
            'jam_mulai' => 'required|date_format:H:i',
            'jam_selesai' => 'required|date_format:H:i'
        ]);

        $tahunAjaranAktif = TahunAjaran::where('status', 'Aktif')->first();
        if (!$tahunAjaranAktif) {
            return response()->json(['message' => 'Tahun Ajaran Aktif tidak ditemukan.'], 400);
        }

        // Cari daftar guru yang sedang mengajar di HARI dan JAM tersebut
        $busyTeacherIds = JadwalMengajar::where('id_tahun_ajaran', $tahunAjaranAktif->id_tahun_ajaran)
            ->where('hari', $request->hari)
            ->where(function ($q) use ($request) {
                 $q->where('jam_mulai', '<', $request->jam_selesai)
                   ->where('jam_selesai', '>', $request->jam_mulai);
            })
            ->pluck('id_guru')
            ->toArray();

        // Cari Mapel yang memiliki guru default, DAN guru tersebut tidak sedang sibuk
        $recommendedMapels = MataPelajaran::with('guruDefault:id_guru,nama_lengkap')
            ->where('status', 'Aktif')
            ->whereNotNull('id_guru_default')
            ->whereNotIn('id_guru_default', $busyTeacherIds)
            ->orderBy('nama_mapel')
            ->get();

        return response()->json([
            'recommendations' => $recommendedMapels
        ]);
    }
}
