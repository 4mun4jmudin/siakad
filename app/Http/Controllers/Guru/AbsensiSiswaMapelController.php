<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use App\Models\AbsensiSiswa;
use App\Models\AbsensiSiswaMapel;
use App\Models\AksesEditAbsensi;
use App\Models\JadwalMengajar;
use App\Models\Siswa;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AbsensiSiswaMapelController extends Controller
{
    /**
     * Izinkan edit sampai 24 jam setelah jam_selesai jadwal.
     * Contoh: Jadwal Senin 10:00–12:00 → bisa edit sampai Selasa 12:00.
     */
    private function isEditableDate(string $tanggal, ?JadwalMengajar $jadwal = null): bool
    {
        $tz  = config('app.timezone', 'Asia/Jakarta');
        $now = Carbon::now($tz);

        // Bangun batas waktu: tanggal jadwal + jam_selesai + 24 jam
        $jamSelesai = $jadwal?->jam_selesai ?? '23:59:59';
        $deadline   = Carbon::parse($tanggal . ' ' . $jamSelesai, $tz)->addHours(24);

        return $now->lte($deadline);
    }

    /**
     * Cek apakah ada akses edit aktif (disetujui & belum expired)
     * untuk guru + jadwal + tanggal tertentu.
     */
    private function getActiveAksesEdit(string $idGuru, string $idJadwal, string $tanggal): ?AksesEditAbsensi
    {
        return AksesEditAbsensi::forContext($idGuru, $idJadwal, $tanggal)
            ->aktif()
            ->first();
    }

    /**
     * Halaman pilih jadwal (menu utama absensi mapel).
     */
    public function index()
    {
        $guru = Auth::user()->guru;
        if (!$guru) abort(403, 'Akses ditolak.');

        Carbon::setLocale('id');
        $tz = config('app.timezone', 'Asia/Jakarta');
        $hariIni = Carbon::now($tz)->translatedFormat('l');

        $jadwalHariIni = JadwalMengajar::with(['kelas', 'mataPelajaran'])
            ->where('id_guru', $guru->id_guru)
            ->where('hari', $hariIni)
            ->orderBy('jam_mulai', 'asc')
            ->get();

        return Inertia::render('Guru/Absensi/SelectJadwal', [
            'jadwalHariIni' => $jadwalHariIni,
        ]);
    }

    /**
     * Tampilkan halaman absensi per mapel.
     * Prefill dari harian (non-override akan di-sync).
     * Editable sampai jam_selesai + 24 jam, atau via AksesEditAbsensi.
     */
    public function show(Request $request, $id_jadwal)
    {
        $user = Auth::user();
        $guru = $user->guru;
        if (!$guru) abort(403, 'Akses ditolak.');

        $jadwal = JadwalMengajar::with(['kelas', 'mataPelajaran'])->find($id_jadwal);
        if (!$jadwal || $jadwal->id_guru !== $guru->id_guru) {
            abort(403, 'Anda tidak memiliki izin untuk jadwal ini.');
        }

        $tz = config('app.timezone', 'Asia/Jakarta');
        $tanggalReq = $request->input('tanggal');
        $todayStr   = Carbon::now($tz)->toDateString();
        $tanggal    = Carbon::parse($tanggalReq ?: $todayStr, $tz)->toDateString();

        // Cek apakah masih dalam window normal (jam_selesai + 24 jam)
        $normalEditable = $this->isEditableDate($tanggal, $jadwal);

        // Cek apakah ada akses edit aktif dari admin
        $aksesEdit = null;
        if (!$normalEditable) {
            $aksesEdit = $this->getActiveAksesEdit($guru->id_guru, $jadwal->id_jadwal, $tanggal);
        }

        $editable = $normalEditable || ($aksesEdit !== null);

        // Jika tidak bisa edit, tetap tampilkan tapi read-only
        // (tidak redirect paksa lagi, biarkan guru lihat data)

        // Prefill dari harian
        if ($editable) {
            $dailyStatusMap = $this->prefillFromDaily($jadwal, $tanggal);
        } else {
            // Hanya ambil map harian tanpa prefill (read-only)
            $siswaIds = Siswa::where('id_kelas', $jadwal->id_kelas)->where('status', 'Aktif')->pluck('id_siswa');
            $dailyStatusMap = AbsensiSiswa::whereIn('id_siswa', $siswaIds)
                ->whereDate('tanggal', $tanggal)
                ->get()
                ->mapWithKeys(fn ($r) => [$r->id_siswa => $r->status_kehadiran])
                ->toArray();
        }

        // Tandai used_at jika akses edit pertama kali digunakan
        if ($aksesEdit && !$aksesEdit->used_at) {
            $aksesEdit->update(['used_at' => now()]);
        }

        // Filter siswa
        $query = Siswa::where('id_kelas', $jadwal->id_kelas)->where('status', 'Aktif');
        if ($request->filled('search')) {
            $term = $request->input('search');
            $query->where(function ($q) use ($term) {
                $q->where('nama_lengkap', 'like', "%{$term}%")
                  ->orWhere('nis', 'like', "%{$term}%");
            });
        }
        $siswaList = $query->orderBy('nama_lengkap')->get();

        // Ambil absensi mapel di tanggal itu
        $absensiHariIni = AbsensiSiswaMapel::where('id_jadwal', $jadwal->id_jadwal)
            ->whereDate('tanggal', $tanggal)
            ->get()
            ->keyBy('id_siswa');

        return Inertia::render('Guru/Absensi/Index', [
            'jadwal'          => $jadwal,
            'siswaList'       => $siswaList,
            'absensiHariIni'  => $absensiHariIni,
            'dailyStatusMap'  => $dailyStatusMap,
            'today'           => $tanggal,
            'filters'         => $request->only(['search', 'tanggal']),
            'onlyToday'       => !$editable, // true = terkunci, false = bisa edit
            'aksesEditAktif'  => $aksesEdit ? [
                'id'         => $aksesEdit->id,
                'expired_at' => $aksesEdit->expired_at?->toIso8601String(),
                'alasan'     => $aksesEdit->alasan,
            ] : null,
        ]);
    }

    /**
     * Refresh prefill on-demand (hanya non-override yang di-sync).
     * Hanya untuk tanggal hari ini.
     */
    public function refreshPrefill(Request $request, $id_jadwal)
    {
        $user = Auth::user();
        $guru = $user->guru;
        if (!$guru) abort(403, 'Akses ditolak.');

        $jadwal = JadwalMengajar::findOrFail($id_jadwal);
        if ($jadwal->id_guru !== $guru->id_guru) {
            return back()->with('error', 'Tidak berwenang.');
        }

        $tz = config('app.timezone', 'Asia/Jakarta');
        $tanggal = Carbon::parse($request->input('tanggal', Carbon::now($tz)->toDateString()), $tz)->toDateString();

        $normalEditable = $this->isEditableDate($tanggal, $jadwal);
        $aksesEdit = !$normalEditable ? $this->getActiveAksesEdit($guru->id_guru, $jadwal->id_jadwal, $tanggal) : null;

        if (!$normalEditable && !$aksesEdit) {
            return back()->with('error', 'Prefill tidak bisa dilakukan. Waktu edit (jam_selesai + 24 jam) sudah lewat.');
        }

        $this->prefillFromDaily($jadwal, $tanggal);

        return back()->with('success', 'Prefill dari absensi harian telah diperbarui.');
    }

    /**
     * Simpan perubahan absensi per mapel (guru hanya ubah pengecualian).
     * Hanya untuk tanggal hari ini.
     */
    public function store(Request $request)
    {
        $user  = Auth::user();
        $guru  = $user->guru;
        if (!$guru) abort(403, 'Akses ditolak.');

        $data = $request->validate([
            'id_jadwal'  => 'required|string|exists:tbl_jadwal_mengajar,id_jadwal',
            'tanggal'    => 'required|date',
            'entries'    => 'required|array',
            'entries.*.id_siswa'          => 'required|string|exists:tbl_siswa,id_siswa',
            'entries.*.status_kehadiran'  => 'nullable|string|in:Hadir,Sakit,Izin,Alfa,Alfa_Mapel,Izin_Mapel,Sakit_Mapel,Tugas_Mapel,Belum Absen',
            'entries.*.keterangan'        => 'nullable|string|max:255',
        ]);

        $tz        = config('app.timezone', 'Asia/Jakarta');
        $id_jadwal = $data['id_jadwal'];
        $tanggal   = Carbon::parse($data['tanggal'], $tz)->toDateString();

        $jadwalForCheck = JadwalMengajar::find($id_jadwal);
        $normalEditable = $this->isEditableDate($tanggal, $jadwalForCheck);
        $aksesEdit = !$normalEditable ? $this->getActiveAksesEdit($guru->id_guru, $id_jadwal, $tanggal) : null;

        if (!$normalEditable && !$aksesEdit) {
            return back()->with('error', 'Waktu edit absensi sudah lewat (jam_selesai + 24 jam). Ajukan akses edit ke admin.');
        }

        $entries = $data['entries'];

        $jadwal = JadwalMengajar::findOrFail($id_jadwal);
        if ($jadwal->id_guru !== $guru->id_guru) {
            return back()->with('error', 'Anda tidak berwenang menyimpan absensi untuk jadwal ini.');
        }

        // Ambil status harian siswa untuk validasi bisnis
        $siswaIds       = collect($entries)->pluck('id_siswa')->unique()->values();
        $dailyStatusMap = AbsensiSiswa::whereIn('id_siswa', $siswaIds)
            ->whereDate('tanggal', $tanggal)
            ->get()
            ->mapWithKeys(fn ($row) => [$row->id_siswa => $row->status_kehadiran]);

        $exceptionSet = ['Alfa_Mapel','Izin_Mapel','Sakit_Mapel','Tugas_Mapel'];

        DB::beginTransaction();
        try {
            foreach ($entries as $row) {
                $id_siswa    = $row['id_siswa'];
                $inputStatus = $row['status_kehadiran'] ?? null;
                $ket         = $row['keterangan'] ?? null;

                if ($inputStatus === null || $inputStatus === '' || $inputStatus === 'Belum Absen') {
                    continue;
                }

                $dailyStatus = $dailyStatusMap[$id_siswa] ?? null;

                // Normalisasi & locking rule
                if ($dailyStatus === 'Hadir') {
                    if (in_array($inputStatus, ['Izin', 'Sakit', 'Alfa'], true)) {
                        $map = ['Izin' => 'Izin_Mapel', 'Sakit' => 'Sakit_Mapel', 'Alfa' => 'Alfa_Mapel'];
                        $inputStatus = $map[$inputStatus];
                    }
                    if ($inputStatus !== 'Hadir' && !in_array($inputStatus, $exceptionSet, true)) {
                        continue; // status tidak diperbolehkan
                    }
                    $isOverridden = $inputStatus !== 'Hadir';
                    $source       = $isOverridden ? 'manual' : 'daily';
                } elseif (in_array($dailyStatus, ['Izin','Sakit','Alfa'], true)) {
                    // terkunci mengikuti harian
                    $inputStatus  = $dailyStatus;
                    $isOverridden = 0;
                    $source       = 'daily';
                } else {
                    // harian belum ada -> manual
                    $isOverridden = 1;
                    $source       = 'manual';
                }

                $id_absensi_mapel = 'AM-' . Carbon::parse($tanggal)->format('ymd') . '-' . $id_jadwal . '-' . $id_siswa;

                AbsensiSiswaMapel::updateOrCreate(
                    [
                        'id_jadwal' => $id_jadwal,
                        'id_siswa'  => $id_siswa,
                        'tanggal'   => $tanggal,
                    ],
                    [
                        'id_absensi_mapel'    => $id_absensi_mapel,
                        'jam_mulai'           => $jadwal->jam_mulai,
                        'jam_selesai'         => $jadwal->jam_selesai,
                        'status_kehadiran'    => $inputStatus,
                        'keterangan'          => $ket,
                        'metode_absen'        => 'Manual',
                        'is_overridden'       => $isOverridden ? 1 : 0,
                        'source_status'       => $source,
                        'derived_at'          => $source === 'daily' ? now() : null,
                        'overridden_by'       => $isOverridden ? (string) $user->id_pengguna : null,
                        'overridden_at'       => $isOverridden ? now() : null,
                        'id_penginput_manual' => $user->id_pengguna,
                    ]
                );
            }

            // Update last_edited_at jika melalui akses edit
            if ($aksesEdit) {
                $aksesEdit->update(['last_edited_at' => now()]);
            }

            DB::commit();
            return back()->with('success', 'Absensi per mapel tersimpan.');
        } catch (\Throwable $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal menyimpan absensi: ' . $e->getMessage());
        }
    }

    /**
     * Ekspor CSV per pertemuan (tanggal tertentu untuk 1 jadwal).
     * (Ekspor tetap diizinkan untuk tanggal apa pun.)
     */
    public function exportMeeting(Request $request, $id_jadwal): StreamedResponse
    {
        $user = Auth::user();
        $guru = $user->guru;
        if (!$guru) abort(403, 'Akses ditolak.');

        $jadwal = JadwalMengajar::with(['kelas', 'mataPelajaran'])->findOrFail($id_jadwal);
        if ($jadwal->id_guru !== $guru->id_guru) abort(403, 'Tidak berwenang.');

        $tanggal = Carbon::parse($request->input('tanggal', Carbon::today()->toDateString()))->toDateString();

        // Ambil record mapel + map harian
        $records = AbsensiSiswaMapel::with('siswa')
            ->where('id_jadwal', $jadwal->id_jadwal)
            ->whereDate('tanggal', $tanggal)
            ->orderBy('id_siswa')
            ->get();

        $dailyMap = AbsensiSiswa::whereIn('id_siswa', $records->pluck('id_siswa')->unique())
            ->whereDate('tanggal', $tanggal)
            ->get()
            ->mapWithKeys(fn ($r) => [$r->id_siswa => $r->status_kehadiran]);

        $filename = 'absensi_mapel_' . $jadwal->id_jadwal . '_' . $tanggal . '.csv';

        return response()->streamDownload(function () use ($records, $dailyMap, $jadwal, $tanggal) {
            $out = fopen('php://output', 'w');
            // header
            fputcsv($out, ['Pertemuan', $tanggal]);
            fputcsv($out, ['Kelas', optional($jadwal->kelas)->nama_kelas]);
            fputcsv($out, ['Mapel', optional($jadwal->mataPelajaran)->nama_mapel]);
            fputcsv($out, []); // empty
            fputcsv($out, ['NIS', 'Nama', 'Status Mapel', 'Sumber (auto/manual)', 'Override?', 'Status Harian', 'Keterangan']);

            foreach ($records as $r) {
                $daily = $dailyMap[$r->id_siswa] ?? '';
                $source = $r->source_status ?: '';
                $override = (int)$r->is_overridden === 1 ? 'Ya' : 'Tidak';
                fputcsv($out, [
                    $r->siswa->nis ?? '',
                    $r->siswa->nama_lengkap ?? '',
                    $r->status_kehadiran,
                    $source,
                    $override,
                    $daily,
                    $r->keterangan ?? '',
                ]);
            }

            fclose($out);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    /**
     * Ekspor CSV rekap bulanan untuk satu jadwal (agregat status & detail).
     * Query param: month=YYYY-MM
     * (Ekspor tetap diizinkan untuk bulan apa pun.)
     */
    public function exportMonthly(Request $request, $id_jadwal): StreamedResponse
    {
        $user = Auth::user();
        $guru = $user->guru;
        if (!$guru) abort(403, 'Akses ditolak.');

        $jadwal = JadwalMengajar::with(['kelas', 'mataPelajaran'])->findOrFail($id_jadwal);
        if ($jadwal->id_guru !== $guru->id_guru) abort(403, 'Tidak berwenang.');

        $month = $request->input('month', Carbon::today()->format('Y-m'));
        $start = Carbon::createFromFormat('Y-m', $month)->startOfMonth();
        $end   = (clone $start)->endOfMonth();

        $rows = AbsensiSiswaMapel::with('siswa')
            ->where('id_jadwal', $jadwal->id_jadwal)
            ->whereBetween('tanggal', [$start->toDateString(), $end->toDateString()])
            ->get();

        // Agregat per status
        $statusCounts = [];
        foreach ($rows as $r) {
            $statusCounts[$r->status_kehadiran] = ($statusCounts[$r->status_kehadiran] ?? 0) + 1;
        }

        // Agregat per siswa (khusus highlight Alfa_Mapel)
        $byStudent = [];
        foreach ($rows as $r) {
            $sid = $r->id_siswa;
            if (!isset($byStudent[$sid])) {
                $byStudent[$sid] = [
                    'nis' => $r->siswa->nis ?? '',
                    'nama' => $r->siswa->nama_lengkap ?? '',
                    'Hadir' => 0, 'Izin' => 0, 'Sakit' => 0, 'Alfa' => 0,
                    'Alfa_Mapel' => 0, 'Izin_Mapel' => 0, 'Sakit_Mapel' => 0, 'Tugas_Mapel' => 0,
                ];
            }
            if (isset($byStudent[$sid][$r->status_kehadiran])) {
                $byStudent[$sid][$r->status_kehadiran]++;
            }
        }

        $filename = 'rekap_bulanan_mapel_' . $jadwal->id_jadwal . '_' . $month . '.csv';

        return response()->streamDownload(function () use ($statusCounts, $byStudent, $jadwal, $month) {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['Rekap Bulanan', $month]);
            fputcsv($out, ['Kelas', optional($jadwal->kelas)->nama_kelas]);
            fputcsv($out, ['Mapel', optional($jadwal->mataPelajaran)->nama_mapel]);
            fputcsv($out, []);

            // Ringkasan status
            fputcsv($out, ['RINGKASAN STATUS']);
            fputcsv($out, ['Status', 'Jumlah']);
            foreach ($statusCounts as $st => $cnt) {
                fputcsv($out, [$st, $cnt]);
            }

            fputcsv($out, []);
            fputcsv($out, ['DETAIL PER SISWA']);
            fputcsv($out, ['NIS', 'Nama', 'Hadir', 'Izin', 'Sakit', 'Alfa', 'Alfa_Mapel', 'Izin_Mapel', 'Sakit_Mapel', 'Tugas_Mapel']);
            foreach ($byStudent as $sid => $rec) {
                fputcsv($out, [
                    $rec['nis'], $rec['nama'],
                    $rec['Hadir'], $rec['Izin'], $rec['Sakit'], $rec['Alfa'],
                    $rec['Alfa_Mapel'], $rec['Izin_Mapel'], $rec['Sakit_Mapel'], $rec['Tugas_Mapel'],
                ]);
            }

            fclose($out);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    /**
     * Prefill dari absensi harian:
     * - non-override: dibuat/diupdate mengikuti harian
     * - override: tidak disentuh
     * - harian null: set 'Belum Absen'
     * return map [id_siswa => dailyStatus|null]
     */
    private function prefillFromDaily(JadwalMengajar $jadwal, string $tanggal): array
    {
        $tanggal = Carbon::parse($tanggal)->toDateString();

        $siswaList = Siswa::where('id_kelas', $jadwal->id_kelas)
            ->where('status', 'Aktif')
            ->pluck('id_siswa');

        // map harian
        $daily = AbsensiSiswa::whereIn('id_siswa', $siswaList)
            ->whereDate('tanggal', $tanggal)
            ->get()
            ->mapWithKeys(fn ($r) => [$r->id_siswa => $r->status_kehadiran]);

        // existing mapel
        $existing = AbsensiSiswaMapel::where('id_jadwal', $jadwal->id_jadwal)
            ->whereDate('tanggal', $tanggal)
            ->get()
            ->keyBy('id_siswa');

        foreach ($siswaList as $id_siswa) {
            $dailyStatus = $daily[$id_siswa] ?? null;
            $defaultMapel = $this->mapDailyToMapel($dailyStatus); // 'Hadir','Izin','Sakit','Alfa' atau 'Belum Absen'

            if (isset($existing[$id_siswa])) {
                $row = $existing[$id_siswa];
                if ((int)$row->is_overridden === 1) continue; // jangan ganggu
                $row->update([
                    'status_kehadiran' => $defaultMapel,
                    'metode_absen'     => 'Manual',
                    'is_overridden'    => 0,
                    'source_status'    => 'daily',
                    'derived_at'       => now(),
                    'overridden_by'    => null,
                    'overridden_at'    => null,
                ]);
            } else {
                AbsensiSiswaMapel::create([
                    'id_absensi_mapel'    => 'AM-' . Carbon::parse($tanggal)->format('ymd') . '-' . $jadwal->id_jadwal . '-' . $id_siswa,
                    'id_jadwal'           => $jadwal->id_jadwal,
                    'id_siswa'            => $id_siswa,
                    'tanggal'             => $tanggal,
                    'jam_mulai'           => $jadwal->jam_mulai,
                    'jam_selesai'         => $jadwal->jam_selesai,
                    'status_kehadiran'    => $defaultMapel,
                    'metode_absen'        => 'Manual',
                    'is_overridden'       => 0,
                    'source_status'       => 'daily',
                    'derived_at'          => now(),
                    'id_penginput_manual' => Auth::user()->id_pengguna,
                ]);
            }
        }

        return $daily->toArray();
    }

    private function mapDailyToMapel(?string $daily): string
    {
        return match ($daily) {
            'Hadir' => 'Hadir',
            'Izin'  => 'Izin',
            'Sakit' => 'Sakit',
            'Alfa'  => 'Alfa',
            default => 'Belum Absen',
        };
    }
}
