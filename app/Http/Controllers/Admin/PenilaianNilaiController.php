<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PenilaianMapel;
use App\Models\PenilaianDetail;
use App\Models\KomponenPenilaian;
use App\Models\LogAktivitas;
use App\Models\Pengaturan;
use App\Services\PenilaianCalculator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PenilaianNilaiController extends Controller
{
    /** LIST nilai kelas/mapel */
    public function index(Request $r)
    {
        $id_tahun_ajaran = $r->string('id_tahun_ajaran')->toString();
        $semester        = $r->string('semester')->toString();
        $id_kelas        = $r->string('id_kelas')->toString();
        $id_mapel        = $r->string('id_mapel')->toString();

        $optsTa = DB::table('tbl_tahun_ajaran')
            ->select('id_tahun_ajaran','tahun_ajaran','status')
            ->orderByDesc('status')->orderBy('tahun_ajaran')
            ->get()
            ->map(fn($x)=>['value'=>$x->id_tahun_ajaran,'label'=>$x->tahun_ajaran]);

        $optsSemester = collect([
            ['value'=>'Ganjil','label'=>'Ganjil'],
            ['value'=>'Genap','label'=>'Genap'],
        ]);

        $optsKelas = DB::table('tbl_kelas')->select('id_kelas')
            ->orderBy('id_kelas')->get()
            ->map(fn($x)=>['value'=>$x->id_kelas,'label'=>$x->id_kelas]);

        $optsMapel = DB::table('tbl_mata_pelajaran')->select('id_mapel','nama_mapel')
            ->orderBy('nama_mapel')->get()
            ->map(fn($x)=>['value'=>$x->id_mapel,'label'=>$x->nama_mapel]);

        $q = DB::table('tbl_penilaian_mapel as pm')
            ->join('tbl_siswa as s','s.id_siswa','=','pm.id_siswa')
            ->join('tbl_mata_pelajaran as m','m.id_mapel','=','pm.id_mapel')
            ->select(
                'pm.id_penilaian','pm.id_siswa','pm.id_kelas','pm.id_mapel',
                'pm.id_tahun_ajaran','pm.semester','pm.nilai_akhir','pm.predikat','pm.tuntas','pm.status_kunci',
                's.nis','s.nama_lengkap as nama_siswa','m.nama_mapel'
            );

        if ($id_tahun_ajaran !== '') $q->where('pm.id_tahun_ajaran',$id_tahun_ajaran);
        if ($semester !== '')        $q->where('pm.semester',$semester);
        if ($id_kelas !== '')        $q->where('pm.id_kelas',$id_kelas);
        if ($id_mapel !== '')        $q->where('pm.id_mapel',$id_mapel);

        $list = $q->orderBy('s.nama_lengkap')->limit(500)->get();

        return Inertia::render('admin/Penilaian/Nilai/Index', [
            'options' => [
                'ta'       => $optsTa,
                'semester' => $optsSemester,
                'kelas'    => $optsKelas,
                'mapel'    => $optsMapel,
            ],
            'list' => $list,
        ]);
    }

    /** DETAIL untuk 1 header penilaian */
    public function showDetail($id_penilaian)
    {
        $h = DB::table('tbl_penilaian_mapel as pm')
            ->join('tbl_siswa as s','s.id_siswa','=','pm.id_siswa')
            ->join('tbl_mata_pelajaran as m','m.id_mapel','=','pm.id_mapel')
            ->select(
                'pm.id_penilaian','pm.id_siswa','pm.id_kelas','pm.id_mapel',
                'pm.id_tahun_ajaran','pm.semester','pm.nilai_akhir','pm.predikat','pm.tuntas','pm.status_kunci',
                's.nama_lengkap as nama_siswa','m.nama_mapel','m.kkm'
            )
            ->where('pm.id_penilaian', $id_penilaian)->first();

        if (!$h) abort(404);

        $details = PenilaianDetail::where('id_penilaian', $id_penilaian)
            ->with('komponenPenilaian')
            ->orderBy('tanggal')
            ->orderBy('id_detail')
            ->get();

        // Get flexible components options
        $komponenOptions = KomponenPenilaian::orderBy('nama')->get();

        return Inertia::render('admin/Penilaian/Nilai/Detail', [
            'header'          => $h,
            'details'         => $details,
            'komponenOptions' => $komponenOptions,
        ]);
    }

    /** SIMPAN satu baris detail */
    public function storeDetail(Request $r, $id_penilaian)
    {
        $header = PenilaianMapel::with(['siswa', 'mapel'])->find($id_penilaian);
        if (!$header) {
            return back()->with('error', 'Header penilaian tidak ditemukan.');
        }

        // Check if grade is locked (either individually or globally)
        $pengaturan = Pengaturan::first();
        if ($header->isLocked()) {
            return back()->with('error', 'Penilaian untuk siswa ini telah dikunci oleh administrator.');
        }
        if ($pengaturan && $pengaturan->is_kunci_jurnal) {
            return back()->with('error', 'Seluruh pengisian nilai dan jurnal telah dikunci secara sistem.');
        }

        $data = $r->validate([
            'id_komponen' => 'required|exists:tbl_komponen_penilaian,id_komponen',
            'deskripsi'   => 'nullable|string|max:100',
            'tanggal'     => 'nullable|date',
            'nilai'       => 'required|numeric|min:0|max:100',
            'bobot'       => 'nullable|numeric|min:0|max:100',
        ]);

        $komponen = KomponenPenilaian::find($data['id_komponen']);

        $detail = PenilaianDetail::create([
            'id_penilaian' => $id_penilaian,
            'id_komponen'  => $data['id_komponen'],
            'komponen'     => $komponen->nama, // Kept as fallback for old layout compatibility
            'deskripsi'    => $data['deskripsi'] ?? null,
            'tanggal'      => $data['tanggal'] ?? null,
            'nilai'        => $data['nilai'],
            'bobot'        => $data['bobot'] ?? null,
        ]);

        // Recalculate using service class
        $calculator = new PenilaianCalculator();
        $calculator->compute($header);

        // Audit Log Entry
        LogAktivitas::create([
            'id_pengguna' => Auth::id(),
            'aksi'        => 'Tambah Nilai',
            'keterangan'  => 'Menambahkan nilai ' . $komponen->nama . ' sebesar ' . $data['nilai'] . ' untuk Siswa ' . ($header->siswa?->nama_lengkap ?? $header->id_siswa) . ' pada Mapel ' . ($header->mapel?->nama_mapel ?? $header->id_mapel)
        ]);

        return back()->with('success', 'Detail nilai berhasil ditambahkan.');
    }

    /** HAPUS satu baris detail */
    public function destroyDetail($id_detail)
    {
        $detail = PenilaianDetail::with('penilaian.siswa', 'penilaian.mapel', 'komponenPenilaian')->find($id_detail);
        if (!$detail) {
            return back()->with('error', 'Detail nilai tidak ditemukan.');
        }

        $header = $detail->penilaian;

        // Check locks
        $pengaturan = Pengaturan::first();
        if ($header->isLocked()) {
            return back()->with('error', 'Penilaian untuk siswa ini telah dikunci oleh administrator.');
        }
        if ($pengaturan && $pengaturan->is_kunci_jurnal) {
            return back()->with('error', 'Seluruh pengisian nilai dan jurnal telah dikunci secara sistem.');
        }

        $komponenNama = $detail->komponenPenilaian?->nama ?? $detail->komponen;
        $nilaiDihapus = $detail->nilai;

        $detail->delete();

        // Recalculate
        $calculator = new PenilaianCalculator();
        $calculator->compute($header);

        // Audit Log Entry
        LogAktivitas::create([
            'id_pengguna' => Auth::id(),
            'aksi'        => 'Hapus Nilai',
            'keterangan'  => 'Menghapus nilai ' . $komponenNama . ' (' . $nilaiDihapus . ') Siswa ' . ($header->siswa?->nama_lengkap ?? $header->id_siswa) . ' pada Mapel ' . ($header->mapel?->nama_mapel ?? $header->id_mapel)
        ]);

        return back()->with('success', 'Detail nilai berhasil dihapus.');
    }

    /** TOGGLE LOCK STATUS */
    public function toggleLock($id_penilaian)
    {
        $header = PenilaianMapel::with(['siswa', 'mapel'])->findOrFail($id_penilaian);
        
        $header->status_kunci = !$header->status_kunci;
        $header->save();

        $actionText = $header->status_kunci ? 'Mengunci' : 'Membuka kunci';
        
        // Audit Log Entry
        LogAktivitas::create([
            'id_pengguna' => Auth::id(),
            'aksi'        => $header->status_kunci ? 'Kunci Nilai' : 'Buka Kunci Nilai',
            'keterangan'  => $actionText . ' penilaian Mapel ' . ($header->mapel?->nama_mapel ?? $header->id_mapel) . ' untuk Siswa ' . ($header->siswa?->nama_lengkap ?? $header->id_siswa)
        ]);

        return back()->with('success', 'Status kuncian nilai berhasil diperbarui.');
    }
}
