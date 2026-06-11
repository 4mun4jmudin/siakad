import React, { useState } from 'react';
import GuruLayout from '@/Layouts/GuruLayout';
import { Head, Link } from '@inertiajs/react';
import { BookOpen, Users, ArrowLeft, Search, CheckCircle } from 'lucide-react';
import TextInput from '@/Components/TextInput';

export default function Show({ auth, kelas, mapelList }) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredMapel = mapelList.filter(m => 
        m.nama_mapel.toLowerCase().includes(searchTerm.toLowerCase()) || 
        m.guru_pengampu.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <GuruLayout user={auth.user} header={`Detail Kelas Perwalian - ${kelas.nama_kelas}`}>
            <Head title={`Kelas ${kelas.nama_kelas}`} />

            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                            <Link href={route('guru.walikelas.index')} className="hover:text-sky-600 transition-colors">
                                Kelas Perwalian
                            </Link>
                            <span>/</span>
                            <span className="font-semibold text-slate-700">{kelas.nama_kelas}</span>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                            <Link href={route('guru.walikelas.index')} className="p-1 rounded-full hover:bg-slate-100 transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            Daftar Mata Pelajaran
                        </h2>
                        <p className="text-slate-500 mt-1 ml-9">
                            Pilih mata pelajaran untuk memantau atau mengelola nilai seluruh siswa di kelas <b>{kelas.nama_kelas}</b>.
                        </p>
                    </div>
                    <div className="flex items-center gap-4 bg-white p-3 px-5 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Total Siswa</span>
                            <span className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                                <Users className="w-5 h-5 text-sky-500" />
                                {kelas.siswa_count}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Filter / Search */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full sm:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400" />
                        </div>
                        <TextInput
                            type="text"
                            placeholder="Cari mata pelajaran atau guru..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 block w-full border-slate-200 focus:border-sky-500 focus:ring-sky-500 rounded-xl"
                        />
                    </div>
                    <div className="text-sm text-slate-500 font-medium">
                        Menampilkan {filteredMapel.length} Mata Pelajaran
                    </div>
                </div>

                {/* Mapel List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMapel.length > 0 ? (
                        filteredMapel.map((mapel) => (
                            <div key={mapel.id_mapel} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300 flex flex-col h-full">
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                            <BookOpen className="h-5 w-5" />
                                        </div>
                                        {mapel.kategori && (
                                            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                                {mapel.kategori}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 line-clamp-2" title={mapel.nama_mapel}>
                                        {mapel.nama_mapel}
                                    </h3>
                                    <div className="mt-2 space-y-1">
                                        <p className="text-sm text-slate-600 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                                            Guru: <span className="font-semibold text-slate-800">{mapel.guru_pengampu}</span>
                                        </p>
                                        <p className="text-sm text-slate-600 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                            KKM: <span className="font-semibold text-slate-800">{mapel.kkm}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-6 pt-4 border-t border-slate-100 flex gap-2">
                                    <Link 
                                        href={route('guru.penilaian.showKelas', [kelas.id_kelas, mapel.id_mapel])}
                                        className="flex-1 text-center py-2 px-4 rounded-xl bg-sky-50 text-sky-700 font-semibold text-sm hover:bg-sky-100 transition-colors"
                                    >
                                        Kelola Nilai
                                    </Link>
                                    <Link 
                                        href={route('guru.penilaian.rekapKelas', [kelas.id_kelas, mapel.id_mapel])}
                                        className="flex-none py-2 px-4 rounded-xl bg-slate-50 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition-colors border border-slate-200"
                                        title="Lihat Rekap Kelas"
                                    >
                                        Rekap
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 border-dashed">
                            <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-slate-700">Mata Pelajaran Tidak Ditemukan</h3>
                            <p className="text-slate-500 mt-1">Coba gunakan kata kunci pencarian yang lain.</p>
                        </div>
                    )}
                </div>
            </div>
        </GuruLayout>
    );
}
