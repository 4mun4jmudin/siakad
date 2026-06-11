<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use App\Services\PenilaianDashboardService;
use App\Models\TahunAjaran;
use App\Models\Kelas;
use App\Models\MataPelajaran;

class PenilaianDashboardController extends Controller
{
    public function __construct(private PenilaianDashboardService $svc)
    {
    }

    public function index(Request $r)
    {
        // Opsi filter untuk frontend (jika pakai Inertia)
        $taOptions = TahunAjaran::orderByDesc('status')->orderBy('tahun_ajaran')
            ->get(['id_tahun_ajaran as value', 'tahun_ajaran as label']);

        $semesterOptions = collect([
            ['value'=>'Ganjil','label'=>'Ganjil'],
            ['value'=>'Genap','label'=>'Genap'],
        ]);

        $kelasOptions = Kelas::orderBy('id_kelas')
            ->get(['id_kelas as value', DB::raw("CONCAT(id_kelas,' - ',IFNULL(tingkat,''),' ',IFNULL(jurusan,'')) as label")]);

        $mapelOptions = MataPelajaran::orderBy('nama_mapel')
            ->get(['id_mapel as value', 'nama_mapel as label']);

        $guruOptions = \App\Models\Guru::orderBy('nama_lengkap')
            ->get(['id_guru as value', 'nama_lengkap as label']);

        // Smart Default logic for id_tahun_ajaran & semester
        $idTahunAjaran = $r->query('id_tahun_ajaran');
        $semester = $r->query('semester');

        if (empty($idTahunAjaran) || empty($semester)) {
            $pengaturan = DB::table('tbl_pengaturan')->first();
            $activeTa = null;
            if ($pengaturan) {
                $activeTa = TahunAjaran::where('tahun_ajaran', $pengaturan->tahun_ajaran_aktif)
                    ->where('semester', $pengaturan->semester_aktif)
                    ->first();
            }
            if (!$activeTa) {
                $activeTa = TahunAjaran::where('status', 'Aktif')->first();
            }

            $hasActiveData = false;
            if ($activeTa) {
                $hasActiveData = DB::table('tbl_penilaian_mapel')
                    ->where('id_tahun_ajaran', $activeTa->id_tahun_ajaran)
                    ->where('semester', $activeTa->semester)
                    ->exists();
            }

            if ($hasActiveData && $activeTa) {
                $idTahunAjaran = $activeTa->id_tahun_ajaran;
                $semester = $activeTa->semester;
            } else {
                // Fallback to year/semester with the most data in tbl_penilaian_mapel
                $mostData = DB::table('tbl_penilaian_mapel')
                    ->select('id_tahun_ajaran', 'semester', DB::raw('count(*) as count'))
                    ->groupBy('id_tahun_ajaran', 'semester')
                    ->orderByDesc('count')
                    ->first();

                if ($mostData) {
                    $idTahunAjaran = $mostData->id_tahun_ajaran;
                    $semester = $mostData->semester;
                } else if ($activeTa) {
                    $idTahunAjaran = $activeTa->id_tahun_ajaran;
                    $semester = $activeTa->semester;
                } else {
                    $firstTa = TahunAjaran::first();
                    if ($firstTa) {
                        $idTahunAjaran = $firstTa->id_tahun_ajaran;
                        $semester = $firstTa->semester;
                    }
                }
            }
        }

        return Inertia::render('admin/Penilaian/Dashboard', [
            'options' => [
                'tahunAjaran' => $taOptions,
                'semester'    => $semesterOptions,
                'kelas'       => $kelasOptions,
                'mapel'       => $mapelOptions,
                'guru'        => $guruOptions,
            ],
            'filters' => [
                'id_tahun_ajaran' => $idTahunAjaran,
                'semester'        => $semester,
                'id_kelas'        => $r->query('id_kelas'),
                'id_mapel'        => $r->query('id_mapel'),
                'guru'            => $r->query('guru'),
                'status'          => $r->query('status'),
            ],
            'routes' => [
                'summary'          => route('admin.penilaian.api.summary'),
                'distribution'     => route('admin.penilaian.api.distribution'),
                'trend'            => route('admin.penilaian.api.trend'),
                'mapelLeaderboard' => route('admin.penilaian.api.mapelLeaderboard'),
                'kelasLeaderboard' => route('admin.penilaian.api.kelasLeaderboard'),
                'tuntasBreakdown'  => route('admin.penilaian.api.tuntasBreakdown'),
                'remedialQueue'    => route('admin.penilaian.api.remedialQueue'),
            ]
        ]);
    }

    // ========= API JSON =========

    public function apiSummary(Request $r)
    {
        $f = $this->validateFilters($r);
        $key = $this->cacheKey('summary', $f);
        $data = Cache::remember($key, now()->addMinutes(3), fn()=> $this->svc->summary($f));
        return response()->json($data);
    }

    public function apiDistribution(Request $r)
    {
        $f = $this->validateFilters($r);
        $bins = [0,60,70,80,90,101]; // bisa diubah lewat query jika mau
        $key = $this->cacheKey('distribution', $f, $bins);
        $data = Cache::remember($key, now()->addMinutes(3), fn()=> $this->svc->distribution($f, $bins));
        return response()->json($data);
    }

    public function apiTrend(Request $r)
    {
        $f = $this->validateFilters($r);
        $key = $this->cacheKey('trend', $f);
        $data = Cache::remember($key, now()->addMinutes(3), fn()=> $this->svc->trend($f));
        return response()->json($data);
    }

    public function apiMapelLeaderboard(Request $r)
    {
        $f = $this->validateFilters($r);
        $limit = (int)($r->query('limit', 10));
        $key = $this->cacheKey('mapelLeaderboard', $f, $limit);
        $data = Cache::remember($key, now()->addMinutes(3), fn()=> $this->svc->mapelLeaderboard($f, $limit));
        return response()->json($data);
    }

    public function apiKelasLeaderboard(Request $r)
    {
        $f = $this->validateFilters($r);
        $limit = (int)($r->query('limit', 10));
        $key = $this->cacheKey('kelasLeaderboard', $f, $limit);
        $data = Cache::remember($key, now()->addMinutes(3), fn()=> $this->svc->kelasLeaderboard($f, $limit));
        return response()->json($data);
    }

    public function apiTuntasBreakdown(Request $r)
    {
        $f = $this->validateFilters($r);
        $key = $this->cacheKey('tuntasBreakdown', $f);
        $data = Cache::remember($key, now()->addMinutes(3), fn()=> $this->svc->tuntasBreakdown($f));
        return response()->json($data);
    }

    public function apiRemedialQueue(Request $r)
    {
        $f = $this->validateFilters($r);
        $limit = (int)($r->query('limit', 15));
        $key = $this->cacheKey('remedialQueue', $f, $limit);
        $data = Cache::remember($key, now()->addMinutes(1), fn()=> $this->svc->remedialQueue($f, $limit));
        return response()->json($data);
    }

    // ========= Helpers =========

    private function validateFilters(Request $r): array
    {
        $data = $r->validate([
            'id_tahun_ajaran' => ['required','string'],
            'semester'        => ['required','in:Ganjil,Genap'],
            'id_kelas'        => ['nullable','string'],
            'id_mapel'        => ['nullable','string'],
            'guru'            => ['nullable','string'],
            'status'          => ['nullable','string'],
        ]);
        return $data;
    }

    private function cacheKey(string $name, array $f, $extra = null): string
    {
        return 'dash:penilaian:'. $name .':'. md5(json_encode([$f, $extra]));
    }
}
