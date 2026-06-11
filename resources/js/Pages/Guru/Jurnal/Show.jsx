// File: resources/js/Pages/Guru/Jurnal/Show.jsx

import React from 'react';
import { Head, Link } from '@inertiajs/react';
import GuruLayout from '@/Layouts/GuruLayout';
import {
    ArrowLeft,
    Edit,
    Printer,
    Sparkles,
    BookOpen,
    CalendarDays,
    Clock,
    GraduationCap,
    FileText,
    ClipboardList,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Info,
    UserCheck,
    ShieldCheck,
    Layers,
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
        return route(name, params);
    } catch {
        return fallback;
    }
}

function fmtTime(value) {
    return value ? String(value).substring(0, 5) : '—';
}

function displayDate(dateString, options = {}) {
    if (!dateString) return '—';

    try {
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            ...options,
        });
    } catch {
        return dateString;
    }
}

function getKelasName(jurnal) {
    const kelas = jurnal?.jadwal_mengajar?.kelas;

    if (!kelas) return '—';

    return [kelas?.tingkat, kelas?.jurusan].filter(Boolean).join(' ') || '—';
}

function getMapelName(jurnal) {
    return jurnal?.jadwal_mengajar?.mata_pelajaran?.nama_mapel || '—';
}

const statusTheme = {
    Mengajar: {
        badge: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        gradient: 'from-emerald-500 to-teal-500 shadow-emerald-200',
        icon: CheckCircle2,
    },
    Tugas: {
        badge: 'border-sky-200 bg-sky-50 text-sky-700',
        gradient: 'from-sky-500 to-cyan-500 shadow-sky-200',
        icon: ClipboardList,
    },
    Digantikan: {
        badge: 'border-amber-200 bg-amber-50 text-amber-700',
        gradient: 'from-amber-500 to-orange-500 shadow-amber-200',
        icon: AlertTriangle,
    },
    Kosong: {
        badge: 'border-rose-200 bg-rose-50 text-rose-700',
        gradient: 'from-rose-500 to-pink-500 shadow-rose-200',
        icon: XCircle,
    },
};

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

function StatusBadge({ status }) {
    const current = statusTheme[status] || {
        badge: 'border-slate-200 bg-slate-50 text-slate-700',
        icon: Info,
    };

    const Icon = current.icon;

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-wide',
                current.badge
            )}
        >
            <Icon className="h-4 w-4" />
            {status || '-'}
        </span>
    );
}

function StatMiniCard({ label, value, icon: Icon }) {
    return (
        <div className="rounded-3xl border border-white/15 bg-white/10 p-3 text-center backdrop-blur-md">
            <Icon className="mx-auto h-5 w-5 text-white/90" />

            <p className="mt-2 text-lg font-black leading-none text-white" style={clampStyle(1)}>
                {value || '-'}
            </p>

            <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-white/70">
                {label}
            </p>
        </div>
    );
}

function DetailRow({ label, value, icon: Icon, wide = false }) {
    return (
        <div
            className={cn(
                'rounded-3xl border border-slate-100 bg-slate-50/70 p-4 transition-all duration-300 hover:border-indigo-100 hover:bg-indigo-50/40',
                wide && 'md:col-span-2'
            )}
        >
            <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
                    <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                    <dt className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                        {label}
                    </dt>

                    <dd className="mt-1 text-sm font-bold leading-relaxed text-slate-800 break-words">
                        {value || <span className="font-semibold text-slate-400">-</span>}
                    </dd>
                </div>
            </div>
        </div>
    );
}

export default function Show({ auth, jurnal = {} }) {
    const mapelName = getMapelName(jurnal);
    const kelasName = getKelasName(jurnal);
    const jamMasuk = fmtTime(jurnal?.jam_masuk_kelas);
    const jamKeluar = fmtTime(jurnal?.jam_keluar_kelas);
    const currentStatus = statusTheme[jurnal?.status_mengajar] || {
        gradient: 'from-indigo-600 to-violet-600 shadow-indigo-200',
        icon: Info,
    };

    const StatusIcon = currentStatus.icon;

    return (
        <GuruLayout header="Detail Jurnal Mengajar">
            <Head title="Detail Jurnal" />

            <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/40 to-sky-50/60 py-5 sm:py-6">
                <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-indigo-200/35 blur-3xl" />
                <div className="pointer-events-none absolute right-0 top-40 h-80 w-80 translate-x-24 rounded-full bg-sky-200/40 blur-3xl" />
                <div className="pointer-events-none absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-violet-200/25 blur-3xl" />

                <div className="relative mx-auto max-w-7xl space-y-5 px-3 pb-12 sm:space-y-6 sm:px-6 lg:px-8">
                    {/* HERO */}
                    <PremiumCard className="relative overflow-hidden p-0" delay={0}>
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 via-violet-700 to-sky-700" />
                        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/15 blur-2xl" />
                        <div className="absolute bottom-0 left-1/3 h-32 w-32 translate-y-10 rounded-full bg-indigo-200/20 blur-2xl" />

                        <div className="relative p-4 text-white sm:p-6 lg:p-7">
                            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex min-w-0 items-start gap-4 sm:items-center">
                                    <div
                                        className={cn(
                                            'flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br text-white shadow-lg sm:h-20 sm:w-20',
                                            currentStatus.gradient
                                        )}
                                    >
                                        <StatusIcon className="h-8 w-8" />
                                    </div>

                                    <div className="min-w-0">
                                        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-indigo-50 backdrop-blur-md">
                                            <Sparkles className="h-3.5 w-3.5" />
                                            Detail Jurnal
                                        </div>

                                        <h1
                                            className="mt-3 text-xl font-black leading-tight tracking-tight sm:text-2xl lg:text-3xl"
                                            style={clampStyle(2)}
                                        >
                                            {mapelName}
                                        </h1>

                                        <p className="mt-2 max-w-3xl text-sm font-medium leading-relaxed text-white/80">
                                            Detail catatan mengajar untuk kelas{' '}
                                            <span className="font-black text-indigo-100">
                                                {kelasName}
                                            </span>{' '}
                                            pada{' '}
                                            <span className="font-black text-sky-100">
                                                {displayDate(jurnal?.tanggal)}
                                            </span>.
                                        </p>

                                        <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-white/90">
                                            <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                                                {jamMasuk} - {jamKeluar} WIB
                                            </span>

                                            <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                                                Kelas {kelasName}
                                            </span>

                                            <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                                                Jurnal #{jurnal?.id_jurnal || '-'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:min-w-[430px]">
                                    <StatMiniCard label="Tanggal" value={displayDate(jurnal?.tanggal, { weekday: undefined })} icon={CalendarDays} />
                                    <StatMiniCard label="Jam" value={`${jamMasuk} - ${jamKeluar}`} icon={Clock} />
                                    <StatMiniCard label="Kelas" value={kelasName} icon={GraduationCap} />
                                </div>
                            </div>
                        </div>
                    </PremiumCard>

                    {/* Action Bar */}
                    <PremiumCard className="p-3 sm:p-4" delay={80}>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <Link
                                href={safeRoute('guru.jurnal.index')}
                                className="inline-flex min-h-10 w-fit items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Kembali ke Daftar Jurnal
                            </Link>

                            <div className="flex flex-wrap items-center gap-2">
                                <StatusBadge status={jurnal?.status_mengajar} />

                                <Link
                                    href={safeRoute('guru.jurnal.edit', jurnal?.id_jurnal)}
                                    className="inline-flex min-h-10 items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-3.5 py-2 text-sm font-black text-white shadow-lg shadow-indigo-200 transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105"
                                >
                                    <Edit className="h-4 w-4" />
                                    Edit Jurnal
                                </Link>

                                <button
                                    type="button"
                                    onClick={() => window.print()}
                                    className="inline-flex min-h-10 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                                >
                                    <Printer className="h-4 w-4" />
                                    Cetak
                                </button>
                            </div>
                        </div>
                    </PremiumCard>

                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                        {/* Summary Card */}
                        <div className="space-y-5 lg:col-span-1">
                            <PremiumCard className="overflow-hidden p-0" delay={120}>
                                <div className="relative bg-gradient-to-br from-white to-indigo-50/60 p-5 text-center">
                                    <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-indigo-100/80 blur-2xl" />

                                    <div
                                        className={cn(
                                            'relative mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br text-white shadow-xl',
                                            currentStatus.gradient
                                        )}
                                    >
                                        <BookOpen className="h-10 w-10" />
                                    </div>

                                    <h2 className="mt-4 text-lg font-black leading-tight text-slate-900 break-words">
                                        {mapelName}
                                    </h2>

                                    <p className="mt-1 text-sm font-semibold text-slate-500">
                                        Kelas {kelasName}
                                    </p>

                                    <div className="mt-4 flex justify-center">
                                        <StatusBadge status={jurnal?.status_mengajar} />
                                    </div>
                                </div>
                            </PremiumCard>

                            <PremiumCard className="p-4" delay={160}>
                                <div className="flex items-start gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                                        <ShieldCheck className="h-5 w-5" />
                                    </div>

                                    <div className="min-w-0">
                                        <div className="text-sm font-black text-slate-900">
                                            Informasi Jurnal
                                        </div>

                                        <p className="mt-1 text-xs leading-relaxed text-slate-500">
                                            Data jurnal ini digunakan sebagai catatan aktivitas pembelajaran, laporan guru, dan evaluasi proses mengajar.
                                        </p>
                                    </div>
                                </div>
                            </PremiumCard>

                            <PremiumCard className="p-4" delay={200}>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2">
                                        <span className="text-xs font-black uppercase tracking-wide text-slate-400">
                                            Jam Masuk
                                        </span>
                                        <span className="text-sm font-black text-slate-800">
                                            {jamMasuk}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2">
                                        <span className="text-xs font-black uppercase tracking-wide text-slate-400">
                                            Jam Keluar
                                        </span>
                                        <span className="text-sm font-black text-slate-800">
                                            {jamKeluar}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2">
                                        <span className="text-xs font-black uppercase tracking-wide text-slate-400">
                                            Status
                                        </span>
                                        <span className="text-sm font-black text-slate-800">
                                            {jurnal?.status_mengajar || '-'}
                                        </span>
                                    </div>
                                </div>
                            </PremiumCard>
                        </div>

                        {/* Detail */}
                        <div className="space-y-5 lg:col-span-2">
                            <PremiumCard className="overflow-hidden" delay={140}>
                                <div className="border-b border-slate-100 p-4 sm:p-5">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                                            <ClipboardList className="h-5 w-5" />
                                        </div>

                                        <div>
                                            <h2 className="text-base font-black text-slate-900">
                                                Detail Data Jurnal
                                            </h2>

                                            <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                                                Ringkasan lengkap jurnal mengajar yang sudah tersimpan.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-3 p-4 sm:p-5 md:grid-cols-2">
                                    <DetailRow
                                        label="Tanggal"
                                        value={displayDate(jurnal?.tanggal)}
                                        icon={CalendarDays}
                                    />

                                    <DetailRow
                                        label="Waktu Aktual"
                                        value={`${jamMasuk} - ${jamKeluar} WIB`}
                                        icon={Clock}
                                    />

                                    <DetailRow
                                        label="Kelas"
                                        value={kelasName}
                                        icon={GraduationCap}
                                    />

                                    <DetailRow
                                        label="Mata Pelajaran"
                                        value={mapelName}
                                        icon={BookOpen}
                                    />

                                    <DetailRow
                                        label="Status"
                                        value={jurnal?.status_mengajar}
                                        icon={UserCheck}
                                    />

                                    <DetailRow
                                        label="ID Jurnal"
                                        value={jurnal?.id_jurnal ? `#${jurnal.id_jurnal}` : '-'}
                                        icon={Layers}
                                    />
                                </div>
                            </PremiumCard>

                            <PremiumCard className="overflow-hidden" delay={180}>
                                <div className="border-b border-slate-100 p-4 sm:p-5">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                                            <FileText className="h-5 w-5" />
                                        </div>

                                        <div>
                                            <h2 className="text-base font-black text-slate-900">
                                                Materi Pembahasan
                                            </h2>

                                            <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                                                Catatan materi atau aktivitas pembelajaran yang dilakukan.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 sm:p-5">
                                    <div className="min-h-[180px] rounded-3xl border border-slate-100 bg-slate-50/70 p-4">
                                        <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-slate-700">
                                            {jurnal?.materi_pembahasan || 'Belum ada materi pembahasan.'}
                                        </p>
                                    </div>
                                </div>
                            </PremiumCard>
                        </div>
                    </div>
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

        @media print {
          header,
          aside,
          button,
          a {
            display: none !important;
          }

          body {
            background: white !important;
          }

          .animate-soft-rise {
            animation: none !important;
          }
        }
      `}</style>
        </GuruLayout>
    );
}