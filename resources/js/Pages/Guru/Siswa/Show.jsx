// resources/js/Pages/Guru/Siswa/Show.jsx

import React, { useMemo } from 'react';
import GuruLayout from '@/Layouts/GuruLayout';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    AlertTriangle,
    BadgeCheck,
    BookOpen,
    CalendarDays,
    CheckCircle2,
    FileText,
    HeartHandshake,
    Home,
    IdCard,
    Info,
    MapPin,
    Phone,
    PieChart,
    School,
    ShieldCheck,
    Smartphone,
    Sparkles,
    User,
    UserRound,
    Users,
    XCircle,
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

function avatarFallback(name = 'Siswa') {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4f46e5&color=ffffff&bold=true`;
}

function getNamaKelas(kelas = null) {
    if (!kelas) return '-';
    if (kelas.nama_kelas) return kelas.nama_kelas;

    return [kelas.tingkat, kelas.jurusan]
        .filter(Boolean)
        .join(' ') || '-';
}

function formatDate(value) {
    if (!value) return '-';

    try {
        return new Date(value).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    } catch {
        return value;
    }
}

function formatTempatTanggalLahir(siswa = {}) {
    const tempat = siswa.tempat_lahir || '-';
    const tanggal = formatDate(siswa.tanggal_lahir);

    if (tempat === '-' && tanggal === '-') return '-';
    return `${tempat}, ${tanggal}`;
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

function StatusBadge({ status }) {
    const meta = getStatusMeta(status);

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wide',
                meta.className
            )}
        >
            <span className={cn('h-2 w-2 rounded-full', meta.dot)} />
            {meta.label}
        </span>
    );
}

function HeroStat({ label, value, icon: Icon }) {
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

function StatCard({ label, value, icon: Icon, tone = 'indigo' }) {
    const tones = {
        emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        amber: 'bg-amber-50 text-amber-700 border-amber-100',
        sky: 'bg-sky-50 text-sky-700 border-sky-100',
        rose: 'bg-rose-50 text-rose-700 border-rose-100',
        indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    };

    return (
        <PremiumCard className="p-4" delay={80}>
            <div className="flex items-center gap-3">
                <div
                    className={cn(
                        'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border',
                        tones[tone] || tones.indigo
                    )}
                >
                    <Icon className="h-6 w-6" />
                </div>

                <div>
                    <p className="text-2xl font-black leading-none text-slate-900">
                        {value ?? 0}
                    </p>

                    <p className="mt-1 text-xs font-black uppercase tracking-wide text-slate-400">
                        {label}
                    </p>
                </div>
            </div>
        </PremiumCard>
    );
}

function InfoCard({ title, icon: Icon, children, delay = 120 }) {
    return (
        <PremiumCard className="overflow-hidden p-0" delay={delay}>
            <div className="border-b border-slate-100 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                        <Icon className="h-5 w-5" />
                    </div>

                    <div>
                        <h3 className="text-base font-black text-slate-900">
                            {title}
                        </h3>

                        <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                            Informasi detail yang tercatat pada data siswa.
                        </p>
                    </div>
                </div>
            </div>

            <dl className="divide-y divide-slate-100">
                {children}
            </dl>
        </PremiumCard>
    );
}

function InfoRow({ label, value, icon: Icon }) {
    return (
        <div className="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-12 sm:gap-4 sm:px-5">
            <dt className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-400 sm:col-span-4">
                {Icon && <Icon className="h-4 w-4" />}
                {label}
            </dt>

            <dd className="text-sm font-bold leading-relaxed text-slate-700 sm:col-span-8">
                {value || '-'}
            </dd>
        </div>
    );
}

function WaliCard({ wali }) {
    return (
        <div className="rounded-3xl border border-slate-100 bg-slate-50/75 p-4">
            <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200">
                    <HeartHandshake className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="font-black text-slate-900" style={clampStyle(1)}>
                            {wali.nama_lengkap || '-'}
                        </p>

                        {wali.hubungan && (
                            <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-indigo-700">
                                {wali.hubungan}
                            </span>
                        )}
                    </div>

                    <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-slate-600">
                        <Smartphone className="h-4 w-4 text-sky-500" />
                        {wali.no_telepon_wa || '-'}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function SiswaShow({
    auth,
    siswa = {},
    orangTuaWali = [],
    absensiSummary = {},
}) {
    const waliList = Array.isArray(orangTuaWali) ? orangTuaWali : [];
    const namaKelas = getNamaKelas(siswa.kelas);

    const totalAbsensi = useMemo(() => {
        return (
            Number(absensiSummary.hadir || 0) +
            Number(absensiSummary.sakit || 0) +
            Number(absensiSummary.izin || 0) +
            Number(absensiSummary.alfa || 0)
        );
    }, [absensiSummary]);

    return (
        <GuruLayout user={auth?.user} header={`Detail Siswa: ${siswa.nama_lengkap || '-'}`}>
            <Head title={`Detail ${siswa.nama_lengkap || 'Siswa'}`} />

            <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/40 to-sky-50/60 py-5 sm:py-6">
                <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-indigo-200/35 blur-3xl" />
                <div className="pointer-events-none absolute right-0 top-40 h-80 w-80 translate-x-24 rounded-full bg-sky-200/40 blur-3xl" />
                <div className="pointer-events-none absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-violet-200/25 blur-3xl" />

                <div className="relative mx-auto max-w-7xl space-y-5 px-3 pb-12 sm:space-y-6 sm:px-6 lg:px-8">
                    {/* Hero Profile */}
                    <PremiumCard className="relative overflow-hidden p-0" delay={0}>
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 via-violet-700 to-sky-700" />
                        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/15 blur-2xl" />
                        <div className="absolute bottom-0 left-1/3 h-32 w-32 translate-y-10 rounded-full bg-indigo-200/20 blur-2xl" />

                        <div className="relative p-4 text-white sm:p-6 lg:p-7">
                            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                                    <img
                                        className="h-28 w-28 shrink-0 rounded-3xl object-cover ring-4 ring-white/25 shadow-2xl"
                                        src={siswa.foto_profil_url || avatarFallback(siswa.nama_lengkap)}
                                        alt={siswa.nama_lengkap || 'Siswa'}
                                        onError={(event) => {
                                            event.currentTarget.src = avatarFallback(siswa.nama_lengkap);
                                        }}
                                    />

                                    <div className="min-w-0">
                                        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-indigo-50 backdrop-blur-md">
                                            <Sparkles className="h-3.5 w-3.5" />
                                            Detail Data Siswa
                                        </div>

                                        <h1 className="mt-3 text-2xl font-black leading-tight tracking-tight sm:text-3xl lg:text-4xl">
                                            {siswa.nama_lengkap || '-'}
                                        </h1>

                                        <p className="mt-2 text-sm font-medium leading-relaxed text-white/80">
                                            NIS: <span className="font-black text-white">{siswa.nis || '-'}</span>
                                            {' '} / NISN: <span className="font-black text-white">{siswa.nisn || '-'}</span>
                                        </p>

                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white/90 backdrop-blur-md">
                                                Kelas {namaKelas}
                                            </span>

                                            <StatusBadge status={siswa.status} />

                                            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white/90 backdrop-blur-md">
                                                Total Absensi {totalAbsensi}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:min-w-[520px]">
                                    <HeroStat label="Hadir" value={absensiSummary.hadir || 0} icon={CheckCircle2} />
                                    <HeroStat label="Sakit" value={absensiSummary.sakit || 0} icon={AlertTriangle} />
                                    <HeroStat label="Izin" value={absensiSummary.izin || 0} icon={Info} />
                                    <HeroStat label="Alfa" value={absensiSummary.alfa || 0} icon={XCircle} />
                                </div>
                            </div>
                        </div>
                    </PremiumCard>

                    {/* Back */}
                    <PremiumCard className="p-3 sm:p-4" delay={50}>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <Link
                                href={safeRoute('guru.siswa.index')}
                                className="inline-flex min-h-10 w-fit items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Kembali ke Daftar Siswa
                            </Link>

                            <div className="flex flex-wrap gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700">
                                    <School className="h-4 w-4" />
                                    {namaKelas}
                                </span>

                                <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-black text-sky-700">
                                    <IdCard className="h-4 w-4" />
                                    {siswa.nis || '-'}
                                </span>
                            </div>
                        </div>
                    </PremiumCard>

                    {/* Ringkasan Absensi */}
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        <StatCard label="Hadir" value={absensiSummary.hadir || 0} icon={CheckCircle2} tone="emerald" />
                        <StatCard label="Sakit" value={absensiSummary.sakit || 0} icon={AlertTriangle} tone="amber" />
                        <StatCard label="Izin" value={absensiSummary.izin || 0} icon={Info} tone="sky" />
                        <StatCard label="Alfa" value={absensiSummary.alfa || 0} icon={XCircle} tone="rose" />
                    </div>

                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                        <InfoCard title="Data Pribadi" icon={User} delay={100}>
                            <InfoRow label="NIK" value={siswa.nik} icon={IdCard} />
                            <InfoRow label="Tempat, Tgl Lahir" value={formatTempatTanggalLahir(siswa)} icon={CalendarDays} />
                            <InfoRow label="Jenis Kelamin" value={siswa.jenis_kelamin || siswa.jk} icon={UserRound} />
                            <InfoRow label="Agama" value={siswa.agama} icon={ShieldCheck} />
                            <InfoRow label="Status Siswa" value={<StatusBadge status={siswa.status} />} icon={BadgeCheck} />
                        </InfoCard>

                        <InfoCard title="Data Akademik" icon={BookOpen} delay={120}>
                            <InfoRow label="Kelas" value={namaKelas} icon={School} />
                            <InfoRow label="NIS" value={siswa.nis} icon={IdCard} />
                            <InfoRow label="NISN" value={siswa.nisn} icon={IdCard} />
                            <InfoRow label="Total Absensi" value={`${totalAbsensi} data`} icon={PieChart} />
                            <InfoRow label="Status" value={<StatusBadge status={siswa.status} />} icon={ShieldCheck} />
                        </InfoCard>

                        <InfoCard title="Alamat Siswa" icon={Home} delay={140}>
                            <InfoRow label="Alamat Lengkap" value={siswa.alamat_lengkap || siswa.alamat} icon={MapPin} />
                            <InfoRow label="Tempat Tinggal" value={siswa.jenis_tinggal} icon={Home} />
                            <InfoRow label="Transportasi" value={siswa.alat_transportasi} icon={Info} />
                            <InfoRow label="Keterangan" value={siswa.keterangan} icon={FileText} />
                        </InfoCard>

                        <PremiumCard className="overflow-hidden p-0" delay={160}>
                            <div className="border-b border-slate-100 p-4 sm:p-5">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                                        <Phone className="h-5 w-5" />
                                    </div>

                                    <div>
                                        <h3 className="text-base font-black text-slate-900">
                                            Kontak Orang Tua / Wali
                                        </h3>

                                        <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                                            Daftar kontak wali yang bisa dihubungi.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 p-4 sm:p-5">
                                {waliList.length > 0 ? (
                                    waliList.map((wali) => (
                                        <WaliCard key={wali.id_wali || wali.id || wali.nama_lengkap} wali={wali} />
                                    ))
                                ) : (
                                    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center">
                                        <Phone className="mx-auto h-10 w-10 text-slate-300" />
                                        <p className="mt-3 text-sm font-black text-slate-700">
                                            Tidak ada data kontak
                                        </p>
                                        <p className="mt-1 text-xs font-medium text-slate-500">
                                            Data orang tua atau wali belum tersedia.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </PremiumCard>
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
      `}</style>
        </GuruLayout>
    );
}