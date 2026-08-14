<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Feedback;
use Illuminate\Support\Facades\Auth;

class FeedbackController extends Controller
{
    /**
     * Menampilkan halaman form feedback.
     */
    public function index()
    {
        // Cari tau apakah user sudah pernah submit feedback sebelumnya (opsional)
        $user = Auth::user();
        $existingFeedback = Feedback::where('id_pengguna', $user->id_pengguna)->first();

        // Gunakan view yang sama untuk semua user role
        // Navigasinya akan ditangani oleh wrapper layout di Frontend (Inertia)
        return Inertia::render('Feedback/Index', [
            'existingFeedback' => $existingFeedback,
            'userRole' => $user->level,
        ]);
    }

    /**
     * Menyimpan feedback.
     */
    public function store(Request $request)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'komentar' => 'nullable|string|max:1000',
        ]);

        $user = Auth::user();

        // Update or Create feedback agar tidak duplikat
        Feedback::updateOrCreate(
            ['id_pengguna' => $user->id_pengguna],
            [
                'rating' => $request->rating,
                'komentar' => $request->komentar,
            ]
        );

        return redirect()->back()->with('success', 'Terima kasih atas penilaian dan masukannya!');
    }
}
