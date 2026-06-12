// resources/js/Pages/Guru/WaliKelas/Show.jsx

import React, { useMemo, useState } from 'react';
import GuruLayout from '@/Layouts/GuruLayout';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Award,
    BookOpen,
    ChevronRight,
    ClipboardList,
    FileSpreadsheet,
    GraduationCap,
    Layers,
    RefreshCw,
    Search,
    ShieldCheck,
    Sparkles,
    Target,
    UserRoundCheck,
    Users,
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

function getNamaKelas(kelas = {}) {
    if (kelas.nama_kelas) return kelas.nama_kelas;

    return [kelas.tingkat, kelas.jurusan]
        .filter(Boolean)
        .join(' ') || 'Nama Kelas';
}

function toNumber(value) {
    if (typeof value === 'number') return value;
    if (value === null || value === undefined || value === '') return NaN;

    const parsed = parseFloat(String(value).replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : NaN;
}

function PremiumCard({ children, className = '', delay = 0 }) {
    return (
        <div
            className={cn(
                'animate-soft-rise rounded-3xl border border-white/70 bg-white/85',
                'shadow-[0_20px_55px_-35px_rgba(15,23,42,0.45)] backdrop-blur-xl',
                'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_28px_70px_-35px_rgba(15,23,42,0.55)]',
                className
            )}
            style={{ animationDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}

function StatMiniCard({ label, value, icon: Icon }) {
    return (
        <div className="rounded-3xl border border-white/15 bg-white/10 p-3 text-center backdrop-blur-md">
            <Icon className="mx-auto h-5 w-5 text-white/90" />

            <p className="mt-2 text-2xl font-black leading-none text-white">
                {value}
            </p>

            <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-white/70">
                {label}
            </p>
        </div>
    );
}

function InfoBadge({ children, icon: Icon, tone = 'indigo' }) {
    const tones = {
        indigo: 'border-indigo-200 bg-indigo-50 text-indigo-700',
        sky: 'border-sky-200 bg-sky-50 text-sky-700',
        violet: 'border-violet-200 bg-violet-50 text-violet-700',
        emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        amber: 'border-amber-200 bg-amber-50 text-amber-700',
        slate: 'border-slate-200 bg-slate-50 text-slate-600',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide',
                tones[tone] || tones.indigo
            )}
        >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {children}
        </span>
    );
}

function EmptyState({ resetSearch }) {
    return (
        <PremiumCard className="p-8 text-center" delay={120}>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 text-slate-300 shadow-sm">
                <BookOpen className="h-10 w-10" />
            </div>

            <h3 className="mt-5 text-lg font-black text-slate-800">
                Mata Pelajaran Tidak Ditemukan
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-relaxed text-slate-500">
                Coba gunakan kata kunci lain untuk mencari mata pelajaran atau guru pengampu.
            </p>

            <button
                type="button"
                onClick={resetSearch}
                className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
            >
                <RefreshCw className="h-4 w-4" />
                Reset Pencarian
            </button>
        </PremiumCard>
    );
}

function MapelCard({ mapel, kelas, index }) {
    const kkm = mapel.kkm ?? 75;

    return (
        <PremiumCard className="group relative overflow-hidden p-0" delay={index * 45}>
            <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-indigo-100/80 blur-2xl transition-all duration-500 group-hover:scale-125" />
            <div className="pointer-events-none absolute -bottom-16 left-8 h-36 w-36 rounded-full bg-sky-100/60 blur-2xl" />

            <div className="relative flex h-full flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200 transition-transform duration-300 group-hover:scale-105">
                            <BookOpen className="h-7 w-7" />
                        </div>

                        <div className="min-w-0">
                            <h3
                                className="text-lg font-black leading-tight text-slate-900 group-hover:text-indigo-700"
                                style={clampStyle(2)}
                                title={mapel.nama_mapel}
                            >
                                {mapel.nama_mapel || 'Mata Pelajaran'}
                            </h3>

                            <p className="mt-1 text-sm font-bold text-slate-500" style={clampStyle(1)}>
                                {mapel.guru_pengampu || 'Guru belum tersedia'}
                            </p>
                        </div>
                    </div>

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition group-hover:translate-x-1 group-hover:bg-indigo-100">
                        <ChevronRight className="h-5 w-5" />
                    </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-3xl border border-slate-100 bg-slate-50/75 p-3">
                        <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-slate-400">
                            <Target className="h-3.5 w-3.5" />
                            KKM
                        </div>

                        <p className="mt-1 text-2xl font-black text-slate-900">
                            {kkm}
                        </p>
                    </div>

                    <div className="rounded-3xl border border-slate-100 bg-slate-50/75 p-3">
                        <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-slate-400">
                            <Layers className="h-3.5 w-3.5" />
                            Kategori
                        </div>

                        <p className="mt-1 text-sm font-black text-slate-900" style={clampStyle(1)}>
                            {mapel.kategori || '-'}
                        </p>
                    </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                    <InfoBadge icon={UserRoundCheck} tone="sky">
                        Guru Pengampu
                    </InfoBadge>

                    {mapel.kategori && (
                        <InfoBadge icon={Layers} tone="violet">
                            {mapel.kategori}
                        </InfoBadge>
                    )}

                    <InfoBadge icon={ShieldCheck} tone="emerald">
                        Aktif
                    </InfoBadge>
                </div>

                <div className="mt-auto pt-5">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <Link
                            href={safeRoute('guru.penilaian.showKelas', [kelas.id_kelas, mapel.id_mapel])}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-indigo-200 transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105"
                        >
                            <ClipboardList className="h-4 w-4" />
                            Kelola Nilai
                        </Link>

                        <Link
                            href={safeRoute('guru.penilaian.rekapKelas', [kelas.id_kelas, mapel.id_mapel])}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                            title="Lihat Rekap Kelas"
                        >
                            <FileSpreadsheet className="h-4 w-4" />
                            Rekap
                        </Link>
                    </div>
                </div>
            </div>
        </PremiumCard>
    );
}

export default function Show({
    auth,
    kelas = {},
    mapelList = [],
}) {
    const [searchTerm, setSearchTerm] = useState('');

    const namaKelas = getNamaKelas(kelas);

    const filteredMapel = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();

        if (!keyword) return mapelList || [];

        return (mapelList || []).filter((mapel) => {
            const namaMapel = String(mapel.nama_mapel || '').toLowerCase();
            const guruPengampu = String(mapel.guru_pengampu || '').toLowerCase();
            const kategori = String(mapel.kategori || '').toLowerCase();

            return (
                namaMapel.includes(keyword) ||
                guruPengampu.includes(keyword) ||
                kategori.includes(keyword)
            );
        });
    }, [mapelList, searchTerm]);

    const stats = useMemo(() => {
        const totalMapel = (mapelList || []).length;
        const totalSiswa = kelas.siswa_count || kelas.jumlah_siswa || 0;

        const kkmValues = (mapelList || [])
            .map((mapel) => toNumber(mapel.kkm))
            .filter((value) => Number.isFinite(value));

        const rataKkm = kkmValues.length
            ? Math.round(kkmValues.reduce((sum, value) => sum + value, 0) / kkmValues.length)
            : '-';

        const kategoriCount = new Set(
            (mapelList || [])
                .map((mapel) => mapel.kategori)
                .filter(Boolean)
        ).size;

        return {
            totalMapel,
            totalSiswa,
            rataKkm,
            kategoriCount,
        };
    }, [kelas, mapelList]);

    const resetSearch = () => {
        setSearchTerm('');
    };

    return (
        <GuruLayout user={auth?.user} header={`Detail Kelas Perwalian - ${namaKelas}`}>
            <Head title={`Kelas ${namaKelas}`} />

            <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/40 to-sky-50/60 py-5 sm:py-6">
                <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-indigo-200/35 blur-3xl" />
                <div className="pointer-events-none absolute right-0 top-40 h-80 w-80 translate-x-24 rounded-full bg-sky-200/40 blur-3xl" />
                <div className="pointer-events-none absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-violet-200/25 blur-3xl" />

                <div className="relative mx-auto max-w-7xl space-y-5 px-3 pb-12 sm:space-y-6 sm:px-6 lg:px-8">
                    {/* Hero */}
                    <PremiumCard className="relative overflow-hidden p-0" delay={0}>
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 via-violet-700 to-sky-700" />
                        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/15 blur-2xl" />
                        <div className="absolute bottom-0 left-1/3 h-32 w-32 translate-y-10 rounded-full bg-indigo-200/20 blur-2xl" />

                        <div className="relative p-4 text-white sm:p-6 lg:p-7">
                            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                                <div className="min-w-0">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-indigo-50 backdrop-blur-md">
                                        <Sparkles className="h-3.5 w-3.5" />
                                        Detail Kelas Perwalian
                                    </div>

                                    <h1 className="mt-3 text-xl font-black leading-tight tracking-tight sm:text-2xl lg:text-3xl">
                                        Daftar Mata Pelajaran
                                    </h1>

                                    <p className="mt-2 max-w-3xl text-sm font-medium leading-relaxed text-white/80">
                                        Pilih mata pelajaran untuk memantau dan mengelola nilai seluruh siswa di kelas{' '}
                                        <span className="font-black text-indigo-100">{namaKelas}</span>.
                                    </p>

                                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-white/90">
                                        <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                                            {namaKelas}
                                        </span>

                                        <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                                            {stats.totalSiswa} Siswa
                                        </span>

                                        <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                                            {stats.totalMapel} Mapel
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:min-w-[520px]">
                                    <StatMiniCard label="Siswa" value={stats.totalSiswa} icon={Users} />
                                    <StatMiniCard label="Mapel" value={stats.totalMapel} icon={BookOpen} />
                                    <StatMiniCard label="Rata KKM" value={stats.rataKkm} icon={Award} />
                                    <StatMiniCard label="Kategori" value={stats.kategoriCount} icon={Layers} />
                                </div>
                            </div>
                        </div>
                    </PremiumCard>

                    {/* Breadcrumb + Back */}
                    <PremiumCard className="p-3 sm:p-4" delay={60}>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-500">
                                <Link
                                    href={safeRoute('guru.walikelas.index')}
                                    className="transition hover:text-indigo-700"
                                >
                                    Kelas Perwalian
                                </Link>

                                <ChevronRight className="h-4 w-4 text-slate-300" />

                                <span className="text-slate-800">
                                    {namaKelas}
                                </span>
                            </div>

                            <Link
                                href={safeRoute('guru.walikelas.index')}
                                className="inline-flex min-h-10 w-fit items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Kembali
                            </Link>
                        </div>
                    </PremiumCard>

                    {/* Search */}
                    <PremiumCard className="p-4 sm:p-5" delay={90}>
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-start gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                                    <Search className="h-5 w-5" />
                                </div>

                                <div>
                                    <h2 className="text-base font-black text-slate-900">
                                        Cari Mata Pelajaran
                                    </h2>

                                    <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                                        Cari berdasarkan nama mata pelajaran, guru pengampu, atau kategori.
                                    </p>
                                </div>
                            </div>

                            <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
                                <div className="relative w-full lg:w-96">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                    <input
                                        type="search"
                                        placeholder="Cari mata pelajaran atau guru..."
                                        value={searchTerm}
                                        onChange={(event) => setSearchTerm(event.target.value)}
                                        className="min-h-11 w-full rounded-2xl border border-slate-200 bg-white/90 py-2 pl-10 pr-3 text-sm font-semibold text-slate-700 shadow-sm outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={resetSearch}
                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-600 transition hover:bg-slate-50"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Reset
                                </button>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <InfoBadge icon={BookOpen} tone="indigo">
                                Menampilkan {filteredMapel.length} Mapel
                            </InfoBadge>

                            <InfoBadge icon={Users} tone="sky">
                                {stats.totalSiswa} Siswa
                            </InfoBadge>

                            <InfoBadge icon={Target} tone="emerald">
                                Rata KKM {stats.rataKkm}
                            </InfoBadge>
                        </div>
                    </PremiumCard>

                    {/* Content */}
                    {filteredMapel.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {filteredMapel.map((mapel, index) => (
                                <MapelCard
                                    key={mapel.id_mapel}
                                    mapel={mapel}
                                    kelas={kelas}
                                    index={index}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyState resetSearch={resetSearch} />
                    )}
                </div>
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
        </GuruLayout>
    );
}