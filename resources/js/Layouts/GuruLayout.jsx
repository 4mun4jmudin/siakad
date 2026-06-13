// resources/js/Layouts/GuruLayout.jsx
import React, { useState, Fragment, useEffect, useMemo } from 'react';
import { Link, Head, usePage } from '@inertiajs/react';
import { Toaster, toast } from 'react-hot-toast';
import { Dialog, Transition, Menu } from '@headlessui/react';
import {
  Home,
  BookOpen,
  ClipboardCheck,
  CalendarDays,
  Users,
  FileText,
  Menu as MenuIcon,
  X,
  ChevronDown,
  LogOut,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  FolderOpen,
  ClipboardList,
  GraduationCap,
  Search,
  Bell,
  UserRound,
  ShieldCheck,
  PanelLeft,
} from 'lucide-react';
import NotificationDropdown from '@/Components/NotificationDropdown';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function routeExists(name) {
  try {
    if (typeof window === 'undefined' || !window.route) return false;
    window.route(name);
    return true;
  } catch {
    return false;
  }
}

function safeRoute(name, params = {}, fallback = '#') {
  try {
    if (typeof window === 'undefined' || !window.route) return fallback;
    return routeExists(name) ? window.route(name, params) : fallback;
  } catch {
    return fallback;
  }
}

function isCurrentRoute(name) {
  try {
    if (typeof window === 'undefined' || !window.route) return false;
    return window.route().current(name);
  } catch {
    return false;
  }
}

function normalizeLogoUrl(url) {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) return url;
  return `/storage/${url.replace(/^\/+/, '')}`;
}

const navigationStructure = [
  {
    type: 'item',
    name: 'Dashboard',
    href: 'guru.dashboard',
    icon: Home,
  },
  {
    type: 'group',
    name: 'Pembelajaran',
    icon: BookOpen,
    items: [
      { name: 'Jadwal Saya', href: 'guru.jadwal.index', icon: CalendarDays },
      { name: 'Rencana Materi', href: 'guru.rencana-materi.index', icon: FolderOpen },
      { name: 'Jurnal & Absensi', href: 'guru.jurnal.index', icon: BookOpen },
      { name: 'Manajemen Tugas', href: 'guru.tugas.index', icon: ClipboardList },
      { name: 'Penilaian Siswa', href: 'guru.penilaian.index', icon: FileText },
    ],
  },
  {
    type: 'group',
    name: 'Akademik & Kehadiran',
    icon: ClipboardCheck,
    items: [
      { name: 'Absensi Siswa', href: 'guru.absensi-mapel.index', icon: Users },
      { name: 'Akses Edit Absensi', href: 'guru.akses-edit-absensi.index', icon: ShieldCheck },
      { name: 'Absensi Harian', href: 'guru.absensi-harian.index', icon: ClipboardCheck },
      { name: 'Permintaan Pengganti', href: 'guru.pengganti.incoming', icon: Users },
      { name: 'Riwayat Pengajuan', href: 'guru.pengganti.riwayat', icon: ClipboardList },
      { name: 'Kelas Perwalian', href: 'guru.walikelas.index', icon: Users },
      { name: 'Daftar Siswa', href: 'guru.siswa.index', icon: Users },
    ],
  },
  {
    type: 'item',
    name: 'Laporan',
    href: 'guru.laporan.index',
    icon: FileText,
  },
];

function UserAvatar({ user, size = 'md' }) {
  const sizeClass = size === 'lg' ? 'h-11 w-11' : 'h-9 w-9';

  return (
    <img
      src={
        user?.foto_profil
          ? `/storage-public/${user.foto_profil.replace(/^\/+/, '')}`
          : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nama_lengkap || 'Guru')}&background=4f46e5&color=fff`
      }
      alt={user?.nama_lengkap || 'Guru'}
      className={classNames(
        sizeClass,
        'rounded-2xl border border-white/70 bg-white object-cover shadow-sm ring-1 ring-slate-200/70'
      )}
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nama_lengkap || 'Guru')}&background=4f46e5&color=fff`;
      }}
    />
  );
}

function NavTooltip({ text }) {
  return (
    <span
      className={classNames(
        'pointer-events-none absolute left-full top-1/2 z-[90] ml-3 hidden -translate-y-1/2',
        'whitespace-nowrap rounded-2xl border border-slate-700/40 bg-slate-950/95 px-3 py-2',
        'text-xs font-black text-white shadow-2xl backdrop-blur-xl group-hover/nav:block'
      )}
    >
      {text}
    </span>
  );
}

function NavItem({ item, collapsed, isSubItem = false, onClick }) {
  const targetHref = safeRoute(item.href);
  const isActive = targetHref !== '#' && isCurrentRoute(item.href);
  const Icon = item.icon;

  return (
    <Link
      href={targetHref}
      onClick={onClick}
      className={classNames(
        'group/nav relative flex min-h-11 items-center gap-3 rounded-2xl text-sm font-bold',
        'transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300',
        isSubItem ? 'px-3 py-2 text-[13px]' : 'px-3 py-2.5',
        isActive
          ? 'bg-white text-indigo-700 shadow-lg shadow-indigo-950/10'
          : isSubItem
            ? 'text-indigo-50/80 hover:bg-white/10 hover:text-white'
            : 'text-white/78 hover:bg-white/10 hover:text-white'
      )}
      aria-current={isActive ? 'page' : undefined}
      title={collapsed ? item.name : undefined}
    >
      {isActive && !collapsed && !isSubItem && (
        <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-indigo-300" />
      )}

      {isActive && !collapsed && isSubItem && (
        <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-sky-300" />
      )}

      <span
        className={classNames(
          'flex shrink-0 items-center justify-center rounded-xl transition-all duration-300',
          collapsed ? 'mx-auto h-8 w-8' : isSubItem ? 'h-7 w-7' : 'h-8 w-8',
          isActive
            ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-200'
            : 'bg-white/10 text-white/85 group-hover/nav:bg-white/15 group-hover/nav:text-white'
        )}
      >
        <Icon className={classNames(isSubItem ? 'h-3.5 w-3.5' : 'h-4 w-4')} />
      </span>

      {!collapsed && (
        <span className="min-w-0 flex-1 truncate">
          {item.name}
        </span>
      )}

      {!collapsed && isActive && (
        <span className="h-2 w-2 rounded-full bg-sky-300 shadow-[0_0_14px_rgba(125,211,252,0.85)]" />
      )}

      {collapsed && <NavTooltip text={item.name} />}
    </Link>
  );
}

function NavGroup({ group, collapsed, onItemClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = group.icon;

  const isActive = group.items.some((item) => {
    const targetHref = safeRoute(item.href);
    return targetHref !== '#' && isCurrentRoute(item.href);
  });

  useEffect(() => {
    if (isActive) setIsOpen(true);
  }, [isActive]);

  return (
    <div className="mb-1">
      <button
        type="button"
        onClick={() => {
          if (!collapsed) setIsOpen((value) => !value);
        }}
        className={classNames(
          'group/nav relative flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold',
          'transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300',
          isActive
            ? 'bg-white/14 text-white shadow-lg shadow-indigo-950/10'
            : 'text-white/78 hover:bg-white/10 hover:text-white'
        )}
        title={collapsed ? group.name : undefined}
        aria-expanded={isOpen}
      >
        {isActive && !collapsed && (
          <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-violet-300" />
        )}

        <span
          className={classNames(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all duration-300',
            collapsed ? 'mx-auto' : '',
            isActive
              ? 'bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-950/20'
              : 'bg-white/10 text-white/85 group-hover/nav:bg-white/15 group-hover/nav:text-white'
          )}
        >
          <Icon className="h-4 w-4" />
        </span>

        {!collapsed && (
          <>
            <span className="min-w-0 flex-1 truncate text-left">
              {group.name}
            </span>

            <ChevronDown
              className={classNames(
                'h-4 w-4 shrink-0 transition-transform duration-300',
                isOpen ? 'rotate-180 text-white' : 'text-white/45'
              )}
            />
          </>
        )}

        {collapsed && <NavTooltip text={group.name} />}
      </button>

      <Transition
        show={isOpen && !collapsed}
        enter="transition-all ease-out duration-300"
        enterFrom="opacity-0 max-h-0 overflow-hidden"
        enterTo="opacity-100 max-h-[500px] overflow-hidden"
        leave="transition-all ease-in duration-200"
        leaveFrom="opacity-100 max-h-[500px] overflow-hidden"
        leaveTo="opacity-0 max-h-0 overflow-hidden"
      >
        <div className="mt-1 space-y-1 pl-4">
          {group.items.map((item) => (
            <NavItem
              key={item.name}
              item={item}
              collapsed={false}
              isSubItem
              onClick={onItemClick}
            />
          ))}
        </div>
      </Transition>
    </div>
  );
}

function Brand({ collapsed, schoolName, logoSrc }) {
  const [logoOk, setLogoOk] = useState(true);

  useEffect(() => {
    setLogoOk(true);
  }, [logoSrc]);

  return (
    <div className={classNames('flex min-w-0 items-center gap-3', collapsed ? 'justify-center' : '')}>
      <div
        className={classNames(
          'relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl',
          'border border-white/25 bg-white/12 text-white shadow-xl backdrop-blur-md'
        )}
        title={schoolName}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />

        {logoSrc && logoOk ? (
          <img
            src={logoSrc}
            alt={schoolName}
            className="relative h-full w-full object-cover"
            loading="lazy"
            onError={() => setLogoOk(false)}
          />
        ) : (
          <Sparkles className="relative h-5 w-5 text-white" />
        )}
      </div>

      {!collapsed && (
        <div className="min-w-0">
          <div className="truncate text-sm font-black leading-tight text-white">
            {schoolName}
          </div>

          <div className="mt-0.5 flex items-center gap-1.5 truncate text-[11px] font-semibold text-indigo-100/80">
            <GraduationCap className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Panel Guru</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GuruLayout({ children, header = 'Panel Guru' }) {
  const { auth, flash, app, pengaturan } = usePage().props;

  const user = auth?.user ?? {
    nama_lengkap: 'Pengguna',
    level: 'Guru',
  };

  const schoolName = pengaturan?.nama_sekolah ?? app?.nama_sekolah ?? 'Sekolah Pintar';
  const rawLogo = pengaturan?.logo_url ?? app?.logo_url;
  const logoSrc = normalizeLogoUrl(rawLogo);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (flash?.success) {
      toast.success(flash.success, {
        id: 'flash-success',
        position: 'top-right',
      });
    }

    if (flash?.error) {
      toast.error(flash.error, {
        id: 'flash-error',
        position: 'top-right',
      });
    }
  }, [flash]);

  const notifications = useMemo(
    () => [
      { id: 1, title: 'Pengumuman: Rapat GTK', time: '2 jam lalu' },
      { id: 2, title: 'Jurnal perlu konfirmasi', time: '1 hari lalu' },
    ],
    []
  );

  const SIDEBAR_EXPANDED = 272;
  const SIDEBAR_COLLAPSED = 88;

  const renderSidebarContent = (isMobile = false) => {
    const isCollapsed = !isMobile && collapsed;

    return (
      <>
        <div className={classNames('flex h-20 items-center', isMobile ? 'px-4' : isCollapsed ? 'justify-center px-3' : 'px-5')}>
          <Link
            href={safeRoute('guru.dashboard')}
            className="min-w-0"
            onClick={() => isMobile && setSidebarOpen(false)}
          >
            <Brand
              collapsed={isCollapsed}
              schoolName={schoolName}
              logoSrc={logoSrc}
            />
          </Link>
        </div>

        {!isCollapsed && (
          <div className="px-4">
            <div className="rounded-3xl border border-white/15 bg-white/10 p-3 text-white shadow-lg shadow-indigo-950/10 backdrop-blur-md">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-indigo-100/90">
                <Sparkles className="h-3.5 w-3.5" />
                Ruang Guru
              </div>

              <p className="mt-2 text-xs leading-relaxed text-white/70">
                Kelola jadwal, jurnal, absensi, penilaian, dan laporan pembelajaran.
              </p>
            </div>
          </div>
        )}

        <nav
          className={classNames(
            'custom-scrollbar flex-1 space-y-1.5 overflow-y-auto py-4',
            isCollapsed ? 'px-3' : 'px-4'
          )}
          aria-label="Sidebar Guru"
        >
          {!isCollapsed && (
            <div className="px-3 pb-2 text-[10px] font-black uppercase tracking-[0.18em] text-indigo-100/55">
              Menu Utama
            </div>
          )}

          {navigationStructure.map((item) => (
            item.type === 'group' ? (
              <NavGroup
                key={item.name}
                group={item}
                collapsed={isCollapsed}
                onItemClick={() => isMobile && setSidebarOpen(false)}
              />
            ) : (
              <NavItem
                key={item.name}
                item={item}
                collapsed={isCollapsed}
                onClick={() => isMobile && setSidebarOpen(false)}
              />
            )
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          {!isCollapsed ? (
            <div className="rounded-3xl border border-white/15 bg-white/10 p-3 text-white shadow-lg backdrop-blur-md">
              <div className="flex items-center gap-3">
                <UserAvatar user={user} size="lg" />

                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-black text-white">
                    {user.nama_lengkap}
                  </div>

                  <div className="truncate text-xs font-semibold text-indigo-100/75">
                    {user.level || 'Guru'}
                  </div>
                </div>

                <Link
                  href={safeRoute('guru.profile.show')}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white"
                  title="Profil"
                >
                  <Settings className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <Link
                href={safeRoute('guru.profile.show')}
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white"
                title="Profil"
              >
                <Settings className="h-5 w-5" />
              </Link>
            </div>
          )}
        </div>
      </>
    );
  };

  const renderDesktopSidebarToggle = () => (
    <button
      type="button"
      onClick={() => setCollapsed((value) => !value)}
      className={classNames(
        'fixed top-1/2 z-[70] hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full lg:flex',
        'border border-white/70 bg-white text-indigo-700 shadow-2xl shadow-slate-900/10 backdrop-blur-xl',
        'transition-all duration-300 hover:scale-105 hover:bg-indigo-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300'
      )}
      style={{ left: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED }}
      aria-label={collapsed ? 'Perbesar sidebar' : 'Ciutkan sidebar'}
      title={collapsed ? 'Perbesar sidebar' : 'Ciutkan sidebar'}
    >
      {collapsed ? (
        <ChevronRight className="h-5 w-5" />
      ) : (
        <ChevronLeft className="h-5 w-5" />
      )}
    </button>
  );

  return (
    <>
      <Head title={header} />
      <Toaster position="top-right" />

      <div className="min-h-screen bg-slate-50 text-slate-800">
        {/* Desktop Sidebar */}
        <aside
          className={classNames(
            'hidden overflow-hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col',
            'bg-gradient-to-b from-indigo-800 via-violet-900 to-sky-950 text-white',
            'shadow-[18px_0_60px_-35px_rgba(15,23,42,0.9)] transition-all duration-300',
            collapsed ? 'lg:w-[88px]' : 'lg:w-[272px]'
          )}
        >
          <div className="pointer-events-none absolute -left-16 top-10 h-56 w-56 rounded-full bg-indigo-300/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-20 h-64 w-64 rounded-full bg-sky-300/15 blur-3xl" />
          <div className="pointer-events-none absolute left-1/3 top-1/3 h-52 w-52 rounded-full bg-violet-300/10 blur-3xl" />

          <div className="relative flex min-h-0 flex-1 flex-col">
            {renderSidebarContent(false)}
          </div>
        </aside>

        {renderDesktopSidebarToggle()}

        {/* Mobile Sidebar */}
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog as="div" className="relative z-[90] lg:hidden" onClose={setSidebarOpen}>
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-slate-950/55 backdrop-blur-sm" />
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
                <Dialog.Panel className="relative flex w-full max-w-[320px] flex-1 flex-col overflow-hidden bg-gradient-to-b from-indigo-800 via-violet-900 to-sky-950 text-white shadow-2xl">
                  <div className="pointer-events-none absolute -left-16 top-10 h-56 w-56 rounded-full bg-indigo-300/20 blur-3xl" />
                  <div className="pointer-events-none absolute -right-20 bottom-20 h-64 w-64 rounded-full bg-sky-300/15 blur-3xl" />

                  <button
                    type="button"
                    className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20"
                    onClick={() => setSidebarOpen(false)}
                    aria-label="Tutup sidebar"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <div className="relative flex min-h-0 flex-1 flex-col">
                    {renderSidebarContent(true)}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Main Content */}
        <div
          className={classNames(
            'flex min-w-0 flex-1 flex-col transition-all duration-300',
            collapsed ? 'lg:pl-[88px]' : 'lg:pl-[272px]'
          )}
        >
          {/* Topbar */}
          <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-white/70 bg-white/80 px-3 shadow-sm shadow-slate-200/40 backdrop-blur-xl sm:px-5 lg:px-7">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-2xl text-slate-700 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Buka menu"
            >
              <MenuIcon className="h-5 w-5" />
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-2">
                    <h1 className="truncate text-sm font-black text-slate-900 sm:text-base">
                      {header}
                    </h1>

                    <span className="hidden rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-indigo-700 sm:inline-flex">
                      Guru
                    </span>
                  </div>

                  <div className="mt-0.5 hidden min-w-0 items-center gap-1.5 text-xs font-semibold text-slate-400 sm:flex">
                    <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">
                      {schoolName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Search */}
                  <div className="hidden md:block">
                    <label htmlFor="topbar-search" className="sr-only">
                      Cari
                    </label>

                    <div className="relative w-[320px] lg:w-[380px]">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <input
                        id="topbar-search"
                        type="search"
                        placeholder="Cari siswa, jadwal, jurnal..."
                        className="min-h-10 w-full rounded-2xl border border-slate-200 bg-white/80 py-2 pl-10 pr-3 text-sm font-semibold text-slate-700 shadow-sm outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                      />
                    </div>
                  </div>

                  {/* Notification */}
                  <div className="relative">
                    <NotificationDropdown />
                  </div>

                  {/* Quick action */}
                  <Link
                    href={safeRoute('guru.jurnal.index')}
                    className={classNames(
                      'hidden min-h-10 items-center justify-center gap-2 rounded-2xl px-3.5 py-2 text-sm font-black text-white sm:inline-flex',
                      'bg-gradient-to-r from-indigo-600 to-violet-600 shadow-lg shadow-indigo-200',
                      'transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105'
                    )}
                  >
                    <BookOpen className="h-4 w-4" />
                    Jurnal
                  </Link>

                  <div className="hidden h-6 w-px bg-slate-200 lg:block" />

                  {/* Profile menu */}
                  <Menu as="div" className="relative">
                    <Menu.Button className="flex items-center gap-2 rounded-2xl border border-slate-200/70 bg-white/80 p-1.5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300">
                      <UserAvatar user={user} />

                      <span className="hidden min-w-0 lg:flex lg:items-center">
                        <span className="ml-1 max-w-[160px] truncate text-sm font-black leading-6 text-slate-800">
                          {user.nama_lengkap}
                        </span>

                        <ChevronDown className="ml-1 h-4 w-4 shrink-0 text-slate-400" />
                      </span>
                    </Menu.Button>

                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-180"
                      enterFrom="transform opacity-0 scale-95 translate-y-1"
                      enterTo="transform opacity-100 scale-100 translate-y-0"
                      leave="transition ease-in duration-120"
                      leaveFrom="transform opacity-100 scale-100 translate-y-0"
                      leaveTo="transform opacity-0 scale-95 translate-y-1"
                    >
                      <Menu.Items className="absolute right-0 z-[80] mt-2 w-64 origin-top-right overflow-hidden rounded-3xl border border-white/70 bg-white/95 p-2 shadow-2xl ring-1 ring-slate-900/5 backdrop-blur-xl focus:outline-none">
                        <div className="border-b border-slate-100 px-3 py-3">
                          <p className="truncate text-sm font-black text-slate-900">
                            {user.nama_lengkap}
                          </p>

                          <p className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            {user.level || 'Guru'}
                          </p>
                        </div>

                        <div className="mt-2 space-y-1">
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                href={safeRoute('guru.profile.show')}
                                className={classNames(
                                  'flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-bold transition',
                                  active
                                    ? 'bg-indigo-50 text-indigo-700'
                                    : 'text-slate-700'
                                )}
                              >
                                <UserRound className="h-4 w-4" />
                                Profil Saya
                              </Link>
                            )}
                          </Menu.Item>

                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                href={safeRoute('logout')}
                                method="post"
                                as="button"
                                className={classNames(
                                  'flex w-full items-center gap-2 rounded-2xl px-3 py-2.5 text-left text-sm font-bold transition',
                                  active
                                    ? 'bg-rose-50 text-rose-700'
                                    : 'text-slate-700'
                                )}
                              >
                                <LogOut className="h-4 w-4" />
                                Keluar
                              </Link>
                            )}
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              </div>
            </div>
          </header>

          <main className="min-h-[calc(100vh-4rem)] flex-1">
            {children}
          </main>
        </div>
      </div>

      <style>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.24) transparent;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 999px;
        }
      `}</style>
    </>
  );
}