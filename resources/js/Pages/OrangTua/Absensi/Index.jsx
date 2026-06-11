// resources/js/Pages/OrangTua/AbsensiIndex.jsx
import React, { useMemo, useState } from 'react';
import OrangTuaLayout from '@/Layouts/OrangTuaLayout';
import { Head, useForm } from '@inertiajs/react';
import {
  BookOpen,
  Clock,
  CheckCircle,
  Plus,
  Heart,
  AlertCircle,
  Filter,
  CalendarDays,
  ChevronRight,
  Sparkles,
  Search,
  XCircle,
  ShieldCheck,
  History,
  BarChart3,
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

const formatTime = (time) => time?.slice(0, 5) || '-';

const formatDateLong = (date) => {
  if (!date) return '-';

  try {
    return new Date(date + 'T00:00:00').toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '-';
  }
};

const statusTheme = {
  Hadir: {
    label: 'Hadir',
    soft: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    solid: 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white',
    dot: 'bg-emerald-500',
    icon: CheckCircle,
  },
  Izin: {
    label: 'Izin',
    soft: 'bg-sky-50 text-sky-700 border-sky-200',
    solid: 'bg-gradient-to-br from-sky-500 to-cyan-500 text-white',
    dot: 'bg-sky-500',
    icon: ShieldCheck,
  },
  Sakit: {
    label: 'Sakit',
    soft: 'bg-amber-50 text-amber-700 border-amber-200',
    solid: 'bg-gradient-to-br from-amber-500 to-orange-500 text-white',
    dot: 'bg-amber-500',
    icon: Heart,
  },
  Alfa: {
    label: 'Alfa',
    soft: 'bg-rose-50 text-rose-700 border-rose-200',
    solid: 'bg-gradient-to-br from-rose-500 to-pink-500 text-white',
    dot: 'bg-rose-500',
    icon: AlertCircle,
  },
  Belum: {
    label: 'Belum',
    soft: 'bg-slate-50 text-slate-600 border-slate-200',
    solid: 'bg-white text-slate-700 border border-slate-200',
    dot: 'bg-slate-400',
    icon: Clock,
  },
};

const AttendanceStatusTag = ({ status }) => {
  const current = statusTheme[status] || statusTheme.Belum;
  const Icon = current.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1',
        'text-[11px] font-black leading-none shadow-sm',
        current.soft
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

const LegendItem = ({ status }) => {
  const current = statusTheme[status];
  const Icon = current.icon;

  return (
    <div className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-white/80 px-3 py-2 shadow-sm">
      <div className={cn('flex h-7 w-7 items-center justify-center rounded-xl', current.solid)}>
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-xs font-bold text-slate-600">{status}</span>
    </div>
  );
};

const EmptyState = ({ icon: Icon = AlertCircle, title, description }) => (
  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-10 text-center">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-300 shadow-sm">
      <Icon className="h-6 w-6" />
    </div>

    <p className="mt-3 text-sm font-black text-slate-500">{title}</p>

    {description && (
      <p className="mt-1 text-xs leading-relaxed text-slate-400">
        {description}
      </p>
    )}
  </div>
);

const Calendar = ({
  month,
  year,
  absensiHarian = {},
  onDateClick,
  selectedDate,
}) => {
  const today = useMemo(() => {
    const d = new Date();

    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
  }, []);

  const monthDays = useMemo(() => {
    const firstOfMonth = new Date(year, month - 1, 1);
    const first = (firstOfMonth.getDay() + 6) % 7;
    const dim = new Date(year, month, 0).getDate();

    return Array.from({ length: first }, () => null).concat(
      Array.from({ length: dim }, (_, i) => i + 1)
    );
  }, [month, year]);

  return (
    <div className="w-full">
      <div className="mb-3 grid grid-cols-7 gap-1.5 sm:gap-2">
        {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day) => (
          <div
            key={day}
            className="rounded-2xl bg-slate-50 py-2 text-center text-[10px] font-black uppercase tracking-wide text-slate-400 sm:text-xs"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {monthDays.map((day, idx) => {
          if (!day) {
            return <div key={`empty-${idx}`} className="h-11 sm:h-12" />;
          }

          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(
            2,
            '0'
          )}`;
          const absen = absensiHarian[dateStr];
          const status = absen?.status_kehadiran || 'Belum';
          const current = statusTheme[status] || statusTheme.Belum;
          const Icon = current.icon;

          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;
          const isSunday = idx % 7 === 6;

          return (
            <div
              key={dateStr}
              className="group/date relative flex min-w-0 items-center justify-center"
            >
              <button
                type="button"
                onClick={() => onDateClick(dateStr)}
                aria-pressed={isSelected}
                aria-label={`Tanggal ${day} ${month} ${year}${absen ? `, status ${status}` : ''}`}
                className={cn(
                  'relative flex h-11 w-full max-w-[3rem] items-center justify-center rounded-2xl',
                  'text-sm font-black transition-all duration-300 sm:h-12 sm:max-w-[3.35rem]',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300',
                  absen
                    ? current.solid
                    : 'border border-slate-200 bg-white text-slate-800 hover:bg-slate-50',
                  isToday && 'ring-2 ring-sky-300 ring-offset-2',
                  isSelected && 'scale-105 ring-2 ring-emerald-400 ring-offset-2',
                  'hover:-translate-y-0.5 hover:shadow-lg'
                )}
              >
                <span className={cn(!absen && isSunday ? 'text-rose-600' : '')}>
                  {day}
                </span>

                {absen && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border border-white/40 bg-white/20 backdrop-blur">
                    <Icon className="h-3 w-3 text-white" />
                  </span>
                )}
              </button>

              {absen && (
                <div
                  className={cn(
                    'pointer-events-none absolute left-1/2 top-full z-50 mt-2 hidden w-52',
                    '-translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-3',
                    'text-left shadow-2xl group-hover/date:block'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className={cn('flex h-8 w-8 items-center justify-center rounded-xl', current.solid)}>
                      <Icon className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-xs font-black text-slate-900">
                        {absen.status_kehadiran}
                      </p>
                      <p className="text-[10px] font-semibold text-slate-400">
                        {formatDateLong(dateStr)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1 text-xs text-slate-600">
                    <p className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      Masuk: <strong>{formatTime(absen.jam_masuk)}</strong>
                    </p>

                    <p className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      Pulang: <strong>{formatTime(absen.jam_pulang)}</strong>
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <LegendItem status="Hadir" />
        <LegendItem status="Izin" />
        <LegendItem status="Sakit" />
        <LegendItem status="Alfa" />
      </div>
    </div>
  );
};

const DetailAbsensiPanel = ({
  selectedDate,
  absensiHarian = {},
  absensiMapel = {},
}) => {
  if (!selectedDate) {
    return (
      <PremiumCard className="self-start p-4 sm:p-5" delay={160}>
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
            <Search className="h-5 w-5" />
          </div>

          <div>
            <h3 className="text-base font-black text-slate-900">
              Detail Absensi
            </h3>
            <p className="text-xs font-medium text-slate-400">
              Pilih tanggal pada kalender
            </p>
          </div>
        </div>

        <EmptyState
          icon={CalendarDays}
          title="Belum ada tanggal dipilih"
          description="Klik salah satu tanggal untuk melihat detail absensi harian dan per mata pelajaran."
        />
      </PremiumCard>
    );
  }

  const harian = absensiHarian[selectedDate];
  const mapelList = absensiMapel[selectedDate] || [];

  return (
    <PremiumCard className="self-start p-4 sm:p-5" delay={160}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-sky-700">
            <CalendarDays className="h-3.5 w-3.5" />
            Detail Tanggal
          </div>

          <h3 className="mt-2 text-base font-black leading-tight text-slate-900">
            {formatDateLong(selectedDate)}
          </h3>
        </div>

        <AttendanceStatusTag status={harian?.status_kehadiran || 'Belum'} />
      </div>

      <div className="mt-4 rounded-3xl border border-slate-100 bg-slate-50/70 p-3">
        <p className="text-xs font-black uppercase tracking-wide text-slate-400">
          Absensi Harian
        </p>

        {harian ? (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-white p-3 shadow-sm">
              <p className="text-[10px] font-bold uppercase text-slate-400">
                Masuk
              </p>
              <p className="mt-1 text-sm font-black text-slate-800">
                {formatTime(harian.jam_masuk)}
              </p>
            </div>

            <div className="rounded-2xl bg-white p-3 shadow-sm">
              <p className="text-[10px] font-bold uppercase text-slate-400">
                Pulang
              </p>
              <p className="mt-1 text-sm font-black text-slate-800">
                {formatTime(harian.jam_pulang)}
              </p>
            </div>
          </div>
        ) : (
          <p className="mt-3 rounded-2xl bg-white p-3 text-xs font-semibold text-slate-500 shadow-sm">
            Tidak ada data absensi harian.
          </p>
        )}
      </div>

      <div className="mt-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm font-black text-slate-900">
            Absensi per Mata Pelajaran
          </p>

          <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-black text-slate-500">
            {mapelList.length} Mapel
          </span>
        </div>

        <div className="max-h-96 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
          {mapelList.length > 0 ? (
            mapelList.map((absen) => {
              const mapelName = absen.jadwal?.mapel?.nama_mapel || '-';
              const jam = `${formatTime(absen.jam_mulai)} - ${formatTime(absen.jam_selesai)}`;

              return (
                <div
                  key={absen.id_absensi_mapel}
                  className="group rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition-all duration-300 hover:border-emerald-100 hover:bg-emerald-50/40"
                  title={`${mapelName}\nJam: ${jam}\nStatus: ${absen.status_kehadiran}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                        <BookOpen className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <p
                          className="text-sm font-black leading-snug text-slate-800"
                          style={clampStyle(2)}
                        >
                          {mapelName}
                        </p>

                        <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                          <Clock className="h-3.5 w-3.5" />
                          {jam}
                        </p>
                      </div>
                    </div>

                    <AttendanceStatusTag status={absen.status_kehadiran} />
                  </div>
                </div>
              );
            })
          ) : (
            <EmptyState
              icon={BookOpen}
              title="Tidak ada jadwal pelajaran"
              description="Belum ada data absensi mapel pada tanggal ini."
            />
          )}
        </div>
      </div>
    </PremiumCard>
  );
};

const RiwayatTab = ({ riwayatKehadiran = { data: [], links: [] }, filters = {} }) => {
  const { data, setData, get, processing } = useForm({
    status: filters.status || 'Semua',
    tanggal_mulai: filters.tanggal_mulai || '',
    tanggal_selesai: filters.tanggal_selesai || '',
  });

  const handleFilterSubmit = (e) => {
    e.preventDefault();

    get(route('orangtua.absensi.index'), {
      data: { ...data, tab: 'riwayat' },
      preserveState: true,
      preserveScroll: true,
    });
  };

  const rows = riwayatKehadiran.data || [];

  return (
    <PremiumCard className="p-4 sm:p-5" delay={120}>
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-indigo-700">
            <History className="h-3.5 w-3.5" />
            Riwayat Kehadiran
          </div>

          <h2 className="mt-2 text-lg font-black text-slate-900">
            Data Absensi Ananda
          </h2>

          <p className="mt-1 text-xs font-medium text-slate-500">
            Gunakan filter untuk melihat riwayat berdasarkan status atau rentang tanggal.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleFilterSubmit}
        className="mb-5 grid grid-cols-1 gap-3 rounded-3xl border border-slate-100 bg-slate-50/70 p-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div>
          <label htmlFor="status" className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
            Status
          </label>

          <select
            id="status"
            value={data.status}
            onChange={(e) => setData('status', e.target.value)}
            className="min-h-11 w-full rounded-2xl border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm focus:border-emerald-400 focus:ring-emerald-300"
          >
            <option>Semua</option>
            <option>Hadir</option>
            <option>Sakit</option>
            <option>Izin</option>
            <option>Alfa</option>
            <option>Terlambat</option>
          </select>
        </div>

        <div>
          <label htmlFor="tanggal_mulai" className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
            Dari Tanggal
          </label>

          <input
            type="date"
            id="tanggal_mulai"
            value={data.tanggal_mulai}
            onChange={(e) => setData('tanggal_mulai', e.target.value)}
            className="min-h-11 w-full rounded-2xl border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm focus:border-emerald-400 focus:ring-emerald-300"
          />
        </div>

        <div>
          <label htmlFor="tanggal_selesai" className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
            Sampai Tanggal
          </label>

          <input
            type="date"
            id="tanggal_selesai"
            value={data.tanggal_selesai}
            onChange={(e) => setData('tanggal_selesai', e.target.value)}
            className="min-h-11 w-full rounded-2xl border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm focus:border-emerald-400 focus:ring-emerald-300"
          />
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={processing}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-emerald-200 transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Filter className="h-4 w-4" />
            {processing ? 'Memfilter...' : 'Filter'}
          </button>
        </div>
      </form>

      {/* Mobile cards */}
      <div className="space-y-2 md:hidden">
        {rows.length > 0 ? (
          rows.map((absen) => (
            <div
              key={absen.id_absensi}
              className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-black leading-snug text-slate-900">
                    {formatDateLong(absen.tanggal)}
                  </p>

                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    Masuk: {formatTime(absen.jam_masuk)} • Pulang: {formatTime(absen.jam_pulang)}
                  </p>
                </div>

                <AttendanceStatusTag status={absen.status_kehadiran} />
              </div>

              <div
                className={cn(
                  'mt-3 rounded-2xl px-3 py-2 text-xs font-black',
                  absen.menit_keterlambatan > 0
                    ? 'bg-rose-50 text-rose-700'
                    : 'bg-emerald-50 text-emerald-700'
                )}
              >
                {absen.menit_keterlambatan > 0
                  ? `${absen.menit_keterlambatan} menit terlambat`
                  : 'Tepat Waktu'}
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            icon={AlertCircle}
            title="Tidak ada data"
            description="Tidak ada data riwayat yang ditemukan."
          />
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-3xl border border-slate-100 md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th scope="col" className="px-5 py-4 font-black">
                Tanggal
              </th>
              <th scope="col" className="px-5 py-4 font-black">
                Status
              </th>
              <th scope="col" className="px-5 py-4 font-black">
                Jam Masuk
              </th>
              <th scope="col" className="px-5 py-4 font-black">
                Jam Pulang
              </th>
              <th scope="col" className="px-5 py-4 font-black">
                Keterlambatan
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.map((absen) => (
              <tr
                key={absen.id_absensi}
                className="transition hover:bg-emerald-50/30"
              >
                <td className="px-5 py-4 font-bold text-slate-900">
                  {formatDateLong(absen.tanggal)}
                </td>

                <td className="px-5 py-4">
                  <AttendanceStatusTag status={absen.status_kehadiran} />
                </td>

                <td className="px-5 py-4 font-semibold text-slate-600">
                  {formatTime(absen.jam_masuk)}
                </td>

                <td className="px-5 py-4 font-semibold text-slate-600">
                  {formatTime(absen.jam_pulang)}
                </td>

                <td
                  className={cn(
                    'px-5 py-4 font-black',
                    absen.menit_keterlambatan > 0
                      ? 'text-rose-600'
                      : 'text-emerald-600'
                  )}
                >
                  {absen.menit_keterlambatan > 0
                    ? `${absen.menit_keterlambatan} menit`
                    : 'Tepat Waktu'}
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center">
                  <AlertCircle className="mx-auto mb-2 h-12 w-12 text-slate-300" />
                  <p className="text-sm font-bold text-slate-500">
                    Tidak ada data riwayat yang ditemukan.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination links={riwayatKehadiran.links} className="mt-6" />
    </PremiumCard>
  );
};

export default function AbsensiIndex({
  auth,
  siswa,
  absensiHarian = {},
  absensiMapel = {},
  riwayatKehadiran = { data: [], links: [] },
  filters = {},
}) {
  const [activeTab, setActiveTab] = useState(filters.tab || 'kalender');
  const [selectedDate, setSelectedDate] = useState(null);

  const { data, setData, get, processing } = useForm({
    bulan: filters.bulan || new Date().getMonth() + 1,
    tahun: filters.tahun || new Date().getFullYear(),
  });

  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const monthlySummary = useMemo(() => {
    const summary = {
      Hadir: 0,
      Izin: 0,
      Sakit: 0,
      Alfa: 0,
    };

    Object.values(absensiHarian || {}).forEach((item) => {
      if (summary[item.status_kehadiran] !== undefined) {
        summary[item.status_kehadiran] += 1;
      }
    });

    return summary;
  }, [absensiHarian]);

  const handleMonthYearChange = (e) => {
    e.preventDefault();

    get(route('orangtua.absensi.index'), {
      data,
      preserveState: true,
    });
  };

  const tabs = [
    {
      id: 'kalender',
      label: 'Kalender',
      icon: CalendarDays,
    },
    {
      id: 'riwayat',
      label: 'Riwayat Kehadiran',
      icon: History,
    },
  ];

  const namaSiswa = siswa?.nama_panggilan || siswa?.nama_lengkap || 'Ananda';
  const kelasSiswa = siswa?.kelas
    ? `${siswa.kelas.tingkat} ${siswa.kelas.jurusan || ''}`
    : '-';

  return (
    <OrangTuaLayout user={auth.user} header="Riwayat Absensi Ananda">
      <Head title="Absensi" />

      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-emerald-50/35 to-sky-50/60 py-5 sm:py-6">
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-40 h-80 w-80 translate-x-24 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-indigo-200/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl space-y-5 px-3 sm:space-y-6 sm:px-6 lg:px-8">
          {/* Hero */}
          <PremiumCard className="relative overflow-hidden p-0" delay={0}>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-700" />
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/15 blur-2xl" />
            <div className="absolute bottom-0 left-1/3 h-32 w-32 translate-y-10 rounded-full bg-emerald-200/20 blur-2xl" />

            <div className="relative p-4 text-white sm:p-6 lg:p-7">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-50 backdrop-blur-md">
                    <Sparkles className="h-3.5 w-3.5" />
                    Monitoring Kehadiran
                  </div>

                  <h1 className="mt-3 text-xl font-black leading-tight tracking-tight sm:text-2xl lg:text-3xl">
                    Riwayat Absensi{' '}
                    <span className="text-emerald-100">
                      {namaSiswa}
                    </span>
                  </h1>

                  <p className="mt-2 max-w-3xl text-sm font-medium leading-relaxed text-white/80">
                    Pantau kehadiran harian dan absensi per mata pelajaran dengan tampilan kalender yang ringkas dan mudah dibaca.
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-white/90">
                    <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                      Kelas: {kelasSiswa}
                    </span>

                    <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                      Bulan: {months[Number(data.bulan) - 1]} {data.tahun}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:min-w-[420px]">
                  {[
                    ['Hadir', monthlySummary.Hadir],
                    ['Izin', monthlySummary.Izin],
                    ['Sakit', monthlySummary.Sakit],
                    ['Alfa', monthlySummary.Alfa],
                  ].map(([label, value]) => {
                    const current = statusTheme[label];
                    const Icon = current.icon;

                    return (
                      <div
                        key={label}
                        className="rounded-3xl border border-white/15 bg-white/10 p-3 text-center backdrop-blur-md"
                      >
                        <Icon className="mx-auto h-5 w-5 text-white/90" />
                        <p className="mt-2 text-2xl font-black leading-none">
                          {value}
                        </p>
                        <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-white/70">
                          {label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </PremiumCard>

          {/* Tabs */}
          <PremiumCard className="p-3 sm:p-4" delay={80}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="overflow-x-auto hide-scrollbar">
                <div className="flex w-max items-center gap-2 rounded-3xl bg-slate-100/70 p-1.5">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.id;

                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          'relative inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl px-3.5 py-2',
                          'text-xs font-black transition-all duration-300 sm:text-sm',
                          'focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300',
                          active
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200'
                            : 'bg-white/70 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                        )}
                      >
                        <Icon className={cn('h-4 w-4', active ? 'text-white' : 'text-slate-400')} />
                        {tab.label}

                        {active && (
                          <span className="absolute inset-x-4 -bottom-1 h-1 rounded-full bg-emerald-300/80" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {activeTab === 'kalender' && (
                <form
                  onSubmit={handleMonthYearChange}
                  className="flex flex-col gap-2 rounded-3xl bg-slate-50/80 p-2 sm:flex-row sm:items-center"
                >
                  <select
                    value={data.bulan}
                    onChange={(e) => setData('bulan', e.target.value)}
                    className="min-h-10 rounded-2xl border-slate-200 bg-white text-sm font-bold text-slate-700 shadow-sm focus:border-emerald-400 focus:ring-emerald-300"
                  >
                    {months.map((month, i) => (
                      <option key={month} value={i + 1}>
                        {month}
                      </option>
                    ))}
                  </select>

                  <select
                    value={data.tahun}
                    onChange={(e) => setData('tahun', e.target.value)}
                    className="min-h-10 rounded-2xl border-slate-200 bg-white text-sm font-bold text-slate-700 shadow-sm focus:border-emerald-400 focus:ring-emerald-300"
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>

                  <button
                    type="submit"
                    disabled={processing}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-black text-white shadow-lg shadow-emerald-200 transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <BarChart3 className="h-4 w-4" />
                    {processing ? 'Memuat...' : 'Tampilkan'}
                  </button>
                </form>
              )}
            </div>
          </PremiumCard>

          {activeTab === 'kalender' && (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              <PremiumCard className="p-4 sm:p-5 lg:col-span-2" delay={120}>
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-700">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Tampilan Kalender
                    </div>

                    <h2 className="mt-2 text-lg font-black text-slate-900">
                      {months[Number(data.bulan) - 1]} {data.tahun}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-500">
                    Klik tanggal
                    <ChevronRight className="h-3.5 w-3.5" />
                    lihat detail
                  </div>
                </div>

                <Calendar
                  month={Number(data.bulan)}
                  year={Number(data.tahun)}
                  absensiHarian={absensiHarian}
                  onDateClick={setSelectedDate}
                  selectedDate={selectedDate}
                />
              </PremiumCard>

              <DetailAbsensiPanel
                selectedDate={selectedDate}
                absensiHarian={absensiHarian}
                absensiMapel={absensiMapel}
              />
            </div>
          )}

          {activeTab === 'riwayat' && (
            <RiwayatTab
              riwayatKehadiran={riwayatKehadiran}
              filters={filters}
            />
          )}
        </div>
      </div>

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