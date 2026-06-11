// resources/js/Pages/Guru/Jurnal/Index.jsx

import React, { useMemo, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import GuruLayout from '@/Layouts/GuruLayout';
import {
    Plus,
    Eye,
    Edit,
    Trash2,
    Sparkles,
    BookOpen,
    CalendarDays,
    Clock,
    Search,
    Filter,
    RefreshCw,
    ClipboardList,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    UserCheck,
    Layers,
    Info,
    X,
    Loader2,
    GraduationCap,
    FileText,
    ShieldCheck,
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

function fmtTime(value) {
    return value ? String(value).substring(0, 5) : '—';
}

function formatDate(value, options = {}) {
    if (!value) return '—';

    try {
        return new Date(value).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            ...options,
        });
    } catch {
        return value;
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
        icon: CheckCircle2,
        card: 'from-emerald-500 to-teal-500 shadow-emerald-200',
    },
    Tugas: {
        badge: 'border-sky-200 bg-sky-50 text-sky-700',
        icon: ClipboardList,
        card: 'from-sky-500 to-cyan-500 shadow-sky-200',
    },
    Digantikan: {
        badge: 'border-amber-200 bg-amber-50 text-amber-700',
        icon: AlertTriangle,
        card: 'from-amber-500 to-orange-500 shadow-amber-200',
    },
    Kosong: {
        badge: 'border-rose-200 bg-rose-50 text-rose-700',
        icon: XCircle,
        card: 'from-rose-500 to-pink-500 shadow-rose-200',
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
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide',
                current.badge
            )}
        >
            <Icon className="h-3.5 w-3.5" />
            {status || '-'}
        </span>
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

function Pagination({ links = [] }) {
    if (!links || links.length <= 3) return null;

    return (
        <div className="mt-5 flex flex-wrap justify-center gap-2">
            {links.map((link, key) => (
                link.url === null ? (
                    <div
                        key={key}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black text-slate-300"
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ) : (
                    <Link
                        key={key}
                        href={link.url}
                        className={cn(
                            'rounded-2xl border px-3 py-2 text-xs font-black transition',
                            link.active
                                ? 'border-indigo-500 bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200'
                                : 'border-slate-200 bg-white text-slate-600 hover:bg-indigo-50 hover:text-indigo-700'
                        )}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                )
            ))}
        </div>
    );
}

function EmptyState({ onCreate }) {
    return (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-14 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-slate-300 shadow-sm">
                <BookOpen className="h-8 w-8" />
            </div>

            <h3 className="mt-4 text-base font-black text-slate-700">
                Belum ada data jurnal
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
                Buat jurnal mengajar untuk mencatat aktivitas pembelajaran, materi, kelas, dan status mengajar.
            </p>

            <Link
                href={safeRoute('guru.jurnal.create')}
                className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-indigo-200 transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105"
            >
                <Plus className="h-4 w-4" />
                Input Jurnal Baru
            </Link>
        </div>
    );
}

function ActionButton({ href, onClick, icon: Icon, title, tone = 'slate' }) {
    const tones = {
        slate: 'bg-slate-50 text-slate-700 hover:bg-slate-100',
        indigo: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
        rose: 'bg-rose-50 text-rose-700 hover:bg-rose-100',
        sky: 'bg-sky-50 text-sky-700 hover:bg-sky-100',
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

function JurnalCard({ jurnal, onDelete, delay = 0 }) {
    const status = jurnal.status_mengajar;
    const current = statusTheme[status] || {
        card: 'from-indigo-600 to-violet-600 shadow-indigo-200',
    };

    const kelasName = getKelasName(jurnal);
    const mapelName = getMapelName(jurnal);
    const jamMasuk = fmtTime(jurnal.jam_masuk_kelas);
    const jamKeluar = fmtTime(jurnal.jam_keluar_kelas);

    return (
        <PremiumCard className="group overflow-hidden p-0" delay={delay}>
            <div className="relative p-4">
                <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-indigo-100/70 blur-2xl transition-all duration-500 group-hover:scale-125" />

                <div className="relative flex items-start gap-3">
                    <div
                        className={cn(
                            'flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-3xl bg-gradient-to-br text-white shadow-lg transition-transform duration-300 group-hover:scale-105',
                            current.card
                        )}
                    >
                        <span className="text-sm font-black leading-none">
                            {jamMasuk}
                        </span>

                        <span className="mt-0.5 text-[9px] font-bold text-white/75">
                            {jamKeluar}
                        </span>
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                                <p className="text-sm font-black leading-snug text-slate-900" style={clampStyle(2)}>
                                    {mapelName}
                                </p>

                                <p className="mt-1 text-xs font-bold text-slate-500">
                                    Kelas {kelasName}
                                </p>
                            </div>

                            <StatusBadge status={status} />
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-indigo-700">
                                <CalendarDays className="h-3.5 w-3.5" />
                                {formatDate(jurnal.tanggal)}
                            </span>

                            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-sky-700">
                                <Clock className="h-3.5 w-3.5" />
                                {jamMasuk} - {jamKeluar}
                            </span>
                        </div>

                        {jurnal.materi_pembahasan && (
                            <div className="mt-3 rounded-2xl bg-slate-50/80 px-3 py-2 text-sm font-medium leading-relaxed text-slate-600">
                                <p style={clampStyle(3)}>
                                    {jurnal.materi_pembahasan}
                                </p>
                            </div>
                        )}

                        <div className="mt-4 flex items-center justify-end gap-2">
                            <ActionButton
                                href={safeRoute('guru.jurnal.show', jurnal.id_jurnal)}
                                icon={Eye}
                                title="Lihat Detail"
                                tone="slate"
                            />

                            <ActionButton
                                href={safeRoute('guru.jurnal.edit', jurnal.id_jurnal)}
                                icon={Edit}
                                title="Edit Jurnal"
                                tone="indigo"
                            />

                            <ActionButton
                                onClick={() => onDelete(jurnal)}
                                icon={Trash2}
                                title="Hapus Jurnal"
                                tone="rose"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </PremiumCard>
    );
}

export default function Index({ auth, jurnals = {} }) {
    const { delete: destroy, processing } = useForm();

    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('Semua');

    const rows = Array.isArray(jurnals?.data) ? jurnals.data : [];

    const filteredRows = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return rows.filter((jurnal) => {
            const kelasName = getKelasName(jurnal);
            const mapelName = getMapelName(jurnal);
            const materi = jurnal?.materi_pembahasan || '';
            const tanggal = jurnal?.tanggal || '';
            const status = jurnal?.status_mengajar || '';

            const matchKeyword =
                !keyword ||
                kelasName.toLowerCase().includes(keyword) ||
                mapelName.toLowerCase().includes(keyword) ||
                materi.toLowerCase().includes(keyword) ||
                tanggal.toLowerCase().includes(keyword) ||
                status.toLowerCase().includes(keyword);

            const matchStatus = statusFilter === 'Semua' || status === statusFilter;

            return matchKeyword && matchStatus;
        });
    }, [rows, search, statusFilter]);

    const totalRows = jurnals?.total ?? rows.length;
    const totalMengajar = rows.filter((item) => item.status_mengajar === 'Mengajar').length;
    const totalTugas = rows.filter((item) => item.status_mengajar === 'Tugas').length;
    const totalDigantikan = rows.filter((item) => item.status_mengajar === 'Digantikan').length;
    const totalKosong = rows.filter((item) => item.status_mengajar === 'Kosong').length;

    const confirmDeletion = (jurnal) => {
        setItemToDelete(jurnal);
        setConfirmingDeletion(true);
    };

    const closeModal = () => {
        setConfirmingDeletion(false);
        setItemToDelete(null);
    };

    const resetFilters = () => {
        setSearch('');
        setStatusFilter('Semua');
    };

    const deleteJurnal = (event) => {
        event.preventDefault();

        if (!itemToDelete) return;

        destroy(safeRoute('guru.jurnal.destroy', itemToDelete.id_jurnal), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
        });
    };

    return (
        <GuruLayout header="Jurnal Mengajar">
            <Head title="Jurnal Mengajar" />

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
                                        Jurnal Mengajar
                                    </h1>

                                    <p className="mt-2 max-w-3xl text-sm font-medium leading-relaxed text-white/80">
                                        Catat aktivitas pembelajaran, jam masuk-keluar kelas, status mengajar, dan materi pembahasan setiap pertemuan.
                                    </p>

                                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-white/90">
                                        <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                                            Total: {totalRows} Jurnal
                                        </span>

                                        <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                                            Mengajar: {totalMengajar}
                                        </span>

                                        <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                                            Tugas: {totalTugas}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:min-w-[520px]">
                                    <StatMiniCard label="Total" value={totalRows} icon={ClipboardList} />
                                    <StatMiniCard label="Mengajar" value={totalMengajar} icon={UserCheck} />
                                    <StatMiniCard label="Tugas" value={totalTugas} icon={BookOpen} />
                                    <StatMiniCard label="Kosong" value={totalKosong} icon={AlertTriangle} />
                                </div>
                            </div>
                        </div>
                    </PremiumCard>

                    {/* Action + Filter */}
                    <PremiumCard className="p-4 sm:p-5" delay={80}>
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                            <div className="flex items-start gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                                    <Filter className="h-5 w-5" />
                                </div>

                                <div>
                                    <h2 className="text-base font-black text-slate-900">
                                        Daftar Jurnal
                                    </h2>

                                    <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                                        Cari jurnal berdasarkan tanggal, kelas, mata pelajaran, status, atau materi.
                                    </p>
                                </div>
                            </div>

                            <Link
                                href={safeRoute('guru.jurnal.create')}
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-indigo-200 transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105"
                            >
                                <Plus className="h-4 w-4" />
                                Input Jurnal Baru
                            </Link>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-12">
                            <div className="lg:col-span-7">
                                <label htmlFor="search" className="sr-only">
                                    Cari jurnal
                                </label>

                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                    <input
                                        id="search"
                                        type="search"
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        placeholder="Cari kelas, mapel, materi, status, tanggal..."
                                        className="min-h-11 w-full rounded-2xl border border-slate-200 bg-white/90 py-2 pl-10 pr-3 text-sm font-semibold text-slate-700 shadow-sm outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                                    />
                                </div>
                            </div>

                            <div className="lg:col-span-3">
                                <select
                                    value={statusFilter}
                                    onChange={(event) => setStatusFilter(event.target.value)}
                                    className="min-h-11 w-full rounded-2xl border border-slate-200 bg-white/90 px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                                >
                                    <option value="Semua">Semua Status</option>
                                    <option value="Mengajar">Mengajar</option>
                                    <option value="Tugas">Tugas</option>
                                    <option value="Digantikan">Digantikan</option>
                                    <option value="Kosong">Kosong</option>
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
                    <PremiumCard className="p-4 sm:p-5" delay={120}>
                        <div className="mb-4 flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-indigo-700">
                                    <FileText className="h-3.5 w-3.5" />
                                    Catatan Pembelajaran
                                </div>

                                <h3 className="mt-2 text-lg font-black text-slate-900">
                                    Jurnal Tersimpan
                                </h3>

                                <p className="mt-1 text-xs font-medium text-slate-500">
                                    Menampilkan {filteredRows.length} data dari {rows.length} jurnal pada halaman ini.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <StatusBadge status="Mengajar" />
                                <StatusBadge status="Tugas" />
                                <StatusBadge status="Digantikan" />
                                <StatusBadge status="Kosong" />
                            </div>
                        </div>

                        {filteredRows.length > 0 ? (
                            <>
                                {/* Mobile Card */}
                                <div className="grid grid-cols-1 gap-3 lg:hidden">
                                    {filteredRows.map((jurnal, index) => (
                                        <JurnalCard
                                            key={jurnal.id_jurnal}
                                            jurnal={jurnal}
                                            onDelete={confirmDeletion}
                                            delay={index * 35}
                                        />
                                    ))}
                                </div>

                                {/* Desktop Table */}
                                <div className="hidden overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm lg:block">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full text-left text-sm">
                                            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
                                                <tr>
                                                    <th className="px-5 py-4 font-black">Tanggal</th>
                                                    <th className="px-5 py-4 font-black">Jam</th>
                                                    <th className="px-5 py-4 font-black">Kelas</th>
                                                    <th className="px-5 py-4 font-black">Mata Pelajaran</th>
                                                    <th className="px-5 py-4 font-black">Status</th>
                                                    <th className="px-5 py-4 font-black">Materi</th>
                                                    <th className="px-5 py-4 text-right font-black">Aksi</th>
                                                </tr>
                                            </thead>

                                            <tbody className="divide-y divide-slate-100 bg-white">
                                                {filteredRows.map((jurnal) => {
                                                    const kelasName = getKelasName(jurnal);
                                                    const mapelName = getMapelName(jurnal);

                                                    return (
                                                        <tr
                                                            key={jurnal.id_jurnal}
                                                            className="transition hover:bg-indigo-50/35"
                                                        >
                                                            <td className="whitespace-nowrap px-5 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                                                                        <CalendarDays className="h-5 w-5" />
                                                                    </div>

                                                                    <div>
                                                                        <p className="font-black text-slate-900">
                                                                            {formatDate(jurnal.tanggal)}
                                                                        </p>

                                                                        <p className="mt-0.5 text-xs font-semibold text-slate-400">
                                                                            Jurnal #{jurnal.id_jurnal}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            <td className="whitespace-nowrap px-5 py-4">
                                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-black text-sky-700">
                                                                    <Clock className="h-3.5 w-3.5" />
                                                                    {fmtTime(jurnal.jam_masuk_kelas)} - {fmtTime(jurnal.jam_keluar_kelas)}
                                                                </span>
                                                            </td>

                                                            <td className="whitespace-nowrap px-5 py-4">
                                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-black text-violet-700">
                                                                    <GraduationCap className="h-3.5 w-3.5" />
                                                                    {kelasName}
                                                                </span>
                                                            </td>

                                                            <td className="px-5 py-4">
                                                                <p className="max-w-[220px] font-black text-slate-900" style={clampStyle(2)}>
                                                                    {mapelName}
                                                                </p>
                                                            </td>

                                                            <td className="whitespace-nowrap px-5 py-4">
                                                                <StatusBadge status={jurnal.status_mengajar} />
                                                            </td>

                                                            <td className="px-5 py-4">
                                                                <p className="max-w-xs text-sm font-medium leading-relaxed text-slate-600" style={clampStyle(2)}>
                                                                    {jurnal.materi_pembahasan || '-'}
                                                                </p>
                                                            </td>

                                                            <td className="whitespace-nowrap px-5 py-4">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <ActionButton
                                                                        href={safeRoute('guru.jurnal.show', jurnal.id_jurnal)}
                                                                        icon={Eye}
                                                                        title="Lihat Detail"
                                                                        tone="slate"
                                                                    />

                                                                    <ActionButton
                                                                        href={safeRoute('guru.jurnal.edit', jurnal.id_jurnal)}
                                                                        icon={Edit}
                                                                        title="Edit Jurnal"
                                                                        tone="indigo"
                                                                    />

                                                                    <ActionButton
                                                                        onClick={() => confirmDeletion(jurnal)}
                                                                        icon={Trash2}
                                                                        title="Hapus Jurnal"
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

                                <Pagination links={jurnals?.links || []} />
                            </>
                        ) : (
                            <EmptyState />
                        )}
                    </PremiumCard>
                </div>
            </div>

            {/* Modal Hapus */}
            <Modal show={confirmingDeletion} onClose={closeModal}>
                <form onSubmit={deleteJurnal} className="overflow-hidden rounded-3xl bg-white">
                    <div className="relative overflow-hidden bg-gradient-to-r from-rose-600 to-pink-600 p-5 text-white">
                        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/15 blur-2xl" />

                        <div className="relative flex items-start justify-between gap-4">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-rose-50 backdrop-blur-md">
                                    <AlertTriangle className="h-3.5 w-3.5" />
                                    Konfirmasi Hapus
                                </div>

                                <h2 className="mt-2 text-lg font-black leading-tight">
                                    Hapus jurnal mengajar?
                                </h2>

                                <p className="mt-1 text-xs font-medium text-white/75">
                                    Data yang dihapus tidak dapat dikembalikan.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
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
                                Data jurnal untuk mata pelajaran{' '}
                                <strong>{getMapelName(itemToDelete)}</strong>{' '}
                                di kelas{' '}
                                <strong>{getKelasName(itemToDelete)}</strong>{' '}
                                pada tanggal{' '}
                                <strong>{itemToDelete ? formatDate(itemToDelete.tanggal, { month: 'long' }) : ''}</strong>{' '}
                                akan dihapus permanen.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={closeModal}
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
                            {processing ? 'Menghapus...' : 'Ya, Hapus Jurnal'}
                        </button>
                    </div>
                </form>
            </Modal>

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