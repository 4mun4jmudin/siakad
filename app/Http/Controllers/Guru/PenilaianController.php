<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use App\Models\Guru;
use App\Models\JadwalMengajar;
use App\Models\Kelas;
use App\Models\MataPelajaran;
use App\Models\Siswa;
use App\Models\PenilaianMapel;
use App\Models\PenilaianDetail;
use App\Models\KomponenPenilaian;
use App\Models\Pengaturan;
use App\Models\TahunAjaran;
use App\Services\PenilaianCalculator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PenilaianController extends Controller
{
    private function getActiveTahunAjaran()
    {
        $pengaturan = Pengaturan::first();
        if ($pengaturan && $pengaturan->tahun_ajaran_aktif) {
            return $pengaturan->tahun_ajaran_aktif;
        }
        return TahunAjaran::where('status', 'Aktif')->value('tahun_ajaran');
    }

    private function getActiveTahunAjaranId()
    {
        $pengaturan = Pengaturan::first();
        if ($pengaturan && $pengaturan->tahun_ajaran_aktif) {
            $ta = TahunAjaran::where('tahun_ajaran', $pengaturan->tahun_ajaran_aktif)
                ->where('semester', $pengaturan->semester_aktif ?? 'Ganjil')
                ->first();
            if ($ta) {
                return $ta->id_tahun_ajaran;
            }
        }
        return TahunAjaran::where('status', 'Aktif')->value('id_tahun_ajaran');
    }

    private function getActiveSemester()
    {
        $pengaturan = Pengaturan::first();
        return $pengaturan ? $pengaturan->semester_aktif : 'Ganjil';
    }

    /**
     * Menampilkan daftar kelas dan mata pelajaran yang diajar guru
     */
    public function index(Request $request)
    {
        $guru = Auth::user()->guru;
        if (!$guru) {
            abort(403, 'Akses Ditolak.');
        }

        $tahunAjaran = $this->getActiveTahunAjaran();
        $semester = $this->getActiveSemester();

        // Get unique kelas + mapel combinations from JadwalMengajar
        $jadwals = JadwalMengajar::with(['kelas', 'mataPelajaran'])
            ->where('id_guru', $guru->id_guru)
            ->get();

        $kelasMapelMap = [];
        foreach ($jadwals as $j) {
            $key = $j->id_kelas . '|' . $j->id_mapel;
            if (!isset($kelasMapelMap[$key])) {
                $kelasMapelMap[$key] = [
                    'id_kelas'   => $j->id_kelas,
                    'tingkat'    => $j->kelas->tingkat ?? '',
                    'jurusan'    => $j->kelas->jurusan ?? '',
                    'nama_kelas' => trim(($j->kelas->tingkat ?? '') . ' ' . ($j->kelas->jurusan ?? '')),
                    'id_mapel'   => $j->id_mapel,
                    'nama_mapel' => $j->mataPelajaran->nama_mapel ?? '',
                ];
            }
        }

        $kelasMapelList = array_values($kelasMapelMap);

        // Sort by tingkat, then mapel
        usort($kelasMapelList, function ($a, $b) {
            $cmp = strcmp($a['tingkat'], $b['tingkat']);
            if ($cmp === 0) {
                return strcmp($a['nama_mapel'], $b['nama_mapel']);
            }
            return $cmp;
        });

        return Inertia::render('Guru/Penilaian/Index', [
            'kelasMapel'  => $kelasMapelList,
            'tahunAjaran' => $tahunAjaran,
            'semester'    => $semester,
        ]);
    }

    /**
     * Menampilkan daftar siswa untuk kelas dan mapel tertentu
     */
    public function showKelas(Request $request, $id_kelas, $id_mapel)
    {
        $guru = Auth::user()->guru;
        
        // Verifikasi bahwa guru mengajar kelas & mapel ini ATAU adalah wali kelas
        $isMengajar = JadwalMengajar::where('id_guru', $guru->id_guru)
            ->where('id_kelas', $id_kelas)
            ->where('id_mapel', $id_mapel)
            ->exists();

        $isWaliKelas = Kelas::where('id_kelas', $id_kelas)
            ->where('id_wali_kelas', $guru->id_guru)
            ->exists();

        if (!$isMengajar && !$isWaliKelas) {
            abort(403, 'Anda tidak mengajar mata pelajaran ini di kelas tersebut dan bukan wali kelas.');
        }

        $kelas = Kelas::findOrFail($id_kelas);
        $mapel = MataPelajaran::findOrFail($id_mapel);
        $tahunAjaran = $this->getActiveTahunAjaran();
        $tahunAjaranId = $this->getActiveTahunAjaranId();
        $semester = $this->getActiveSemester();

        // Ambil semua siswa di kelas tersebut
        $siswas = Siswa::where('id_kelas', $id_kelas)
            ->orderBy('nama_lengkap')
            ->get(['id_siswa', 'nis', 'nama_lengkap']);

        // Ambil nilai header yang sudah ada untuk kombinasi ini
        $penilaianHeaders = PenilaianMapel::where('id_kelas', $id_kelas)
            ->where('id_mapel', $id_mapel)
            ->where('id_tahun_ajaran', $tahunAjaranId)
            ->where('semester', $semester)
            ->get()
            ->keyBy('id_siswa');

        $siswaList = $siswas->map(function ($s) use ($penilaianHeaders) {
            $header = $penilaianHeaders->get($s->id_siswa);
            return [
                'id_siswa'     => $s->id_siswa,
                'nis'          => $s->nis,
                'nama_lengkap' => $s->nama_lengkap,
                'id_penilaian' => $header ? $header->id_penilaian : null,
                'nilai_akhir'  => $header ? $header->nilai_akhir : null,
                'predikat'     => $header ? $header->predikat : null,
                'tuntas'       => $header ? $header->tuntas : null,
                'status_kunci' => $header ? $header->status_kunci : false,
            ];
        });

        return Inertia::render('Guru/Penilaian/Kelas', [
            'kelas'       => ['id_kelas' => $kelas->id_kelas, 'nama_kelas' => trim($kelas->tingkat . ' ' . $kelas->jurusan)],
            'mapel'       => ['id_mapel' => $mapel->id_mapel, 'nama_mapel' => $mapel->nama_mapel, 'kkm' => $mapel->kkm],
            'tahunAjaran' => $tahunAjaran,
            'semester'    => $semester,
            'siswaList'   => $siswaList,
        ]);
    }

    /**
     * Menampilkan detail nilai satu siswa untuk diedit
     */
    public function showSiswa(Request $request, $id_kelas, $id_mapel, $id_siswa)
    {
        $guru = Auth::user()->guru;
        
        $isMengajar = JadwalMengajar::where('id_guru', $guru->id_guru)
            ->where('id_kelas', $id_kelas)
            ->where('id_mapel', $id_mapel)
            ->exists();

        $isWaliKelas = Kelas::where('id_kelas', $id_kelas)
            ->where('id_wali_kelas', $guru->id_guru)
            ->exists();

        if (!$isMengajar && !$isWaliKelas) abort(403, 'Akses ditolak.');

        $kelas = Kelas::findOrFail($id_kelas);
        $mapel = MataPelajaran::findOrFail($id_mapel);
        $siswa = Siswa::where('id_kelas', $id_kelas)->findOrFail($id_siswa);
        
        $tahunAjaranId = $this->getActiveTahunAjaranId();
        $tahunAjaran = $this->getActiveTahunAjaran();
        $semester = $this->getActiveSemester();

        // Cari atau buat header penilaian
        $header = PenilaianMapel::firstOrCreate(
            [
                'id_siswa'        => $id_siswa,
                'id_kelas'        => $id_kelas,
                'id_mapel'        => $id_mapel,
                'id_tahun_ajaran' => $tahunAjaranId,
                'semester'        => $semester,
            ]
        );

        $details = PenilaianDetail::where('id_penilaian', $header->id_penilaian)
            ->with('komponenPenilaian')
            ->orderBy('tanggal')
            ->orderBy('id_detail')
            ->get();

        $komponenOptions = KomponenPenilaian::orderBy('nama')->get();

        return Inertia::render('Guru/Penilaian/DetailSiswa', [
            'header'          => [
                'id_penilaian' => $header->id_penilaian,
                'id_siswa'     => $siswa->id_siswa,
                'nama_siswa'   => $siswa->nama_lengkap,
                'id_kelas'     => $kelas->id_kelas,
                'nama_kelas'   => trim($kelas->tingkat . ' ' . $kelas->jurusan),
                'id_mapel'     => $mapel->id_mapel,
                'nama_mapel'   => $mapel->nama_mapel,
                'kkm'          => $mapel->kkm,
                'semester'     => $semester,
                'nilai_akhir'  => $header->nilai_akhir,
                'predikat'     => $header->predikat,
                'tuntas'       => $header->tuntas,
                'status_kunci' => $header->status_kunci,
            ],
            'details'         => $details,
            'komponenOptions' => $komponenOptions,
        ]);
    }

    /**
     * Menyimpan detail nilai
     */
    public function storeDetail(Request $request, $id_penilaian)
    {
        $data = $request->validate([
            'id_komponen' => 'required|exists:tbl_komponen_penilaian,id_komponen',
            'deskripsi'   => 'nullable|string|max:255',
            'tanggal'     => 'nullable|date',
            'nilai'       => 'required|numeric|min:0|max:100',
            'bobot'       => 'nullable|numeric|min:0|max:100',
        ]);

        $pen = PenilaianMapel::findOrFail($id_penilaian);
        
        // Cek kunci per-siswa
        if ($pen->status_kunci) {
            return back()->with('error', 'Penilaian sudah dikunci oleh Admin.');
        }

        // Cek kunci global sistem
        $pengaturan = Pengaturan::first();
        if ($pengaturan && $pengaturan->is_kunci_jurnal) {
            return back()->with('error', 'Seluruh pengisian nilai telah dikunci secara sistem oleh administrator.');
        }

        // Keamanan: pastikan guru yang mengajar atau wali kelas
        $guru = Auth::user()->guru;
        $isMengajar = JadwalMengajar::where('id_guru', $guru->id_guru)
            ->where('id_kelas', $pen->id_kelas)
            ->where('id_mapel', $pen->id_mapel)
            ->exists();
        
        $isWaliKelas = Kelas::where('id_kelas', $pen->id_kelas)
            ->where('id_wali_kelas', $guru->id_guru)
            ->exists();

        if (!$isMengajar && !$isWaliKelas) abort(403);

        PenilaianDetail::create([
            'id_penilaian' => $id_penilaian,
            'id_komponen'  => $data['id_komponen'],
            'deskripsi'    => $data['deskripsi'] ?? null,
            'tanggal'      => $data['tanggal'] ?? null,
            'nilai'        => $data['nilai'],
            'bobot'        => $data['bobot'] ?? null,
        ]);

        // Recalculate
        $calc = new PenilaianCalculator();
        $calc->compute($pen);

        return back()->with('success', 'Nilai berhasil ditambahkan.');
    }

    /**
     * Mengupdate detail nilai yang sudah ada
     */
    public function updateDetail(Request $request, $id_detail)
    {
        $data = $request->validate([
            'id_komponen' => 'required|exists:tbl_komponen_penilaian,id_komponen',
            'deskripsi'   => 'nullable|string|max:255',
            'tanggal'     => 'nullable|date',
            'nilai'       => 'required|numeric|min:0|max:100',
            'bobot'       => 'nullable|numeric|min:0|max:100',
        ]);

        $detail = PenilaianDetail::findOrFail($id_detail);
        $pen = PenilaianMapel::findOrFail($detail->id_penilaian);

        // Cek kunci per-siswa
        if ($pen->status_kunci) {
            return back()->with('error', 'Penilaian sudah dikunci oleh Admin.');
        }

        // Cek kunci global sistem
        $pengaturan = Pengaturan::first();
        if ($pengaturan && $pengaturan->is_kunci_jurnal) {
            return back()->with('error', 'Seluruh pengisian nilai telah dikunci secara sistem oleh administrator.');
        }

        // Keamanan: pastikan guru yang mengajar atau wali kelas
        $guru = Auth::user()->guru;
        $isMengajar = JadwalMengajar::where('id_guru', $guru->id_guru)
            ->where('id_kelas', $pen->id_kelas)
            ->where('id_mapel', $pen->id_mapel)
            ->exists();
        
        $isWaliKelas = Kelas::where('id_kelas', $pen->id_kelas)
            ->where('id_wali_kelas', $guru->id_guru)
            ->exists();

        if (!$isMengajar && !$isWaliKelas) abort(403);

        $detail->update([
            'id_komponen' => $data['id_komponen'],
            'deskripsi'   => $data['deskripsi'] ?? null,
            'tanggal'     => $data['tanggal'] ?? null,
            'nilai'       => $data['nilai'],
            'bobot'       => $data['bobot'] ?? null,
        ]);

        // Recalculate
        $calc = new PenilaianCalculator();
        $calc->compute($pen);

        return back()->with('success', 'Nilai berhasil diperbarui.');
    }

    /**
     * Menghapus detail nilai
     */
    public function destroyDetail(Request $request, $id_detail)
    {
        $detail = PenilaianDetail::findOrFail($id_detail);
        $pen = PenilaianMapel::findOrFail($detail->id_penilaian);

        if ($pen->status_kunci) {
            return back()->with('error', 'Penilaian sudah dikunci oleh Admin.');
        }

        // Cek kunci global sistem
        $pengaturan = Pengaturan::first();
        if ($pengaturan && $pengaturan->is_kunci_jurnal) {
            return back()->with('error', 'Seluruh pengisian nilai telah dikunci secara sistem oleh administrator.');
        }

        // Keamanan: pastikan guru yang mengajar atau wali kelas
        $guru = Auth::user()->guru;
        $isMengajar = JadwalMengajar::where('id_guru', $guru->id_guru)
            ->where('id_kelas', $pen->id_kelas)
            ->where('id_mapel', $pen->id_mapel)
            ->exists();
        
        $isWaliKelas = Kelas::where('id_kelas', $pen->id_kelas)
            ->where('id_wali_kelas', $guru->id_guru)
            ->exists();

        if (!$isMengajar && !$isWaliKelas) abort(403);

        $detail->delete();

        // Recalculate
        $calc = new PenilaianCalculator();
        $calc->compute($pen);

        return back()->with('success', 'Nilai berhasil dihapus.');
    }

    /**
     * Menampilkan rekap nilai seluruh siswa di satu kelas untuk satu mapel
     */
    public function rekapKelas(Request $request, $id_kelas, $id_mapel)
    {
        $guru = Auth::user()->guru;

        // Verifikasi mengajar atau wali kelas
        $isMengajar = JadwalMengajar::where('id_guru', $guru->id_guru)
            ->where('id_kelas', $id_kelas)
            ->where('id_mapel', $id_mapel)
            ->exists();

        $isWaliKelas = Kelas::where('id_kelas', $id_kelas)
            ->where('id_wali_kelas', $guru->id_guru)
            ->exists();

        if (!$isMengajar && !$isWaliKelas) abort(403, 'Anda tidak mengajar mata pelajaran ini di kelas tersebut dan bukan wali kelas.');

        $kelas = Kelas::findOrFail($id_kelas);
        $mapel = MataPelajaran::findOrFail($id_mapel);
        $tahunAjaran = $this->getActiveTahunAjaran();
        $tahunAjaranId = $this->getActiveTahunAjaranId();
        $semester = $this->getActiveSemester();

        // Ambil semua siswa
        $siswas = Siswa::where('id_kelas', $id_kelas)
            ->orderBy('nama_lengkap')
            ->get(['id_siswa', 'nis', 'nama_lengkap']);

        // Ambil header penilaian
        $penilaianHeaders = PenilaianMapel::where('id_kelas', $id_kelas)
            ->where('id_mapel', $id_mapel)
            ->where('id_tahun_ajaran', $tahunAjaranId)
            ->where('semester', $semester)
            ->with('details.komponenPenilaian')
            ->get()
            ->keyBy('id_siswa');

        // Ambil komponen penilaian untuk header tabel
        $komponenList = KomponenPenilaian::orderBy('nama')->get();

        $siswaRekap = $siswas->map(function ($s) use ($penilaianHeaders, $komponenList) {
            $header = $penilaianHeaders->get($s->id_siswa);
            
            // Rata-rata per komponen
            $komponenNilai = [];
            if ($header && $header->details) {
                $grouped = $header->details->groupBy(fn($d) => $d->komponen_penilaian->nama ?? '-');
                foreach ($komponenList as $k) {
                    $items = $grouped->get($k->nama, collect());
                    $avg = $items->count() > 0 ? round($items->avg('nilai'), 2) : null;
                    $komponenNilai[$k->nama] = $avg;
                }
            } else {
                foreach ($komponenList as $k) {
                    $komponenNilai[$k->nama] = null;
                }
            }

            return [
                'id_siswa'       => $s->id_siswa,
                'nis'            => $s->nis,
                'nama_lengkap'   => $s->nama_lengkap,
                'nilai_akhir'    => $header ? $header->nilai_akhir : null,
                'predikat'       => $header ? $header->predikat : null,
                'tuntas'         => $header ? $header->tuntas : null,
                'status_kunci'   => $header ? $header->status_kunci : false,
                'komponen_nilai' => $komponenNilai,
            ];
        });

        // Statistik kelas
        $nilaiCollection = $siswaRekap->pluck('nilai_akhir')->filter(fn($v) => !is_null($v));
        $statsKelas = [
            'total_siswa'     => $siswas->count(),
            'sudah_dinilai'   => $nilaiCollection->count(),
            'belum_dinilai'   => $siswas->count() - $nilaiCollection->count(),
            'rata_rata'       => $nilaiCollection->count() > 0 ? round($nilaiCollection->avg(), 2) : 0,
            'nilai_tertinggi' => $nilaiCollection->count() > 0 ? round($nilaiCollection->max(), 2) : 0,
            'nilai_terendah'  => $nilaiCollection->count() > 0 ? round($nilaiCollection->min(), 2) : 0,
            'tuntas'          => $siswaRekap->where('tuntas', true)->count(),
            'tidak_tuntas'    => $siswaRekap->where('tuntas', false)->count(),
        ];

        return Inertia::render('Guru/Penilaian/RekapKelas', [
            'kelas'        => ['id_kelas' => $kelas->id_kelas, 'nama_kelas' => trim($kelas->tingkat . ' ' . $kelas->jurusan)],
            'mapel'        => ['id_mapel' => $mapel->id_mapel, 'nama_mapel' => $mapel->nama_mapel, 'kkm' => $mapel->kkm],
            'tahunAjaran'  => $tahunAjaran,
            'semester'     => $semester,
            'siswaRekap'   => $siswaRekap,
            'komponenList' => $komponenList->pluck('nama'),
            'statsKelas'   => $statsKelas,
        ]);
    }
}

