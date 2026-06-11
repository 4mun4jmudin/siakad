<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RaporSiswa;
use App\Models\PenilaianMapel;
use App\Models\Siswa;
use App\Models\Kelas;
use App\Models\TahunAjaran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Exports\LegerExport;

class RaporController extends Controller
{
    public function index(Request $r)
    {
        $ta = TahunAjaran::orderByDesc('status')->orderBy('tahun_ajaran')->get(['id_tahun_ajaran','tahun_ajaran'])->map(fn($x)=>['value'=>$x->id_tahun_ajaran,'label'=>$x->tahun_ajaran]);
        $kelas = Kelas::orderBy('id_kelas')->get(['id_kelas'])->map(fn($x)=>['value'=>$x->id_kelas,'label'=>$x->id_kelas]);
        
        $filters = [
            'id_tahun_ajaran' => $r->query('id_tahun_ajaran', ''),
            'semester'        => $r->query('semester', ''),
            'id_kelas'        => $r->query('id_kelas', ''),
        ];

        // Smart Prefill
        if (!$filters['id_tahun_ajaran'] || !$filters['semester']) {
            $aktif = DB::table('tbl_tahun_ajaran')->where('status', 'Aktif')->first();
            if ($aktif) {
                return redirect()->route('admin.rapor.index', array_merge($r->all(), [
                    'id_tahun_ajaran' => $aktif->id_tahun_ajaran,
                    'semester'        => 'Genap'
                ]));
            }
        }

        $items = [];
        if ($filters['id_tahun_ajaran'] && $filters['semester'] && $filters['id_kelas']) {
            $items = RaporSiswa::with('siswa:id_siswa,nama_lengkap,nis')
                ->where('id_tahun_ajaran', $filters['id_tahun_ajaran'])
                ->where('semester', $filters['semester'])
                ->where('id_kelas', $filters['id_kelas'])
                ->orderBy('peringkat_kelas')
                ->get()
                ->map(function($r) {
                    return [
                        'id_siswa' => $r->id_siswa,
                        'nis' => $r->siswa->nis ?? '-',
                        'nama_lengkap' => $r->siswa->nama_lengkap ?? '-',
                        'rata_rata' => $r->rata_rata,
                        'peringkat' => $r->peringkat_kelas,
                    ];
                });
        }

        return Inertia::render('admin/Penilaian/RaporIndex', [
            'options'=>[
                'tahunAjaran'=>$ta,
                'semester'=>[['value'=>'Ganjil','label'=>'Ganjil'],['value'=>'Genap','label'=>'Genap']],
                'kelas'=>$kelas,
            ],
            'filters'=>$filters,
            'items'=>$items,
        ]);
    }

    public function recompute(Request $r)
    {
        $data = $r->validate([
            'id_tahun_ajaran' => 'required|string',
            'semester'        => 'required|in:Ganjil,Genap',
            'id_kelas'        => 'required|string',
        ]);

        $agg = PenilaianMapel::where($data)
            ->select('id_siswa', DB::raw('AVG(nilai_akhir) as rata'))
            ->groupBy('id_siswa')->get();

        // Clear existing Rapor for this scope to rewrite cleanly
        RaporSiswa::where($data)->delete();

        $ranked = $agg->sortByDesc('rata')->values();
        foreach ($ranked as $i=>$row) {
            RaporSiswa::create([
                'id_siswa' => $row->id_siswa,
                'id_tahun_ajaran' => $data['id_tahun_ajaran'],
                'semester' => $data['semester'],
                'id_kelas' => $data['id_kelas'],
                'rata_rata' => round((float)$row->rata, 2),
                'peringkat_kelas' => $i + 1,
            ]);
        }

        return back()->with('success','Rapor dihitung ulang dan peringkat diperbarui.');
    }

    public function showSiswa(string $id_siswa)
    {
        $rapor = RaporSiswa::where('id_siswa',$id_siswa)
            ->orderByDesc('created_at')->get();

        $detail = PenilaianMapel::with('mapel:id_mapel,nama_mapel')->where('id_siswa',$id_siswa)
            ->select('id_penilaian','id_mapel','id_tahun_ajaran','semester','nilai_akhir','predikat','tuntas')
            ->orderBy('id_tahun_ajaran')->orderBy('semester')->get();

        return response()->json(['rapor'=>$rapor, 'detail'=>$detail]);
    }

    public function exportExcel(Request $r)
    {
        $ta = $r->query('id_tahun_ajaran');
        $sm = $r->query('semester');
        $kls = $r->query('id_kelas');

        if (!$ta || !$sm || !$kls) {
            return back()->with('error', 'Filter tidak lengkap untuk export Leger.');
        }

        // Ambil semua penilaian mapel untuk kelas ini
        $penilaian = PenilaianMapel::with(['siswa', 'mapel'])
            ->where('id_tahun_ajaran', $ta)
            ->where('semester', $sm)
            ->where('id_kelas', $kls)
            ->get();

        $mapels = $penilaian->pluck('mapel.nama_mapel', 'id_mapel')->unique();
        $mapelIds = $mapels->keys()->toArray();
        $mapelNames = $mapels->values()->toArray();

        // Ambil rapor siswa untuk rata-rata & peringkat
        $rapor = RaporSiswa::with('siswa')
            ->where('id_tahun_ajaran', $ta)
            ->where('semester', $sm)
            ->where('id_kelas', $kls)
            ->orderBy('peringkat_kelas')
            ->get();

        $data = [];
        $no = 1;
        foreach ($rapor as $rp) {
            $row = [
                $no++,
                $rp->siswa->nis ?? '-',
                $rp->siswa->nama_lengkap ?? '-',
            ];

            // Nilai tiap mapel
            $siswaPenilaian = $penilaian->where('id_siswa', $rp->id_siswa);
            foreach ($mapelIds as $mid) {
                $p = $siswaPenilaian->firstWhere('id_mapel', $mid);
                $row[] = $p ? $p->nilai_akhir : '-';
            }

            $row[] = $rp->rata_rata;
            $row[] = $rp->peringkat_kelas;
            $data[] = $row;
        }

        return Excel::download(new LegerExport($data, $mapelNames, ['id_kelas' => $kls]), 'Leger_Nilai_'.$kls.'.xlsx');
    }

    public function exportPdf(Request $r)
    {
        $id_siswa = $r->query('id_siswa');
        $ta = $r->query('id_tahun_ajaran');
        $sm = $r->query('semester');
        $kls = $r->query('id_kelas');

        if (!$id_siswa || !$ta || !$sm) {
            return back()->with('error', 'Parameter tidak lengkap untuk export PDF Rapor.');
        }

        $siswa = Siswa::findOrFail($id_siswa);
        
        $nilai = PenilaianMapel::with('mapel')
            ->where('id_siswa', $id_siswa)
            ->where('id_tahun_ajaran', $ta)
            ->where('semester', $sm)
            ->get();

        // Coba fetch KKM (join dgn tbl_bobot_penilaian)
        // Sederhananya, fetch semua kkm untuk mapel tersebut
        $bobots = DB::table('tbl_bobot_penilaian')
            ->where('id_tahun_ajaran', $ta)
            ->where('semester', $sm)
            ->get();
            
        $kkmMap = [];
        foreach ($bobots as $b) {
            $key = ($b->id_kelas ?: 'all') . '_' . ($b->id_mapel ?: 'all');
            $kkmMap[$key] = $b->kkm;
        }

        foreach ($nilai as $n) {
            $kkm = 75;
            $k1 = $n->id_kelas . '_' . $n->id_mapel;
            $k2 = 'all_' . $n->id_mapel;
            $k3 = $n->id_kelas . '_all';
            $k4 = 'all_all';
            
            if (isset($kkmMap[$k1])) $kkm = $kkmMap[$k1];
            elseif (isset($kkmMap[$k2])) $kkm = $kkmMap[$k2];
            elseif (isset($kkmMap[$k3])) $kkm = $kkmMap[$k3];
            elseif (isset($kkmMap[$k4])) $kkm = $kkmMap[$k4];
            
            $n->kkm = $kkm;
        }

        $rapor = RaporSiswa::where('id_siswa', $id_siswa)
            ->where('id_tahun_ajaran', $ta)
            ->where('semester', $sm)
            ->first();

        $totalSiswa = Siswa::where('id_kelas', $kls)->where('status', 'Aktif')->count();

        $data = [
            'siswa' => $siswa,
            'nilai' => $nilai,
            'rapor' => $rapor,
            'kelas' => Kelas::find($kls),
            'tahun_ajaran' => $ta,
            'semester' => $sm,
            'total_siswa' => $totalSiswa,
        ];

        $pdf = Pdf::loadView('pdf.rapor_siswa', $data);
        return $pdf->download('Rapor_'.$siswa->nama_lengkap.'_'.$ta.'_'.$sm.'.pdf');
    }
}
