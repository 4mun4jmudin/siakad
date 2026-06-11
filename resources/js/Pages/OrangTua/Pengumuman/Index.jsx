// resources/js/Pages/OrangTua/PengumumanIndex.jsx
import React, { useMemo } from 'react';
import OrangTuaLayout from '@/Layouts/OrangTuaLayout';
import { Head, Link } from '@inertiajs/react';
import {
  Megaphone,
  Calendar,
  User,
  Tag,
  ArrowRight,
  Sparkles,
  Bell,
  Info,
  ShieldCheck,
  Clock,
  Inbox,
} from 'lucide-react';
import Pagination from '@/Components/Pagination';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const clampStyle = (lines = 1) => ({
  display: '-webkit-box',
  WebkitLineClamp: lines,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  wordBreak: 'break-word',
});

const fmtDate = (iso) => {
  try {
    return new Date(iso).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
};

const fmtDateShort = (iso) => {
  try {
    return new Date(iso).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
};

const daysAgo = (iso) => {
  try {
    const d = new Date(iso);
    return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
  } catch {
    return 9999;
  }
};

const targetTheme = (target = '') => {
  const key = String(target).toLowerCase();

  if (key.includes('semua')) {
    return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  }

  if (key.includes('siswa')) {
    return 'bg-teal-50 text-teal-700 border-teal-200';
  }

  if (key.includes('guru')) {
    return 'bg-amber-50 text-amber-700 border-amber-200';
  }

  if (key.includes('orang') || key.includes('tua') || key.includes('wali')) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }

  return 'bg-slate-50 text-slate-700 border-slate-200';
};

const PremiumCard = ({ children, className = '', delay = 0 }) => (
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

const NewBadge = ({ item }) => {
  const newDays = daysAgo(item.tanggal_terbit);
  const isNew = newDays <= 7;

  if (isNew) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-amber-700 shadow-sm">
        <Sparkles className="h-3 w-3" />
        Baru
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-500">
      <Clock className="h-3 w-3" />
      {newDays} hari lalu
    </span>
  );
};

const EmptyState = ({ title, description }) => (
  <PremiumCard className="p-8 text-center" delay={160}>
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-50 text-slate-300 shadow-sm">
      <Inbox className="h-7 w-7" />
    </div>

    <h3 className="mt-4 text-lg font-black text-slate-800">
      {title}
    </h3>

    <p className="mt-2 text-sm leading-relaxed text-slate-500">
      {description}
    </p>
  </PremiumCard>
);

const FeaturedAnnouncement = ({ item }) => {
  const targetClass = targetTheme(item.target_level);

  return (
    <Link
      href={route('orangtua.pengumuman.show', item.id_pengumuman)}
      className="group block"
      aria-label={`Baca pengumuman: ${item.judul}`}
    >
      <PremiumCard className="relative overflow-hidden p-0" delay={80}>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-700" />
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/15 blur-3xl transition-transform duration-700 group-hover:scale-125" />
        <div className="absolute bottom-0 left-1/3 h-40 w-40 translate-y-16 rounded-full bg-emerald-200/20 blur-2xl" />

        <div className="relative p-5 text-white sm:p-6 md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl border border-white/25 bg-white/15 text-white shadow-xl backdrop-blur-md transition-transform duration-300 group-hover:scale-105 sm:h-16 sm:w-16">
                <Megaphone className="h-7 w-7" />
              </div>

              <div className="min-w-0">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-50 backdrop-blur-md">
                    <Bell className="h-3.5 w-3.5" />
                    Pengumuman Utama
                  </span>

                  <NewBadge item={item} />

                  {item.target_level && (
                    <span className={cn(
                      'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide shadow-sm',
                      targetClass
                    )}>
                      <Tag className="h-3 w-3" />
                      {item.target_level}
                    </span>
                  )}
                </div>

                <h2
                  className="text-xl font-black leading-tight tracking-tight sm:text-2xl md:text-3xl"
                  style={clampStyle(2)}
                >
                  {item.judul}
                </h2>

                <p
                  className="mt-3 max-w-4xl text-sm font-medium leading-relaxed text-white/85 sm:text-base"
                  style={clampStyle(3)}
                >
                  {item.isi}
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-semibold text-white/85 sm:text-sm">
                  <span className="inline-flex max-w-full items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-md">
                    <User className="h-4 w-4 shrink-0 opacity-90" />
                    <span className="min-w-0" style={clampStyle(1)}>
                      {item.pembuat?.nama_lengkap || 'Administrator'}
                    </span>
                  </span>

                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-md">
                    <Calendar className="h-4 w-4 opacity-90" />
                    {fmtDate(item.tanggal_terbit)}
                  </span>
                </div>
              </div>
            </div>

            <div className="shrink-0">
              <span className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-black text-emerald-700 shadow-lg shadow-emerald-950/10 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:bg-emerald-50">
                Baca Pengumuman
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </div>
          </div>
        </div>
      </PremiumCard>
    </Link>
  );
};

const AnnouncementCard = ({ item, delay = 0 }) => {
  const targetClass = targetTheme(item.target_level);

  return (
    <PremiumCard className="group overflow-hidden p-0" delay={delay}>
      <article
        role="article"
        aria-labelledby={`judul-${item.id_pengumuman}`}
        className="relative"
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-emerald-100/70 blur-2xl transition-transform duration-700 group-hover:scale-125" />

        <div className="relative p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-sky-50 text-emerald-600 shadow-sm">
                <Megaphone className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <Link
                  href={route('orangtua.pengumuman.show', item.id_pengumuman)}
                  className="group/title"
                >
                  <h3
                    id={`judul-${item.id_pengumuman}`}
                    className="text-base font-black leading-snug text-slate-900 transition-colors group-hover/title:text-emerald-700 sm:text-lg"
                    style={clampStyle(2)}
                  >
                    {item.judul}
                  </h3>
                </Link>

                <p
                  className="mt-2 text-sm leading-relaxed text-slate-600"
                  style={clampStyle(3)}
                >
                  {item.isi}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                  <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1">
                    <User className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span className="min-w-0" style={clampStyle(1)}>
                      {item.pembuat?.nama_lengkap || 'Administrator'}
                    </span>
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    {fmtDateShort(item.tanggal_terbit)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-row flex-wrap items-center gap-2 sm:flex-col sm:items-end">
              {item.target_level && (
                <span className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide',
                  targetClass
                )}>
                  <Tag className="h-3 w-3" />
                  {item.target_level}
                </span>
              )}

              <NewBadge item={item} />
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
              <Info className="h-3.5 w-3.5" />
              Info Sekolah
            </div>

            <Link
              href={route('orangtua.pengumuman.show', item.id_pengumuman)}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-100"
            >
              Baca selengkapnya
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </article>
    </PremiumCard>
  );
};

const SidebarCard = ({ title, icon: Icon, children, delay = 0 }) => (
  <PremiumCard className="p-4" delay={delay}>
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-sky-50 text-emerald-600 shadow-sm">
        <Icon className="h-5 w-5" />
      </div>

      <h4 className="text-sm font-black text-slate-900">
        {title}
      </h4>
    </div>

    <div className="mt-3 text-sm leading-relaxed text-slate-600">
      {children}
    </div>
  </PremiumCard>
);

export default function PengumumanIndex({ auth, pengumuman }) {
  const featured = useMemo(
    () => (pengumuman.data && pengumuman.data.length > 0 ? pengumuman.data[0] : null),
    [pengumuman]
  );

  const list = useMemo(
    () => (featured ? pengumuman.data.slice(1) : pengumuman.data || []),
    [pengumuman, featured]
  );

  const total = pengumuman?.total || pengumuman?.data?.length || 0;
  const latestCount = (pengumuman?.data || []).filter((item) => daysAgo(item.tanggal_terbit) <= 7).length;

  return (
    <OrangTuaLayout user={auth.user} header="Pengumuman Sekolah">
      <Head title="Pengumuman" />

      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-emerald-50/35 to-sky-50/60 py-5 sm:py-6">
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-40 h-80 w-80 translate-x-24 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-indigo-200/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl space-y-5 px-3 sm:space-y-6 sm:px-6 lg:px-8">
          {/* Header */}
          <PremiumCard className="relative overflow-hidden p-0" delay={0}>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-700" />
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/15 blur-2xl" />
            <div className="absolute bottom-0 left-1/3 h-32 w-32 translate-y-10 rounded-full bg-emerald-200/20 blur-2xl" />

            <div className="relative p-4 text-white sm:p-6 lg:p-7">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-start gap-4 sm:items-center">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl border border-white/25 bg-white/15 text-white shadow-xl backdrop-blur-md sm:h-16 sm:w-16">
                    <Megaphone className="h-7 w-7" />
                  </div>

                  <div className="min-w-0">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-50 backdrop-blur-md">
                      <Sparkles className="h-3.5 w-3.5" />
                      Informasi Sekolah
                    </div>

                    <h1 className="mt-3 text-xl font-black leading-tight tracking-tight sm:text-2xl lg:text-3xl">
                      Pengumuman Sekolah
                    </h1>

                    <p className="mt-2 max-w-3xl text-sm font-medium leading-relaxed text-white/80">
                      Pusat informasi penting untuk orang tua/wali agar selalu mendapatkan kabar terbaru dari sekolah.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:min-w-[280px]">
                  <div className="rounded-3xl border border-white/15 bg-white/10 p-3 text-center backdrop-blur-md">
                    <p className="text-2xl font-black leading-none">
                      {total}
                    </p>
                    <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-white/70">
                      Total Info
                    </p>
                  </div>

                  <div className="rounded-3xl border border-white/15 bg-white/10 p-3 text-center backdrop-blur-md">
                    <p className="text-2xl font-black leading-none">
                      {latestCount}
                    </p>
                    <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-white/70">
                      Info Baru
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </PremiumCard>

          {/* Featured */}
          {featured && (
            <FeaturedAnnouncement item={featured} />
          )}

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* Main list */}
            <div className="space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    Pengumuman Lainnya
                  </h2>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    Daftar informasi terbaru yang bisa dibaca orang tua/wali.
                  </p>
                </div>
              </div>

              {list.length > 0 ? (
                list.map((item, index) => (
                  <AnnouncementCard
                    key={item.id_pengumuman}
                    item={item}
                    delay={120 + index * 45}
                  />
                ))
              ) : (
                <EmptyState
                  title="Tidak ada pengumuman tambahan"
                  description="Semua pengumuman terbaru sudah ditampilkan di bagian unggulan."
                />
              )}

              <PremiumCard className="p-3" delay={220}>
                <Pagination links={pengumuman.links} />
              </PremiumCard>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="space-y-4 lg:sticky lg:top-6">
                <SidebarCard title="Ringkasan" icon={Info} delay={160}>
                  Tampilkan pengumuman terbaru dan penting agar orang tua selalu mendapat informasi tepat waktu.
                </SidebarCard>

                <SidebarCard title="Kategori & Target" icon={Tag} delay={200}>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700">
                      Semua
                    </span>
                    <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-black text-teal-700">
                      Siswa
                    </span>
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
                      Guru
                    </span>
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                      Orang Tua
                    </span>
                  </div>
                </SidebarCard>

                <SidebarCard title="Tips Membaca Info" icon={ShieldCheck} delay={240}>
                  <ol className="list-inside list-decimal space-y-2 text-sm">
                    <li>Periksa pengumuman setiap hari kerja.</li>
                    <li>Utamakan info dengan label baru.</li>
                    <li>Hubungi sekolah jika ada informasi yang perlu dikonfirmasi.</li>
                  </ol>
                </SidebarCard>

                <SidebarCard title="Catatan" icon={Bell} delay={280}>
                  Pengumuman yang tampil di halaman ini bersumber dari informasi resmi sekolah.
                </SidebarCard>
              </div>
            </aside>
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
    </OrangTuaLayout>
  );
}