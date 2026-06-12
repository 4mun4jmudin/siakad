// resources/js/Pages/Siswa/Tugas/Index.jsx

import React, { useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import SiswaLayout from '@/Layouts/SiswaLayout';
import Pagination from '@/Components/Pagination';
import {
    AlertTriangle,
    ArrowRight,
    BarChart3,
    CheckCircle2,
    ClipboardList,
    Clock3,
    FileCheck2,
    FileText,
    Filter,
    GraduationCap,
    Loader2,
    RefreshCw,
    Search,
    Sparkles,
    Timer,
    UserRound,
    X,
} from 'lucide-react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const clampStyle = (lines = 1) => ({
    display: '-webkit-box',
    WebkitLineClamp: lines,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    wordBreak: 'break-word',
});

function safeRoute(name, params = {}, fallback = '#') {
    try {
        if (typeof route === 'function') return route(name, params);
        if (typeof window !== 'undefined' && typeof window.route === 'function') {
            return window.route(name, params);
        }
        return fallback;
    } catch {
        return fallback;
    }
}

function formatDateTime(value) {
    if (!value) return '-';

    try {
        return new Date(value).toLocaleString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return value;
    }
}

function isPastDeadline(value) {
    if (!value) return false;

    const deadline = new Date(value);

    if (Number.isNaN(deadline.getTime())) return false;

    return deadline < new Date();
}

function getPengumpulan(item = {}) {
    const list = item?.pengumpulan_tugas;

    if (Array.isArray(list)) return list[0] || null;

    return item?.pengumpulan || null;
}

function getMapelName(item = {}) {
    return (
        item?.jadwal_mengajar?.mata_pelajaran?.nama_mapel ||
        item?.mata_pelajaran?.nama_mapel ||
        item?.nama_mapel ||
        'Mata Pelajaran'
    );
}

function getGuruName(item = {}) {
    return (
        item?.jadwal_mengajar?.guru?.nama_lengkap ||
        item?.guru?.nama_lengkap ||
        item?.nama_guru ||
        'Guru'
    );
}

function getStatus(item = {}) {
    const pengumpulan = getPengumpulan(item);
    const terlambat = isPastDeadline(item?.tenggat_waktu);

    if (pengumpulan) {
        if (pengumpulan.status_pengumpulan === 'Dinilai') {
            return {
                key: 'Dinilai',
                label: `Dinilai${pengumpulan.nilai !== null && pengumpulan.nilai !== undefined ? `: ${pengumpulan.nilai}` : ''}`,
                shortLabel: 'Dinilai',
                value: pengumpulan.nilai ?? '-',
                tone: 'emerald',
                icon: CheckCircle2,
            };
        }

        return {
            key: 'Menunggu',
            label: 'Menunggu Penilaian',
            shortLabel: 'Menunggu',
            value: '-',
            tone: 'amber',
            icon: Clock3,
        };
    }

    if (terlambat) {
        return {
            key: 'Terlambat',
            label: 'Terlambat / Ditutup',
            shortLabel: 'Terlambat',
            value: '-',
            tone: 'rose',
            icon: AlertTriangle,
        };
    }

    return {
        key: 'Belum',
        label: 'Belum Mengumpulkan',
        shortLabel: 'Belum',
        value: '-',
        tone: 'sky',
        icon: FileText,
    };
}

function PremiumCard({ children, className = '', delay = 0 }) {
    return (
        <div
            className={cn(
                'animate-soft-rise rounded-[2rem] border border-white/70 bg-white/90',
                'shadow-[0_22px_70px_-42px_rgba(15,23,42,0.7)] backdrop-blur-xl',
                'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_32px_80px_-44px_rgba(15,23,42,0.8)]',
                className
            )}
            style={{ animationDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}

function HeroStat({ label, value, icon: Icon, tone = 'cyan' }) {
    const iconTones = {
        cyan: 'text-cyan-300',
        emerald: 'text-emerald-300',
        amber: 'text-amber-300',
        rose: 'text-rose-300',
        sky: 'text-sky-300',
    };

    return (
        <div className="rounded-3xl border border-white/20 bg-white/15 p-3 text-center backdrop-blur-md">
            <Icon className={cn('mx-auto h-5 w-5', iconTones[tone] || iconTones.cyan)} />

            <p className="mt-2 text-2xl font-black leading-none text-white">
                {value}
            </p>

            <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-white/80">
                {label}
            </p>
        </div>
    );
}

function MetricCard({ label, value, icon: Icon, tone = 'cyan', hint = null }) {
    const tones = {
        cyan: 'bg-cyan-50 text-cyan-700 border-cyan-100',
        sky: 'bg-sky-50 text-sky-700 border-sky-100',
        emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        amber: 'bg-amber-50 text-amber-700 border-amber-100',
        rose: 'bg-rose-50 text-rose-700 border-rose-100',
        slate: 'bg-slate-50 text-slate-700 border-slate-100',
    };

    return (
        <PremiumCard className="p-4" delay={80}>
            <div className="flex items-start gap-3">
                <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border', tones[tone] || tones.cyan)}>
                    <Icon className="h-6 w-6" />
                </div>

                <div className="min-w-0">
                    <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                        {label}
                    </p>

                    <p className="mt-1 truncate text-lg font-black text-slate-900">
                        {value}
                    </p>

                    {hint && (
                        <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-500">
                            {hint}
                        </p>
                    )}
                </div>
            </div>
        </PremiumCard>
    );
}

function StatusBadge({ status }) {
    const tones = {
        emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        amber: 'border-amber-200 bg-amber-50 text-amber-700',
        rose: 'border-rose-200 bg-rose-50 text-rose-700',
        sky: 'border-sky-200 bg-sky-50 text-sky-700',
        slate: 'border-slate-200 bg-slate-50 text-slate-600',
    };

    const dotTones = {
        emerald: 'bg-emerald-500',
        amber: 'bg-amber-500',
        rose: 'bg-rose-500',
        sky: 'bg-sky-500',
        slate: 'bg-slate-400',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wide',
                tones[status.tone] || tones.slate
            )}
        >
            <span className={cn('h-2 w-2 rounded-full', dotTones[status.tone] || dotTones.slate)} />
            {status.label}
        </span>
    );
}

function StatusChip({ active, children, onClick, icon: Icon }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl border px-4 py-2 text-xs font-black transition-all duration-300',
                active
                    ? 'border-cyan-500 bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700'
            )}
        >
            {Icon && <Icon className="h-4 w-4" />}
            {children}
        </button>
    );
}

function TugasCard({ item, index }) {
    const status = getStatus(item);
    const StatusIcon = status.icon;
    const pengumpulan = getPengumpulan(item);
    const terlambat = isPastDeadline(item?.tenggat_waktu);
    const mapelName = getMapelName(item);
    const guruName = getGuruName(item);

    return (
        <Link
            href={safeRoute('siswa.tugas.show', item.id_tugas)}
            className="group block"
        >
            <PremiumCard className="relative h-full overflow-hidden p-0" delay={index * 35}>
                <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-cyan-100/80 blur-2xl transition-all duration-500 group-hover:scale-125" />
                <div className="pointer-events-none absolute -bottom-16 left-8 h-36 w-36 rounded-full bg-sky-100/60 blur-2xl" />

                <div
                    className={cn(
                        'h-1.5 w-full',
                        status.tone === 'emerald'
                            ? 'bg-emerald-500'
                            : status.tone === 'amber'
                                ? 'bg-amber-500'
                                : status.tone === 'rose'
                                    ? 'bg-rose-500'
                                    : 'bg-cyan-500'
                    )}
                />

                <div className="relative flex h-full flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                            <div
                                className={cn(
                                    'flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl text-white shadow-lg transition-transform duration-300 group-hover:scale-105',
                                    status.tone === 'emerald'
                                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-200'
                                        : status.tone === 'amber'
                                            ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-200'
                                            : status.tone === 'rose'
                                                ? 'bg-gradient-to-br from-rose-500 to-pink-600 shadow-rose-200'
                                                : 'bg-gradient-to-br from-cyan-500 to-blue-600 shadow-cyan-200'
                                )}
                            >
                                <StatusIcon className="h-7 w-7" />
                            </div>

                            <div className="min-w-0">
                                <StatusBadge status={status} />

                                <h3
                                    className="mt-3 text-lg font-black leading-tight text-slate-900 transition group-hover:text-cyan-700"
                                    style={clampStyle(2)}
                                    title={item.judul_tugas}
                                >
                                    {item.judul_tugas || 'Judul Tugas'}
                                </h3>
                            </div>
                        </div>

                        {pengumpulan?.status_pengumpulan === 'Dinilai' && (
                            <div className="shrink-0 rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-center">
                                <p className="text-[10px] font-black uppercase tracking-wide text-emerald-500">
                                    Nilai
                                </p>
                                <p className="text-lg font-black leading-none text-emerald-700">
                                    {pengumpulan.nilai ?? '-'}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 space-y-2">
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-cyan-700">
                            <GraduationCap className="h-3.5 w-3.5" />
                            {mapelName}
                        </div>

                        <p className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                            <UserRound className="h-4 w-4 text-slate-400" />
                            Guru: <span className="text-slate-700">{guruName}</span>
                        </p>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-3xl border border-slate-100 bg-slate-50/75 p-3">
                            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-slate-400">
                                <Timer className="h-3.5 w-3.5" />
                                Tenggat
                            </div>

                            <p
                                className={cn(
                                    'mt-1 text-sm font-black',
                                    terlambat && !pengumpulan ? 'text-rose-600' : 'text-slate-900'
                                )}
                            >
                                {formatDateTime(item.tenggat_waktu)}
                            </p>
                        </div>

                        <div className="rounded-3xl border border-slate-100 bg-slate-50/75 p-3">
                            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-slate-400">
                                <FileCheck2 className="h-3.5 w-3.5" />
                                Status
                            </div>

                            <p className="mt-1 text-sm font-black text-slate-900">
                                {status.shortLabel}
                            </p>
                        </div>
                    </div>

                    <div className="mt-auto pt-5">
                        <div className="flex min-h-11 items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-2 text-sm font-black text-slate-700 transition group-hover:border-cyan-200 group-hover:bg-cyan-50 group-hover:text-cyan-700">
                            <span>Buka Detail Tugas</span>
                            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                        </div>
                    </div>
                </div>
            </PremiumCard>
        </Link>
    );
}

function EmptyState({ resetFilter }) {
    return (
        <PremiumCard className="p-8 text-center" delay={120}>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 text-slate-300 shadow-sm">
                <ClipboardList className="h-10 w-10" />
            </div>

            <h3 className="mt-5 text-lg font-black text-slate-800">
                Tidak ada tugas
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-relaxed text-slate-500">
                Belum ada tugas yang sesuai dengan filter saat ini.
            </p>

            <button
                type="button"
                onClick={resetFilter}
                className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
            >
                <RefreshCw className="h-4 w-4" />
                Reset Filter
            </button>
        </PremiumCard>
    );
}

export default function Index({
    auth,
    tugas = {
        data: [],
        links: [],
    },
    filters = {},
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState('Semua');
    const [isSearching, setIsSearching] = useState(false);

    const tugasRows = Array.isArray(tugas?.data) ? tugas.data : [];

    const stats = useMemo(() => {
        const total = tugas?.total ?? tugasRows.length;

        let belum = 0;
        let menunggu = 0;
        let dinilai = 0;
        let terlambat = 0;

        tugasRows.forEach((item) => {
            const status = getStatus(item);

            if (status.key === 'Belum') belum += 1;
            if (status.key === 'Menunggu') menunggu += 1;
            if (status.key === 'Dinilai') dinilai += 1;
            if (status.key === 'Terlambat') terlambat += 1;
        });

        return {
            total,
            tampil: tugasRows.length,
            belum,
            menunggu,
            dinilai,
            terlambat,
        };
    }, [tugas, tugasRows]);

    const filteredTugas = useMemo(() => {
        if (statusFilter === 'Semua') return tugasRows;

        return tugasRows.filter((item) => getStatus(item).key === statusFilter);
    }, [tugasRows, statusFilter]);

    const handleSearch = (event) => {
        event.preventDefault();

        setIsSearching(true);

        router.get(
            safeRoute('siswa.tugas.index'),
            {
                search: search || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onFinish: () => setIsSearching(false),
            }
        );
    };

    const resetFilter = () => {
        setSearch('');
        setStatusFilter('Semua');

        router.get(
            safeRoute('siswa.tugas.index'),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    return (
        <SiswaLayout
            user={auth?.user}
            header="Tugas Saya"
            subtitle="Lihat, kerjakan, dan pantau status pengumpulan tugas."
            className="bg-slate-50 font-sans"
        >
            <Head title="Tugas Saya" />

            <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-cyan-50/50 to-sky-50/70 pb-28 lg:pb-10">
                <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-cyan-200/45 blur-3xl" />
                <div className="pointer-events-none absolute right-0 top-44 h-80 w-80 translate-x-24 rounded-full bg-sky-200/50 blur-3xl" />
                <div className="pointer-events-none absolute bottom-24 left-1/3 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />

                <main className="relative z-10 mx-auto max-w-7xl space-y-6 px-3 py-5 sm:px-6 lg:px-8 lg:py-6">
                    {/* Hero */}
                    <section className="relative overflow-hidden rounded-[2.25rem] bg-gradient-to-r from-slate-950 via-blue-950 to-cyan-900 p-4 text-white shadow-[0_28px_90px_-55px_rgba(15,23,42,0.9)] sm:p-6 lg:p-7">
                        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl" />
                        <div className="pointer-events-none absolute bottom-0 left-1/3 h-48 w-48 translate-y-12 rounded-full bg-sky-400/10 blur-3xl" />

                        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                            <div className="min-w-0">
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white backdrop-blur-md">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    Assignment Center
                                </div>

                                <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl">
                                    Tugas Saya
                                </h1>

                                <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-white/80">
                                    Pantau tugas yang diberikan guru, cek tenggat waktu, status pengumpulan,
                                    dan nilai yang sudah diberikan.
                                </p>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white">
                                        <ClipboardList className="h-3.5 w-3.5" />
                                        {stats.total} Tugas
                                    </span>

                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        {stats.dinilai} Dinilai
                                    </span>

                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white">
                                        <Clock3 className="h-3.5 w-3.5" />
                                        {stats.menunggu} Menunggu
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:min-w-[520px]">
                                <HeroStat label="Total" value={stats.total} icon={ClipboardList} tone="cyan" />
                                <HeroStat label="Belum" value={stats.belum} icon={FileText} tone="sky" />
                                <HeroStat label="Menunggu" value={stats.menunggu} icon={Clock3} tone="amber" />
                                <HeroStat label="Dinilai" value={stats.dinilai} icon={CheckCircle2} tone="emerald" />
                            </div>
                        </div>
                    </section>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                        <MetricCard label="Total Tugas" value={stats.total} icon={ClipboardList} tone="cyan" />
                        <MetricCard label="Belum Kumpul" value={stats.belum} icon={FileText} tone="sky" />
                        <MetricCard label="Menunggu Nilai" value={stats.menunggu} icon={Clock3} tone="amber" />
                        <MetricCard label="Sudah Dinilai" value={stats.dinilai} icon={CheckCircle2} tone="emerald" />
                    </div>

                    {/* Filter */}
                    <PremiumCard className="p-4 sm:p-5" delay={100}>
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                            <div className="flex items-start gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                                    <Filter className="h-5 w-5" />
                                </div>

                                <div>
                                    <h2 className="text-base font-black text-slate-900">
                                        Filter Tugas
                                    </h2>

                                    <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                                        Cari tugas berdasarkan judul, lalu filter berdasarkan status pengerjaan.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-700">
                                    <BarChart3 className="h-4 w-4" />
                                    Menampilkan {filteredTugas.length}
                                </span>

                                {(search || statusFilter !== 'Semua') && (
                                    <button
                                        type="button"
                                        onClick={resetFilter}
                                        className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-black text-slate-600 transition hover:bg-slate-50"
                                    >
                                        <RefreshCw className="h-3.5 w-3.5" />
                                        Reset
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-12">
                            <form onSubmit={handleSearch} className="lg:col-span-7">
                                <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
                                    Pencarian
                                </label>

                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                    <input
                                        type="search"
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        placeholder="Cari judul tugas..."
                                        className="min-h-11 w-full rounded-2xl border border-slate-200 bg-white/90 py-2 pl-10 pr-12 text-sm font-semibold text-slate-700 shadow-sm outline-none placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
                                    />

                                    <button
                                        type="submit"
                                        disabled={isSearching}
                                        className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl bg-cyan-600 text-white transition hover:bg-cyan-700 disabled:opacity-70"
                                    >
                                        {isSearching ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Search className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </form>

                            <div className="lg:col-span-5">
                                <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
                                    Status Aktif
                                </label>

                                <div className="flex min-h-11 items-center rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-black text-slate-700">
                                    {statusFilter}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <StatusChip active={statusFilter === 'Semua'} onClick={() => setStatusFilter('Semua')} icon={ClipboardList}>
                                Semua
                            </StatusChip>

                            <StatusChip active={statusFilter === 'Belum'} onClick={() => setStatusFilter('Belum')} icon={FileText}>
                                Belum Mengumpulkan
                            </StatusChip>

                            <StatusChip active={statusFilter === 'Menunggu'} onClick={() => setStatusFilter('Menunggu')} icon={Clock3}>
                                Menunggu Penilaian
                            </StatusChip>

                            <StatusChip active={statusFilter === 'Dinilai'} onClick={() => setStatusFilter('Dinilai')} icon={CheckCircle2}>
                                Dinilai
                            </StatusChip>

                            <StatusChip active={statusFilter === 'Terlambat'} onClick={() => setStatusFilter('Terlambat')} icon={AlertTriangle}>
                                Terlambat
                            </StatusChip>
                        </div>
                    </PremiumCard>

                    {/* Content */}
                    {filteredTugas.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {filteredTugas.map((item, index) => (
                                <TugasCard
                                    key={item.id_tugas || index}
                                    item={item}
                                    index={index}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyState resetFilter={resetFilter} />
                    )}

                    {tugas?.links && tugasRows.length > 0 && statusFilter === 'Semua' && (
                        <PremiumCard className="p-4" delay={160}>
                            <Pagination links={tugas.links} />
                        </PremiumCard>
                    )}

                    {tugas?.links && tugasRows.length > 0 && statusFilter !== 'Semua' && (
                        <div className="rounded-3xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
                            Pagination disembunyikan saat filter status lokal aktif. Klik <b>Semua</b> untuk melihat pagination penuh.
                        </div>
                    )}
                </main>
            </div>

            <style>{`
        @keyframes softRise {
          from {
            opacity: 0;
            transform: translateY(14px) scale(0.985);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-soft-rise {
          animation: softRise 520ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
      `}</style>
        </SiswaLayout>
    );
}