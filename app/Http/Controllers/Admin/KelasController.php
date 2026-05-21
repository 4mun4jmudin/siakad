<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kelas;
use App\Models\Guru;
use App\Models\Siswa;
use App\Models\JadwalMengajar;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\LogAktivitas;
use Inertia\Inertia;

class KelasController extends Controller
{
    /**
     * Menampilkan halaman daftar kelas dengan statistik dan pencarian.
     */
    public function index(Request $request)
    {
        // Menghitung statistik untuk kartu di bagian atas
        $stats = [
            'total' => Kelas::count(),
            'aktif' => Kelas::whereHas('siswa', function ($query) {
                $query->where('status', 'Aktif');
            })->count(), // Asumsi kelas aktif jika punya siswa aktif
            'totalSiswa' => Siswa::where('status', 'Aktif')->count(),
            'denganWali' => Kelas::whereNotNull('id_wali_kelas')->count(),
        ];

        // Query untuk mengambil daftar kelas
        $kelasList = Kelas::with(['waliKelas'])
            ->withCount('siswa') // Menghitung jumlah siswa di setiap kelas
            ->when($request->input('search'), function ($query, $search) {
                $query->where('tingkat', 'like', "%{$search}%")
                      ->orWhere('jurusan', 'like', "%{$search}%")
                      ->orWhereHas('waliKelas', function ($q) use ($search) {
                          $q->where('nama_lengkap', 'like', "%{$search}%");
                      });
            })
            ->latest('tingkat')
            ->get();

        // Ambil ID guru yang sudah menjadi wali kelas (pastikan huruf besar dan hilangkan spasi)
        $assignedWaliIds = Kelas::whereNotNull('id_wali_kelas')->pluck('id_wali_kelas')->map(function ($id) {
            return strtoupper(trim($id));
        })->toArray();

        // Ambil guru aktif dan tambahkan flag is_assigned untuk filtering di frontend
        $guruOptions = Guru::where('status', 'Aktif')->get()->map(function ($guru) use ($assignedWaliIds) {
            $guru->is_assigned = in_array(strtoupper(trim($guru->id_guru)), $assignedWaliIds);
            return $guru;
        });

        return Inertia::render('admin/Kelas/Index', [
            'kelasList' => $kelasList,
            'stats' => $stats,
            'filters' => $request->only(['search']),
            'guruOptions' => $guruOptions,
        ]);
    }

    /**
     * Menampilkan halaman detail sebuah kelas dengan data untuk tab.
     */
    public function show(Request $request, Kelas $kela)
    {
        // Eager load relasi wali kelas
        $kela->load(['waliKelas']);

        // Ambil daftar siswa di kelas ini dengan pencarian & paginasi
        $siswasInKelas = Siswa::where('id_kelas', $kela->id_kelas)
            ->when($request->input('search'), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('nama_lengkap', 'like', "%{$search}%")
                      ->orWhere('nis', 'like', "%{$search}%");
                });
            })
            ->get();

        // Ambil data untuk tab "Jadwal Pelajaran"
        $jadwalPelajaran = JadwalMengajar::where('id_kelas', $kela->id_kelas)
            ->with(['guru', 'mataPelajaran']) // Eager load relasi guru & mapel
            ->get()
            ->sortBy(function($jadwal) { // Urutkan berdasarkan hari
                $daysOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
                return array_search($jadwal->hari, $daysOrder);
            });

        // Ambil ID guru yang sudah menjadi wali kelas
        $assignedWaliIds = Kelas::whereNotNull('id_wali_kelas')->pluck('id_wali_kelas')->map(function ($id) {
            return strtoupper(trim($id));
        })->toArray();

        // Ambil guru aktif dan tambahkan flag is_assigned untuk filtering di frontend
        $guruOptions = Guru::where('status', 'Aktif')->get()->map(function ($guru) use ($assignedWaliIds) {
            $guru->is_assigned = in_array(strtoupper(trim($guru->id_guru)), $assignedWaliIds);
            return $guru;
        });

        // Ambil data siswa yang belum memiliki kelas
        $unassignedSiswas = Siswa::whereNull('id_kelas')
            ->orderBy('nama_lengkap')
            ->get(['id_siswa', 'nis', 'nama_lengkap', 'jenis_kelamin']);

        return Inertia::render('admin/Kelas/Show', [
            'kelas' => $kela,
            'siswasInKelas' => $siswasInKelas,
            'unassignedSiswas' => $unassignedSiswas,
            'jadwalPelajaran' => $jadwalPelajaran,
            'filters' => $request->only(['search']),
            'guruOptions' => $guruOptions,
        ]);
    }

    /**
     * Menyimpan data kelas baru ke database.
     */
    public function store(Request $request)
    {
        // Convert empty string to null to prevent unique constraint issues
        if ($request->id_wali_kelas === '') {
            $request->merge(['id_wali_kelas' => null]);
        }

        $validated = $request->validate([
            'tingkat' => 'required|string|max:10',
            'jurusan' => 'nullable|string|max:50',
            'id_wali_kelas' => ['nullable', 'exists:tbl_guru,id_guru', Rule::unique('tbl_kelas', 'id_wali_kelas')->whereNull('deleted_at')],
        ]);

        // Cek duplikat kelas (kombinasi tingkat + jurusan harus unik)
        $exists = Kelas::where('tingkat', $validated['tingkat'])
            ->where('jurusan', $validated['jurusan'] ?? null)
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'tingkat' => 'Kelas ' . $validated['tingkat'] . ($validated['jurusan'] ? '-' . $validated['jurusan'] : '') . ' sudah ada di database.',
            ])->withInput();
        }

        $id_kelas = 'KLS-' . now()->format('ymd') . \Illuminate\Support\Str::random(4);
        
        Kelas::create(array_merge($validated, ['id_kelas' => strtoupper($id_kelas)]));
        return back()->with('success', 'Data Kelas berhasil ditambahkan.');
    }

    /**
     * Memperbarui data kelas di database.
     */
    public function update(Request $request, Kelas $kela)
    {
        // Convert empty string to null to prevent unique constraint issues
        if ($request->id_wali_kelas === '') {
            $request->merge(['id_wali_kelas' => null]);
        }

        $validated = $request->validate([
            'tingkat' => 'required|string|max:10',
            'jurusan' => 'nullable|string|max:50',
            'id_wali_kelas' => ['nullable', 'exists:tbl_guru,id_guru', Rule::unique('tbl_kelas', 'id_wali_kelas')->ignore($kela->id_kelas, 'id_kelas')->whereNull('deleted_at')],
        ]);

        // Cek duplikat kelas (kombinasi tingkat + jurusan unik, kecuali diri sendiri)
        $exists = Kelas::where('tingkat', $validated['tingkat'])
            ->where('jurusan', $validated['jurusan'] ?? null)
            ->where('id_kelas', '!=', $kela->id_kelas)
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'tingkat' => 'Kelas ' . $validated['tingkat'] . ($validated['jurusan'] ? '-' . $validated['jurusan'] : '') . ' sudah ada di database.',
            ])->withInput();
        }

        $kela->update($validated);
        return back()->with('success', 'Data Kelas berhasil diperbarui.');
    }

    /**
     * Menghapus data kelas dari database.
     */
    public function destroy(Kelas $kela)
    {
        // Set id_kelas menjadi null untuk semua siswa yang ada di kelas ini
        if ($kela->siswa()->count() > 0) {
            Siswa::where('id_kelas', $kela->id_kelas)->update(['id_kelas' => null]);
        }
        
        $kela->delete();
        return to_route('admin.kelas.index')->with('message', 'Data Kelas berhasil dihapus.');
    }

    /**
     * Menghapus banyak kelas sekaligus (Bulk Delete).
     */
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:tbl_kelas,id_kelas',
        ]);

        $ids = $request->ids;
        $count = 0;

        try {
            DB::transaction(function () use ($ids, &$count) {
                // Set id_kelas menjadi null untuk semua siswa yang ada di kelas-kelas ini
                Siswa::whereIn('id_kelas', $ids)->update(['id_kelas' => null]);
                
                // Hapus kelas-kelas tersebut
                $count = Kelas::whereIn('id_kelas', $ids)->delete();
                
                LogAktivitas::create([
                    'id_pengguna' => Auth::id() ?? 1,
                    'waktu'       => now(),
                    'aksi'        => 'Hapus Massal Kelas',
                    'keterangan'  => "Menghapus {$count} data kelas."
                ]);
            });

            return back()->with('success', "Berhasil menghapus {$count} data kelas.");
        } catch (\Throwable $e) {
            Log::error('BULK DELETE KELAS ERROR', ['error' => $e->getMessage()]);
            return back()->with('error', 'Gagal menghapus data kelas secara massal.');
        }
    }

    /**
     * Menambahkan siswa ke dalam kelas tertentu.
     */
    public function addStudents(Request $request, Kelas $kela)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:tbl_siswa,id_siswa',
        ]);

        $ids = $request->ids;

        try {
            DB::transaction(function () use ($ids, $kela) {
                Siswa::whereIn('id_siswa', $ids)->update(['id_kelas' => $kela->id_kelas]);

                LogAktivitas::create([
                    'id_pengguna' => Auth::id() ?? 1,
                    'waktu'       => now(),
                    'aksi'        => 'Tambah Siswa ke Kelas',
                    'keterangan'  => "Menambahkan " . count($ids) . " siswa ke kelas {$kela->tingkat} {$kela->jurusan}."
                ]);
            });

            return back()->with('success', count($ids) . " siswa berhasil ditambahkan ke kelas.");
        } catch (\Throwable $e) {
            Log::error('ADD STUDENTS ERROR', ['error' => $e->getMessage()]);
            return back()->with('error', 'Gagal menambahkan siswa ke kelas.');
        }
    }

    /**
     * Mengeluarkan siswa dari kelas tertentu.
     */
    public function removeStudents(Request $request, Kelas $kela)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:tbl_siswa,id_siswa',
        ]);

        $ids = $request->ids;

        try {
            DB::transaction(function () use ($ids, $kela) {
                // Pastikan yang dikeluarkan adalah siswa dari kelas ini
                Siswa::whereIn('id_siswa', $ids)
                     ->where('id_kelas', $kela->id_kelas)
                     ->update(['id_kelas' => null]);

                LogAktivitas::create([
                    'id_pengguna' => Auth::id() ?? 1,
                    'waktu'       => now(),
                    'aksi'        => 'Keluarkan Siswa dari Kelas',
                    'keterangan'  => "Mengeluarkan " . count($ids) . " siswa dari kelas {$kela->tingkat} {$kela->jurusan}."
                ]);
            });

            return back()->with('success', count($ids) . " siswa berhasil dikeluarkan dari kelas.");
        } catch (\Throwable $e) {
            Log::error('REMOVE STUDENTS ERROR', ['error' => $e->getMessage()]);
            return back()->with('error', 'Gagal mengeluarkan siswa dari kelas.');
        }
    }

    /**
     * Assign wali kelas secara serentak (otomatis/random)
     * Mengutamakan guru yang mengajar di kelas tersebut.
     */
    public function randomAssignWali()
    {
        try {
            DB::beginTransaction();

            // 1. Ambil semua kelas yang belum punya wali kelas
            $kelasKosong = Kelas::whereNull('id_wali_kelas')->get();

            if ($kelasKosong->isEmpty()) {
                return back()->with('message', 'Semua kelas sudah memiliki wali kelas.');
            }

            // 2. Ambil ID guru yang SUDAH menjadi wali kelas
            $assignedWaliIds = Kelas::whereNotNull('id_wali_kelas')->pluck('id_wali_kelas')->map(function ($id) {
                return strtoupper(trim($id));
            })->toArray();

            // 3. Ambil semua guru aktif yang BELUM menjadi wali kelas
            $guruBebas = Guru::where('status', 'Aktif')
                ->get()
                ->reject(function ($guru) use ($assignedWaliIds) {
                    return in_array(strtoupper(trim($guru->id_guru)), $assignedWaliIds);
                })->values();

            $assignedCount = 0;

            foreach ($kelasKosong as $kelas) {
                if ($guruBebas->isEmpty()) {
                    break;
                }

                $selectedGuruId = null;

                // 4. Cari guru yang mengajar di kelas ini (via JadwalMengajar)
                $guruMengajarDiKelas = JadwalMengajar::where('id_kelas', $kelas->id_kelas)
                    ->pluck('id_guru')
                    ->map(function ($id) {
                        return strtoupper(trim($id));
                    })->toArray();

                // Cek apakah ada guru bebas yang mengajar di kelas ini
                $guruPrioritas = $guruBebas->first(function ($guru) use ($guruMengajarDiKelas) {
                    return in_array(strtoupper(trim($guru->id_guru)), $guruMengajarDiKelas);
                });

                if ($guruPrioritas) {
                    $selectedGuruId = $guruPrioritas->id_guru;
                } else {
                    // 5. Jika tidak ada yang cocok, ambil secara acak
                    $randomGuru = $guruBebas->random();
                    $selectedGuruId = $randomGuru->id_guru;
                }

                // Update kelas dengan wali kelas terpilih
                $kelas->update(['id_wali_kelas' => $selectedGuruId]);
                $assignedCount++;

                // Hapus guru yang terpilih dari daftar bebas
                $guruBebas = $guruBebas->reject(function ($guru) use ($selectedGuruId) {
                    return $guru->id_guru === $selectedGuruId;
                })->values();
            }

            if ($assignedCount > 0) {
                LogAktivitas::create([
                    'id_pengguna' => Auth::id() ?? 1,
                    'waktu'       => now(),
                    'aksi'        => 'Auto-Assign Wali Kelas',
                    'keterangan'  => "Sistem menetapkan {$assignedCount} wali kelas secara otomatis."
                ]);
            }

            DB::commit();

            return back()->with('success', "Berhasil menetapkan wali kelas untuk {$assignedCount} kelas yang kosong.");
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('RANDOM ASSIGN WALI ERROR', ['error' => $e->getMessage()]);
            return back()->with('error', 'Gagal melakukan auto-assign wali kelas.');
        }
    }
}
