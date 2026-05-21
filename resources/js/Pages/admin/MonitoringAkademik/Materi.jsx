import React, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
    BookOpenIcon, 
    ChartBarIcon, 
    AcademicCapIcon,
    AdjustmentsHorizontalIcon 
} from '@heroicons/react/24/outline';

export default function Materi({ monitoringData, mapels, filters }) {
    const { auth } = usePage().props;
    
    const [tingkat, setTingkat] = useState(filters.tingkat || '');
    const [idMapel, setIdMapel] = useState(filters.id_mapel || '');

    useEffect(() => {
        setTingkat(filters.tingkat || '');
        setIdMapel(filters.id_mapel || '');
    }, [filters.tingkat, filters.id_mapel]);

    const applyFilter = (newTingkat, newMapel) => {
        router.get(route('admin.monitoring.materi'), {
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
        router.get(route('admin.monitoring.materi'), {}, {
            preserveState: true,
            replace: true
        });
    };

    const isFiltered = tingkat !== '' || idMapel !== '';

    return (
        <AdminLayout user={auth.user} header="Monitoring Ketercapaian Materi">
            <Head title="Monitoring Materi" />

            <div className="max-w-7xl mx-auto pb-12 space-y-6">
                
                {/* Header Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <BookOpenIcon className="w-6 h-6 text-indigo-600" />
                            Monitoring Progress Materi
                        </h2>
                        <p className="text-slate-500 text-sm mt-1">Pantau persentase ketercapaian Rencana Materi per kelas dan mata pelajaran.</p>
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
                            className="rounded-xl border-slate-200 text-sm focus:ring-indigo-500 focus:border-indigo-500"
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
                                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors flex items-center gap-1.5"
                            >
                                <AdjustmentsHorizontalIcon className="w-4 h-4 text-slate-500" />
                                Reset Filter
                            </button>
                        )}
                    </div>
                </div>

                {/* Grid List */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {monitoringData.length > 0 ? (
                        monitoringData.map((data, index) => (
                            <div key={index} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                                {/* Gradient line */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" />

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
                                    <div className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-lg font-bold">
                                        {data.persentase}%
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-semibold text-slate-500">
                                        <span>Progress</span>
                                        <span>{data.materi_selesai} / {data.total_target} Materi</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                        <div 
                                            className={`h-2.5 rounded-full ${data.persentase >= 100 ? 'bg-emerald-500' : (data.persentase >= 50 ? 'bg-indigo-500' : 'bg-amber-500')}`} 
                                            style={{ width: `${data.persentase}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-100">
                            Tidak ada data jadwal atau rencana materi yang sesuai.
                        </div>
                    )}
                </div>

            </div>
        </AdminLayout>
    );
}
