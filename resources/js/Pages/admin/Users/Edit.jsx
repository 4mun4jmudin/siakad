import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import {
    ArrowLeftIcon,
    UserIcon,
    EnvelopeIcon,
    KeyIcon,
    ShieldCheckIcon,
    InformationCircleIcon,
    ChevronDownIcon,
    LinkIcon,
} from "@heroicons/react/24/outline";

export default function Edit({ auth, user, levels }) {
    const { data, setData, put, processing, errors, reset } = useForm({
        nama_lengkap: user.nama_lengkap || "",
        username: user.username || "",
        email: user.email || "",
        password: "",
        password_confirmation: "",
        level: user.level || "Admin",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("admin.users.update", user.id_pengguna), {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <AdminLayout user={auth.user} header="Edit User">
            <Head title={`Edit User @${user.username}`} />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-4 md:p-6 lg:p-8">
                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
                    {/* Header Premium */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 sm:p-8 text-white shadow-xl shadow-blue-500/20">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <div className="mb-2 inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-blue-100">
                                    Edit Pengguna
                                </div>
                                <h2 className="text-2xl font-bold tracking-tight">Edit Akun @{user.username}</h2>
                                <p className="mt-1 text-blue-100 text-sm max-w-xl">
                                    Perbarui informasi dasar atau ubah kata sandi akun pengguna di bawah ini.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <Link
                                    href={route("admin.users.index")}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-200 text-sm font-medium"
                                >
                                    <ArrowLeftIcon className="h-4 w-4" />
                                    Kembali
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-blue-700 rounded-xl hover:bg-blue-50 disabled:opacity-50 transition-all duration-200 shadow-lg shadow-white/20 font-semibold text-sm"
                                >
                                    {processing ? (
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                    ) : (
                                        "Perbarui User"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Kolom Kiri: Info Hubungan & Sinkronisasi */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-xl shadow-slate-200/50 space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-5 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full" />
                                    <h3 className="text-sm font-bold text-gray-800">Status Sinkronisasi</h3>
                                </div>

                                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 text-blue-800 text-xs leading-relaxed space-y-2">
                                    <div className="flex items-center gap-2 font-bold">
                                        <LinkIcon className="h-4 w-4 text-blue-600" />
                                        Pembaruan Sinkron
                                    </div>
                                    <p>
                                        Jika akun user ini terhubung dengan profile (misalnya Guru, Siswa, atau Orang Tua), mengubah **Nama Lengkap** di sini akan otomatis memperbarui nama lengkap pada data profilnya agar tetap selaras.
                                    </p>
                                </div>

                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 text-xs leading-relaxed">
                                    <div className="flex items-center gap-2 font-bold mb-1">
                                        <InformationCircleIcon className="h-4 w-4 text-slate-500" />
                                        Ubah Kata Sandi
                                    </div>
                                    Kosongkan bidang input kata sandi dan konfirmasi sandi jika Anda **tidak ingin** mengubah kata sandi user saat ini.
                                </div>
                            </div>
                        </div>

                        {/* Kolom Kanan: Form Akun Pengguna */}
                        <div className="lg:col-span-2">
                            <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/40 p-6 sm:p-8 shadow-xl shadow-slate-200/50 space-y-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full" />
                                    <h3 className="text-lg font-bold text-gray-800">Ubah Detail Pengguna</h3>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    {/* Nama Lengkap */}
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Nama Lengkap <span className="text-red-400">*</span>
                                        </label>
                                        <div className="relative">
                                            <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="text"
                                                required
                                                value={data.nama_lengkap}
                                                onChange={(e) => setData("nama_lengkap", e.target.value)}
                                                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-gray-50/30 placeholder:text-gray-400 font-semibold"
                                                placeholder="Nama lengkap"
                                            />
                                        </div>
                                        {errors.nama_lengkap && (
                                            <p className="text-red-500 text-xs mt-1">{errors.nama_lengkap}</p>
                                        )}
                                    </div>

                                    {/* Username */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Username <span className="text-red-400">*</span>
                                        </label>
                                        <div className="relative">
                                            <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="text"
                                                required
                                                value={data.username}
                                                onChange={(e) => setData("username", e.target.value.toLowerCase().replace(/\s+/g, ""))}
                                                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-gray-50/30 placeholder:text-gray-400 font-mono text-xs"
                                                placeholder="username"
                                            />
                                        </div>
                                        {errors.username && (
                                            <p className="text-red-500 text-xs mt-1">{errors.username}</p>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Alamat Email <span className="text-red-400">*</span>
                                        </label>
                                        <div className="relative">
                                            <EnvelopeIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="email"
                                                required
                                                value={data.email}
                                                onChange={(e) => setData("email", e.target.value)}
                                                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-gray-50/30 placeholder:text-gray-400"
                                                placeholder="email@sekolah.sch.id"
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                                        )}
                                    </div>

                                    {/* Level / Role */}
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Level/Role Akses <span className="text-red-400">*</span>
                                        </label>
                                        <div className="relative">
                                            <ShieldCheckIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <select
                                                value={data.level}
                                                onChange={(e) => setData("level", e.target.value)}
                                                className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-gray-50/30 appearance-none cursor-pointer font-medium"
                                            >
                                                {levels.map((lvl) => (
                                                    <option key={lvl} value={lvl}>
                                                        {lvl}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDownIcon className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                                        </div>
                                        {errors.level && (
                                            <p className="text-red-500 text-xs mt-1">{errors.level}</p>
                                        )}
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Kata Sandi Baru <span className="text-xs text-gray-400 font-normal">(Isi jika ingin diubah)</span>
                                        </label>
                                        <div className="relative">
                                            <KeyIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="password"
                                                value={data.password}
                                                onChange={(e) => setData("password", e.target.value)}
                                                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-gray-50/30 placeholder:text-gray-400"
                                                placeholder="Minimal 6 karakter"
                                            />
                                        </div>
                                        {errors.password && (
                                            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                                        )}
                                    </div>

                                    {/* Konfirmasi Password */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Konfirmasi Sandi Baru <span className="text-xs text-gray-400 font-normal">(Isi jika ingin diubah)</span>
                                        </label>
                                        <div className="relative">
                                            <KeyIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="password"
                                                value={data.password_confirmation}
                                                onChange={(e) => setData("password_confirmation", e.target.value)}
                                                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-gray-50/30 placeholder:text-gray-400"
                                                placeholder="Ulangi kata sandi"
                                            />
                                        </div>
                                        {errors.password_confirmation && (
                                            <p className="text-red-500 text-xs mt-1">{errors.password_confirmation}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
