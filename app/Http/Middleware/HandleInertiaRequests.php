<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;
use App\Models\SuratIzin;
use App\Models\AksesEditAbsensi;
use App\Models\Pengaturan;
use Illuminate\Support\Str;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => function () use ($request) {
                    $user = $request->user();
                    if ($user) {
                        if ($user->level === 'Siswa') {
                            $user->load('siswa:id_pengguna,foto_profil');
                            $user->foto_profil = $user->siswa?->foto_profil;
                        } elseif ($user->level === 'Guru') {
                            $user->load('guru:id_pengguna,foto_profil');
                            $user->foto_profil = $user->guru?->foto_profil;
                        } elseif ($user->level === 'Orang Tua') {
                            $user->load('orangTuaWali:id_pengguna,foto_profil');
                            $user->foto_profil = $user->orangTuaWali?->foto_profil;
                        }
                    }
                    return $user;
                },
            ],
            'ziggy' => function () use ($request) {
                return array_merge((new Ziggy)->toArray(), [
                    'location' => $request->url(),
                ]);
            },
            'flash' => [
                'message' => fn () => $request->session()->get('message'),
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
                'status'  => fn () => $request->session()->get('status'),
                '_ts'     => fn () => microtime(true), // Timestamp unik untuk trigger toast di React
            ],
            // Data Pengaturan Global (Logo, Nama Sekolah, dll)
            'pengaturan' => fn () => Pengaturan::first(),
            
            // Mode Sistem Per Role (Full / Absensi Only) - disimpan di database
            'systemMode' => function () {
                $pengaturan = Pengaturan::first();
                return [
                    'admin' => $pengaturan->mode_admin ?? 'full',
                    'guru' => $pengaturan->mode_guru ?? 'full',
                    'siswa' => $pengaturan->mode_siswa ?? 'full',
                    'ortu' => $pengaturan->mode_ortu ?? 'full',
                ];
            },

            // Statistik Global untuk Navbar/Sidebar (Notifikasi)
            'globalStats' => function () use ($request) {
                // Hanya hitung jika user login dan levelnya Admin
                if (!$request->user() || $request->user()->level !== 'Admin') {
                    return [
                        'unreadSurat' => 0,
                        'notifications' => [],
                    ];
                }

                // Hitung jumlah surat & pengajuan akses yang 'Diajukan'
                $countSurat = SuratIzin::where('status_pengajuan', 'Diajukan')->count();
                $countAkses = AksesEditAbsensi::where('status', 'Diajukan')->count();
                $totalUnread = $countSurat + $countAkses;

                // Ambil data surat
                $notifSurat = SuratIzin::with('siswa')
                    ->where('status_pengajuan', 'Diajukan')
                    ->latest()
                    ->take(5)
                    ->get()
                    ->map(function ($surat) {
                        return [
                            'id' => 'surat_' . $surat->id_surat,
                            'real_id' => $surat->id_surat,
                            'data' => [
                                'message' => $surat->siswa->nama_lengkap ?? 'Siswa',
                                'description' => $surat->jenis_izin . ' - ' . Str::limit($surat->keterangan, 30),
                            ],
                            'created_at_human' => $surat->created_at->diffForHumans(),
                            'created_at' => $surat->created_at,
                            'type' => 'surat_izin'
                        ];
                    });

                // Ambil data pengajuan akses edit absensi
                $notifAkses = AksesEditAbsensi::with(['guru', 'jadwal.mataPelajaran'])
                    ->where('status', 'Diajukan')
                    ->latest()
                    ->take(5)
                    ->get()
                    ->map(function ($akses) {
                        return [
                            'id' => 'akses_' . $akses->id,
                            'real_id' => $akses->id,
                            'data' => [
                                'message' => 'Pengajuan Akses Edit',
                                'description' => ($akses->guru->nama_lengkap ?? 'Guru') . ' - ' . ($akses->jadwal->mataPelajaran->nama_mapel ?? ''),
                            ],
                            'created_at_human' => $akses->created_at->diffForHumans(),
                            'created_at' => $akses->created_at,
                            'type' => 'akses_edit'
                        ];
                    });

                // Gabungkan dan urutkan
                $allNotifs = $notifSurat->concat($notifAkses)
                    ->sortByDesc('created_at')
                    ->take(5)
                    ->values();

                return [
                    'unreadSurat' => $totalUnread,
                    'notifications' => $allNotifs,
                ];
            },

            // Konteks Orang Tua (Siswa yang dipilih)
            'orangTuaContext' => function () use ($request) {
                $user = $request->user();
                if (!$user || $user->level !== 'Orang Tua') {
                    return null;
                }

                $wali = $user->orangTuaWali()->with('siswas')->first();
                if (!$wali || $wali->siswas->isEmpty()) {
                    return null;
                }

                $siswas = $wali->siswas;
                $activeId = $request->session()->get('active_id_siswa');
                
                $activeSiswa = $siswas->firstWhere('id_siswa', $activeId) ?: $siswas->first();
                
                // Pastikan session tersinkronisasi jika default dipilih
                if (!$activeId || $activeSiswa->id_siswa !== $activeId) {
                    $request->session()->put('active_id_siswa', $activeSiswa->id_siswa);
                }

                return [
                    'activeSiswa' => $activeSiswa,
                    'allSiswas' => $siswas
                ];
            },
        ]);
    }
}