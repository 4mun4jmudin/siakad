<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MataPelajaran;
use App\Models\TahunAjaran;
use App\Models\Pengaturan;
use App\Models\PengaturanKKM;
use App\Models\PengaturanPredikat;
use App\Models\PengaturanPenilaianConfig;
use App\Models\Kelas;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PenilaianKKMController extends Controller
{
    public function index()
    {
        // 1. Predikat Nilai
        $predikatList = PengaturanPredikat::orderBy('batas_atas', 'desc')->get();

        // 2. KKM per Mapel
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

        // 3. Config global
        $config = PengaturanPenilaianConfig::allConfig();

        // 4. Pengaturan Sekolah (TA aktif, semester aktif)
        $pengaturan = Pengaturan::first();
        $ta_aktif = TahunAjaran::where('status', 'Aktif')->first();
        if ($ta_aktif && $pengaturan) {
            $pengaturan->id_tahun_ajaran = $ta_aktif->id_tahun_ajaran;
        }

        // 5. Options
        $mapel = MataPelajaran::orderBy('nama_mapel')->get(['id_mapel', 'nama_mapel']);
        $ta    = TahunAjaran::orderByDesc('status')->orderBy('tahun_ajaran')->get(['id_tahun_ajaran', 'tahun_ajaran']);
        
        $jurusanList = DB::table('tbl_kelas')
            ->whereNotNull('jurusan')
            ->where('jurusan', '<>', '')
            ->distinct()
            ->orderBy('jurusan')
            ->pluck('jurusan');

        $kelas = Kelas::orderBy('tingkat')->orderBy('jurusan')->get(['id_kelas', 'tingkat', 'jurusan']);

        // 6. Ringkasan KKM (Dynamic statistics)
        $ringkasanRaw = DB::table('tbl_pengaturan_kkm')
            ->select('jurusan', DB::raw('AVG(kkm) as rata'), DB::raw('COUNT(id_mapel) as mapel'))
            ->groupBy('jurusan')
            ->get();

        $ringkasan = $ringkasanRaw->map(function ($r) {
            return [
                'jurusan' => $r->jurusan ?: 'Semua Jurusan',
                'rata'    => round((float) $r->rata, 1),
                'mapel'   => (int) $r->mapel,
                'progress' => round((float) $r->rata, 1),
            ];
        });

        $rataSekolah = DB::table('tbl_pengaturan_kkm')->avg('kkm') ?: (float) ($config['kkm_default_sekolah'] ?? 75);
        $totalMapel = DB::table('tbl_pengaturan_kkm')->count() ?: MataPelajaran::count();

        $stats = [
            'rata_sekolah' => round((float) $rataSekolah, 1),
            'total_mapel'  => $totalMapel,
            'ringkasan'    => $ringkasan,
        ];

        return Inertia::render('admin/Penilaian/PredikatKKM', [
            'predikat'   => $predikatList,
            'kkmList'    => $kkmList,
            'config'     => $config,
            'stats'      => $stats,
            'pengaturan' => $pengaturan,
            'options'    => [
                'mapel'       => $mapel,
                'tahunAjaran' => $ta,
                'semester'    => [
                    ['value' => 'Ganjil', 'label' => 'Ganjil'],
                    ['value' => 'Genap',  'label' => 'Genap'],
                ],
                'jurusan'     => $jurusanList,
                'kelas'       => $kelas->map(fn($k) => [
                    'id_kelas' => $k->id_kelas,
                    'nama_kelas' => $k->tingkat . ' ' . $k->jurusan,
                    'jurusan' => $k->jurusan,
                ]),
            ],
        ]);
    }
}
