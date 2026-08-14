<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Feedback;

class FeedbackController extends Controller
{
    /**
     * Menampilkan daftar feedback pengguna untuk Admin.
     */
    public function index()
    {
        $feedbacks = Feedback::with('pengguna')->latest()->get();

        // Calculate stats
        $totalFeedback = $feedbacks->count();
        $averageRating = $totalFeedback > 0 ? round($feedbacks->avg('rating'), 2) : 0;
        
        $ratingCounts = [
            1 => $feedbacks->where('rating', 1)->count(),
            2 => $feedbacks->where('rating', 2)->count(),
            3 => $feedbacks->where('rating', 3)->count(),
            4 => $feedbacks->where('rating', 4)->count(),
            5 => $feedbacks->where('rating', 5)->count(),
        ];

        return Inertia::render('admin/Feedback/Index', [
            'feedbacks' => $feedbacks,
            'stats' => [
                'total' => $totalFeedback,
                'average' => $averageRating,
                'counts' => $ratingCounts
            ]
        ]);
    }

    /**
     * Menghapus feedback (opsional, jika admin ingin menghapus komentar spam).
     */
    public function destroy($id)
    {
        $feedback = Feedback::findOrFail($id);
        $feedback->delete();

        return redirect()->back()->with('success', 'Data feedback berhasil dihapus.');
    }
}
