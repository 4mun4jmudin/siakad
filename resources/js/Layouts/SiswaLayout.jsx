// resources/js/Layouts/SiswaLayout.jsx

import React, { Fragment, useMemo, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Toaster } from 'react-hot-toast';
import { Dialog, Menu, Transition } from '@headlessui/react';
import {
  AcademicCapIcon,
  ArrowLeftOnRectangleIcon,
  Bars3BottomLeftIcon,
  BellIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ChevronDownIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  Cog6ToothIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const mainNavigation = [
  {
    name: 'Dashboard Absensi',
    routeName: 'siswa.dashboard',
    icon: HomeIcon,
    activePatterns: ['siswa.dashboard'],
  },
  {
    name: 'Materi Belajar',
    routeName: 'siswa.materi.index',
    icon: BookOpenIcon,
    activePatterns: ['siswa.materi.*'],
  },
  {
    name: 'Tugas Saya',
    routeName: 'siswa.tugas.index',
    icon: ClipboardDocumentListIcon,
    activePatterns: ['siswa.tugas.*'],
  },
  {
    name: 'Profil Saya',
    routeName: 'siswa.akun.edit',
    icon: UserCircleIcon,
    activePatterns: ['siswa.akun.*'],
  },
];

const academicNavigation = [
  {
    name: 'Lihat Nilai',
    routeName: 'siswa.nilai.index',
    icon: AcademicCapIcon,
    activePatterns: ['siswa.nilai.*'],
  },
  {
    name: 'Lihat Absensi',
    routeName: 'siswa.absensi.index',
    icon: CalendarDaysIcon,
    activePatterns: ['siswa.absensi.index', 'siswa.absensi.*'],
  },
  {
    name: 'Jadwal Pelajaran',
    routeName: 'siswa.jadwal.index',
    icon: ClockIcon,
    activePatterns: ['siswa.jadwal.*'],
  },
];

const mobileNavigation = [
  mainNavigation[0],
  mainNavigation[1],
  mainNavigation[2],
  academicNavigation[0],
];

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

function isCurrentRoute(patterns = []) {
  try {
    if (typeof route !== 'function') return false;

    return patterns.some((pattern) => route().current(pattern));
  } catch {
    return false;
  }
}

function normalizeAssetUrl(url) {
  if (!url) return null;

  const value = String(url).trim();

  if (!value) return null;
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')) {
    return value;
  }

  const cleaned = value
    .replace(/^public\//, '')
    .replace(/^storage\//, '')
    .replace(/^\/+/, '');

  return `/storage/${cleaned}`;
}

function getUserPhoto(user) {
  const photo =
    user?.foto_profil_url ||
    user?.avatar_url ||
    user?.photo_url ||
    user?.foto_url ||
    user?.foto_profil ||
    user?.foto;

  return normalizeAssetUrl(photo);
}

function avatarFallback(name = 'Siswa') {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0284c7&color=ffffff&bold=true`;
}

function SectionTitle({ children }) {
  return (
    <div className="px-3 text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">
      {children}
    </div>
  );
}

function NavItem({
  item,
  onClick,
  method,
  as,
  danger = false,
}) {
  const Icon = item.icon;
  const active = isCurrentRoute(item.activePatterns || [item.routeName]);
  const href = item.href || safeRoute(item.routeName);

  return (
    <Link
      href={href}
      method={method}
      as={as}
      type={as === 'button' ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'group relative flex min-h-12 w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-black transition-all duration-300',
        active
          ? 'bg-white text-slate-950 shadow-xl shadow-cyan-950/20'
          : danger
            ? 'text-rose-300 hover:bg-rose-500/10 hover:text-rose-200'
            : 'text-slate-400 hover:bg-white/10 hover:text-white'
      )}
    >
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl transition-all duration-300',
          active
            ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
            : danger
              ? 'bg-rose-500/10 text-rose-300 group-hover:bg-rose-500/15'
              : 'bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-cyan-200'
        )}
      >
        <Icon className="h-5 w-5" />
      </span>

      <span className="min-w-0 flex-1 truncate">
        {item.name}
      </span>

      {active && (
        <span className="absolute right-2 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-cyan-400 shadow-[0_0_16px_rgba(34,211,238,0.9)]" />
      )}
    </Link>
  );
}

function SidebarContent({
  schoolName,
  logoUrl,
  user,
  displayName,
  userPhoto,
  closeMobile,
}) {
  return (
    <div className="flex h-full grow flex-col overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_32%),linear-gradient(180deg,#020617_0%,#0f172a_50%,#082f49_100%)]">
      <div className="flex-1 overflow-y-auto px-4 pb-4 pt-4 custom-sidebar-scroll">
        {/* Brand */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-4 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-600 opacity-50 blur-md" />

              <img
                src={logoUrl}
                alt={schoolName}
                className="relative h-12 w-12 rounded-2xl border border-white/20 bg-slate-900 object-cover shadow-xl"
                onError={(event) => {
                  event.currentTarget.src = avatarFallback('S');
                }}
              />
            </div>

            <div className="min-w-0">
              <h1
                className="truncate text-sm font-black leading-tight text-white"
                title={schoolName}
              >
                {schoolName}
              </h1>

              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300">
                Student Portal
              </p>
            </div>
          </div>
        </div>

        {/* Student space */}
        <div className="mt-4 rounded-3xl border border-cyan-300/15 bg-cyan-300/[0.08] p-4 backdrop-blur-xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-cyan-100">
            <SparklesIcon className="h-3.5 w-3.5" />
            Ruang Siswa
          </div>

          <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-300">
            Pantau absensi, tugas, materi belajar, nilai, dan jadwal pelajaran.
          </p>
        </div>

        {/* Navigation */}
        <nav className="mt-6 space-y-7">
          <div className="space-y-3">
            <SectionTitle>Menu Utama</SectionTitle>

            <div className="space-y-2">
              {mainNavigation.map((item) => (
                <NavItem
                  key={item.name}
                  item={item}
                  onClick={closeMobile}
                />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <SectionTitle>Akademik</SectionTitle>

            <div className="space-y-2">
              {academicNavigation.map((item) => (
                <NavItem
                  key={item.name}
                  item={item}
                  onClick={closeMobile}
                />
              ))}
            </div>
          </div>
        </nav>
      </div>

      {/* Bottom profile */}
      <div className="border-t border-white/10 p-4">
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-3 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <img
              src={userPhoto || avatarFallback(displayName)}
              alt={displayName}
              className="h-12 w-12 rounded-2xl border border-cyan-300/20 bg-slate-900 object-cover"
              onError={(event) => {
                event.currentTarget.src = avatarFallback(displayName);
              }}
            />

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-white">
                {displayName}
              </p>

              <p className="mt-0.5 text-xs font-bold text-cyan-200/80">
                Siswa
              </p>
            </div>

            <Link
              href={safeRoute('siswa.akun.edit')}
              onClick={closeMobile}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-slate-300 transition hover:bg-cyan-400/15 hover:text-cyan-200"
              title="Pengaturan profil"
            >
              <Cog6ToothIcon className="h-5 w-5" />
            </Link>
          </div>

          <Link
            href={safeRoute('logout')}
            method="post"
            as="button"
            className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-rose-300/15 bg-rose-500/10 px-3 py-2 text-sm font-black text-rose-200 transition hover:bg-rose-500/15"
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5" />
            Keluar Aplikasi
          </Link>
        </div>
      </div>
    </div>
  );
}

function UserDropdown({
  user,
  displayName,
  userPhoto,
}) {
  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-2 py-1.5 shadow-sm transition hover:border-cyan-200 hover:bg-cyan-50/40">
        <span className="sr-only">Buka menu pengguna</span>

        <img
          src={userPhoto || avatarFallback(displayName)}
          alt={displayName}
          className="h-9 w-9 rounded-2xl border border-cyan-100 bg-slate-50 object-cover"
          onError={(event) => {
            event.currentTarget.src = avatarFallback(displayName);
          }}
        />

        <span className="hidden max-w-[130px] truncate text-sm font-black text-slate-700 lg:block">
          {displayName}
        </span>

        <ChevronDownIcon className="hidden h-4 w-4 text-slate-400 lg:block" />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="translate-y-1 opacity-0 scale-95"
        enterTo="translate-y-0 opacity-100 scale-100"
        leave="transition ease-in duration-100"
        leaveFrom="translate-y-0 opacity-100 scale-100"
        leaveTo="translate-y-1 opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-50 mt-3 w-64 origin-top-right overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl ring-1 ring-slate-900/5 focus:outline-none">
          <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-cyan-900 p-4 text-white">
            <div className="flex items-center gap-3">
              <img
                src={userPhoto || avatarFallback(displayName)}
                alt={displayName}
                className="h-12 w-12 rounded-2xl border border-cyan-300/20 bg-slate-900 object-cover"
                onError={(event) => {
                  event.currentTarget.src = avatarFallback(displayName);
                }}
              />

              <div className="min-w-0">
                <p className="truncate text-sm font-black">
                  {displayName}
                </p>

                <p className="text-xs font-semibold text-cyan-100/80">
                  {user?.email || 'Akun Siswa'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-2">
            <Menu.Item>
              {({ active }) => (
                <Link
                  href={safeRoute('siswa.akun.edit')}
                  className={cn(
                    'flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-bold transition',
                    active ? 'bg-cyan-50 text-cyan-700' : 'text-slate-700'
                  )}
                >
                  <UserCircleIcon className="h-5 w-5" />
                  Pengaturan Profil
                </Link>
              )}
            </Menu.Item>

            <Menu.Item>
              {({ active }) => (
                <Link
                  href={safeRoute('logout')}
                  method="post"
                  as="button"
                  className={cn(
                    'flex w-full items-center gap-2 rounded-2xl px-3 py-2.5 text-left text-sm font-bold transition',
                    active ? 'bg-rose-50 text-rose-700' : 'text-slate-700'
                  )}
                >
                  <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                  Keluar Aplikasi
                </Link>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

function MobileBottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/90 px-2 py-2 shadow-[0_-16px_40px_-30px_rgba(15,23,42,0.9)] backdrop-blur-xl lg:hidden">
      <div className="grid grid-cols-4 gap-1">
        {mobileNavigation.map((item) => {
          const Icon = item.icon;
          const active = isCurrentRoute(item.activePatterns || [item.routeName]);

          return (
            <Link
              key={item.name}
              href={safeRoute(item.routeName)}
              className={cn(
                'flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-black transition',
                active
                  ? 'bg-cyan-50 text-cyan-700'
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="max-w-full truncate">
                {item.name.replace('Dashboard Absensi', 'Dashboard').replace('Materi Belajar', 'Materi')}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function SiswaLayout({
  children,
  header = 'Dashboard',
  subtitle = 'Selamat datang kembali, semangat belajar!',
  className = '',
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { auth, app, pengaturan } = usePage().props;

  const user = auth?.user || {};
  const displayName = user?.nama_lengkap || user?.name || 'Siswa';
  const userPhoto = getUserPhoto(user);

  const schoolName = pengaturan?.nama_sekolah || app?.name || 'Sistem Absensi';
  const rawLogo = pengaturan?.logo_url || app?.logo_url || pengaturan?.logo;
  const logoUrl = normalizeAssetUrl(rawLogo) || avatarFallback('S');

  const topbarTitle = useMemo(() => header || 'Dashboard', [header]);

  const closeMobile = () => setSidebarOpen(false);

  return (
    <div className={cn('min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-cyan-100 selection:text-cyan-900', className)}>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#0f172a',
            color: '#fff',
            borderRadius: '18px',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 18px 60px -28px rgba(15,23,42,0.8)',
          },
        }}
      />

      {/* Mobile Sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[90] lg:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in duration-250 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex w-full max-w-[310px] flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <button
                    type="button"
                    className="absolute -right-14 top-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="sr-only">Tutup sidebar</span>
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </Transition.Child>

                <SidebarContent
                  schoolName={schoolName}
                  logoUrl={logoUrl}
                  user={user}
                  displayName={displayName}
                  userPhoto={userPhoto}
                  closeMobile={closeMobile}
                />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <SidebarContent
          schoolName={schoolName}
          logoUrl={logoUrl}
          user={user}
          displayName={displayName}
          userPhoto={userPhoto}
          closeMobile={closeMobile}
        />
      </aside>

      {/* Main Area */}
      <div className="flex min-h-screen flex-col lg:pl-72">
        {/* Topbar */}
        <header className="sticky top-0 z-40 flex h-20 shrink-0 items-center gap-x-4 border-b border-slate-200/80 bg-white/85 px-4 shadow-sm backdrop-blur-xl sm:px-6 lg:px-8">
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Buka sidebar</span>
            <Bars3BottomLeftIcon className="h-6 w-6" />
          </button>

          <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="truncate text-lg font-black tracking-tight text-slate-900 sm:text-xl">
                {topbarTitle}
              </h1>

              <p className="mt-0.5 hidden truncate text-xs font-semibold text-slate-500 sm:block">
                {subtitle}
              </p>
            </div>

            <div className="hidden min-w-0 flex-1 justify-center xl:flex">
              <div className="relative w-full max-w-md">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                <input
                  type="search"
                  placeholder="Cari materi, tugas, nilai, jadwal..."
                  className="h-12 w-full rounded-3xl border border-slate-200 bg-slate-50/70 py-2 pl-12 pr-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                />
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <button
                type="button"
                className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
              >
                <BellIcon className="h-5 w-5" />
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-cyan-500 ring-2 ring-white" />
              </button>

              <div className="hidden h-8 w-px bg-slate-200 sm:block" />

              <UserDropdown
                user={user}
                displayName={displayName}
                userPhoto={userPhoto}
              />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 pb-20 lg:pb-0">
          {children}
        </main>
      </div>

      <MobileBottomNav />

      <style>{`
        .custom-sidebar-scroll::-webkit-scrollbar {
          width: 8px;
        }

        .custom-sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.25);
          border-radius: 999px;
        }

        .custom-sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 211, 238, 0.45);
        }
      `}</style>
    </div>
  );
}