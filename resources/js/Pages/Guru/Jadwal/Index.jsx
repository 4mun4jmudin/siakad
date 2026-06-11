// resources/js/Pages/Guru/Jadwal/Index.jsx
import React, { useMemo } from 'react';
import GuruLayout from '@/Layouts/GuruLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Calendar,
    Clock,
    BookOpen,
    Info,
    Printer,
    Download,
    Sparkles,
    GraduationCap,
    CalendarDays,
    ClipboardCheck,
    CheckCircle2,
    AlertTriangle,
    Layers,
    UserCheck,
    ArrowDownToLine,
} from 'lucide-react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const fmtTime = (value) => (value ? String(value).slice(0, 5) : '—');

const clampStyle = (lines = 1) => ({
    display: '-webkit-box',
    WebkitLineClamp: lines,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    wordBreak: 'break-word',
});

function safeRoute(name, params = {}, fallback = '#') {
    try {
        return route(name, params);
    } catch {
        return fallback;
    }
}

const hariUrutan = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

function getMapelName(jadwal) {
    return (
        jadwal?.mapel?.nama_mapel ||
        jadwal?.mata_pelajaran?.nama_mapel ||
        jadwal?.mata_pelajaran ||
        '—'
    );
}

function getKelasName(jadwal) {
    if (!jadwal?.kelas) return '—';

    if (typeof jadwal.kelas === 'string') return jadwal.kelas;

    return [jadwal.kelas?.tingkat, jadwal.kelas?.jurusan]
        .filter(Boolean)
        .join(' ') || '—';
}

function normalizeTodaySchedule(item) {
    return {
        id_jadwal: item.id_jadwal,
        jam_mulai: item.jam_mulai,
        jam_selesai: item.jam_selesai,
        mapel: {
            nama_mapel: item.mata_pelajaran?.nama_mapel || item.mata_pelajaran || item.mapel?.nama_mapel || '—',
        },
        kelas: typeof item.kelas === 'string'
            ? {
                tingkat: item.kelas?.split(' ')[0] ?? '',
                jurusan: item.kelas?.split(' ').slice(1).join(' ') ?? '',
            }
            : item.kelas,
    };
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

function StatMiniCard({ label, value, icon: Icon }) {
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

function JurnalBadge({ done }) {
    if (done) {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Jurnal Dibuat
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-amber-700">
            <AlertTriangle className="h-3.5 w-3.5" />
            Belum Ada Jurnal
        </span>
    );
}

function EmptyState({ title, description, icon: Icon = Info }) {
    return (
        <PremiumCard className="p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-50 text-slate-300 shadow-sm">
                <Icon className="h-7 w-7" />
            </div>

            <h3 className="mt-4 text-base font-black text-slate-700">
                {title}
            </h3>

            <p className="mt-1 text-sm leading-relaxed text-slate-500">
                {description}
            </p>
        </PremiumCard>
    );
}

function JadwalCard({ jadwal, jurnal, delay = 0 }) {
    const isJurnalDibuat = !!jurnal;
    const mapelName = getMapelName(jadwal);
    const kelasName = getKelasName(jadwal);
    const mulai = fmtTime(jadwal.jam_mulai);
    const selesai = fmtTime(jadwal.jam_selesai);

    return (
        <PremiumCard
            className={cn(
                'group overflow-hidden p-0',
                isJurnalDibuat
                    ? 'border-emerald-200 bg-gradient-to-br from-white via-emerald-50/35 to-white'
                    : 'border-amber-100 bg-gradient-to-br from-white via-amber-50/20 to-white'
            )}
            delay={delay}
        >
            <div className="p-4">
                <div className="flex items-start gap-3">
                    <div
                        className={cn(
                            'flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-3xl text-white shadow-lg transition-transform duration-300 group-hover:scale-105',
                            isJurnalDibuat
                                ? 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-200'
                                : 'bg-gradient-to-br from-indigo-600 to-violet-600 shadow-indigo-200'
                        )}
                    >
                        <span className="text-sm font-black leading-none">
                            {mulai}
                        </span>

                        <span className="mt-0.5 text-[9px] font-bold text-white/75">
                            {selesai}
                        </span>
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                                <p
                                    className="text-sm font-black leading-snug text-slate-900"
                                    style={clampStyle(2)}
                                    title={mapelName}
                                >
                                    {mapelName}
                                </p>

                                <p className="mt-1 text-xs font-bold text-slate-500">
                                    Kelas {kelasName}
                                </p>
                            </div>

                            <JurnalBadge done={isJurnalDibuat} />
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-indigo-700">
                                <Clock className="h-3.5 w-3.5" />
                                {mulai} - {selesai}
                            </span>

                            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-sky-700">
                                <GraduationCap className="h-3.5 w-3.5" />
                                Mengajar
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-4">
                    <Link
                        href={safeRoute('guru.jurnal.create', { jadwal_id: jadwal.id_jadwal })}
                        className={cn(
                            'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-black text-white',
                            'shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105',
                            isJurnalDibuat
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-200'
                                : 'bg-gradient-to-r from-indigo-600 to-violet-600 shadow-indigo-200'
                        )}
                    >
                        <BookOpen className="h-4 w-4" />
                        {isJurnalDibuat ? 'Lihat Jurnal' : 'Buat Jurnal'}
                    </Link>
                </div>
            </div>
        </PremiumCard>
    );
}

function DaySection({ hari, items = [], jurnalHariIni = {}, index = 0 }) {
    if (!items || items.length === 0) return null;

    return (
        <PremiumCard className="overflow-visible p-4 sm:p-5" delay={160 + index * 40}>
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 shadow-sm">
                        <CalendarDays className="h-5 w-5" />
                    </div>

                    <div>
                        <h3 className="text-base font-black text-slate-900">
                            {hari}
                        </h3>

                        <p className="text-xs font-semibold text-slate-500">
                            {items.length} jadwal mengajar
                        </p>
                    </div>
                </div>

                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-xs font-black text-slate-500">
                    <Layers className="h-3.5 w-3.5" />
                    Mingguan
                </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                {items.map((jadwal, itemIndex) => (
                    <JadwalCard
                        key={jadwal.id_jadwal}
                        jadwal={jadwal}
                        jurnal={jurnalHariIni?.[jadwal.id_jadwal]}
                        delay={itemIndex * 25}
                    />
                ))}
            </div>
        </PremiumCard>
    );
}

export default function Index({
    auth,
    guru,
    jadwals = {},
    jadwalHariIni = [],
    jurnalHariIni = {},
    info = {},
}) {
    const jumlahJadwalHariIni = jadwalHariIni?.length ?? 0;

    const weeklyTotal = useMemo(() => {
        return hariUrutan.reduce((total, hari) => total + (jadwals?.[hari]?.length || 0), 0);
    }, [jadwals]);

    const jurnalDibuatTotal = useMemo(() => {
        return Object.values(jurnalHariIni || {}).filter(Boolean).length;
    }, [jurnalHariIni]);

    const handleToday = () => {
        const el = document.getElementById('hari-ini');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleWeek = () => {
        const el = document.getElementById('minggu-ini');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }

        window.scrollTo({ top: 600, behavior: 'smooth' });
    };

    const guruName = guru?.nama_lengkap || auth?.user?.nama_lengkap || 'Guru';
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(guruName)}&background=4f46e5&color=fff`;

    return (
        <GuruLayout header="Jadwal Mengajar Saya">
            <Head title="Jadwal Mengajar" />

            <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/40 to-sky-50/60 py-5 sm:py-6">
                <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-indigo-200/35 blur-3xl" />
                <div className="pointer-events-none absolute right-0 top-40 h-80 w-80 translate-x-24 rounded-full bg-sky-200/40 blur-3xl" />
                <div className="pointer-events-none absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-violet-200/25 blur-3xl" />

                <div className="relative mx-auto max-w-7xl space-y-5 px-3 pb-12 sm:space-y-6 sm:px-6 lg:px-8">
                    {/* HERO */}
                    <PremiumCard className="relative overflow-hidden p-0" delay={0}>
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 via-violet-700 to-sky-700" />
                        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/15 blur-2xl" />
                        <div className="absolute bottom-0 left-1/3 h-32 w-32 translate-y-10 rounded-full bg-indigo-200/20 blur-2xl" />

                        <div className="relative p-4 text-white sm:p-6 lg:p-7">
                            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex min-w-0 items-start gap-4 sm:items-center">
                                    <img
                                        src={guru?.foto_url || avatarUrl}
                                        alt={guruName}
                                        className="h-16 w-16 shrink-0 rounded-3xl border border-white/30 bg-white object-cover shadow-xl sm:h-20 sm:w-20"
                                    />

                                    <div className="min-w-0">
                                        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-indigo-50 backdrop-blur-md">
                                            <Sparkles className="h-3.5 w-3.5" />
                                            Jadwal Mengajar
                                        </div>

                                        <h1 className="mt-3 text-xl font-black leading-tight tracking-tight sm:text-2xl lg:text-3xl">
                                            {guruName}
                                        </h1>

                                        <p className="mt-2 max-w-3xl text-sm font-medium leading-relaxed text-white/80">
                                            Tahun Ajaran:{' '}
                                            <span className="font-black text-indigo-100">
                                                {info?.tahunAjaran ?? '-'}
                                            </span>
                                            {' '}• Semester{' '}
                                            <span className="font-black text-sky-100">
                                                {info?.semester ?? '-'}
                                            </span>
                                        </p>

                                        <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-white/90">
                                            <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                                                Hari ini: {info?.tanggalHariIni ?? '-'}
                                            </span>

                                            <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                                                {jumlahJadwalHariIni} Jadwal Hari Ini
                                            </span>

                                            <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                                                {weeklyTotal} Jadwal Mingguan
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 sm:min-w-[360px]">
                                    <StatMiniCard
                                        label="Hari Ini"
                                        value={jumlahJadwalHariIni}
                                        icon={Calendar}
                                    />

                                    <StatMiniCard
                                        label="Mingguan"
                                        value={weeklyTotal}
                                        icon={Layers}
                                    />

                                    <StatMiniCard
                                        label="Jurnal"
                                        value={jurnalDibuatTotal}
                                        icon={ClipboardCheck}
                                    />

                                    <StatMiniCard
                                        label="Status"
                                        value={jumlahJadwalHariIni > 0 ? 'Aktif' : '—'}
                                        icon={UserCheck}
                                    />
                                </div>
                            </div>
                        </div>
                    </PremiumCard>

                    {/* Action Bar */}
                    <PremiumCard className="p-3 sm:p-4" delay={80}>
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                                    <CalendarDays className="h-5 w-5" />
                                </div>

                                <div>
                                    <p className="text-sm font-black text-slate-900">
                                        Navigasi Jadwal
                                    </p>

                                    <p className="text-xs font-medium text-slate-500">
                                        Lompat ke jadwal hari ini atau minggu ini.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleToday}
                                    className="inline-flex min-h-10 items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-3.5 py-2 text-xs font-black text-white shadow-lg shadow-indigo-200 transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105"
                                >
                                    <Calendar className="h-4 w-4" />
                                    Hari Ini
                                </button>

                                <button
                                    type="button"
                                    onClick={handleWeek}
                                    className="inline-flex min-h-10 items-center gap-2 rounded-2xl border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-black text-indigo-700 transition hover:bg-indigo-100"
                                >
                                    <Layers className="h-4 w-4" />
                                    Minggu Ini
                                </button>

                                <button
                                    type="button"
                                    onClick={() => window.print()}
                                    className="inline-flex min-h-10 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-50"
                                >
                                    <Printer className="h-4 w-4" />
                                    Cetak
                                </button>

                                <a
                                    href={safeRoute('guru.jadwal.export.ical')}
                                    className="inline-flex min-h-10 items-center gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-3.5 py-2 text-xs font-black text-sky-700 transition hover:bg-sky-100"
                                >
                                    <ArrowDownToLine className="h-4 w-4" />
                                    Export iCal
                                </a>
                            </div>
                        </div>
                    </PremiumCard>

                    {/* Hari Ini */}
                    <section id="hari-ini" className="scroll-mt-24">
                        <PremiumCard className="p-4 sm:p-5" delay={120}>
                            <div className="mb-4 flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 shadow-sm">
                                        <Calendar className="h-5 w-5" />
                                    </div>

                                    <div>
                                        <h2 className="text-lg font-black text-slate-900">
                                            Jadwal Hari Ini
                                        </h2>

                                        <p className="text-xs font-semibold text-slate-500">
                                            {info?.tanggalHariIni ?? '-'} • {jumlahJadwalHariIni} jadwal
                                        </p>
                                    </div>
                                </div>

                                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700">
                                    <Clock className="h-3.5 w-3.5" />
                                    Hari Ini
                                </span>
                            </div>

                            {jumlahJadwalHariIni > 0 ? (
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                                    {jadwalHariIni.map((jadwal, index) => {
                                        const normalized = normalizeTodaySchedule(jadwal);

                                        return (
                                            <JadwalCard
                                                key={normalized.id_jadwal}
                                                jadwal={normalized}
                                                jurnal={jurnalHariIni?.[normalized.id_jadwal]}
                                                delay={index * 40}
                                            />
                                        );
                                    })}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={Info}
                                    title="Tidak ada jadwal hari ini"
                                    description="Hari ini belum ada jadwal mengajar yang tercatat."
                                />
                            )}
                        </PremiumCard>
                    </section>

                    {/* Mingguan */}
                    <section id="minggu-ini" className="scroll-mt-24 space-y-4">
                        <PremiumCard className="p-4 sm:p-5" delay={150}>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-700 shadow-sm">
                                        <CalendarDays className="h-5 w-5" />
                                    </div>

                                    <div>
                                        <h2 className="text-lg font-black text-slate-900">
                                            Jadwal Minggu Ini
                                        </h2>

                                        <p className="text-xs font-semibold text-slate-500">
                                            Total {weeklyTotal} jadwal mengajar dalam satu minggu.
                                        </p>
                                    </div>
                                </div>

                                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-black text-violet-700">
                                    <BookOpen className="h-3.5 w-3.5" />
                                    Mingguan
                                </span>
                            </div>
                        </PremiumCard>

                        {weeklyTotal > 0 ? (
                            <div className="space-y-4">
                                {hariUrutan.map((hari, index) => (
                                    <DaySection
                                        key={hari}
                                        hari={hari}
                                        items={jadwals?.[hari] || []}
                                        jurnalHariIni={jurnalHariIni}
                                        index={index}
                                    />
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                icon={CalendarDays}
                                title="Jadwal mingguan kosong"
                                description="Belum ada jadwal mengajar yang tercatat pada minggu ini."
                            />
                        )}
                    </section>
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

        @media print {
          header,
          aside,
          button,
          a[href$=".ics"] {
            display: none !important;
          }

          body {
            background: white !important;
          }

          .animate-soft-rise {
            animation: none !important;
          }
        }
      `}</style>
        </GuruLayout>
    );
}