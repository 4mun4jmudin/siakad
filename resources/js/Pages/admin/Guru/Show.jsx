import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeftIcon,
    PencilIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    MagnifyingGlassIcon,
    IdentificationIcon,
    CalendarDaysIcon,
    ClockIcon,
    BookOpenIcon,
    BriefcaseIcon,
    UserIcon,
    QrCodeIcon,
    FingerPrintIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

// --- KONFIGURASI TAB ---
const TABS = [
    { id: 'informasi', label: 'Informasi Umum', icon: IdentificationIcon },
    { id: 'jadwal', label: 'Jadwal Mengajar', icon: CalendarDaysIcon },
    { id: 'riwayat', label: 'Riwayat Absensi', icon: ClockIcon },
    { id: 'jurnal', label: 'Jurnal Mengajar', icon: BookOpenIcon },
];

// --- HELPER FORMAT TANGGAL ---
function formatDateISO(dateStr) {
    try {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: '2-digit', month: 'long', year: 'numeric', weekday: 'long'
        });
    } catch (e) {
        return dateStr || '-';
    }
}

function timeSlice(t) {
    return t ? t.slice(0, 5) : '-';
}

// --- KOMPONEN KECIL ---
const Pill = ({ children, className = '' }) => (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide border shadow-sm backdrop-blur-sm ${className}`}>
        {children}
    </span>
);

const EmptyState = ({ title, subtitle, icon: Icon = BookOpenIcon }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 text-center"
    >
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/60 backdrop-blur-sm text-slate-400 shadow-inner">
            <Icon className="h-10 w-10" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <p className="mt-2 max-w-md text-sm text-slate-500 leading-relaxed">{subtitle}</p>
    </motion.div>
);

export default function Show({ auth, guru, jadwalMengajar = {}, riwayatAbsensi = [], jurnalMengajar = [] }) {
    const [activeTab, setActiveTab] = useState('informasi');
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 10;

    // Reset page saat tab atau query berubah
    useEffect(() => {
        setPage(1);
    }, [activeTab, query]);

    // Navigasi Keyboard untuk Tab
    useEffect(() => {
        function onKey(e) {
            if (['ArrowRight', 'ArrowLeft'].includes(e.key)) {
                const idx = TABS.findIndex(t => t.id === activeTab);
                const nextIdx = e.key === 'ArrowRight'
                    ? (idx + 1) % TABS.length
                    : (idx - 1 + TABS.length) % TABS.length;
                setActiveTab(TABS[nextIdx].id);
            }
        }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [activeTab]);

    // Urutkan Hari Jadwal
    const daysOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    const sortedDays = useMemo(() => {
        return Object.keys(jadwalMengajar || {}).sort((a, b) => daysOrder.indexOf(a) - daysOrder.indexOf(b));
    }, [jadwalMengajar]);

    // Filter Data Absensi
    const filteredAbsensi = useMemo(() => {
        if (!riwayatAbsensi) return [];
        return riwayatAbsensi.filter(a => {
            const q = query.toLowerCase();
            return (
                a.status_kehadiran?.toLowerCase().includes(q) ||
                a.keterangan?.toLowerCase().includes(q) ||
                (a.tanggal && formatDateISO(a.tanggal).toLowerCase().includes(q))
            );
        });
    }, [riwayatAbsensi, query]);

    // Filter Data Jurnal
    const filteredJurnal = useMemo(() => {
        if (!jurnalMengajar) return [];
        return jurnalMengajar.filter(j => {
            const q = query.toLowerCase();
            return (
                j.materi_pembahasan?.toLowerCase().includes(q) ||
                j.jadwal_mengajar?.mata_pelajaran?.nama_mapel?.toLowerCase().includes(q) ||
                (j.tanggal && formatDateISO(j.tanggal).toLowerCase().includes(q))
            );
        });
    }, [jurnalMengajar, query]);

    // Helper Pagination Client-side
    function paginate(arr) {
        const start = (page - 1) * pageSize;
        return arr.slice(start, start + pageSize);
    }

    return (
        <>
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeInUp { animation: fadeInUp 0.5s ease-out both; }
            `}</style>

            <AdminLayout user={auth.user} header={`Detail Guru`}>
                <Head title={`Detail ${guru.nama_lengkap}`} />

                {/* Premium Background */}
                <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-4 md:p-6 lg:p-8">
                    <div className="max-w-[1440px] mx-auto space-y-8 animate-fadeInUp">

                        {/* --- HEADER PROFILE CARD --- */}
                        <div className="relative overflow-hidden rounded-3xl border border-white/40 bg-white/70 backdrop-blur-xl shadow-xl shadow-slate-200/50">
                            {/* Gradient Header Banner */}
                            <div className="h-40 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                                <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl" />
                            </div>

                            <div className="px-6 md:px-10 pb-8 relative">
                                <div className="flex flex-col sm:flex-row items-end -mt-16 mb-6 justify-between gap-6">
                                    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 w-full sm:w-auto">
                                        <div className="relative group">
                                            <div className="h-32 w-32 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-white relative z-10">
                                                {guru.foto_profil ? (
                                                    <img
                                                        src={`/storage-public/${guru.foto_profil}`}
                                                        alt={guru.nama_lengkap}
                                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-4xl font-bold text-white">
                                                        {guru.nama_lengkap.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className={`absolute -bottom-2 -right-2 h-8 w-8 rounded-xl border-4 border-white z-20 flex items-center justify-center shadow-lg ${guru.status === 'Aktif' ? 'bg-emerald-500' : 'bg-slate-400'}`}>
                                                <div className="h-2.5 w-2.5 bg-white rounded-full animate-pulse" />
                                            </div>
                                        </div>
                                        <div className="text-center sm:text-left mb-2">
                                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{guru.nama_lengkap}</h1>
                                            <p className="mt-1 text-sm font-medium text-slate-500">
                                                NIP: <span className="text-slate-700">{guru.nip || 'Belum Terdaftar'}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                                        <Link href={route('admin.guru.index')} className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 rounded-xl border border-slate-200/60 bg-white/80 backdrop-blur-sm px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:scale-105 active:scale-95">
                                            <ArrowLeftIcon className="h-4 w-4" /> Kembali
                                        </Link>
                                        <Link href={route('admin.guru.edit', guru.id_guru)} className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:from-blue-700 hover:to-indigo-700 hover:scale-105 active:scale-95">
                                            <PencilIcon className="h-4 w-4" /> Edit Profil
                                        </Link>
                                    </div>
                                </div>

                                {/* Badges Info Singkat */}
                                <div className="flex flex-wrap gap-3 pt-6 border-t border-slate-100/50">
                                    <Pill className={guru.status === 'Aktif' ? 'bg-emerald-50/80 text-emerald-700 border-emerald-200/50' : 'bg-rose-50/80 text-rose-700 border-rose-200/50'}>
                                        <span className="relative flex h-2 w-2 mr-2">
                                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${guru.status === 'Aktif' ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                                            <span className={`relative inline-flex rounded-full h-2 w-2 ${guru.status === 'Aktif' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                        </span>
                                        {guru.status || '-'}
                                    </Pill>
                                    <Pill className="bg-blue-50/80 text-blue-700 border-blue-200/50">
                                        <IdentificationIcon className="h-3.5 w-3.5 mr-1.5" /> ID: {guru.id_guru}
                                    </Pill>
                                    <Pill className="bg-purple-50/80 text-purple-700 border-purple-200/50">
                                        <UserIcon className="h-3.5 w-3.5 mr-1.5" />
                                        {guru.pengguna?.username ? `Akun: ${guru.pengguna.username}` : 'Tanpa Akun Login'}
                                    </Pill>
                                    {guru.kelas_wali && (
                                        <Pill className="bg-orange-50/80 text-orange-700 border-orange-200/50">
                                            <BriefcaseIcon className="h-3.5 w-3.5 mr-1.5" />
                                            Wali Kelas: {guru.kelas_wali.tingkat} {guru.kelas_wali.jurusan}
                                        </Pill>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* --- TABS NAVIGATION & CONTENT --- */}
                        <div className="bg-white/70 backdrop-blur-xl shadow-xl shadow-slate-200/50 rounded-3xl border border-white/40 overflow-hidden min-h-[500px]">

                            {/* Tab Header */}
                            <div className="border-b border-white/40 bg-white/40">
                                <div className="px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">

                                    {/* Desktop Tabs */}
                                    <nav className="hidden md:flex space-x-2 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50" aria-label="Tabs">
                                        {TABS.map(tab => {
                                            const Icon = tab.icon;
                                            const isActive = activeTab === tab.id;
                                            return (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => setActiveTab(tab.id)}
                                                    className={`
                                                        group relative inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300
                                                        ${isActive
                                                            ? 'text-blue-700 bg-white shadow-sm ring-1 ring-slate-200/50'
                                                            : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                                                        }
                                                    `}
                                                >
                                                    <Icon className={`-ml-0.5 mr-2.5 h-5 w-5 transition-colors ${isActive ? 'text-blue-500' : 'text-slate-400 group-hover:text-slate-500'}`} />
                                                    {tab.label}
                                                </button>
                                            );
                                        })}
                                    </nav>

                                    {/* Mobile Tab Select */}
                                    <div className="md:hidden">
                                        <select
                                            className="block w-full rounded-xl border-slate-200 bg-white/80 backdrop-blur-sm focus:border-blue-500 focus:ring-blue-500 font-medium text-slate-700"
                                            value={activeTab}
                                            onChange={(e) => setActiveTab(e.target.value)}
                                        >
                                            {TABS.map((tab) => (
                                                <option key={tab.id} value={tab.id}>{tab.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Search Bar */}
                                    {activeTab !== 'informasi' && activeTab !== 'jadwal' && (
                                        <div className="relative w-full lg:w-72">
                                            <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="text"
                                                className="w-full rounded-xl border border-slate-200/60 bg-white/60 backdrop-blur-md py-2.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 focus:bg-white/90 placeholder:text-slate-400 shadow-inner"
                                                placeholder="Cari data..."
                                                value={query}
                                                onChange={(e) => setQuery(e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Tab Content Body */}
                            <div className="p-6 md:p-8 bg-transparent">
                                <AnimatePresence mode='wait'>
                                    {activeTab === 'informasi' && (
                                        <motion.div
                                            key="informasi"
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -15 }}
                                            transition={{ duration: 0.3 }}
                                            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                                        >
                                            <div className="bg-white/60 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/60 shadow-lg hover:shadow-xl transition-shadow duration-300">
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className="p-2.5 bg-blue-100/80 rounded-xl text-blue-600">
                                                        <IdentificationIcon className="h-6 w-6" />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-slate-800">Detail Pribadi</h3>
                                                </div>
                                                <dl className="space-y-5 text-sm">
                                                    {[
                                                        { label: 'ID Guru', value: guru.id_guru, mono: true },
                                                        { label: 'NIP', value: guru.nip || '-' },
                                                        { label: 'Jenis Kelamin', value: guru.jenis_kelamin },
                                                        { label: 'Status', value: guru.status, badge: true },
                                                    ].map((item, idx) => (
                                                        <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                                                            <dt className="font-semibold text-slate-500">{item.label}</dt>
                                                            <dd className="sm:col-span-2 text-slate-900 font-medium flex items-center">
                                                                {item.badge ? (
                                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold border ${guru.status === 'Aktif' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                                                                        {item.value}
                                                                    </span>
                                                                ) : item.mono ? (
                                                                    <span className="font-mono bg-slate-100/80 px-2 py-0.5 rounded-md font-semibold">{item.value}</span>
                                                                ) : (
                                                                    item.value
                                                                )}
                                                            </dd>
                                                        </div>
                                                    ))}
                                                </dl>
                                            </div>

                                            <div className="bg-white/60 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/60 shadow-lg hover:shadow-xl transition-shadow duration-300">
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className="p-2.5 bg-orange-100/80 rounded-xl text-orange-600">
                                                        <QrCodeIcon className="h-6 w-6" />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-slate-800">Data Sistem</h3>
                                                </div>
                                                <dl className="space-y-5 text-sm">
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 border-b border-slate-100 pb-4">
                                                        <dt className="font-semibold text-slate-500">Barcode ID</dt>
                                                        <dd className="sm:col-span-2 text-slate-900 font-mono bg-slate-100/80 px-2 py-0.5 rounded-md w-fit font-semibold">{guru.barcode_id || '-'}</dd>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 border-b border-slate-100 pb-4">
                                                        <dt className="font-semibold text-slate-500">Sidik Jari</dt>
                                                        <dd className="sm:col-span-2">
                                                            {guru.sidik_jari_template ? (
                                                                <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                                                                    <FingerPrintIcon className="w-4 h-4" /> Terdaftar
                                                                </span>
                                                            ) : (
                                                                <span className="text-slate-400 italic">Belum didaftarkan</span>
                                                            )}
                                                        </dd>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 border-b border-slate-100 pb-4">
                                                        <dt className="font-semibold text-slate-500">Wali Kelas</dt>
                                                        <dd className="sm:col-span-2">
                                                            {guru.kelas_wali ? (
                                                                <span className="inline-flex items-center gap-1.5 text-blue-700 font-bold bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                                                                    <BriefcaseIcon className="w-4 h-4" /> {guru.kelas_wali.tingkat} {guru.kelas_wali.jurusan}
                                                                </span>
                                                            ) : '-'}
                                                        </dd>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4">
                                                        <dt className="font-semibold text-slate-500">Terdaftar</dt>
                                                        <dd className="sm:col-span-2 text-slate-900 font-medium">{guru.created_at ? formatDateISO(guru.created_at) : '-'}</dd>
                                                    </div>
                                                </dl>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Tab Jadwal - kartu kaca */}
                                    {activeTab === 'jadwal' && (
                                        <motion.div key="jadwal" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                                            {sortedDays.length === 0 ? (
                                                <EmptyState title="Jadwal Kosong" subtitle="Belum ada jadwal mengajar yang tersedia untuk guru ini." icon={CalendarDaysIcon} />
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    {sortedDays.map(hari => (
                                                        <div key={hari} className="bg-white/70 backdrop-blur-sm rounded-3xl border border-white/60 shadow-lg overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1">
                                                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 px-5 py-4 border-b border-white/60 flex justify-between items-center">
                                                                <h4 className="font-bold text-slate-800 text-lg">{hari}</h4>
                                                                <span className="text-xs font-bold bg-white text-blue-700 px-3 py-1 rounded-xl shadow-sm border border-blue-100">
                                                                    {jadwalMengajar[hari].length} Mapel
                                                                </span>
                                                            </div>
                                                            <ul className="divide-y divide-slate-100/50 p-2">
                                                                {jadwalMengajar[hari].map(item => (
                                                                    <li key={item.id_jadwal} className="p-4 hover:bg-white/60 rounded-2xl transition-colors">
                                                                        <div className="flex justify-between items-start mb-2">
                                                                            <span className="text-sm font-bold text-slate-900">{item.mata_pelajaran.nama_mapel}</span>
                                                                            <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100/50 shadow-sm">
                                                                                {timeSlice(item.jam_mulai)} - {timeSlice(item.jam_selesai)}
                                                                            </span>
                                                                        </div>
                                                                        <div className="text-xs text-slate-500 flex items-center gap-2">
                                                                            <span className="font-medium">Kelas:</span>
                                                                            <span className="font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm">
                                                                                {item.kelas?.tingkat || 'Tanpa Kelas'} {item.kelas?.jurusan || ''}
                                                                            </span>
                                                                        </div>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </motion.div>
                                    )}

                                    {/* Tab Riwayat Absensi - Tabel Kaca Premium */}
                                    {activeTab === 'riwayat' && (
                                        <motion.div key="riwayat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                                            {filteredAbsensi.length === 0 ? (
                                                <EmptyState title="Tidak ada data" subtitle="Belum ada riwayat absensi yang tercatat sesuai pencarian." icon={ClockIcon} />
                                            ) : (
                                                <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-white/60 shadow-lg overflow-hidden">
                                                    <div className="overflow-x-auto">
                                                        <table className="min-w-full divide-y divide-slate-200/50">
                                                            <thead className="bg-white/40">
                                                                <tr>
                                                                    {['Tanggal', 'Status', 'Waktu', 'Keterangan'].map(h => (
                                                                        <th key={h} className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em]">{h}</th>
                                                                    ))}
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-slate-100/50 bg-transparent">
                                                                {paginate(filteredAbsensi).map((item, idx) => (
                                                                    <tr key={item.id_absensi || idx} className="hover:bg-white/70 transition-colors">
                                                                        <td className="px-6 py-4 text-sm text-slate-900 font-bold">{formatDateISO(item.tanggal)}</td>
                                                                        <td className="px-6 py-4 text-sm">
                                                                            <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-xl border shadow-sm backdrop-blur-sm
                                                                                ${item.status_kehadiran === 'Hadir' ? 'bg-emerald-50/80 text-emerald-700 border-emerald-200' :
                                                                                    item.status_kehadiran === 'Sakit' ? 'bg-blue-50/80 text-blue-700 border-blue-200' :
                                                                                        item.status_kehadiran === 'Izin' ? 'bg-amber-50/80 text-amber-700 border-amber-200' :
                                                                                            'bg-rose-50/80 text-rose-700 border-rose-200'}`}
                                                                            >
                                                                                {item.status_kehadiran}
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-6 py-4 text-sm text-slate-600 font-mono font-medium">
                                                                            <span className="bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">{timeSlice(item.jam_masuk)}</span>
                                                                            <span className="mx-2 text-slate-400">-</span>
                                                                            <span className="bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">{timeSlice(item.jam_pulang)}</span>
                                                                        </td>
                                                                        <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate font-medium">{item.keterangan || '-'}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    {/* Pagination */}
                                                    <div className="bg-white/40 px-6 py-4 border-t border-white/60 flex items-center justify-between">
                                                        <div className="flex-1 flex justify-between sm:hidden">
                                                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-semibold rounded-xl text-slate-700 bg-white hover:bg-white/80 disabled:opacity-50 transition-all shadow-sm">
                                                                Sebelumnya
                                                            </button>
                                                            <button onClick={() => setPage(p => p + 1)} disabled={page * pageSize >= filteredAbsensi.length} className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-semibold rounded-xl text-slate-700 bg-white hover:bg-white/80 disabled:opacity-50 transition-all shadow-sm">
                                                                Selanjutnya
                                                            </button>
                                                        </div>
                                                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                                            <p className="text-sm text-slate-600">
                                                                Menampilkan <span className="font-bold text-slate-900">{Math.min((page - 1) * pageSize + 1, filteredAbsensi.length)}</span> sampai <span className="font-bold text-slate-900">{Math.min(page * pageSize, filteredAbsensi.length)}</span> dari <span className="font-bold text-slate-900">{filteredAbsensi.length}</span> data
                                                            </p>
                                                            <nav className="relative z-0 inline-flex rounded-xl shadow-sm -space-x-px" aria-label="Pagination">
                                                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="relative inline-flex items-center px-3 py-2 rounded-l-xl border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-white/80 disabled:opacity-50 transition-colors">
                                                                    <ChevronLeftIcon className="h-5 w-5" />
                                                                </button>
                                                                <button onClick={() => setPage(p => p + 1)} disabled={page * pageSize >= filteredAbsensi.length} className="relative inline-flex items-center px-3 py-2 rounded-r-xl border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-white/80 disabled:opacity-50 transition-colors">
                                                                    <ChevronRightIcon className="h-5 w-5" />
                                                                </button>
                                                            </nav>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}

                                    {/* Tab Jurnal */}
                                    {activeTab === 'jurnal' && (
                                        <motion.div key="jurnal" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                                            {filteredJurnal.length === 0 ? (
                                                <EmptyState title="Jurnal Kosong" subtitle="Belum ada catatan jurnal mengajar sesuai pencarian." icon={BookOpenIcon} />
                                            ) : (
                                                <div className="space-y-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {paginate(filteredJurnal).map((item, idx) => (
                                                            <div key={item.id_jurnal || idx} className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-white/60 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                                                                <div className="flex justify-between items-start mb-4 gap-4">
                                                                    <div>
                                                                        <h4 className="text-base font-bold text-slate-900 leading-tight">
                                                                            {item.jadwal_mengajar?.mata_pelajaran?.nama_mapel || 'Mapel Tidak Dikenal'}
                                                                        </h4>
                                                                        <div className="flex items-center gap-2 mt-2 text-xs font-semibold text-slate-500">
                                                                            <span className="bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                                                                                {formatDateISO(item.tanggal)}
                                                                            </span>
                                                                            <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg border border-indigo-100">
                                                                                {item.jadwal_mengajar?.kelas?.tingkat || 'Tanpa Kelas'} {item.jadwal_mengajar?.kelas?.jurusan || ''}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex-shrink-0">
                                                                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shadow-inner">
                                                                            P
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="mt-auto pt-4 border-t border-slate-100">
                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Materi Pembahasan</p>
                                                                    <div className="text-sm font-medium text-slate-700 bg-white/50 p-4 rounded-2xl border border-white shadow-sm leading-relaxed">
                                                                        {item.materi_pembahasan || <span className="italic text-slate-400">Tidak ada deskripsi materi</span>}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {filteredJurnal.length > pageSize && (
                                                        <div className="flex justify-center items-center gap-3 mt-8">
                                                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 bg-white/80 border border-slate-200 rounded-xl disabled:opacity-50 hover:bg-white shadow-sm transition-all">
                                                                <ChevronLeftIcon className="w-5 h-5 text-slate-600" />
                                                            </button>
                                                            <span className="px-4 py-2 bg-white/80 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 shadow-sm">
                                                                Halaman {page} dari {Math.ceil(filteredJurnal.length / pageSize)}
                                                            </span>
                                                            <button onClick={() => setPage(p => p + 1)} disabled={page * pageSize >= filteredJurnal.length} className="p-2 bg-white/80 border border-slate-200 rounded-xl disabled:opacity-50 hover:bg-white shadow-sm transition-all">
                                                                <ChevronRightIcon className="w-5 h-5 text-slate-600" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        </>
    );
}