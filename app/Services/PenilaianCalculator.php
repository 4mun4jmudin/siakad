<?php

namespace App\Services;

use App\Models\BobotPenilaian;
use App\Models\KomponenPenilaian;
use App\Models\PenilaianMapel;
use App\Models\MataPelajaran;
use Illuminate\Support\Facades\DB;

class PenilaianCalculator
{
    public function compute(PenilaianMapel $pen): PenilaianMapel
    {
        // 1. Get all components
        $components = KomponenPenilaian::all();
        
        // 2. Fetch weights for this mapel, TA, and semester
        $weights = BobotPenilaian::where([
            'id_mapel'        => $pen->id_mapel,
            'id_tahun_ajaran' => $pen->id_tahun_ajaran,
            'semester'        => $pen->semester,
        ])->get()->pluck('bobot', 'id_komponen')->toArray();

        // Standard default weights mapping if no weights are configured in DB at all
        $defaultWeights = [
            'Tugas' => 30.0,
            'UTS'   => 30.0,
            'UAS'   => 40.0,
        ];

        $w = [];
        foreach ($components as $comp) {
            $w[$comp->id_komponen] = (float)($weights[$comp->id_komponen] ?? ($defaultWeights[$comp->nama] ?? 0.0));
        }

        // If the sum of all configured weights is 0, distribute equally
        if (array_sum($w) == 0 && count($w) > 0) {
            $equalWeight = 100.0 / count($w);
            foreach ($w as $idKomp => $val) {
                $w[$idKomp] = $equalWeight;
            }
        }

        // 3. Retrieve all grade details for this header, grouped by id_komponen
        // If id_komponen is null, map it by matching the string 'komponen' with the component names in DB
        $details = $pen->details()->get();
        
        $compNames = $components->pluck('id_komponen', 'nama')->toArray();
        foreach ($details as $d) {
            if (is_null($d->id_komponen) && !empty($d->komponen)) {
                // Try mapping old string
                $mappedName = $d->komponen;
                if ($mappedName === 'PTS') $mappedName = 'UTS';
                if ($mappedName === 'PAS') $mappedName = 'UAS';
                if ($mappedName === 'UH') $mappedName = 'Tugas';
                
                if (isset($compNames[$mappedName])) {
                    $d->id_komponen = $compNames[$mappedName];
                    $d->save();
                }
            }
        }

        // Re-fetch details after potential mapping update
        $groupedDetails = $pen->details()->whereNotNull('id_komponen')->get()->groupBy('id_komponen');
        
        $avg = [];
        foreach ($w as $idKomp => $wb) {
            $rows = $groupedDetails->get($idKomp, collect());
            if ($rows->isEmpty()) {
                $avg[$idKomp] = null;
                continue;
            }

            // Support local detail-level weights if present
            $hasLocalWeight = $rows->contains(fn($r) => !is_null($r->bobot));
            if ($hasLocalWeight) {
                $num = 0;
                $den = 0;
                foreach ($rows as $r) {
                    $b = (float)($r->bobot ?? 0);
                    $num += ((float)$r->nilai) * $b;
                    $den += $b;
                }
                $avg[$idKomp] = $den > 0 ? $num / $den : null;
            } else {
                $avg[$idKomp] = (float)$rows->avg('nilai');
            }
        }

        // 4. Calculate overall final grade based on components weight
        $sumActiveWeights = 0.0;
        foreach ($w as $idKomp => $wb) {
            if ($avg[$idKomp] !== null && $wb > 0) {
                $sumActiveWeights += $wb;
            }
        }

        $total = 0.0;
        if ($sumActiveWeights > 0) {
            foreach ($w as $idKomp => $wb) {
                if ($avg[$idKomp] !== null && $wb > 0) {
                    // Normalise component weight against active components
                    $total += $avg[$idKomp] * ($wb / $sumActiveWeights);
                }
            }
            $pen->nilai_akhir = round($total, 2);
        } else {
            // No graded active components
            $pen->nilai_akhir = null;
        }

        // 5. Set Predicate and Tuntas Status
        $kkm = (float)(MataPelajaran::where('id_mapel', $pen->id_mapel)->value('kkm') ?? 75);
        
        if (!is_null($pen->nilai_akhir)) {
            $pen->predikat = $this->getPredikat($pen->nilai_akhir);
            $pen->tuntas = $pen->nilai_akhir >= $kkm;
        } else {
            $pen->predikat = null;
            $pen->tuntas = null;
        }
        
        $pen->save();

        return $pen;
    }

    private function getPredikat(float $n): string
    {
        if ($n >= 90) return 'A';
        if ($n >= 80) return 'B';
        if ($n >= 70) return 'C';
        return 'D';
    }
}
