// resources/js/Pages/Siswa/Tugas/Show.jsx

import React, { useMemo } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import SiswaLayout from '@/Layouts/SiswaLayout';
import InputError from '@/Components/InputError';
import {
    AlertTriangle,
    ArrowLeft,
    Bell,
    CalendarDays,
    CheckCircle2,
    ClipboardList,
    Clock3,
    Download,
    FileCheck2,
    FileText,
    GraduationCap,
    Loader2,
    MessageSquareText,
    Paperclip,
    Send,
    Sparkles,
    Timer,
    UploadCloud,
    UserRound,
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

function fileUrl(path) {
    if (!path) return '#';

    const value = String(path).trim();

    if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')) {
        return value;
    }

    return `/storage-public/${value.replace(/^\/+/, '')}`;
}

function formatDateTime(value) {
    if (!value) return '-';

    try {
        return new Date(value).toLocaleString('id-ID', {
            day: 'numeric',
            month: 'long',
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

function getMapelName(tugas = {}) {
    return (
        tugas?.jadwal_mengajar?.mata_pelajaran?.nama_mapel ||
        tugas?.mata_pelajaran?.nama_mapel ||
        tugas?.nama_mapel ||
        'Mata Pelajaran'
    );
}

function getGuruName(tugas = {}) {
    return (
        tugas?.jadwal_mengajar?.guru?.nama_lengkap ||
        tugas?.guru?.nama_lengkap ||
        tugas?.nama_guru ||
        'Guru'
    );
}

function getStatusMeta({ tugas = {}, pengumpulan = null }) {
    const pastDue = isPastDeadline(tugas?.tenggat_waktu);

    if (pengumpulan) {
        if (pengumpulan.status_pengumpulan === 'Dinilai') {
            return {
                key: 'Dinilai',
                label: 'Sudah Dinilai',
                description: 'Jawaban sudah dinilai oleh guru dan tidak bisa diubah.',
                tone: 'emerald',
                icon: CheckCircle2,
            };
        }

        if (pengumpulan.status_pengumpulan === 'Selesai') {
            return {
                key: 'Selesai',
                label: 'Selesai',
                description: 'Tugas pemberitahuan sudah dikonfirmasi selesai.',
                tone: 'emerald',
                icon: CheckCircle2,
            };
        }

        return {
            key: 'Menunggu',
            label: 'Menunggu Penilaian',
            description: pastDue
                ? 'Jawaban sudah dikumpulkan dan tenggat sudah berakhir.'
                : 'Jawaban sudah dikumpulkan dan masih menunggu penilaian guru.',
            tone: 'amber',
            icon: Clock3,
        };
    }

    if (pastDue) {
        return {
            key: 'Terlambat',
            label: 'Ditutup / Terlambat',
            description: 'Waktu pengumpulan sudah berakhir.',
            tone: 'rose',
            icon: XCircle,
        };
    }

    return {
        key: 'Belum',
        label: 'Belum Mengumpulkan',
        description: 'Tugas masih bisa dikerjakan dan dikumpulkan.',
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

function StatusBadge({ meta }) {
    const tones = {
        emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        amber: 'border-amber-200 bg-amber-50 text-amber-700',
        rose: 'border-rose-200 bg-rose-50 text-rose-700',
        sky: 'border-sky-200 bg-sky-50 text-sky-700',
        slate: 'border-slate-200 bg-slate-50 text-slate-600',
    };

    const Icon = meta.icon || FileText;

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wide',
                tones[meta.tone] || tones.slate
            )}
        >
            <Icon className="h-3.5 w-3.5" />
            {meta.label}
        </span>
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

            <p className="mt-2 text-xl font-black leading-none text-white">
                {value}
            </p>

            <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-white/80">
                {label}
            </p>
        </div>
    );
}

function InfoBox({ label, value, icon: Icon, tone = 'cyan' }) {
    const tones = {
        cyan: 'bg-cyan-50 text-cyan-700 border-cyan-100',
        sky: 'bg-sky-50 text-sky-700 border-sky-100',
        emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        amber: 'bg-amber-50 text-amber-700 border-amber-100',
        rose: 'bg-rose-50 text-rose-700 border-rose-100',
        slate: 'bg-slate-50 text-slate-700 border-slate-100',
    };

    return (
        <div className="rounded-3xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="flex items-start gap-3">
                <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border', tones[tone] || tones.cyan)}>
                    <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                    <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                        {label}
                    </p>

                    <div className="mt-1 text-sm font-black leading-relaxed text-slate-900">
                        {value}
                    </div>
                </div>
            </div>
        </div>
    );
}

function FileButton({ href, children, tone = 'cyan' }) {
    const tones = {
        cyan: 'border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100',
        emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
        slate: 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
    };

    return (
        <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className={cn(
                'inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-black transition',
                tones[tone] || tones.cyan
            )}
        >
            <Download className="h-4 w-4" />
            {children}
        </a>
    );
}

function AlertBox({ tone = 'sky', icon: Icon, title, children }) {
    const tones = {
        sky: 'border-sky-100 bg-sky-50 text-sky-700',
        amber: 'border-amber-100 bg-amber-50 text-amber-700',
        emerald: 'border-emerald-100 bg-emerald-50 text-emerald-700',
        rose: 'border-rose-100 bg-rose-50 text-rose-700',
    };

    return (
        <div className={cn('rounded-3xl border p-5', tones[tone] || tones.sky)}>
            <div className="flex items-start gap-3">
                {Icon && <Icon className="mt-0.5 h-6 w-6 shrink-0" />}

                <div>
                    <h4 className="font-black">
                        {title}
                    </h4>

                    <div className="mt-1 text-sm font-semibold leading-relaxed">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ActionButton({ children, disabled, type = 'button', tone = 'cyan' }) {
    const tones = {
        cyan: 'from-cyan-500 to-blue-600 shadow-cyan-500/20',
        emerald: 'from-emerald-500 to-teal-600 shadow-emerald-500/20',
    };

    return (
        <button
            type={type}
            disabled={disabled}
            className={cn(
                'inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r px-5 py-2.5 text-sm font-black text-white shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-60',
                tones[tone] || tones.cyan
            )}
        >
            {children}
        </button>
    );
}

function BackButton() {
    return (
        <Link
            href={safeRoute('siswa.tugas.index')}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
        >
            <ArrowLeft className="h-4 w-4" />
            Kembali
        </Link>
    );
}

function ReadOnlySubmission({ pengumpulan, tugas }) {
    return (
        <div className="space-y-4">
            {pengumpulan?.catatan_guru && (
                <AlertBox tone="sky" icon={MessageSquareText} title="Catatan dari Guru">
                    <p className="whitespace-pre-wrap">
                        {pengumpulan.catatan_guru}
                    </p>
                </AlertBox>
            )}

            {tugas.tipe_tugas === 'Pemberitahuan' ? (
                <AlertBox tone="emerald" icon={CheckCircle2} title="Tugas Telah Dikonfirmasi Selesai">
                    {pengumpulan?.waktu_pengumpulan ? (
                        <span>
                            Dikonfirmasi pada: {formatDateTime(pengumpulan.waktu_pengumpulan)}
                        </span>
                    ) : (
                        <span>Anda sudah menandai pemberitahuan ini sebagai selesai.</span>
                    )}
                </AlertBox>
            ) : (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {pengumpulan?.teks_jawaban && (
                        <div>
                            <h4 className="mb-2 text-sm font-black text-slate-700">
                                Teks Jawaban Anda
                            </h4>

                            <div className="max-h-72 overflow-y-auto rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium leading-relaxed text-slate-700">
                                <p className="whitespace-pre-wrap">
                                    {pengumpulan.teks_jawaban}
                                </p>
                            </div>
                        </div>
                    )}

                    {pengumpulan?.file_jawaban && (
                        <div>
                            <h4 className="mb-2 text-sm font-black text-slate-700">
                                File Jawaban Anda
                            </h4>

                            <FileButton href={fileUrl(pengumpulan.file_jawaban)} tone="slate">
                                Lihat File yang Dikumpulkan
                            </FileButton>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function Show({
    auth,
    tugas = {},
    pengumpulan = null,
}) {
    const pastDue = isPastDeadline(tugas.tenggat_waktu);
    const canSubmit = !pastDue && (!pengumpulan || pengumpulan.status_pengumpulan !== 'Dinilai');

    const statusMeta = useMemo(() => getStatusMeta({ tugas, pengumpulan }), [tugas, pengumpulan]);
    const StatusIcon = statusMeta.icon || FileText;

    const { data, setData, post, processing, errors } = useForm({
        teks_jawaban: pengumpulan ? (pengumpulan.teks_jawaban || '') : '',
        file_jawaban: null,
    });

    const submit = (event) => {
        event.preventDefault();

        post(safeRoute('siswa.tugas.kumpulkan', tugas.id_tugas), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const mapelName = getMapelName(tugas);
    const guruName = getGuruName(tugas);
    const isPemberitahuan = tugas.tipe_tugas === 'Pemberitahuan';
    const sudahDinilai = pengumpulan?.status_pengumpulan === 'Dinilai';
    const sudahSelesaiPemberitahuan =
        isPemberitahuan &&
        pengumpulan &&
        ['Selesai', 'Menunggu Penilaian', 'Dinilai'].includes(pengumpulan.status_pengumpulan);

    return (
        <SiswaLayout
            user={auth?.user}
            header="Detail Tugas"
            subtitle="Baca instruksi, unggah jawaban, dan pantau penilaian guru."
            className="bg-slate-50 font-sans"
        >
            <Head title="Detail Tugas" />

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
                                    Assignment Detail
                                </div>

                                <h1
                                    className="mt-3 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl"
                                    style={clampStyle(2)}
                                >
                                    {tugas.judul_tugas || 'Detail Tugas'}
                                </h1>

                                <p className="mt-2 max-w-3xl text-sm font-semibold leading-relaxed text-white/80">
                                    Baca instruksi dari guru, cek lampiran, lalu kumpulkan jawaban sebelum tenggat waktu.
                                </p>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white">
                                        <GraduationCap className="h-3.5 w-3.5" />
                                        {mapelName}
                                    </span>

                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white">
                                        <UserRound className="h-3.5 w-3.5" />
                                        {guruName}
                                    </span>

                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white">
                                        {isPemberitahuan ? <Bell className="h-3.5 w-3.5" /> : <UploadCloud className="h-3.5 w-3.5" />}
                                        {isPemberitahuan ? 'Pemberitahuan' : 'Upload Tugas'}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 xl:min-w-[520px]">
                                <HeroStat label="Status" value={statusMeta.label} icon={StatusIcon} tone={statusMeta.tone === 'rose' ? 'rose' : statusMeta.tone === 'emerald' ? 'emerald' : 'cyan'} />
                                <HeroStat label="Tenggat" value={pastDue ? 'Ditutup' : 'Aktif'} icon={Timer} tone={pastDue ? 'rose' : 'cyan'} />
                                <HeroStat label="Nilai" value={pengumpulan?.nilai ?? '-'} icon={FileCheck2} tone={pengumpulan?.nilai ? 'emerald' : 'sky'} />
                            </div>
                        </div>
                    </section>

                    {/* Back */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <BackButton />
                        <StatusBadge meta={statusMeta} />
                    </div>

                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                        {/* Detail */}
                        <section className="space-y-6 xl:col-span-8">
                            <PremiumCard className="overflow-hidden p-0" delay={0}>
                                <div className="border-b border-slate-100 p-5 sm:p-6">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                                            <ClipboardList className="h-6 w-6" />
                                        </div>

                                        <div className="min-w-0">
                                            <h2 className="text-lg font-black text-slate-900">
                                                Informasi Tugas
                                            </h2>

                                            <p className="mt-1 text-sm font-medium text-slate-500">
                                                Detail instruksi dan lampiran yang diberikan guru.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-5 p-5 sm:p-6">
                                    <div>
                                        <p className="mb-2 text-sm font-black text-slate-700">
                                            Instruksi / Deskripsi
                                        </p>

                                        <div className="rounded-3xl border border-slate-100 bg-slate-50/80 p-5 text-sm font-medium leading-relaxed text-slate-700">
                                            {tugas.deskripsi ? (
                                                <p className="whitespace-pre-wrap">
                                                    {tugas.deskripsi}
                                                </p>
                                            ) : (
                                                <p className="italic text-slate-400">
                                                    Tidak ada instruksi tambahan.
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {tugas.file_tugas && (
                                        <div>
                                            <p className="mb-2 text-sm font-black text-slate-700">
                                                Lampiran File dari Guru
                                            </p>

                                            <FileButton href={fileUrl(tugas.file_tugas)}>
                                                Download Materi / Soal
                                            </FileButton>
                                        </div>
                                    )}
                                </div>
                            </PremiumCard>

                            {/* Form / Submission */}
                            <PremiumCard className="overflow-hidden p-0" delay={80}>
                                <div className="border-b border-slate-100 p-5 sm:p-6">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                                            <Send className="h-6 w-6" />
                                        </div>

                                        <div className="min-w-0">
                                            <h2 className="text-lg font-black text-slate-900">
                                                {isPemberitahuan ? 'Konfirmasi Penyelesaian' : 'Pengumpulan Jawaban'}
                                            </h2>

                                            <p className="mt-1 text-sm font-medium text-slate-500">
                                                {isPemberitahuan
                                                    ? 'Tandai tugas informasi ini sebagai selesai setelah dibaca.'
                                                    : 'Isi teks jawaban atau unggah file sesuai instruksi guru.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5 sm:p-6">
                                    {sudahDinilai ? (
                                        <ReadOnlySubmission pengumpulan={pengumpulan} tugas={tugas} />
                                    ) : pastDue && !pengumpulan ? (
                                        <AlertBox tone="rose" icon={XCircle} title="Waktu Pengumpulan Telah Ditutup">
                                            Anda belum mengumpulkan tugas ini sampai batas waktu berakhir.
                                        </AlertBox>
                                    ) : sudahSelesaiPemberitahuan ? (
                                        <AlertBox tone="emerald" icon={CheckCircle2} title="Tugas Telah Dikonfirmasi Selesai">
                                            {pengumpulan?.waktu_pengumpulan ? (
                                                <span>
                                                    Dikonfirmasi pada: {formatDateTime(pengumpulan.waktu_pengumpulan)}
                                                </span>
                                            ) : (
                                                <span>Anda telah membaca dan menyelesaikan tugas pemberitahuan ini.</span>
                                            )}
                                        </AlertBox>
                                    ) : isPemberitahuan ? (
                                        <div className="space-y-5">
                                            <AlertBox tone="amber" icon={Bell} title="Tugas Tipe Pemberitahuan / Informasi">
                                                Tugas ini tidak memerlukan upload berkas atau teks jawaban.
                                                Pelajari instruksi di atas, lalu klik tombol konfirmasi selesai.
                                            </AlertBox>

                                            <form onSubmit={submit} className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                                                <BackButton />

                                                <ActionButton type="submit" disabled={processing || !canSubmit} tone="emerald">
                                                    {processing ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                                                    {processing ? 'Memproses...' : 'Tandai Selesai'}
                                                </ActionButton>
                                            </form>
                                        </div>
                                    ) : (
                                        <form onSubmit={submit} className="space-y-6">
                                            {pengumpulan?.status_pengumpulan === 'Menunggu Penilaian' && (
                                                <AlertBox tone="sky" icon={Clock3} title="Jawaban Sudah Dikirim">
                                                    Anda masih dapat memperbarui jawaban sebelum dinilai atau sebelum batas waktu berakhir.
                                                </AlertBox>
                                            )}

                                            {pastDue && pengumpulan && (
                                                <AlertBox tone="amber" icon={AlertTriangle} title="Tenggat Sudah Berakhir">
                                                    Jawaban yang sudah dikumpulkan tidak dapat diperbarui karena tenggat waktu telah selesai.
                                                </AlertBox>
                                            )}

                                            <div>
                                                <label className="mb-2 block text-sm font-black text-slate-700">
                                                    Teks Jawaban
                                                </label>

                                                <textarea
                                                    value={data.teks_jawaban}
                                                    onChange={(event) => setData('teks_jawaban', event.target.value)}
                                                    className="min-h-44 w-full rounded-3xl border border-slate-200 bg-white/90 p-4 text-sm font-medium leading-relaxed text-slate-700 shadow-sm outline-none placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200 disabled:bg-slate-50"
                                                    placeholder="Ketik jawaban Anda di sini jika diminta menjawab dengan teks..."
                                                    disabled={!canSubmit}
                                                />

                                                <InputError message={errors.teks_jawaban} className="mt-2" />
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-black text-slate-700">
                                                    Upload File Jawaban
                                                </label>

                                                {pengumpulan?.file_jawaban && (
                                                    <div className="mb-3">
                                                        <FileButton href={fileUrl(pengumpulan.file_jawaban)} tone="slate">
                                                            File Saat Ini
                                                        </FileButton>
                                                    </div>
                                                )}

                                                <label
                                                    className={cn(
                                                        'flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/80 p-6 text-center transition hover:border-cyan-300 hover:bg-cyan-50/40',
                                                        !canSubmit && 'cursor-not-allowed opacity-60'
                                                    )}
                                                >
                                                    <UploadCloud className="h-10 w-10 text-cyan-600" />

                                                    <p className="mt-3 text-sm font-black text-slate-800">
                                                        {data.file_jawaban ? data.file_jawaban.name : 'Klik untuk memilih file jawaban'}
                                                    </p>

                                                    <p className="mt-1 text-xs font-semibold text-slate-500">
                                                        PDF, Word, JPG, ZIP maksimal 10MB
                                                    </p>

                                                    <input
                                                        type="file"
                                                        onChange={(event) => setData('file_jawaban', event.target.files[0])}
                                                        className="hidden"
                                                        disabled={!canSubmit}
                                                    />
                                                </label>

                                                <p className="mt-2 text-xs font-medium text-slate-500">
                                                    Jika upload file baru, file lama akan tergantikan.
                                                </p>

                                                <InputError message={errors.file_jawaban} className="mt-2" />
                                            </div>

                                            <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                                                <BackButton />

                                                <ActionButton type="submit" disabled={processing || !canSubmit}>
                                                    {processing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                                                    {processing ? 'Mengirim...' : 'Kumpulkan Jawaban'}
                                                </ActionButton>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </PremiumCard>
                        </section>

                        {/* Sidebar */}
                        <aside className="space-y-6 xl:col-span-4">
                            <PremiumCard className="p-5" delay={120}>
                                <div className="flex items-start gap-3">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                                        <StatusIcon className="h-6 w-6" />
                                    </div>

                                    <div>
                                        <h3 className="text-base font-black text-slate-900">
                                            Status Tugas
                                        </h3>

                                        <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-500">
                                            {statusMeta.description}
                                        </p>

                                        <div className="mt-3">
                                            <StatusBadge meta={statusMeta} />
                                        </div>
                                    </div>
                                </div>
                            </PremiumCard>

                            <div className="grid grid-cols-1 gap-3">
                                <InfoBox
                                    label="Mata Pelajaran"
                                    value={mapelName}
                                    icon={GraduationCap}
                                    tone="cyan"
                                />

                                <InfoBox
                                    label="Guru Pengampu"
                                    value={guruName}
                                    icon={UserRound}
                                    tone="sky"
                                />

                                <InfoBox
                                    label="Tenggat Waktu"
                                    value={
                                        <span className={pastDue ? 'text-rose-600' : 'text-slate-900'}>
                                            {formatDateTime(tugas.tenggat_waktu)}
                                        </span>
                                    }
                                    icon={CalendarDays}
                                    tone={pastDue ? 'rose' : 'amber'}
                                />

                                <InfoBox
                                    label="Tipe Tugas"
                                    value={isPemberitahuan ? 'Pemberitahuan / Informasi' : 'Upload Tugas'}
                                    icon={isPemberitahuan ? Bell : Paperclip}
                                    tone={isPemberitahuan ? 'amber' : 'emerald'}
                                />

                                {pengumpulan?.status_pengumpulan === 'Dinilai' && (
                                    <InfoBox
                                        label="Nilai"
                                        value={<span className="text-2xl text-emerald-600">{pengumpulan.nilai ?? '-'}</span>}
                                        icon={FileCheck2}
                                        tone="emerald"
                                    />
                                )}
                            </div>
                        </aside>
                    </div>
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