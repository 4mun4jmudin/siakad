import React, { useState } from 'react';
import GuruLayout from '@/Layouts/GuruLayout';
import { Head, useForm, router } from '@inertiajs/react';
import {
    FileText,
    Filter,
    FileSpreadsheet,
    FileType,
    Sparkles,
    CalendarCheck,
    BookOpen,
    UserX,
    Users,
    AlertTriangle,
    ChevronRight,
    RefreshCw,
    CheckCircle2,
    XCircle,
    Info,
    Calendar
} from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';

const cn = (...classes) => classes.filter(Boolean).join(' ');

function PremiumCard({ children, className = '', delay = 0 }) {
    return (
        <div
            className={cn(
                'animate-soft-rise rounded-3xl border border-white/70 bg-white/85',
                'shadow-[0_20px_55px_-35px_rgba(15,23,42,0.45)] backdrop-blur-xl',
                'transition-all duration-300',
                className
            )}
            style={{ animationDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}

function StatMiniCard({ label, value, icon: Icon, subValue, highlight }) {
    return (
        <div className={cn("rounded-3xl border p-3 text-center backdrop-blur-md relative overflow-hidden", highlight ? "border-white/30 bg-white/20" : "border-white/15 bg-white/10")}>
            <Icon className="mx-auto h-5 w-5 text-white/90 relative z-10" />
            <p className="mt-2 text-2xl font-black leading-none text-white relative z-10">
                {value}
            </p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-white/70 relative z-10">
                {label}
            </p>
            {subValue && (
                <p className="mt-1 text-[10px] font-bold text-white/80 relative z-10 bg-black/20 rounded-full px-2 py-0.5 inline-block">
                    {subValue}
                </p>
            )}
            {highlight && <div className="absolute -right-4 -top-4 w-12 h-12 bg-white/10 rounded-full blur-md" />}
        </div>
    );
}

export default function LaporanIndex({ auth, filterOptions, filters, summary, absensiChart, pertemuan, jurnal, siswa_bermasalah }) {
    const { data, setData, get, processing } = useForm({
        start_date: filters.start_date || '',
        end_date: filters.end_date || '',
        kelas: filters.kelas || '',
        mapel: filters.mapel || '',
        jenis_laporan: filters.jenis_laporan || 'semua',
    });

    const [activeTab, setActiveTab] = useState('ringkasan');

    const submit = (e) => {
        e.preventDefault();
        get(route('guru.laporan.index'), {
            preserveState: true,
        });
    };

    const handleAction = (action) => {
        const queryParams = new URLSearchParams({
            tanggal_mulai: data.start_date,
            tanggal_selesai: data.end_date,
        });
        if (data.kelas) queryParams.append('id_kelas', data.kelas);
        if (data.mapel) queryParams.append('id_mapel', data.mapel);

        if (action === 'excel') {
            window.location.href = `${route('guru.laporan.exportExcel')}?${queryParams.toString()}`;
        }
        if (action === 'pdf') {
            window.open(`${route('guru.laporan.previewPdf')}?${queryParams.toString()}`, '_blank');
        }
    };

    const tabs = [
        { id: 'ringkasan', label: 'Ringkasan', icon: FileText },
        { id: 'absensi', label: 'Absensi Mapel', icon: Users },
        { id: 'jurnal', label: 'Jurnal Mengajar', icon: BookOpen },
        { id: 'siswa', label: 'Siswa Bermasalah', icon: AlertTriangle },
    ];

    return (
        <GuruLayout user={auth?.user} header="Laporan Dashboard">
            <Head title="Laporan Dashboard" />

            <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/40 to-sky-50/60 py-5 sm:py-6">
                <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-indigo-200/35 blur-3xl" />
                <div className="pointer-events-none absolute right-0 top-40 h-80 w-80 translate-x-24 rounded-full bg-sky-200/40 blur-3xl" />
                
                <div className="relative mx-auto max-w-7xl space-y-5 px-3 pb-12 sm:space-y-6 sm:px-6 lg:px-8">
                    
                    {/* Hero Section */}
                    <PremiumCard className="relative overflow-hidden p-0" delay={0}>
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 via-violet-700 to-sky-700" />
                        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/15 blur-2xl" />
                        <div className="absolute bottom-0 left-1/3 h-32 w-32 translate-y-10 rounded-full bg-indigo-200/20 blur-2xl" />

                        <div className="relative p-4 text-white sm:p-6 lg:p-7">
                            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                                <div className="min-w-0">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-indigo-50 backdrop-blur-md">
                                        <Sparkles className="h-3.5 w-3.5" />
                                        Dashboard Laporan
                                    </div>

                                    <h1 className="mt-3 text-xl font-black leading-tight tracking-tight sm:text-2xl lg:text-3xl">
                                        Rekapitulasi Mengajar
                                    </h1>

                                    <p className="mt-2 max-w-3xl text-sm font-medium leading-relaxed text-white/80">
                                        Pantau aktivitas mengajar, pengisian jurnal, dan tingkat kehadiran siswa secara komprehensif.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:min-w-[500px]">
                                    <StatMiniCard label="Total Pertemuan" value={summary.total_pertemuan} icon={CalendarCheck} />
                                    <StatMiniCard label="Jurnal Terisi" value={summary.jurnal_terisi} icon={BookOpen} subValue={`${summary.belum_jurnal} Belum`} />
                                    <StatMiniCard label="Rata Kehadiran" value={`${summary.rata_kehadiran}%`} icon={Users} highlight={summary.rata_kehadiran >= 90} />
                                    <StatMiniCard label="Alfa Mapel" value={summary.siswa_alfa_mapel_unik} icon={UserX} subValue={`${summary.siswa_alfa_mapel_total} Kasus`} highlight={summary.siswa_alfa_mapel_unik > 0} />
                                </div>
                            </div>
                        </div>
                    </PremiumCard>

                    {/* Filter Panel & Export Actions */}
                    <PremiumCard className="p-4 sm:p-5" delay={40}>
                        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end justify-between">
                            <form onSubmit={submit} className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1">Kelas</label>
                                    <select value={data.kelas} onChange={e => setData('kelas', e.target.value)} className="w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm focus:border-indigo-400 focus:ring-indigo-200">
                                        <option value="">Semua Kelas</option>
                                        {filterOptions.kelas && filterOptions.kelas.filter(Boolean).map(k => (
                                            <option key={k.id_kelas} value={k.id_kelas}>{k.tingkat} {k.jurusan}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1">Mata Pelajaran</label>
                                    <select value={data.mapel} onChange={e => setData('mapel', e.target.value)} className="w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm focus:border-indigo-400 focus:ring-indigo-200">
                                        <option value="">Semua Mapel</option>
                                        {filterOptions.mapel && filterOptions.mapel.filter(Boolean).map(m => (
                                            <option key={m.id_mapel} value={m.id_mapel}>{m.nama_mapel}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1">Tanggal Mulai</label>
                                    <input type="date" value={data.start_date} onChange={e => setData('start_date', e.target.value)} required className="w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm focus:border-indigo-400 focus:ring-indigo-200" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1">Tanggal Selesai</label>
                                    <input type="date" value={data.end_date} onChange={e => setData('end_date', e.target.value)} required className="w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm focus:border-indigo-400 focus:ring-indigo-200" />
                                </div>
                                <div>
                                    <button disabled={processing} className="w-full inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-70">
                                        <Filter className="h-4 w-4" />
                                        Terapkan
                                    </button>
                                </div>
                            </form>
                            <div className="flex shrink-0 gap-2 w-full lg:w-auto">
                                <button onClick={() => handleAction('pdf')} className="flex-1 lg:flex-none inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-100">
                                    <FileType className="h-4 w-4" />
                                    PDF
                                </button>
                                <button onClick={() => handleAction('excel')} className="flex-1 lg:flex-none inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100">
                                    <FileSpreadsheet className="h-4 w-4" />
                                    Excel
                                </button>
                            </div>
                        </div>
                    </PremiumCard>

                    {/* Tabs Navigation */}
                    <div className="flex space-x-1 overflow-x-auto p-1 rounded-2xl bg-white/60 backdrop-blur-sm border border-slate-200">
                        {tabs.map((tab) => {
                            const active = activeTab === tab.id;
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all flex-1 justify-center whitespace-nowrap",
                                        active ? "bg-white text-indigo-700 shadow-sm border border-slate-100" : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                                    )}
                                >
                                    <Icon className={cn("h-4 w-4", active ? "text-indigo-600" : "text-slate-400")} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Tab Content */}
                    <PremiumCard className="p-0 overflow-hidden" delay={80}>
                        <div className="p-5 sm:p-6 bg-white min-h-[400px]">
                            
                            {/* TAB: RINGKASAN */}
                            {activeTab === 'ringkasan' && (
                                <div className="space-y-6 animate-soft-rise">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                            <Calendar className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-black text-slate-800">Ringkasan Statistik</h2>
                                            <p className="text-sm font-medium text-slate-500">Statistik kehadiran dan jurnal berdasarkan filter.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50">
                                            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2"><BookOpen className="w-4 h-4 text-indigo-500"/> Kepatuhan Jurnal</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <div className="flex justify-between text-sm font-semibold mb-1">
                                                        <span className="text-slate-600">Terisi ({summary.jurnal_terisi})</span>
                                                        <span className="text-slate-900">{summary.total_pertemuan > 0 ? Math.round((summary.jurnal_terisi / summary.total_pertemuan) * 100) : 0}%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                                                        <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${summary.total_pertemuan > 0 ? (summary.jurnal_terisi / summary.total_pertemuan) * 100 : 0}%` }}></div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex justify-between text-sm font-semibold mb-1">
                                                        <span className="text-slate-600">Belum ({summary.belum_jurnal})</span>
                                                        <span className="text-red-600">{summary.total_pertemuan > 0 ? Math.round((summary.belum_jurnal / summary.total_pertemuan) * 100) : 0}%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                                                        <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${summary.total_pertemuan > 0 ? (summary.belum_jurnal / summary.total_pertemuan) * 100 : 0}%` }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50">
                                            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-emerald-500"/> Akumulasi Absensi</h3>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                <div className="bg-white p-3 rounded-xl border border-slate-100 text-center shadow-sm">
                                                    <div className="text-2xl font-black text-emerald-600">{absensiChart.hadir}</div>
                                                    <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">Hadir</div>
                                                </div>
                                                <div className="bg-white p-3 rounded-xl border border-slate-100 text-center shadow-sm">
                                                    <div className="text-2xl font-black text-sky-600">{absensiChart.sakit}</div>
                                                    <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">Sakit</div>
                                                </div>
                                                <div className="bg-white p-3 rounded-xl border border-slate-100 text-center shadow-sm">
                                                    <div className="text-2xl font-black text-amber-500">{absensiChart.izin}</div>
                                                    <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">Izin</div>
                                                </div>
                                                <div className="bg-white p-3 rounded-xl border border-slate-100 text-center shadow-sm">
                                                    <div className="text-2xl font-black text-red-600">{absensiChart.alfa}</div>
                                                    <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">Alfa</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB: ABSENSI MAPEL */}
                            {activeTab === 'absensi' && (
                                <div className="animate-soft-rise">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                                            <Users className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-black text-slate-800">Tabel Absensi Pertemuan</h2>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto rounded-2xl border border-slate-200">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-black border-b border-slate-200">
                                                <tr>
                                                    <th className="px-4 py-3">Tanggal</th>
                                                    <th className="px-4 py-3">Kelas & Mapel</th>
                                                    <th className="px-4 py-3">Jam</th>
                                                    <th className="px-2 py-3 text-center text-emerald-600">H</th>
                                                    <th className="px-2 py-3 text-center text-sky-600">S</th>
                                                    <th className="px-2 py-3 text-center text-amber-500">I</th>
                                                    <th className="px-2 py-3 text-center text-red-600">A</th>
                                                    <th className="px-4 py-3 text-center">Status Jurnal</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 bg-white">
                                                {pertemuan.length > 0 ? pertemuan.map((p, i) => (
                                                    <tr key={i} className="hover:bg-slate-50 transition">
                                                        <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{p.tanggal}<br/><span className="text-xs font-normal text-slate-500">{p.hari}</span></td>
                                                        <td className="px-4 py-3 font-bold text-slate-700">{p.kelas}<br/><span className="text-xs font-medium text-slate-500">{p.mapel}</span></td>
                                                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{p.jam}</td>
                                                        <td className="px-2 py-3 text-center font-bold text-emerald-600">{p.hadir}</td>
                                                        <td className="px-2 py-3 text-center font-bold text-sky-600">{p.sakit}</td>
                                                        <td className="px-2 py-3 text-center font-bold text-amber-500">{p.izin}</td>
                                                        <td className="px-2 py-3 text-center font-bold text-red-600">{p.alfa}</td>
                                                        <td className="px-4 py-3 text-center">
                                                            {p.status_jurnal === 'Kosong' ? (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-100"><XCircle className="w-3.5 h-3.5" /> Kosong</span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100"><CheckCircle2 className="w-3.5 h-3.5" /> {p.status_jurnal}</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr><td colSpan="8" className="px-4 py-8 text-center text-slate-500 font-medium">Tidak ada pertemuan di rentang tanggal ini.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* TAB: JURNAL */}
                            {activeTab === 'jurnal' && (
                                <div className="animate-soft-rise">
                                     <div className="flex items-center gap-3 mb-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                                            <BookOpen className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-black text-slate-800">Daftar Jurnal Mengajar</h2>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto rounded-2xl border border-slate-200">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-black border-b border-slate-200">
                                                <tr>
                                                    <th className="px-4 py-3">Tanggal</th>
                                                    <th className="px-4 py-3">Kelas & Mapel</th>
                                                    <th className="px-4 py-3">Status</th>
                                                    <th className="px-4 py-3">Materi / Keterangan</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 bg-white">
                                                {jurnal.length > 0 ? jurnal.map((j, i) => (
                                                    <tr key={i} className="hover:bg-slate-50 transition">
                                                        <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{j.tanggal}<br/><span className="text-xs font-normal text-slate-500">{j.hari}</span></td>
                                                        <td className="px-4 py-3 font-bold text-slate-700">{j.kelas}<br/><span className="text-xs font-medium text-slate-500">{j.mapel}</span></td>
                                                        <td className="px-4 py-3 font-bold text-indigo-600 whitespace-nowrap">{j.status}</td>
                                                        <td className="px-4 py-3 text-slate-600 max-w-md truncate">{j.materi || '-'}</td>
                                                    </tr>
                                                )) : (
                                                    <tr><td colSpan="4" className="px-4 py-8 text-center text-slate-500 font-medium">Belum ada jurnal yang diisi.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* TAB: SISWA BERMASALAH */}
                            {activeTab === 'siswa' && (
                                <div className="animate-soft-rise">
                                     <div className="flex items-center gap-3 mb-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                                            <AlertTriangle className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-black text-slate-800">Siswa dengan Absensi Buruk</h2>
                                            <p className="text-sm font-medium text-slate-500">Siswa yang sering tidak hadir di mapel Anda.</p>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto rounded-2xl border border-slate-200">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-black border-b border-slate-200">
                                                <tr>
                                                    <th className="px-4 py-3">No</th>
                                                    <th className="px-4 py-3">Nama Siswa</th>
                                                    <th className="px-4 py-3">Kelas</th>
                                                    <th className="px-2 py-3 text-center text-red-600">Alfa Total</th>
                                                    <th className="px-2 py-3 text-center text-red-700">Alfa Mapel</th>
                                                    <th className="px-2 py-3 text-center text-amber-500">Izin Mapel</th>
                                                    <th className="px-2 py-3 text-center text-sky-600">Sakit Mapel</th>
                                                    <th className="px-4 py-3 text-center bg-red-50">Total Kasus</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 bg-white">
                                                {siswa_bermasalah.length > 0 ? siswa_bermasalah.map((s, i) => (
                                                    <tr key={i} className="hover:bg-slate-50 transition">
                                                        <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                                                        <td className="px-4 py-3 font-bold text-slate-800">{s.nama_lengkap}<br/><span className="text-xs font-normal text-slate-500">{s.nis}</span></td>
                                                        <td className="px-4 py-3 font-semibold text-slate-600">{s.kelas}</td>
                                                        <td className="px-2 py-3 text-center font-bold text-red-500">{s.alfa}</td>
                                                        <td className="px-2 py-3 text-center font-black text-red-600 bg-red-50/30">{s.alfa_mapel}</td>
                                                        <td className="px-2 py-3 text-center font-bold text-amber-500">{s.izin_mapel}</td>
                                                        <td className="px-2 py-3 text-center font-bold text-sky-600">{s.sakit_mapel}</td>
                                                        <td className="px-4 py-3 text-center font-black text-red-700 bg-red-50">{s.total_masalah}</td>
                                                    </tr>
                                                )) : (
                                                    <tr><td colSpan="8" className="px-4 py-8 text-center text-slate-500 font-medium">Bagus! Tidak ada catatan siswa bermasalah.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                        </div>
                    </PremiumCard>

                </div>
            </div>

            <style>{`
                @keyframes softRise {
                    from { opacity: 0; transform: translateY(14px) scale(0.985); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-soft-rise {
                    animation: softRise 520ms cubic-bezier(0.22, 1, 0.36, 1) both;
                }
            `}</style>
        </GuruLayout>
    );
}