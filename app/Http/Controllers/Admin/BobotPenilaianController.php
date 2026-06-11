<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BobotPenilaian;
use App\Models\KomponenPenilaian;
use App\Models\MataPelajaran;
use App\Models\TahunAjaran;
use App\Models\Pengaturan;
use App\Models\PengaturanKKM;
use App\Models\PengaturanPredikat;
use App\Models\PengaturanPenilaianConfig;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BobotPenilaianController extends Controller
{
    /**
     * Halaman utama Pengaturan Penilaian (5 tabs).
     */
    public function index(Request $r)
    {
        // ===== Komponen =====
        $komponenList = KomponenPenilaian::orderBy('nama')->get();

        // ===== Bobot (grouped per mapel/TA/semester) =====
        $bobots = BobotPenilaian::with([
            'mapel:id_mapel,nama_mapel',
            'tahunAjaran:id_tahun_ajaran,tahun_ajaran',
            'komponen',
        ])
            ->orderBy('id_mapel')
            ->orderBy('id_tahun_ajaran')
            ->orderBy('semester')
            ->get();

        $grouped = $bobots->groupBy(function ($b) {
            return $b->id_mapel . '|' . $b->id_tahun_ajaran . '|' . $b->semester;
        })->map(function ($group) use ($komponenList) {
            $first = $group->first();
            $bobotPerKomponen = [];
            foreach ($group as $b) {
                $bobotPerKomponen[$b->id_komponen] = [
                    'id'    => $b->id,
                    'bobot' => (float) $b->bobot,
                ];
            }

            return [
                'key'              => $first->id_mapel . '|' . $first->id_tahun_ajaran . '|' . $first->semester,
                'id_mapel'         => $first->id_mapel,
                'id_tahun_ajaran'  => $first->id_tahun_ajaran,
                'semester'         => $first->semester,
                'nama_mapel'       => $first->mapel?->nama_mapel ?? $first->id_mapel,
                'tahun_ajaran'     => $first->tahunAjaran?->tahun_ajaran ?? $first->id_tahun_ajaran,
                'bobot'            => $bobotPerKomponen,
            ];
        })->values();

        // ===== KKM =====
        $kkmList = PengaturanKKM::with('mapel:id_mapel,nama_mapel')
            ->orderBy('id_mapel')
            ->get()
            ->map(fn($k) => [
                'id'              => $k->id,
                'id_mapel'        => $k->id_mapel,
                'nama_mapel'      => $k->mapel?->nama_mapel ?? $k->id_mapel,
                'id_tahun_ajaran' => $k->id_tahun_ajaran,
                'semester'        => $k->semester,
                'jurusan'         => $k->jurusan,
                'kkm'             => (float) $k->kkm,
            ]);

        // ===== Predikat =====
        $predikatList = PengaturanPredikat::orderBy('batas_atas', 'desc')->get();

        // ===== Config global =====
        $config = PengaturanPenilaianConfig::allConfig();

        // ===== Pengaturan sekolah (TA aktif, semester aktif) =====
        $pengaturan = Pengaturan::first();
        $ta_aktif = TahunAjaran::where('status', 'Aktif')->first();
        if ($ta_aktif) {
            $pengaturan->id_tahun_ajaran = $ta_aktif->id_tahun_ajaran;
        }
        $mapel = MataPelajaran::orderBy('nama_mapel')->get(['id_mapel', 'nama_mapel']);
        $ta    = TahunAjaran::orderByDesc('status')->orderBy('tahun_ajaran')->get(['id_tahun_ajaran', 'tahun_ajaran']);

        // Jurusan unik dari kelas
        $jurusanList = DB::table('tbl_kelas')
            ->whereNotNull('jurusan')
            ->where('jurusan', '<>', '')
            ->distinct()
            ->orderBy('jurusan')
            ->pluck('jurusan');

        // ===== KPI stats =====
        $stats = [
            'semester_aktif'    => ($pengaturan->semester_aktif ?? '-') . ' ' . ($pengaturan->tahun_ajaran_aktif ?? ''),
            'total_komponen'    => $komponenList->count(),
            'total_mapel_bobot' => $grouped->count(),
            'total_kkm'         => $kkmList->count(),
        ];

        return Inertia::render('admin/Penilaian/Bobot/Index', [
            'items'     => $grouped,
            'komponen'  => $komponenList,
            'kkmList'   => $kkmList,
            'predikat'  => $predikatList,
            'config'    => $config,
            'stats'     => $stats,
            'options'   => [
                'mapel'       => $mapel,
                'tahunAjaran' => $ta,
                'semester'    => [
                    ['value' => 'Ganjil', 'label' => 'Ganjil'],
                    ['value' => 'Genap',  'label' => 'Genap'],
                ],
                'jurusan'     => $jurusanList,
            ],
        ]);
    }

    /**
     * Simpan/update bobot untuk satu kombinasi (mapel, TA, semester).
     * Menerima array of { id_komponen, bobot }.
     */
    public function store(Request $r)
    {
        $data = $r->validate([
            'id_mapel'            => 'required|string|exists:tbl_mata_pelajaran,id_mapel',
            'id_tahun_ajaran'     => 'required|string|exists:tbl_tahun_ajaran,id_tahun_ajaran',
            'semester'            => 'required|in:Ganjil,Genap',
            'bobot'               => 'required|array',
            'bobot.*.id_komponen' => 'required|exists:tbl_komponen_penilaian,id_komponen',
            'bobot.*.bobot'       => 'nullable|numeric|min:0|max:100',
        ]);

        DB::transaction(function () use ($data) {
            foreach ($data['bobot'] as $item) {
                $bobotValue = $item['bobot'] ?? 0;

                if ($bobotValue > 0) {
                    BobotPenilaian::updateOrCreate(
                        [
                            'id_mapel'        => $data['id_mapel'],
                            'id_tahun_ajaran' => $data['id_tahun_ajaran'],
                            'semester'        => $data['semester'],
                            'id_komponen'     => $item['id_komponen'],
                        ],
                        ['bobot' => $bobotValue]
                    );
                } else {
                    BobotPenilaian::where([
                        'id_mapel'        => $data['id_mapel'],
                        'id_tahun_ajaran' => $data['id_tahun_ajaran'],
                        'semester'        => $data['semester'],
                        'id_komponen'     => $item['id_komponen'],
                    ])->delete();
                }
            }
        });

        return back()->with('success', 'Bobot berhasil disimpan.');
    }

    /**
     * Update bobot untuk satu komponen spesifik.
     */
    public function update(Request $r, $id)
    {
        $data = $r->validate([
            'bobot' => 'required|numeric|min:0|max:100',
        ]);

        $row = BobotPenilaian::findOrFail($id);
        $row->update(['bobot' => $data['bobot']]);

        return back()->with('success', 'Bobot diperbarui.');
    }

    /**
     * Hapus seluruh bobot untuk satu kombinasi (mapel, TA, semester).
     */
    public function destroy(Request $r)
    {
        $data = $r->validate([
            'id_mapel'        => 'required|string',
            'id_tahun_ajaran' => 'required|string',
            'semester'        => 'required|in:Ganjil,Genap',
        ]);

        BobotPenilaian::where([
            'id_mapel'        => $data['id_mapel'],
            'id_tahun_ajaran' => $data['id_tahun_ajaran'],
            'semester'        => $data['semester'],
        ])->delete();

        return back()->with('success', 'Bobot dihapus.');
    }

    // ========== KKM ==========

    /**
     * Simpan/update KKM per mapel.
     */
    public function storeKKM(Request $r)
    {
        $data = $r->validate([
            'id_mapel'        => 'required|string|exists:tbl_mata_pelajaran,id_mapel',
            'id_tahun_ajaran' => 'required|string|exists:tbl_tahun_ajaran,id_tahun_ajaran',
            'semester'        => 'required|in:Ganjil,Genap',
            'jurusan'         => 'nullable|string|max:50',
            'kkm'             => 'required|numeric|min:0|max:100',
        ]);

        PengaturanKKM::updateOrCreate(
            [
                'id_mapel'        => $data['id_mapel'],
                'id_tahun_ajaran' => $data['id_tahun_ajaran'],
                'semester'        => $data['semester'],
                'jurusan'         => $data['jurusan'] ?? null,
            ],
            ['kkm' => $data['kkm']]
        );

        return back()->with('success', 'KKM berhasil disimpan.');
    }

    /**
     * Hapus KKM.
     */
    public function destroyKKM($id)
    {
        PengaturanKKM::findOrFail($id)->delete();
        return back()->with('success', 'KKM dihapus.');
    }

    // ========== Predikat ==========

    /**
     * Simpan/update predikat (batch).
     */
    public function storePredikat(Request $r)
    {
        $data = $r->validate([
            'id_tahun_ajaran' => 'required|string|exists:tbl_tahun_ajaran,id_tahun_ajaran',
            'semester'        => 'required|in:Ganjil,Genap',
            'predikat'        => 'required|array|min:1',
            'predikat.*.predikat'     => 'required|string|max:2',
            'predikat.*.batas_bawah'  => 'required|numeric|min:0|max:100',
            'predikat.*.batas_atas'   => 'required|numeric|min:0|max:100',
        ]);

        DB::transaction(function () use ($data) {
            foreach ($data['predikat'] as $p) {
                PengaturanPredikat::updateOrCreate(
                    [
                        'id_tahun_ajaran' => $data['id_tahun_ajaran'],
                        'semester'        => $data['semester'],
                        'predikat'        => $p['predikat'],
                    ],
                    [
                        'batas_bawah' => $p['batas_bawah'],
                        'batas_atas'  => $p['batas_atas'],
                    ]
                );
            }
        });

        return back()->with('success', 'Predikat berhasil disimpan.');
    }

    // ========== Config Global ==========

    /**
     * Simpan config key-value.
     */
    public function storeConfig(Request $r)
    {
        $data = $r->validate([
            'config'         => 'required|array',
            'config.*.key'   => 'required|string|max:50',
            'config.*.value' => 'nullable|string',
        ]);

        foreach ($data['config'] as $item) {
            PengaturanPenilaianConfig::setValue($item['key'], $item['value']);
        }

        return back()->with('success', 'Pengaturan berhasil disimpan.');
    }

    // ========== Komponen Penilaian ==========

    /**
     * Tambah komponen penilaian baru.
     */
    public function storeKomponen(Request $r)
    {
        $data = $r->validate([
            'nama'          => 'required|string|max:50|unique:tbl_komponen_penilaian,nama',
            'kode'          => 'nullable|string|max:10',
            'tipe'          => 'nullable|string|max:50',
            'bobot_default' => 'nullable|integer|min:0|max:100',
            'aktif'         => 'nullable|boolean',
        ]);

        KomponenPenilaian::create($data);

        return back()->with('success', 'Komponen "' . $data['nama'] . '" berhasil ditambahkan.');
    }

    /**
     * Update komponen penilaian.
     */
    public function updateKomponen(Request $r, $id)
    {
        $k = KomponenPenilaian::findOrFail($id);
        
        $data = $r->validate([
            'nama'          => 'required|string|max:50|unique:tbl_komponen_penilaian,nama,' . $id . ',id_komponen',
            'kode'          => 'nullable|string|max:10',
            'tipe'          => 'nullable|string|max:50',
            'bobot_default' => 'nullable|integer|min:0|max:100',
            'aktif'         => 'nullable|boolean',
        ]);

        $k->update($data);

        return back()->with('success', 'Komponen "' . $data['nama'] . '" berhasil diperbarui.');
    }

    /**
     * Hapus komponen penilaian.
     */
    public function destroyKomponen($id)
    {
        $k = KomponenPenilaian::findOrFail($id);
        $nama = $k->nama;
        $k->delete();

        return back()->with('success', 'Komponen "' . $nama . '" berhasil dihapus.');
    }
}
