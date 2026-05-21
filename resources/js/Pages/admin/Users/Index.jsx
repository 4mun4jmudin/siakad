import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import Modal from "@/Components/Modal";
import SkeletonTable from "@/Components/SkeletonTable";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { debounce } from "lodash";
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    UsersIcon,
    ShieldCheckIcon,
    UserIcon,
    MagnifyingGlassIcon,
    ExclamationTriangleIcon,
    LockClosedIcon,
    KeyIcon,
    ChevronDownIcon,
} from "@heroicons/react/24/outline";

/* ==================== KOMPONEN PENDUKUNG ==================== */

const StatCard = ({ title, value, icon, color, isFeatured = false }) => (
    <div
        className={`group relative overflow-hidden rounded-3xl border bg-white/70 backdrop-blur-md p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] ${
            isFeatured
                ? "border-blue-200 shadow-xl shadow-blue-100/50 ring-1 ring-blue-100"
                : "border-white/40 shadow-lg hover:shadow-xl"
        }`}
    >
        {isFeatured && (
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-blue-400/20 to-indigo-400/20 blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
        )}
        <div className="relative flex items-center justify-between gap-4">
            <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{title}</p>
                <p
                    className={`mt-2 text-3xl font-bold tracking-tight ${
                        isFeatured ? "text-blue-700" : "text-slate-900"
                    }`}
                >
                    {value}
                </p>
            </div>
            <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg ${
                    isFeatured
                        ? "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-200"
                        : color
                }`}
            >
                {icon}
            </div>
        </div>
        <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-slate-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
);

const EmptyState = ({ onReset }) => (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fadeInUp">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-white/60 backdrop-blur-sm text-slate-400 shadow-inner">
            <UsersIcon className="h-12 w-12" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900">Belum ada data user</h3>
        <p className="mt-2 max-w-md text-sm text-slate-500">
            Data pengguna tidak ditemukan dengan kriteria pencarian saat ini. Coba ubah pencarian atau tambahkan baru.
        </p>
        <div className="mt-6 flex gap-3">
            {onReset && (
                <button
                    onClick={onReset}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all duration-200"
                >
                    Reset Filter
                </button>
            )}
            <Link
                href={route("admin.users.create")}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all duration-300"
            >
                <PlusIcon className="h-4 w-4" />
                Tambah User Baru
            </Link>
        </div>
    </div>
);

const Pagination = ({ links }) => {
    if (!links || links.length < 3) return null;

    return (
        <div className="flex items-center justify-between border-t border-white/40 bg-white/40 backdrop-blur-sm px-6 py-4 rounded-b-3xl">
            <div className="text-sm text-slate-500">
                Halaman{" "}
                <span className="font-semibold text-slate-700">
                    {links.find((l) => l.active)?.label || "-"}
                </span>
            </div>
            <div className="flex items-center gap-1">
                {links.map((link, i) => {
                    const isActive = link.active;
                    const isDisabled = !link.url;

                    if (link.label.includes("Previous") || link.label.includes("Next")) {
                        return (
                            <Link
                                key={i}
                                href={link.url || "#"}
                                preserveScroll
                                preserveState
                                className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 ${
                                    isDisabled
                                        ? "pointer-events-none text-slate-300"
                                        : isActive
                                        ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                                        : "text-slate-700 hover:bg-white/60 backdrop-blur-sm"
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        );
                    }

                    if (link.label === "...") {
                        return (
                            <span key={i} className="px-2 text-slate-400">
                                ...
                            </span>
                        );
                    }

                    return (
                        <Link
                            key={i}
                            href={link.url || "#"}
                            preserveScroll
                            preserveState
                            className={`inline-flex h-10 min-w-[2.5rem] items-center justify-center rounded-xl px-3 text-sm font-medium transition-all duration-200 ${
                                isActive
                                    ? "bg-blue-600 text-white shadow-md"
                                    : isDisabled
                                    ? "pointer-events-none text-slate-300"
                                    : "text-slate-700 hover:bg-white/60 backdrop-blur-sm"
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

export default function Index({ auth, users, stats, filters }) {
    const { flash } = usePage().props;
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchVal, setSearchVal] = useState(filters?.search ?? "");
    const [levelFilter, setLevelFilter] = useState(filters?.level ?? "Semua");

    const openDeleteModal = (user) => {
        setUserToDelete(user);
        setConfirmingDeletion(true);
    };

    const closeDeleteModal = () => {
        setConfirmingDeletion(false);
        setUserToDelete(null);
    };

    const handleDelete = () => {
        if (!userToDelete) return;
        router.delete(route("admin.users.destroy", userToDelete.id_pengguna), {
            onSuccess: () => closeDeleteModal(),
            preserveScroll: true,
        });
    };

    const runQuery = (search, level) => {
        setIsLoading(true);
        router.get(
            route("admin.users.index"),
            { search, level },
            {
                preserveState: true,
                replace: true,
                onFinish: () => setIsLoading(false),
            }
        );
    };

    const debouncedSearch = useMemo(
        () =>
            debounce((val, lvl) => {
                runQuery(val, lvl);
            }, 300),
        []
    );

    useEffect(() => {
        return () => debouncedSearch.cancel();
    }, [debouncedSearch]);

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchVal(val);
        debouncedSearch(val, levelFilter);
    };

    const handleLevelChange = (e) => {
        const val = e.target.value;
        setLevelFilter(val);
        runQuery(searchVal, val);
    };

    const handleReset = () => {
        setSearchVal("");
        setLevelFilter("Semua");
        runQuery("", "Semua");
    };

    const safeStats = {
        total: stats?.total ?? 0,
        admin: stats?.admin ?? 0,
        kepala_sekolah: stats?.kepala_sekolah ?? 0,
        lainnya: stats?.lainnya ?? 0,
    };

    return (
        <>
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

            <AdminLayout user={auth.user} header="Manajemen User">
                <Head title="Manajemen User" />

                <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-4 md:p-6 lg:p-8">
                    <div className="space-y-8 max-w-[1440px] mx-auto animate-fadeIn">
                        {/* Header premium */}
                        <div className="relative overflow-hidden rounded-3xl border border-white/40 bg-white/70 backdrop-blur-xl p-6 md:p-8 shadow-xl shadow-slate-200/50 animate-fadeInUp">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-400/10 to-indigo-400/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                            <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                                <div className="max-w-2xl">
                                    <div className="mb-3 inline-flex items-center rounded-full border border-blue-200/60 bg-blue-50/80 backdrop-blur-sm px-4 py-1.5 text-xs font-semibold text-blue-700">
                                        Sistem & Laporan • User
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
                                        Manajemen Pengguna
                                    </h1>
                                    <p className="mt-2 text-slate-500 max-w-lg">
                                        Halaman terpusat untuk memantau semua akun login (`tbl_pengguna`), mendaftarkan Administrator baru, atau Kepala Sekolah secara aman.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <Link
                                        href={route("admin.users.create")}
                                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:scale-105 active:scale-95"
                                    >
                                        <PlusIcon className="h-4 w-4" />
                                        Tambah User Baru
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                            <StatCard
                                title="Total Pengguna"
                                value={safeStats.total}
                                icon={<UsersIcon className="h-5 w-5" />}
                                color="bg-gradient-to-br from-blue-500 to-blue-600"
                                isFeatured
                            />
                            <StatCard
                                title="Role Admin"
                                value={safeStats.admin}
                                icon={<ShieldCheckIcon className="h-5 w-5" />}
                                color="bg-gradient-to-br from-indigo-500 to-indigo-600"
                            />
                            <StatCard
                                title="Role Kepala Sekolah"
                                value={safeStats.kepala_sekolah}
                                icon={<UserIcon className="h-5 w-5" />}
                                color="bg-gradient-to-br from-emerald-500 to-emerald-600"
                            />
                            <StatCard
                                title="Role Lainnya"
                                value={safeStats.lainnya}
                                icon={<UsersIcon className="h-5 w-5" />}
                                color="bg-gradient-to-br from-slate-500 to-slate-600"
                            />
                        </div>

                        {/* Filter & Tabel */}
                        <div className="overflow-hidden rounded-3xl border border-white/40 bg-white/70 backdrop-blur-xl shadow-xl shadow-slate-200/50 animate-fadeInUp">
                            {/* Filter Bar */}
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-white/40 bg-white/40 backdrop-blur-sm p-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900">Daftar Pengguna</h3>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Total data terfilter:{" "}
                                        <span className="font-semibold text-slate-700">
                                            {users?.total ?? 0}
                                        </span>
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                                    {/* Search */}
                                    <div className="relative flex-1 sm:w-80">
                                        <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={searchVal}
                                            onChange={handleSearchChange}
                                            placeholder="Cari nama lengkap, username, email..."
                                            className="w-full rounded-2xl border border-white/40 bg-white/60 backdrop-blur-md py-3 pl-12 pr-4 text-sm text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 focus:bg-white/90 shadow-inner"
                                        />
                                    </div>

                                    {/* Dropdown Role */}
                                    <div className="relative">
                                        <select
                                            value={levelFilter}
                                            onChange={handleLevelChange}
                                            className="w-full sm:w-48 appearance-none rounded-2xl border border-white/40 bg-white/60 backdrop-blur-md py-3 pl-4 pr-10 text-sm text-slate-900 outline-none transition-all duration-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 cursor-pointer shadow-sm"
                                        >
                                            <option value="Semua">Semua Role</option>
                                            <option value="Admin">Admin</option>
                                            <option value="Kepala Sekolah">Kepala Sekolah</option>
                                            <option value="Guru">Guru</option>
                                            <option value="Siswa">Siswa</option>
                                            <option value="Orang Tua">Orang Tua</option>
                                        </select>
                                        <ChevronDownIcon className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Table content */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200/50">
                                    <thead className="bg-white/40 backdrop-blur-sm">
                                        <tr>
                                            {["Identitas Pengguna", "Username", "Level/Role", "Status Hubungan", "Aksi"].map(
                                                (heading, idx) => (
                                                    <th
                                                        key={idx}
                                                        className={`px-6 py-5 text-left text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 ${
                                                            idx === 4 ? "text-right" : ""
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
                                        ) : users?.data?.length > 0 ? (
                                            users.data.map((user, index) => {
                                                const isSelf = user.id_pengguna === auth.user.id_pengguna;
                                                return (
                                                    <tr
                                                        key={user.id_pengguna}
                                                        className="transition-all duration-300 ease-out hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-indigo-50/80 animate-fadeInUp"
                                                        style={{ animationDelay: `${index * 40}ms` }}
                                                    >
                                                        <td className="whitespace-nowrap px-6 py-5">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-2 ring-white/80 shadow-sm flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
                                                                    {user.nama_lengkap?.charAt(0)?.toUpperCase() || "?"}
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                                                                        {user.nama_lengkap}
                                                                        {isSelf && (
                                                                            <span className="inline-flex items-center rounded-md bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-700 ring-1 ring-inset ring-sky-700/10">
                                                                                Anda
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-xs text-slate-500">{user.email}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="whitespace-nowrap px-6 py-5 text-sm text-slate-700">
                                                            <span className="font-mono text-xs font-semibold px-2.5 py-1 bg-white/60 rounded-xl border border-slate-200/50">
                                                                @{user.username}
                                                            </span>
                                                        </td>
                                                        <td className="whitespace-nowrap px-6 py-5">
                                                            <span
                                                                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 backdrop-blur-sm ${
                                                                    user.level === "Admin"
                                                                        ? "bg-indigo-50/80 text-indigo-700 ring-indigo-200"
                                                                        : user.level === "Kepala Sekolah"
                                                                        ? "bg-emerald-50/80 text-emerald-700 ring-emerald-200"
                                                                        : user.level === "Guru"
                                                                        ? "bg-blue-50/80 text-blue-700 ring-blue-200"
                                                                        : user.level === "Siswa"
                                                                        ? "bg-violet-50/80 text-violet-700 ring-violet-200"
                                                                        : "bg-slate-50/80 text-slate-700 ring-slate-200"
                                                                }`}
                                                            >
                                                                {user.level}
                                                            </span>
                                                        </td>
                                                        <td className="whitespace-nowrap px-6 py-5 text-sm">
                                                            {user.is_linked ? (
                                                                <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-100 bg-emerald-50/50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                                                                    <ShieldCheckIcon className="h-4 w-4 text-emerald-600" />
                                                                    Terhubung ({user.linked_to})
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/50 bg-slate-50/60 px-3 py-1.5 text-xs font-medium text-slate-500">
                                                                    <LockClosedIcon className="h-4 w-4 text-slate-400" />
                                                                    Akun Sistem
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="whitespace-nowrap px-6 py-5 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Link
                                                                    href={route("admin.users.edit", user.id_pengguna)}
                                                                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/50 bg-white/60 backdrop-blur-sm text-slate-500 transition-all duration-200 hover:border-amber-300 hover:bg-amber-50/80 hover:text-amber-600 hover:scale-110 active:scale-95"
                                                                    title="Edit User"
                                                                >
                                                                    <PencilIcon className="h-5 w-5" />
                                                                </Link>
                                                                <button
                                                                    onClick={() => openDeleteModal(user)}
                                                                    disabled={isSelf}
                                                                    className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border bg-white/60 backdrop-blur-sm transition-all duration-200 ${
                                                                        isSelf
                                                                            ? "opacity-40 cursor-not-allowed border-slate-200 text-slate-300"
                                                                            : "border-slate-200/50 text-slate-500 hover:border-red-300 hover:bg-red-50/80 hover:text-red-600 hover:scale-110 active:scale-95"
                                                                    }`}
                                                                    title={isSelf ? "Tidak dapat menghapus diri sendiri" : "Hapus User"}
                                                                >
                                                                    <TrashIcon className="h-5 w-5" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={5}>
                                                    <EmptyState onReset={filters?.search || filters?.level ? handleReset : null} />
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {users && <Pagination links={users.links} />}
                        </div>
                    </div>
                </div>

                {/* Modal Konfirmasi Hapus */}
                <Modal show={confirmingDeletion} onClose={closeDeleteModal} maxWidth="md">
                    <div className="p-6 md:p-8 text-center bg-white rounded-3xl">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 shadow-inner mb-6">
                            <ExclamationTriangleIcon className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">
                            Konfirmasi Hapus User
                        </h3>
                        <p className="mt-3 text-sm text-slate-500 leading-relaxed">
                            Apakah Anda yakin ingin menghapus akun user{" "}
                            <strong className="text-slate-800 font-semibold">
                                @{userToDelete?.username} ({userToDelete?.nama_lengkap})
                            </strong>
                            ? Tindakan ini tidak dapat dibatalkan.
                        </p>

                        {userToDelete?.is_linked && (
                            <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left flex gap-3 text-xs text-amber-800">
                                <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 flex-shrink-0" />
                                <div>
                                    <span className="font-bold block mb-0.5">Peringatan Keterhubungan Profile!</span>
                                    User ini terhubung dengan profile <strong>{userToDelete?.linked_to}</strong>. Sistem keamanan tidak mengizinkan penghapusan langsung untuk menghindari data profil yatim. Silakan hapus profil yang bersangkutan melalui menu Manajemen {userToDelete?.linked_to}.
                                </div>
                            </div>
                        )}

                        <div className="mt-6 flex justify-center gap-3">
                            <button
                                type="button"
                                onClick={closeDeleteModal}
                                className="px-5 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-all duration-200 shadow-sm"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={userToDelete?.is_linked}
                                className={`px-6 py-3 rounded-xl text-sm font-semibold text-white shadow-lg transition-all duration-200 ${
                                    userToDelete?.is_linked
                                        ? "bg-red-300 cursor-not-allowed shadow-none"
                                        : "bg-red-600 hover:bg-red-700 hover:scale-105 active:scale-95 shadow-red-200"
                                }`}
                            >
                                Ya, Hapus User
                            </button>
                        </div>
                    </div>
                </Modal>
            </AdminLayout>
        </>
    );
}
