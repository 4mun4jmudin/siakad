// resources/js/Pages/Siswa/Akun/EditPhoto.jsx

import React, { useEffect, useRef, useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import SiswaLayout from '@/Layouts/SiswaLayout';
import InputError from '@/Components/InputError';
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Camera,
  CheckCircle2,
  CloudUpload,
  FileImage,
  ImagePlus,
  Loader2,
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

function normalizePhotoUrl(value) {
  if (!value) return null;

  const url = String(value).trim();

  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) {
    return url;
  }

  return `/storage-public/${url.replace(/^\/+/, '')}`;
}

function getNamaKelas(siswa = {}) {
  const kelas = siswa?.kelas;

  if (!kelas) return 'Siswa';
  if (kelas.nama_kelas) return kelas.nama_kelas;

  return [kelas.tingkat, kelas.jurusan].filter(Boolean).join(' ') || 'Siswa';
}

function formatFileSize(file) {
  if (!file?.size) return '-';

  const kb = file.size / 1024;

  if (kb < 1024) return `${Math.round(kb)} KB`;

  return `${(kb / 1024).toFixed(2)} MB`;
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
    sky: 'text-sky-300',
    amber: 'text-amber-300',
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

function AlertBox({ tone = 'cyan', icon: Icon, title, children }) {
  const tones = {
    cyan: 'border-cyan-100 bg-cyan-50 text-cyan-700',
    emerald: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-100 bg-amber-50 text-amber-700',
    rose: 'border-rose-100 bg-rose-50 text-rose-700',
  };

  return (
    <div className={cn('rounded-3xl border p-4', tones[tone] || tones.cyan)}>
      <div className="flex items-start gap-3">
        {Icon && <Icon className="mt-0.5 h-5 w-5 shrink-0" />}

        <div>
          <h4 className="text-sm font-black">
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

export default function EditPhoto({
  user: userProp = {},
  siswa = {},
}) {
  const { flash, auth } = usePage().props;

  const user = userProp?.id ? userProp : auth?.user || userProp || {};
  const displayName = siswa?.nama_lengkap || user?.nama_lengkap || user?.name || 'Siswa';
  const kelasName = getNamaKelas(siswa);

  const fileInputRef = useRef(null);

  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState('');

  const {
    data,
    setData,
    post,
    processing,
    errors,
  } = useForm({
    foto_profil: null,
  });

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const fallbackAvatarUrl = avatarFallback(displayName);

  const currentPhotoUrl =
    previewUrl ||
    normalizePhotoUrl(siswa?.foto_profil_url) ||
    normalizePhotoUrl(siswa?.foto_profil) ||
    fallbackAvatarUrl;

  const handleFile = (file) => {
    if (!file) return;

    setData('foto_profil', file);
    setSelectedFileName(file.name);

    if (previewUrl) URL.revokeObjectURL(previewUrl);

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleChange = (event) => {
    const file = event.target.files?.[0];
    handleFile(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);

    const file = event.dataTransfer.files?.[0];
    handleFile(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragActive(false);
  };

  const resetSelectedFile = () => {
    setData('foto_profil', null);
    setSelectedFileName('');

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const submit = (event) => {
    event.preventDefault();

    post(safeRoute('siswa.akun.update-foto'), {
      forceFormData: true,
      preserveScroll: true,
    });
  };

  return (
    <SiswaLayout
      header="Ubah Foto Profil"
      subtitle="Perbarui foto identitas yang digunakan di portal siswa."
      className="bg-slate-50 font-sans"
    >
      <Head title="Ubah Foto Profil" />

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
                    src={currentPhotoUrl}
                    alt={displayName}
                    className="relative h-28 w-28 rounded-[1.8rem] border-4 border-white/15 bg-slate-800 object-cover shadow-2xl"
                    onError={(event) => {
                      event.currentTarget.src = fallbackAvatarUrl;
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white text-slate-900 shadow-xl transition hover:bg-cyan-50"
                    title="Pilih foto"
                  >
                    <Camera className="h-5 w-5" />
                  </button>
                </div>

                <div className="min-w-0">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white backdrop-blur-md">
                    <Sparkles className="h-3.5 w-3.5" />
                    Profile Photo Center
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
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 xl:min-w-[520px]">
                <HeroStat label="Format" value="Image" icon={FileImage} tone="cyan" />
                <HeroStat label="Ukuran" value="2MB" icon={CloudUpload} tone="sky" />
                <HeroStat label="Identitas" value="Siswa" icon={BadgeCheck} tone="emerald" />
              </div>
            </div>
          </section>

          {/* Back + Flash */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href={safeRoute('siswa.akun.edit')}
              className="inline-flex min-h-12 w-fit items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Pengaturan Akun
            </Link>

            {flash?.success && (
              <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700 shadow-sm">
                <CheckCircle2 className="h-5 w-5" />
                {flash.success}
              </div>
            )}

            {flash?.error && (
              <div className="inline-flex items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-black text-rose-700 shadow-sm">
                <AlertCircle className="h-5 w-5" />
                {flash.error}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            {/* Main upload */}
            <section className="xl:col-span-8">
              <PremiumCard className="overflow-hidden p-0" delay={80}>
                <div className="border-b border-slate-100 p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                      <ImagePlus className="h-6 w-6" />
                    </div>

                    <div>
                      <h2 className="text-lg font-black text-slate-900">
                        Upload Foto Profil Baru
                      </h2>

                      <p className="mt-1 text-sm font-medium text-slate-500">
                        Pilih foto formal atau semi-formal agar mudah dikenali oleh guru dan sistem sekolah.
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={submit} className="space-y-6 p-5 sm:p-6">
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* Preview */}
                    <div className="lg:col-span-4">
                      <div className="rounded-[2rem] border border-slate-100 bg-slate-50/80 p-5 text-center">
                        <div className="mx-auto h-44 w-44 overflow-hidden rounded-[2rem] border-4 border-white bg-white shadow-2xl">
                          <img
                            src={currentPhotoUrl}
                            alt="Preview foto"
                            className="h-full w-full object-cover"
                            onError={(event) => {
                              event.currentTarget.src = fallbackAvatarUrl;
                            }}
                          />
                        </div>

                        <p className="mt-4 text-sm font-black text-slate-900">
                          {displayName}
                        </p>

                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          Preview foto profil
                        </p>
                      </div>
                    </div>

                    {/* Upload area */}
                    <div className="lg:col-span-8">
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => fileInputRef.current?.click()}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        className={cn(
                          'flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-[2rem] border-2 border-dashed p-6 text-center transition-all duration-300',
                          data.foto_profil
                            ? 'border-emerald-300 bg-emerald-50/70'
                            : dragActive
                              ? 'border-cyan-400 bg-cyan-50/80'
                              : 'border-slate-200 bg-slate-50/80 hover:border-cyan-300 hover:bg-cyan-50/40'
                        )}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          className="hidden"
                          onChange={handleChange}
                        />

                        <div
                          className={cn(
                            'flex h-20 w-20 items-center justify-center rounded-[1.7rem] shadow-sm transition',
                            data.foto_profil
                              ? 'bg-white text-emerald-600'
                              : 'bg-white text-cyan-700'
                          )}
                        >
                          {data.foto_profil ? (
                            <CheckCircle2 className="h-10 w-10" />
                          ) : (
                            <UploadCloud className="h-10 w-10" />
                          )}
                        </div>

                        <h3 className="mt-4 text-base font-black text-slate-900">
                          {data.foto_profil ? selectedFileName : 'Seret foto ke sini atau klik untuk memilih'}
                        </h3>

                        <p className="mt-2 max-w-md text-sm font-semibold leading-relaxed text-slate-500">
                          Format yang disarankan: JPG, JPEG, PNG, WEBP, atau GIF.
                          Maksimal ukuran file 2MB.
                        </p>

                        {data.foto_profil && (
                          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                            <span className="rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-black text-emerald-700">
                              {formatFileSize(data.foto_profil)}
                            </span>

                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                resetSelectedFile();
                              }}
                              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-black text-slate-600 transition hover:bg-slate-50"
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                              Batalkan
                            </button>
                          </div>
                        )}
                      </div>

                      <InputError message={errors.foto_profil} className="mt-2" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-end">
                    <Link
                      href={safeRoute('siswa.akun.edit')}
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Kembali
                    </Link>

                    <button
                      type="submit"
                      disabled={processing || !data.foto_profil}
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-black text-white shadow-xl shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {processing ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Save className="h-5 w-5" />
                      )}

                      {processing ? 'Menyimpan...' : 'Simpan Foto'}
                    </button>
                  </div>
                </form>
              </PremiumCard>
            </section>

            {/* Sidebar info */}
            <aside className="space-y-6 xl:col-span-4">
              <PremiumCard className="p-5" delay={120}>
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                    <ShieldCheck className="h-6 w-6" />
                  </div>

                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Foto Identitas Siswa
                    </h3>

                    <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-500">
                      Foto ini digunakan pada dashboard, profil, dan identifikasi visual di sistem sekolah.
                    </p>
                  </div>
                </div>
              </PremiumCard>

              <AlertBox tone="cyan" icon={Camera} title="Saran Foto yang Baik">
                Gunakan foto wajah yang jelas, pencahayaan cukup, dan latar belakang rapi.
              </AlertBox>

              <AlertBox tone="amber" icon={AlertCircle} title="Hindari Foto Berikut">
                Hindari foto buram, foto beramai-ramai, gambar kartun, atau foto yang tidak sopan.
              </AlertBox>

              <AlertBox tone="emerald" icon={BadgeCheck} title="Format Didukung">
                JPG, JPEG, PNG, WEBP, dan GIF dengan ukuran maksimal 2MB.
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