<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\SusKuesioner;
use Illuminate\Support\Facades\Auth;

class SusController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $existingSus = SusKuesioner::where('id_pengguna', $user->id_pengguna)->first();
        
        return Inertia::render('Sus/Index', [
            'existingSus' => $existingSus,
            'userRole' => $user->level,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'q1' => 'required|integer|min:1|max:5',
            'q2' => 'required|integer|min:1|max:5',
            'q3' => 'required|integer|min:1|max:5',
            'q4' => 'required|integer|min:1|max:5',
            'q5' => 'required|integer|min:1|max:5',
            'q6' => 'required|integer|min:1|max:5',
            'q7' => 'required|integer|min:1|max:5',
            'q8' => 'required|integer|min:1|max:5',
            'q9' => 'required|integer|min:1|max:5',
            'q10' => 'required|integer|min:1|max:5',
        ]);

        // Perhitungan Skor SUS
        // Ganjil: skor - 1
        $scoreGanjil = ($request->q1 - 1) + ($request->q3 - 1) + ($request->q5 - 1) + ($request->q7 - 1) + ($request->q9 - 1);
        // Genap: 5 - skor
        $scoreGenap = (5 - $request->q2) + (5 - $request->q4) + (5 - $request->q6) + (5 - $request->q8) + (5 - $request->q10);
        
        $totalSkor = ($scoreGanjil + $scoreGenap) * 2.5;

        $user = Auth::user();

        SusKuesioner::updateOrCreate(
            ['id_pengguna' => $user->id_pengguna],
            [
                'q1' => $request->q1,
                'q2' => $request->q2,
                'q3' => $request->q3,
                'q4' => $request->q4,
                'q5' => $request->q5,
                'q6' => $request->q6,
                'q7' => $request->q7,
                'q8' => $request->q8,
                'q9' => $request->q9,
                'q10' => $request->q10,
                'skor_sus' => $totalSkor,
            ]
        );

        return back()->with('success', 'Terima kasih! Kuesioner SUS Anda berhasil disimpan dengan Skor: ' . $totalSkor);
    }
}
