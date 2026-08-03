// resources/js/Layouts/OrangTuaLayout.jsx
import React, { useState, Fragment, useEffect, useMemo } from 'react';
import { Link, Head, usePage, router } from '@inertiajs/react';
import { Toaster, toast } from 'react-hot-toast';
import { Dialog, Transition, Menu } from '@headlessui/react';
import {
  Home,
  BookOpen,
  CalendarDays,
  Users,
  FileText,
  Bell,
  Menu as MenuIcon,
  X,
  ChevronDown,
  Settings,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Award,
  Megaphone,
  UserRound,
  LogOut,
  GraduationCap,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

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

const getNavigationItems = (isAbsensiMode) => [
  { name: 'Dashboard', href: 'orangtua.dashboard', icon: Home },
  { name: 'Absensi Ananda', href: 'orangtua.absensi.index', icon: CalendarDays },
  ...(!isAbsensiMode ? [{ name: 'Nilai Anak', href: 'orangtua.nilai.index', icon: Award }] : []),
  { name: 'Jadwal Pelajaran', href: 'orangtua.jadwal.index', icon: BookOpen },
  { name: 'Pengumuman', href: 'orangtua.pengumuman.index', icon: Megaphone },
  { name: 'Pengajuan Izin', href: 'orangtua.surat-izin.index', icon: FileText },
  { name: 'Pengaturan Akun', href: 'orangtua.profile.show', icon: Settings },
];

function NavItem({ item, collapsed, onClick }) {
  const targetHref = safeRoute(item.href);
  const isActive = targetHref !== '#' && isCurrentRoute(item.href);
  const Icon = item.icon;

  return (
    <Link
      href={targetHref}
      onClick={onClick}
      className={classNames(
        'group/nav relative flex min-h-11 items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold',
        'transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300',
        isActive
          ? 'bg-white text-emerald-700 shadow-lg shadow-emerald-950/10'
          : 'text-white/78 hover:bg-white/10 hover:text-white'
      )}
      aria-current={isActive ? 'page' : undefined}
      title={collapsed ? item.name : undefined}
    >
      {isActive && !collapsed && (
        <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-emerald-400" />
      )}

      <span
        className={classNames(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all duration-300',
          collapsed ? 'mx-auto' : '',
          isActive
            ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-200'
            : 'bg-white/10 text-white/85 group-hover/nav:bg-white/15 group-hover/nav:text-white'
        )}
      >
        <Icon className="h-4.5 w-4.5" aria-hidden />
      </span>

      {!collapsed && (
        <span className="min-w-0 flex-1 truncate">
          {item.name}
        </span>
      )}

      {!collapsed && isActive && (
        <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.85)]" />
      )}

      {collapsed && (
        <span
          className={classNames(
            'pointer-events-none absolute left-full top-1/2 z-[80] ml-3 hidden -translate-y-1/2',
            'whitespace-nowrap rounded-2xl border border-slate-700/40 bg-slate-950/95 px-3 py-2',
            'text-xs font-black text-white shadow-2xl backdrop-blur-xl group-hover/nav:block'
          )}
        >
          {item.name}
        </span>
      )}
    </Link>
  );
}

function Brand({ collapsed, app }) {
  const namaSekolah = app?.nama_sekolah || 'Sekolah';
  const rawLogo = app?.logo_url || null;
  const logoUrl = normalizeLogoUrl(rawLogo);

  const [logoOk, setLogoOk] = useState(true);

  useEffect(() => {
    setLogoOk(true);
  }, [logoUrl]);

  return (
    <div className={classNames('flex min-w-0 items-center gap-3', collapsed ? 'justify-center' : '')}>
      <div
        className={classNames(
          'relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl',
          'border border-white/25 bg-white/12 text-white shadow-xl backdrop-blur-md'
        )}
        title={namaSekolah}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />

        {logoUrl && logoOk ? (
          <img
            src={logoUrl}
            alt={namaSekolah}
            className="relative h-full w-full object-cover"
            onError={() => setLogoOk(false)}
          />
        ) : (
          <ImageIcon className="relative h-5 w-5 text-white" />
        )}
      </div>

      {!collapsed && (
        <div className="min-w-0">
          <div className="truncate text-sm font-black leading-tight text-white">
            {namaSekolah}
          </div>

          <div className="mt-0.5 flex items-center gap-1.5 truncate text-[11px] font-semibold text-emerald-100/80">
            <GraduationCap className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Panel Orang Tua / Wali</span>
          </div>
        </div>
      )}
    </div>
  );
}

function StudentSwitcher({
  allSiswas,
  activeSiswa,
  handleSwitchSiswa,
  compact = false,
}) {
  if (!allSiswas.length) return null;

  return (
    <Menu as="div" className="relative">
      <Menu.Button
        className={classNames(
          'inline-flex min-h-10 items-center gap-2 rounded-2xl border border-slate-200/70',
          'bg-white/80 px-3 py-2 text-sm font-black text-slate-700 shadow-sm backdrop-blur-xl',
          'transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50/60',
          compact ? 'w-full justify-between' : ''
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Users className="h-4 w-4" />
          </span>

          <span className={classNames('truncate', compact ? 'max-w-[190px]' : 'max-w-[130px]')}>
            {activeSiswa?.nama_lengkap || 'Pilih Anak'}
          </span>
        </span>

        {allSiswas.length > 1 && (
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
        )}
      </Menu.Button>

      {allSiswas.length > 1 && (
        <Transition
          as={Fragment}
          enter="transition ease-out duration-180"
          enterFrom="transform opacity-0 scale-95 translate-y-1"
          enterTo="transform opacity-100 scale-100 translate-y-0"
          leave="transition ease-in duration-120"
          leaveFrom="transform opacity-100 scale-100 translate-y-0"
          leaveTo="transform opacity-0 scale-95 translate-y-1"
        >
          <Menu.Items
            className={classNames(
              'absolute right-0 z-[80] mt-2 w-72 origin-top-right overflow-hidden rounded-3xl',
              'border border-white/70 bg-white/95 p-2 shadow-2xl ring-1 ring-slate-900/5 backdrop-blur-xl',
              'focus:outline-none'
            )}
          >
            <div className="border-b border-slate-100 px-3 py-3">
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                Pilih Anak
              </p>
            </div>

            <div className="mt-2 space-y-1">
              {allSiswas.map((siswa) => {
                const active = siswa.id_siswa === activeSiswa?.id_siswa;

                return (
                  <Menu.Item key={siswa.id_siswa}>
                    {({ active: hover }) => (
                      <button
                        type="button"
                        onClick={() => handleSwitchSiswa(siswa.id_siswa)}
                        className={classNames(
                          'flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-all duration-200',
                          active
                            ? 'bg-emerald-50 text-emerald-700'
                            : hover
                              ? 'bg-slate-50 text-slate-900'
                              : 'text-slate-700'
                        )}
                      >
                        <div
                          className={classNames(
                            'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl font-black',
                            active
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-100 text-slate-500'
                          )}
                        >
                          {(siswa.nama_lengkap || 'A').slice(0, 1).toUpperCase()}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-black">
                            {siswa.nama_lengkap}
                          </div>

                          <div className="truncate text-xs font-semibold text-slate-400">
                            {siswa.kelas?.tingkat} {siswa.kelas?.jurusan} • {siswa.nis}
                          </div>
                        </div>

                        {active && (
                          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
                        )}
                      </button>
                    )}
                  </Menu.Item>
                );
              })}
            </div>
          </Menu.Items>
        </Transition>
      )}
    </Menu>
  );
}

function UserAvatar({ user, size = 'md' }) {
  const sizeClass = size === 'lg' ? 'h-11 w-11' : 'h-9 w-9';

  const avatarUrl = user?.foto_profil
    ? `/storage-public/${user.foto_profil.replace(/^\/+/, '')}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nama_lengkap || 'Pengguna')}&background=10b981&color=fff`;

  return (
    <img
      src={avatarUrl}
      alt={user?.nama_lengkap || 'Profil'}
      className={classNames(
        sizeClass,
        'rounded-2xl border border-white/70 bg-white object-cover shadow-sm ring-1 ring-slate-200/70'
      )}
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nama_lengkap || 'Pengguna')}&background=10b981&color=fff`;
      }}
    />
  );
}


function normalizeLogoUrl(url) {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) return url;
  return /storage/;
}

export default function OrangTuaLayout({ children, header = 'Panel Orang Tua/Wali' }) {
  const { props } = usePage();
  const { auth, flash, systemMode } = props;
  const isAbsensiMode = systemMode?.ortu === 'absensi';

  const user = auth?.user ?? { nama_lengkap: 'Pengguna' };
  const app = useMemo(() => props?.pengaturan || props?.app || {}, [props]);

  const orangTuaContext = useMemo(() => props?.orangTuaContext || null, [props]);
  const activeSiswa = orangTuaContext?.activeSiswa;
  const allSiswas = orangTuaContext?.allSiswas || [];

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  const handleSwitchSiswa = (id_siswa) => {
    if (activeSiswa?.id_siswa === id_siswa) return;

    const switchUrl = safeRoute('orangtua.switch-siswa');

    if (switchUrl === '#') {
      toast.error('Route switch siswa belum tersedia.');
      return;
    }

    router.post(
      switchUrl,
      { id_siswa },
      {
        preserveScroll: true,
      }
    );
  };

  const notifications = useMemo(
    () => [
      { id: 1, title: 'Pengumuman sekolah terbaru tersedia', time: '2 jam lalu' },
      { id: 2, title: 'Jurnal dan absensi perlu dipantau', time: '1 hari lalu' },
    ],
    []
  );

  const SIDEBAR_EXPANDED = 272;
  const SIDEBAR_COLLAPSED = 88;

  const SidebarContent = ({ isMobile = false }) => {
    const isCollapsed = !isMobile && collapsed;

    return (
      <>
        <div className={classNames('flex h-20 items-center', isMobile ? 'px-4' : isCollapsed ? 'justify-center px-3' : 'px-5')}>
          <Link
            href={safeRoute('orangtua.dashboard')}
            className="min-w-0"
            onClick={() => isMobile && setSidebarOpen(false)}
          >
            <Brand collapsed={isCollapsed} app={app} />
          </Link>
        </div>

        {!isCollapsed && (
          <div className="px-4">
            <div className="rounded-3xl border border-white/15 bg-white/10 p-3 text-white shadow-lg shadow-emerald-950/10 backdrop-blur-md">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-emerald-100/90">
                <Sparkles className="h-3.5 w-3.5" />
                Monitoring Ananda
              </div>

              <p className="mt-2 text-xs leading-relaxed text-white/70">
                Pantau absensi, jadwal, nilai, dan informasi sekolah dalam satu panel.
              </p>
            </div>
          </div>
        )}

        <nav
          className={classNames(
            'custom-scrollbar flex-1 space-y-1.5 overflow-y-auto py-4',
            isCollapsed ? 'px-3' : 'px-4'
          )}
          aria-label="Sidebar"
        >
          {getNavigationItems(isAbsensiMode).map((item) => (
            <NavItem
              key={item.name}
              item={item}
              collapsed={isCollapsed}
              onClick={() => isMobile && setSidebarOpen(false)}
            />
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

                  <div className="truncate text-xs font-semibold text-emerald-100/75">
                    Orang Tua / Wali
                  </div>
                </div>

                <Link
                  href={safeRoute('orangtua.profile.show')}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white"
                  title="Pengaturan"
                >
                  <Settings className="h-4.5 w-4.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <Link
                href={safeRoute('orangtua.profile.show')}
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white"
                title="Pengaturan"
              >
                <Settings className="h-5 w-5" />
              </Link>
            </div>
          )}
        </div>
      </>
    );
  };

  const DesktopSidebarToggle = () => (
    <button
      type="button"
      onClick={() => setCollapsed((value) => !value)}
      className={classNames(
        'fixed top-1/2 z-[70] hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full lg:flex',
        'border border-white/70 bg-white text-emerald-700 shadow-2xl shadow-slate-900/10 backdrop-blur-xl',
        'transition-all duration-300 hover:scale-105 hover:bg-emerald-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300'
      )}
      style={{ left: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED }}
      aria-label={collapsed ? 'Perlebar sidebar' : 'Ciutkan sidebar'}
      title={collapsed ? 'Perlebar sidebar' : 'Ciutkan sidebar'}
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
        {/* Desktop sidebar */}
        <aside
          className={classNames(
            'hidden overflow-hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col',
            'bg-gradient-to-b from-emerald-700 via-teal-800 to-sky-950 text-white',
            'shadow-[18px_0_60px_-35px_rgba(15,23,42,0.9)] transition-all duration-300',
            collapsed ? 'lg:w-[88px]' : 'lg:w-[272px]'
          )}
        >
          <div className="pointer-events-none absolute -left-16 top-10 h-56 w-56 rounded-full bg-emerald-300/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-20 h-64 w-64 rounded-full bg-sky-300/15 blur-3xl" />
          <div className="relative flex min-h-0 flex-1 flex-col">
            <SidebarContent />
          </div>
        </aside>

        <DesktopSidebarToggle />

        {/* Mobile sidebar */}
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
                <Dialog.Panel className="relative flex w-full max-w-[320px] flex-1 flex-col overflow-hidden bg-gradient-to-b from-emerald-700 via-teal-800 to-sky-950 text-white shadow-2xl">
                  <div className="pointer-events-none absolute -left-16 top-10 h-56 w-56 rounded-full bg-emerald-300/20 blur-3xl" />
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
                    <SidebarContent isMobile />
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Main content */}
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
              className="flex h-10 w-10 items-center justify-center rounded-2xl text-slate-700 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 lg:hidden"
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

                    <span className="hidden rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-700 sm:inline-flex">
                      Orang Tua
                    </span>
                  </div>

                  <div className="mt-0.5 hidden min-w-0 items-center gap-1.5 text-xs font-semibold text-slate-400 sm:flex">
                    <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">
                      {app?.nama_sekolah || 'Sekolah'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="hidden sm:block">
                    <StudentSwitcher
                      allSiswas={allSiswas}
                      activeSiswa={activeSiswa}
                      handleSwitchSiswa={handleSwitchSiswa}
                    />
                  </div>

                  {/* Notifications */}
                  <Menu as="div" className="relative">
                    <Menu.Button
                      className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/70 bg-white/80 text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                      aria-label="Notifikasi"
                    >
                      <Bell className="h-5 w-5" />
                      <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
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
                      <Menu.Items className="absolute right-0 z-[80] mt-2 w-80 origin-top-right overflow-hidden rounded-3xl border border-white/70 bg-white/95 p-2 shadow-2xl ring-1 ring-slate-900/5 backdrop-blur-xl focus:outline-none">
                        <div className="border-b border-slate-100 px-3 py-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-black text-slate-900">
                              Notifikasi
                            </p>

                            <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-black text-rose-600">
                              {notifications.length} Baru
                            </span>
                          </div>
                        </div>

                        <div className="mt-2 space-y-1">
                          {notifications.map((notification) => (
                            <Menu.Item key={notification.id}>
                              {({ active }) => (
                                <div
                                  className={classNames(
                                    'rounded-2xl px-3 py-2.5 transition',
                                    active ? 'bg-emerald-50' : 'bg-white'
                                  )}
                                >
                                  <div className="flex gap-3">
                                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                      <Bell className="h-4 w-4" />
                                    </div>

                                    <div className="min-w-0">
                                      <div className="text-sm font-black leading-snug text-slate-800">
                                        {notification.title}
                                      </div>

                                      <div className="mt-0.5 text-xs font-semibold text-slate-400">
                                        {notification.time}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Menu.Item>
                          ))}
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>

                  {/* Profile dropdown */}
                  <Menu as="div" className="relative">
                    <Menu.Button className="flex items-center gap-2 rounded-2xl border border-slate-200/70 bg-white/80 p-1.5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300">
                      <UserAvatar user={user} />

                      <span className="hidden min-w-0 lg:flex lg:items-center">
                        <span className="ml-1 max-w-[150px] truncate text-sm font-black leading-6 text-slate-800">
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
                      <Menu.Items className="absolute right-0 z-[80] mt-2 w-60 origin-top-right overflow-hidden rounded-3xl border border-white/70 bg-white/95 p-2 shadow-2xl ring-1 ring-slate-900/5 backdrop-blur-xl focus:outline-none">
                        <div className="border-b border-slate-100 px-3 py-3">
                          <p className="truncate text-sm font-black text-slate-900">
                            {user.nama_lengkap}
                          </p>

                          <p className="mt-0.5 text-xs font-semibold text-slate-400">
                            Orang Tua / Wali
                          </p>
                        </div>

                        <div className="mt-2 space-y-1">
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                href={safeRoute('orangtua.profile.show')}
                                className={classNames(
                                  'flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-bold transition',
                                  active
                                    ? 'bg-emerald-50 text-emerald-700'
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

              {/* Mobile student switcher */}
              {allSiswas.length > 0 && (
                <div className="mt-3 sm:hidden">
                  <StudentSwitcher
                    allSiswas={allSiswas}
                    activeSiswa={activeSiswa}
                    handleSwitchSiswa={handleSwitchSiswa}
                    compact
                  />
                </div>
              )}
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