import React, { useMemo } from 'react';
import SiswaLayout from '@/Layouts/SiswaLayout';
import { Head, useForm } from '@inertiajs/react';
import { BookOpen, Clock, CheckCircle, Plus, Heart, AlertCircle, Filter, AlertCircle as AlertIcon, CalendarDays } from 'lucide-react';
import Pagination from '@/Components/Pagination';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const AttendanceStatusTag = ({ status }) => {
  const statusMap = {
    Hadir: 'bg-emerald-100/90 text-emerald-800 border-emerald-200/50',
    Sakit: 'bg-amber-100/90 text-amber-800 border-amber-200/50',
    Izin: 'bg-yellow-100/90 text-yellow-800 border-yellow-200/50',
    Alfa: 'bg-rose-100/90 text-rose-800 border-rose-200/50',
  };
  return (
    <span className={cn('px-2.5 py-0.5 text-xs font-semibold rounded-full border', statusMap[status] || 'bg-slate-100 text-slate-800 border-slate-200/50')}>
      {status}
    </span>
  );
};

function LegendItem({ color, icon, label }) {
  return (
    <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl shadow-sm">
      <div className={cn('h-5 w-5 rounded-md flex items-center justify-center text-white shadow-sm', color)}>{icon}</div>
      <div className="text-[11px] font-bold text-slate-600">{label}</div>
    </div>
  );
}

const Calendar = ({ month, year, absensiHarian = {}, onDateClick, selectedDate }) => {
  const today = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const monthDays = useMemo(() => {
    const firstOfMonth = new Date(year, month - 1, 1);
    const first = (firstOfMonth.getDay() + 6) % 7; // Monday start
    const dim = new Date(year, month, 0).getDate();
    return Array.from({ length: first }, () => null).concat(Array.from({ length: dim }, (_, i) => i + 1));
  }, [month, year]);

  const statusMap = {
    Hadir: { bg: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-100', icon: <CheckCircle className="h-3 h-3 text-white" /> },
    Izin:  { bg: 'bg-yellow-400 hover:bg-yellow-500 shadow-yellow-100', icon: <Plus className="h-3 h-3 text-white" /> },
    Sakit: { bg: 'bg-amber-500 hover:bg-amber-600 shadow-amber-100', icon: <Heart className="h-3 h-3 text-white" /> },
    Alfa:  { bg: 'bg-rose-500 hover:bg-rose-600 shadow-rose-100', icon: <AlertCircle className="h-3 h-3 text-white" /> },
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 gap-3 mb-4">
        {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map(d => (
          <div key={d} className="text-center text-xs font-bold text-slate-400 py-1 select-none uppercase tracking-wider">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-3 justify-items-center">
        {monthDays.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} className="h-10 w-10 md:h-12 md:w-12" />;

          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const absen = absensiHarian[dateStr];
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;
          const isSunday = (idx % 7) === 6;

          const status = absen?.status_kehadiran;
          const statusStyle = status ? statusMap[status] : null;

          const circleBase = 'flex items-center justify-center rounded-2xl transition-all duration-200 cursor-pointer select-none';
          const circleSize = 'w-10 h-10 md:w-12 md:h-12';
          const colored = statusStyle ? `${statusStyle.bg} text-white shadow-lg` : 'bg-slate-50 border border-slate-200/40 text-slate-800 hover:bg-slate-100';
          const todayRing = isToday ? 'ring-2 ring-sky-400' : '';
          const selectedRing = isSelected ? 'ring-2 ring-indigo-500 ring-offset-2 scale-105' : '';

          return (
            <div key={dateStr} className="relative w-full flex items-center justify-center">
              <button
                type="button"
                onClick={() => onDateClick(dateStr)}
                aria-pressed={isSelected}
                aria-label={`Tanggal ${day} ${month} ${year}${status ? `, status ${status}` : ''}`}
                className={cn(circleBase, circleSize, colored, todayRing, selectedRing, 'group relative')}
              >
                <span className={cn('text-xs md:text-sm font-bold', status ? 'text-white' : (isSunday ? 'text-rose-500' : 'text-slate-700'))}>
                  {day}
                </span>

                {statusStyle && (
                  <span className="absolute -top-1 -right-1 bg-white/20 backdrop-blur-sm rounded-full p-0.5 border border-white/30 shadow-sm">
                    {statusStyle.icon}
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <LegendItem color="bg-emerald-500" icon={<CheckCircle className="h-3 h-3 text-white" />} label="Hadir" />
        <LegendItem color="bg-yellow-400" icon={<Plus className="h-3 h-3 text-white" />} label="Izin" />
        <LegendItem color="bg-amber-500" icon={<Heart className="h-3 h-3 text-white" />} label="Sakit" />
        <LegendItem color="bg-rose-500" icon={<AlertCircle className="h-3 h-3 text-white" />} label="Alfa" />
      </div>
    </div>
  );
};

const RiwayatTab = ({ riwayatKehadiran, filters }) => {
  const { data, setData, get, processing } = useForm({
    status: filters.status || 'Semua',
    tanggal_mulai: filters.tanggal_mulai || '',
    tanggal_selesai: filters.tanggal_selesai || '',
  });

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    get(route('siswa.absensi.index'), {
      data: { ...data, tab: 'riwayat' },
      preserveState: true,
      preserveScroll: true,
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
      <form onSubmit={handleFilterSubmit} className="flex flex-wrap items-end gap-4 p-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
        <div className="flex-grow min-w-[160px]">
          <label htmlFor="status" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Status Kehadiran</label>
          <select 
            id="status" 
            value={data.status} 
            onChange={e => setData('status', e.target.value)} 
            className="mt-1.5 block w-full border-slate-200 rounded-xl shadow-sm text-sm focus:border-sky-500 focus:ring-sky-500/20 font-semibold text-slate-700"
          >
            <option>Semua</option>
            <option>Hadir</option>
            <option>Sakit</option>
            <option>Izin</option>
            <option>Alfa</option>
            <option>Terlambat</option>
          </select>
        </div>
        
        <div className="flex-grow min-w-[170px]">
          <label htmlFor="tanggal_mulai" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Dari Tanggal</label>
          <input 
            type="date" 
            id="tanggal_mulai" 
            value={data.tanggal_mulai} 
            onChange={e => setData('tanggal_mulai', e.target.value)} 
            className="mt-1.5 block w-full border-slate-200 rounded-xl shadow-sm text-sm focus:border-sky-500 focus:ring-sky-500/20 font-semibold text-slate-700" 
          />
        </div>
        
        <div className="flex-grow min-w-[170px]">
          <label htmlFor="tanggal_selesai" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Sampai Tanggal</label>
          <input 
            type="date" 
            id="tanggal_selesai" 
            value={data.tanggal_selesai} 
            onChange={e => setData('tanggal_selesai', e.target.value)} 
            className="mt-1.5 block w-full border-slate-200 rounded-xl shadow-sm text-sm focus:border-sky-500 focus:ring-sky-500/20 font-semibold text-slate-700" 
          />
        </div>
        
        <button 
          type="submit" 
          disabled={processing} 
          className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md shadow-slate-950/10 hover:shadow-lg flex items-center justify-center gap-2 h-[42px] transition-all duration-200 self-end w-full md:w-auto"
        >
          <Filter className="w-4 h-4" /> Filter Riwayat
        </button>
      </form>

      <div className="overflow-hidden border border-slate-100 rounded-2xl shadow-inner bg-slate-50/20">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-[10px] text-slate-400 uppercase bg-slate-50 font-bold border-b border-slate-100 tracking-wider">
              <tr>
                <th scope="col" className="px-6 py-4">Tanggal Kehadiran</th>
                <th scope="col" className="px-6 py-4">Status</th>
                <th scope="col" className="px-6 py-4">Masuk</th>
                <th scope="col" className="px-6 py-4">Pulang</th>
                <th scope="col" className="px-6 py-4">Keterlambatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {riwayatKehadiran.data.map(absen => (
                <tr key={absen.id_absensi} className="bg-white hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800 whitespace-nowrap">
                    {new Date(absen.tanggal + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4"><AttendanceStatusTag status={absen.status_kehadiran} /></td>
                  <td className="px-6 py-4 font-medium text-slate-700">{absen.jam_masuk?.slice(0, 5) || '-'}</td>
                  <td className="px-6 py-4 font-medium text-slate-700">{absen.jam_pulang?.slice(0, 5) || '-'}</td>
                  <td className={`px-6 py-4 font-bold ${absen.menit_keterlambatan > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {absen.menit_keterlambatan > 0 ? `${absen.menit_keterlambatan} Menit` : 'Tepat Waktu'}
                  </td>
                </tr>
              ))}
              {riwayatKehadiran.data.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <AlertIcon className="mx-auto w-12 h-12 text-slate-300 mb-2" />
                    <p className="text-sm font-bold text-slate-400">Tidak ada riwayat kehadiran</p>
                    <p className="text-xs text-slate-400/80 mt-1">Coba sesuaikan filter status atau tanggal di atas.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="pt-2">
        <Pagination links={riwayatKehadiran.links} />
      </div>
    </div>
  );
};

export default function AbsensiIndex({ auth, siswa, absensiHarian = {}, absensiMapel = {}, riwayatKehadiran, filters }) {
  const [activeTab, setActiveTab] = React.useState(filters.tab || 'kalender');
  const [selectedDate, setSelectedDate] = React.useState(null);

  const { data, setData, get, processing } = useForm({
    bulan: filters.bulan || new Date().getMonth() + 1,
    tahun: filters.tahun || new Date().getFullYear(),
  });

  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const handleMonthYearChange = (e) => {
    e.preventDefault();
    get(route('siswa.absensi.index'), { data, preserveState: true });
  };

  return (
    <SiswaLayout header="Riwayat Kehadiran">
      <Head title="Lihat Absensi" />

      <div className="max-w-7xl mx-auto space-y-8 pb-16">
        
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 md:p-8 shadow-xl text-white">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
          
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-sky-400 shadow-inner">
                <CalendarDays className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold tracking-tight">Riwayat Absensi</h2>
                <p className="text-xs md:text-sm text-slate-300 mt-1">
                  Pantau catatan kehadiran harian dan kelas per mata pelajaran Anda secara berkala.
                </p>
              </div>
            </div>

            {/* Navigation Tabs inside Banner */}
            <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl self-start md:self-auto">
              <button 
                onClick={() => setActiveTab('kalender')} 
                className={cn(
                  'px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200', 
                  activeTab === 'kalender' 
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20' 
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                )}
              >
                Tampilan Kalender
              </button>
              <button 
                onClick={() => setActiveTab('riwayat')} 
                className={cn(
                  'px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200', 
                  activeTab === 'riwayat' 
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20' 
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                )}
              >
                Tabel Riwayat
              </button>
            </div>
          </div>
        </div>

        <div>
          {activeTab === 'kalender' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              {/* Calendar Grid Container */}
              <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                <form onSubmit={handleMonthYearChange} className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4 border-b border-slate-100 pb-4">
                  <h3 className="text-base font-bold text-slate-800">{months[data.bulan - 1]} {data.tahun}</h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <select 
                      value={data.bulan} 
                      onChange={e => setData('bulan', e.target.value)} 
                      className="border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-sky-500/20 focus:border-sky-500 shadow-sm"
                    >
                      {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                    </select>
                    
                    <select 
                      value={data.tahun} 
                      onChange={e => setData('tahun', e.target.value)} 
                      className="border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-sky-500/20 focus:border-sky-500 shadow-sm"
                    >
                      {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    
                    <button 
                      type="submit" 
                      disabled={processing} 
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md hover:shadow transition-all"
                    >
                      Tampilkan
                    </button>
                  </div>
                </form>

                <Calendar 
                  month={Number(data.bulan)} 
                  year={Number(data.tahun)} 
                  absensiHarian={absensiHarian} 
                  onDateClick={setSelectedDate} 
                  selectedDate={selectedDate} 
                />
              </div>

              {/* Side Detail Panel */}
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">Detail Kehadiran</h3>
                
                {selectedDate ? (
                  <div className="space-y-5">
                    <p className="font-bold text-center text-xs text-indigo-600 bg-indigo-50 border border-indigo-100 py-2 px-3 rounded-2xl">
                      {new Date(selectedDate + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    
                    {/* Harian Card */}
                    <div className="p-4 bg-slate-50/70 border border-slate-100 rounded-2xl">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Absensi Harian</p>
                      {absensiHarian[selectedDate] ? (
                        <div className="flex justify-between items-center text-sm">
                          <AttendanceStatusTag status={absensiHarian[selectedDate].status_kehadiran} />
                          <div className="text-xs font-semibold text-slate-600 space-y-1">
                            <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" /> Masuk: <span className="font-bold text-slate-700">{absensiHarian[selectedDate].jam_masuk?.slice(0, 5) || '—'}</span></div>
                            <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" /> Pulang: <span className="font-bold text-slate-700">{absensiHarian[selectedDate].jam_pulang?.slice(0, 5) || '—'}</span></div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs font-bold text-slate-400/80 py-2 text-center border border-dashed border-slate-200 rounded-xl">Tidak ada catatan harian.</p>
                      )}
                    </div>

                    {/* Mapel list */}
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Kehadiran Mata Pelajaran</p>
                      <ul className="space-y-3 max-h-80 overflow-y-auto pr-1">
                        {absensiMapel[selectedDate]?.length > 0 ? absensiMapel[selectedDate].map(absen => (
                          <li key={absen.id_absensi_mapel} className="p-3 bg-white border border-slate-100 rounded-2xl hover:border-slate-200 transition-colors shadow-sm">
                            <div className="flex justify-between items-start gap-2">
                              <div className="min-w-0">
                                <p className="font-bold text-slate-800 text-xs truncate flex items-center">
                                  <BookOpen className="w-3.5 h-3.5 mr-2 text-sky-500 flex-shrink-0" />
                                  <span className="truncate">{absen.jadwal?.mapel?.nama_mapel || 'Mapel'}</span>
                                </p>
                                <p className="text-[10px] text-slate-400 font-semibold mt-1 flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {absen.jam_mulai?.slice(0, 5)} - {absen.jam_selesai?.slice(0, 5)}
                                </p>
                              </div>
                              <AttendanceStatusTag status={absen.status_kehadiran} />
                            </div>
                          </li>
                        )) : (
                          <p className="text-xs font-bold text-slate-400/80 py-6 text-center border border-dashed border-slate-200 rounded-xl">Tidak ada jadwal pelajaran.</p>
                        )}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    <CalendarDays className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-400">Pilih Tanggal</p>
                    <p className="text-[10px] text-slate-400/80 mt-0.5">Ketuk salah satu tanggal aktif pada kalender di samping untuk melihat detail.</p>
                  </div>
                )}
              </div>

            </div>
          )}
          
          {activeTab === 'riwayat' && <RiwayatTab riwayatKehadiran={riwayatKehadiran} filters={filters} />}
        </div>
      </div>
    </SiswaLayout>
  );
}
