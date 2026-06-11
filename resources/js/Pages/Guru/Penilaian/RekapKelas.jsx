import React from "react";
import { Head, Link } from "@inertiajs/react";
import GuruLayout from "@/Layouts/GuruLayout";
import { Card, CardContent } from "@/Components/ui/card";

const cn = (...classes) => classes.filter(Boolean).join(' ');

const fix2 = (v) => {
  if (v === null || v === undefined) return "—";
  const n = parseFloat(v);
  return isNaN(n) ? "—" : n.toFixed(2);
};

function StatBox({ label, value, color = "text-slate-800" }) {
  return (
    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center">
      <div className="text-xs font-semibold text-slate-400 mb-1">{label}</div>
      <div className={`text-2xl font-extrabold ${color}`}>{value}</div>
    </div>
  );
}

function PageRekapKelas({ kelas, mapel, tahunAjaran, semester, siswaRekap = [], komponenList = [], statsKelas = {} }) {
  return (
    <div className="space-y-6">
      <Head title={`Rekap Nilai ${kelas.nama_kelas} - ${mapel.nama_mapel}`} />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Rekapitulasi Nilai Kelas</h1>
          <p className="text-slate-500 text-sm mt-1">
            <span className="font-semibold text-slate-700">{kelas.nama_kelas}</span> — {mapel.nama_mapel} | KKM: {mapel.kkm} | {tahunAjaran} ({semester})
          </p>
        </div>
        <Link
          href={route('guru.penilaian.showKelas', [kelas.id_kelas, mapel.id_mapel])}
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1"
        >
          &larr; Kembali ke Daftar Siswa
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <StatBox label="Total Siswa" value={statsKelas.total_siswa ?? 0} />
        <StatBox label="Sudah Dinilai" value={statsKelas.sudah_dinilai ?? 0} color="text-indigo-600" />
        <StatBox label="Belum Dinilai" value={statsKelas.belum_dinilai ?? 0} color="text-amber-600" />
        <StatBox label="Rata-rata" value={fix2(statsKelas.rata_rata)} color="text-sky-600" />
        <StatBox label="Tertinggi" value={fix2(statsKelas.nilai_tertinggi)} color="text-green-600" />
        <StatBox label="Terendah" value={fix2(statsKelas.nilai_terendah)} color="text-red-600" />
        <StatBox label="Tuntas" value={statsKelas.tuntas ?? 0} color="text-emerald-600" />
        <StatBox label="Tidak Tuntas" value={statsKelas.tidak_tuntas ?? 0} color="text-rose-600" />
      </div>

      {/* Tabel Rekap */}
      <Card className="border border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-4 text-left font-semibold text-slate-600 sticky left-0 bg-slate-50 z-10">No</th>
                  <th className="p-4 text-left font-semibold text-slate-600 sticky left-10 bg-slate-50 z-10">NIS</th>
                  <th className="p-4 text-left font-semibold text-slate-600 sticky left-24 bg-slate-50 z-10 min-w-[180px]">Nama Siswa</th>
                  {komponenList.map((komponen) => (
                    <th key={komponen} className="p-4 text-center font-semibold text-slate-600 whitespace-nowrap">
                      {komponen}
                    </th>
                  ))}
                  <th className="p-4 text-center font-semibold text-indigo-700 bg-indigo-50/50">Nilai Akhir</th>
                  <th className="p-4 text-center font-semibold text-slate-600">Predikat</th>
                  <th className="p-4 text-center font-semibold text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {siswaRekap.length > 0 ? (
                  siswaRekap.map((s, idx) => (
                    <tr key={s.id_siswa} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-slate-500 sticky left-0 bg-white z-10">{idx + 1}</td>
                      <td className="p-4 text-slate-600 sticky left-10 bg-white z-10">{s.nis}</td>
                      <td className="p-4 font-medium text-slate-800 sticky left-24 bg-white z-10">
                        <Link
                          href={route('guru.penilaian.showSiswa', [kelas.id_kelas, mapel.id_mapel, s.id_siswa])}
                          className="text-indigo-600 hover:text-indigo-800 hover:underline"
                        >
                          {s.nama_lengkap}
                        </Link>
                      </td>
                      {komponenList.map((komponen) => (
                        <td key={komponen} className="p-4 text-center">
                          {s.komponen_nilai && s.komponen_nilai[komponen] != null ? (
                            <span className={cn(
                              "font-semibold",
                              s.komponen_nilai[komponen] >= (mapel.kkm || 75) ? "text-green-600" : "text-amber-600"
                            )}>
                              {fix2(s.komponen_nilai[komponen])}
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                      ))}
                      <td className="p-4 text-center bg-indigo-50/30">
                        <span className={cn(
                          "font-bold text-base",
                          s.nilai_akhir != null && s.nilai_akhir >= (mapel.kkm || 75) ? "text-green-600" : "text-amber-600"
                        )}>
                          {fix2(s.nilai_akhir)}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="font-semibold text-slate-700">{s.predikat ?? "—"}</span>
                      </td>
                      <td className="p-4 text-center">
                        {s.tuntas === null ? (
                          <span className="text-slate-400">—</span>
                        ) : s.tuntas ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">Tuntas</span>
                        ) : (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">Belum Tuntas</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={komponenList.length + 6} className="p-8 text-center text-slate-500">
                      Tidak ada data siswa ditemukan untuk kelas ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

PageRekapKelas.layout = (page) => (
  <GuruLayout user={page.props.auth.user} header="Rekap Nilai Kelas">{page}</GuruLayout>
);

export default PageRekapKelas;
