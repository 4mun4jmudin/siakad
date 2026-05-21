import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import GuruLayout from '@/Layouts/GuruLayout';
import { 
    ClipboardDocumentListIcon, 
    CalendarIcon,
    DocumentTextIcon,
    CheckCircleIcon,
    XCircleIcon,
    UserCircleIcon,
    DocumentCheckIcon
} from '@heroicons/react/24/outline';

export default function Show({ auth, tugas, hasilPengumpulan }) {
    const [selectedSiswa, setSelectedSiswa] = useState(null);
    const { data, setData, post, processing, errors, reset } = useForm({
        nilai: '',
        catatan_guru: ''
    });

    const openGradeModal = (siswa) => {
        setSelectedSiswa(siswa);
        setData({
            nilai: siswa.nilai || '',
            catatan_guru: siswa.catatan_guru || ''
        });
    };

    const closeGradeModal = () => {
        setSelectedSiswa(null);
        reset();
    };

    const submitGrade = (e) => {
        e.preventDefault();
        post(route('guru.tugas.nilai', [tugas.id_tugas, selectedSiswa.id_siswa]), {
            onSuccess: () => closeGradeModal(),
        });
    };

    return (
        <GuruLayout user={auth.user} header="Detail & Penilaian Tugas">
            <Head title="Detail Tugas" />

            <div className="max-w-7xl mx-auto space-y-6 pb-12">
                
                {/* Detail Tugas Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">{tugas.judul_tugas}</h2>
                            <div className="text-sm text-slate-500 mt-1 flex items-center gap-3">
                                <span>{tugas.jadwal_mengajar?.kelas ? `${tugas.jadwal_mengajar.kelas.tingkat} ${tugas.jadwal_mengajar.kelas.jurusan}` : 'Kelas Tidak Diketahui'}</span>
                                <span>•</span>
                                <span>{tugas.jadwal_mengajar?.mata_pelajaran?.nama_mapel || 'Mata Pelajaran Tidak Diketahui'}</span>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 whitespace-pre-wrap text-slate-700 text-sm">
                            {tugas.deskripsi || <span className="italic text-slate-400">Tidak ada deskripsi.</span>}
                        </div>

                        {tugas.file_tugas && (
                            <div>
                                <h4 className="text-sm font-semibold text-slate-700 mb-2">Lampiran File:</h4>
                                <a 
                                    href={`/storage-public/${tugas.file_tugas}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium border border-indigo-100"
                                >
                                    <DocumentTextIcon className="w-5 h-5" />
                                    Download / Lihat Lampiran
                                </a>
                            </div>
                        )}
                    </div>

                    <div className="w-full md:w-64 flex flex-col gap-4">
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Tenggat Waktu</div>
                            <div className="flex items-center gap-2 text-slate-800 font-medium">
                                <CalendarIcon className="w-5 h-5 text-indigo-500" />
                                {new Date(tugas.tenggat_waktu).toLocaleString('id-ID', {
                                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                            </div>
                        </div>
                        
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Tipe Tugas</div>
                            <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
                                ${tugas.tipe_tugas === 'Pemberitahuan' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-sky-50 text-sky-700 border-sky-100'}`}>
                                {tugas.tipe_tugas || 'Upload'}
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Status Tugas</div>
                            <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
                                ${tugas.status === 'Diterbitkan' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                  tugas.status === 'Draft' ? 'bg-slate-100 text-slate-700 border-slate-200' : 
                                  'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                {tugas.status}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Penilaian Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <ClipboardDocumentListIcon className="w-5 h-5 text-indigo-600" />
                            Daftar Pengumpulan Siswa
                        </h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-50 text-slate-600 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Siswa</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold">Waktu Kumpul</th>
                                    <th className="px-6 py-4 font-semibold">Jawaban</th>
                                    <th className="px-6 py-4 font-semibold">Nilai</th>
                                    <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {hasilPengumpulan.map((item) => (
                                    <tr key={item.id_siswa} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <UserCircleIcon className="w-8 h-8 text-slate-300" />
                                                <div>
                                                    <div className="font-semibold text-slate-800">{item.nama_lengkap}</div>
                                                    <div className="text-xs text-slate-400">NISN: {item.nisn}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {item.status_pengumpulan === 'Belum Mengumpulkan' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-rose-50 text-rose-700">
                                                    <XCircleIcon className="w-4 h-4" /> {tugas.tipe_tugas === 'Pemberitahuan' ? 'Belum Konfirmasi' : 'Belum Kumpul'}
                                                </span>
                                            ) : item.status_pengumpulan === 'Menunggu Penilaian' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700">
                                                    <DocumentCheckIcon className="w-4 h-4" /> Menunggu Nilai
                                                </span>
                                            ) : item.status_pengumpulan === 'Selesai' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                    <CheckCircleIcon className="w-4 h-4" /> Selesai (Dikonfirmasi)
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700">
                                                    <CheckCircleIcon className="w-4 h-4" /> Dinilai
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {item.waktu_pengumpulan ? new Date(item.waktu_pengumpulan).toLocaleString('id-ID', {
                                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                            }) : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {item.file_jawaban ? (
                                                <a href={`/storage-public/${item.file_jawaban}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1">
                                                    <DocumentTextIcon className="w-4 h-4" /> Lihat File
                                                </a>
                                            ) : item.teks_jawaban ? (
                                                <span className="text-slate-600 truncate max-w-[150px] inline-block" title={item.teks_jawaban}>
                                                    {item.teks_jawaban}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {item.nilai !== null ? (
                                                <span className="font-bold text-slate-800">{item.nilai}</span>
                                            ) : (
                                                <span className="text-slate-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => openGradeModal(item)}
                                                className="px-3 py-1.5 bg-indigo-50 text-indigo-700 font-semibold text-xs rounded-lg hover:bg-indigo-100 transition-colors"
                                            >
                                                {item.status_pengumpulan === 'Dinilai' ? 'Ubah Nilai' : 'Berikan Nilai'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {hasilPengumpulan.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                            Tidak ada siswa di kelas ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Penilaian */}
            {selectedSiswa && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="p-6 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800">
                                Penilaian: {selectedSiswa.nama_lengkap}
                            </h3>
                        </div>
                        <form onSubmit={submitGrade} className="p-6 space-y-4">
                            
                            {selectedSiswa.teks_jawaban && (
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm whitespace-pre-wrap max-h-48 overflow-y-auto">
                                    <span className="font-semibold block mb-1">Teks Jawaban:</span>
                                    {selectedSiswa.teks_jawaban}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nilai (0-100)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={data.nilai}
                                    onChange={e => setData('nilai', e.target.value)}
                                    className="w-full border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                />
                                {errors.nilai && <p className="mt-1 text-sm text-red-600">{errors.nilai}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Catatan Guru (Opsional)</label>
                                <textarea
                                    rows="3"
                                    value={data.catatan_guru}
                                    onChange={e => setData('catatan_guru', e.target.value)}
                                    className="w-full border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 mt-2">
                                <button
                                    type="button"
                                    onClick={closeGradeModal}
                                    className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    Simpan Nilai
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </GuruLayout>
    );
}
