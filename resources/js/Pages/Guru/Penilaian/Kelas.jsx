import React from "react";
import { Head, Link } from "@inertiajs/react";
import GuruLayout from "@/Layouts/GuruLayout";
import { Card, CardContent } from "@/Components/ui/card";

function PagePenilaianKelas({ kelas, mapel, tahunAjaran, semester, siswaList = [] }) {
  const formatNum = (v) => {
    if (v === null || v === undefined) return "—";
    const n = parseFloat(v);
    return isNaN(n) ? "—" : n.toFixed(2);
  };

  return (
    <div className="space-y-6">
      <Head title={`Penilaian Kelas ${kelas.nama_kelas}`} />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Penilaian {kelas.nama_kelas}</h1>
          <p className="text-slate-500 text-sm mt-1">
            Mata Pelajaran: <span className="font-semibold text-slate-700">{mapel.nama_mapel}</span> | KKM: {mapel.kkm}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={route('guru.penilaian.rekapKelas', [kelas.id_kelas, mapel.id_mapel])}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
          >
            📊 Rekap Kelas
          </Link>
          <Link
            href={route('guru.penilaian.index')}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1"
          >
            &larr; Kembali ke Daftar Kelas
          </Link>
        </div>
      </div>

      <Card className="border border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-4 text-left font-semibold text-slate-600">NIS</th>
                  <th className="p-4 text-left font-semibold text-slate-600">Nama Siswa</th>
                  <th className="p-4 text-center font-semibold text-slate-600">Nilai Akhir</th>
                  <th className="p-4 text-center font-semibold text-slate-600">Predikat</th>
                  <th className="p-4 text-center font-semibold text-slate-600">Status</th>
                  <th className="p-4 text-center font-semibold text-slate-600">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {siswaList.length > 0 ? (
                  siswaList.map((s) => (
                    <tr key={s.id_siswa} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-slate-700">{s.nis}</td>
                      <td className="p-4 font-medium text-slate-800">{s.nama_lengkap}</td>
                      <td className="p-4 text-center">
                        <span className={`font-semibold ${s.nilai_akhir >= mapel.kkm ? 'text-green-600' : 'text-amber-600'}`}>
                          {formatNum(s.nilai_akhir)}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="font-semibold text-slate-700">{s.predikat ?? '—'}</span>
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
                      <td className="p-4 text-center">
                        <Link
                          href={route('guru.penilaian.showSiswa', [kelas.id_kelas, mapel.id_mapel, s.id_siswa])}
                          className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md font-medium text-xs transition-colors"
                        >
                          Input / Detail Nilai
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500">
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

PagePenilaianKelas.layout = (page) => (
  <GuruLayout user={page.props.auth.user} header="Penilaian Kelas">{page}</GuruLayout>
);

export default PagePenilaianKelas;
