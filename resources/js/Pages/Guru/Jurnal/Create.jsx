// File: resources/js/Pages/Guru/Jurnal/Create.jsx

import React, { useEffect, useMemo, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import GuruLayout from '@/Layouts/GuruLayout';
import {
    AlertTriangle,
    Info,
    Sparkles,
    BookOpen,
    CalendarDays,
    Clock,
    Save,
    Loader2,
    ArrowLeft,
    ClipboardList,
    GraduationCap,
    ShieldCheck,
    UserCheck,
    Layers,
    Target,
    CheckCircle2,
    FileText,
    BookMarked,
    Send,
} from 'lucide-react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

function safeRoute(name, params = {}, fallback = '#') {
    try {
        return route(name, params);
    } catch {
        return fallback;
    }
}

const todayString = () => new Date().toISOString().slice(0, 10);

const fmtTime = (value) => (value ? String(value).substring(0, 5) : '—');

const clampStyle = (lines = 1) => ({
    display: '-webkit-box',
    WebkitLineClamp: lines,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    wordBreak: 'break-word',
});

function getMapelName(jadwal) {
    return jadwal?.mata_pelajaran?.nama_mapel || jadwal?.mapel?.nama_mapel || '—';
}

function getKelasName(jadwal) {
    const kelas = jadwal?.kelas;

    if (!kelas) return '—';
    if (typeof kelas === 'string') return kelas;

    return [kelas?.tingkat, kelas?.jurusan].filter(Boolean).join(' ') || '—';
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

function FormLabel({ htmlFor, children }) {
    return (
        <label
            htmlFor={htmlFor}
            className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500"
        >
            {children}
        </label>
    );
}

function FormError({ message }) {
    if (!message) return null;

    return (
        <div className="mt-1.5 text-xs font-semibold text-rose-600">
            {message}
        </div>
    );
}

function TextField({
    id,
    label,
    value,
    onChange,
    error,
    type = 'text',
    disabled = false,
    placeholder,
}) {
    return (
        <div>
            <FormLabel htmlFor={id}>{label}</FormLabel>

            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                disabled={disabled}
                placeholder={placeholder}
                className={cn(
                    'min-h-11 w-full rounded-2xl border bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none transition',
                    'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400',
                    error
                        ? 'border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-200'
                        : 'border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200'
                )}
            />

            <FormError message={error} />
        </div>
    );
}

function SelectField({
    id,
    label,
    value,
    onChange,
    error,
    disabled = false,
    children,
}) {
    return (
        <div>
            <FormLabel htmlFor={id}>{label}</FormLabel>

            <select
                id={id}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className={cn(
                    'min-h-11 w-full rounded-2xl border bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none transition',
                    'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400',
                    error
                        ? 'border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-200'
                        : 'border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200'
                )}
            >
                {children}
            </select>

            <FormError message={error} />
        </div>
    );
}

function TextAreaField({
    id,
    label,
    value,
    onChange,
    error,
    disabled = false,
    placeholder,
}) {
    return (
        <div>
            <FormLabel htmlFor={id}>{label}</FormLabel>

            <textarea
                id={id}
                value={value}
                onChange={onChange}
                rows={5}
                disabled={disabled}
                placeholder={placeholder}
                className={cn(
                    'w-full resize-none rounded-2xl border bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none transition',
                    'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400',
                    error
                        ? 'border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-200'
                        : 'border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200'
                )}
            />

            <FormError message={error} />
        </div>
    );
}

function NoticeBox({ type = 'info', message }) {
    if (!message) return null;

    const isWarning = type === 'warning';

    return (
        <div
            className={cn(
                'rounded-3xl border p-4',
                isWarning
                    ? 'border-amber-200 bg-amber-50 text-amber-800'
                    : 'border-sky-200 bg-sky-50 text-sky-800'
            )}
        >
            <div className="flex items-start gap-3">
                <div
                    className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm',
                        isWarning ? 'text-amber-600' : 'text-sky-600'
                    )}
                >
                    {isWarning ? (
                        <AlertTriangle className="h-5 w-5" />
                    ) : (
                        <Info className="h-5 w-5" />
                    )}
                </div>

                <div className="min-w-0">
                    <h3 className="text-sm font-black">
                        {isWarning ? 'Perhatian' : 'Informasi'}
                    </h3>

                    <p className="mt-1 text-xs font-semibold leading-relaxed">
                        {message}
                    </p>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    const map = {
        Mengajar: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        Tugas: 'border-sky-200 bg-sky-50 text-sky-700',
        Digantikan: 'border-amber-200 bg-amber-50 text-amber-700',
        Kosong: 'border-rose-200 bg-rose-50 text-rose-700',
        Sakit: 'border-amber-200 bg-amber-50 text-amber-700',
        Izin: 'border-sky-200 bg-sky-50 text-sky-700',
        Alfa: 'border-rose-200 bg-rose-50 text-rose-700',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide',
                map[status] || 'border-slate-200 bg-slate-50 text-slate-600'
            )}
        >
            <ShieldCheck className="h-3.5 w-3.5" />
            {status || '-'}
        </span>
    );
}

function SelectedScheduleCard({ selectedJadwal }) {
    if (!selectedJadwal) {
        return (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 p-5 text-center">
                <CalendarDays className="mx-auto h-9 w-9 text-slate-300" />

                <p className="mt-3 text-sm font-black text-slate-500">
                    Jadwal belum dipilih
                </p>

                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                    Pilih jadwal mengajar terlebih dahulu untuk mengisi jam dan target materi.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-3xl border border-indigo-100 bg-indigo-50/60 p-4">
            <div className="flex items-start gap-3">
                <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200">
                    <span className="text-sm font-black leading-none">
                        {fmtTime(selectedJadwal.jam_mulai)}
                    </span>

                    <span className="mt-0.5 text-[9px] font-bold text-white/75">
                        {fmtTime(selectedJadwal.jam_selesai)}
                    </span>
                </div>

                <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-slate-900" style={clampStyle(2)}>
                        {getMapelName(selectedJadwal)}
                    </p>

                    <p className="mt-1 text-xs font-bold text-slate-500">
                        Kelas {getKelasName(selectedJadwal)}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-indigo-700">
                            <Clock className="h-3.5 w-3.5" />
                            {fmtTime(selectedJadwal.jam_mulai)} - {fmtTime(selectedJadwal.jam_selesai)}
                        </span>

                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-sky-700">
                            <GraduationCap className="h-3.5 w-3.5" />
                            Jadwal Terpilih
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Create({
    auth,
    jadwalOptions = [],
    absensiHariIni = null,
    rencanaMateriOptions = [],
}) {
    const {
        data,
        setData,
        post,
        processing,
        errors,
    } = useForm({
        id_jadwal: '',
        tanggal: todayString(),
        jam_masuk_kelas: '',
        jam_keluar_kelas: '',
        status_mengajar: 'Mengajar',
        materi_pembahasan: '',
        id_rencana_materi: '',
    });

    const [isFormDisabled, setIsFormDisabled] = useState(false);
    const [infoMessage, setInfoMessage] = useState('');
    const [messageType, setMessageType] = useState('info');

    const selectedJadwal = useMemo(() => {
        return jadwalOptions.find(
            (jadwal) => String(jadwal.id_jadwal) === String(data.id_jadwal)
        );
    }, [jadwalOptions, data.id_jadwal]);

    const filteredRencanaMateri = useMemo(() => {
        if (!selectedJadwal) return [];

        return rencanaMateriOptions.filter(
            (item) => String(item.id_mapel) === String(selectedJadwal.id_mapel)
        );
    }, [rencanaMateriOptions, selectedJadwal]);

    const isToday = data.tanggal === todayString();

    useEffect(() => {
        const currentIsToday = data.tanggal === todayString();

        if (currentIsToday) {
            if (!absensiHariIni) {
                setIsFormDisabled(true);
                setInfoMessage('Anda harus melakukan absensi terlebih dahulu sebelum dapat mengisi jurnal untuk hari ini.');
                setMessageType('warning');
            } else {
                const statusAbsen = absensiHariIni.status_kehadiran;

                if (statusAbsen === 'Sakit' || statusAbsen === 'Izin' || statusAbsen === 'Alfa') {
                    setData((prevData) => ({
                        ...prevData,
                        status_mengajar: statusAbsen,
                        materi_pembahasan: `Guru tidak dapat mengajar karena ${statusAbsen.toLowerCase()}. Keterangan: ${absensiHariIni.keterangan || 'Tidak ada keterangan.'}`,
                    }));

                    setIsFormDisabled(true);
                    setInfoMessage(`Status kehadiran Anda hari ini adalah "${statusAbsen}", Anda tidak dapat mengisi jurnal mengajar.`);
                    setMessageType('warning');
                } else {
                    setIsFormDisabled(false);
                    setInfoMessage('');
                    setMessageType('info');
                }
            }
        } else {
            setIsFormDisabled(false);
            setInfoMessage('Anda sedang mengisi jurnal untuk tanggal yang lalu. Pastikan data yang diinput sudah benar.');
            setMessageType('info');
        }
    }, [data.tanggal, absensiHariIni]);

    useEffect(() => {
        if (selectedJadwal) {
            setData((prevData) => ({
                ...prevData,
                jam_masuk_kelas: fmtTime(selectedJadwal.jam_mulai) === '—' ? '' : fmtTime(selectedJadwal.jam_mulai),
                jam_keluar_kelas: fmtTime(selectedJadwal.jam_selesai) === '—' ? '' : fmtTime(selectedJadwal.jam_selesai),
                id_rencana_materi: '',
            }));
        }
    }, [selectedJadwal]);

    const submit = (event) => {
        event.preventDefault();
        post(safeRoute('guru.jurnal.store'), {
            preserveScroll: true,
        });
    };

    const handleRencanaChange = (event) => {
        const value = event.target.value;
        const selected = rencanaMateriOptions.find(
            (item) => String(item.id_rencana) === String(value)
        );

        setData((prevData) => ({
            ...prevData,
            id_rencana_materi: value,
            materi_pembahasan:
                selected && !prevData.materi_pembahasan
                    ? selected.judul_materi + (selected.deskripsi ? ` - ${selected.deskripsi}` : '')
                    : prevData.materi_pembahasan,
        }));
    };

    const canSubmit = !processing && !isFormDisabled;

    return (
        <GuruLayout header="Input Jurnal Mengajar">
            <Head title="Input Jurnal" />

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
                                        Jurnal Mengajar
                                    </div>

                                    <h1 className="mt-3 text-xl font-black leading-tight tracking-tight sm:text-2xl lg:text-3xl">
                                        Input Jurnal Mengajar
                                    </h1>

                                    <p className="mt-2 max-w-3xl text-sm font-medium leading-relaxed text-white/80">
                                        Catat aktivitas pembelajaran, jam masuk-keluar kelas, status mengajar, dan materi pembahasan sesuai jadwal guru.
                                    </p>

                                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-white/90">
                                        <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                                            Tanggal: {data.tanggal || '-'}
                                        </span>

                                        <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                                            Jadwal tersedia: {jadwalOptions.length}
                                        </span>

                                        <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                                            Target materi: {rencanaMateriOptions.length}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:min-w-[430px]">
                                    <StatMiniCard label="Jadwal" value={jadwalOptions.length} icon={CalendarDays} />
                                    <StatMiniCard label="Target" value={rencanaMateriOptions.length} icon={Target} />
                                    <StatMiniCard label="Status" value={isToday ? 'Hari Ini' : 'Lampau'} icon={UserCheck} />
                                </div>
                            </div>
                        </div>
                    </PremiumCard>

                    {infoMessage && (
                        <NoticeBox type={messageType} message={infoMessage} />
                    )}

                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                        {/* Sidebar Info */}
                        <div className="space-y-5 lg:col-span-1">
                            <PremiumCard className="p-4 sm:p-5" delay={80}>
                                <div className="flex items-start gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                                        <CalendarDays className="h-5 w-5" />
                                    </div>

                                    <div className="min-w-0">
                                        <h2 className="text-base font-black text-slate-900">
                                            Jadwal Terpilih
                                        </h2>

                                        <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                                            Jam masuk dan keluar akan otomatis mengikuti jadwal yang dipilih.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <SelectedScheduleCard selectedJadwal={selectedJadwal} />
                                </div>
                            </PremiumCard>

                            <PremiumCard className="p-4 sm:p-5" delay={120}>
                                <div className="flex items-start gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                                        <BookMarked className="h-5 w-5" />
                                    </div>

                                    <div className="min-w-0">
                                        <h2 className="text-base font-black text-slate-900">
                                            Target Rencana Materi
                                        </h2>

                                        <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                                            Setelah jadwal dipilih, daftar target materi akan difilter sesuai mata pelajaran.
                                        </p>

                                        <div className="mt-3 rounded-2xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-500">
                                            Tersedia untuk jadwal ini:{' '}
                                            <span className="text-indigo-700">
                                                {filteredRencanaMateri.length}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </PremiumCard>

                            <PremiumCard className="p-4 sm:p-5" delay={160}>
                                <div className="flex items-start gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                        <CheckCircle2 className="h-5 w-5" />
                                    </div>

                                    <div className="min-w-0">
                                        <h2 className="text-base font-black text-slate-900">
                                            Alur Pengisian
                                        </h2>

                                        <div className="mt-3 space-y-2 text-xs font-semibold text-slate-500">
                                            <div className="flex gap-2">
                                                <span className="font-black text-indigo-600">1.</span>
                                                Pilih tanggal dan jadwal.
                                            </div>
                                            <div className="flex gap-2">
                                                <span className="font-black text-indigo-600">2.</span>
                                                Cek jam masuk dan keluar.
                                            </div>
                                            <div className="flex gap-2">
                                                <span className="font-black text-indigo-600">3.</span>
                                                Isi status dan materi pembahasan.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </PremiumCard>
                        </div>

                        {/* Form */}
                        <div className="lg:col-span-2">
                            <PremiumCard className="overflow-hidden" delay={100}>
                                <div className="border-b border-slate-100 p-4 sm:p-5">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                                                <ClipboardList className="h-5 w-5" />
                                            </div>

                                            <div>
                                                <h2 className="text-base font-black text-slate-900">
                                                    Formulir Jurnal
                                                </h2>

                                                <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                                                    Lengkapi data jurnal sesuai aktivitas mengajar.
                                                </p>
                                            </div>
                                        </div>

                                        <StatusBadge status={data.status_mengajar} />
                                    </div>
                                </div>

                                <form onSubmit={submit} className="space-y-5 p-4 sm:p-5">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="md:col-span-2">
                                            <SelectField
                                                id="id_jadwal"
                                                label="Pilih Jadwal Mengajar"
                                                value={data.id_jadwal}
                                                onChange={(event) => setData('id_jadwal', event.target.value)}
                                                error={errors.id_jadwal}
                                                disabled={isFormDisabled}
                                            >
                                                <option value="">--- Pilih Jadwal ---</option>

                                                {jadwalOptions.map((jadwal) => (
                                                    <option key={jadwal.id_jadwal} value={jadwal.id_jadwal}>
                                                        {jadwal.hari}, {fmtTime(jadwal.jam_mulai)} - {getMapelName(jadwal)} ({getKelasName(jadwal)})
                                                    </option>
                                                ))}
                                            </SelectField>
                                        </div>

                                        <TextField
                                            id="tanggal"
                                            type="date"
                                            label="Tanggal Mengajar"
                                            value={data.tanggal}
                                            onChange={(event) => setData('tanggal', event.target.value)}
                                            error={errors.tanggal}
                                        />

                                        <SelectField
                                            id="status_mengajar"
                                            label="Status Mengajar"
                                            value={data.status_mengajar}
                                            onChange={(event) => setData('status_mengajar', event.target.value)}
                                            error={errors.status_mengajar}
                                            disabled={isFormDisabled}
                                        >
                                            <option value="Mengajar">Mengajar</option>
                                            <option value="Tugas">Memberi Tugas</option>
                                            <option value="Digantikan">Digantikan</option>
                                            <option value="Kosong">Kelas Kosong</option>
                                            <option value="Sakit">Sakit</option>
                                            <option value="Izin">Izin</option>
                                            <option value="Alfa">Alfa</option>
                                        </SelectField>

                                        <TextField
                                            id="jam_masuk_kelas"
                                            type="time"
                                            label="Jam Masuk Aktual"
                                            value={data.jam_masuk_kelas}
                                            onChange={(event) => setData('jam_masuk_kelas', event.target.value)}
                                            error={errors.jam_masuk_kelas}
                                            disabled={isFormDisabled}
                                        />

                                        <TextField
                                            id="jam_keluar_kelas"
                                            type="time"
                                            label="Jam Keluar Aktual"
                                            value={data.jam_keluar_kelas}
                                            onChange={(event) => setData('jam_keluar_kelas', event.target.value)}
                                            error={errors.jam_keluar_kelas}
                                            disabled={isFormDisabled}
                                        />

                                        <div className="md:col-span-2">
                                            <SelectField
                                                id="id_rencana_materi"
                                                label="Pilih Target Rencana Materi"
                                                value={data.id_rencana_materi}
                                                onChange={handleRencanaChange}
                                                error={errors.id_rencana_materi}
                                                disabled={isFormDisabled || !data.id_jadwal}
                                            >
                                                <option value="">
                                                    --- Bukan Bagian dari Target Materi / Isi Manual ---
                                                </option>

                                                {filteredRencanaMateri.map((materi) => (
                                                    <option key={materi.id_rencana} value={materi.id_rencana}>
                                                        Pertemuan {materi.pertemuan_ke || '-'}: {materi.judul_materi}
                                                    </option>
                                                ))}
                                            </SelectField>
                                        </div>

                                        <div className="md:col-span-2">
                                            <TextAreaField
                                                id="materi_pembahasan"
                                                label="Materi Pembahasan"
                                                value={data.materi_pembahasan}
                                                onChange={(event) => setData('materi_pembahasan', event.target.value)}
                                                error={errors.materi_pembahasan}
                                                disabled={isFormDisabled}
                                                placeholder="Tuliskan materi pembahasan, aktivitas kelas, atau catatan pembelajaran..."
                                            />
                                        </div>
                                    </div>

                                    <div className="rounded-3xl border border-slate-100 bg-slate-50/70 p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
                                                <Info className="h-5 w-5" />
                                            </div>

                                            <div>
                                                <p className="text-sm font-black text-slate-900">
                                                    Catatan
                                                </p>

                                                <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                                                    Untuk tanggal hari ini, sistem mengecek absensi guru terlebih dahulu. Jika belum absen atau status tidak hadir, form jurnal tidak bisa dikirim.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-end">
                                        <Link
                                            href={safeRoute('guru.jurnal.index')}
                                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                                        >
                                            <ArrowLeft className="h-4 w-4" />
                                            Batal
                                        </Link>

                                        <button
                                            type="submit"
                                            disabled={!canSubmit}
                                            className={cn(
                                                'inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-black transition-all duration-300',
                                                !canSubmit
                                                    ? 'cursor-not-allowed bg-slate-200 text-slate-500'
                                                    : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200 hover:-translate-y-0.5 hover:brightness-105'
                                            )}
                                        >
                                            {processing ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            {processing ? 'Menyimpan...' : 'Simpan Jurnal'}
                                        </button>
                                    </div>
                                </form>
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
      `}</style>
        </GuruLayout>
    );
}