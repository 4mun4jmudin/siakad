import React from 'react';
import GuruLayout from '@/Layouts/GuruLayout';
import { Head, Link } from '@inertiajs/react';
import { Users, ChevronRight, School } from 'lucide-react';

export default function Index({ auth, kelasPerwalian }) {
    return (
        <GuruLayout user={auth.user} header="Kelas Perwalian">
            <Head title="Kelas Perwalian" />

            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">Kelas Perwalian</h2>
                    <p className="text-slate-500 mt-1">Daftar kelas di mana Anda ditugaskan sebagai wali kelas.</p>
                </div>

                {kelasPerwalian && kelasPerwalian.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {kelasPerwalian.map((kelas) => (
                            <Link 
                                key={kelas.id_kelas} 
                                href={route('guru.walikelas.show', kelas.id_kelas)}
                                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-sky-300 transition-all duration-300 group block"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:bg-sky-500 group-hover:text-white transition-colors duration-300">
                                            <School className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-800 group-hover:text-sky-700 transition-colors">
                                                {kelas.tingkat} {kelas.jurusan}
                                            </h3>
                                            <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-500">
                                                <Users className="h-4 w-4" />
                                                <span>{kelas.siswa_count || 0} Siswa</span>
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-sky-500 transition-transform group-hover:translate-x-1" />
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-slate-200">
                        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 text-slate-400 mb-4">
                            <School className="h-10 w-10" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">Belum Ada Kelas</h3>
                        <p className="text-slate-500 mt-2 max-w-md mx-auto">
                            Anda saat ini belum ditugaskan sebagai wali kelas di kelas manapun. 
                            Hubungi administrator jika ada kesalahan.
                        </p>
                    </div>
                )}
            </div>
        </GuruLayout>
    );
}
