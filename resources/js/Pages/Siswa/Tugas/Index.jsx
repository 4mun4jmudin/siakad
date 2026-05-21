import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import SiswaLayout from '@/Layouts/SiswaLayout';
import { 
    ClipboardDocumentListIcon, 
    MagnifyingGlassIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';
import Pagination from '@/Components/Pagination';

export default function Index({ auth, tugas, filters }) {
    const [search, setSearch] = React.useState(filters.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('siswa.tugas.index'), { search }, { preserveState: true });
    };

    return (
        <SiswaLayout user={auth.user} header="Tugas Saya">
            <Head title="Tugas Saya" />

            <div className="max-w-7xl mx-auto space-y-6 pb-12">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <ClipboardDocumentListIcon className="w-6 h-6 text-indigo-600" />
                            Daftar Tugas
                        </h2>
                        <p className="text-slate-500 text-sm mt-1">Lihat dan kumpulkan tugas yang diberikan oleh guru.</p>
                    </div>

                    <div className="w-full md:w-auto">
                        <form onSubmit={handleSearch} className="relative w-full sm:w-64">
                            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari judul tugas..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </form>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tugas.data.map((item) => {
                        const isPastDue = new Date(item.tenggat_waktu) < new Date();
                        const pengumpulan = item.pengumpulan_tugas[0];
                        let statusColor = 'bg-rose-50 text-rose-700 border-rose-100';
                        let statusText = 'Belum Mengumpulkan';
                        
                        if (pengumpulan) {
                            if (pengumpulan.status_pengumpulan === 'Dinilai') {
                                statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                                statusText = `Dinilai: ${pengumpulan.nilai}`;
                            } else {
                                statusColor = 'bg-amber-50 text-amber-700 border-amber-100';
                                statusText = 'Menunggu Penilaian';
                            }
                        } else if (isPastDue) {
                            statusColor = 'bg-red-100 text-red-800 border-red-200';
                            statusText = 'Terlambat / Ditutup';
                        }

                        return (
                            <Link key={item.id_tugas} href={route('siswa.tugas.show', item.id_tugas)} className="block group">
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow relative overflow-hidden h-full flex flex-col">
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColor}`}>
                                                {statusText}
                                            </div>
                                            {pengumpulan && pengumpulan.status_pengumpulan === 'Dinilai' && (
                                                <div className="bg-emerald-100 text-emerald-700 font-bold px-3 py-1 rounded-lg text-sm">
                                                    {pengumpulan.nilai}
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-2">
                                            {item.judul_tugas}
                                        </h3>
                                        <div className="text-sm text-slate-500 mt-2 font-medium">
                                            {item.jadwal_mengajar?.mata_pelajaran?.nama_mapel}
                                        </div>
                                        <div className="text-xs text-slate-400 mt-1">
                                            Guru: {item.jadwal_mengajar?.guru?.nama_lengkap}
                                        </div>
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
                                        <div className="text-slate-500">
                                            <span className="block text-[10px] uppercase font-semibold tracking-wider text-slate-400 mb-0.5">Tenggat Waktu</span>
                                            <span className={isPastDue && !pengumpulan ? 'text-red-500 font-semibold' : 'text-slate-700'}>
                                                {new Date(item.tenggat_waktu).toLocaleString('id-ID', {
                                                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                            <ChevronRightIcon className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {tugas.data.length === 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
                        <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <ClipboardDocumentListIcon className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700">Tidak ada tugas</h3>
                        <p className="text-slate-500 mt-1">Belum ada tugas yang diberikan untuk kelas Anda saat ini.</p>
                    </div>
                )}

                {tugas.links && tugas.data.length > 0 && (
                    <div className="mt-6">
                        <Pagination links={tugas.links} />
                    </div>
                )}
            </div>
        </SiswaLayout>
    );
}
