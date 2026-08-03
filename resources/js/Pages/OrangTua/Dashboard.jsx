import React, { useMemo, useState } from 'react';
import OrangTuaLayout from '@/Layouts/OrangTuaLayout';
import { Head, Link } from '@inertiajs/react';
import {
  Book,
  User,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Megaphone,
  Clock,
  Menu,
  Flag,
  GraduationCap,
  Sparkles,
  Bell,
  X,
  Mail,
  TrendingUp,
  BarChart3,
  Activity,
  ShieldCheck,
} from 'lucide-react';
import AttendanceTrendChart from './Partials/AttendanceTrendChart';

// theme
import { useTheme } from '../../ThemeProvider';
import ThemeToggle from '../../components/ThemeToggle';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const clampStyle = (lines = 1) => ({
  display: '-webkit-box',
  WebkitLineClamp: lines,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  wordBreak: 'break-word',
});

const formatDateId = (date) => {
  if (!date) return '-';

  try {
    return new Date(date).toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return '-';
  }
};

const statusConfig = {
  Hadir: {
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    icon: CheckCircle,
  },
  Sakit: {
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    icon: AlertTriangle,
  },
  Izin: {
    className: 'bg-sky-50 text-sky-700 border-sky-200',
    dot: 'bg-sky-500',
    icon: ShieldCheck,
  },
  Alfa: {
    className: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
    icon: XCircle,
  },
  Belum: {
    className: 'bg-slate-50 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
    icon: Clock,
  },
};

const AttendanceStatusTag = ({ status }) => {
  const current = statusConfig[status] || statusConfig.Belum;
  const Icon = current.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1',
        'text-[11px] font-bold leading-none shadow-sm',
        current.className
      )}
      aria-label={`Status kehadiran: ${status}`}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', current.dot)} />
      <Icon className="h-3.5 w-3.5" />
      <span className="whitespace-nowrap">{status}</span>
    </span>
  );
};

const PremiumCard = ({ children, className = '', delay = 0 }) => (
  <div
    className={cn(
      'animate-dashboard-fade-up rounded-3xl border border-white/70 bg-white/85',
      'shadow-[0_20px_55px_-35px_rgba(15,23,42,0.45)] backdrop-blur-xl',
      'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_28px_70px_-35px_rgba(15,23,42,0.55)]',
      className
    )}
    style={{ animationDelay: `${delay}ms` }}
  >
    {children}
  </div>
);

const StatCard = ({ label, value, icon, iconClass, description, delay = 0 }) => (
  <PremiumCard className="group relative overflow-hidden p-4 sm:p-5" delay={delay}>
    <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-slate-100/80 blur-2xl transition-all duration-500 group-hover:scale-125" />

    <div className="relative flex items-center gap-4">
      <div
        className={cn(
          'flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg shadow-slate-200/70',
          'transition-transform duration-300 group-hover:scale-105',
          iconClass
        )}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <div className="text-2xl font-black leading-none tracking-tight text-slate-900 sm:text-3xl">
          {value}
        </div>

        <div className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500">
          {label}
        </div>

        {description && (
          <div className="mt-1 text-[11px] leading-snug text-slate-400" style={clampStyle(1)}>
            {description}
          </div>
        )}
      </div>
    </div>
  </PremiumCard>
);

const TabButton = ({ tab, activeTab, setActiveTab }) => {
  const Icon = tab.icon;
  const active = activeTab === tab.id;

  return (
    <button
      type="button"
      onClick={() => setActiveTab(tab.id)}
      aria-pressed={active}
      className={cn(
        'relative inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl px-3.5 py-2',
        'text-xs font-extrabold transition-all duration-300 sm:text-sm',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300',
        active
          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200'
          : 'bg-white/70 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
      )}
    >
      <Icon className={cn('h-4 w-4', active ? 'text-white' : 'text-slate-400')} />
      <span>{tab.label}</span>

      {active && (
        <span className="absolute inset-x-4 -bottom-1 h-1 rounded-full bg-emerald-300/80" />
      )}
    </button>
  );
};

const HistoryItem = ({ item }) => (
  <li className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3 transition-all duration-300 hover:border-emerald-100 hover:bg-emerald-50/50">
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm group-hover:text-emerald-500">
        <Calendar className="h-5 w-5" />
      </div>

      <div className="min-w-0">
        <div
          className="text-sm font-bold leading-snug text-slate-800"
          style={clampStyle(1)}
        >
          {formatDateId(item.tanggal)}
        </div>

        <div className="mt-0.5 text-xs font-medium text-slate-500">
          Masuk: {item.jam_masuk?.slice(0, 5) || 'Tidak masuk'}
        </div>
      </div>
    </div>

    <div className="shrink-0">
      <AttendanceStatusTag status={item.status_kehadiran} />
    </div>
  </li>
);

const AnnouncementMiniCard = ({ item, onOpen }) => (
  <li className="group rounded-2xl border border-slate-100 bg-slate-50/70 p-3 transition-all duration-300 hover:border-sky-100 hover:bg-sky-50/60">
    <button
      type="button"
      onClick={() => onOpen(item)}
      className="w-full text-left"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white text-sky-500 shadow-sm">
          <Bell className="h-4 w-4" />
        </div>

        <div className="min-w-0">
          <p
            className="text-sm font-bold leading-snug text-slate-800 group-hover:text-sky-700"
            style={clampStyle(2)}
          >
            {item.judul}
          </p>

          <p className="mt-1 text-[11px] font-medium text-slate-400">
            {new Date(item.tanggal_terbit).toLocaleDateString('id-ID')}
          </p>
        </div>
      </div>
    </button>
  </li>
);

const ScheduleItem = ({ jadwal }) => {
  const mapel = jadwal.mapel?.nama_mapel || '-';
  const guru = jadwal.guru?.nama_lengkap || '-';
  const mulai = jadwal.jam_mulai?.slice(0, 5) || '-';
  const selesai = jadwal.jam_selesai?.slice(0, 5) || '-';

  return (
    <div
      className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3 transition-all duration-300 hover:border-emerald-100 hover:bg-emerald-50/50"
      title={`${mapel}\nGuru: ${guru}\nJam: ${mulai} - ${selesai}`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
          <Clock className="h-4 w-4" />
        </div>

        <div className="min-w-0">
          <div
            className="text-sm font-bold leading-snug text-slate-800"
            style={clampStyle(1)}
          >
            {mapel}
          </div>

          <div
            className="mt-0.5 text-xs font-medium text-slate-500"
            style={clampStyle(1)}
          >
            {guru}
          </div>
        </div>
      </div>

      <div className="shrink-0 rounded-xl bg-white px-2.5 py-1 text-xs font-black text-emerald-700 shadow-sm">
        {mulai}
      </div>
    </div>
  );
};

export default function Dashboard({
  auth,
  siswa,
  absensiHariIni,
  riwayatAbsensi = [],
  absensiSummary = {},
  persentaseKehadiran = 0,
  pengumuman = [],
  jadwalHariIni = [],
  trenKehadiran = [],
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [openAnnouncements, setOpenAnnouncements] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [openReportModal, setOpenReportModal] = useState(false);

  const themeCtx = useTheme ? useTheme() : null;
  const theme = (themeCtx && themeCtx.theme) || {
    primary: 'bg-emerald-500',
    primaryText: 'text-white',
    primarySoftBg: 'bg-emerald-50',
    accent: 'bg-sky-500',
    danger: 'bg-rose-500',
    ring: 'ring-emerald-300',
    cardBorder: 'border-slate-100',
    mutedText: 'text-slate-500',
    avatarRing: 'ring-emerald-50',
    dotPrimary: 'bg-emerald-500',
  };

  const totalCounts = useMemo(
    () => ({
      hadir: absensiSummary.hadir || 0,
      sakit: absensiSummary.sakit || 0,
      izin: absensiSummary.izin || 0,
      alfa: absensiSummary.alfa || 0,
    }),
    [absensiSummary]
  );

  const displayedHistory = showAllHistory ? riwayatAbsensi : riwayatAbsensi.slice(0, 5);

  const studentName = siswa?.nama_panggilan || siswa?.nama_lengkap || 'Ananda';
  const studentClass = siswa?.kelas
    ? `${siswa.kelas.tingkat} ${siswa.kelas.jurusan || ''}`
    : '-';

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Book },
    { id: 'attendance', label: 'Kehadiran', icon: CheckCircle },
    { id: 'schedule', label: 'Jadwal', icon: Clock },
    { id: 'history', label: 'Riwayat', icon: Calendar },
  ];

  if (!siswa) {
    return (
      <OrangTuaLayout user={auth.user} header="Dashboard">
        <Head title="Dashboard Orang Tua" />

        <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-slate-50 via-emerald-50/30 to-sky-50 py-12">
          <div className="mx-auto max-w-3xl px-4">
            <PremiumCard className="p-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <AlertTriangle className="h-7 w-7" />
              </div>

              <h2 className="mt-4 text-lg font-black text-slate-900">
                Data siswa belum terhubung
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Akun Anda belum terhubung dengan data siswa. Silakan hubungi administrator sekolah.
              </p>
            </PremiumCard>
          </div>
        </div>
      </OrangTuaLayout>
    );
  }

  return (
    <OrangTuaLayout user={auth.user} header="Dashboard">
      <Head title="Dashboard Orang Tua" />

      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-emerald-50/35 to-sky-50/60 py-5 sm:py-6">
        {/* Decorative background */}
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-40 h-80 w-80 translate-x-24 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-indigo-200/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl space-y-5 px-3 sm:space-y-6 sm:px-6 lg:px-8">
          {/* Hero */}
          <PremiumCard className="relative overflow-hidden p-0" delay={0}>
            {/* Background Image & Overlay */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40" 
              style={{ backgroundImage: 'url(/images/bgdashboard.jpeg)', mixBlendMode: 'overlay' }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/90 via-teal-600/90 to-sky-700/90" />
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/15 blur-2xl" />
            <div className="absolute bottom-0 left-1/3 h-32 w-32 translate-y-10 rounded-full bg-emerald-200/20 blur-2xl" />

            <div className="relative p-4 text-white sm:p-6 lg:p-7">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-start gap-4 sm:items-center">
                  <div className="relative shrink-0">
                    <div className="absolute -inset-1 rounded-full bg-white/30 blur-sm" />
                    <img
                      className="relative h-16 w-16 rounded-3xl border border-white/30 object-cover shadow-xl sm:h-20 sm:w-20"
                      src={
                        siswa.foto_profil_url ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(siswa.nama_lengkap)}&background=14b8a6&color=fff`
                      }
                      alt={siswa.nama_lengkap}
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-50 backdrop-blur-md">
                      <GraduationCap className="h-3.5 w-3.5" />
                      Portal Orang Tua
                    </div>

                    <h1 className="mt-3 text-xl font-black leading-tight tracking-tight sm:text-2xl lg:text-3xl">
                      Halo, Wali dari{' '}
                      <span className="text-emerald-100">
                        {studentName}
                      </span>
                    </h1>

                    <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-white/85 sm:text-sm">
                      <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                        NIS: {siswa.nis || '-'}
                      </span>
                      <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                        Kelas: {studentClass}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row lg:items-center">
                  <Link
                    href={route('orangtua.profile.show')}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-black text-emerald-700 shadow-lg shadow-emerald-950/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-50"
                  >
                    <User className="h-4 w-4" />
                    Lihat Profil
                  </Link>

                  <button
                    type="button"
                    onClick={() => setOpenAnnouncements(true)}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-black text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/20"
                  >
                    <Megaphone className="h-4 w-4" />
                    Pengumuman
                  </button>
                </div>
              </div>
            </div>
          </PremiumCard>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Hadir"
              value={totalCounts.hadir}
              description="30 hari terakhir"
              icon={<CheckCircle className="h-6 w-6" />}
              iconClass="bg-gradient-to-br from-emerald-500 to-teal-500"
              delay={60}
            />

            <StatCard
              label="Izin"
              value={totalCounts.izin}
              description="Absensi izin"
              icon={<ShieldCheck className="h-6 w-6" />}
              iconClass="bg-gradient-to-br from-sky-500 to-cyan-500"
              delay={100}
            />

            <StatCard
              label="Sakit"
              value={totalCounts.sakit}
              description="Absensi sakit"
              icon={<AlertTriangle className="h-6 w-6" />}
              iconClass="bg-gradient-to-br from-amber-500 to-orange-500"
              delay={140}
            />

            <StatCard
              label="Alfa"
              value={totalCounts.alfa}
              description="Tanpa keterangan"
              icon={<XCircle className="h-6 w-6" />}
              iconClass="bg-gradient-to-br from-rose-500 to-pink-500"
              delay={180}
            />
          </div>

          {/* Tabs Container */}
          <PremiumCard className="overflow-hidden p-3 sm:p-4" delay={220}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0 overflow-x-auto hide-scrollbar">
                <div className="flex w-max items-center gap-2 rounded-3xl bg-slate-100/70 p-1.5">
                  {tabs.map((tab) => (
                    <TabButton
                      key={tab.id}
                      tab={tab}
                      activeTab={activeTab}
                      setActiveTab={setActiveTab}
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="hidden rounded-2xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-500 sm:block">
                  {new Date().toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-600 shadow-sm transition hover:bg-slate-100 sm:hidden"
                  aria-label="Menu"
                >
                  <Menu className="h-4 w-4" />
                </button>

                <div className="hidden sm:inline-flex">
                  <ThemeToggle />
                </div>

                <button
                  type="button"
                  onClick={() => setOpenReportModal(true)}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-3.5 py-2 text-xs font-black text-white shadow-lg shadow-emerald-200 transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                  aria-label="Laporkan Masalah"
                >
                  <Flag className="h-4 w-4" />
                  <span className="hidden sm:inline">Laporkan Masalah</span>
                </button>
              </div>
            </div>

            <div className="mt-4">
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <div className="space-y-4 lg:col-span-2">
                    {/* Kehadiran Hari Ini */}
                    <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-sm sm:p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-700 shadow-sm">
                            <Activity className="h-3.5 w-3.5" />
                            Kehadiran Hari Ini
                          </div>

                          {absensiHariIni ? (
                            <div className="mt-3 grid gap-2 sm:grid-cols-3">
                              <div className="rounded-2xl bg-white p-3 shadow-sm">
                                <p className="text-[11px] font-bold uppercase text-slate-400">
                                  Status
                                </p>
                                <p className="mt-1 text-sm font-black text-slate-800">
                                  {absensiHariIni.status_kehadiran}
                                </p>
                              </div>

                              <div className="rounded-2xl bg-white p-3 shadow-sm">
                                <p className="text-[11px] font-bold uppercase text-slate-400">
                                  Masuk
                                </p>
                                <p className="mt-1 text-sm font-black text-slate-800">
                                  {absensiHariIni.jam_masuk?.slice(0, 5) || '-'}
                                </p>
                              </div>

                              <div className="rounded-2xl bg-white p-3 shadow-sm">
                                <p className="text-[11px] font-bold uppercase text-slate-400">
                                  Pulang
                                </p>
                                <p className="mt-1 text-sm font-black text-slate-800">
                                  {absensiHariIni.jam_pulang?.slice(0, 5) || '-'}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <p className="mt-3 rounded-2xl bg-white p-3 text-sm font-semibold text-slate-600 shadow-sm">
                              Belum melakukan absensi hari ini.
                            </p>
                          )}
                        </div>

                        <div className="shrink-0">
                          <AttendanceStatusTag status={absensiHariIni?.status_kehadiran || 'Belum'} />
                        </div>
                      </div>
                    </div>

                    {/* Chart */}
                    <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-sky-700">
                            <TrendingUp className="h-3.5 w-3.5" />
                            Tren Kehadiran
                          </div>

                          <h3 className="mt-2 text-base font-black text-slate-900">
                            Grafik 30 Hari Terakhir
                          </h3>
                        </div>

                        <div className="text-xs font-bold text-slate-400">
                          Update otomatis dari data absensi
                        </div>
                      </div>

                      <div className="mt-4 h-56 sm:h-64">
                        <AttendanceTrendChart chartData={trenKehadiran} />
                      </div>
                    </div>

                    {/* Recent history */}
                    <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-indigo-700">
                            <Calendar className="h-3.5 w-3.5" />
                            Riwayat
                          </div>

                          <h3 className="mt-2 text-base font-black text-slate-900">
                            Riwayat Terakhir
                          </h3>
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowAllHistory((s) => !s)}
                          className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-black text-slate-600 transition hover:bg-slate-100"
                        >
                          {showAllHistory ? 'Tampilkan sedikit' : 'Lihat semua'}
                        </button>
                      </div>

                      <ul className="mt-4 space-y-2">
                        {displayedHistory.map((a) => (
                          <HistoryItem key={a.id_absensi} item={a} />
                        ))}

                        {riwayatAbsensi.length === 0 && (
                          <div className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                            Belum ada riwayat absensi.
                          </div>
                        )}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* KPI Ring */}
                    <div className="rounded-3xl border border-slate-100 bg-white p-4 text-center shadow-sm sm:p-5">
                      <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-700">
                        <BarChart3 className="h-3.5 w-3.5" />
                        Tingkat Kehadiran
                      </div>

                      <div className="mt-5">
                        <div className="relative mx-auto h-36 w-36">
                          <svg viewBox="0 0 36 36" className="h-full w-full" aria-hidden>
                            <path
                              strokeWidth="3"
                              stroke="#e2e8f0"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831"
                            />
                            <path
                              strokeWidth="3"
                              stroke="url(#attendanceGradient)"
                              strokeLinecap="round"
                              strokeDasharray={`${persentaseKehadiran}, 100`}
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831"
                            />
                            <defs>
                              <linearGradient id="attendanceGradient" x1="0" x2="1" y1="0" y2="1">
                                <stop offset="0%" stopColor="#10b981" />
                                <stop offset="100%" stopColor="#0ea5e9" />
                              </linearGradient>
                            </defs>
                          </svg>

                          <div className="absolute inset-0 flex items-center justify-center">
                            <div>
                              <div className="text-3xl font-black text-slate-900">
                                {persentaseKehadiran}%
                              </div>
                              <div className="text-[10px] font-bold uppercase text-slate-400">
                                Kehadiran
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
                          <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                            Hadir <strong>{totalCounts.hadir}</strong>
                          </div>
                          <div className="rounded-2xl bg-amber-50 p-3 text-amber-700">
                            Sakit <strong>{totalCounts.sakit}</strong>
                          </div>
                          <div className="rounded-2xl bg-sky-50 p-3 text-sky-700">
                            Izin <strong>{totalCounts.izin}</strong>
                          </div>
                          <div className="rounded-2xl bg-rose-50 p-3 text-rose-700">
                            Alfa <strong>{totalCounts.alfa}</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pengumuman compact */}
                    <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-amber-700">
                            <Megaphone className="h-3.5 w-3.5" />
                            Pengumuman
                          </div>

                          <h3 className="mt-2 text-base font-black text-slate-900">
                            Info Sekolah
                          </h3>
                        </div>

                        <button
                          type="button"
                          onClick={() => setOpenAnnouncements(true)}
                          className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-black text-slate-600 transition hover:bg-slate-100"
                        >
                          Semua
                        </button>
                      </div>

                      <ul className="mt-4 space-y-2">
                        {pengumuman.slice(0, 3).map((p) => (
                          <AnnouncementMiniCard
                            key={p.id_pengumuman}
                            item={p}
                            onOpen={setSelectedAnnouncement}
                          />
                        ))}

                        {pengumuman.length === 0 && (
                          <div className="rounded-2xl bg-slate-50 p-4 text-xs font-semibold text-slate-400">
                            Belum ada pengumuman.
                          </div>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'attendance' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                      label="Hadir"
                      value={totalCounts.hadir}
                      icon={<CheckCircle className="h-6 w-6" />}
                      iconClass="bg-gradient-to-br from-emerald-500 to-teal-500"
                    />
                    <StatCard
                      label="Sakit"
                      value={totalCounts.sakit}
                      icon={<AlertTriangle className="h-6 w-6" />}
                      iconClass="bg-gradient-to-br from-amber-500 to-orange-500"
                    />
                    <StatCard
                      label="Izin"
                      value={totalCounts.izin}
                      icon={<ShieldCheck className="h-6 w-6" />}
                      iconClass="bg-gradient-to-br from-sky-500 to-cyan-500"
                    />
                    <StatCard
                      label="Alfa"
                      value={totalCounts.alfa}
                      icon={<XCircle className="h-6 w-6" />}
                      iconClass="bg-gradient-to-br from-rose-500 to-pink-500"
                    />
                  </div>

                  <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
                    <h3 className="text-base font-black text-slate-900">
                      Detail Kehadiran
                    </h3>

                    <div className="mt-4 h-64">
                      <AttendanceTrendChart chartData={trenKehadiran} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'schedule' && (
                <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-700">
                        <Clock className="h-3.5 w-3.5" />
                        Jadwal Hari Ini
                      </div>

                      <h3 className="mt-2 text-base font-black text-slate-900">
                        Jadwal Pelajaran Hari Ini
                      </h3>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {jadwalHariIni.length > 0 ? (
                      jadwalHariIni.map((jadwal) => (
                        <ScheduleItem key={jadwal.id_jadwal} jadwal={jadwal} />
                      ))
                    ) : (
                      <div className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500 sm:col-span-2">
                        Tidak ada jadwal.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-indigo-700">
                        <Calendar className="h-3.5 w-3.5" />
                        Riwayat Absensi
                      </div>

                      <h3 className="mt-2 text-base font-black text-slate-900">
                        Semua Riwayat Absensi
                      </h3>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    {riwayatAbsensi.length > 0 ? (
                      riwayatAbsensi.map((a) => (
                        <HistoryItem key={a.id_absensi} item={a} />
                      ))
                    ) : (
                      <div className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                        Belum ada riwayat absensi.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </PremiumCard>
        </div>
      </div>

      {/* Announcement modal */}
      {openAnnouncements && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={() => setOpenAnnouncements(false)}
          />

          <div className="relative mx-3 mb-3 w-full max-w-2xl animate-modal-pop rounded-3xl border border-white/70 bg-white p-4 shadow-2xl sm:mb-0 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-lg font-black text-slate-900">
                  Pengumuman Sekolah
                </h4>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  Informasi terbaru dari sekolah
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpenAnnouncements(false)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-500 transition hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 max-h-80 space-y-3 overflow-auto pr-1 custom-scrollbar">
              {pengumuman.length > 0 ? (
                pengumuman.map((p) => (
                  <div
                    key={p.id_pengumuman}
                    className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3 transition hover:bg-sky-50/60"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-black leading-snug text-slate-800" style={clampStyle(2)}>
                          {p.judul}
                        </div>
                        <div className="mt-1 text-xs font-medium text-slate-400">
                          {new Date(p.tanggal_terbit).toLocaleDateString('id-ID')}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedAnnouncement(p)}
                        className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-black text-emerald-600 shadow-sm hover:bg-emerald-50"
                      >
                        Lihat
                      </button>
                    </div>

                    <div className="mt-2 text-sm leading-relaxed text-slate-600 line-clamp-3">
                      {p.isi}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                  Belum ada pengumuman.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Small detail modal for selected announcement */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={() => setSelectedAnnouncement(null)}
          />

          <div className="relative mx-3 w-full max-w-2xl animate-modal-pop rounded-3xl border border-white/70 bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-lg font-black leading-tight text-slate-900 break-words">
                  {selectedAnnouncement.judul}
                </h3>

                <div className="mt-1 text-xs font-bold text-slate-400">
                  {new Date(selectedAnnouncement.tanggal_terbit).toLocaleDateString('id-ID')}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAnnouncement(null)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-500 transition hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 max-h-[60vh] overflow-auto text-sm leading-relaxed text-slate-700 custom-scrollbar">
              {selectedAnnouncement.isi}
            </div>
          </div>
        </div>
      )}

      {/* Report modal */}
      {openReportModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={() => setOpenReportModal(false)}
          />

          <div className="relative mx-3 w-full max-w-md animate-modal-pop rounded-3xl border border-white/70 bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <AlertTriangle className="h-6 w-6" />
              </div>

              <div className="min-w-0">
                <h4 className="text-lg font-black leading-tight text-slate-900">
                  Laporkan Masalah
                </h4>

                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Fitur pelaporan masalah sedang dikembangkan. Untuk bantuan segera, silakan hubungi admin sekolah.
                </p>

                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setOpenReportModal(false)}
                    className="rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-200"
                  >
                    Tutup
                  </button>

                  <a
                    href="mailto:admin@sekolah.example"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-emerald-200 transition hover:brightness-105"
                  >
                    <Mail className="h-4 w-4" />
                    Hubungi Admin
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(148, 163, 184, 0.55) transparent;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.45);
          border-radius: 999px;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @keyframes dashboardFadeUp {
          from {
            opacity: 0;
            transform: translateY(14px) scale(0.985);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes modalPop {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-dashboard-fade-up {
          animation: dashboardFadeUp 520ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .animate-modal-pop {
          animation: modalPop 260ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
      `}</style>
    </OrangTuaLayout>
  );
}