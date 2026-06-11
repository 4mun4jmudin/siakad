<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Remedial;
use App\Models\PenilaianMapel;
use App\Services\PenilaianCalculator;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class RemedialController extends Controller
{
    public function index(Request $r)
    {
        $ta = $r->query('id_tahun_ajaran');
        $sm = $r->query('semester');

        // Smart Prefill
        if (!$ta || !$sm) {
            $aktif = DB::table('tbl_tahun_ajaran')->where('status', 'Aktif')->first();
            if ($aktif) {
                return redirect()->route('admin.remedial.index', array_merge($r->all(), [
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
        ];

        // Options
        $optsTa = DB::table('tbl_tahun_ajaran')->select('id_tahun_ajaran','tahun_ajaran','status')->orderByDesc('status')->orderBy('tahun_ajaran')->get()->map(fn($x)=>['value'=>$x->id_tahun_ajaran,'label'=>$x->tahun_ajaran]);
        $optsSemester = collect([['value'=>'Ganjil','label'=>'Ganjil'],['value'=>'Genap','label'=>'Genap']]);
        $optsKelas = DB::table('tbl_kelas')->select('id_kelas')->orderBy('id_kelas')->get()->map(fn($x)=>['value'=>$x->id_kelas,'label'=>$x->id_kelas]);
        $optsMapel = DB::table('tbl_mata_pelajaran')->select('id_mapel','nama_mapel')->orderBy('nama_mapel')->get()->map(fn($x)=>['value'=>$x->id_mapel,'label'=>$x->nama_mapel]);

        $options = [
            'tahunAjaran' => $optsTa,
            'semester'    => $optsSemester,
            'kelas'       => $optsKelas,
            'mapel'       => $optsMapel,
        ];

        // Query PenilaianMapel (Siswa)
        $q = PenilaianMapel::with(['siswa:id_siswa,nama_lengkap', 'mapel:id_mapel,nama_mapel', 'kelas:id_kelas'])
            ->leftJoin('tbl_remedial as r', 'r.id_penilaian', '=', 'tbl_penilaian_mapel.id_penilaian')
            ->select('tbl_penilaian_mapel.*', 'r.id_remedial', 'r.tanggal as jadwal', 'r.nilai_awal', 'r.nilai_remedial', 'r.catatan')
            ->where('tbl_penilaian_mapel.id_tahun_ajaran', $ta)
            ->where('tbl_penilaian_mapel.semester', $sm);

        if ($f['id_kelas']) $q->where('tbl_penilaian_mapel.id_kelas', $f['id_kelas']);
        if ($f['id_mapel']) $q->where('tbl_penilaian_mapel.id_mapel', $f['id_mapel']);

        // KPI Query (Semua data sesuai filter, bukan cuma remedial)
        $allPenilaian = (clone $q)->get();
        
        $kpi = [
            'belum_remedial' => 0,
            'proses_remedial' => 0,
            'selesai_remedial' => 0,
            'pengayaan' => 0, // Tuntas
        ];

        foreach ($allPenilaian as $p) {
            if ($p->id_remedial) {
                if ($p->nilai_remedial !== null) {
                    $kpi['selesai_remedial']++;
                } else {
                    $kpi['proses_remedial']++;
                }
            } else {
                if ($p->tuntas == 0) {
                    $kpi['belum_remedial']++;
                } else {
                    $kpi['pengayaan']++; // Siswa tuntas murni
                }
            }
        }

        // Table Items: Only show those who need remedial OR have remedial record
        $items = (clone $q)
            ->where(function($query) {
                $query->where('tbl_penilaian_mapel.tuntas', 0)
                      ->orWhereNotNull('r.id_remedial');
            })
            ->orderBy('tbl_penilaian_mapel.id_kelas')
            ->orderBy('tbl_penilaian_mapel.id_siswa')
            ->paginate(30);

        // Fetch KKMs for the items to display in table
        $bobots = DB::table('tbl_bobot_penilaian')
            ->where('id_tahun_ajaran', $ta)
            ->where('semester', $sm)
            ->get();

        $kkmMap = [];
        foreach ($bobots as $b) {
            $key = ($b->id_kelas ?: 'all') . '_' . ($b->id_mapel ?: 'all');
            $kkmMap[$key] = $b->kkm;
        }

        $items->getCollection()->transform(function($item) use ($kkmMap) {
            // Find KKM
            $kkm = 75; // Default fallback
            $k1 = $item->id_kelas . '_' . $item->id_mapel;
            $k2 = 'all_' . $item->id_mapel;
            $k3 = $item->id_kelas . '_all';
            $k4 = 'all_all';
            
            if (isset($kkmMap[$k1])) $kkm = $kkmMap[$k1];
            elseif (isset($kkmMap[$k2])) $kkm = $kkmMap[$k2];
            elseif (isset($kkmMap[$k3])) $kkm = $kkmMap[$k3];
            elseif (isset($kkmMap[$k4])) $kkm = $kkmMap[$k4];

            // Determine status
            $status = 'Belum Remedial';
            if ($item->id_remedial) {
                $status = $item->nilai_remedial !== null ? 'Selesai Remedial' : 'Proses Remedial';
            }

            return [
                'id_penilaian' => $item->id_penilaian,
                'id_remedial'  => $item->id_remedial,
                'nama'         => $item->siswa->nama_lengkap ?? '-',
                'kelas'        => $item->kelas->id_kelas ?? '-',
                'mapel'        => $item->mapel->nama_mapel ?? '-',
                'nilai_akhir'  => (float) $item->nilai_akhir,
                'nilai_awal_rem' => $item->nilai_awal,
                'nilai_remedial' => $item->nilai_remedial,
                'kkm'          => $kkm,
                'status'       => $status,
                'jadwal'       => $item->jadwal ? date('d M Y', strtotime($item->jadwal)) : '-',
                'jadwal_raw'   => $item->jadwal ? date('Y-m-d', strtotime($item->jadwal)) : '',
                'catatan'      => $item->catatan,
            ];
        });

        return Inertia::render('admin/Penilaian/RemedialIndex', [
            'filters' => $f,
            'options' => $options,
            'kpi'     => $kpi,
            'items'   => $items,
        ]);
    }

    public function store(Request $r)
    {
        $data = $r->validate([
            'id_penilaian'  => 'required|integer',
            'nilai_awal'    => 'required|numeric|min:0|max:100',
            'nilai_remedial'=> 'nullable|numeric|min:0|max:100',
            'tanggal'       => 'nullable|date',
            'catatan'       => 'nullable|string|max:255',
        ]);

        // Use updateOrCreate to ensure uniqueness per id_penilaian
        Remedial::updateOrCreate(
            ['id_penilaian' => $data['id_penilaian']],
            [
                'nilai_awal'     => $data['nilai_awal'],
                'nilai_remedial' => $data['nilai_remedial'],
                'tanggal'        => $data['tanggal'],
                'catatan'        => $data['catatan'],
                'komponen'       => 'Akhir', // Default if needed
            ]
        );

        // Recompute if nilai_remedial is provided
        if (isset($data['nilai_remedial'])) {
            $pen = PenilaianMapel::findOrFail($data['id_penilaian']);
            (new PenilaianCalculator())->compute($pen);
            return back()->with('success', 'Nilai remedial disimpan & nilai akhir dihitung ulang.');
        }

        return back()->with('success', 'Jadwal remedial berhasil dibuat.');
    }

    public function update(Request $r, $id)
    {
        // For individual updates if needed by id_remedial
        $data = $r->validate([
            'nilai_awal'    => 'required|numeric|min:0|max:100',
            'nilai_remedial'=> 'required|numeric|min:0|max:100',
            'tanggal'       => 'nullable|date',
            'catatan'       => 'nullable|string|max:255',
        ]);

        $row = Remedial::findOrFail($id);
        $row->update($data);

        $pen = PenilaianMapel::findOrFail($row->id_penilaian);
        (new PenilaianCalculator())->compute($pen);

        return back()->with('success','Remedial diperbarui & nilai akhir dihitung ulang.');
    }

    public function destroy($id)
    {
        $row = Remedial::findOrFail($id);
        $penId = $row->id_penilaian;
        $row->delete();

        $pen = PenilaianMapel::findOrFail($penId);
        (new PenilaianCalculator())->compute($pen);

        return back()->with('success','Remedial dihapus & nilai akhir dihitung ulang.');
    }
}
