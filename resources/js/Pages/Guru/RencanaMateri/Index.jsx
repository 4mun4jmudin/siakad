// resources/js/Pages/Guru/RencanaMateri/Index.jsx
import React, { useMemo, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import GuruLayout from '@/Layouts/GuruLayout';
import {
    Plus,
    Edit,
    Trash2,
    Sparkles,
    BookOpen,
    ClipboardList,
    Layers,
    GraduationCap,
    Search,
    Filter,
    FileText,
    X,
    Save,
    Loader2,
    AlertTriangle,
    CheckCircle2,
    CalendarDays,
    Target,
    RefreshCw,
    BookMarked,
    Hash,
    School,
    Info,
} from 'lucide-react';
import Modal from '@/Components/Modal';

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

function EmptyState({ onCreate }) {
    return (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-14 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-slate-300 shadow-sm">
                <BookMarked className="h-8 w-8" />
            </div>

            <h3 className="mt-4 text-base font-black text-slate-700">
                Belum ada rencana materi
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
                Tambahkan target materi atau silabus supaya pembelajaran lebih terarah per mata pelajaran dan pertemuan.
            </p>

            <button
                type="button"
                onClick={onCreate}
                className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-indigo-200 transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105"
            >
                <Plus className="h-4 w-4" />
                Tambah Rencana Materi
            </button>
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
    placeholder,
    type = 'text',
    min,
    required = false,
}) {
    return (
        <div>
            <FormLabel htmlFor={id}>{label}</FormLabel>

            <input
                id={id}
                type={type}
                min={min}
                required={required}
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

function SelectField({ id, label, value, onChange, error, children, required = false }) {
    return (
        <div>
            <FormLabel htmlFor={id}>{label}</FormLabel>

            <select
                id={id}
                required={required}
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
                rows={4}
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

function MateriBadge({ icon: Icon, children, tone = 'indigo' }) {
    const map = {
        indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        sky: 'bg-sky-50 text-sky-700 border-sky-200',
        violet: 'bg-violet-50 text-violet-700 border-violet-200',
        slate: 'bg-slate-50 text-slate-600 border-slate-200',
        emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide',
                map[tone] || map.indigo
            )}
        >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {children}
        </span>
    );
}

function MateriCard({ materi, onEdit, onDelete, delay = 0 }) {
    const mapelName = materi.mata_pelajaran?.nama_mapel || 'Mata Pelajaran';
    const tingkat = materi.tingkat_kelas || '-';
    const pertemuan = materi.pertemuan_ke || '-';

    return (
        <PremiumCard className="group overflow-hidden p-0" delay={delay}>
            <div className="relative p-4">
                <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-indigo-100/70 blur-2xl transition-all duration-500 group-hover:scale-125" />

                <div className="relative flex items-start gap-3">
                    <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200">
                        <BookOpen className="h-6 w-6" />
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                                <p
                                    className="text-base font-black leading-snug text-slate-900"
                                    style={clampStyle(2)}
                                    title={materi.judul_materi}
                                >
                                    {materi.judul_materi || 'Judul Materi'}
                                </p>

                                <p
                                    className="mt-1 text-xs font-bold text-indigo-600"
                                    style={clampStyle(1)}
                                    title={mapelName}
                                >
                                    {mapelName}
                                </p>
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => onEdit(materi)}
                                    className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 transition hover:bg-indigo-100"
                                    title="Edit"
                                >
                                    <Edit className="h-4 w-4" />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => onDelete(materi)}
                                    className="flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-50 text-rose-700 transition hover:bg-rose-100"
                                    title="Hapus"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                            <MateriBadge icon={School} tone="sky">
                                Tingkat {tingkat}
                            </MateriBadge>

                            <MateriBadge icon={Hash} tone="violet">
                                Pertemuan {pertemuan}
                            </MateriBadge>
                        </div>

                        {materi.deskripsi && (
                            <div className="mt-3 rounded-2xl bg-slate-50/80 px-3 py-2 text-sm font-medium leading-relaxed text-slate-600">
                                <p style={clampStyle(3)}>
                                    {materi.deskripsi}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PremiumCard>
    );
}

export default function Index({
    auth,
    rencanaMateri = [],
    mapels = [],
    flash = {},
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);

    const [search, setSearch] = useState('');
    const [filterMapel, setFilterMapel] = useState('Semua');
    const [filterTingkat, setFilterTingkat] = useState('Semua');

    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm({
        id_mapel: '',
        tingkat_kelas: '',
        judul_materi: '',
        deskripsi: '',
        pertemuan_ke: '',
    });

    const materiList = Array.isArray(rencanaMateri)
        ? rencanaMateri
        : rencanaMateri?.data || [];

    const tingkatOptions = useMemo(() => {
        const values = materiList
            .map((item) => item.tingkat_kelas)
            .filter(Boolean);

        return [...new Set(values)];
    }, [materiList]);

    const filteredMateri = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return materiList.filter((materi) => {
            const mapelName = materi.mata_pelajaran?.nama_mapel || '';
            const matchKeyword =
                !keyword ||
                mapelName.toLowerCase().includes(keyword) ||
                String(materi.judul_materi || '').toLowerCase().includes(keyword) ||
                String(materi.deskripsi || '').toLowerCase().includes(keyword) ||
                String(materi.tingkat_kelas || '').toLowerCase().includes(keyword) ||
                String(materi.pertemuan_ke || '').toLowerCase().includes(keyword);

            const matchMapel =
                filterMapel === 'Semua' ||
                String(materi.id_mapel) === String(filterMapel);

            const matchTingkat =
                filterTingkat === 'Semua' ||
                String(materi.tingkat_kelas || '') === String(filterTingkat);

            return matchKeyword && matchMapel && matchTingkat;
        });
    }, [materiList, search, filterMapel, filterTingkat]);

    const totalMateri = materiList.length;
    const totalMapelDipakai = useMemo(() => {
        const ids = materiList.map((item) => item.id_mapel).filter(Boolean);
        return new Set(ids).size;
    }, [materiList]);

    const totalPertemuan = useMemo(() => {
        return materiList.reduce((total, item) => {
            const value = Number(item.pertemuan_ke) || 0;
            return Math.max(total, value);
        }, 0);
    }, [materiList]);

    const openCreateModal = () => {
        reset();
        clearErrors();
        setEditingId(null);
        setIsModalOpen(true);
    };

    const openEditModal = (materi) => {
        reset();
        clearErrors();

        setData({
            id_mapel: materi.id_mapel,
            tingkat_kelas: materi.tingkat_kelas || '',
            judul_materi: materi.judul_materi || '',
            deskripsi: materi.deskripsi || '',
            pertemuan_ke: materi.pertemuan_ke || '',
        });

        setEditingId(materi.id_rencana);
        setIsModalOpen(true);
    };

    const openDeleteModal = (materi) => {
        setItemToDelete(materi);
        setIsDeleteModalOpen(true);
    };

    const closeModals = () => {
        setIsModalOpen(false);
        setIsDeleteModalOpen(false);
        setEditingId(null);
        setItemToDelete(null);
        reset();
        clearErrors();
    };

    const resetFilters = () => {
        setSearch('');
        setFilterMapel('Semua');
        setFilterTingkat('Semua');
    };

    const submitForm = (event) => {
        event.preventDefault();

        if (editingId) {
            put(safeRoute('guru.rencana-materi.update', editingId), {
                preserveScroll: true,
                onSuccess: () => closeModals(),
            });
        } else {
            post(safeRoute('guru.rencana-materi.store'), {
                preserveScroll: true,
                onSuccess: () => closeModals(),
            });
        }
    };

    const submitDelete = (event) => {
        event.preventDefault();

        if (!itemToDelete) return;

        destroy(safeRoute('guru.rencana-materi.destroy', itemToDelete.id_rencana), {
            preserveScroll: true,
            onSuccess: () => closeModals(),
        });
    };

    return (
        <GuruLayout header="Rencana Materi / Silabus">
            <Head title="Rencana Materi" />

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
                                        Modul Guru
                                    </div>

                                    <h1 className="mt-3 text-xl font-black leading-tight tracking-tight sm:text-2xl lg:text-3xl">
                                        Rencana Materi / Silabus
                                    </h1>

                                    <p className="mt-2 max-w-3xl text-sm font-medium leading-relaxed text-white/80">
                                        Kelola target materi pembelajaran per mata pelajaran, tingkat kelas, dan pertemuan supaya proses mengajar lebih tertata.
                                    </p>

                                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-white/90">
                                        <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                                            {totalMateri} Rencana Materi
                                        </span>

                                        <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                                            {totalMapelDipakai} Mata Pelajaran
                                        </span>

                                        <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                                            Pertemuan tertinggi: {totalPertemuan || '-'}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:min-w-[430px]">
                                    <StatMiniCard label="Materi" value={totalMateri} icon={BookMarked} />
                                    <StatMiniCard label="Mapel" value={totalMapelDipakai} icon={BookOpen} />
                                    <StatMiniCard label="Pertemuan" value={totalPertemuan || 0} icon={CalendarDays} />
                                </div>
                            </div>
                        </div>
                    </PremiumCard>

                    {/* Flash */}
                    {flash?.success && (
                        <PremiumCard className="border-emerald-200 bg-emerald-50/90 p-4" delay={60}>
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
                                    <CheckCircle2 className="h-5 w-5" />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-sm font-black text-emerald-800">
                                        Berhasil
                                    </p>

                                    <p className="mt-0.5 text-xs font-semibold leading-relaxed text-emerald-700">
                                        {flash.success}
                                    </p>
                                </div>
                            </div>
                        </PremiumCard>
                    )}

                    {/* Action + Filter */}
                    <PremiumCard className="p-4 sm:p-5" delay={100}>
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                            <div className="flex items-start gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                                    <Filter className="h-5 w-5" />
                                </div>

                                <div>
                                    <h2 className="text-base font-black text-slate-900">
                                        Daftar Rencana Materi
                                    </h2>

                                    <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                                        Cari, filter, tambah, edit, atau hapus rencana materi pembelajaran.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={openCreateModal}
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-indigo-200 transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105"
                            >
                                <Plus className="h-4 w-4" />
                                Tambah Rencana Materi
                            </button>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-12">
                            <div className="lg:col-span-5">
                                <label htmlFor="search" className="sr-only">
                                    Cari materi
                                </label>

                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                    <input
                                        id="search"
                                        type="search"
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        placeholder="Cari judul, mapel, deskripsi, kelas..."
                                        className="min-h-11 w-full rounded-2xl border border-slate-200 bg-white/90 py-2 pl-10 pr-3 text-sm font-semibold text-slate-700 shadow-sm outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                                    />
                                </div>
                            </div>

                            <div className="lg:col-span-3">
                                <select
                                    value={filterMapel}
                                    onChange={(event) => setFilterMapel(event.target.value)}
                                    className="min-h-11 w-full rounded-2xl border border-slate-200 bg-white/90 px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                                >
                                    <option value="Semua">Semua Mata Pelajaran</option>
                                    {mapels.map((mapel) => (
                                        <option key={mapel.id_mapel} value={mapel.id_mapel}>
                                            {mapel.nama_mapel}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="lg:col-span-2">
                                <select
                                    value={filterTingkat}
                                    onChange={(event) => setFilterTingkat(event.target.value)}
                                    className="min-h-11 w-full rounded-2xl border border-slate-200 bg-white/90 px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                                >
                                    <option value="Semua">Semua Tingkat</option>
                                    {tingkatOptions.map((tingkat) => (
                                        <option key={tingkat} value={tingkat}>
                                            Tingkat {tingkat}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="lg:col-span-2">
                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-black text-slate-600 transition hover:bg-slate-50"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Reset
                                </button>
                            </div>
                        </div>
                    </PremiumCard>

                    {/* Content */}
                    <PremiumCard className="p-4 sm:p-5" delay={140}>
                        <div className="mb-4 flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-indigo-700">
                                    <ClipboardList className="h-3.5 w-3.5" />
                                    Rencana Pembelajaran
                                </div>

                                <h3 className="mt-2 text-lg font-black text-slate-900">
                                    Materi Tersimpan
                                </h3>

                                <p className="mt-1 text-xs font-medium text-slate-500">
                                    Menampilkan {filteredMateri.length} dari {totalMateri} rencana materi.
                                </p>
                            </div>

                            <MateriBadge icon={Target} tone="emerald">
                                Target Materi
                            </MateriBadge>
                        </div>

                        {filteredMateri.length > 0 ? (
                            <>
                                {/* Mobile / Card View */}
                                <div className="grid grid-cols-1 gap-3 lg:hidden">
                                    {filteredMateri.map((materi, index) => (
                                        <MateriCard
                                            key={materi.id_rencana}
                                            materi={materi}
                                            onEdit={openEditModal}
                                            onDelete={openDeleteModal}
                                            delay={index * 35}
                                        />
                                    ))}
                                </div>

                                {/* Desktop Table View */}
                                <div className="hidden overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm lg:block">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full text-left text-sm">
                                            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
                                                <tr>
                                                    <th className="px-5 py-4 font-black">Mata Pelajaran</th>
                                                    <th className="px-5 py-4 font-black">Kelas / Pertemuan</th>
                                                    <th className="px-5 py-4 font-black">Judul Materi</th>
                                                    <th className="px-5 py-4 text-right font-black">Aksi</th>
                                                </tr>
                                            </thead>

                                            <tbody className="divide-y divide-slate-100 bg-white">
                                                {filteredMateri.map((materi) => (
                                                    <tr
                                                        key={materi.id_rencana}
                                                        className="transition hover:bg-indigo-50/35"
                                                    >
                                                        <td className="px-5 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                                                                    <BookOpen className="h-5 w-5" />
                                                                </div>

                                                                <div className="min-w-0">
                                                                    <p className="font-black text-slate-900" style={clampStyle(1)}>
                                                                        {materi.mata_pelajaran?.nama_mapel || '-'}
                                                                    </p>

                                                                    <p className="mt-0.5 text-xs font-semibold text-slate-400">
                                                                        ID Mapel: {materi.id_mapel || '-'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td className="px-5 py-4">
                                                            <div className="flex flex-wrap gap-2">
                                                                <MateriBadge icon={School} tone="sky">
                                                                    {materi.tingkat_kelas || '-'}
                                                                </MateriBadge>

                                                                <MateriBadge icon={Hash} tone="violet">
                                                                    Ke-{materi.pertemuan_ke || '-'}
                                                                </MateriBadge>
                                                            </div>
                                                        </td>

                                                        <td className="px-5 py-4">
                                                            <p className="font-black text-slate-900" style={clampStyle(2)}>
                                                                {materi.judul_materi}
                                                            </p>

                                                            {materi.deskripsi && (
                                                                <p className="mt-1 max-w-xl text-xs font-medium leading-relaxed text-slate-500" style={clampStyle(2)}>
                                                                    {materi.deskripsi}
                                                                </p>
                                                            )}
                                                        </td>

                                                        <td className="px-5 py-4">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openEditModal(materi)}
                                                                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 transition hover:bg-indigo-100"
                                                                    title="Edit"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => openDeleteModal(materi)}
                                                                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-700 transition hover:bg-rose-100"
                                                                    title="Hapus"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <EmptyState onCreate={openCreateModal} />
                        )}
                    </PremiumCard>
                </div>
            </div>

            {/* Modal Form */}
            <Modal show={isModalOpen} onClose={closeModals}>
                <form onSubmit={submitForm} className="overflow-hidden rounded-3xl bg-white">
                    <div className="relative overflow-hidden bg-gradient-to-r from-indigo-700 via-violet-700 to-sky-700 p-5 text-white">
                        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/15 blur-2xl" />

                        <div className="relative flex items-start justify-between gap-4">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-indigo-50 backdrop-blur-md">
                                    <BookOpen className="h-3.5 w-3.5" />
                                    {editingId ? 'Edit Materi' : 'Tambah Materi'}
                                </div>

                                <h2 className="mt-2 text-lg font-black leading-tight">
                                    {editingId ? 'Edit Rencana Materi' : 'Tambah Rencana Materi'}
                                </h2>

                                <p className="mt-1 text-xs font-medium text-white/75">
                                    Lengkapi data materi, kelas, dan pertemuan pembelajaran.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeModals}
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white transition hover:bg-white/20"
                                aria-label="Tutup"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    <div className="max-h-[72vh] overflow-y-auto p-5 custom-scrollbar">
                        <div className="space-y-4">
                            {!editingId && (
                                <SelectField
                                    id="id_mapel"
                                    label="Mata Pelajaran"
                                    value={data.id_mapel}
                                    onChange={(event) => setData('id_mapel', event.target.value)}
                                    error={errors.id_mapel}
                                    required
                                >
                                    <option value="">-- Pilih Mata Pelajaran --</option>
                                    {mapels.map((mapel) => (
                                        <option key={mapel.id_mapel} value={mapel.id_mapel}>
                                            {mapel.nama_mapel}
                                        </option>
                                    ))}
                                </SelectField>
                            )}

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <TextField
                                    id="tingkat_kelas"
                                    label="Tingkat Kelas"
                                    value={data.tingkat_kelas}
                                    onChange={(event) => setData('tingkat_kelas', event.target.value)}
                                    error={errors.tingkat_kelas}
                                    placeholder="Misal: X, XI, XII"
                                />

                                <TextField
                                    id="pertemuan_ke"
                                    label="Pertemuan Ke"
                                    type="number"
                                    min="1"
                                    value={data.pertemuan_ke}
                                    onChange={(event) => setData('pertemuan_ke', event.target.value)}
                                    error={errors.pertemuan_ke}
                                    placeholder="Misal: 1"
                                />
                            </div>

                            <TextField
                                id="judul_materi"
                                label="Judul Materi / Topik"
                                value={data.judul_materi}
                                onChange={(event) => setData('judul_materi', event.target.value)}
                                error={errors.judul_materi}
                                placeholder="Contoh: Pengantar Algoritma"
                                required
                            />

                            <TextAreaField
                                id="deskripsi"
                                label="Deskripsi / Sub Topik"
                                value={data.deskripsi}
                                onChange={(event) => setData('deskripsi', event.target.value)}
                                error={errors.deskripsi}
                                placeholder="Tuliskan ringkasan materi, sub topik, atau target pembelajaran..."
                            />

                            <div className="rounded-3xl border border-slate-100 bg-slate-50/80 p-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
                                        <Info className="h-5 w-5" />
                                    </div>

                                    <div>
                                        <p className="text-sm font-black text-slate-900">
                                            Tips pengisian
                                        </p>

                                        <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                                            Isi judul materi dengan singkat dan jelas. Deskripsi bisa berisi subtopik, target kompetensi, atau catatan pembelajaran.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={closeModals}
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
                            {processing ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Hapus */}
            <Modal show={isDeleteModalOpen} onClose={closeModals}>
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
                                    Apakah Anda yakin?
                                </h2>

                                <p className="mt-1 text-xs font-medium text-white/75">
                                    Data yang dihapus tidak dapat dikembalikan.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeModals}
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
                                Data rencana materi{' '}
                                <strong>{itemToDelete?.judul_materi}</strong>{' '}
                                akan dihapus permanen.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={closeModals}
                            className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                        >
                            Batal
                        </button>

                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-rose-200 transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {processing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Trash2 className="h-4 w-4" />
                            )}
                            {processing ? 'Menghapus...' : 'Ya, Hapus'}
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