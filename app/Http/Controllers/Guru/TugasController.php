<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Tugas;
use App\Models\JadwalMengajar;
use App\Models\PengumpulanTugas;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class TugasController extends Controller
{
    public function index(Request $request)
    {
        $guru = Auth::user()->guru;
        
        $tugas = Tugas::whereHas('jadwalMengajar', function ($q) use ($guru) {
                $q->where('id_guru', $guru->id_guru);
            })
            ->with(['jadwalMengajar.kelas', 'jadwalMengajar.mataPelajaran'])
            ->withCount('pengumpulanTugas')
            ->when($request->search, function ($q, $search) {
                $q->where('judul_tugas', 'like', "%{$search}%");
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Guru/Tugas/Index', [
            'tugas' => $tugas,
            'filters' => $request->only(['search'])
        ]);
    }

    public function create()
    {
        $guru = Auth::user()->guru;
        $jadwalOptions = JadwalMengajar::where('id_guru', $guru->id_guru)
            ->with(['kelas', 'mataPelajaran'])
            ->get();

        return Inertia::render('Guru/Tugas/Create', [
            'jadwalOptions' => $jadwalOptions
        ]);
    }

    public function store(Request $request)
    {
        $guru = Auth::user()->guru;
        
        $validated = $request->validate([
            'id_jadwal' => 'required|exists:tbl_jadwal_mengajar,id_jadwal',
            'judul_tugas' => 'required|string|max:150',
            'deskripsi' => 'nullable|string',
            'tenggat_waktu' => 'required|date|after:today',
            'status' => 'required|in:Draft,Diterbitkan,Selesai',
            'file_tugas' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:5120', // Max 5MB
            'tipe_tugas' => 'required|in:Upload,Pemberitahuan',
        ]);

        $jadwal = JadwalMengajar::find($validated['id_jadwal']);
        if ($jadwal->id_guru !== $guru->id_guru) {
            abort(403, 'Akses ditolak.');
        }

        DB::beginTransaction();
        try {
            $filePath = null;
            if ($request->hasFile('file_tugas')) {
                $filePath = $request->file('file_tugas')->store('tugas', 'public');
            }

            Tugas::create([
                'id_jadwal' => $validated['id_jadwal'],
                'judul_tugas' => $validated['judul_tugas'],
                'deskripsi_tugas' => $validated['deskripsi'] ?? null,
                'file_lampiran' => $filePath,
                'tenggat_waktu' => $validated['tenggat_waktu'],
                'status' => $validated['status'],
                'tipe_tugas' => $validated['tipe_tugas'],
            ]);

            DB::commit();
            return redirect()->route('guru.tugas.index')->with('success', 'Tugas berhasil dibuat.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage())->withInput();
        }
    }

    public function edit(Tugas $tugas)
    {
        $guru = Auth::user()->guru;
        $tugas->load('jadwalMengajar');

        if ($tugas->jadwalMengajar->id_guru !== $guru->id_guru) {
            abort(403, 'Akses ditolak.');
        }

        $jadwalOptions = JadwalMengajar::where('id_guru', $guru->id_guru)
            ->with(['kelas', 'mataPelajaran'])
            ->get();

        return Inertia::render('Guru/Tugas/Edit', [
            'tugas' => $tugas,
            'jadwalOptions' => $jadwalOptions
        ]);
    }

    public function update(Request $request, Tugas $tugas)
    {
        $guru = Auth::user()->guru;
        $tugas->load('jadwalMengajar');

        if ($tugas->jadwalMengajar->id_guru !== $guru->id_guru) {
            abort(403, 'Akses ditolak.');
        }

        $validated = $request->validate([
            'id_jadwal' => 'required|exists:tbl_jadwal_mengajar,id_jadwal',
            'judul_tugas' => 'required|string|max:150',
            'deskripsi' => 'nullable|string',
            'tenggat_waktu' => 'required|date',
            'status' => 'required|in:Draft,Diterbitkan,Selesai',
            'file_tugas' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:5120',
            'tipe_tugas' => 'required|in:Upload,Pemberitahuan',
        ]);

        $jadwal = JadwalMengajar::find($validated['id_jadwal']);
        if ($jadwal->id_guru !== $guru->id_guru) {
            abort(403, 'Akses ditolak.');
        }

        DB::beginTransaction();
        try {
            $filePath = $tugas->file_lampiran;
            if ($request->hasFile('file_tugas')) {
                if ($tugas->file_lampiran) {
                    Storage::disk('public')->delete($tugas->file_lampiran);
                }
                $filePath = $request->file('file_tugas')->store('tugas', 'public');
            }

            $tugas->update([
                'id_jadwal' => $validated['id_jadwal'],
                'judul_tugas' => $validated['judul_tugas'],
                'deskripsi_tugas' => $validated['deskripsi'] ?? null,
                'file_lampiran' => $filePath,
                'tenggat_waktu' => $validated['tenggat_waktu'],
                'status' => $validated['status'],
                'tipe_tugas' => $validated['tipe_tugas'],
            ]);

            DB::commit();
            return redirect()->route('guru.tugas.index')->with('success', 'Tugas berhasil diperbarui.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage())->withInput();
        }
    }

    public function show(Tugas $tugas)
    {
        $guru = Auth::user()->guru;
        $tugas->load(['jadwalMengajar.kelas', 'jadwalMengajar.mataPelajaran']);

        if ($tugas->jadwalMengajar->id_guru !== $guru->id_guru) {
            abort(403, 'Akses ditolak.');
        }

        // Ambil data pengumpulan tugas oleh siswa
        $pengumpulan = PengumpulanTugas::where('id_tugas', $tugas->id_tugas)
            ->with('siswa')
            ->orderBy('created_at', 'desc')
            ->get();

        // Ambil daftar semua siswa di kelas tersebut
        $siswaKelas = \App\Models\Siswa::where('id_kelas', $tugas->jadwalMengajar->id_kelas)
            ->orderBy('nama_lengkap')
            ->get();

        // Map data pengumpulan dengan daftar siswa (termasuk yang belum mengumpulkan)
        $hasilPengumpulan = $siswaKelas->map(function ($siswa) use ($pengumpulan) {
            $pengumpulanSiswa = $pengumpulan->firstWhere('id_siswa', $siswa->id_siswa);
            return [
                'id_siswa' => $siswa->id_siswa,
                'nisn' => $siswa->nisn,
                'nama_lengkap' => $siswa->nama_lengkap,
                'id_pengumpulan' => $pengumpulanSiswa ? $pengumpulanSiswa->id_pengumpulan : null,
                'file_jawaban' => $pengumpulanSiswa ? $pengumpulanSiswa->file_jawaban : null,
                'teks_jawaban' => $pengumpulanSiswa ? $pengumpulanSiswa->teks_jawaban : null,
                'status_pengumpulan' => $pengumpulanSiswa ? $pengumpulanSiswa->status_pengumpulan : 'Belum Mengumpulkan',
                'waktu_pengumpulan' => $pengumpulanSiswa ? $pengumpulanSiswa->created_at : null,
                'nilai' => $pengumpulanSiswa ? $pengumpulanSiswa->nilai : null,
                'catatan_guru' => $pengumpulanSiswa ? $pengumpulanSiswa->catatan_guru : null,
            ];
        });

        return Inertia::render('Guru/Tugas/Show', [
            'tugas' => $tugas,
            'hasilPengumpulan' => $hasilPengumpulan
        ]);
    }

    public function nilai(Request $request, Tugas $tugas, $id_siswa)
    {
        $guru = Auth::user()->guru;
        $tugas->load('jadwalMengajar');

        if ($tugas->jadwalMengajar->id_guru !== $guru->id_guru) {
            abort(403, 'Akses ditolak.');
        }

        $validated = $request->validate([
            'nilai' => 'required|numeric|min:0|max:100',
            'catatan_guru' => 'nullable|string'
        ]);

        PengumpulanTugas::updateOrCreate(
            [
                'id_tugas' => $tugas->id_tugas,
                'id_siswa' => $id_siswa,
            ],
            [
                'nilai' => $validated['nilai'],
                'catatan_guru' => $validated['catatan_guru'] ?? null,
                'status_pengumpulan' => 'Dinilai',
            ]
        );

        return back()->with('success', 'Nilai berhasil disimpan.');
    }
    
    public function destroy(Tugas $tugas)
    {
        $guru = Auth::user()->guru;
        $tugas->load('jadwalMengajar');

        if ($tugas->jadwalMengajar->id_guru !== $guru->id_guru) {
            abort(403, 'Akses ditolak.');
        }

        $tugas->delete();

        return redirect()->route('guru.tugas.index')->with('success', 'Tugas berhasil dihapus.');
    }
}
