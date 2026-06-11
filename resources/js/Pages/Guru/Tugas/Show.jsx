// File: resources/js/Pages/Guru/Tugas/Show.jsx

import React, { useMemo, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import GuruLayout from '@/Layouts/GuruLayout';
import {
    ArrowLeft,
    Sparkles,
    ClipboardList,
    CalendarDays,
    FileText,
    CheckCircle2,
    XCircle,
    UserCircle,
    FileCheck2,
    Download,
    Clock,
    GraduationCap,
    BookOpen,
    Users,
    ShieldCheck,
    AlertTriangle,
    UploadCloud,
    Info,
    Eye,
    Save,
    Loader2,
    X,
    MessageSquareText,
    Star,
    Send,
    Archive,
    Layers,
    Paperclip,
    Pencil,
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

function formatDateTime(value, withYear = true) {
    if (!value) return '-';

    try {
        return new Date(value).toLocaleString('id-ID', {
            day: 'numeric',
            month: 'short',
            ...(withYear ? { year: 'numeric' } : {}),
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return value;
    }
}

function isOverdue(value) {
    if (!value) return false;

    try {
        return new Date(value).getTime() < Date.now();
    } catch {
        return false;
    }
}

function getKelasName(tugas) {
    const kelas = tugas?.jadwal_mengajar?.kelas;

    if (!kelas) return 'Kelas Tidak Diketahui';

    return [kelas?.tingkat, kelas?.jurusan].filter(Boolean).join(' ') || 'Kelas Tidak Diketahui';
}

function getMapelName(tugas) {
    return tugas?.jadwal_mengajar?.mata_pelajaran?.nama_mapel || 'Mata Pelajaran Tidak Diketahui';
}

function getScoreTone(nilai) {
    const value = Number(nilai);

    if (Number.isNaN(value)) return 'border-slate-200 bg-slate-50 text-slate-500';
    if (value >= 85) return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    if (value >= 70) return 'border-sky-200 bg-sky-50 text-sky-700';
    if (value >= 60) return 'border-amber-200 bg-amber-50 text-amber-700';

    return 'border-rose-200 bg-rose-50 text-rose-700';
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

function InfoBox({ label, value, icon: Icon, tone = 'indigo' }) {
    const tones = {
        indigo: 'bg-indigo-50 text-indigo-700',
        sky: 'bg-sky-50 text-sky-700',
        violet: 'bg-violet-50 text-violet-700',
        emerald: 'bg-emerald-50 text-emerald-700',
        rose: 'bg-rose-50 text-rose-700',
        slate: 'bg-slate-50 text-slate-700',
    };

    return (
        <div className="rounded-3xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="flex items-start gap-3">
                <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-sm', tones[tone] || tones.indigo)}>
                    <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                    <div className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                        {label}
                    </div>

                    <div className="mt-1 text-sm font-black leading-relaxed text-slate-800 break-words">
                        {value || '-'}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatusTugasBadge({ status }) {
    const map = {
        Diterbitkan: {
            className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
            icon: Send,
        },
        Draft: {
            className: 'border-slate-200 bg-slate-50 text-slate-700',
            icon: FileText,
        },
        Selesai: {
            className: 'border-sky-200 bg-sky-50 text-sky-700',
            icon: CheckCircle2,
        },
        Arsip: {
            className: 'border-violet-200 bg-violet-50 text-violet-700',
            icon: Archive,
        },
    };

    const current = map[status] || {
        className: 'border-indigo-200 bg-indigo-50 text-indigo-700',
        icon: Layers,
    };

    const Icon = current.icon;

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-wide',
                current.className
            )}
        >
            <Icon className="h-4 w-4" />
            {status || '-'}
        </span>
    );
}

function TipeTugasBadge({ tipe }) {
    const isNotice = tipe === 'Pemberitahuan';

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-wide',
                isNotice
                    ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                    : 'border-sky-200 bg-sky-50 text-sky-700'
            )}
        >
            {isNotice ? <Info className="h-4 w-4" /> : <UploadCloud className="h-4 w-4" />}
            {tipe || 'Upload'}
        </span>
    );
}

function PengumpulanBadge({ status, tipeTugas }) {
    if (status === 'Belum Mengumpulkan') {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-rose-700">
                <XCircle className="h-3.5 w-3.5" />
                {tipeTugas === 'Pemberitahuan' ? 'Belum Konfirmasi' : 'Belum Kumpul'}
            </span>
        );
    }

    if (status === 'Menunggu Penilaian') {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-amber-700">
                <FileCheck2 className="h-3.5 w-3.5" />
                Menunggu Nilai
            </span>
        );
    }

    if (status === 'Selesai') {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-indigo-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Selesai
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Dinilai
        </span>
    );
}

function DeadlineBadge({ value }) {
    const overdue = isOverdue(value);

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-black',
                overdue
                    ? 'border-rose-200 bg-rose-50 text-rose-700'
                    : 'border-indigo-200 bg-indigo-50 text-indigo-700'
            )}
        >
            {overdue ? <AlertTriangle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
            {formatDateTime(value)}
        </span>
    );
}

function StudentCard({ item, tugas, onGrade, delay = 0 }) {
    return (
        <PremiumCard className="overflow-hidden p-0" delay={delay}>
            <div className="p-4">
                <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600">
                        <UserCircle className="h-7 w-7" />
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                                <p className="text-sm font-black text-slate-900" style={clampStyle(1)}>
                                    {item.nama_lengkap}
                                </p>

                                <p className="mt-0.5 text-xs font-semibold text-slate-400">
                                    NISN: {item.nisn || '-'}
                                </p>
                            </div>

                            <PengumpulanBadge status={item.status_pengumpulan} tipeTugas={tugas.tipe_tugas} />
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-sky-700">
                                <Clock className="h-3.5 w-3.5" />
                                {item.waktu_pengumpulan ? formatDateTime(item.waktu_pengumpulan, false) : '-'}
                            </span>

                            <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide', getScoreTone(item.nilai))}>
                                <Star className="h-3.5 w-3.5" />
                                Nilai: {item.nilai !== null ? item.nilai : '-'}
                            </span>
                        </div>

                        {(item.file_jawaban || item.teks_jawaban) && (
                            <div className="mt-3 rounded-2xl bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600">
                                {item.file_jawaban ? (
                                    <a
                                        href={`/storage-public/${item.file_jawaban}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 font-black text-indigo-700 hover:underline"
                                    >
                                        <FileText className="h-4 w-4" />
                                        Lihat File Jawaban
                                    </a>
                                ) : (
                                    <p style={clampStyle(3)}>
                                        {item.teks_jawaban}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="mt-4 flex justify-end">
                            <button
                                type="button"
                                onClick={() => onGrade(item)}
                                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl bg-indigo-50 px-4 py-2 text-xs font-black text-indigo-700 transition hover:bg-indigo-100"
                            >
                                <Pencil className="h-4 w-4" />
                                {item.status_pengumpulan === 'Dinilai' ? 'Ubah Nilai' : 'Berikan Nilai'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </PremiumCard>
    );
}

export default function Show({ auth, tugas = {}, hasilPengumpulan = [] }) {
    const [selectedSiswa, setSelectedSiswa] = useState(null);

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
    } = useForm({
        nilai: '',
        catatan_guru: '',
    });

    const kelasName = getKelasName(tugas);
    const mapelName = getMapelName(tugas);

    const stats = useMemo(() => {
        const total = hasilPengumpulan.length;
        const belum = hasilPengumpulan.filter((item) => item.status_pengumpulan === 'Belum Mengumpulkan').length;
        const menunggu = hasilPengumpulan.filter((item) => item.status_pengumpulan === 'Menunggu Penilaian').length;
        const dinilai = hasilPengumpulan.filter((item) => item.status_pengumpulan === 'Dinilai').length;
        const selesai = hasilPengumpulan.filter((item) => item.status_pengumpulan === 'Selesai').length;

        return { total, belum, menunggu, dinilai, selesai };
    }, [hasilPengumpulan]);

    const openGradeModal = (siswa) => {
        setSelectedSiswa(siswa);

        setData({
            nilai: siswa.nilai || '',
            catatan_guru: siswa.catatan_guru || '',
        });
    };

    const closeGradeModal = () => {
        setSelectedSiswa(null);
        reset();
    };

    const submitGrade = (event) => {
        event.preventDefault();

        if (!selectedSiswa) return;

        post(safeRoute('guru.tugas.nilai', [tugas.id_tugas, selectedSiswa.id_siswa]), {
            preserveScroll: true,
            onSuccess: () => closeGradeModal(),
        });
    };

    return (
        <GuruLayout header="Detail & Penilaian Tugas">
            <Head title="Detail Tugas" />

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
                                        Detail Tugas
                                    </div>

                                    <h1 className="mt-3 text-xl font-black leading-tight tracking-tight sm:text-2xl lg:text-3xl" style={clampStyle(2)}>
                                        {tugas.judul_tugas || 'Detail Tugas'}
                                    </h1>

                                    <p className="mt-2 max-w-3xl text-sm font-medium leading-relaxed text-white/80">
                                        Detail penugasan untuk kelas{' '}
                                        <span className="font-black text-indigo-100">
                                            {kelasName}
                                        </span>{' '}
                                        pada mata pelajaran{' '}
                                        <span className="font-black text-sky-100">
                                            {mapelName}
                                        </span>.
                                    </p>

                                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-white/90">
                                        <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                                            ID Tugas: {tugas.id_tugas || '-'}
                                        </span>

                                        <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                                            Total Siswa: {stats.total}
                                        </span>

                                        <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                                            Dinilai: {stats.dinilai}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:min-w-[520px]">
                                    <StatMiniCard label="Siswa" value={stats.total} icon={Users} />
                                    <StatMiniCard label="Belum" value={stats.belum} icon={XCircle} />
                                    <StatMiniCard label="Menunggu" value={stats.menunggu} icon={FileCheck2} />
                                    <StatMiniCard label="Dinilai" value={stats.dinilai} icon={CheckCircle2} />
                                </div>
                            </div>
                        </div>
                    </PremiumCard>

                    {/* Action Bar */}
                    <PremiumCard className="p-3 sm:p-4" delay={70}>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <Link
                                href={safeRoute('guru.tugas.index')}
                                className="inline-flex min-h-10 w-fit items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Kembali ke Manajemen Tugas
                            </Link>

                            <div className="flex flex-wrap gap-2">
                                <StatusTugasBadge status={tugas.status} />
                                <TipeTugasBadge tipe={tugas.tipe_tugas} />
                                <DeadlineBadge value={tugas.tenggat_waktu} />
                            </div>
                        </div>
                    </PremiumCard>

                    {/* Detail Tugas */}
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                        <div className="space-y-5 lg:col-span-2">
                            <PremiumCard className="overflow-hidden" delay={100}>
                                <div className="border-b border-slate-100 p-4 sm:p-5">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                                            <ClipboardList className="h-5 w-5" />
                                        </div>

                                        <div>
                                            <h2 className="text-base font-black text-slate-900">
                                                Informasi Tugas
                                            </h2>

                                            <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                                                Ringkasan instruksi, deskripsi, dan lampiran tugas.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 p-4 sm:p-5">
                                    <div>
                                        <h3 className="text-lg font-black leading-tight text-slate-900">
                                            {tugas.judul_tugas}
                                        </h3>

                                        <div className="mt-2 flex flex-wrap gap-2">
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-black text-violet-700">
                                                <GraduationCap className="h-4 w-4" />
                                                {kelasName}
                                            </span>

                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700">
                                                <BookOpen className="h-4 w-4" />
                                                {mapelName}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="min-h-[180px] rounded-3xl border border-slate-100 bg-slate-50/70 p-4">
                                        <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-400">
                                            <MessageSquareText className="h-4 w-4" />
                                            Deskripsi / Instruksi
                                        </div>

                                        <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-slate-700">
                                            {tugas.deskripsi || 'Tidak ada deskripsi.'}
                                        </p>
                                    </div>

                                    {tugas.file_tugas && (
                                        <div className="rounded-3xl border border-indigo-100 bg-indigo-50/70 p-4">
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
                                                        <Paperclip className="h-5 w-5" />
                                                    </div>

                                                    <div>
                                                        <p className="text-sm font-black text-slate-900">
                                                            Lampiran Tugas
                                                        </p>

                                                        <p className="mt-1 text-xs font-medium text-slate-500">
                                                            File pendukung tugas tersedia untuk dilihat atau diunduh.
                                                        </p>
                                                    </div>
                                                </div>

                                                <a
                                                    href={`/storage-public/${tugas.file_tugas}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-xs font-black text-white shadow-lg shadow-indigo-200 transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105"
                                                >
                                                    <Download className="h-4 w-4" />
                                                    Download / Lihat
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </PremiumCard>
                        </div>

                        <div className="space-y-5 lg:col-span-1">
                            <PremiumCard className="p-4 sm:p-5" delay={120}>
                                <div className="space-y-3">
                                    <InfoBox
                                        label="Tenggat Waktu"
                                        value={formatDateTime(tugas.tenggat_waktu)}
                                        icon={CalendarDays}
                                        tone={isOverdue(tugas.tenggat_waktu) ? 'rose' : 'indigo'}
                                    />

                                    <InfoBox
                                        label="Tipe Tugas"
                                        value={tugas.tipe_tugas || 'Upload'}
                                        icon={tugas.tipe_tugas === 'Pemberitahuan' ? Info : UploadCloud}
                                        tone="sky"
                                    />

                                    <InfoBox
                                        label="Status Tugas"
                                        value={tugas.status || '-'}
                                        icon={ShieldCheck}
                                        tone="emerald"
                                    />
                                </div>
                            </PremiumCard>

                            <PremiumCard className="p-4 sm:p-5" delay={160}>
                                <div className="flex items-start gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                                        <Info className="h-5 w-5" />
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-black text-slate-900">
                                            Catatan Penilaian
                                        </h3>

                                        <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                                            Gunakan tombol berikan nilai pada daftar siswa untuk menilai jawaban, memberi catatan, atau mengubah nilai yang sudah tersimpan.
                                        </p>
                                    </div>
                                </div>
                            </PremiumCard>
                        </div>
                    </div>

                    {/* Penilaian */}
                    <PremiumCard className="overflow-hidden" delay={180}>
                        <div className="border-b border-slate-100 p-4 sm:p-5">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                                        <Users className="h-5 w-5" />
                                    </div>

                                    <div>
                                        <h2 className="text-base font-black text-slate-900">
                                            Daftar Pengumpulan Siswa
                                        </h2>

                                        <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                                            Pantau status pengumpulan, jawaban, dan nilai siswa.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <PengumpulanBadge status="Belum Mengumpulkan" tipeTugas={tugas.tipe_tugas} />
                                    <PengumpulanBadge status="Menunggu Penilaian" tipeTugas={tugas.tipe_tugas} />
                                    <PengumpulanBadge status="Dinilai" tipeTugas={tugas.tipe_tugas} />
                                </div>
                            </div>
                        </div>

                        {hasilPengumpulan.length > 0 ? (
                            <>
                                {/* Mobile Card */}
                                <div className="grid grid-cols-1 gap-3 p-4 lg:hidden">
                                    {hasilPengumpulan.map((item, index) => (
                                        <StudentCard
                                            key={item.id_siswa}
                                            item={item}
                                            tugas={tugas}
                                            onGrade={openGradeModal}
                                            delay={index * 30}
                                        />
                                    ))}
                                </div>

                                {/* Desktop Table */}
                                <div className="hidden overflow-x-auto lg:block">
                                    <table className="min-w-full text-left text-sm">
                                        <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
                                            <tr>
                                                <th className="px-5 py-4 font-black">Siswa</th>
                                                <th className="px-5 py-4 font-black">Status</th>
                                                <th className="px-5 py-4 font-black">Waktu Kumpul</th>
                                                <th className="px-5 py-4 font-black">Jawaban</th>
                                                <th className="px-5 py-4 font-black">Nilai</th>
                                                <th className="px-5 py-4 text-right font-black">Aksi</th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-slate-100 bg-white">
                                            {hasilPengumpulan.map((item) => (
                                                <tr
                                                    key={item.id_siswa}
                                                    className="transition hover:bg-indigo-50/35"
                                                >
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                                                                <UserCircle className="h-7 w-7" />
                                                            </div>

                                                            <div className="min-w-0">
                                                                <p className="font-black text-slate-900" style={clampStyle(1)}>
                                                                    {item.nama_lengkap}
                                                                </p>

                                                                <p className="mt-0.5 text-xs font-semibold text-slate-400">
                                                                    NISN: {item.nisn || '-'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="whitespace-nowrap px-5 py-4">
                                                        <PengumpulanBadge status={item.status_pengumpulan} tipeTugas={tugas.tipe_tugas} />
                                                    </td>

                                                    <td className="whitespace-nowrap px-5 py-4">
                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-black text-sky-700">
                                                            <Clock className="h-3.5 w-3.5" />
                                                            {item.waktu_pengumpulan ? formatDateTime(item.waktu_pengumpulan, false) : '-'}
                                                        </span>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        {item.file_jawaban ? (
                                                            <a
                                                                href={`/storage-public/${item.file_jawaban}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-black text-indigo-700 transition hover:bg-indigo-100"
                                                            >
                                                                <Eye className="h-3.5 w-3.5" />
                                                                Lihat File
                                                            </a>
                                                        ) : item.teks_jawaban ? (
                                                            <span
                                                                className="inline-block max-w-[220px] truncate font-medium text-slate-600"
                                                                title={item.teks_jawaban}
                                                            >
                                                                {item.teks_jawaban}
                                                            </span>
                                                        ) : (
                                                            <span className="font-semibold text-slate-400">-</span>
                                                        )}
                                                    </td>

                                                    <td className="whitespace-nowrap px-5 py-4">
                                                        <span className={cn('inline-flex min-w-12 items-center justify-center rounded-full border px-2.5 py-1 text-xs font-black', getScoreTone(item.nilai))}>
                                                            {item.nilai !== null ? item.nilai : '-'}
                                                        </span>
                                                    </td>

                                                    <td className="whitespace-nowrap px-5 py-4 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() => openGradeModal(item)}
                                                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl bg-indigo-50 px-3.5 py-2 text-xs font-black text-indigo-700 transition hover:bg-indigo-100"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                            {item.status_pengumpulan === 'Dinilai' ? 'Ubah Nilai' : 'Berikan Nilai'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        ) : (
                            <div className="px-4 py-14 text-center">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 text-slate-300">
                                    <Users className="h-8 w-8" />
                                </div>

                                <h3 className="mt-4 text-base font-black text-slate-700">
                                    Tidak ada siswa di kelas ini
                                </h3>

                                <p className="mt-2 text-sm text-slate-500">
                                    Data pengumpulan belum tersedia.
                                </p>
                            </div>
                        )}
                    </PremiumCard>
                </div>
            </div>

            {/* Modal Penilaian */}
            {selectedSiswa && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm sm:p-4">
                    <div className="animate-modal-pop max-h-[92vh] w-full max-w-xl overflow-hidden rounded-3xl border border-white/70 bg-white shadow-2xl">
                        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-700 via-violet-700 to-sky-700 p-5 text-white">
                            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/15 blur-2xl" />

                            <div className="relative flex items-start justify-between gap-4">
                                <div>
                                    <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-indigo-50 backdrop-blur-md">
                                        <Star className="h-3.5 w-3.5" />
                                        Penilaian
                                    </div>

                                    <h3 className="mt-2 text-lg font-black leading-tight">
                                        {selectedSiswa.nama_lengkap}
                                    </h3>

                                    <p className="mt-1 text-xs font-medium text-white/75">
                                        Isi nilai dan catatan guru untuk jawaban siswa.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeGradeModal}
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white transition hover:bg-white/20"
                                    aria-label="Tutup"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={submitGrade} className="custom-scrollbar max-h-[calc(92vh-96px)] overflow-y-auto p-5">
                            <div className="space-y-4">
                                {selectedSiswa.teks_jawaban && (
                                    <div className="max-h-52 overflow-y-auto rounded-3xl border border-slate-100 bg-slate-50/80 p-4 text-sm">
                                        <span className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-400">
                                            Teks Jawaban
                                        </span>

                                        <p className="whitespace-pre-wrap font-medium leading-relaxed text-slate-700">
                                            {selectedSiswa.teks_jawaban}
                                        </p>
                                    </div>
                                )}

                                {selectedSiswa.file_jawaban && (
                                    <div className="rounded-3xl border border-indigo-100 bg-indigo-50/80 p-4">
                                        <a
                                            href={`/storage-public/${selectedSiswa.file_jawaban}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-2 text-sm font-black text-indigo-700 hover:underline"
                                        >
                                            <FileText className="h-4 w-4" />
                                            Lihat File Jawaban
                                        </a>
                                    </div>
                                )}

                                <div>
                                    <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
                                        Nilai (0-100)
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={data.nilai}
                                        onChange={(event) => setData('nilai', event.target.value)}
                                        className={cn(
                                            'min-h-11 w-full rounded-2xl border bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none transition',
                                            errors.nilai
                                                ? 'border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-200'
                                                : 'border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200'
                                        )}
                                        required
                                    />

                                    {errors.nilai && (
                                        <p className="mt-1.5 text-xs font-semibold text-rose-600">
                                            {errors.nilai}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
                                        Catatan Guru
                                    </label>

                                    <textarea
                                        rows="4"
                                        value={data.catatan_guru}
                                        onChange={(event) => setData('catatan_guru', event.target.value)}
                                        placeholder="Tulis catatan, masukan, atau feedback untuk siswa..."
                                        className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                                    />
                                </div>
                            </div>

                            <div className="mt-5 flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={closeGradeModal}
                                    className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                                >
                                    Batal
                                </button>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-indigo-200 transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {processing ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4" />
                                    )}
                                    {processing ? 'Menyimpan...' : 'Simpan Nilai'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(148, 163, 184, 0.55) transparent;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.45);
          border-radius: 999px;
        }

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

        @keyframes modalPop {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-soft-rise {
          animation: softRise 520ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .animate-modal-pop {
          animation: modalPop 260ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
      `}</style>
        </GuruLayout>
    );
}