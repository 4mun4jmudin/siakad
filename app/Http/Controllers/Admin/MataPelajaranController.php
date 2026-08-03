<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MataPelajaran;
use App\Models\Siswa;
use App\Models\Guru;
use App\Models\Kelas;
use App\Models\JadwalMengajar;
use App\Models\TahunAjaran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rule;

class MataPelajaranController extends Controller
{
    /**
     * Menampilkan halaman utama manajemen mata pelajaran dengan UI baru.
     */
    public function index(Request $request)
    {
        // 1. Mengambil data untuk kartu statistik
        $stats = [
            'totalMapel' => MataPelajaran::count(),
            'mapelWajib' => MataPelajaran::where('kategori', 'Wajib')->count(),
            'mapelPeminatan' => MataPelajaran::where('kategori', 'Peminatan')->count(),
            'totalSiswa' => Siswa::where('status', 'Aktif')->count(),
        ];

        $perPage = $request->input('per_page', 10);
        $paginationLimit = $perPage === 'all' ? 9999 : (int) $perPage;

        // 2. Mengambil data untuk tabel utama
        $mataPelajaran = MataPelajaran::query()
            ->with([
                'jadwalMengajar' => function ($query) {
                    $query->with([
                        'guru:id_guru,nama_lengkap',
                        'kelas' => function ($q) {
                            $q->withCount('siswa')->select('id_kelas', 'tingkat', 'jurusan');
                        }
                    ])
                        ->select('id_jadwal', 'id_mapel', 'id_guru', 'id_kelas');
                }
            ])
            ->when($request->input('search'), function ($query, $search) {
                $query->where('nama_mapel', 'like', "%{$search}%")
                    ->orWhere('id_mapel', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate($paginationLimit)
            ->withQueryString()
            ->through(function ($mapel) {
                $guruPengampu = $mapel->jadwalMengajar->pluck('guru')->filter()->unique('id_guru')->values();
                $kelasDiajar = $mapel->jadwalMengajar->pluck('kelas')->filter()->unique('id_kelas')->values();

                $totalSiswaMapel = $kelasDiajar->sum('siswa_count');

                return [
                    'id_mapel' => $mapel->id_mapel,
                    'nama_mapel' => $mapel->nama_mapel,
                    'kategori' => $mapel->kategori,
                    'kkm' => $mapel->kkm,
                    'status' => $mapel->status, // Mengirim status ke frontend
                    'jumlah_jp' => $mapel->jumlah_jp, // Mengirim JP ke frontend
                    'guru_pengampu' => $guruPengampu,
                    'kelas_diajar' => $kelasDiajar,
                    'total_siswa_mapel' => $totalSiswaMapel,
                ];
            });

        // 3. Mengambil data untuk kartu "Guru Pengampu"
        $guruPengampuList = Guru::whereHas('jadwalMengajar')
            ->withCount('jadwalMengajar as jumlah_mapel')
            ->get(['id_guru', 'nama_lengkap']);

        return Inertia::render('admin/MataPelajaran/Index', [
            'stats' => $stats,
            'mataPelajaran' => $mataPelajaran,
            'guruPengampuList' => $guruPengampuList,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    /**
     * Menampilkan form untuk membuat mata pelajaran baru.
     */
    public function create()
    {
        $gurus = Guru::where('status', 'Aktif')->get(['id_guru', 'nama_lengkap']);
        $kelasList = Kelas::get(['id_kelas', 'tingkat', 'jurusan']);

        return Inertia::render('admin/MataPelajaran/Create', [
            'gurus' => $gurus,
            'kelasList' => $kelasList,
        ]);
    }

    /**
     * Menyimpan mata pelajaran baru, termasuk status dan JP.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nama_mapel' => ['required', 'string', 'max:100', Rule::unique('tbl_mata_pelajaran', 'nama_mapel')->whereNull('deleted_at')],
            'kategori' => 'required|string|max:50',
            'id_guru_default' => 'nullable|exists:tbl_guru,id_guru',
            'kkm' => 'required|integer|min:0|max:100',
            'status' => 'required|string|in:Aktif,Tidak Aktif',
            'jumlah_jp' => 'required|integer|min:1',
            'jadwal' => 'present|array',
            'jadwal.*.id_guru' => 'required|exists:tbl_guru,id_guru',
            'jadwal.*.id_kelas' => 'required|exists:tbl_kelas,id_kelas',
            'jadwal.*.hari' => 'required|string',
            'jadwal.*.jam_mulai' => 'required',
            'jadwal.*.jam_selesai' => 'required|after:jadwal.*.jam_mulai',
        ]);

        $this->validateScheduleClashes($request->jadwal);

        DB::transaction(function () use ($request) {
            $id_mapel = strtoupper(substr($request->nama_mapel, 0, 3)) . rand(10, 99);
            while (MataPelajaran::where('id_mapel', $id_mapel)->exists()) {
                $id_mapel = strtoupper(substr($request->nama_mapel, 0, 3)) . rand(100, 999);
            }
            $mapel = MataPelajaran::create([
                'id_mapel' => $id_mapel,
                'nama_mapel' => $request->nama_mapel,
                'kategori' => $request->kategori,
                'id_guru_default' => $request->id_guru_default,
                'kkm' => $request->kkm,
                'status' => $request->status,         // <-- Simpan data baru
                'jumlah_jp' => $request->jumlah_jp,   // <-- Simpan data baru
            ]);

            $tahunAjaranAktif = TahunAjaran::where('status', 'Aktif')->firstOrFail();

            foreach ($request->jadwal as $jadwalData) {
                JadwalMengajar::create([
                    'id_jadwal' => 'J' . time() . rand(100, 999),
                    'id_tahun_ajaran' => $tahunAjaranAktif->id_tahun_ajaran,
                    'id_mapel' => $mapel->id_mapel,
                    'id_guru' => $jadwalData['id_guru'],
                    'id_kelas' => $jadwalData['id_kelas'],
                    'hari' => $jadwalData['hari'],
                    'jam_mulai' => $jadwalData['jam_mulai'],
                    'jam_selesai' => $jadwalData['jam_selesai'],
                ]);
            }
        });

        return to_route('admin.mata-pelajaran.index')->with('success', 'Mata Pelajaran dan jadwalnya berhasil ditambahkan.');
    }

    /**
     * Menampilkan form untuk mengedit mata pelajaran.
     */
    public function edit(MataPelajaran $mataPelajaran)
    {
        $mataPelajaran->load('jadwalMengajar');
        $gurus = Guru::where('status', 'Aktif')->get(['id_guru', 'nama_lengkap']);
        $kelasList = Kelas::get(['id_kelas', 'tingkat', 'jurusan']);

        return Inertia::render('admin/MataPelajaran/Edit', [
            'mataPelajaran' => $mataPelajaran,
            'gurus' => $gurus,
            'kelasList' => $kelasList,
        ]);
    }

    /**
     * Mengupdate mata pelajaran, termasuk status dan JP.
     */
    public function update(Request $request, MataPelajaran $mataPelajaran)
    {
        $request->validate([
            'nama_mapel' => [
                'required',
                'string',
                'max:100',
                function ($attribute, $value, $fail) use ($mataPelajaran) {
                    $exists = MataPelajaran::where('nama_mapel', $value)
                        ->where('id_mapel', '!=', $mataPelajaran->id_mapel)
                        ->exists();
                    if ($exists) {
                        $fail('The ' . $attribute . ' has already been taken.');
                    }
                }
            ],
            'kategori' => 'required|string|max:50',
            'id_guru_default' => 'nullable|exists:tbl_guru,id_guru',
            'kkm' => 'required|integer|min:0|max:100',
            'status' => 'required|string|in:Aktif,Tidak Aktif', // <-- Validasi baru
            'jumlah_jp' => 'required|integer|min:1',           // <-- Validasi baru
            'jadwal' => 'present|array',
            'jadwal.*.id_guru' => 'required|exists:tbl_guru,id_guru',
            'jadwal.*.id_kelas' => 'required|exists:tbl_kelas,id_kelas',
            'jadwal.*.hari' => 'required|string',
            'jadwal.*.jam_mulai' => 'required',
            'jadwal.*.jam_selesai' => 'required|after:jadwal.*.jam_mulai',
        ]);

        $this->validateScheduleClashes($request->jadwal, $mataPelajaran->id_mapel);

        DB::transaction(function () use ($request, $mataPelajaran) {
            // 1. Update Mata Pelajaran
            $mataPelajaran->update($request->only('nama_mapel', 'kategori', 'id_guru_default', 'kkm', 'status', 'jumlah_jp')); // <-- Tambahkan field baru

            // 2. Sinkronisasi Jadwal Mengajar
            $tahunAjaranAktif = TahunAjaran::where('status', 'Aktif')->firstOrFail();

            JadwalMengajar::where('id_mapel', $mataPelajaran->id_mapel)
                ->where('id_tahun_ajaran', $tahunAjaranAktif->id_tahun_ajaran)
                ->delete();

            foreach ($request->jadwal as $jadwalData) {
                JadwalMengajar::create([
                    'id_jadwal' => 'J' . time() . rand(100, 999),
                    'id_tahun_ajaran' => $tahunAjaranAktif->id_tahun_ajaran,
                    'id_mapel' => $mataPelajaran->id_mapel,
                    'id_guru' => $jadwalData['id_guru'],
                    'id_kelas' => $jadwalData['id_kelas'],
                    'hari' => $jadwalData['hari'],
                    'jam_mulai' => $jadwalData['jam_mulai'],
                    'jam_selesai' => $jadwalData['jam_selesai'],
                ]);
            }
        });

        return to_route('admin.mata-pelajaran.index')->with('success', 'Mata Pelajaran dan jadwalnya berhasil diperbarui.');
    }
    public function show(MataPelajaran $mataPelajaran)
    {
        // Eager load relasi jadwal mengajar beserta guru dan kelasnya
        $mataPelajaran->load(['jadwalMengajar.guru', 'jadwalMengajar.kelas.siswa']);

        // Mengolah data untuk statistik detail
        $guruIds = $mataPelajaran->jadwalMengajar->pluck('id_guru')->unique();
        $kelasIds = $mataPelajaran->jadwalMengajar->pluck('id_kelas')->unique();
        $totalSiswa = $mataPelajaran->jadwalMengajar->pluck('kelas')->filter()->unique()->flatMap->siswa->count();

        $detailStats = [
            'jumlahGuru' => $guruIds->count(),
            'jumlahKelas' => $kelasIds->count(),
            'totalSiswa' => $totalSiswa,
        ];

        return Inertia::render('admin/MataPelajaran/Show', [
            'mataPelajaran' => $mataPelajaran,
            'detailStats' => $detailStats,
        ]);
    }

    private function validateScheduleClashes(array $schedules, ?string $excludeMapelId = null)
    {
        // Ambil tahun ajaran aktif untuk scope validasi
        $tahunAjaranAktif = TahunAjaran::where('status', 'Aktif')->first();
        $idTahunAjaran = $tahunAjaranAktif?->id_tahun_ajaran;

        // ============================================================
        // ATURAN 4: Cek bentrok INTERNAL (antar-baris dalam 1 form)
        // ============================================================
        foreach ($schedules as $i => $a) {
            for ($j = $i + 1; $j < count($schedules); $j++) {
                $b = $schedules[$j];

                // Lewati jika hari berbeda — pasti tidak bentrok
                if ($a['hari'] !== $b['hari'])
                    continue;

                // Cek overlap waktu
                $isOverlap = $a['jam_mulai'] < $b['jam_selesai'] && $a['jam_selesai'] > $b['jam_mulai'];
                if (!$isOverlap)
                    continue;

                // Bentrok Guru internal
                if ($a['id_guru'] === $b['id_guru']) {
                    $guru = Guru::find($a['id_guru']);
                    if (!str_contains(strtolower($guru->nama_lengkap ?? ''), 'pembina')) {
                        throw ValidationException::withMessages([
                            'jadwal' => "Bentrok Internal (Baris " . ($i + 1) . " & " . ($j + 1) . "): Guru {$guru->nama_lengkap} dijadwalkan di waktu yang sama pada hari {$a['hari']}."
                        ]);
                    }
                }

                // Bentrok Kelas internal
                if ($a['id_kelas'] === $b['id_kelas']) {
                    $kelas = Kelas::find($a['id_kelas']);
                    throw ValidationException::withMessages([
                        'jadwal' => "Bentrok Internal (Baris " . ($i + 1) . " & " . ($j + 1) . "): Kelas {$kelas->tingkat}-{$kelas->jurusan} dijadwalkan di waktu yang sama pada hari {$a['hari']}."
                    ]);
                }
            }
        }

        // ============================================================
        // ATURAN 1, 2, 3: Cek bentrok terhadap DATABASE
        // Scope hanya ke TAHUN AJARAN AKTIF
        // ============================================================
        foreach ($schedules as $index => $schedule) {
            $hari = $schedule['hari'];
            $jamMulai = $schedule['jam_mulai'];
            $jamSelesai = $schedule['jam_selesai'];
            $idGuru = $schedule['id_guru'];
            $idKelas = $schedule['id_kelas'];

            // --- ATURAN 1: Cek bentrok pada GURU ---
            $teacherClash = JadwalMengajar::where('id_guru', $idGuru)
                ->where('hari', $hari)
                ->where(function ($query) use ($jamMulai, $jamSelesai) {
                    $query->where('jam_mulai', '<', $jamSelesai)
                        ->where('jam_selesai', '>', $jamMulai);
                })
                ->when($idTahunAjaran, function ($query) use ($idTahunAjaran) {
                    $query->where('id_tahun_ajaran', $idTahunAjaran);
                })
                ->when($excludeMapelId, function ($query) use ($excludeMapelId) {
                    $query->where('id_mapel', '!=', $excludeMapelId);
                })
                ->first();

            if ($teacherClash) {
                $guru = Guru::find($idGuru);
                if (!str_contains(strtolower($guru->nama_lengkap ?? ''), 'pembina')) {
                    $mapelBentrok = MataPelajaran::find($teacherClash->id_mapel);
                    throw ValidationException::withMessages([
                        'jadwal' => "Bentrok Jadwal (Baris " . ($index + 1) . "): Guru {$guru->nama_lengkap} sudah mengajar \"{$mapelBentrok->nama_mapel}\" pada {$hari} {$teacherClash->jam_mulai}-{$teacherClash->jam_selesai}."
                    ]);
                }
            }

            // --- ATURAN 2: Cek bentrok pada KELAS ---
            $classClash = JadwalMengajar::where('id_kelas', $idKelas)
                ->where('hari', $hari)
                ->where(function ($query) use ($jamMulai, $jamSelesai) {
                    $query->where('jam_mulai', '<', $jamSelesai)
                        ->where('jam_selesai', '>', $jamMulai);
                })
                ->when($idTahunAjaran, function ($query) use ($idTahunAjaran) {
                    $query->where('id_tahun_ajaran', $idTahunAjaran);
                })
                ->when($excludeMapelId, function ($query) use ($excludeMapelId) {
                    $query->where('id_mapel', '!=', $excludeMapelId);
                })
                ->first();

            if ($classClash) {
                $kelas = Kelas::find($idKelas);
                $mapelBentrok = MataPelajaran::find($classClash->id_mapel);
                throw ValidationException::withMessages([
                    'jadwal' => "Bentrok Jadwal (Baris " . ($index + 1) . "): Kelas {$kelas->tingkat}-{$kelas->jurusan} sudah ada jadwal \"{$mapelBentrok->nama_mapel}\" pada {$hari} {$classClash->jam_mulai}-{$classClash->jam_selesai}."
                ]);
            }
        }
    }

    /**
     * Mengisi kolom id_guru_default secara otomatis untuk mapel yang masih kosong.
     * Dibagikan secara merata ke seluruh guru yang aktif.
     */
    public function autoAssignGuru()
    {
        // 1. Ambil semua mapel yang guru default-nya kosong
        $unassignedMapels = MataPelajaran::whereNull('id_guru_default')->get();

        if ($unassignedMapels->isEmpty()) {
            return back()->with('success', 'Semua mata pelajaran sudah memiliki Guru Pengampu Default.');
        }

        // 2. Ambil semua guru aktif
        $activeGurus = Guru::where('status', 'Aktif')->get();

        if ($activeGurus->isEmpty()) {
            return back()->with('error', 'Gagal auto-assign: Tidak ada satupun guru yang berstatus Aktif.');
        }

        // 3. Shuffle (acak) guru agar pembagian pertama kali tidak selalu urut abjad
        $guruList = $activeGurus->shuffle()->values();
        $guruCount = $guruList->count();
        $assignedCount = 0;

        DB::transaction(function () use ($unassignedMapels, $guruList, $guruCount, &$assignedCount) {
            foreach ($unassignedMapels as $index => $mapel) {
                // Memilih guru secara bergiliran menggunakan modulo
                $guru = $guruList[$index % $guruCount];
                
                $mapel->update([
                    'id_guru_default' => $guru->id_guru
                ]);
                
                $assignedCount++;
            }
        });

        return back()->with('success', "Auto-Assign berhasil! {$assignedCount} mata pelajaran telah dibagikan secara merata kepada guru pengampu.");
    }

    /**
     * Menghapus mata pelajaran dari database.
     */
    public function destroy(MataPelajaran $mataPelajaran)
    {
        if ($mataPelajaran->jadwalMengajar()->exists()) {
            return back()->with('error', 'Mata Pelajaran tidak dapat dihapus karena masih digunakan dalam jadwal mengajar.');
        }

        $mataPelajaran->delete();

        return to_route('admin.mata-pelajaran.index')->with('success', 'Mata Pelajaran berhasil dihapus.');
    }
}
