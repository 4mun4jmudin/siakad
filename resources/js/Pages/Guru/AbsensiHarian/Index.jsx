// resources/js/Pages/Guru/AbsensiHarian/Index.jsx

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import GuruLayout from '@/Layouts/GuruLayout';
import toast from 'react-hot-toast';
import {
  LogIn,
  LogOut,
  CheckCircle2,
  Plus,
  Calendar,
  AlertTriangle,
  X,
  Sparkles,
  Clock3,
  Timer,
  ShieldCheck,
  History,
  Filter,
  RefreshCw,
  CalendarDays,
  ClipboardCheck,
  FileText,
  BriefcaseBusiness,
  Stethoscope,
  Send,
  Loader2,
  Info,
  Lock,
  Coffee,
  Activity,
  Award,
  UserCheck,
} from 'lucide-react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const hhmm = (time) => (time ? String(time).slice(0, 5) : null);

function safeRoute(name, params = {}, fallback = '#') {
  try {
    return route(name, params);
  } catch {
    return fallback;
  }
}

function statusLabel(status) {
  return status || 'Belum Absen';
}

function statusTone(status) {
  const map = {
    Hadir: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    Izin: 'border-sky-200 bg-sky-50 text-sky-700',
    'Dinas Luar': 'border-indigo-200 bg-indigo-50 text-indigo-700',
    Sakit: 'border-amber-200 bg-amber-50 text-amber-700',
    Alfa: 'border-rose-200 bg-rose-50 text-rose-700',
    'Belum Absen': 'border-rose-200 bg-rose-50 text-rose-700',
    'Tidak Ada Jadwal': 'border-slate-200 bg-slate-50 text-slate-600',
  };

  return map[status] || 'border-slate-200 bg-slate-50 text-slate-600';
}

function statusIcon(status) {
  const map = {
    Hadir: CheckCircle2,
    Izin: Info,
    'Dinas Luar': BriefcaseBusiness,
    Sakit: Stethoscope,
    Alfa: AlertTriangle,
    'Belum Absen': AlertTriangle,
    'Tidak Ada Jadwal': CalendarDays,
  };

  return map[status] || Info;
}

function formatDateId(value, options = {}) {
  if (!value) return '-';

  try {
    return new Date(value).toLocaleDateString('id-ID', options);
  } catch {
    return value;
  }
}

function PremiumCard({ children, className = '', delay = 0 }) {
  return (
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
}

function StatusBadge({ status, className = '' }) {
  const Icon = statusIcon(status);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-wide',
        statusTone(status),
        className
      )}
    >
      <Icon className="h-4 w-4" />
      {statusLabel(status)}
    </span>
  );
}

function HeroStat({ label, value, icon: Icon }) {
  return (
    <div className="rounded-3xl border border-white/15 bg-white/10 p-3 text-center backdrop-blur-md">
      <Icon className="mx-auto h-5 w-5 text-white/90" />

      <p className="mt-2 text-2xl font-black leading-none text-white">
        {value}
      </p>

      <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-white/70">
        {label}
      </p>
    </div>
  );
}

function InfoTile({ label, value, icon: Icon, tone = 'indigo' }) {
  const tones = {
    indigo: 'bg-indigo-50 text-indigo-700',
    sky: 'bg-sky-50 text-sky-700',
    violet: 'bg-violet-50 text-violet-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-700',
    slate: 'bg-slate-50 text-slate-700',
  };

  return (
    <div className="rounded-3xl border border-slate-100 bg-slate-50/70 p-4">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-sm',
            tones[tone] || tones.indigo
          )}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <div className="mt-1 text-sm font-black leading-relaxed text-slate-800">
            {value ?? '-'}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  disabled = false,
  icon: Icon,
  tone = 'primary',
  type = 'button',
  className = '',
}) {
  const tones = {
    primary:
      'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200 hover:brightness-105',
    emerald:
      'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-200 hover:brightness-105',
    sky:
      'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-lg shadow-sky-200 hover:brightness-105',
    outline:
      'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
    rose:
      'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-200 hover:brightness-105',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-black transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60',
        tones[tone] || tones.primary,
        className
      )}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}

function FieldError({ message }) {
  if (!message) return null;

  return (
    <p className="mt-1.5 text-xs font-semibold text-rose-600">
      {message}
    </p>
  );
}

export default function Index(props) {
  const {
    auth,
    absensiHariIni = null,
    jadwalHariIni = null,
    canPulang = false,
    history = [],
    login_manual_enabled = true,
    filter: serverFilter = 'week',
    filter_date: serverFilterDate,
    pengaturanAbsensi: pengaturan,
    yesterday_unfinished = false,
    flash,
  } = props;

  const [now, setNow] = useState(new Date());
  const [filter, setFilter] = useState(serverFilter);
  const [dateValue, setDateValue] = useState(
    serverFilterDate || new Date().toISOString().slice(0, 10)
  );
  const [showIzinModal, setShowIzinModal] = useState(false);

  const shownFlashRef = useRef(new Set());

  useEffect(() => {
    const intervalId = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(intervalId);
  }, []);

  const timeLabel = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const todayLong = now.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('shownFlashMessages:v1');
      if (raw) shownFlashRef.current = new Set(JSON.parse(raw));
    } catch { }
  }, []);

  useEffect(() => {
    const show = (type, msg) => {
      if (!msg) return;

      const list = Array.isArray(msg) ? msg : [msg];

      list.forEach((message) => {
        const key = `${type}:${message}`;

        if (!shownFlashRef.current.has(key)) {
          shownFlashRef.current.add(key);

          try {
            sessionStorage.setItem(
              'shownFlashMessages:v1',
              JSON.stringify(Array.from(shownFlashRef.current))
            );
          } catch { }

          if (type === 'success') toast.success(message);
          else if (type === 'error') toast.error(message);
          else toast(message);
        }
      });
    };

    show('success', flash?.success);
    show('error', flash?.error);
    show('info', flash?.info);
  }, [flash]);

  useEffect(() => {
    if (yesterday_unfinished) {
      toast(
        (toastItem) => (
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-500" />
            <div>
              <div className="font-semibold">Kemarin belum absen pulang</div>
              <div className="text-sm">Hubungi admin jika butuh pembetulan.</div>
            </div>

            <button
              type="button"
              onClick={() => toast.dismiss(toastItem.id)}
              className="ml-2 text-xs text-gray-400 hover:text-gray-700"
            >
              Tutup
            </button>
          </div>
        ),
        { duration: 7000 }
      );
    }
  }, [yesterday_unfinished]);

  const formatPeriodLabel = () => {
    if (!dateValue) return '';

    const date = new Date(dateValue);

    if (filter === 'day') {
      return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    }

    if (filter === 'week') {
      const day = date.getDay();
      const isoDow = day === 0 ? 7 : day;
      const monday = new Date(date);
      monday.setDate(date.getDate() - (isoDow - 1));

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      const fmt = (dt) =>
        dt.toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });

      return `${fmt(monday)} — ${fmt(sunday)}`;
    }

    if (filter === 'month') {
      return date.toLocaleDateString('id-ID', {
        month: 'long',
        year: 'numeric',
      });
    }

    return '';
  };

  const applyFilter = (newFilter = filter, newDate = dateValue) => {
    let dateParam = newDate || new Date().toISOString().slice(0, 10);

    if (newFilter === 'month') {
      if (dateParam.length === 7) dateParam = `${dateParam}-01`;
      else dateParam = dateParam.slice(0, 10);
    }

    router.get(
      safeRoute('guru.absensi-harian.index'),
      { filter: newFilter, date: dateParam },
      { preserveState: true, preserveScroll: true }
    );
  };

  const onFilterChange = (newFilter) => {
    setFilter(newFilter);
    let newDate = dateValue;

    if (newFilter === 'month') {
      const date = dateValue ? new Date(dateValue) : new Date();
      const month = date.toISOString().slice(0, 7);
      newDate = `${month}-01`;
      setDateValue(newDate);
    } else {
      newDate = dateValue ? dateValue.slice(0, 10) : new Date().toISOString().slice(0, 10);
      setDateValue(newDate);
    }
    
    applyFilter(newFilter, newDate);
  };

  const onDateChange = (event) => {
    const value = event.target.value;
    let newDate = value;

    if (filter === 'month') {
      newDate = `${value}-01`;
      setDateValue(newDate);
    } else {
      setDateValue(value);
    }
    
    applyFilter(filter, newDate);
  };

  const absStatus = useMemo(() => {
    if (!absensiHariIni) return 'Belum Absen';
    return (absensiHariIni.status_kehadiran || absensiHariIni.status || 'Belum Absen').trim();
  }, [absensiHariIni]);

  const jamMasuk = hhmm(absensiHariIni?.jam_masuk);
  const jamPulang = hhmm(absensiHariIni?.jam_pulang);
  const jadwalMulai = hhmm(jadwalHariIni?.jam_mulai);
  const jadwalSelesai = hhmm(jadwalHariIni?.jam_selesai);

  const isIzinSakitDL = ['Izin', 'Sakit', 'Dinas Luar'].includes(absStatus);
  const isManualDisabled =
    !login_manual_enabled || pengaturan?.absensi_manual_guru_enabled === false;

  const { post: postAction } = useForm();

  const izinForm = useForm({
    status: 'Sakit',
    tanggal: new Date().toISOString().slice(0, 10),
    keterangan: '',
  });

  const handleMasuk = (event) => {
    event?.preventDefault();

    if (isManualDisabled) {
      toast.error('Absensi manual nonaktif.');
      return;
    }

    if (isIzinSakitDL) {
      toast.error('Anda sedang berstatus Sakit/Izin/Dinas Luar. Hubungi admin bila perlu perubahan.');
      return;
    }

    if (absensiHariIni?.jam_masuk) {
      toast('Anda sudah absen masuk.');
      return;
    }

    postAction(safeRoute('guru.absensi-harian.store'), {
      preserveScroll: true,
    });
  };

  const handlePulang = (event) => {
    event?.preventDefault();

    if (isIzinSakitDL) {
      toast.error('Anda berstatus Sakit/Izin/Dinas Luar — tidak perlu absen pulang.');
      return;
    }

    if (!absensiHariIni?.jam_masuk) {
      toast.error('Anda belum absen masuk.');
      return;
    }

    if (absensiHariIni?.jam_pulang) {
      toast('Anda sudah absen pulang.');
      return;
    }

    if (!canPulang) {
      toast.error(`Belum waktunya absen pulang. Jadwal pulang ${jadwalSelesai || '-'}.`);
      return;
    }

    postAction(safeRoute('guru.absensi-harian.store'), {
      preserveScroll: true,
    });
  };

  const submitIzin = (event) => {
    event?.preventDefault();

    if ((izinForm.data.keterangan || '').trim().length < 3) {
      toast.error('Keterangan minimal 3 karakter.');
      return;
    }

    izinForm.post(safeRoute('guru.absensi-harian.izin'), {
      preserveScroll: true,
      onSuccess: () => {
        setShowIzinModal(false);
        izinForm.reset();
      },
    });
  };

  const historyStats = useMemo(() => {
    const result = {
      total: Array.isArray(history) ? history.length : 0,
      hadir: 0,
      sakitIzin: 0,
      alfa: 0,
      selesai: 0,
    };

    if (!Array.isArray(history)) return result;

    history.forEach((item) => {
      if (item.status === 'Hadir') result.hadir += 1;
      if (['Sakit', 'Izin', 'Dinas Luar'].includes(item.status)) result.sakitIzin += 1;
      if (item.status === 'Alfa' || item.status === 'Belum Absen') result.alfa += 1;
      if (item.jam_masuk && item.jam_pulang) result.selesai += 1;
    });

    return result;
  }, [history]);

  const actionContent = () => {
    if (isIzinSakitDL) {
      return (
        <ActionButton
          tone="outline"
          icon={Plus}
          onClick={() => setShowIzinModal(true)}
        >
          Ajukan Perubahan
        </ActionButton>
      );
    }

    if (absensiHariIni?.jam_masuk) {
      if (absensiHariIni?.jam_pulang) {
        return (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-emerald-700">
            <CheckCircle2 className="mx-auto h-9 w-9" />
            <p className="mt-1 text-sm font-black">Absensi hari ini selesai</p>
            <p className="text-xs font-semibold">
              {jamMasuk || '-'} — {jamPulang || '-'}
            </p>
          </div>
        );
      }

      return (
        <div className="flex flex-col gap-2 sm:flex-row">
          <ActionButton
            tone="emerald"
            icon={LogOut}
            onClick={handlePulang}
          >
            Absen Pulang
          </ActionButton>

          <ActionButton
            tone="outline"
            icon={Plus}
            onClick={() => setShowIzinModal(true)}
          >
            Sakit / Izin / DL
          </ActionButton>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2 sm:flex-row">
        <ActionButton
          tone="primary"
          icon={LogIn}
          onClick={handleMasuk}
          disabled={isManualDisabled}
        >
          Absen Masuk
        </ActionButton>

        <ActionButton
          tone="outline"
          icon={Plus}
          onClick={() => setShowIzinModal(true)}
        >
          Sakit / Izin / DL
        </ActionButton>
      </div>
    );
  };

  const renderHistoryTable = () => {
    if (!Array.isArray(history) || history.length === 0) {
      return (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-14 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-slate-300 shadow-sm">
            <History className="h-8 w-8" />
          </div>

          <h3 className="mt-4 text-base font-black text-slate-700">
            Tidak ada data untuk periode ini
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
            Coba pilih periode lain untuk melihat riwayat kehadiran.
          </p>
        </div>
      );
    }

    return (
      <PremiumCard className="overflow-hidden p-0" delay={140}>
        <div className="hidden overflow-x-auto lg:block">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-4 font-black">Tanggal</th>
                <th className="px-5 py-4 font-black">Hari</th>
                <th className="px-5 py-4 font-black">Jadwal</th>
                <th className="px-5 py-4 font-black">Status</th>
                <th className="px-5 py-4 font-black">Jam Masuk</th>
                <th className="px-5 py-4 font-black">Jam Pulang</th>
                <th className="px-5 py-4 font-black">Metode</th>
                <th className="px-5 py-4 font-black">Keterangan</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {history.map((item, index) => (
                <tr
                  key={`${item.tanggal}-${index}`}
                  className="transition hover:bg-indigo-50/35"
                >
                  <td className="whitespace-nowrap px-5 py-4 font-bold text-slate-700">
                    {formatDateId(item.tanggal, {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                    {item.hari}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    <span
                      className={cn(
                        'inline-flex rounded-full border px-2.5 py-1 text-[11px] font-black uppercase tracking-wide',
                        item.has_schedule
                          ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 bg-slate-50 text-slate-600'
                      )}
                    >
                      {item.has_schedule ? 'Ada Jadwal' : 'Tidak Ada Jadwal'}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    <StatusBadge status={item.status} />
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-700">
                    {item.jam_masuk ?? '-'}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-700">
                    {item.jam_pulang ?? '-'}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                    {item.metode ?? '-'}
                  </td>

                  <td className="max-w-xs px-5 py-4">
                    <p className="truncate text-slate-600" title={item.keterangan ?? ''}>
                      {item.keterangan ?? '-'}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-slate-100 lg:hidden">
          {history.map((item, index) => (
            <div key={`${item.tanggal}-m-${index}`} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-slate-800">
                    {formatDateId(item.tanggal, {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>

                  <p className="mt-0.5 text-xs font-semibold text-slate-400">
                    {item.hari} • {item.has_schedule ? 'Ada jadwal' : 'Tidak ada jadwal'}
                  </p>
                </div>

                <StatusBadge status={item.status} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <InfoTile label="Masuk" value={item.jam_masuk ?? '-'} icon={LogIn} tone="emerald" />
                <InfoTile label="Pulang" value={item.jam_pulang ?? '-'} icon={LogOut} tone="sky" />
                <InfoTile label="Metode" value={item.metode ?? '-'} icon={ShieldCheck} tone="indigo" />
                <InfoTile label="Keterangan" value={item.keterangan ?? '-'} icon={FileText} tone="slate" />
              </div>
            </div>
          ))}
        </div>
      </PremiumCard>
    );
  };

  return (
    <GuruLayout user={auth?.user} header="Absensi Harian Saya">
      <Head title="Absensi Harian" />

      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/40 to-sky-50/60 py-5 sm:py-6">
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-indigo-200/35 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-40 h-80 w-80 translate-x-24 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-violet-200/25 blur-3xl" />

        <div className="relative mx-auto max-w-7xl space-y-5 px-3 pb-24 sm:space-y-6 sm:px-6 lg:px-8">
          {!absensiHariIni?.jam_masuk && !isIzinSakitDL && (
            <PremiumCard className="border-rose-200 bg-rose-50/90 p-4" delay={0}>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-rose-600 shadow-sm">
                  <AlertTriangle className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-black text-rose-800">
                    Anda belum absen masuk
                  </p>

                  <p className="mt-1 text-xs font-semibold leading-relaxed text-rose-700">
                    Silakan lakukan absen masuk terlebih dahulu agar status kehadiran hari ini tercatat.
                  </p>
                </div>
              </div>
            </PremiumCard>
          )}

          <PremiumCard className="relative overflow-hidden p-0" delay={50}>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 via-violet-700 to-sky-700" />
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/15 blur-2xl" />
            <div className="absolute bottom-0 left-1/3 h-32 w-32 translate-y-10 rounded-full bg-indigo-200/20 blur-2xl" />

            <div className="relative p-4 text-white sm:p-6 lg:p-7">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-indigo-50 backdrop-blur-md">
                    <Sparkles className="h-3.5 w-3.5" />
                    Absensi Harian Guru
                  </div>

                  <p className="mt-3 text-sm font-semibold text-white/75">
                    {todayLong}
                  </p>

                  <div className="mt-1 flex flex-wrap items-end gap-3">
                    <h1 className="text-4xl font-black leading-none tracking-tight sm:text-5xl">
                      {timeLabel}
                    </h1>

                    <span className="mb-1 rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white/80 backdrop-blur-md">
                      Jadwal {jadwalMulai && jadwalSelesai ? `${jadwalMulai} — ${jadwalSelesai}` : '—'}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <StatusBadge status={absStatus} />

                    {jamMasuk && (
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white/90">
                        Masuk: {jamMasuk}
                      </span>
                    )}

                    {jamPulang && (
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white/90">
                        Pulang: {jamPulang}
                      </span>
                    )}

                    {absensiHariIni?.menit_keterlambatan > 0 && (
                      <span className="rounded-full border border-amber-200/30 bg-amber-300/15 px-3 py-1 text-xs font-black text-amber-100">
                        Terlambat {absensiHariIni.menit_keterlambatan} menit
                      </span>
                    )}
                  </div>

                  {absensiHariIni?.keterangan && (
                    <p className="mt-3 max-w-3xl text-sm font-medium leading-relaxed text-white/75">
                      <span className="font-black text-white">Keterangan:</span>{' '}
                      {absensiHariIni.keterangan}
                    </p>
                  )}
                </div>

                <div className="hidden lg:block">
                  {actionContent()}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <HeroStat label="Status" value={absStatus} icon={Activity} />
                <HeroStat label="Masuk" value={jamMasuk || '-'} icon={LogIn} />
                <HeroStat label="Pulang" value={jamPulang || '-'} icon={LogOut} />
                <HeroStat label="Jadwal" value={jadwalSelesai || '-'} icon={Timer} />
              </div>
            </div>
          </PremiumCard>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <PremiumCard className="p-4 sm:p-5 lg:col-span-2" delay={90}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <InfoTile label="Status Hari Ini" value={<StatusBadge status={absStatus} />} icon={ClipboardCheck} tone="indigo" />
                <InfoTile label="Jam Masuk" value={jamMasuk || '-'} icon={LogIn} tone="emerald" />
                <InfoTile label="Jam Pulang" value={jamPulang || '-'} icon={LogOut} tone="sky" />
                <InfoTile
                  label="Manual"
                  value={isManualDisabled ? 'Nonaktif' : 'Aktif'}
                  icon={isManualDisabled ? Lock : UserCheck}
                  tone={isManualDisabled ? 'rose' : 'emerald'}
                />
              </div>
            </PremiumCard>

            <PremiumCard className="p-4 sm:p-5" delay={110}>
              <div className="lg:hidden">
                {actionContent()}
              </div>

              <div className="hidden lg:flex h-full items-center justify-center rounded-3xl border border-indigo-100 bg-indigo-50/70 p-4 text-center">
                <div>
                  <Award className="mx-auto h-8 w-8 text-indigo-600" />
                  <p className="mt-2 text-sm font-black text-slate-800">
                    Kontrol Absensi
                  </p>
                  <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                    Tombol absen tersedia pada hero utama.
                  </p>
                </div>
              </div>

              {!canPulang && absensiHariIni?.jam_masuk && !absensiHariIni?.jam_pulang && (
                <p className="mt-3 rounded-2xl bg-amber-50 px-3 py-2 text-center text-xs font-bold text-amber-700">
                  Belum waktunya pulang {jadwalSelesai ? `(${jadwalSelesai})` : ''}.
                </p>
              )}
            </PremiumCard>
          </div>

          <PremiumCard className="p-4 sm:p-5" delay={130}>
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Filter className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-base font-black text-slate-900">
                    Filter Riwayat Kehadiran
                  </h2>

                  <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                    Pilih periode hari, minggu, atau bulan untuk melihat riwayat absensi.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700">
                  <CalendarDays className="h-4 w-4" />
                  {formatPeriodLabel()}
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-12">
              <div className="lg:col-span-6">
                <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
                  Periode
                </label>

                <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1">
                  {[
                    { key: 'day', label: 'Hari' },
                    { key: 'week', label: 'Minggu' },
                    { key: 'month', label: 'Bulan' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => onFilterChange(item.key)}
                      className={cn(
                        'min-h-10 rounded-xl px-3 py-2 text-sm font-black transition',
                        filter === item.key
                          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-100'
                          : 'text-slate-600 hover:bg-slate-50'
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-6">
                <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
                  Tanggal
                </label>

                <div className="relative">
                  <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  {filter === 'month' ? (
                    <input
                      type="month"
                      value={dateValue ? dateValue.slice(0, 7) : new Date().toISOString().slice(0, 7)}
                      onChange={onDateChange}
                      className="min-h-11 w-full rounded-2xl border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm font-semibold text-slate-700 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                    />
                  ) : (
                    <input
                      type="date"
                      value={dateValue ? dateValue.slice(0, 10) : new Date().toISOString().slice(0, 10)}
                      onChange={onDateChange}
                      className="min-h-11 w-full rounded-2xl border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm font-semibold text-slate-700 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                    />
                  )}
                </div>
              </div>
            </div>
          </PremiumCard>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <InfoTile label="Total Riwayat" value={historyStats.total} icon={History} tone="slate" />
            <InfoTile label="Hadir" value={historyStats.hadir} icon={CheckCircle2} tone="emerald" />
            <InfoTile label="Sakit/Izin/DL" value={historyStats.sakitIzin} icon={Info} tone="sky" />
            <InfoTile label="Alfa/Belum" value={historyStats.alfa} icon={AlertTriangle} tone="rose" />
          </div>

          <div>
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Riwayat Kehadiran
                </h3>

                <p className="mt-1 text-sm font-medium text-slate-500">
                  Periode: <span className="font-black text-slate-700">{formatPeriodLabel()}</span>
                </p>
              </div>

              <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700">
                <History className="h-4 w-4" />
                {historyStats.total} Data
              </span>
            </div>

            {renderHistoryTable()}
          </div>
        </div>
      </div>

      <div className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 md:hidden">
        <div className="rounded-full border border-white/70 bg-white/90 p-2 shadow-2xl backdrop-blur-xl">
          {isIzinSakitDL ? (
            <ActionButton
              tone="outline"
              icon={Plus}
              onClick={() => setShowIzinModal(true)}
              className="w-full rounded-full"
            >
              Ajukan Perubahan
            </ActionButton>
          ) : absensiHariIni?.jam_masuk ? (
            absensiHariIni?.jam_pulang ? (
              <div className="py-2 text-center text-xs font-black text-emerald-700">
                Selesai — {jamMasuk ?? '-'} / {jamPulang ?? '-'}
              </div>
            ) : (
              <ActionButton
                tone="emerald"
                icon={LogOut}
                onClick={handlePulang}
                className="w-full rounded-full"
              >
                Absen Pulang
              </ActionButton>
            )
          ) : (
            <ActionButton
              tone="primary"
              icon={LogIn}
              onClick={handleMasuk}
              disabled={isManualDisabled}
              className="w-full rounded-full"
            >
              Absen Masuk
            </ActionButton>
          )}
        </div>
      </div>

      {showIzinModal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm sm:p-4">
          <button
            type="button"
            aria-label="Tutup modal"
            className="absolute inset-0"
            onClick={() => setShowIzinModal(false)}
          />

          <div className="animate-modal-pop relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/70 bg-white shadow-2xl">
            <div className="relative overflow-hidden bg-gradient-to-r from-indigo-700 via-violet-700 to-sky-700 p-5 text-white">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/15 blur-2xl" />

              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-indigo-50 backdrop-blur-md">
                    <Send className="h-3.5 w-3.5" />
                    Pengajuan Absensi
                  </div>

                  <h3 className="mt-2 text-lg font-black leading-tight">
                    Ajukan Sakit / Izin / Dinas Luar
                  </h3>

                  <p className="mt-1 text-xs font-medium text-white/75">
                    Isi status dan keterangan dengan benar sebelum mengirim pengajuan.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowIzinModal(false)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white transition hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={submitIzin} className="max-h-[72vh] overflow-y-auto p-5">
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
                    Tanggal
                  </label>

                  <input
                    type="date"
                    value={izinForm.data.tanggal}
                    onChange={(event) => izinForm.setData('tanggal', event.target.value)}
                    className="min-h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                    required
                  />

                  <FieldError message={izinForm.errors.tanggal} />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
                    Status
                  </label>

                  <select
                    value={izinForm.data.status}
                    onChange={(event) => izinForm.setData('status', event.target.value)}
                    className="min-h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                    required
                  >
                    <option value="Sakit">Sakit</option>
                    <option value="Izin">Izin</option>
                    <option value="Dinas Luar">Dinas Luar</option>
                  </select>

                  <FieldError message={izinForm.errors.status} />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
                    Keterangan
                  </label>

                  <textarea
                    value={izinForm.data.keterangan}
                    onChange={(event) => izinForm.setData('keterangan', event.target.value)}
                    rows={4}
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                    placeholder="Jelaskan alasan, minimal 3 karakter..."
                    required
                  />

                  <FieldError message={izinForm.errors.keterangan} />
                </div>
              </div>

              <div className="mt-5 flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <ActionButton
                  tone="outline"
                  onClick={() => setShowIzinModal(false)}
                  disabled={izinForm.processing}
                >
                  Batal
                </ActionButton>

                <ActionButton
                  type="submit"
                  tone="primary"
                  icon={izinForm.processing ? Loader2 : Send}
                  disabled={izinForm.processing}
                >
                  {izinForm.processing ? 'Mengirim...' : 'Kirim Pengajuan'}
                </ActionButton>
              </div>
            </form>
          </div>
        </div>
      )}

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

        .animate-soft-rise {
          animation: softRise 520ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .animate-modal-pop {
          animation: modalPop 260ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
      `}</style>
    </GuruLayout>
  );
}