import React, { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import SiswaLayout from '@/Layouts/SiswaLayout';
import { 
    BookOpenIcon, 
    CheckCircleIcon, 
    ClockIcon, 
    FunnelIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';

export default function Index({ auth, materiList = [], stats = { total: 0, tuntas: 0, persentase: 0 }, subjects = [] }) {
    const [selectedSubject, setSelectedSubject] = useState('Semua');

    const filteredMateri = useMemo(() => {
        if (selectedSubject === 'Semua') {
            return materiList;
        }
        return materiList.filter(item => item.nama_mapel === selectedSubject);
    }, [materiList, selectedSubject]);

    return (
        <SiswaLayout user={auth.user} header="Materi Pembelajaran">
            <Head title="Materi Pembelajaran" />

            <div className="max-w-7xl mx-auto space-y-8 pb-12">
                
                {/* Header Banner */}
                <div className="relative overflow-hidden bg-gradient-to-r from-sky-600 to-indigo-700 rounded-3xl p-6 md:p-8 shadow-xl text-white">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-56 h-56 rounded-full bg-white/10 blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-72 h-72 rounded-full bg-sky-500/10 blur-3xl"></div>
                    
                    <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Perkembangan Belajar Anda</h2>
                            <p className="text-sky-100 text-sm md:text-base max-w-xl">
                                Pantau dan pelajari seluruh materi pelajaran yang dirancang guru untuk tingkat kelas Anda secara real-time.
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 md:p-6 rounded-2xl border border-white/10 self-start md:self-auto shrink-0 shadow-inner">
                            <div className="relative flex items-center justify-center w-16 h-16 md:w-20 md:h-20">
                                {/* SVG Circular Progress */}
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle 
                                        cx="50%" cy="50%" r="34" 
                                        className="stroke-white/20 fill-none" 
                                        strokeWidth="6"
                                    />
                                    <circle 
                                        cx="50%" cy="50%" r="34" 
                                        className="stroke-sky-300 fill-none transition-all duration-500" 
                                        strokeWidth="6"
                                        strokeDasharray={`${2 * Math.PI * 34}`}
                                        strokeDashoffset={`${2 * Math.PI * 34 * (1 - stats.persentase / 100)}`}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <span className="absolute text-lg md:text-xl font-bold">{stats.persentase}%</span>
                            </div>
                            <div>
                                <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-sky-200">Ketercapaian</div>
                                <div className="text-xl md:text-2xl font-extrabold mt-0.5">{stats.tuntas} <span className="text-xs md:text-sm font-normal text-sky-200">dari {stats.total} Materi</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-700 font-semibold">
                        <FunnelIcon className="w-5 h-5 text-indigo-500" />
                        <span>Filter Mata Pelajaran</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedSubject('Semua')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                                selectedSubject === 'Semua' 
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                            }`}
                        >
                            Semua Mata Pelajaran
                        </button>
                        {subjects.map(subject => (
                            <button
                                key={subject}
                                onClick={() => setSelectedSubject(subject)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                                    selectedSubject === subject 
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                                }`}
                            >
                                {subject}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Timeline Materi */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-8 border-b border-slate-100 pb-4">
                        <ChartBarIcon className="w-5 h-5 text-indigo-600" />
                        Garis Waktu Rencana Pembelajaran
                    </h3>

                    {filteredMateri.length > 0 ? (
                        <div className="relative border-l-2 border-slate-100 ml-4 md:ml-6 pl-6 md:pl-8 space-y-12">
                            {filteredMateri.map((item, idx) => (
                                <div key={item.id_rencana} className="relative">
                                    {/* Timeline Node Badge */}
                                    <span className={`absolute -left-[45px] md:-left-[53px] top-0 flex items-center justify-center w-9 h-9 md:w-11 md:h-11 rounded-full border-4 shadow-sm transition-all duration-300 ${
                                        item.is_tuntas 
                                        ? 'bg-emerald-500 border-emerald-100 text-white shadow-emerald-500/20' 
                                        : 'bg-slate-100 border-white text-slate-400'
                                    }`}>
                                        {item.is_tuntas ? (
                                            <CheckCircleIcon className="w-5 h-5 md:w-6 h-6" />
                                        ) : (
                                            <ClockIcon className="w-5 h-5 md:w-6 h-6" />
                                        )}
                                    </span>

                                    {/* Content Card */}
                                    <div className={`p-5 md:p-6 rounded-2xl border transition-all duration-300 ${
                                        item.is_tuntas 
                                        ? 'bg-emerald-50/20 border-emerald-100 hover:shadow-md hover:shadow-emerald-500/5' 
                                        : 'bg-white border-slate-100 hover:shadow-md hover:shadow-slate-500/5'
                                    }`}>
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-extrabold text-[10px] md:text-xs rounded-lg uppercase tracking-wider">
                                                    {item.nama_mapel}
                                                </span>
                                                <span className="text-xs font-semibold text-slate-500">
                                                    Pertemuan Ke-{item.pertemuan_ke}
                                                </span>
                                            </div>
                                            
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] md:text-xs font-bold border self-start sm:self-auto ${
                                                item.is_tuntas 
                                                ? 'bg-emerald-100/60 text-emerald-700 border-emerald-200' 
                                                : 'bg-slate-50 text-slate-500 border-slate-200'
                                            }`}>
                                                {item.is_tuntas ? 'Selesai Dibahas' : 'Belum Dibahas'}
                                            </span>
                                        </div>

                                        <h4 className="text-base md:text-lg font-bold text-slate-800 mb-2">{item.judul_materi}</h4>
                                        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                                            {item.deskripsi || <span className="italic text-slate-400">Tidak ada rincian deskripsi materi.</span>}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <BookOpenIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h4 className="text-lg font-semibold text-slate-700 mb-1">Materi Tidak Ditemukan</h4>
                            <p className="text-slate-500 text-sm max-w-sm mx-auto">
                                Tidak ada rencana materi pelajaran untuk mata pelajaran "{selectedSubject}" pada tingkat kelas Anda saat ini.
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </SiswaLayout>
    );
}
