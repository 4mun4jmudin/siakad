// resources/js/Pages/Siswa/Akun/Edit.jsx

import React, { useEffect, useRef, useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import SiswaLayout from '@/Layouts/SiswaLayout';
import InputError from '@/Components/InputError';
import {
    AlertCircle,
    BadgeCheck,
    CalendarDays,
    CheckCircle2,
    CloudUpload,
    Eye,
    EyeOff,
    Home,
    IdCard,
    KeyRound,
    Loader2,
    LockKeyhole,
    Mail,
    PencilLine,
    RefreshCw,
    Save,
    ShieldCheck,
    Sparkles,
    UploadCloud,
    UserRound,
} from 'lucide-react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

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
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0284c7&color=ffffff&bold=true`;
}

function getNamaKelas(siswa = {}) {
    const kelas = siswa?.kelas;

    if (!kelas) return 'Siswa';
    if (kelas.nama_kelas) return kelas.nama_kelas;

    return [kelas.tingkat, kelas.jurusan].filter(Boolean).join(' ') || 'Siswa';
}

function normalizePhotoUrl(value) {
    if (!value) return null;

    const url = String(value).trim();

    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) {
        return url;
    }

    return `/storage-public/${url.replace(/^\/+/, '')}`;
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

            <p className="mt-2 text-lg font-black leading-none text-white">
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

                    <p className="mt-1 break-words text-sm font-black leading-relaxed text-slate-900">
                        {value || '-'}
                    </p>
                </div>
            </div>
        </div>
    );
}

function Field({ label, error, children }) {
    return (
        <div>
            <label className="mb-2 block text-sm font-black text-slate-700">
                {label}
            </label>

            {children}

            <InputError message={error} className="mt-2" />
        </div>
    );
}

function TextField({
    value,
    onChange,
    placeholder = '',
    type = 'text',
    disabled = false,
}) {
    return (
        <input
            type={type}
            value={value || ''}
            onChange={onChange}
            disabled={disabled}
            placeholder={placeholder}
            className={cn(
                'min-h-12 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200',
                disabled && 'cursor-not-allowed bg-slate-50 text-slate-500'
            )}
        />
    );
}

function PasswordField({
    label,
    value,
    onChange,
    error,
    visible,
    onToggle,
    placeholder,
}) {
    return (
        <Field label={label} error={error}>
            <div className="relative">
                <input
                    type={visible ? 'text' : 'password'}
                    value={value || ''}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white/90 py-2.5 pl-4 pr-12 text-sm font-semibold text-slate-700 shadow-sm outline-none placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
                />

                <button
                    type="button"
                    onClick={onToggle}
                    className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition hover:bg-cyan-50 hover:text-cyan-700"
                >
                    {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
            </div>
        </Field>
    );
}

function TabButton({ active, icon: Icon, children, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-black transition-all duration-300',
                active
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                    : 'text-slate-600 hover:bg-white hover:text-cyan-700'
            )}
        >
            <Icon className="h-5 w-5" />
            {children}
        </button>
    );
}

function SaveButton({ processing, children, icon: Icon = Save, tone = 'cyan' }) {
    const tones = {
        cyan: 'from-cyan-500 to-blue-600 shadow-cyan-500/20',
        emerald: 'from-emerald-500 to-teal-600 shadow-emerald-500/20',
    };

    return (
        <button
            type="submit"
            disabled={processing}
            className={cn(
                'inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r px-5 py-2.5 text-sm font-black text-white shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-60',
                tones[tone] || tones.cyan
            )}
        >
            {processing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Icon className="h-5 w-5" />}
            {children}
        </button>
    );
}

function SuccessMessage({ show, children }) {
    return (
        <Transition
            show={show}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
        >
            <p className="inline-flex items-center gap-1.5 text-sm font-black text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                {children}
            </p>
        </Transition>
    );
}

function AlertBox({ tone = 'cyan', icon: Icon, title, children }) {
    const tones = {
        cyan: 'border-cyan-100 bg-cyan-50 text-cyan-700',
        sky: 'border-sky-100 bg-sky-50 text-sky-700',
        emerald: 'border-emerald-100 bg-emerald-50 text-emerald-700',
        amber: 'border-amber-100 bg-amber-50 text-amber-700',
    };

    return (
        <div className={cn('rounded-3xl border p-5', tones[tone] || tones.cyan)}>
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

export default function Edit({
    user: userProp = {},
    siswa = {},
}) {
    const { flash, auth } = usePage().props;

    const user = userProp?.id ? userProp : auth?.user || userProp || {};
    const displayName = siswa?.nama_lengkap || user?.nama_lengkap || user?.name || 'Siswa';
    const kelasName = getNamaKelas(siswa);

    const [activeTab, setActiveTab] = useState('profile');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const fileInputRef = useRef(null);

    const {
        data: profileData,
        setData: setProfileData,
        errors: profileErrors,
        processing: profileProcessing,
        recentlySuccessful: profileSuccess,
        post: postProfile,
    } = useForm({
        nama_lengkap: siswa?.nama_lengkap || '',
        nama_panggilan: siswa?.nama_panggilan || '',
        tempat_lahir: siswa?.tempat_lahir || '',
        tanggal_lahir: siswa?.tanggal_lahir || '',
        alamat_lengkap: siswa?.alamat_lengkap || '',
        username: user?.username || '',
        foto_profil: null,
    });

    const {
        data: passwordData,
        setData: setPasswordData,
        errors: passwordErrors,
        processing: passwordProcessing,
        recentlySuccessful: passwordSuccess,
        post: postPassword,
        reset: resetPassword,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const {
        data: biodataData,
        setData: setBiodataData,
        errors: biodataErrors,
        processing: biodataProcessing,
        recentlySuccessful: biodataSuccess,
        post: postBiodata,
    } = useForm({
        jenis_kelamin: siswa?.jenis_kelamin || '',
        tempat_lahir: siswa?.tempat_lahir || '',
        tanggal_lahir: siswa?.tanggal_lahir || '',
        agama: siswa?.agama || '',
        nik: siswa?.nik || '',
        nomor_kk: siswa?.nomor_kk || '',
        anak_ke: siswa?.anak_ke || '',
        jumlah_saudara: siswa?.jumlah_saudara || '',

        nama_ayah: siswa?.nama_ayah || '',
        pendidikan_ayah: siswa?.pendidikan_ayah || '',
        pekerjaan_ayah: siswa?.pekerjaan_ayah || '',

        nama_ibu: siswa?.nama_ibu || '',
        pendidikan_ibu: siswa?.pendidikan_ibu || '',
        pekerjaan_ibu: siswa?.pekerjaan_ibu || '',

        alamat_lengkap: siswa?.alamat_lengkap || '',
        kelurahan: siswa?.kelurahan || '',
        kecamatan: siswa?.kecamatan || '',
        hp_siswa: siswa?.hp_siswa || '',
        telepon_siswa: siswa?.telepon_siswa || '',
        jarak_rumah_ke_sekolah: siswa?.jarak_rumah_ke_sekolah || '',
        alat_transportasi: siswa?.alat_transportasi || '',
    });

    const submitBiodata = (event) => {
        event.preventDefault();

        postBiodata(safeRoute('siswa.akun.update-biodata'), {
            preserveScroll: true,
        });
    };

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const fallbackAvatarUrl = avatarFallback(displayName);
    const currentPhoto =
        previewUrl ||
        normalizePhotoUrl(siswa?.foto_profil_url) ||
        normalizePhotoUrl(siswa?.foto_profil) ||
        fallbackAvatarUrl;

    const submitProfile = (event) => {
        event.preventDefault();

        postProfile(safeRoute('siswa.akun.update-profile'), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const updatePassword = (event) => {
        event.preventDefault();

        postPassword(safeRoute('siswa.akun.update-password'), {
            preserveScroll: true,
            onSuccess: () => {
                resetPassword();
                setShowCurrentPassword(false);
                setShowNewPassword(false);
                setShowConfirmPassword(false);
            },
        });
    };

    const setProfileFile = (file) => {
        if (!file) return;

        setProfileData('foto_profil', file);
        setSelectedFile(file);

        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        setProfileFile(file);
    };

    const handleDrop = (event) => {
        event.preventDefault();

        const file = event.dataTransfer.files?.[0];
        setProfileFile(file);
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const resetSelectedPhoto = () => {
        setProfileData('foto_profil', null);
        setSelectedFile(null);

        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <SiswaLayout
            header="Pengaturan Akun"
            subtitle="Kelola profil, foto, dan keamanan akun siswa."
            className="bg-slate-50 font-sans"
        >
            <Head title="Pengaturan Akun" />

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
                            <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
                                <div className="relative shrink-0">
                                    <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-br from-cyan-400 to-blue-600 opacity-50 blur-md" />

                                    <img
                                        src={currentPhoto}
                                        alt={displayName}
                                        className="relative h-24 w-24 rounded-[1.7rem] border-4 border-white/15 bg-slate-800 object-cover shadow-2xl"
                                        onError={(event) => {
                                            event.currentTarget.src = fallbackAvatarUrl;
                                        }}
                                    />

                                    <button
                                        type="button"
                                        onClick={triggerFileInput}
                                        className="absolute -bottom-2 -right-2 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white text-slate-900 shadow-xl transition hover:bg-cyan-50"
                                        title="Ganti foto"
                                    >
                                        <PencilLine className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="min-w-0">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white backdrop-blur-md">
                                        <Sparkles className="h-3.5 w-3.5" />
                                        Account Center
                                    </div>

                                    <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl">
                                        {displayName}
                                    </h1>

                                    <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-sm font-bold text-white/80 sm:justify-start">
                                        <span className="rounded-xl border border-white/20 bg-white/15 px-2.5 py-1">
                                            {kelasName}
                                        </span>

                                        <span className="hidden sm:inline text-white/50">•</span>

                                        <span>Username: {user?.username || '-'}</span>

                                        {user?.email && (
                                            <>
                                                <span className="hidden sm:inline text-white/50">•</span>
                                                <span>{user.email}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 xl:min-w-[520px]">
                                <HeroStat label="Profil" value="Aktif" icon={BadgeCheck} tone="emerald" />
                                <HeroStat label="Keamanan" value="Akun" icon={ShieldCheck} tone="cyan" />
                                <HeroStat label="Role" value="Siswa" icon={UserRound} tone="sky" />
                            </div>
                        </div>
                    </section>

                    {flash?.success && (
                        <PremiumCard className="border-emerald-100 bg-emerald-50/90 p-4" delay={40}>
                            <div className="flex items-start gap-3 text-emerald-700">
                                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                                <p className="text-sm font-black leading-relaxed">
                                    {flash.success}
                                </p>
                            </div>
                        </PremiumCard>
                    )}

                    {/* Tabs */}
                    <PremiumCard className="p-2" delay={60}>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <TabButton
                                active={activeTab === 'profile'}
                                onClick={() => setActiveTab('profile')}
                                icon={UserRound}
                            >
                                Data Pribadi
                            </TabButton>

                            <TabButton
                                active={activeTab === 'security'}
                                onClick={() => setActiveTab('security')}
                                icon={ShieldCheck}
                            >
                                Keamanan Akun
                            </TabButton>

                            <TabButton
                                active={activeTab === 'biodata'}
                                onClick={() => setActiveTab('biodata')}
                                icon={IdCard}
                            >
                                Biodata Lengkap
                            </TabButton>
                        </div>
                    </PremiumCard>

                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                        {/* Forms */}
                        <section className="space-y-6 xl:col-span-8">
                            {activeTab === 'profile' && (
                                <PremiumCard className="overflow-hidden p-0" delay={100}>
                                    <div className="border-b border-slate-100 p-5 sm:p-6">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                                                <UserRound className="h-6 w-6" />
                                            </div>

                                            <div>
                                                <h2 className="text-lg font-black text-slate-900">
                                                    Edit Informasi Pribadi
                                                </h2>

                                                <p className="mt-1 text-sm font-medium text-slate-500">
                                                    Perbarui data profil yang dapat dilihat oleh sistem sekolah.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <form onSubmit={submitProfile} className="space-y-6 p-5 sm:p-6">
                                        <div
                                            role="button"
                                            tabIndex={0}
                                            onDrop={handleDrop}
                                            onDragOver={(event) => event.preventDefault()}
                                            onClick={triggerFileInput}
                                            className="group cursor-pointer rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/80 p-6 text-center transition hover:border-cyan-300 hover:bg-cyan-50/40"
                                        >
                                            <input
                                                type="file"
                                                accept="image/*"
                                                ref={fileInputRef}
                                                className="hidden"
                                                onChange={handleFileChange}
                                            />

                                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-cyan-700 shadow-sm transition group-hover:scale-105">
                                                <CloudUpload className="h-8 w-8" />
                                            </div>

                                            <p className="mt-3 text-sm font-black text-slate-800">
                                                {selectedFile ? selectedFile.name : 'Klik untuk upload atau drag & drop foto'}
                                            </p>

                                            <p className="mt-1 text-xs font-semibold text-slate-500">
                                                PNG, JPG, GIF maksimal 2MB
                                            </p>

                                            {selectedFile && (
                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        resetSelectedPhoto();
                                                    }}
                                                    className="mt-3 inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-black text-slate-600 transition hover:bg-slate-50"
                                                >
                                                    <RefreshCw className="h-3.5 w-3.5" />
                                                    Batalkan File
                                                </button>
                                            )}

                                            <InputError message={profileErrors.foto_profil} className="mt-2" />
                                        </div>

                                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                            <div className="md:col-span-2">
                                                <Field label="Nama Lengkap" error={profileErrors.nama_lengkap}>
                                                    <TextField
                                                        value={profileData.nama_lengkap}
                                                        onChange={(event) => setProfileData('nama_lengkap', event.target.value)}
                                                        placeholder="Nama lengkap sesuai rapor"
                                                    />
                                                </Field>
                                            </div>

                                            <Field label="Nama Panggilan" error={profileErrors.nama_panggilan}>
                                                <TextField
                                                    value={profileData.nama_panggilan}
                                                    onChange={(event) => setProfileData('nama_panggilan', event.target.value)}
                                                    placeholder="Panggilan akrab"
                                                />
                                            </Field>

                                            <Field label="Username" error={profileErrors.username}>
                                                <TextField
                                                    value={profileData.username}
                                                    onChange={(event) => setProfileData('username', event.target.value)}
                                                    disabled
                                                />
                                                <p className="mt-2 text-xs font-medium text-slate-500">
                                                    Username tidak dapat diubah sembarangan.
                                                </p>
                                            </Field>

                                            <Field label="Tempat Lahir" error={profileErrors.tempat_lahir}>
                                                <TextField
                                                    value={profileData.tempat_lahir}
                                                    onChange={(event) => setProfileData('tempat_lahir', event.target.value)}
                                                    placeholder="Contoh: Garut"
                                                />
                                            </Field>

                                            <Field label="Tanggal Lahir" error={profileErrors.tanggal_lahir}>
                                                <TextField
                                                    type="date"
                                                    value={profileData.tanggal_lahir}
                                                    onChange={(event) => setProfileData('tanggal_lahir', event.target.value)}
                                                />
                                            </Field>

                                            <div className="md:col-span-2">
                                                <Field label="Alamat Lengkap" error={profileErrors.alamat_lengkap}>
                                                    <textarea
                                                        value={profileData.alamat_lengkap || ''}
                                                        onChange={(event) => setProfileData('alamat_lengkap', event.target.value)}
                                                        placeholder="Alamat tempat tinggal saat ini..."
                                                        rows="4"
                                                        className="w-full rounded-3xl border border-slate-200 bg-white/90 p-4 text-sm font-medium leading-relaxed text-slate-700 shadow-sm outline-none placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
                                                    />
                                                </Field>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-end">
                                            <SuccessMessage show={profileSuccess}>
                                                Tersimpan
                                            </SuccessMessage>

                                            <SaveButton processing={profileProcessing}>
                                                {profileProcessing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                            </SaveButton>
                                        </div>
                                    </form>
                                </PremiumCard>
                            )}

                            {activeTab === 'security' && (
                                <PremiumCard className="overflow-hidden p-0" delay={100}>
                                    <div className="border-b border-slate-100 p-5 sm:p-6">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                                                <KeyRound className="h-6 w-6" />
                                            </div>

                                            <div>
                                                <h2 className="text-lg font-black text-slate-900">
                                                    Ubah Kata Sandi
                                                </h2>

                                                <p className="mt-1 text-sm font-medium text-slate-500">
                                                    Gunakan password yang kuat untuk menjaga keamanan akun.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <form onSubmit={updatePassword} className="space-y-6 p-5 sm:p-6">
                                        <PasswordField
                                            label="Password Saat Ini"
                                            value={passwordData.current_password}
                                            onChange={(event) => setPasswordData('current_password', event.target.value)}
                                            error={passwordErrors.current_password}
                                            visible={showCurrentPassword}
                                            onToggle={() => setShowCurrentPassword((value) => !value)}
                                            placeholder="••••••••"
                                        />

                                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                            <PasswordField
                                                label="Password Baru"
                                                value={passwordData.password}
                                                onChange={(event) => setPasswordData('password', event.target.value)}
                                                error={passwordErrors.password}
                                                visible={showNewPassword}
                                                onToggle={() => setShowNewPassword((value) => !value)}
                                                placeholder="Minimal 8 karakter"
                                            />

                                            <PasswordField
                                                label="Konfirmasi Password Baru"
                                                value={passwordData.password_confirmation}
                                                onChange={(event) => setPasswordData('password_confirmation', event.target.value)}
                                                error={passwordErrors.password_confirmation}
                                                visible={showConfirmPassword}
                                                onToggle={() => setShowConfirmPassword((value) => !value)}
                                                placeholder="Ulangi password baru"
                                            />
                                        </div>

                                        <AlertBox tone="sky" icon={LockKeyhole} title="Tips Membuat Password Aman">
                                            <ul className="list-disc space-y-1 pl-4">
                                                <li>Gunakan minimal 8 karakter.</li>
                                                <li>Kombinasikan huruf besar, huruf kecil, angka, dan simbol.</li>
                                                <li>Hindari memakai tanggal lahir atau nama sendiri.</li>
                                            </ul>
                                        </AlertBox>

                                        <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-end">
                                            <SuccessMessage show={passwordSuccess}>
                                                Password diperbarui
                                            </SuccessMessage>

                                            <SaveButton processing={passwordProcessing} tone="emerald" icon={ShieldCheck}>
                                                {passwordProcessing ? 'Memproses...' : 'Ubah Password'}
                                            </SaveButton>
                                        </div>
                                    </form>
                                </PremiumCard>
                            )}

                            {activeTab === 'biodata' && (
                                <PremiumCard className="overflow-hidden p-0" delay={100}>
                                    <div className="border-b border-slate-100 p-5 sm:p-6">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                                                <IdCard className="h-6 w-6" />
                                            </div>

                                            <div>
                                                <h2 className="text-lg font-black text-slate-900">
                                                    Biodata Lengkap
                                                </h2>
                                                <p className="mt-1 text-sm font-medium text-slate-500">
                                                    Informasi lengkap data diri, orang tua, dan alamat yang terdaftar di sistem. Hubungi administrator jika terdapat data yang salah.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <form onSubmit={submitBiodata} className="p-5 sm:p-6 space-y-6">
                                        {/* Profil Dasar */}
                                        <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                                            <h3 className="mb-4 text-base font-black text-slate-900">Profil Dasar</h3>
                                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                                <Field label="NIS / NISN (Tidak dapat diubah)" error={null}>
                                                    <TextField value={`${siswa.nis || '-'} / ${siswa.nisn || '-'}`} disabled={true} />
                                                </Field>
                                                <Field label="Jenis Kelamin" error={biodataErrors.jenis_kelamin}>
                                                    <select
                                                        value={biodataData.jenis_kelamin}
                                                        onChange={(e) => setBiodataData('jenis_kelamin', e.target.value)}
                                                        className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
                                                    >
                                                        <option value="">Pilih Jenis Kelamin</option>
                                                        <option value="Laki-laki">Laki-laki</option>
                                                        <option value="Perempuan">Perempuan</option>
                                                    </select>
                                                </Field>
                                                <Field label="Tempat Lahir" error={biodataErrors.tempat_lahir}>
                                                    <TextField value={biodataData.tempat_lahir} onChange={(e) => setBiodataData('tempat_lahir', e.target.value)} />
                                                </Field>
                                                <Field label="Tanggal Lahir" error={biodataErrors.tanggal_lahir}>
                                                    <TextField type="date" value={biodataData.tanggal_lahir} onChange={(e) => setBiodataData('tanggal_lahir', e.target.value)} />
                                                </Field>
                                                <Field label="Agama" error={biodataErrors.agama}>
                                                    <TextField value={biodataData.agama} onChange={(e) => setBiodataData('agama', e.target.value)} />
                                                </Field>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <Field label="NIK" error={biodataErrors.nik}>
                                                        <TextField value={biodataData.nik} onChange={(e) => setBiodataData('nik', e.target.value)} />
                                                    </Field>
                                                    <Field label="Nomor KK" error={biodataErrors.nomor_kk}>
                                                        <TextField value={biodataData.nomor_kk} onChange={(e) => setBiodataData('nomor_kk', e.target.value)} />
                                                    </Field>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <Field label="Anak Ke" error={biodataErrors.anak_ke}>
                                                        <TextField type="number" value={biodataData.anak_ke} onChange={(e) => setBiodataData('anak_ke', e.target.value)} />
                                                    </Field>
                                                    <Field label="Jumlah Saudara" error={biodataErrors.jumlah_saudara}>
                                                        <TextField type="number" value={biodataData.jumlah_saudara} onChange={(e) => setBiodataData('jumlah_saudara', e.target.value)} />
                                                    </Field>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Informasi Orang Tua */}
                                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5 space-y-4">
                                                <h3 className="text-base font-black text-slate-900">Data Ayah</h3>
                                                <Field label="Nama Ayah" error={biodataErrors.nama_ayah}>
                                                    <TextField value={biodataData.nama_ayah} onChange={(e) => setBiodataData('nama_ayah', e.target.value)} />
                                                </Field>
                                                <Field label="Pendidikan Ayah" error={biodataErrors.pendidikan_ayah}>
                                                    <TextField value={biodataData.pendidikan_ayah} onChange={(e) => setBiodataData('pendidikan_ayah', e.target.value)} />
                                                </Field>
                                                <Field label="Pekerjaan Ayah" error={biodataErrors.pekerjaan_ayah}>
                                                    <TextField value={biodataData.pekerjaan_ayah} onChange={(e) => setBiodataData('pekerjaan_ayah', e.target.value)} />
                                                </Field>
                                            </div>
                                            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5 space-y-4">
                                                <h3 className="text-base font-black text-slate-900">Data Ibu</h3>
                                                <Field label="Nama Ibu" error={biodataErrors.nama_ibu}>
                                                    <TextField value={biodataData.nama_ibu} onChange={(e) => setBiodataData('nama_ibu', e.target.value)} />
                                                </Field>
                                                <Field label="Pendidikan Ibu" error={biodataErrors.pendidikan_ibu}>
                                                    <TextField value={biodataData.pendidikan_ibu} onChange={(e) => setBiodataData('pendidikan_ibu', e.target.value)} />
                                                </Field>
                                                <Field label="Pekerjaan Ibu" error={biodataErrors.pekerjaan_ibu}>
                                                    <TextField value={biodataData.pekerjaan_ibu} onChange={(e) => setBiodataData('pekerjaan_ibu', e.target.value)} />
                                                </Field>
                                            </div>
                                        </div>

                                        {/* Alamat Lengkap */}
                                        <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5 space-y-4">
                                            <h3 className="text-base font-black text-slate-900">Alamat & Kontak</h3>
                                            <Field label="Alamat Lengkap" error={biodataErrors.alamat_lengkap}>
                                                <textarea
                                                    value={biodataData.alamat_lengkap}
                                                    onChange={(e) => setBiodataData('alamat_lengkap', e.target.value)}
                                                    rows={3}
                                                    className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
                                                />
                                            </Field>
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <Field label="Kelurahan" error={biodataErrors.kelurahan}>
                                                    <TextField value={biodataData.kelurahan} onChange={(e) => setBiodataData('kelurahan', e.target.value)} />
                                                </Field>
                                                <Field label="Kecamatan" error={biodataErrors.kecamatan}>
                                                    <TextField value={biodataData.kecamatan} onChange={(e) => setBiodataData('kecamatan', e.target.value)} />
                                                </Field>
                                                <Field label="No. HP Siswa" error={biodataErrors.hp_siswa}>
                                                    <TextField value={biodataData.hp_siswa} onChange={(e) => setBiodataData('hp_siswa', e.target.value)} />
                                                </Field>
                                                <Field label="Telepon Siswa" error={biodataErrors.telepon_siswa}>
                                                    <TextField value={biodataData.telepon_siswa} onChange={(e) => setBiodataData('telepon_siswa', e.target.value)} />
                                                </Field>
                                                <Field label="Jarak ke Sekolah" error={biodataErrors.jarak_rumah_ke_sekolah}>
                                                    <TextField value={biodataData.jarak_rumah_ke_sekolah} onChange={(e) => setBiodataData('jarak_rumah_ke_sekolah', e.target.value)} />
                                                </Field>
                                                <Field label="Transportasi" error={biodataErrors.alat_transportasi}>
                                                    <TextField value={biodataData.alat_transportasi} onChange={(e) => setBiodataData('alat_transportasi', e.target.value)} />
                                                </Field>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-end">
                                            <SuccessMessage show={biodataSuccess}>
                                                Biodata disimpan
                                            </SuccessMessage>
                                            <SaveButton processing={biodataProcessing} tone="cyan" icon={Save}>
                                                {biodataProcessing ? 'Menyimpan...' : 'Simpan Biodata'}
                                            </SaveButton>
                                        </div>
                                    </form>
                                </PremiumCard>
                            )}
                        </section>

                        {/* Sidebar */}
                        <aside className="space-y-6 xl:col-span-4">
                            <PremiumCard className="p-5" delay={140}>
                                <div className="flex items-start gap-3">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                                        <ShieldCheck className="h-6 w-6" />
                                    </div>

                                    <div>
                                        <h3 className="text-base font-black text-slate-900">
                                            Keamanan Data
                                        </h3>

                                        <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-500">
                                            Data profil digunakan untuk kebutuhan akademik dan absensi sekolah.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 rounded-3xl border border-slate-100 bg-slate-50/70 p-4">
                                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                                        Tips Keamanan
                                    </p>

                                    <ul className="mt-3 space-y-2 text-sm font-semibold leading-relaxed text-slate-600">
                                        <li className="flex gap-2">
                                            <span className="text-cyan-600">•</span>
                                            Jangan bagikan password kepada siapapun.
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="text-cyan-600">•</span>
                                            Logout setelah memakai komputer umum.
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="text-cyan-600">•</span>
                                            Gunakan foto profil yang jelas dan sopan.
                                        </li>
                                    </ul>
                                </div>
                            </PremiumCard>

                            <div className="grid grid-cols-1 gap-3">
                                <InfoBox
                                    label="Nama Siswa"
                                    value={displayName}
                                    icon={UserRound}
                                    tone="cyan"
                                />

                                <InfoBox
                                    label="Kelas"
                                    value={kelasName}
                                    icon={IdCard}
                                    tone="sky"
                                />

                                <InfoBox
                                    label="Username"
                                    value={user?.username || '-'}
                                    icon={KeyRound}
                                    tone="amber"
                                />

                                <InfoBox
                                    label="Email"
                                    value={user?.email || '-'}
                                    icon={Mail}
                                    tone="slate"
                                />

                                <InfoBox
                                    label="Tanggal Lahir"
                                    value={profileData.tanggal_lahir || '-'}
                                    icon={CalendarDays}
                                    tone="emerald"
                                />

                                <InfoBox
                                    label="Alamat"
                                    value={profileData.alamat_lengkap || '-'}
                                    icon={Home}
                                    tone="slate"
                                />
                            </div>

                            <AlertBox tone="amber" icon={AlertCircle} title="Tentang Foto Profil">
                                Foto profil digunakan untuk identifikasi visual oleh guru dan sistem sekolah.
                                Gunakan foto formal atau semi-formal dengan pencahayaan yang baik.
                            </AlertBox>
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