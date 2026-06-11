// File: resources/js/Pages/Guru/Tugas/Index.jsx

import React, { useEffect, useMemo, useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import GuruLayout from '@/Layouts/GuruLayout';
import {
    ClipboardList,
    Plus,
    Pencil,
    Trash2,
    Search,
    Eye,
    Sparkles,
    GraduationCap,
    Users,
    FileText,
    Filter,
    RefreshCw,
    AlertTriangle,
    X,
    Loader2,
    CheckCircle2,
    Clock,
    Layers,
    Send,
    Archive,
    UploadCloud,
    Paperclip,
    BookOpen,
    Save,
    Info,
    Edit3,
    FileUp,
} from 'lucide-react';
import Modal from '@/Components/Modal';
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
        return route(name, params);
    } catch {
        return fallback;
    }
}

function formatLocalDateTime(value) {
    if (!value) return '';

    try {
        const date = new Date(value);
        return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
    } catch {
        return value;
    }
}

function getKelasName(item) {
    const kelas = item?.jadwal_mengajar?.kelas || item?.kelas;

    if (!kelas) return '-';
    if (typeof kelas === 'string') return kelas;

    return [kelas?.tingkat, kelas?.jurusan].filter(Boolean).join(' ') || '-';
}

function getMapelName(item) {
    return item?.jadwal_mengajar?.mata_pelajaran?.nama_mapel || item?.mata_pelajaran?.nama_mapel || '-';
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

function isOverdue(value) {
    if (!value) return false;

    try {
        return new Date(value).getTime() < Date.now();
    } catch {
        return false;
    }
}

function formatFileSize(bytes = 0) {
    if (!bytes) return '0 MB';
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function getFormData(tugas = null) {
    if (!tugas) {
        return {
            id_jadwal: '',
            judul_tugas: '',
            deskripsi: '',
            tenggat_waktu: '',
            status: 'Diterbitkan',
            file_tugas: null,
            tipe_tugas: 'Upload',
        };
    }

    return {
        _method: 'PUT',
        id_jadwal: tugas.id_jadwal || '',
        judul_tugas: tugas.judul_tugas || '',
        deskripsi: tugas.deskripsi || '',
        tenggat_waktu: formatLocalDateTime(tugas.tenggat_waktu),
        status: tugas.status || 'Diterbitkan',
        file_tugas: null,
        tipe_tugas: tugas.tipe_tugas || 'Upload',
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
                placeholder={placeholder}
                className={cn(
                    'min-h-11 w-full rounded-2xl border bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none transition',
                    error
                        ? 'border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-200'
                        : 'border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200'
                )}
            />

            <FormError message={error} />
        </div>
    );
}

function SelectField({ id, label, value, onChange, error, children }) {
    return (
        <div>
            <FormLabel htmlFor={id}>{label}</FormLabel>

            <select
                id={id}
                value={value}
                onChange={onChange}
                className={cn(
                    'min-h-11 w-full rounded-2xl border bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none transition',
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

function TextAreaField({ id, label, value, onChange, error, placeholder }) {
    return (
        <div>
            <FormLabel htmlFor={id}>{label}</FormLabel>

            <textarea
                id={id}
                rows={5}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={cn(
                    'w-full resize-none rounded-2xl border bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none transition',
                    error
                        ? 'border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-200'
                        : 'border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200'
                )}
            />

            <FormError message={error} />
        </div>
    );
}

function StatusBadge({ status }) {
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
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide',
                current.className
            )}
        >
            <Icon className="h-3.5 w-3.5" />
            {status || '-'}
        </span>
    );
}

function DeadlineBadge({ value }) {
    const overdue = isOverdue(value);

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-black',
                overdue
                    ? 'border-rose-200 bg-rose-50 text-rose-700'
                    : 'border-indigo-200 bg-indigo-50 text-indigo-700'
            )}
        >
            {overdue ? <AlertTriangle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
            {formatDateTime(value)}
        </span>
    );
}

function ActionButton({ href, onClick, icon: Icon, title, tone = 'slate' }) {
    const tones = {
        slate: 'bg-slate-50 text-slate-700 hover:bg-slate-100',
        sky: 'bg-sky-50 text-sky-700 hover:bg-sky-100',
        amber: 'bg-amber-50 text-amber-700 hover:bg-amber-100',
        rose: 'bg-rose-50 text-rose-700 hover:bg-rose-100',
    };

    const className = cn(
        'inline-flex h-10 w-10 items-center justify-center rounded-2xl transition',
        tones[tone] || tones.slate
    );

    if (href) {
        return (
            <Link href={href} className={className} title={title}>
                <Icon className="h-4 w-4" />
            </Link>
        );
    }

    return (
        <button type="button" onClick={onClick} className={className} title={title}>
            <Icon className="h-4 w-4" />
        </button>
    );
}

function EmptyState({ onCreate }) {
    return (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-14 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-slate-300 shadow-sm">
                <ClipboardList className="h-8 w-8" />
            </div>

            <h3 className="mt-4 text-base font-black text-slate-700">
                Belum ada data tugas
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
                Buat tugas baru untuk mengelola penugasan siswa berdasarkan kelas dan mata pelajaran.
            </p>

            <button
                type="button"
                onClick={onCreate}
                className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-indigo-200 transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105"
            >
                <Plus className="h-4 w-4" />
                Buat Tugas
            </button>
        </div>
    );
}

function TugasCard({ item, onEdit, onDelete, delay = 0 }) {
    const kelasName = getKelasName(item);
    const mapelName = getMapelName(item);

    return (
        <PremiumCard className="group overflow-hidden p-0" delay={delay}>
            <div className="relative p-4">
                <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-indigo-100/70 blur-2xl transition-all duration-500 group-hover:scale-125" />

                <div className="relative flex items-start gap-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200">
                        <ClipboardList className="h-6 w-6" />
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                                <p
                                    className="text-base font-black leading-snug text-slate-900"
                                    style={clampStyle(2)}
                                    title={item.judul_tugas}
                                >
                                    {item.judul_tugas || 'Judul Tugas'}
                                </p>

                                <p className="mt-1 text-xs font-bold text-indigo-600" style={clampStyle(1)}>
                                    {mapelName}
                                </p>
                            </div>

                            <StatusBadge status={item.status} />
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-violet-700">
                                <GraduationCap className="h-3.5 w-3.5" />
                                {kelasName}
                            </span>

                            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-sky-700">
                                <Users className="h-3.5 w-3.5" />
                                {item.pengumpulan_tugas_count ?? 0} Siswa
                            </span>
                        </div>

                        <div className="mt-3">
                            <DeadlineBadge value={item.tenggat_waktu} />
                        </div>

                        <div className="mt-4 flex items-center justify-end gap-2">
                            <ActionButton
                                href={safeRoute('guru.tugas.show', item.id_tugas)}
                                icon={Eye}
                                title="Lihat Detail & Penilaian"
                                tone="sky"
                            />

                            <ActionButton
                                onClick={() => onEdit(item)}
                                icon={Pencil}
                                title="Edit Tugas"
                                tone="amber"
                            />

                            <ActionButton
                                onClick={() => onDelete(item)}
                                icon={Trash2}
                                title="Hapus Tugas"
                                tone="rose"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </PremiumCard>
    );
}

function TipeTugasOption({ value, checked, onChange, title, description, icon: Icon }) {
    return (
        <label
            className={cn(
                'flex cursor-pointer items-start gap-3 rounded-3xl border p-4 transition-all duration-300',
                checked
                    ? 'border-indigo-200 bg-indigo-50/80 ring-2 ring-indigo-500/10'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
            )}
        >
            <input
                type="radio"
                name="tipe_tugas"
                value={value}
                checked={checked}
                onChange={onChange}
                className="mt-1 text-indigo-600 focus:ring-indigo-500"
            />

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
                <Icon className="h-5 w-5" />
            </div>

            <div>
                <span className="block text-sm font-black text-slate-800">
                    {title}
                </span>

                <span className="mt-0.5 block text-xs font-medium leading-relaxed text-slate-500">
                    {description}
                </span>
            </div>
        </label>
    );
}

function TugasFormModal({
    show,
    mode = 'create',
    tugas = null,
    onClose,
    jadwalOptions = [],
}) {
    const isEdit = mode === 'edit';

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm(getFormData(tugas));

    useEffect(() => {
        if (!show) return;

        clearErrors();
        setData(getFormData(isEdit ? tugas : null));
    }, [show, isEdit, tugas?.id_tugas]);

    const selectedFile = data.file_tugas;

    const close = () => {
        reset();
        clearErrors();
        onClose();
    };

    const submit = (event) => {
        event.preventDefault();

        const url = isEdit
            ? safeRoute('guru.tugas.update', tugas?.id_tugas)
            : safeRoute('guru.tugas.store');

        post(url, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => close(),
        });
    };

    return (
        <Modal show={show} onClose={close}>
            <form onSubmit={submit} className="overflow-hidden rounded-3xl bg-white">
                <div className="relative overflow-hidden bg-gradient-to-r from-indigo-700 via-violet-700 to-sky-700 p-5 text-white">
                    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/15 blur-2xl" />

                    <div className="relative flex items-start justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-indigo-50 backdrop-blur-md">
                                {isEdit ? <Edit3 className="h-3.5 w-3.5" /> : <ClipboardList className="h-3.5 w-3.5" />}
                                {isEdit ? 'Edit Tugas' : 'Buat Tugas'}
                            </div>

                            <h2 className="mt-2 text-lg font-black leading-tight">
                                {isEdit ? 'Edit Formulir Tugas' : 'Formulir Tugas Baru'}
                            </h2>

                            <p className="mt-1 text-xs font-medium text-white/75">
                                {isEdit
                                    ? 'Perbarui data tugas, deadline, status, tipe tugas, atau lampiran.'
                                    : 'Buat tugas untuk kelas dan mata pelajaran yang diampu.'}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={close}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white transition hover:bg-white/20"
                            aria-label="Tutup"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="custom-scrollbar max-h-[72vh] overflow-y-auto p-5">
                    <div className="space-y-5">
                        <SelectField
                            id="id_jadwal"
                            label="Pilih Kelas & Mata Pelajaran"
                            value={data.id_jadwal}
                            onChange={(event) => setData('id_jadwal', event.target.value)}
                            error={errors.id_jadwal}
                        >
                            <option value="">--- Pilih Kelas ---</option>

                            {jadwalOptions.map((jadwal) => (
                                <option key={jadwal.id_jadwal} value={jadwal.id_jadwal}>
                                    {getKelasName(jadwal)} - {getMapelName(jadwal)} ({jadwal.hari}, {jadwal.jam_mulai ? jadwal.jam_mulai.substring(0, 5) : ''})
                                </option>
                            ))}
                        </SelectField>

                        <TextField
                            id="judul_tugas"
                            label="Judul Tugas"
                            value={data.judul_tugas}
                            onChange={(event) => setData('judul_tugas', event.target.value)}
                            error={errors.judul_tugas}
                            placeholder="Contoh: Makalah Sejarah Kemerdekaan"
                        />

                        <TextAreaField
                            id="deskripsi"
                            label="Deskripsi / Instruksi"
                            value={data.deskripsi}
                            onChange={(event) => setData('deskripsi', event.target.value)}
                            error={errors.deskripsi}
                            placeholder="Tuliskan instruksi lengkap pengerjaan tugas di sini..."
                        />

                        <div className="rounded-3xl border border-slate-100 bg-slate-50/80 p-4">
                            <div className="mb-3 flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-indigo-600" />
                                <span className="text-sm font-black text-slate-800">
                                    Tipe Tugas
                                </span>
                            </div>

                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                <TipeTugasOption
                                    value="Upload"
                                    checked={data.tipe_tugas === 'Upload'}
                                    onChange={(event) => setData('tipe_tugas', event.target.value)}
                                    title="Upload Jawaban"
                                    description="Siswa wajib mengirimkan teks atau mengunggah berkas pengerjaan."
                                    icon={UploadCloud}
                                />

                                <TipeTugasOption
                                    value="Pemberitahuan"
                                    checked={data.tipe_tugas === 'Pemberitahuan'}
                                    onChange={(event) => setData('tipe_tugas', event.target.value)}
                                    title="Hanya Pemberitahuan"
                                    description="Siswa hanya membaca instruksi dan menandai tugas selesai."
                                    icon={Info}
                                />
                            </div>

                            <FormError message={errors.tipe_tugas} />
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <TextField
                                id="tenggat_waktu"
                                label="Tenggat Waktu"
                                type="datetime-local"
                                value={data.tenggat_waktu}
                                onChange={(event) => setData('tenggat_waktu', event.target.value)}
                                error={errors.tenggat_waktu}
                            />

                            <SelectField
                                id="status"
                                label="Status Tugas"
                                value={data.status}
                                onChange={(event) => setData('status', event.target.value)}
                                error={errors.status}
                            >
                                <option value="Diterbitkan">Terbitkan — siswa dapat melihat</option>
                                <option value="Draft">Draft — disembunyikan dari siswa</option>
                                {isEdit && <option value="Selesai">Selesai — tugas ditutup</option>}
                            </SelectField>
                        </div>

                        <div>
                            <FormLabel htmlFor="file_tugas">
                                {isEdit
                                    ? 'Upload File Lampiran Baru'
                                    : 'Upload File Lampiran'}
                            </FormLabel>

                            {isEdit && tugas?.file_tugas && (
                                <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl border border-sky-100 bg-sky-50 px-3 py-2">
                                    <div className="flex min-w-0 items-center gap-2">
                                        <FileUp className="h-4 w-4 shrink-0 text-sky-600" />

                                        <div className="min-w-0">
                                            <p className="truncate text-xs font-black text-slate-800">
                                                File saat ini tersedia
                                            </p>

                                            <a
                                                href={`/storage-public/${tugas.file_tugas}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-[11px] font-black text-sky-700 hover:underline"
                                            >
                                                Lihat file lama
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/70 p-5 text-center transition hover:border-indigo-200 hover:bg-indigo-50/30">
                                <UploadCloud className="h-9 w-9 text-indigo-500" />

                                <p className="mt-2 text-sm font-black text-slate-800">
                                    {isEdit ? 'Pilih file pengganti' : 'Pilih file lampiran'}
                                </p>

                                <p className="mt-1 text-xs font-medium text-slate-500">
                                    PDF, Word, JPG, PNG maksimal 5MB.
                                </p>

                                <input
                                    id="file_tugas"
                                    type="file"
                                    onChange={(event) => setData('file_tugas', event.target.files?.[0] || null)}
                                    className="sr-only"
                                />
                            </label>

                            {selectedFile && (
                                <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 px-3 py-2">
                                    <div className="flex min-w-0 items-center gap-2">
                                        <Paperclip className="h-4 w-4 shrink-0 text-indigo-600" />

                                        <div className="min-w-0">
                                            <p className="truncate text-xs font-black text-slate-800">
                                                {selectedFile.name}
                                            </p>

                                            <p className="text-[11px] font-semibold text-slate-500">
                                                {formatFileSize(selectedFile.size)}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setData('file_tugas', null)}
                                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-rose-600 transition hover:bg-rose-50"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            )}

                            <FormError message={errors.file_tugas} />
                        </div>

                        <div className="rounded-3xl border border-sky-100 bg-sky-50/80 p-4">
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-sky-600 shadow-sm">
                                    <Info className="h-5 w-5" />
                                </div>

                                <div>
                                    <p className="text-sm font-black text-slate-900">
                                        Catatan
                                    </p>

                                    <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                                        {isEdit
                                            ? 'Jika memilih file baru, file lama akan diganti setelah perubahan disimpan.'
                                            : 'Status Draft tidak akan terlihat oleh siswa sampai tugas diterbitkan.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={close}
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
                        {processing
                            ? isEdit ? 'Memperbarui...' : 'Menyimpan...'
                            : isEdit ? 'Simpan Perubahan' : 'Simpan Tugas'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export default function Index({
    auth,
    tugas = {},
    filters = {},
    jadwalOptions = [],
}) {
    const [search, setSearch] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState('Semua');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState('create');
    const [editingTugas, setEditingTugas] = useState(null);

    const rows = Array.isArray(tugas?.data) ? tugas.data : [];

    const filteredRows = useMemo(() => {
        if (statusFilter === 'Semua') return rows;
        return rows.filter((item) => item.status === statusFilter);
    }, [rows, statusFilter]);

    const totalRows = tugas?.total ?? rows.length;
    const totalPublished = rows.filter((item) => item.status === 'Diterbitkan').length;
    const totalDraft = rows.filter((item) => item.status === 'Draft').length;
    const totalCollected = rows.reduce((sum, item) => sum + (Number(item.pengumpulan_tugas_count) || 0), 0);

    const openCreate = () => {
        setFormMode('create');
        setEditingTugas(null);
        setFormOpen(true);
    };

    const openEdit = (item) => {
        setFormMode('edit');
        setEditingTugas(item);
        setFormOpen(true);
    };

    const closeForm = () => {
        setFormOpen(false);
        setEditingTugas(null);
        setFormMode('create');
    };

    const handleSearch = (event = null) => {
        event?.preventDefault?.();

        router.get(
            safeRoute('guru.tugas.index'),
            { search },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const resetFilters = () => {
        setSearch('');
        setStatusFilter('Semua');

        router.get(
            safeRoute('guru.tugas.index'),
            {},
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const openDelete = (item) => {
        setDeleteTarget(item);
    };

    const closeDelete = () => {
        setDeleteTarget(null);
        setDeleting(false);
    };

    const submitDelete = (event) => {
        event.preventDefault();

        if (!deleteTarget) return;

        setDeleting(true);

        router.delete(safeRoute('guru.tugas.destroy', deleteTarget.id_tugas), {
            preserveScroll: true,
            onSuccess: () => closeDelete(),
            onFinish: () => setDeleting(false),
        });
    };

    return (
        <GuruLayout header="Manajemen Tugas">
            <Head title="Manajemen Tugas" />

            <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/40 to-sky-50/60 py-5 sm:py-6">
                <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-indigo-200/35 blur-3xl" />
                <div className="pointer-events-none absolute right-0 top-40 h-80 w-80 translate-x-24 rounded-full bg-sky-200/40 blur-3xl" />
                <div className="pointer-events-none absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-violet-200/25 blur-3xl" />

                <div className="relative mx-auto max-w-7xl space-y-5 px-3 pb-12 sm:space-y-6 sm:px-6 lg:px-8">
                    <PremiumCard className="relative overflow-hidden p-0" delay={0}>
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 via-violet-700 to-sky-700" />
                        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/15 blur-2xl" />
                        <div className="absolute bottom-0 left-1/3 h-32 w-32 translate-y-10 rounded-full bg-indigo-200/20 blur-2xl" />

                        <div className="relative p-4 text-white sm:p-6 lg:p-7">
                            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                                <div className="min-w-0">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-indigo-50 backdrop-blur-md">
                                        <Sparkles className="h-3.5 w-3.5" />
                                        Modul Guru
                                    </div>

                                    <h1 className="mt-3 text-xl font-black leading-tight tracking-tight sm:text-2xl lg:text-3xl">
                                        Manajemen Tugas
                                    </h1>

                                    <p className="mt-2 max-w-3xl text-sm font-medium leading-relaxed text-white/80">
                                        Kelola penugasan siswa, pantau jumlah pengumpulan, status publikasi, dan tenggat waktu tugas.
                                    </p>

                                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-white/90">
                                        <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                                            Total: {totalRows} Tugas
                                        </span>

                                        <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                                            Diterbitkan: {totalPublished}
                                        </span>

                                        <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                                            Terkumpul: {totalCollected}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:min-w-[520px]">
                                    <StatMiniCard label="Total" value={totalRows} icon={ClipboardList} />
                                    <StatMiniCard label="Terbit" value={totalPublished} icon={Send} />
                                    <StatMiniCard label="Draft" value={totalDraft} icon={FileText} />
                                    <StatMiniCard label="Terkumpul" value={totalCollected} icon={Users} />
                                </div>
                            </div>
                        </div>
                    </PremiumCard>

                    <PremiumCard className="p-4 sm:p-5" delay={80}>
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                            <div className="flex items-start gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                                    <Filter className="h-5 w-5" />
                                </div>

                                <div>
                                    <h2 className="text-base font-black text-slate-900">
                                        Daftar Tugas
                                    </h2>

                                    <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                                        Tombol tambah dan edit sekarang memakai popup modal, tidak pindah halaman.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={openCreate}
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-indigo-200 transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105"
                            >
                                <Plus className="h-4 w-4" />
                                Buat Tugas
                            </button>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-12">
                            <form onSubmit={handleSearch} className="lg:col-span-7">
                                <label htmlFor="search" className="sr-only">
                                    Cari tugas
                                </label>

                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                    <input
                                        id="search"
                                        type="search"
                                        placeholder="Cari judul tugas..."
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        className="min-h-11 w-full rounded-2xl border border-slate-200 bg-white/90 py-2 pl-10 pr-3 text-sm font-semibold text-slate-700 shadow-sm outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                                    />
                                </div>
                            </form>

                            <div className="lg:col-span-3">
                                <select
                                    value={statusFilter}
                                    onChange={(event) => setStatusFilter(event.target.value)}
                                    className="min-h-11 w-full rounded-2xl border border-slate-200 bg-white/90 px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                                >
                                    <option value="Semua">Semua Status</option>
                                    <option value="Diterbitkan">Diterbitkan</option>
                                    <option value="Draft">Draft</option>
                                    <option value="Selesai">Selesai</option>
                                    <option value="Arsip">Arsip</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-2 lg:col-span-2">
                                <button
                                    type="button"
                                    onClick={handleSearch}
                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-indigo-50 px-3 py-2.5 text-sm font-black text-indigo-700 transition hover:bg-indigo-100"
                                >
                                    <Search className="h-4 w-4" />
                                    Cari
                                </button>

                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-black text-slate-600 transition hover:bg-slate-50"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Reset
                                </button>
                            </div>
                        </div>
                    </PremiumCard>

                    <PremiumCard className="p-4 sm:p-5" delay={120}>
                        <div className="mb-4 flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-indigo-700">
                                    <ClipboardList className="h-3.5 w-3.5" />
                                    Penugasan Siswa
                                </div>

                                <h3 className="mt-2 text-lg font-black text-slate-900">
                                    Tugas Tersimpan
                                </h3>

                                <p className="mt-1 text-xs font-medium text-slate-500">
                                    Menampilkan {filteredRows.length} data dari {rows.length} tugas pada halaman ini.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <StatusBadge status="Diterbitkan" />
                                <StatusBadge status="Draft" />
                                <StatusBadge status="Selesai" />
                            </div>
                        </div>

                        {filteredRows.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 gap-3 lg:hidden">
                                    {filteredRows.map((item, index) => (
                                        <TugasCard
                                            key={item.id_tugas}
                                            item={item}
                                            onEdit={openEdit}
                                            onDelete={openDelete}
                                            delay={index * 35}
                                        />
                                    ))}
                                </div>

                                <div className="hidden overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm lg:block">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full text-left text-sm">
                                            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
                                                <tr>
                                                    <th className="px-5 py-4 font-black">Judul Tugas</th>
                                                    <th className="px-5 py-4 font-black">Kelas & Mapel</th>
                                                    <th className="px-5 py-4 font-black">Tenggat Waktu</th>
                                                    <th className="px-5 py-4 font-black">Terkumpul</th>
                                                    <th className="px-5 py-4 font-black">Status</th>
                                                    <th className="px-5 py-4 text-right font-black">Aksi</th>
                                                </tr>
                                            </thead>

                                            <tbody className="divide-y divide-slate-100 bg-white">
                                                {filteredRows.map((item) => {
                                                    const kelasName = getKelasName(item);
                                                    const mapelName = getMapelName(item);

                                                    return (
                                                        <tr
                                                            key={item.id_tugas}
                                                            className="transition hover:bg-indigo-50/35"
                                                        >
                                                            <td className="px-5 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                                                                        <ClipboardList className="h-5 w-5" />
                                                                    </div>

                                                                    <div className="min-w-0">
                                                                        <p className="font-black text-slate-900" style={clampStyle(2)}>
                                                                            {item.judul_tugas}
                                                                        </p>

                                                                        <p className="mt-0.5 text-xs font-semibold text-slate-400">
                                                                            ID Tugas: {item.id_tugas}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            <td className="px-5 py-4">
                                                                <p className="font-black text-slate-800">
                                                                    {kelasName}
                                                                </p>

                                                                <p className="mt-0.5 text-xs font-semibold text-indigo-600" style={clampStyle(1)}>
                                                                    {mapelName}
                                                                </p>
                                                            </td>

                                                            <td className="whitespace-nowrap px-5 py-4">
                                                                <DeadlineBadge value={item.tenggat_waktu} />
                                                            </td>

                                                            <td className="whitespace-nowrap px-5 py-4">
                                                                <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-black text-sky-700">
                                                                    <Users className="h-3.5 w-3.5" />
                                                                    {item.pengumpulan_tugas_count ?? 0} Siswa
                                                                </span>
                                                            </td>

                                                            <td className="whitespace-nowrap px-5 py-4">
                                                                <StatusBadge status={item.status} />
                                                            </td>

                                                            <td className="whitespace-nowrap px-5 py-4">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <ActionButton
                                                                        href={safeRoute('guru.tugas.show', item.id_tugas)}
                                                                        icon={Eye}
                                                                        title="Lihat Detail & Penilaian"
                                                                        tone="sky"
                                                                    />

                                                                    <ActionButton
                                                                        onClick={() => openEdit(item)}
                                                                        icon={Pencil}
                                                                        title="Edit Tugas"
                                                                        tone="amber"
                                                                    />

                                                                    <ActionButton
                                                                        onClick={() => openDelete(item)}
                                                                        icon={Trash2}
                                                                        title="Hapus Tugas"
                                                                        tone="rose"
                                                                    />
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {tugas?.links && rows.length > 0 && (
                                    <div className="mt-5 border-t border-slate-100 pt-4">
                                        <Pagination links={tugas.links} />
                                    </div>
                                )}
                            </>
                        ) : (
                            <EmptyState onCreate={openCreate} />
                        )}
                    </PremiumCard>
                </div>
            </div>

            <TugasFormModal
                show={formOpen}
                mode={formMode}
                tugas={editingTugas}
                onClose={closeForm}
                jadwalOptions={jadwalOptions}
            />

            <Modal show={!!deleteTarget} onClose={closeDelete}>
                <form onSubmit={submitDelete} className="overflow-hidden rounded-3xl bg-white">
                    <div className="relative overflow-hidden bg-gradient-to-r from-rose-600 to-pink-600 p-5 text-white">
                        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/15 blur-2xl" />

                        <div className="relative flex items-start justify-between gap-4">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-rose-50 backdrop-blur-md">
                                    <AlertTriangle className="h-3.5 w-3.5" />
                                    Konfirmasi Hapus
                                </div>

                                <h2 className="mt-2 text-lg font-black leading-tight">
                                    Hapus tugas ini?
                                </h2>

                                <p className="mt-1 text-xs font-medium text-white/75">
                                    Data yang dihapus tidak dapat dikembalikan.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeDelete}
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white transition hover:bg-white/20"
                                aria-label="Tutup"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    <div className="p-5">
                        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4">
                            <p className="text-sm font-semibold leading-relaxed text-rose-800">
                                Tugas{' '}
                                <strong>{deleteTarget?.judul_tugas}</strong>{' '}
                                untuk kelas{' '}
                                <strong>{deleteTarget ? getKelasName(deleteTarget) : '-'}</strong>{' '}
                                akan dihapus permanen.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={closeDelete}
                            className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                        >
                            Batal
                        </button>

                        <button
                            type="submit"
                            disabled={deleting}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-rose-200 transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {deleting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Trash2 className="h-4 w-4" />
                            )}
                            {deleting ? 'Menghapus...' : 'Ya, Hapus Tugas'}
                        </button>
                    </div>
                </form>
            </Modal>

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

        .animate-soft-rise {
          animation: softRise 520ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
      `}</style>
        </GuruLayout>
    );
}