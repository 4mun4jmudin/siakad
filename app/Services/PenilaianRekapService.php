<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class PenilaianRekapService
{
    /**
     * Filter helper → array [id_tahun_ajaran, semester, id_kelas?, id_mapel?]
     */
    private function baseWhere(array $f, $q = null)
    {
        $w = [
            ['pm.id_tahun_ajaran', '=', $f['id_tahun_ajaran']],
            ['pm.semester', '=', $f['semester']],
        ];
        if (!empty($f['id_kelas'])) {
            $w[] = ['pm.id_kelas', '=', $f['id_kelas']];
        }
        if (!empty($f['id_mapel'])) {
            $w[] = ['pm.id_mapel', '=', $f['id_mapel']];
        }
        if (!empty($f['status'])) {
            if ($f['status'] === 'published') {
                $w[] = ['pm.status_kunci', '=', 1];
            } else if ($f['status'] === 'pending' || $f['status'] === 'draft') {
                $w[] = ['pm.status_kunci', '=', 0];
            }
        }
        
        if ($q && !empty($f['guru'])) {
            $q->whereExists(function ($sub) use ($f) {
                $sub->select(DB::raw(1))
                    ->from('tbl_jadwal_mengajar as jm')
                    ->whereColumn('jm.id_kelas', 'pm.id_kelas')
                    ->whereColumn('jm.id_mapel', 'pm.id_mapel')
                    ->whereColumn('jm.id_tahun_ajaran', 'pm.id_tahun_ajaran')
                    ->where('jm.id_guru', $f['guru']);
            });
        }
        return $w;
    }

    public function summary(array $f): array
    {
        $cacheKey = 'penilaian_summary_' . md5(json_encode($f));
        
        return Cache::remember($cacheKey, 1800, function () use ($f) {
            $qBase = DB::table('tbl_penilaian_mapel as pm');
            $qBase->where($this->baseWhere($f, $qBase));
            $totalHeaders = (clone $qBase)->count(); // header penilaian (baris)
            $totalSiswa   = (clone $qBase)->distinct('pm.id_siswa')->count('pm.id_siswa');

            // nilai rata, median, stddev, tuntas rate
            $agg = (clone $qBase)
                ->selectRaw('AVG(pm.nilai_akhir) as avg_nilai')
                ->selectRaw('SUM(CASE WHEN pm.tuntas = 1 THEN 1 ELSE 0 END) as jml_tuntas')
                ->selectRaw('COUNT(*) as jml_baris')
                ->first();

            $avg = $agg->avg_nilai ? round($agg->avg_nilai, 2) : null;
            $passRate = ($agg->jml_baris ?? 0) > 0 ? round(($agg->jml_tuntas / $agg->jml_baris) * 100, 2) : 0;

            // median
            $median = $this->median($f);

            // stddev
            $stddev = (clone $qBase)->selectRaw('STDDEV_SAMP(pm.nilai_akhir) as sd')->value('sd');
            $stddev = $stddev !== null ? round($stddev, 2) : null;

            // progress completion
            $withDetail = (clone $qBase)
                ->join('tbl_penilaian_detail as pd', 'pd.id_penilaian', '=', 'pm.id_penilaian')
                ->distinct('pm.id_penilaian')
                ->count('pm.id_penilaian');
            $completion = $totalHeaders > 0 ? round(($withDetail / $totalHeaders) * 100, 2) : 0;

            return [
                'total_siswa'     => $totalSiswa,
                'total_header'    => $totalHeaders,
                'completion_pct'  => $completion,
                'avg_nilai'       => $avg,
                'median'          => $median,
                'stddev'          => $stddev,
                'pass_rate_pct'   => $passRate,
            ];
        });
    }

    private function median(array $f): ?float
    {
        $q = DB::table('tbl_penilaian_mapel as pm');
        $q->where($this->baseWhere($f, $q))
            ->whereNotNull('pm.nilai_akhir')
            ->orderBy('pm.nilai_akhir');

        $count = (clone $q)->count();
        if ($count === 0) return null;

        $offset = (int) floor(($count - 1) / 2);
        $vals = (clone $q)->skip($offset)->take(($count % 2 === 0) ? 2 : 1)->pluck('pm.nilai_akhir')->all();

        $median = ($count % 2 === 0) ? ( ($vals[0] + $vals[1]) / 2 ) : $vals[0];
        return round((float)$median, 2);
    }

    public function distribution(array $f, array $bins = [0,60,70,80,90,101]): array
    {
        $cacheKey = 'penilaian_distribution_' . md5(json_encode($f) . json_encode($bins));
        
        return Cache::remember($cacheKey, 1800, function () use ($f, $bins) {
            $q = DB::table('tbl_penilaian_mapel as pm');
            $q->where($this->baseWhere($f, $q));

            $counts = [];
            for ($i=0; $i < count($bins)-1; $i++) {
                $lo = $bins[$i]; $hi = $bins[$i+1]-0.00001; // include upper bound
                $label = $bins[$i] . '-' . ($bins[$i+1]-1);
                $c = (clone $q)->whereBetween('pm.nilai_akhir', [$lo, $hi])->count();
                $counts[] = ['range' => $label, 'count' => $c];
            }
            return $counts;
        });
    }

    public function trend(array $f): array
    {
        $cacheKey = 'penilaian_trend_' . md5(json_encode($f));
        
        return Cache::remember($cacheKey, 1800, function () use ($f) {
            $q = DB::table('tbl_penilaian_mapel as pm');
            $q->where($this->baseWhere($f, $q))
                ->whereNotNull('pm.updated_at')
                ->selectRaw("DATE_FORMAT(pm.updated_at, '%Y-%m') as ym")
                ->selectRaw('AVG(pm.nilai_akhir) as avg_nilai')
                ->selectRaw('SUM(CASE WHEN pm.tuntas=1 THEN 1 ELSE 0 END) as jml_tuntas')
                ->selectRaw('COUNT(*) as jml')
                ->groupBy('ym')
                ->orderBy('ym');

            return $q->get()->map(function($r){
                $pass = $r->jml > 0 ? round(($r->jml_tuntas / $r->jml) * 100, 2) : 0;
                return [
                    'period' => $r->ym,
                    'avg_nilai' => $r->avg_nilai ? round($r->avg_nilai, 2) : null,
                    'pass_rate_pct' => $pass,
                ];
            })->toArray();
        });
    }

    public function mapelLeaderboard(array $f, int $limit = 10): array
    {
        $cacheKey = 'penilaian_mapel_leaderboard_' . md5(json_encode($f) . $limit);
        
        return Cache::remember($cacheKey, 1800, function () use ($f, $limit) {
            $q = DB::table('tbl_penilaian_mapel as pm')
                ->join('tbl_mata_pelajaran as m', 'm.id_mapel','=','pm.id_mapel');
            $q->where($this->baseWhere($f, $q))
                ->select('pm.id_mapel','m.nama_mapel')
                ->selectRaw('AVG(pm.nilai_akhir) as avg_nilai')
                ->selectRaw('SUM(CASE WHEN pm.tuntas=1 THEN 1 ELSE 0 END)/COUNT(*)*100 as pass_rate_pct')
                ->groupBy('pm.id_mapel','m.nama_mapel')
                ->orderByDesc('avg_nilai')
                ->limit($limit);

            return $q->get()->map(fn($r)=>[
                'id_mapel' => $r->id_mapel,
                'nama_mapel' => $r->nama_mapel,
                'avg_nilai' => $r->avg_nilai ? round($r->avg_nilai, 2) : null,
                'pass_rate_pct' => $r->pass_rate_pct ? round($r->pass_rate_pct, 2) : 0,
            ])->toArray();
        });
    }

    public function kelasLeaderboard(array $f, int $limit = 10): array
    {
        $cacheKey = 'penilaian_kelas_leaderboard_' . md5(json_encode($f) . $limit);
        
        return Cache::remember($cacheKey, 1800, function () use ($f, $limit) {
            $q = DB::table('tbl_penilaian_mapel as pm')
                ->join('tbl_kelas as k', 'k.id_kelas','=','pm.id_kelas');
            $q->where($this->baseWhere($f, $q))
                ->select('pm.id_kelas','k.id_kelas as nama_kelas')
                ->selectRaw('AVG(pm.nilai_akhir) as avg_nilai')
                ->selectRaw('SUM(CASE WHEN pm.tuntas=1 THEN 1 ELSE 0 END)/COUNT(*)*100 as pass_rate_pct')
                ->groupBy('pm.id_kelas','k.id_kelas')
                ->orderByDesc('avg_nilai')
                ->limit($limit);

            return $q->get()->map(fn($r)=>[
                'id_kelas' => $r->id_kelas,
                'nama_kelas' => $r->nama_kelas,
                'avg_nilai' => $r->avg_nilai ? round($r->avg_nilai, 2) : null,
                'pass_rate_pct' => $r->pass_rate_pct ? round($r->pass_rate_pct, 2) : 0,
            ])->toArray();
        });
    }

    public function tuntasBreakdown(array $f): array
    {
        $q = DB::table('tbl_penilaian_mapel as pm');
        $q->where($this->baseWhere($f, $q))
            ->selectRaw('pm.predikat, COUNT(*) as jumlah')
            ->groupBy('pm.predikat');

        $byPredikat = $q->pluck('jumlah','predikat')->toArray();

        $tuntas = DB::table('tbl_penilaian_mapel as pm');
        $tuntas->where($this->baseWhere($f, $tuntas))
            ->selectRaw('SUM(CASE WHEN pm.tuntas=1 THEN 1 ELSE 0 END) as tuntas')
            ->selectRaw('SUM(CASE WHEN pm.tuntas=0 THEN 1 ELSE 0 END) as tidak')
            ->first();

        return [
            'predikat' => $byPredikat,
            'tuntas'   => [
                'ya' => (int)($tuntas->tuntas ?? 0),
                'tidak' => (int)($tuntas->tidak ?? 0),
            ],
        ];
    }

    public function remedialQueue(array $f, int $limit = 15): array
    {
        $q = DB::table('tbl_penilaian_mapel as pm')
            ->join('tbl_kelas as k', 'k.id_kelas', '=', 'pm.id_kelas')
            ->join('tbl_mata_pelajaran as m', 'm.id_mapel', '=', 'pm.id_mapel')
            ->leftJoin('tbl_jadwal_mengajar as jm', function ($join) {
                $join->on('jm.id_kelas', '=', 'pm.id_kelas')
                     ->on('jm.id_mapel', '=', 'pm.id_mapel')
                     ->on('jm.id_tahun_ajaran', '=', 'pm.id_tahun_ajaran');
            })
            ->leftJoin('tbl_guru as g', 'g.id_guru', '=', 'jm.id_guru');

        $q->where($this->baseWhere($f, $q));

        $q->select(
            'pm.id_kelas',
            'pm.id_mapel',
            'pm.id_tahun_ajaran',
            'pm.semester',
            'k.id_kelas as nama_kelas',
            'm.nama_mapel',
            DB::raw('COALESCE(g.nama_lengkap, "Belum Ditentukan") as nama_guru'),
            DB::raw('MAX(pm.updated_at) as tanggal'),
            DB::raw('MAX(pm.status_kunci) as status_kunci')
        )
        ->groupBy('pm.id_kelas', 'pm.id_mapel', 'pm.id_tahun_ajaran', 'pm.semester', 'k.id_kelas', 'm.nama_mapel', 'g.nama_lengkap');

        return $q->orderByDesc('tanggal')->limit($limit)->get()->map(function ($r) {
            return [
                'id_kelas' => $r->id_kelas,
                'id_mapel' => $r->id_mapel,
                'komponen' => 'Penilaian Akhir',
                'nama_mapel' => $r->nama_mapel,
                'nama_kelas' => $r->nama_kelas,
                'nama_guru' => $r->nama_guru,
                'tahun_ajaran' => $r->id_tahun_ajaran,
                'semester' => $r->semester,
                'tanggal' => $r->tanggal ? date('d-m-Y H:i', strtotime($r->tanggal)) : '—',
                'status' => $r->status_kunci ? 'Dipublish' : 'Belum Dipublish',
            ];
        })->toArray();
    }
}
