<?php

namespace App\Http\Controllers\Siswa;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Tugas;
use App\Models\PengumpulanTugas;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class TugasController extends Controller
{
    public function index(Request $request)
    {
        $siswa = Auth::user()->siswa;
        
        // Ambil daftar tugas berdasarkan jadwal mengajar di kelas siswa tersebut
        $tugas = Tugas::whereHas('jadwalMengajar', function ($q) use ($siswa) {
                $q->where('id_kelas', $siswa->id_kelas);
            })
            ->where('status', '!=', 'Draft') // Siswa tidak melihat draft
            ->with(['jadwalMengajar.mataPelajaran', 'jadwalMengajar.guru'])
            ->with(['pengumpulanTugas' => function ($q) use ($siswa) {
                $q->where('id_siswa', $siswa->id_siswa);
            }])
            ->when($request->search, function ($q, $search) {
                $q->where('judul_tugas', 'like', "%{$search}%");
            })
            ->orderBy('tenggat_waktu', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Siswa/Tugas/Index', [
            'tugas' => $tugas,
            'filters' => $request->only(['search'])
        ]);
    }

    public function show(Tugas $tugas)
    {
        $siswa = Auth::user()->siswa;
        
        $tugas->load(['jadwalMengajar.mataPelajaran', 'jadwalMengajar.guru']);
        
        if ($tugas->jadwalMengajar->id_kelas !== $siswa->id_kelas || $tugas->status === 'Draft') {
            abort(403, 'Akses ditolak.');
        }

        $pengumpulan = PengumpulanTugas::where('id_tugas', $tugas->id_tugas)
            ->where('id_siswa', $siswa->id_siswa)
            ->first();

        return Inertia::render('Siswa/Tugas/Show', [
            'tugas' => $tugas,
            'pengumpulan' => $pengumpulan
        ]);
    }

    public function kumpulkan(Request $request, Tugas $tugas)
    {
        $siswa = Auth::user()->siswa;
        
        $tugas->load('jadwalMengajar');
        
        if ($tugas->jadwalMengajar->id_kelas !== $siswa->id_kelas || $tugas->status === 'Draft') {
            abort(403, 'Akses ditolak.');
        }

        // Cek jika sudah dinilai, tidak boleh kumpul ulang
        $pengumpulan = PengumpulanTugas::where('id_tugas', $tugas->id_tugas)
            ->where('id_siswa', $siswa->id_siswa)
            ->first();
            
        if ($pengumpulan && $pengumpulan->status_pengumpulan === 'Dinilai') {
            return back()->with('error', 'Tugas sudah dinilai, tidak dapat diubah.');
        }

        if ($tugas->tipe_tugas === 'Pemberitahuan') {
            if ($pengumpulan) {
                $pengumpulan->update([
                    'teks_jawaban' => 'Telah dikonfirmasi selesai',
                    'file_jawaban' => null,
                    'waktu_pengumpulan' => now(),
                    'status_pengumpulan' => 'Selesai'
                ]);
            } else {
                PengumpulanTugas::create([
                    'id_tugas' => $tugas->id_tugas,
                    'id_siswa' => $siswa->id_siswa,
                    'file_jawaban' => null,
                    'teks_jawaban' => 'Telah dikonfirmasi selesai',
                    'waktu_pengumpulan' => now(),
                    'status_pengumpulan' => 'Selesai'
                ]);
            }

            return redirect()->back()->with('success', 'Tugas berhasil dikonfirmasi selesai.');
        }

        $validated = $request->validate([
            'teks_jawaban' => 'nullable|string',
            'file_jawaban' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png,zip,rar|max:10240', // Max 10MB
        ]);

        if (empty($validated['teks_jawaban']) && !$request->hasFile('file_jawaban')) {
            return back()->with('error', 'Teks jawaban atau file jawaban harus diisi.');
        }

        $filePath = $pengumpulan ? $pengumpulan->file_jawaban : null;

        if ($request->hasFile('file_jawaban')) {
            if ($filePath) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($filePath);
            }
            $filePath = $request->file('file_jawaban')->store('pengumpulan_tugas', 'public');
        }

        if ($pengumpulan) {
            $pengumpulan->update([
                'teks_jawaban' => $validated['teks_jawaban'],
                'file_jawaban' => $filePath,
                'waktu_pengumpulan' => now(),
                'status_pengumpulan' => 'Menunggu Penilaian'
            ]);
        } else {
            PengumpulanTugas::create([
                'id_tugas' => $tugas->id_tugas,
                'id_siswa' => $siswa->id_siswa,
                'file_jawaban' => $filePath,
                'teks_jawaban' => $validated['teks_jawaban'],
                'waktu_pengumpulan' => now(),
                'status_pengumpulan' => 'Menunggu Penilaian'
            ]);
        }

        return redirect()->back()->with('success', 'Tugas berhasil dikumpulkan.');
    }
}
