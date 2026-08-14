<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\SusKuesioner;

class SusController extends Controller
{
    public function index()
    {
        $evaluations = SusKuesioner::with('pengguna')
            ->orderBy('created_at', 'desc')
            ->get();

        $totalSkor = $evaluations->sum('skor_sus');
        $count = $evaluations->count();
        $averageScore = $count > 0 ? round($totalSkor / $count, 2) : 0;

        $grade = 'F';
        $acceptability = 'Not Acceptable';

        if ($averageScore >= 80.3) {
            $grade = 'A';
            $acceptability = 'Acceptable';
        } elseif ($averageScore >= 68) {
            $grade = 'B/C';
            $acceptability = 'Acceptable';
        } elseif ($averageScore >= 51) {
            $grade = 'D';
            $acceptability = 'Marginal';
        }

        return Inertia::render('admin/Sus/Index', [
            'evaluations' => $evaluations,
            'stats' => [
                'averageScore' => $averageScore,
                'totalResponden' => $count,
                'grade' => $grade,
                'acceptability' => $acceptability,
            ]
        ]);
    }
}
