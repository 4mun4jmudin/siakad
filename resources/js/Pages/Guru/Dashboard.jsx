// resources/js/Pages/Guru/Dashboard.jsx
import React, { useMemo, useState } from 'react';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import GuruLayout from '@/Layouts/GuruLayout';
import {
  Users,
  BookOpen,
  Clock,
  UserCheck,
  Bell,
  Calendar as CalendarIcon,
  Send,
  ChevronDown,
  ChevronUp,
  FileDown,
  FileText,
  TrendingUp,
  Crown,
  Flame,
  Sparkles,
  Activity,
  BarChart3,
  ClipboardList,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Download,
  CalendarCheck,
  GraduationCap,
  Loader2,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from 'chart.js';

import { Doughnut, Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

const cn = (...classes) => classes.filter(Boolean).join(' ');

const clampStyle = (lines = 1) => ({
  display: '-webkit-box',
  WebkitLineClamp: lines,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  wordBreak: 'break-word',
});

const formatMonthLabel = (monthValue) => {
  if (!monthValue) return '-';

  try {
    const [year, month] = monthValue.split('-');
    return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString('id-ID', {
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return monthValue;
  }
};

const chartFont = {
  family: "'Inter', system-ui, sans-serif",
  size: 11,
};

function safeRoute(name, params = {}, fallback = '#') {
  try {
    return route(name, params);
  } catch {
    return fallback;
  }
}

function statusTone(percent) {
  if (percent >= 90) return 'green';
  if (percent >= 75) return 'yellow';
  return 'red';
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

function SectionHeader({ title, subtitle, icon: Icon, right, tone = 'indigo' }) {
  const toneClass = {
    indigo: 'bg-indigo-50 text-indigo-700',
    sky: 'bg-sky-50 text-sky-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    violet: 'bg-violet-50 text-violet-700',
    amber: 'bg-amber-50 text-amber-700',
  }[tone];

  return (
    <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="flex min-w-0 items-start gap-3">
        {Icon && (
          <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-sm', toneClass)}>
            <Icon className="h-5 w-5" />
          </div>
        )}

        <div className="min-w-0">
          <h3 className="text-base font-black leading-tight text-slate-900">
            {title}
          </h3>

          {subtitle && (
            <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {right}
    </div>
  );
}

function Card({ title, subtitle, icon: Icon, right, children, className = '', tone = 'indigo', delay = 0 }) {
  return (
    <PremiumCard className={cn('overflow-hidden', className)} delay={delay}>
      {(title || Icon || right) && (
        <SectionHeader
          title={title}
          subtitle={subtitle}
          icon={Icon}
          right={right}
          tone={tone}
        />
      )}

      <div className="p-4 sm:p-5">
        {children}
      </div>
    </PremiumCard>
  );
}

function EmptyBox({ icon: Icon = AlertCircle, title = 'Belum ada data', description }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-300 shadow-sm">
        <Icon className="h-6 w-6" />
      </div>

      <p className="mt-3 text-sm font-black text-slate-500">
        {title}
      </p>

      {description && (
        <p className="mt-1 text-xs leading-relaxed text-slate-400">
          {description}
        </p>
      )}
    </div>
  );
}

function Badge({ text, tone = 'default' }) {
  const map = {
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    yellow: 'bg-amber-50 text-amber-700 border-amber-200',
    red: 'bg-rose-50 text-rose-700 border-rose-200',
    blue: 'bg-sky-50 text-sky-700 border-sky-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    violet: 'bg-violet-50 text-violet-700 border-violet-200',
    default: 'bg-slate-50 text-slate-700 border-slate-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-black leading-none',
        map[tone] || map.default
      )}
    >
      {text}
    </span>
  );
}

function StatPill({ label, value, icon: Icon, gradient, sub, delay = 0 }) {
  return (
    <PremiumCard className="group relative overflow-hidden p-4" delay={delay}>
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-slate-100/80 blur-2xl transition-all duration-500 group-hover:scale-125" />

      <div className="relative flex items-center gap-3">
        <div
          className={cn(
            'flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg transition-transform duration-300 group-hover:scale-105',
            gradient
          )}
        >
          {Icon ? <Icon className="h-6 w-6" /> : <span className="font-black">{(label || ' ')[0]}</span>}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="mt-1 text-2xl font-black leading-none tracking-tight text-slate-900">
            {typeof value === 'number' ? value : Number(value) || 0}
          </p>

          {sub && (
            <p className="mt-1 text-[11px] font-semibold leading-snug text-slate-500" style={clampStyle(1)}>
              {sub}
            </p>
          )}
        </div>
      </div>
    </PremiumCard>
  );
}

function DonutKehadiran({ stats = {} }) {
  const dataDonut = useMemo(() => {
    const s = stats?.kehadiran_bulan_ini ?? {};

    const hadir = s.hadir ?? 0;
    const izin = s.izin ?? 0;
    const sakit = s.sakit ?? 0;
    const alfa = s.alfa ?? 0;
    const dinas = s.dinas_luar ?? 0;

    return {
      labels: ['Hadir', 'Izin', 'Sakit', 'Alfa', 'Dinas Luar'],
      datasets: [
        {
          data: [hadir, izin, sakit, alfa, dinas],
          backgroundColor: ['#10b981', '#f59e0b', '#0ea5e9', '#ef4444', '#8b5cf6'],
          borderWidth: 0,
          hoverOffset: 8,
        },
      ],
    };
  }, [stats]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          borderRadius: 999,
          usePointStyle: true,
          pointStyle: 'circle',
          font: chartFont,
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: chartFont,
        bodyFont: chartFont,
        padding: 10,
        cornerRadius: 12,
      },
    },
    cutout: '66%',
  };

  const allZero = (dataDonut.datasets?.[0]?.data || []).every((n) => !n);

  if (allZero) {
    return (
      <EmptyBox
        icon={UserCheck}
        title="Belum ada data bulan ini"
        description="Statistik kehadiran guru akan muncul setelah absensi tercatat."
      />
    );
  }

  return (
    <div className="h-[250px]">
      <Doughnut data={dataDonut} options={options} />
    </div>
  );
}

function BarPerKelas({ items = [] }) {
  const labels = items.map((item) => item.kelas || item.namaKelas || 'Kelas');
  const values = items.map((item) => Math.round(item.avg_presence_pct ?? item.persentase?.hadir ?? 0));

  if (labels.length === 0) {
    return (
      <EmptyBox
        icon={BarChart3}
        title="Belum ada rekap kelas"
        description="Data kehadiran siswa per kelas belum tersedia."
      />
    );
  }

  const data = {
    labels,
    datasets: [
      {
        label: '% Hadir',
        data: values,
        backgroundColor: '#6366f1',
        borderRadius: 10,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: chartFont,
        bodyFont: chartFont,
        padding: 10,
        cornerRadius: 12,
        callbacks: {
          label: (context) => `${context.parsed.y}% hadir`,
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        grid: { color: 'rgba(148,163,184,.18)' },
        ticks: {
          callback: (value) => `${value}%`,
          font: chartFont,
        },
      },
      x: {
        grid: { display: false },
        ticks: { font: chartFont },
      },
    },
  };

  return (
    <div className="h-[260px]">
      <Bar data={data} options={options} />
    </div>
  );
}

function TrendLine({ series }) {
  const labels = series?.map((item) => item?.bulan || item?.period) ?? [];
  const siswa = series?.map((item) => item?.siswa ?? item?.presence_pct_siswa ?? 0) ?? [];
  const guru = series?.map((item) => item?.guru ?? item?.presence_pct_guru ?? 0) ?? [];

  if (!labels.length) {
    return (
      <EmptyBox
        icon={TrendingUp}
        title="Belum ada data tren"
        description="Grafik tren akan muncul setelah data beberapa periode tersedia."
      />
    );
  }

  const data = {
    labels,
    datasets: [
      {
        label: 'Guru',
        data: guru,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99,102,241,.18)',
        tension: 0.35,
        fill: true,
        pointRadius: 3,
      },
      {
        label: 'Siswa',
        data: siswa,
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14,165,233,.16)',
        tension: 0.35,
        fill: true,
        pointRadius: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          font: chartFont,
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: chartFont,
        bodyFont: chartFont,
        padding: 10,
        cornerRadius: 12,
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.parsed.y}%`,
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        grid: { color: 'rgba(148,163,184,.18)' },
        ticks: {
          callback: (value) => `${value}%`,
          font: chartFont,
        },
      },
      x: {
        grid: { display: false },
        ticks: { font: chartFont },
      },
    },
  };

  return (
    <div className="h-[260px]">
      <Line data={data} options={options} />
    </div>
  );
}

function TodaySchedule({ jadwal = [] }) {
  const { data, setData, post, processing, reset, errors } = useForm({
    id_jadwal: '',
    status_mengajar: 'Tugas',
    alasan: '',
  });

  const [openId, setOpenId] = useState(null);

  const submitQuick = (event) => {
    event.preventDefault();

    if (!data.id_jadwal) return;

    post(safeRoute('guru.jurnal.quick_entry'), {
      preserveScroll: true,
      onSuccess: () => {
        setOpenId(null);
        reset();
      },
    });
  };

  return (
    <Card
      title="Jadwal Mengajar Hari Ini"
      subtitle="Akses cepat untuk absensi siswa, absensi guru, dan jurnal singkat."
      icon={CalendarCheck}
      tone="indigo"
    >
      <div className="space-y-3">
        {(jadwal ?? []).length === 0 && (
          <EmptyBox
            icon={CalendarIcon}
            title="Tidak ada jadwal hari ini"
            description="Tidak ada jadwal mengajar yang tercatat untuk hari ini."
          />
        )}

        {(jadwal ?? []).map((item) => {
          const mulai = item?.jam_mulai?.slice(0, 5) ?? '--:--';
          const selesai = item?.jam_selesai?.slice(0, 5) ?? '--:--';
          const kelas = [item?.kelas?.tingkat, item?.kelas?.jurusan].filter(Boolean).join(' ') || '-';
          const mapel = item?.mata_pelajaran?.nama_mapel ?? '—';
          const isOpen = openId === item.id_jadwal;

          return (
            <div
              key={item.id_jadwal}
              className={cn(
                'overflow-hidden rounded-3xl border bg-white/90 shadow-sm transition-all duration-300',
                isOpen
                  ? 'border-indigo-200 shadow-indigo-100/60'
                  : 'border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/25'
              )}
            >
              <div className="p-3 sm:p-4">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200">
                      <span className="text-sm font-black leading-none">{mulai}</span>
                      <span className="mt-0.5 text-[9px] font-bold text-white/70">{selesai}</span>
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-black leading-snug text-slate-900" style={clampStyle(2)}>
                        {mapel}
                      </p>

                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        Kelas {kelas}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge text={`${mulai} - ${selesai}`} tone="indigo" />
                        <Badge text="Mengajar" tone="blue" />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 xl:justify-end">
                    <Link
                      href={safeRoute('guru.absensi-mapel.show', { id_jadwal: item.id_jadwal })}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-2 text-xs font-black text-white shadow-lg shadow-emerald-200 transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105"
                    >
                      <Send className="h-4 w-4" />
                      Isi Absen Siswa
                    </Link>

                    <Link
                      href={safeRoute('guru.absensi-harian.index')}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 px-3 py-2 text-xs font-black text-white shadow-lg shadow-sky-200 transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105"
                    >
                      <UserCheck className="h-4 w-4" />
                      Absen Guru
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setOpenId(isOpen ? null : item.id_jadwal);
                        setData('id_jadwal', item.id_jadwal);
                      }}
                      className={cn(
                        'inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl px-3 py-2 text-xs font-black transition-all duration-300',
                        isOpen
                          ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200'
                          : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-indigo-50 hover:text-indigo-700'
                      )}
                      aria-expanded={isOpen}
                    >
                      {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      Jurnal Cepat
                    </button>
                  </div>
                </div>
              </div>

              <div
                className={cn(
                  'overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out',
                  isOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
                )}
              >
                <form onSubmit={submitQuick} className="border-t border-slate-100 bg-slate-50/70 p-4">
                  <p className="text-xs font-semibold leading-relaxed text-slate-500">
                    Catat singkat jika guru memberi tugas, kelas kosong, atau digantikan.
                  </p>

                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <select
                      value={data.status_mengajar}
                      onChange={(event) => setData('status_mengajar', event.target.value)}
                      className="min-h-10 rounded-2xl border-slate-200 bg-white text-xs font-bold text-slate-700 shadow-sm focus:border-indigo-400 focus:ring-indigo-300"
                    >
                      <option value="Tugas">Memberi Tugas</option>
                      <option value="Kosong">Kelas Kosong</option>
                      <option value="Digantikan">Digantikan</option>
                    </select>

                    <input
                      type="text"
                      value={data.alasan}
                      onChange={(event) => setData('alasan', event.target.value)}
                      placeholder="Alasan singkat, contoh: rapat dinas"
                      className="min-h-10 rounded-2xl border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-sm focus:border-indigo-400 focus:ring-indigo-300 sm:col-span-2"
                    />
                  </div>

                  {errors?.alasan && (
                    <div className="mt-2 text-xs font-semibold text-rose-600">
                      {errors.alasan}
                    </div>
                  )}

                  <div className="mt-3 flex justify-end">
                    <button
                      type="submit"
                      disabled={processing}
                      className="inline-flex min-h-10 items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-xs font-black text-white shadow-lg shadow-indigo-200 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                      {processing ? 'Mengirim...' : 'Kirim Jurnal'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function MiniHistory({ items = [] }) {
  return (
    <Card
      title="Riwayat Singkat"
      subtitle="7 hari terakhir"
      icon={Clock}
      tone="sky"
      right={
        <Link
          href={safeRoute('guru.laporan.index')}
          className="rounded-full bg-sky-50 px-3 py-1 text-xs font-black text-sky-700 transition hover:bg-sky-100"
        >
          Lihat Semua
        </Link>
      }
    >
      {(items ?? []).length === 0 ? (
        <EmptyBox
          icon={Clock}
          title="Belum ada riwayat"
          description="Riwayat guru dan ringkasan siswa akan tampil di sini."
        />
      ) : (
        <div className="space-y-2">
          {(items ?? []).map((row, index) => (
            <div
              key={row.id || index}
              className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 transition hover:bg-indigo-50/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-black text-slate-900">
                    {row.tanggal ?? '-'}
                  </p>

                  <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-500" style={clampStyle(2)}>
                    {row.ringkasan_siswa ?? '-'}
                  </p>
                </div>

                <Badge
                  text={row.status_guru ?? '-'}
                  tone={
                    row.status_guru === 'Hadir'
                      ? 'green'
                      : row.status_guru === 'Izin' || row.status_guru === 'Sakit'
                        ? 'yellow'
                        : row.status_guru === 'Alfa'
                          ? 'red'
                          : 'default'
                  }
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function KelasOverview({ data = [] }) {
  return (
    <Card
      title="Rekap Kelas Diampu"
      subtitle="Kehadiran siswa per kelas"
      icon={Users}
      tone="violet"
    >
      {(data ?? []).length === 0 ? (
        <EmptyBox
          icon={Users}
          title="Belum ada data rekap kelas"
          description="Data kelas diampu akan tampil jika sudah tersedia dari server."
        />
      ) : (
        <div className="space-y-3">
          {(data ?? []).map((item, index) => {
            const nama = item.kelas || item.namaKelas || `Kelas ${index + 1}`;
            const pct = Math.round(item.avg_presence_pct ?? item.persentase?.hadir ?? 0);

            return (
              <div key={nama} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-black text-slate-800">
                      {nama}
                    </div>

                    <div className="mt-1 text-xs font-semibold text-slate-500">
                      Hadir: {pct}%
                    </div>
                  </div>

                  <Badge
                    text={pct >= 90 ? 'Hijau' : pct >= 75 ? 'Kuning' : 'Merah'}
                    tone={statusTone(pct)}
                  />
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                  <div
                    className={cn(
                      'h-2 rounded-full',
                      pct >= 90 ? 'bg-emerald-500' : pct >= 75 ? 'bg-amber-400' : 'bg-rose-500'
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function Reminders({ notifikasi = {}, statusHariIni }) {
  const list = [
    ...(notifikasi?.pengumuman ?? []),
    ...(notifikasi?.peringatanTugas ?? []),
    ...(notifikasi?.deadlineJurnal ?? []),
  ];

  if (statusHariIni === 'Belum Absen') {
    list.unshift({
      id: 'rem-belum-absen',
      tipe: 'Reminder',
      judul: 'Anda belum absen hari ini',
      pesan: 'Silakan lakukan absen masuk/pulang.',
      waktu: 'Hari ini',
      tone: 'yellow',
    });
  }

  return (
    <Card
      title="Reminder / Alert"
      subtitle="Informasi penting untuk guru"
      icon={Bell}
      tone="amber"
    >
      {list.length === 0 ? (
        <EmptyBox
          icon={Bell}
          title="Tidak ada notifikasi"
          description="Pengingat dan alert akan tampil di sini."
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {list.map((item, index) => (
            <div
              key={item.id || index}
              className="rounded-3xl border border-slate-100 bg-slate-50/80 p-4 transition hover:border-indigo-100 hover:bg-indigo-50/35"
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-sm',
                    item.tone === 'yellow'
                      ? 'bg-amber-50 text-amber-600'
                      : 'bg-indigo-50 text-indigo-600'
                  )}
                >
                  {item.tone === 'yellow' ? <Flame className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black leading-snug text-slate-900" style={clampStyle(2)}>
                    {item.judul ?? item.title ?? 'Info'}
                  </p>

                  <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500" style={clampStyle(3)}>
                    {item.pesan ?? item.message ?? '-'}
                  </p>

                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-400">
                      {item.waktu ?? '-'}
                    </span>

                    <Link
                      href={safeRoute('guru.absensi-harian.index')}
                      className="rounded-full bg-white px-3 py-1 text-[11px] font-black text-indigo-700 shadow-sm ring-1 ring-slate-100 transition hover:bg-indigo-50"
                    >
                      Buka
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function RankingBox({ top = [], bottom = [] }) {
  return (
    <Card
      title="Ranking Kehadiran Siswa"
      subtitle="Top dan perlu perhatian"
      icon={Crown}
      tone="violet"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50/50 p-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-emerald-700">
            <Crown className="h-4 w-4" />
            Top 5
          </div>

          <div className="space-y-2">
            {(top ?? []).length === 0 && (
              <p className="text-xs font-semibold text-emerald-700/70">Belum ada data.</p>
            )}

            {(top ?? []).map((student, index) => (
              <div key={`${student.id || student.nis || index}-top`} className="flex items-center justify-between gap-2 rounded-2xl bg-white p-2">
                <span className="truncate text-sm font-bold text-slate-700">
                  {index + 1}. {student.nama || student.nama_lengkap || '-'}
                </span>

                <Badge text={`${Math.round(student.pct ?? 0)}%`} tone="green" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-rose-100 bg-rose-50/50 p-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-rose-700">
            <AlertCircle className="h-4 w-4" />
            Bottom 5
          </div>

          <div className="space-y-2">
            {(bottom ?? []).length === 0 && (
              <p className="text-xs font-semibold text-rose-700/70">Belum ada data.</p>
            )}

            {(bottom ?? []).map((student, index) => (
              <div key={`${student.id || student.nis || index}-bottom`} className="flex items-center justify-between gap-2 rounded-2xl bg-white p-2">
                <span className="truncate text-sm font-bold text-slate-700">
                  {index + 1}. {student.nama || student.nama_lengkap || '-'}
                </span>

                <Badge text={`${Math.round(student.pct ?? 0)}%`} tone="red" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

function FiltersBar({ bulanDefault }) {
  const [bulan, setBulan] = useState(bulanDefault || new Date().toISOString().slice(0, 7));

  const apply = () => {
    router.get(safeRoute('guru.dashboard'), { bulan }, { preserveScroll: true, preserveState: true });
  };

  return (
    <PremiumCard className="p-3 sm:p-4" delay={80}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <CalendarIcon className="h-5 w-5" />
          </div>

          <div>
            <p className="text-sm font-black text-slate-900">
              Filter Periode
            </p>

            <p className="text-xs font-medium text-slate-500">
              Data bulan {formatMonthLabel(bulan)}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="month"
            value={bulan}
            onChange={(event) => setBulan(event.target.value)}
            className="min-h-11 rounded-2xl border-slate-200 bg-white text-sm font-bold text-slate-700 shadow-sm focus:border-indigo-400 focus:ring-indigo-300"
          />

          <button
            type="button"
            onClick={apply}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-black text-white shadow-lg shadow-indigo-200 transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105"
          >
            <Activity className="h-4 w-4" />
            Terapkan
          </button>
        </div>
      </div>
    </PremiumCard>
  );
}

export default function Dashboard({
  guru,
  jadwalHariIni = [],
  stats = {},
  notifikasi = {},
}) {
  const { auth } = usePage().props;

  const kehadiranBulan = stats?.kehadiran_bulan_ini ?? {};

  const hadir = kehadiranBulan.hadir ?? 0;
  const izin = kehadiranBulan.izin ?? 0;
  const sakit = kehadiranBulan.sakit ?? 0;
  const alfa = kehadiranBulan.alfa ?? 0;
  const dinas = kehadiranBulan.dinas_luar ?? 0;
  const persen = typeof kehadiranBulan.persen === 'number'
    ? kehadiranBulan.persen
    : Number(kehadiranBulan.persen) || 0;

  const lateCount = stats?.late_count ?? 0;
  const lateMinutes = stats?.late_minutes ?? 0;

  const kelasRekap = [];
  const riwayatSingkat = [];
  const trendKehadiran = [];
  const rankingTop = [];
  const rankingBottom = [];

  const monthStr = new Date().toISOString().slice(0, 7);
  const guruName = guru?.nama_lengkap || auth?.user?.nama_lengkap || 'Guru';

  return (
    <GuruLayout header="Dashboard">
      <Head title="Dashboard Guru" />

      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/40 to-sky-50/60 py-5 sm:py-6">
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-indigo-200/35 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-40 h-80 w-80 translate-x-24 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-violet-200/25 blur-3xl" />

        <div className="relative mx-auto max-w-7xl space-y-5 px-3 pb-12 sm:space-y-6 sm:px-6 lg:px-8">
          {/* HERO */}
          <PremiumCard className="relative overflow-hidden p-0" delay={0}>
            {/* Background Image & Overlay */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
              style={{ backgroundImage: 'url(/images/bgdashboard.jpeg)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/80 via-violet-900/80 to-sky-900/80 mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-800/40 via-violet-800/40 to-sky-800/40" />
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/15 blur-2xl" />
            <div className="absolute bottom-0 left-1/3 h-32 w-32 translate-y-10 rounded-full bg-indigo-200/20 blur-2xl" />

            <div className="relative p-4 text-white sm:p-6 lg:p-7">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-start gap-4 sm:items-center">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl border border-white/25 bg-white/15 text-white shadow-xl backdrop-blur-md sm:h-16 sm:w-16">
                    <GraduationCap className="h-7 w-7" />
                  </div>

                  <div className="min-w-0">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-indigo-50 backdrop-blur-md">
                      <Sparkles className="h-3.5 w-3.5" />
                      Portal Guru
                    </div>

                    <h1 className="mt-3 text-xl font-black leading-tight tracking-tight sm:text-2xl lg:text-3xl">
                      Selamat Datang, {guruName}
                    </h1>

                    <p className="mt-2 max-w-3xl text-sm font-medium leading-relaxed text-white/80">
                      Pantau absensi pribadi, jadwal mengajar hari ini, jurnal cepat, rekap kelas, dan laporan akademik dalam satu dashboard.
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-white/90">
                      <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                        Periode: {formatMonthLabel(monthStr)}
                      </span>

                      <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                        Kehadiran: {persen}%
                      </span>

                      <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                        Jadwal hari ini: {jadwalHariIni.length}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:min-w-[330px]">
                  <div className="rounded-3xl border border-white/15 bg-white/10 p-3 text-center backdrop-blur-md">
                    <UserCheck className="mx-auto h-5 w-5 text-white/90" />
                    <p className="mt-2 text-2xl font-black leading-none">
                      {hadir}
                    </p>
                    <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-white/70">
                      Hadir Bulan Ini
                    </p>
                  </div>

                  <div className="rounded-3xl border border-white/15 bg-white/10 p-3 text-center backdrop-blur-md">
                    <CalendarCheck className="mx-auto h-5 w-5 text-white/90" />
                    <p className="mt-2 text-2xl font-black leading-none">
                      {jadwalHariIni.length}
                    </p>
                    <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-white/70">
                      Jadwal Hari Ini
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </PremiumCard>

          <FiltersBar bulanDefault={monthStr} />

          {/* Quick insights */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <StatPill
              label="Hadir"
              value={hadir}
              icon={CheckCircle2}
              gradient="bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-200"
              sub={`${persen}% dari hari kerja`}
              delay={120}
            />

            <StatPill
              label="Izin"
              value={izin}
              icon={ShieldCheck}
              gradient="bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-200"
              delay={160}
            />

            <StatPill
              label="Sakit"
              value={sakit}
              icon={Activity}
              gradient="bg-gradient-to-br from-sky-500 to-cyan-500 shadow-sky-200"
              delay={200}
            />

            <StatPill
              label="Alfa"
              value={alfa}
              icon={XCircle}
              gradient="bg-gradient-to-br from-rose-500 to-pink-500 shadow-rose-200"
              delay={240}
            />

            <StatPill
              label="Terlambat"
              value={lateCount}
              icon={Clock}
              gradient="bg-gradient-to-br from-violet-600 to-fuchsia-500 shadow-violet-200"
              sub={`${lateMinutes} menit`}
              delay={280}
            />
          </div>

          {/* Donut + Rekap + Export */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <Card
              title="Statistik Kehadiran Pribadi"
              subtitle="Rekap bulan berjalan"
              icon={UserCheck}
              tone="indigo"
              className="lg:col-span-1"
              delay={120}
            >
              <DonutKehadiran stats={stats} />

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-2xl bg-emerald-50 p-3 font-bold text-emerald-700">
                  Hadir <strong>{hadir}</strong>
                </div>

                <div className="rounded-2xl bg-amber-50 p-3 font-bold text-amber-700">
                  Izin <strong>{izin}</strong>
                </div>

                <div className="rounded-2xl bg-sky-50 p-3 font-bold text-sky-700">
                  Sakit <strong>{sakit}</strong>
                </div>

                <div className="rounded-2xl bg-rose-50 p-3 font-bold text-rose-700">
                  Alfa <strong>{alfa}</strong>
                </div>

                <div className="rounded-2xl bg-violet-50 p-3 font-bold text-violet-700">
                  Dinas <strong>{dinas}</strong>
                </div>

                <div className="rounded-2xl bg-slate-50 p-3 font-bold text-slate-700">
                  Rasio <strong>{persen}%</strong>
                </div>
              </div>
            </Card>

            <KelasOverview data={kelasRekap} />

            <Card
              title="Ekspor Cepat"
              subtitle="Cetak laporan berdasarkan periode"
              icon={FileSpreadsheet}
              tone="emerald"
              delay={180}
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <Link
                  href={safeRoute('guru.laporan.previewPdf', { bulan: monthStr })}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-black text-white transition hover:bg-black"
                >
                  <FileDown className="h-4 w-4" />
                  Cetak PDF
                </Link>

                <Link
                  href={safeRoute('guru.laporan.exportExcel', { bulan: monthStr })}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-black text-white shadow-lg shadow-emerald-200 transition hover:brightness-105"
                >
                  <Download className="h-4 w-4" />
                  Ekspor Excel
                </Link>
              </div>

              <div className="mt-4 rounded-3xl border border-slate-100 bg-slate-50/70 p-4">
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                  Periode laporan
                </p>

                <p className="mt-1 text-sm font-black text-slate-800">
                  {formatMonthLabel(monthStr)}
                </p>
              </div>
            </Card>
          </div>

          {/* Jadwal + Riwayat */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <TodaySchedule jadwal={jadwalHariIni} />
            </div>

            <MiniHistory items={riwayatSingkat} />
          </div>

          <Reminders notifikasi={notifikasi} statusHariIni={stats?.status_hari_ini} />

          {/* Chart + Ranking */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <Card
              title="Kehadiran Siswa per Kelas"
              subtitle="Persentase hadir bulan ini"
              icon={BarChart3}
              tone="indigo"
            >
              <BarPerKelas items={kelasRekap} />
            </Card>

            <Card
              title="Trend Kehadiran"
              subtitle="Perbandingan guru dan siswa"
              icon={TrendingUp}
              tone="sky"
            >
              <TrendLine series={trendKehadiran} />
            </Card>

            <RankingBox top={rankingTop} bottom={rankingBottom} />
          </div>
        </div>
      </div>

      <style>{`
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
    </GuruLayout>
  );
}