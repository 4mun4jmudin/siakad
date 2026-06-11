import React from "react";
import { Head, Link } from "@inertiajs/react";
import GuruLayout from "@/Layouts/GuruLayout";
import { Card, CardContent } from "@/Components/ui/card";

function PagePenilaianIndex({ kelasMapel = [], tahunAjaran, semester }) {
  return (
    <div className="space-y-6">
      <Head title="Penilaian Kelas" />

      <div>
        <h1 className="text-3xl font-bold text-slate-800">Penilaian Siswa</h1>
        <p className="text-slate-500 text-sm mt-1">
          Pilih kelas dan mata pelajaran untuk menginput atau mengelola nilai siswa pada Tahun Ajaran {tahunAjaran} ({semester}).
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kelasMapel.length > 0 ? (
          kelasMapel.map((item, index) => (
            <Card key={index} className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="mb-4 pb-4 border-b border-slate-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-indigo-700">{item.nama_kelas}</h2>
                      <p className="text-sm font-medium text-slate-600 mt-1">{item.nama_mapel}</p>
                    </div>
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                  </div>
                </div>
                <Link
                  href={route('guru.penilaian.showKelas', [item.id_kelas, item.id_mapel])}
                  className="w-full block text-center px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Kelola Penilaian
                </Link>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card className="border border-slate-200 bg-slate-50 border-dashed">
              <CardContent className="p-8 text-center text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <p>Belum ada jadwal kelas/mata pelajaran yang ditetapkan untuk Anda di semester ini.</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

PagePenilaianIndex.layout = (page) => (
  <GuruLayout user={page.props.auth.user} header="Penilaian">{page}</GuruLayout>
);

export default PagePenilaianIndex;
