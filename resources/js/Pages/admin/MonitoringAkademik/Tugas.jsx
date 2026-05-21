import React, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
    ClipboardDocumentListIcon, 
    ChartBarIcon, 
    AcademicCapIcon,
    AdjustmentsHorizontalIcon,
    CalendarDaysIcon,
    CheckCircleIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';

export default function Tugas({ monitoringData, mapels, filters }) {
    const { auth } = usePage().props;
    
    const [tingkat, setTingkat] = useState(filters.tingkat || '');
    const [idMapel, setIdMapel] = useState(filters.id_mapel || '');

    useEffect(() => {
        setTingkat(filters.tingkat || '');
        setIdMapel(filters.id_mapel || '');
    }, [filters.tingkat, filters.id_mapel]);

    const applyFilter = (newTingkat, newMapel) => {
        router.get(route('admin.monitoring.tugas'), {
            tingkat: newTingkat,
            id_mapel: newMapel
        }, {
            preserveState: true,
            replace: true
        });
    };

    const handleReset = () => {
        setTingkat('');
        setIdMapel('');
        router.get(route('admin.monitoring.tugas'), {}, {
            preserveState: true,
            replace: true
        });
    };

    const isFiltered = tingkat !== '' || idMapel !== '';

    // Helper to format date beautifully
    const formatDate = (dateString) => {
        if (!dateString) return 'Tidak ada tenggat';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) + ' WIB';
    };

    return (
        <AdminLayout user={auth.user} header="Monitoring Tugas Siswa">
            <Head title="Monitoring Tugas" />

            <div className="max-w-7xl mx-auto pb-12 space-y-6">
                
                {/* Header Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <ClipboardDocumentListIcon className="w-6 h-6 text-indigo-600" />
                            Monitoring Progress Tugas
                        </h2>
                        <p className="text-slate-500 text-sm mt-1">Pantau tingkat pengumpulan tugas dan rata-rata nilai siswa per mata pelajaran.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <select 
                            className="rounded-xl border-slate-200 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                            value={tingkat}
                            onChange={(e) => {
                                const val = e.target.value;
                                setTingkat(val);
                                applyFilter(val, idMapel);
                            }}
                        >
                            <option value="">Semua Tingkat</option>
                            <option value="X">Kelas X</option>
                            <option value="XI">Kelas XI</option>
                            <option value="XII">Kelas XII</option>
                        </select>
                        <select 
                            className="rounded-xl border-slate-200 text-sm focus:ring-indigo-500 focus:border-indigo-500 animate-fade-in"
                            value={idMapel}
                            onChange={(e) => {
                                const val = e.target.value;
                                setIdMapel(val);
                                applyFilter(tingkat, val);
                            }}
                        >
                            <option value="">Semua Mapel</option>
                            {mapels.map((m) => (
                                <option key={m.id_mapel} value={m.id_mapel}>{m.nama_mapel}</option>
                            ))}
                        </select>
                        {isFiltered && (
                            <button 
                                onClick={handleReset}
                                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-all flex items-center gap-1.5 active:scale-95"
                            >
                                <AdjustmentsHorizontalIcon className="w-4 h-4 text-slate-500" />
                                Reset Filter
                            </button>
                        )}
                    </div>
                </div>

                {/* Grid List */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {monitoringData.length > 0 ? (
                        monitoringData.map((data, index) => (
                          <div key={index} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col justify-between">
                                {/* Gradient hover line */}
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-violet-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                                {data.mapel}
                                            </h3>
                                            <div className="flex flex-col gap-1 mt-2 text-sm text-slate-600">
                                                <span className="flex items-center gap-1.5"><AcademicCapIcon className="w-4 h-4 text-slate-400"/> Kelas {data.kelas}</span>
                                                <span className="flex items-center gap-1.5"><ChartBarIcon className="w-4 h-4 text-slate-400"/> {data.guru}</span>
                                            </div>
                                        </div>
                                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                                            data.status === 'Aktif' 
                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                                : 'bg-rose-50 text-rose-700 border border-rose-100'
                                        }`}>
                                            {data.status}
                                        </span>
                                    </div>

                                    {/* Task Detail Card */}
                                    <div className="bg-slate-50 p-4 rounded-xl space-y-2 mb-4 border border-slate-100">
                                        <h4 className="font-bold text-slate-800 text-sm line-clamp-1">
                                            {data.judul_tugas}
                                        </h4>
                                        {data.deskripsi_tugas && (
                                            <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                                                {data.deskripsi_tugas}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1.5 border-t border-slate-200/60">
                                            <CalendarDaysIcon className="w-4 h-4 text-indigo-500" />
                                            <span>Batas: {formatDate(data.tenggat_waktu)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-3 border-t border-slate-100">
                                    <div className="flex justify-between text-xs font-semibold text-slate-500">
                                        <span className="flex items-center gap-1"><CheckCircleIcon className="w-4 h-4 text-indigo-500" /> Pengumpulan</span>
                                        <span>{data.siswa_mengumpulkan} / {data.total_siswa} Siswa ({data.persentase}%)</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                        <div 
                                            className={`h-2.5 rounded-full transition-all duration-500 ${
                                                data.persentase >= 100 
                                                    ? 'bg-emerald-500' 
                                                    : (data.persentase >= 50 ? 'bg-indigo-500' : 'bg-amber-500')
                                            }`} 
                                            style={{ width: `${data.persentase}%` }}
                                        />
                                    </div>

                                    {/* Average Score Stats */}
                                    <div className="flex items-center justify-between bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100/30">
                                        <span className="text-xs font-medium text-slate-600 flex items-center gap-1">
                                            <SparklesIcon className="w-4 h-4 text-indigo-500" />
                                            Rata-rata Nilai Kelas:
                                        </span>
                                        <span className="text-sm font-bold text-indigo-700">
                                            {data.rata_rata_nilai !== null ? `${data.rata_rata_nilai} / 100` : 'Belum Dinilai'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center space-y-3">
                            <ClipboardDocumentListIcon className="w-12 h-12 text-slate-300" />
                            <div>
                                <h4 className="font-bold text-slate-700 text-lg">Tidak Ada Data Tugas</h4>
                                <p className="text-slate-400 text-sm mt-1">Tidak ada data jadwal kelas atau penugasan aktif yang sesuai dengan kriteria filter.</p>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </AdminLayout>
    );
}
