// resources/js/Pages/Guru/Siswa/Index.jsx

import React, { useEffect, useMemo, useRef, useState } from 'react';
import GuruLayout from '@/Layouts/GuruLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Users,
    Search,
    X,
    Sparkles,
    School,
    GraduationCap,
    UserRound,
    IdCard,
    BadgeCheck,
    Eye,
    Filter,
    RefreshCw,
    Loader2,
    ChevronRight,
    ShieldCheck,
    Database,
    BookOpen,
    Info,
} from 'lucide-react';
import Pagination from '@/Components/Pagination';

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

function getNamaKelas(kelas = null) {
    if (!kelas) return 'N/A';
    if (kelas.nama_kelas) return kelas.nama_kelas;

    return [kelas.tingkat, kelas.jurusan]
        .filter(Boolean)
        .join(' ') || 'N/A';
}

function avatarFallback(name = 'Siswa') {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4f46e5&color=ffffff&bold=true`;
}

function getStatusMeta(status = '') {
    const value = status || 'Tidak Diketahui';

    if (value === 'Aktif') {
        return {
            label: 'Aktif',
            className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
            dot: 'bg-emerald-500',
        };
    }

    if (value === 'Lulus') {
        return {
            label: 'Lulus',
            className: 'border-sky-200 bg-sky-50 text-sky-700',
            dot: 'bg-sky-500',
        };
    }

    if (value === 'Pindah') {
        return {
            label: 'Pindah',
            className: 'border-amber-200 bg-amber-50 text-amber-700',
            dot: 'bg-amber-500',
        };
    }

    if (value === 'Drop Out' || value === 'Tidak Aktif') {
        return {
            label: value,
            className: 'border-rose-200 bg-rose-50 text-rose-700',
            dot: 'bg-rose-500',
        };
    }

    return {
        label: value,
        className: 'border-slate-200 bg-slate-50 text-slate-600',
        dot: 'bg-slate-400',
    };
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

function StatusBadge({ status }) {
    const meta = getStatusMeta(status);

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide',
                meta.className
            )}
        >
            <span className={cn('h-2 w-2 rounded-full', meta.dot)} />
            {meta.label}
        </span>
    );
}

function EmptyState({ resetFilter }) {
    return (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-14 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-slate-300 shadow-sm">
                <Users className="h-8 w-8" />
            </div>

            <h3 className="mt-4 text-base font-black text-slate-700">
                Tidak ada siswa ditemukan
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
                Coba ubah kata kunci pencarian atau pilih kelas lain.
            </p>

            <button
                type="button"
                onClick={resetFilter}
                className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
            >
                <RefreshCw className="h-4 w-4" />
                Reset Filter
            </button>
        </div>
    );
}

function SiswaAvatar({ siswa }) {
    return (
        <img
            className="h-12 w-12 shrink-0 rounded-2xl object-cover ring-4 ring-indigo-50"
            src={siswa.foto_profil_url || avatarFallback(siswa.nama_lengkap)}
            alt={siswa.nama_lengkap || 'Siswa'}
            onError={(event) => {
                event.currentTarget.src = avatarFallback(siswa.nama_lengkap);
            }}
        />
    );
}

function SiswaMobileCard({ siswa, index }) {
    return (
        <PremiumCard className="group overflow-hidden p-0" delay={index * 35}>
            <div className="relative p-4">
                <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-indigo-100/70 blur-2xl transition-all duration-500 group-hover:scale-125" />

                <div className="relative flex items-start gap-3">
                    <SiswaAvatar siswa={siswa} />

                    <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                                <h3
                                    className="text-base font-black leading-snug text-slate-900"
                                    style={clampStyle(2)}
                                >
                                    {siswa.nama_lengkap || 'Nama Siswa'}
                                </h3>

                                <p className="mt-1 text-xs font-bold text-slate-400">
                                    {siswa.nis || '-'} / {siswa.nisn || '-'}
                                </p>
                            </div>

                            <StatusBadge status={siswa.status} />
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-indigo-700">
                                <School className="h-3.5 w-3.5" />
                                {getNamaKelas(siswa.kelas)}
                            </span>

                            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-sky-700">
                                <IdCard className="h-3.5 w-3.5" />
                                NISN {siswa.nisn || '-'}
                            </span>
                        </div>

                        <Link
                            href={safeRoute('guru.siswa.show', siswa.id_siswa)}
                            className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-xs font-black text-white shadow-lg shadow-indigo-200 transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105"
                        >
                            Lihat Detail
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </PremiumCard>
    );
}

function SiswaTableRow({ siswa }) {
    return (
        <tr className="transition hover:bg-indigo-50/35">
            <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                    <SiswaAvatar siswa={siswa} />

                    <div className="min-w-0">
                        <p className="font-black text-slate-900" style={clampStyle(1)}>
                            {siswa.nama_lengkap || '-'}
                        </p>

                        <div className="mt-1 flex flex-wrap gap-2 text-xs font-semibold text-slate-400">
                            <span>NIS: {siswa.nis || '-'}</span>
                            <span>•</span>
                            <span>NISN: {siswa.nisn || '-'}</span>
                        </div>
                    </div>
                </div>
            </td>

            <td className="whitespace-nowrap px-5 py-4">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-indigo-700">
                    <School className="h-3.5 w-3.5" />
                    {getNamaKelas(siswa.kelas)}
                </span>
            </td>

            <td className="whitespace-nowrap px-5 py-4">
                <StatusBadge status={siswa.status} />
            </td>

            <td className="whitespace-nowrap px-5 py-4 text-right">
                <Link
                    href={safeRoute('guru.siswa.show', siswa.id_siswa)}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl bg-indigo-50 px-3.5 py-2 text-xs font-black text-indigo-700 transition hover:bg-indigo-100"
                >
                    <Eye className="h-4 w-4" />
                    Detail
                </Link>
            </td>
        </tr>
    );
}

export default function SiswaIndex({
    auth,
    siswas = {},
    kelasFilterOptions = [],
    filters = {},
}) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedKelas, setSelectedKelas] = useState(filters.kelas || '');
    const [isFiltering, setIsFiltering] = useState(false);

    const isFirstRender = useRef(true);
    const debounceRef = useRef(null);
    const skipNextEffect = useRef(false);

    const siswaRows = siswas?.data || [];

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        if (skipNextEffect.current) {
            skipNextEffect.current = false;
            return;
        }

        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
            router.get(
                safeRoute('guru.siswa.index'),
                {
                    kelas: selectedKelas || undefined,
                    search: searchTerm || undefined,
                    page: 1,
                },
                {
                    preserveState: true,
                    replace: true,
                    preserveScroll: true,
                    onStart: () => setIsFiltering(true),
                    onFinish: () => setIsFiltering(false),
                }
            );
        }, 350);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [selectedKelas, searchTerm]);

    const handleReset = () => {
        skipNextEffect.current = true;

        if (debounceRef.current) clearTimeout(debounceRef.current);

        setSearchTerm('');
        setSelectedKelas('');

        router.get(
            safeRoute('guru.siswa.index'),
            {},
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
                onStart: () => setIsFiltering(true),
                onFinish: () => setIsFiltering(false),
            }
        );
    };

    const stats = useMemo(() => {
        const totalServer = siswas?.total ?? siswaRows.length;
        const aktifPage = siswaRows.filter((siswa) => siswa.status === 'Aktif').length;
        const nonAktifPage = siswaRows.filter((siswa) => siswa.status && siswa.status !== 'Aktif').length;

        return {
            total: totalServer,
            tampil: siswaRows.length,
            aktifPage,
            nonAktifPage,
            kelas: kelasFilterOptions?.length || 0,
        };
    }, [siswas, siswaRows, kelasFilterOptions]);

    const pageInfo = useMemo(() => {
        if (siswas?.from && siswas?.to && siswas?.total) {
            return `${siswas.from} - ${siswas.to} dari ${siswas.total}`;
        }

        return `${siswaRows.length} data`;
    }, [siswas, siswaRows]);

    const hasFilter = Boolean(searchTerm || selectedKelas);

    return (
        <GuruLayout user={auth?.user} header="Daftar Siswa Saya">
            <Head title="Daftar Siswa" />

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
                                        Data Siswa Guru
                                    </div>

                                    <h1 className="mt-3 text-xl font-black leading-tight tracking-tight sm:text-2xl lg:text-3xl">
                                        Daftar Siswa Saya
                                    </h1>

                                    <p className="mt-2 max-w-3xl text-sm font-medium leading-relaxed text-white/80">
                                        Pantau data siswa berdasarkan kelas yang berkaitan dengan tugas mengajar atau perwalian.
                                        Gunakan pencarian untuk melihat detail siswa dengan cepat.
                                    </p>

                                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-white/90">
                                        <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                                            Total {stats.total} Siswa
                                        </span>

                                        <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                                            {stats.kelas} Kelas
                                        </span>

                                        <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                                            Menampilkan {stats.tampil}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:min-w-[520px]">
                                    <StatMiniCard label="Total" value={stats.total} icon={Users} />
                                    <StatMiniCard label="Tampil" value={stats.tampil} icon={Database} />
                                    <StatMiniCard label="Aktif" value={stats.aktifPage} icon={BadgeCheck} />
                                    <StatMiniCard label="Kelas" value={stats.kelas} icon={School} />
                                </div>
                            </div>
                        </div>
                    </PremiumCard>

                    {/* Filter */}
                    <PremiumCard className="p-4 sm:p-5" delay={80}>
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                            <div className="flex items-start gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                                    <Filter className="h-5 w-5" />
                                </div>

                                <div>
                                    <h2 className="text-base font-black text-slate-900">
                                        Filter Data Siswa
                                    </h2>

                                    <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                                        Cari berdasarkan nama, NIS, atau pilih kelas tertentu.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700">
                                    <Users className="h-4 w-4" />
                                    {pageInfo}
                                </span>

                                {isFiltering && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-black text-sky-700">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Memuat
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-12">
                            <div className="lg:col-span-6">
                                <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
                                    Pencarian
                                </label>

                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                    <input
                                        type="search"
                                        value={searchTerm}
                                        onChange={(event) => setSearchTerm(event.target.value)}
                                        className="min-h-11 w-full rounded-2xl border border-slate-200 bg-white/90 py-2 pl-10 pr-3 text-sm font-semibold text-slate-700 shadow-sm outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                                        placeholder="Cari nama siswa atau NIS..."
                                        aria-label="Cari siswa"
                                    />
                                </div>
                            </div>

                            <div className="lg:col-span-4">
                                <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
                                    Kelas
                                </label>

                                <select
                                    value={selectedKelas}
                                    onChange={(event) => setSelectedKelas(event.target.value)}
                                    className="min-h-11 w-full rounded-2xl border border-slate-200 bg-white/90 px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                                    aria-label="Filter kelas"
                                >
                                    <option value="">Semua Kelas</option>

                                    {(kelasFilterOptions || []).map((kelas) => (
                                        <option key={kelas.id_kelas} value={kelas.id_kelas}>
                                            {getNamaKelas(kelas)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-end lg:col-span-2">
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    disabled={!hasFilter && !isFiltering}
                                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-black text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    aria-label="Reset filter"
                                >
                                    {hasFilter ? <X className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
                                    Reset
                                </button>
                            </div>
                        </div>
                    </PremiumCard>

                    {/* Content */}
                    <PremiumCard className="overflow-hidden p-0" delay={120}>
                        <div className="border-b border-slate-100 p-4 sm:p-5">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                                        <UserRound className="h-5 w-5" />
                                    </div>

                                    <div>
                                        <h2 className="text-base font-black text-slate-900">
                                            Data Siswa
                                        </h2>

                                        <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                                            Menampilkan {stats.tampil} data pada halaman ini.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-700">
                                        <ShieldCheck className="h-3.5 w-3.5" />
                                        Aktif {stats.aktifPage}
                                    </span>

                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600">
                                        <Info className="h-3.5 w-3.5" />
                                        Non Aktif {stats.nonAktifPage}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {siswaRows.length > 0 ? (
                            <>
                                {/* Mobile */}
                                <div className="grid grid-cols-1 gap-3 p-4 lg:hidden">
                                    {siswaRows.map((siswa, index) => (
                                        <SiswaMobileCard
                                            key={siswa.id_siswa}
                                            siswa={siswa}
                                            index={index}
                                        />
                                    ))}
                                </div>

                                {/* Desktop */}
                                <div className="hidden overflow-x-auto lg:block">
                                    <table className="min-w-full text-left text-sm">
                                        <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
                                            <tr>
                                                <th className="px-5 py-4 font-black">Nama Siswa</th>
                                                <th className="px-5 py-4 font-black">Kelas</th>
                                                <th className="px-5 py-4 font-black">Status</th>
                                                <th className="px-5 py-4 text-right font-black">Aksi</th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-slate-100 bg-white">
                                            {siswaRows.map((siswa) => (
                                                <SiswaTableRow
                                                    key={siswa.id_siswa}
                                                    siswa={siswa}
                                                />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        ) : (
                            <div className="p-4">
                                <EmptyState resetFilter={handleReset} />
                            </div>
                        )}

                        {siswas?.links && (
                            <div className="border-t border-slate-100 bg-white/70 p-4">
                                <Pagination links={siswas.links} />
                            </div>
                        )}
                    </PremiumCard>
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