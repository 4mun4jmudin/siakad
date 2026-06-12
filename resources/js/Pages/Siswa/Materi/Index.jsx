// resources/js/Pages/Siswa/Materi/Index.jsx

import React, { useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';
import SiswaLayout from '@/Layouts/SiswaLayout';
import {
    BarChart3,
    BookOpen,
    CheckCircle2,
    Clock3,
    Filter,
    GraduationCap,
    Layers,
    RefreshCw,
    Search,
    Sparkles,
    Target,
    TrendingUp,
    FileText,
    CalendarDays,
    CircleDashed,
    ClipboardList,
} from 'lucide-react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const clampStyle = (lines = 1) => ({
    display: '-webkit-box',
    WebkitLineClamp: lines,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    wordBreak: 'break-word',
});

function toNumber(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
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

function ProgressRing({ value = 0, size = 92, stroke = 8 }) {
    const normalized = Math.min(Math.max(Number(value) || 0, 0), 100);
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - normalized / 100);

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg className="-rotate-90" width={size} height={size}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.18)"
                    strokeWidth={stroke}
                />

                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="rgb(103,232,249)"
                    strokeWidth={stroke}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                />
            </svg>

            <div className="absolute text-center">
                <p className="text-xl font-black leading-none text-white">
                    {normalized}%
                </p>

                <p className="mt-0.5 text-[9px] font-black uppercase tracking-wide text-white/80">
                    Tuntas
                </p>
            </div>
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

function StatusBadge({ isTuntas }) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wide',
                isTuntas
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-slate-50 text-slate-600'
            )}
        >
            {isTuntas ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
                <Clock3 className="h-3.5 w-3.5" />
            )}

            {isTuntas ? 'Selesai Dibahas' : 'Belum Dibahas'}
        </span>
    );
}

function SubjectChip({ active, children, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'inline-flex min-h-10 items-center justify-center rounded-2xl border px-4 py-2 text-xs font-black transition-all duration-300',
                active
                    ? 'border-cyan-500 bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700'
            )}
        >
            {children}
        </button>
    );
}

function MateriCard({ item, index }) {
    return (
        <PremiumCard className="group overflow-hidden p-0" delay={index * 35}>
            <div className="relative p-5">
                <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-cyan-100/80 blur-2xl transition-all duration-500 group-hover:scale-125" />
                <div className="pointer-events-none absolute -bottom-16 left-8 h-36 w-36 rounded-full bg-sky-100/60 blur-2xl" />

                <div className="relative">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                            <div
                                className={cn(
                                    'flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl shadow-lg transition-transform duration-300 group-hover:scale-105',
                                    item.is_tuntas
                                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-200'
                                        : 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-cyan-200'
                                )}
                            >
                                {item.is_tuntas ? (
                                    <CheckCircle2 className="h-7 w-7" />
                                ) : (
                                    <BookOpen className="h-7 w-7" />
                                )}
                            </div>

                            <div className="min-w-0">
                                <div className="flex flex-wrap gap-2">
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-cyan-700">
                                        <Layers className="h-3.5 w-3.5" />
                                        {item.nama_mapel || 'Mapel'}
                                    </span>

                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600">
                                        <CalendarDays className="h-3.5 w-3.5" />
                                        Pertemuan {item.pertemuan_ke || '-'}
                                    </span>
                                </div>

                                <h3
                                    className="mt-3 text-lg font-black leading-tight text-slate-900 group-hover:text-cyan-700"
                                    style={clampStyle(2)}
                                    title={item.judul_materi}
                                >
                                    {item.judul_materi || 'Judul Materi'}
                                </h3>
                            </div>
                        </div>

                        <StatusBadge isTuntas={item.is_tuntas} />
                    </div>

                    <p className="mt-4 text-sm font-medium leading-relaxed text-slate-600" style={clampStyle(4)}>
                        {item.deskripsi || 'Tidak ada rincian deskripsi materi.'}
                    </p>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-3xl border border-slate-100 bg-slate-50/75 p-3">
                            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-slate-400">
                                <Target className="h-3.5 w-3.5" />
                                Status
                            </div>

                            <p className="mt-1 text-sm font-black text-slate-900">
                                {item.is_tuntas ? 'Tuntas' : 'Proses'}
                            </p>
                        </div>

                        <div className="rounded-3xl border border-slate-100 bg-slate-50/75 p-3">
                            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-slate-400">
                                <BookOpen className="h-3.5 w-3.5" />
                                Pertemuan
                            </div>

                            <p className="mt-1 text-sm font-black text-slate-900">
                                Ke-{item.pertemuan_ke || '-'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </PremiumCard>
    );
}

function TimelineItem({ item, index }) {
    return (
        <div className="relative pl-12">
            <div
                className={cn(
                    'absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-2xl border-4 shadow-sm',
                    item.is_tuntas
                        ? 'border-emerald-100 bg-emerald-500 text-white shadow-emerald-500/20'
                        : 'border-white bg-slate-100 text-slate-400'
                )}
            >
                {item.is_tuntas ? (
                    <CheckCircle2 className="h-5 w-5" />
                ) : (
                    <Clock3 className="h-5 w-5" />
                )}
            </div>

            <div
                className={cn(
                    'rounded-3xl border p-4 transition-all duration-300 hover:shadow-lg',
                    item.is_tuntas
                        ? 'border-emerald-100 bg-emerald-50/40 hover:shadow-emerald-500/5'
                        : 'border-slate-100 bg-white hover:shadow-slate-500/5'
                )}
                style={{ animationDelay: `${index * 35}ms` }}
            >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <div className="flex flex-wrap gap-2">
                            <span className="rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-cyan-700">
                                {item.nama_mapel || 'Mapel'}
                            </span>

                            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600">
                                Pertemuan Ke-{item.pertemuan_ke || '-'}
                            </span>
                        </div>

                        <h4 className="mt-3 text-base font-black text-slate-900" style={clampStyle(2)}>
                            {item.judul_materi || 'Judul Materi'}
                        </h4>
                    </div>

                    <StatusBadge isTuntas={item.is_tuntas} />
                </div>

                <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600" style={clampStyle(3)}>
                    {item.deskripsi || 'Tidak ada rincian deskripsi materi.'}
                </p>
            </div>
        </div>
    );
}

function EmptyState({ selectedSubject, resetFilter }) {
    return (
        <PremiumCard className="p-8 text-center" delay={120}>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 text-slate-300 shadow-sm">
                <BookOpen className="h-10 w-10" />
            </div>

            <h3 className="mt-5 text-lg font-black text-slate-800">
                Materi Tidak Ditemukan
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-relaxed text-slate-500">
                Tidak ada materi untuk filter saat ini
                {selectedSubject !== 'Semua' ? ` pada mata pelajaran "${selectedSubject}"` : ''}.
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
    materiList = [],
    stats = {
        total: 0,
        tuntas: 0,
        persentase: 0,
    },
    subjects = [],
}) {
    const [selectedSubject, setSelectedSubject] = useState('Semua');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Semua');

    const computedStats = useMemo(() => {
        const total = toNumber(stats?.total, materiList.length);
        const tuntas = toNumber(
            stats?.tuntas,
            materiList.filter((item) => item.is_tuntas).length
        );

        const belum = Math.max(total - tuntas, 0);
        const persentase = total > 0
            ? Math.round((tuntas / total) * 100)
            : toNumber(stats?.persentase, 0);

        const totalMapel = new Set(
            (materiList || [])
                .map((item) => item.nama_mapel)
                .filter(Boolean)
        ).size;

        return {
            total,
            tuntas,
            belum,
            persentase,
            totalMapel,
        };
    }, [materiList, stats]);

    const subjectOptions = useMemo(() => {
        const fromSubjects = Array.isArray(subjects) ? subjects : [];
        const fromMateri = (materiList || [])
            .map((item) => item.nama_mapel)
            .filter(Boolean);

        return Array.from(new Set([...fromSubjects, ...fromMateri]));
    }, [subjects, materiList]);

    const filteredMateri = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();

        return (materiList || []).filter((item) => {
            const matchSubject =
                selectedSubject === 'Semua' || item.nama_mapel === selectedSubject;

            const matchSearch =
                !keyword ||
                String(item.judul_materi || '').toLowerCase().includes(keyword) ||
                String(item.deskripsi || '').toLowerCase().includes(keyword) ||
                String(item.nama_mapel || '').toLowerCase().includes(keyword);

            const matchStatus =
                statusFilter === 'Semua' ||
                (statusFilter === 'Tuntas' && item.is_tuntas) ||
                (statusFilter === 'Belum' && !item.is_tuntas);

            return matchSubject && matchSearch && matchStatus;
        });
    }, [materiList, selectedSubject, searchTerm, statusFilter]);

    const resetFilter = () => {
        setSelectedSubject('Semua');
        setSearchTerm('');
        setStatusFilter('Semua');
    };

    return (
        <SiswaLayout
            user={auth?.user}
            header="Materi Pembelajaran"
            subtitle="Pantau rencana materi, progres belajar, dan pembahasan guru."
            className="bg-slate-50 font-sans"
        >
            <Head title="Materi Pembelajaran" />

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
                                    Learning Center
                                </div>

                                <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl">
                                    Materi Pembelajaran
                                </h1>

                                <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-white/80">
                                    Pelajari materi yang sudah dirancang guru, pantau progres pembahasan,
                                    dan cek rencana pembelajaran berdasarkan mata pelajaran.
                                </p>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white">
                                        <BookOpen className="h-3.5 w-3.5" />
                                        {computedStats.total} Materi
                                    </span>

                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        {computedStats.tuntas} Tuntas
                                    </span>

                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white">
                                        <Layers className="h-3.5 w-3.5" />
                                        {computedStats.totalMapel} Mapel
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 rounded-[2rem] border border-white/20 bg-white/15 p-4 backdrop-blur-md">
                                <ProgressRing value={computedStats.persentase} />

                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-white/80">
                                        Ketercapaian
                                    </p>

                                    <p className="mt-1 text-2xl font-black text-white">
                                        {computedStats.tuntas}
                                        <span className="text-sm font-semibold text-white/70">
                                            {' '}dari {computedStats.total}
                                        </span>
                                    </p>

                                    <p className="mt-1 text-xs font-semibold text-white/70">
                                        Progres materi yang sudah dibahas.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                        <MetricCard label="Total Materi" value={computedStats.total} icon={BookOpen} tone="cyan" />
                        <MetricCard label="Sudah Tuntas" value={computedStats.tuntas} icon={CheckCircle2} tone="emerald" />
                        <MetricCard label="Belum Dibahas" value={computedStats.belum} icon={Clock3} tone="amber" />
                        <MetricCard label="Mata Pelajaran" value={computedStats.totalMapel} icon={GraduationCap} tone="sky" />
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
                                        Filter Materi Belajar
                                    </h2>

                                    <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                                        Cari materi berdasarkan judul, deskripsi, atau mata pelajaran.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-700">
                                    <ClipboardList className="h-4 w-4" />
                                    Menampilkan {filteredMateri.length}
                                </span>

                                {(selectedSubject !== 'Semua' || searchTerm || statusFilter !== 'Semua') && (
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

                        <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-12">
                            <div className="xl:col-span-6">
                                <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
                                    Pencarian
                                </label>

                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                    <input
                                        type="search"
                                        value={searchTerm}
                                        onChange={(event) => setSearchTerm(event.target.value)}
                                        placeholder="Cari judul materi, mapel, atau deskripsi..."
                                        className="min-h-11 w-full rounded-2xl border border-slate-200 bg-white/90 py-2 pl-10 pr-3 text-sm font-semibold text-slate-700 shadow-sm outline-none placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
                                    />
                                </div>
                            </div>

                            <div className="xl:col-span-3">
                                <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
                                    Status
                                </label>

                                <select
                                    value={statusFilter}
                                    onChange={(event) => setStatusFilter(event.target.value)}
                                    className="min-h-11 w-full rounded-2xl border border-slate-200 bg-white/90 px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
                                >
                                    <option value="Semua">Semua Status</option>
                                    <option value="Tuntas">Selesai Dibahas</option>
                                    <option value="Belum">Belum Dibahas</option>
                                </select>
                            </div>

                            <div className="xl:col-span-3">
                                <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
                                    Mapel Aktif
                                </label>

                                <div className="flex min-h-11 items-center rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-black text-slate-700">
                                    {selectedSubject}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <SubjectChip
                                active={selectedSubject === 'Semua'}
                                onClick={() => setSelectedSubject('Semua')}
                            >
                                Semua Mata Pelajaran
                            </SubjectChip>

                            {subjectOptions.map((subject) => (
                                <SubjectChip
                                    key={subject}
                                    active={selectedSubject === subject}
                                    onClick={() => setSelectedSubject(subject)}
                                >
                                    {subject}
                                </SubjectChip>
                            ))}
                        </div>
                    </PremiumCard>

                    {/* Content */}
                    {filteredMateri.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                            {/* Cards */}
                            <section className="space-y-4 xl:col-span-7">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                                        <BookOpen className="h-5 w-5" />
                                    </div>

                                    <div>
                                        <h2 className="text-lg font-black text-slate-900">
                                            Daftar Materi
                                        </h2>

                                        <p className="text-xs font-semibold text-slate-500">
                                            Materi dalam bentuk card agar mudah dibaca siswa.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {filteredMateri.map((item, index) => (
                                        <MateriCard
                                            key={item.id_rencana || `${item.nama_mapel}-${item.pertemuan_ke}-${index}`}
                                            item={item}
                                            index={index}
                                        />
                                    ))}
                                </div>
                            </section>

                            {/* Timeline */}
                            <section className="xl:col-span-5">
                                <PremiumCard className="sticky top-24 overflow-hidden p-0" delay={160}>
                                    <div className="border-b border-slate-100 p-5">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                                                <BarChart3 className="h-5 w-5" />
                                            </div>

                                            <div>
                                                <h2 className="text-base font-black text-slate-900">
                                                    Timeline Pembelajaran
                                                </h2>

                                                <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-500">
                                                    Urutan materi berdasarkan rencana pertemuan.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="custom-scrollbar max-h-[720px] overflow-y-auto p-5">
                                        <div className="relative space-y-5 before:absolute before:left-5 before:top-3 before:h-[calc(100%-24px)] before:w-0.5 before:bg-slate-100">
                                            {filteredMateri.map((item, index) => (
                                                <TimelineItem
                                                    key={`timeline-${item.id_rencana || index}`}
                                                    item={item}
                                                    index={index}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </PremiumCard>
                            </section>
                        </div>
                    ) : (
                        <EmptyState selectedSubject={selectedSubject} resetFilter={resetFilter} />
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

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.35);
          border-radius: 999px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(14, 165, 233, 0.45);
        }
      `}</style>
        </SiswaLayout>
    );
}