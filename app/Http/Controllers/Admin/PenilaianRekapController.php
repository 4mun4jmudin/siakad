<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Services\PenilaianRekapService;

class PenilaianRekapController extends Controller
{
    protected PenilaianRekapService $svc;

    public function __construct(PenilaianRekapService $svc)
    {
        $this->svc = $svc;
    }

    public function index(Request $r)
    {
        $ta = $r->query('id_tahun_ajaran');
        $sm = $r->query('semester');

        // Smart Prefill
        if (!$ta || !$sm) {
            $aktif = DB::table('tbl_tahun_ajaran')->where('status', 'Aktif')->first();
            if ($aktif) {
                return redirect()->route('admin.penilaian.rekapitulasi.index', array_merge($r->all(), [
                    'id_tahun_ajaran' => $aktif->id_tahun_ajaran,
                    'semester'        => 'Genap'
                ]));
            }
        }

        $f = [
            'id_tahun_ajaran' => $ta,
            'semester'        => $sm,
            'id_kelas'        => $r->query('id_kelas'),
            'id_mapel'        => $r->query('id_mapel'),
            'guru'            => $r->query('guru'),
        ];

        // Options
        $optsTa = DB::table('tbl_tahun_ajaran')->select('id_tahun_ajaran','tahun_ajaran','status')->orderByDesc('status')->orderBy('tahun_ajaran')->get()->map(fn($x)=>['value'=>$x->id_tahun_ajaran,'label'=>$x->tahun_ajaran]);
        $optsSemester = collect([['value'=>'Ganjil','label'=>'Ganjil'],['value'=>'Genap','label'=>'Genap']]);
        $optsKelas = DB::table('tbl_kelas')->select('id_kelas')->orderBy('id_kelas')->get()->map(fn($x)=>['value'=>$x->id_kelas,'label'=>$x->id_kelas]);
        $optsMapel = DB::table('tbl_mata_pelajaran')->select('id_mapel','nama_mapel')->orderBy('nama_mapel')->get()->map(fn($x)=>['value'=>$x->id_mapel,'label'=>$x->nama_mapel]);
        $optsGuru = DB::table('tbl_guru')->select('id_guru','nama_lengkap')->whereExists(function($query){
            $query->select(DB::raw(1))->from('tbl_jadwal_mengajar as jm')->whereColumn('jm.id_guru', 'tbl_guru.id_guru');
        })->orderBy('nama_lengkap')->get()->map(fn($x)=>['value'=>$x->id_guru,'label'=>$x->nama_lengkap]);

        $options = [
            'tahunAjaran' => $optsTa,
            'semester'    => $optsSemester,
            'kelas'       => $optsKelas,
            'mapel'       => $optsMapel,
            'guru'        => $optsGuru,
        ];

        $data = null;
        if ($f['id_tahun_ajaran'] && $f['semester']) {
            $data = [
                'summary' => $this->svc->summary($f),
                'breakdown' => $this->svc->tuntasBreakdown($f),
                'trend' => $this->svc->trend($f),
                'kelas' => $this->svc->kelasLeaderboard($f, 50),
                'mapel' => $this->svc->mapelLeaderboard($f, 50),
            ];
        }

        return Inertia::render('admin/Penilaian/Rekapitulasi', [
            'filters' => $f,
            'options' => $options,
            'data'    => $data,
        ]);
    }

    public function exportExcel(Request $r)
    {
        $f = [
            'id_tahun_ajaran' => $r->query('id_tahun_ajaran'),
            'semester'        => $r->query('semester'),
            'id_kelas'        => $r->query('id_kelas'),
            'id_mapel'        => $r->query('id_mapel'),
            'guru'            => $r->query('guru'),
        ];

        $dataKelas = $this->svc->kelasLeaderboard($f, 100);
        return \Maatwebsite\Excel\Facades\Excel::download(new \App\Exports\RekapitulasiExport($dataKelas), 'Rekapitulasi_Nilai.xlsx');
    }

    public function exportPdf(Request $r)
    {
        $f = [
            'id_tahun_ajaran' => $r->query('id_tahun_ajaran'),
            'semester'        => $r->query('semester'),
            'id_kelas'        => $r->query('id_kelas'),
            'id_mapel'        => $r->query('id_mapel'),
            'guru'            => $r->query('guru'),
        ];

        $data = [
            'filters' => $f,
            'summary' => (object) $this->svc->summary($f),
            'kelas'   => $this->svc->kelasLeaderboard($f, 50),
            'mapel'   => $this->svc->mapelLeaderboard($f, 50),
        ];

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.rekapitulasi_nilai', $data);
        return $pdf->download('Rekapitulasi_Nilai.pdf');
    }
}
