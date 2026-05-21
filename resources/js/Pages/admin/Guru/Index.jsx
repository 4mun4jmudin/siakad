import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import Modal from '@/Components/Modal';
import SkeletonTable from '@/Components/SkeletonTable';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { debounce } from 'lodash';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    UserGroupIcon,
    FingerPrintIcon,
    KeyIcon,
    IdentificationIcon,
    MagnifyingGlassIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

/* ==================== KOMPONEN PENDUKUNG ==================== */

const StatCard = ({ title, value, icon, color, isFeatured = false }) => (
    <div
        className={`group relative overflow-hidden rounded-3xl border bg-white/70 backdrop-blur-md p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] ${isFeatured
                ? 'border-blue-200 shadow-xl shadow-blue-100/50 ring-1 ring-blue-100'
                : 'border-white/40 shadow-lg hover:shadow-xl'
            }`}
    >
        {/* Glow effect for featured card */}
        {isFeatured && (
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-blue-400/20 to-indigo-400/20 blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
        )}
        <div className="relative flex items-center justify-between gap-4">
            <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{title}</p>
                <p
                    className={`mt-2 text-3xl font-bold tracking-tight ${isFeatured ? 'text-blue-700' : 'text-slate-900'
                        }`}
                >
                    {value}
                </p>
            </div>
            <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg ${isFeatured
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-200'
                        : color
                    }`}
            >
                {icon}
            </div>
        </div>
        {/* Subtle bottom gradient accent */}
        <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-slate-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
);

const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fadeInUp">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-white/60 backdrop-blur-sm text-slate-400 shadow-inner">
            <UserGroupIcon className="h-12 w-12" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900">Belum ada data guru</h3>
        <p className="mt-2 max-w-md text-sm text-slate-500">
            Data guru yang sudah ditambahkan akan muncul di sini. Gunakan tombol <strong>Tambah Guru</strong> untuk memulai.
        </p>
        <Link
            href={route('admin.guru.create')}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all duration-300"
        >
            <PlusIcon className="h-4 w-4" />
            Tambah Guru Pertama
        </Link>
    </div>
);

const Pagination = ({ links }) => {
    if (!links || links.length < 3) return null;

    return (
        <div className="flex items-center justify-between border-t border-white/40 bg-white/40 backdrop-blur-sm px-6 py-4 rounded-b-3xl">
            <div className="text-sm text-slate-500">
                Halaman{' '}
                <span className="font-semibold text-slate-700">
                    {links.find((l) => l.active)?.label || '-'}
                </span>
            </div>
            <div className="flex items-center gap-1">
                {links.map((link, i) => {
                    const isActive = link.active;
                    const isDisabled = !link.url;

                    if (link.label.includes('Previous') || link.label.includes('Next')) {
                        return (
                            <Link
                                key={i}
                                href={link.url || '#'}
                                preserveScroll
                                preserveState
                                className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 ${isDisabled
                                        ? 'pointer-events-none text-slate-300'
                                        : isActive
                                            ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                                            : 'text-slate-700 hover:bg-white/60 backdrop-blur-sm'
                                    }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        );
                    }

                    if (link.label === '...') {
                        return (
                            <span key={i} className="px-2 text-slate-400">
                                ...
                            </span>
                        );
                    }

                    return (
                        <Link
                            key={i}
                            href={link.url || '#'}
                            preserveScroll
                            preserveState
                            className={`inline-flex h-10 min-w-[2.5rem] items-center justify-center rounded-xl px-3 text-sm font-medium transition-all duration-200 ${isActive
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : isDisabled
                                        ? 'pointer-events-none text-slate-300'
                                        : 'text-slate-700 hover:bg-white/60 backdrop-blur-sm'
                                }`}
                        >
                            {link.label}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

/* ==================== KOMPONEN UTAMA ==================== */

export default function Index({ auth, gurus, stats, filters }) {
    const { flash } = usePage().props;
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const [guruToDelete, setGuruToDelete] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const openDeleteModal = (guru) => {
        setGuruToDelete(guru);
        setConfirmingDeletion(true);
    };

    const closeDeleteModal = () => {
        setConfirmingDeletion(false);
        setGuruToDelete(null);
    };

    const handleDelete = () => {
        if (!guruToDelete) return;
        router.delete(route('admin.guru.destroy', guruToDelete.id_guru), {
            onSuccess: () => closeDeleteModal(),
            preserveScroll: true,
        });
    };

    const debouncedSearch = useMemo(
        () =>
            debounce((value) => {
                router.get(
                    route('admin.guru.index'),
                    { search: value },
                    {
                        preserveState: true,
                        replace: true,
                        onStart: () => setIsLoading(true),
                        onFinish: () => setIsLoading(false),
                    }
                );
            }, 300),
        []
    );

    useEffect(() => {
        return () => debouncedSearch.cancel();
    }, [debouncedSearch]);

    const formatKelasWali = (guru) => {
        const kelas = guru?.kelas_wali;
        if (!kelas) return '-';
        const parts = [kelas.tingkat, kelas.jurusan, kelas.nama_kelas]
            .filter(Boolean)
            .map((item) => String(item).trim())
            .filter(Boolean);
        return parts.length > 0 ? parts.join(' ') : '-';
    };

    const safeStats = {
        total: stats?.total ?? 0,
        aktif: stats?.aktif ?? 0,
        waliKelas: stats?.waliKelas ?? 0,
        sidikJari: stats?.sidikJari ?? 0,
    };

    return (
        <>
            {/* Animasi keyframes */}
            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fadeInUp {
                    animation: fadeInUp 0.5s ease-out both;
                }
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out both;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>

            <AdminLayout user={auth.user} header="Data Guru">
                <Head title="Data Guru" />

                {/* Latar belakang gradien premium */}
                <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-4 md:p-6 lg:p-8">
                    {/* Container utama */}
                    <div className="space-y-8 max-w-[1440px] mx-auto">
                        {/* Flash message */}
                        {flash?.success && (
                            <div className="animate-fadeIn rounded-2xl border border-emerald-200/60 bg-emerald-50/70 backdrop-blur-md px-5 py-4 text-sm font-medium text-emerald-800 shadow-sm">
                                {flash.success}
                            </div>
                        )}

                        {/* Header premium */}
                        <div className="relative overflow-hidden rounded-3xl border border-white/40 bg-white/70 backdrop-blur-xl p-6 md:p-8 shadow-xl shadow-slate-200/50 animate-fadeInUp">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-400/10 to-indigo-400/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                            <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                                <div className="max-w-2xl">
                                    <div className="mb-3 inline-flex items-center rounded-full border border-blue-200/60 bg-blue-50/80 backdrop-blur-sm px-4 py-1.5 text-xs font-semibold text-blue-700">
                                        Master Data • Guru
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
                                        Manajemen Guru
                                    </h1>
                                    <p className="mt-2 text-slate-500 max-w-lg">
                                        Kelola data profil, akun login, status aktif, dan keterhubungan wali kelas secara rapi dan cepat.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <Link
                                        href={route('admin.guru.reset-password')}
                                        className="inline-flex items-center gap-2 rounded-xl border border-indigo-200/60 bg-indigo-50/80 backdrop-blur-sm px-5 py-3 text-sm font-semibold text-indigo-700 transition-all duration-300 hover:bg-indigo-100/80 hover:scale-105 active:scale-95"
                                    >
                                        <KeyIcon className="h-4 w-4" />
                                        Reset Password
                                    </Link>
                                    <Link
                                        href={route('admin.guru.create')}
                                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:scale-105 active:scale-95"
                                    >
                                        <PlusIcon className="h-4 w-4" />
                                        Tambah Guru
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                            <StatCard
                                title="Total Guru"
                                value={safeStats.total}
                                icon={<UserGroupIcon className="h-5 w-5" />}
                                color="bg-gradient-to-br from-blue-500 to-blue-600"
                                isFeatured
                            />
                            <StatCard
                                title="Guru Aktif"
                                value={safeStats.aktif}
                                icon={<IdentificationIcon className="h-5 w-5" />}
                                color="bg-gradient-to-br from-emerald-500 to-emerald-600"
                            />
                            <StatCard
                                title="Wali Kelas"
                                value={safeStats.waliKelas}
                                icon={<UserGroupIcon className="h-5 w-5" />}
                                color="bg-gradient-to-br from-violet-500 to-violet-600"
                            />
                            <StatCard
                                title="Sidik Jari"
                                value={safeStats.sidikJari}
                                icon={<FingerPrintIcon className="h-5 w-5" />}
                                color="bg-gradient-to-br from-orange-500 to-orange-600"
                            />
                        </div>

                        {/* Tabel Data Guru */}
                        <div className="overflow-hidden rounded-3xl border border-white/40 bg-white/70 backdrop-blur-xl shadow-xl shadow-slate-200/50 animate-fadeInUp">
                            {/* Header tabel */}
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-white/40 bg-white/40 backdrop-blur-sm p-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900">Daftar Guru</h3>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Total hasil:{' '}
                                        <span className="font-semibold text-slate-700">
                                            {gurus?.data?.length ?? 0}
                                        </span>
                                    </p>
                                </div>
                                <div className="relative w-full lg:w-[360px]">
                                    <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Cari nama, NIP, atau akun login..."
                                        defaultValue={filters?.search ?? ''}
                                        onChange={(e) => debouncedSearch(e.target.value)}
                                        className="w-full rounded-2xl border border-white/40 bg-white/60 backdrop-blur-md py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 focus:bg-white/90 shadow-inner"
                                    />
                                </div>
                            </div>

                            {/* Tabel */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200/50">
                                    <thead className="bg-white/40 backdrop-blur-sm">
                                        <tr>
                                            {['Identitas', 'Status', 'Akun Login', 'Kelas Wali', 'Aksi'].map(
                                                (heading, idx) => (
                                                    <th
                                                        key={idx}
                                                        className={`px-6 py-5 text-left text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 ${idx === 4 ? 'text-right' : ''
                                                            }`}
                                                    >
                                                        {heading}
                                                    </th>
                                                )
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100/50 bg-transparent">
                                        {isLoading ? (
                                            <SkeletonTable rows={5} columns={5} />
                                        ) : gurus?.data?.length > 0 ? (
                                            gurus.data.map((guru, index) => (
                                                <tr
                                                    key={guru.id_guru}
                                                    className="transition-all duration-300 ease-out hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-indigo-50/80 animate-fadeInUp"
                                                    style={{ animationDelay: `${index * 50}ms` }}
                                                >
                                                    <td className="whitespace-nowrap px-6 py-5">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-100 ring-2 ring-white/80 shadow-sm">
                                                                {guru.foto_profil ? (
                                                                    <img
                                                                        className="h-full w-full object-cover"
                                                                        src={`/storage-public/${guru.foto_profil}`}
                                                                        alt={guru.nama_lengkap}
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
                                                                        {guru.nama_lengkap?.charAt(0)?.toUpperCase() || '?'}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-semibold text-slate-900">
                                                                    {guru.nama_lengkap}
                                                                </div>
                                                                <div className="mt-1 text-xs text-slate-500">
                                                                    NIP:{' '}
                                                                    <span className="font-medium text-slate-700">
                                                                        {guru.nip || '-'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-5">
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 backdrop-blur-sm ${guru.status === 'Aktif'
                                                                    ? 'bg-emerald-50/80 text-emerald-700 ring-emerald-200'
                                                                    : 'bg-rose-50/80 text-rose-700 ring-rose-200'
                                                                }`}
                                                        >
                                                            {guru.status}
                                                        </span>
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-5">
                                                        {guru.pengguna ? (
                                                            <div className="inline-flex items-center rounded-xl border border-slate-200/50 bg-white/60 backdrop-blur-sm px-3 py-2 text-sm text-slate-700">
                                                                <span className="font-mono text-xs font-semibold text-slate-700">
                                                                    {guru.pengguna.username}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <div className="inline-flex items-center gap-2 rounded-xl border border-amber-200/50 bg-amber-50/60 backdrop-blur-sm px-3 py-2 text-xs font-medium text-amber-700">
                                                                <ExclamationTriangleIcon className="h-4 w-4" />
                                                                Belum ada akun
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-5 text-sm text-slate-600">
                                                        {formatKelasWali(guru)}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-5 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Link
                                                                href={route('admin.guru.show', guru.id_guru)}
                                                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/50 bg-white/60 backdrop-blur-sm text-slate-500 transition-all duration-200 hover:border-blue-300 hover:bg-blue-50/80 hover:text-blue-600 hover:scale-110 active:scale-95"
                                                                title="Detail"
                                                            >
                                                                <EyeIcon className="h-5 w-5" />
                                                            </Link>
                                                            <Link
                                                                href={route('admin.guru.edit', guru.id_guru)}
                                                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/50 bg-white/60 backdrop-blur-sm text-slate-500 transition-all duration-200 hover:border-amber-300 hover:bg-amber-50/80 hover:text-amber-600 hover:scale-110 active:scale-95"
                                                                title="Edit"
                                                            >
                                                                <PencilIcon className="h-5 w-5" />
                                                            </Link>
                                                            <button
                                                                onClick={() => openDeleteModal(guru)}
                                                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/50 bg-white/60 backdrop-blur-sm text-slate-500 transition-all duration-200 hover:border-rose-300 hover:bg-rose-50/80 hover:text-rose-600 hover:scale-110 active:scale-95"
                                                                title="Hapus"
                                                            >
                                                                <TrashIcon className="h-5 w-5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5">
                                                    <EmptyState />
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {gurus?.links && <Pagination links={gurus.links} />}
                        </div>
                    </div>
                </div>

                {/* Modal Hapus - Glassmorphism */}
                <Modal show={confirmingDeletion} onClose={closeDeleteModal}>
                    <div className="p-6 sm:p-8 bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/40">
                        <div className="mb-6 flex items-start gap-5">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-rose-100/80 text-rose-600 shadow-inner">
                                <TrashIcon className="h-7 w-7" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                                    Konfirmasi Hapus
                                </h2>
                                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                    Anda yakin ingin menghapus guru{' '}
                                    <span className="font-semibold text-slate-900">
                                        {guruToDelete?.nama_lengkap || '-'}
                                    </span>
                                    ? Tindakan ini akan menghapus data guru dan akun terkait secara permanen.
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={closeDeleteModal}
                                className="inline-flex items-center rounded-xl border border-slate-200/50 bg-white/60 backdrop-blur-sm px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-white/80 hover:scale-105 active:scale-95"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDelete}
                                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-200/50 transition-all duration-200 hover:from-rose-700 hover:to-pink-700 hover:scale-105 active:scale-95"
                            >
                                <TrashIcon className="h-4 w-4" />
                                Hapus Data
                            </button>
                        </div>
                    </div>
                </Modal>
            </AdminLayout>
        </>
    );
}