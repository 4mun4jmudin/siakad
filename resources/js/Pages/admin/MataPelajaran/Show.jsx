import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeftIcon, PencilIcon, BookOpenIcon, UserGroupIcon, AcademicCapIcon, ClockIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

// Komponen Badge Kategori dan Status
const CategoryBadge = ({ category }) => {
    const style = { 
        'Wajib': 'bg-blue-50 text-blue-700 border-blue-200', 
        'Peminatan': 'bg-emerald-50 text-emerald-700 border-emerald-200', 
        'Muatan Lokal': 'bg-amber-50 text-amber-700 border-amber-200' 
    };
    return <span className={`px-3 py-1 text-xs font-bold rounded-xl border shadow-sm ${style[category] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>{category}</span>;
};

const StatusBadge = ({ status }) => {
    const style = { 
        'Aktif': 'bg-emerald-50 text-emerald-700 border-emerald-200', 
        'Tidak Aktif': 'bg-slate-50 text-slate-600 border-slate-200' 
    };
    return (
        <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-xl border shadow-sm ${style[status] || style['Tidak Aktif']}`}>
            {status === 'Aktif' && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>}
            {status}
        </span>
    );
};

const StatCard = ({ icon, title, value, color }) => (
    <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-white/60 shadow-sm hover:shadow-md transition-all duration-300 flex items-center space-x-4">
        <div className={`p-4 rounded-2xl ${color} shadow-inner`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-semibold text-slate-500">{title}</p>
            <p className="text-2xl font-bold text-slate-800 tracking-tight mt-1">{value}</p>
        </div>
    </div>
);

export default function Show({ auth, mataPelajaran, detailStats }) {
    return (
        <AdminLayout user={auth.user} header={`Detail Mata Pelajaran: ${mataPelajaran.nama_mapel}`}>
            <Head title={`Detail ${mataPelajaran.nama_mapel}`} />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-4 md:p-6 lg:p-8">
                <div className="max-w-[1440px] mx-auto space-y-8 animate-fadeInUp">
                    {/* Header Halaman */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-white/40 shadow-sm">
                        <Link href={route('admin.mata-pelajaran.index')} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors bg-white/80 px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm">
                            <ArrowLeftIcon className="h-4 w-4" />
                            Kembali ke Daftar
                        </Link>
                        <Link href={route('admin.mata-pelajaran.edit', mataPelajaran.id_mapel)} className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:from-blue-700 hover:to-indigo-700 hover:scale-105 active:scale-95 w-full sm:w-auto">
                            <PencilIcon className="h-4 w-4 mr-2" />
                            Edit Mata Pelajaran
                        </Link>
                    </div>

                    {/* Kartu Statistik Detail */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard icon={<AcademicCapIcon className="h-8 w-8 text-indigo-600"/>} title="Guru Pengampu" value={`${detailStats.jumlahGuru} Guru`} color="bg-indigo-100/80" />
                        <StatCard icon={<BookOpenIcon className="h-8 w-8 text-blue-600"/>} title="Diajarkan di" value={`${detailStats.jumlahKelas} Kelas`} color="bg-blue-100/80" />
                        <StatCard icon={<UserGroupIcon className="h-8 w-8 text-emerald-600"/>} title="Total Siswa" value={`${detailStats.totalSiswa} Siswa`} color="bg-emerald-100/80" />
                    </div>

                    {/* Detail Informasi & Jadwal */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Kolom Informasi */}
                        <div className="lg:col-span-1 bg-white/70 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/40 shadow-xl shadow-slate-200/50 h-fit">
                            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6 flex items-center gap-2">
                                <BookOpenIcon className="h-6 w-6 text-indigo-500" />
                                Informasi Mata Pelajaran
                            </h3>
                            <dl className="space-y-5 text-sm">
                                {[
                                    { label: 'Kode Mapel', value: mataPelajaran.id_mapel, mono: true },
                                    { label: 'Nama Mapel', value: mataPelajaran.nama_mapel, bold: true },
                                    { label: 'Kategori', value: <CategoryBadge category={mataPelajaran.kategori} />, isComponent: true },
                                    { label: 'Status', value: <StatusBadge status={mataPelajaran.status} />, isComponent: true },
                                    { label: 'JP / Minggu', value: `${mataPelajaran.jumlah_jp} Jam`, color: 'text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100' }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                                        <dt className="text-slate-500 font-semibold">{item.label}</dt>
                                        <dd className={`
                                            ${item.isComponent ? '' : 'text-slate-800'} 
                                            ${item.mono ? 'font-mono font-bold bg-slate-100/80 px-2 py-0.5 rounded-lg border border-slate-200' : ''}
                                            ${item.bold ? 'font-bold text-base' : 'font-medium'}
                                            ${item.color ? `font-bold ${item.color}` : ''}
                                        `}>
                                            {item.value}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </div>

                        {/* Kolom Jadwal */}
                        <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/40 shadow-xl shadow-slate-200/50">
                            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6 flex items-center gap-2">
                                <ClockIcon className="h-6 w-6 text-indigo-500" />
                                Daftar Jadwal Mengajar
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200/60">
                                    <thead className="bg-slate-50/50 rounded-xl">
                                        <tr>
                                            {['Hari', 'Waktu', 'Kelas', 'Guru Pengampu'].map(head => (
                                                <th key={head} className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em]">{head}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100/50 bg-white/40">
                                        {mataPelajaran.jadwal_mengajar.length > 0 ? mataPelajaran.jadwal_mengajar.map(jadwal => (
                                            <tr key={jadwal.id_jadwal} className="hover:bg-white/80 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">{jadwal.hari}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-indigo-600 bg-indigo-50/50">
                                                    {jadwal.jam_mulai.slice(0, 5)} - {jadwal.jam_selesai.slice(0, 5)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className="font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm">
                                                        {jadwal.kelas?.tingkat || '?'}-{jadwal.kelas?.jurusan || '?'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">
                                                    {jadwal.guru?.nama_lengkap || 'Guru Terhapus'}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <ClockIcon className="h-10 w-10 text-slate-300 mb-3" />
                                                        <p className="text-sm font-semibold">Tidak ada jadwal untuk mata pelajaran ini.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeInUp { animation: fadeInUp 0.4s ease-out both; }
            `}</style>
        </AdminLayout>
    );
}
