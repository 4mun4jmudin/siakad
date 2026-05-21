import React, { useState, useEffect, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { CalendarDaysIcon, ClockIcon, MagnifyingGlassIcon, UserCircleIcon, CheckCircleIcon, PrinterIcon } from '@heroicons/react/24/solid';
import { PrinterIcon as PrinterOutlineIcon } from '@heroicons/react/24/outline';
import moment from 'moment';

const getStatus = (jamMulai, jamSelesai) => {
    const now = moment();
    const start = moment(jamMulai, 'HH:mm:ss');
    const end = moment(jamSelesai, 'HH:mm:ss');
    
    if (now.isBefore(start)) return 'AKAN DATANG';
    if (now.isAfter(end)) return 'SELESAI';
    return 'SEDANG BERLANGSUNG';
};

const getStatusColor = (status) => {
    switch (status) {
        case 'AKAN DATANG': return 'bg-gray-100 text-gray-800';
        case 'SEDANG BERLANGSUNG': return 'bg-green-100 text-green-800 animate-pulse';
        case 'SELESAI': return 'bg-slate-200 text-slate-800 opacity-70';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const getAvatarColor = (name) => {
    if (!name) return 'bg-gray-200 text-gray-600';
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
        'bg-blue-100 text-blue-600',
        'bg-indigo-100 text-indigo-600',
        'bg-purple-100 text-purple-600',
        'bg-pink-100 text-pink-600',
        'bg-orange-100 text-orange-600',
        'bg-teal-100 text-teal-600',
    ];
    return colors[Math.abs(hash) % colors.length];
};

const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 3).toUpperCase();
};

export default function JadwalPelajaran({ auth, jadwalGrouped, tahunAjaranAktif, kelasOptions, guruOptions, stats }) {
    const [searchQuery, setSearchQuery] = useState('');
    const hariMap = { Monday: 'Senin', Tuesday: 'Selasa', Wednesday: 'Rabu', Thursday: 'Kamis', Friday: 'Jumat', Saturday: 'Sabtu', Sunday: 'Minggu' };
    const todayName = hariMap[moment().format('dddd')] || 'Senin';
    const [filterHari, setFilterHari] = useState(todayName);
    const [filterKelas, setFilterKelas] = useState('Semua');
    const [currentTime, setCurrentTime] = useState(moment());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(moment()), 60000);
        return () => clearInterval(timer);
    }, []);

    const daysOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

    const filteredJadwal = useMemo(() => {
        let result = {};
        
        daysOrder.forEach(hari => {
            if (filterHari !== 'Semua' && hari !== filterHari) return;
            if (!jadwalGrouped[hari]) return;

            let classesForDay = {};
            
            Object.keys(jadwalGrouped[hari]).forEach(namaKelas => {
                if (filterKelas !== 'Semua' && namaKelas !== filterKelas && jadwalGrouped[hari][namaKelas].id_kelas !== filterKelas) return;
                
                const kelasData = jadwalGrouped[hari][namaKelas];
                const filteredSesi = kelasData.sesi.filter(sesi => {
                    if (!searchQuery) return true;
                    const q = searchQuery.toLowerCase();
                    return (sesi.mapel?.nama_mapel?.toLowerCase().includes(q) || 
                            sesi.guru?.nama_lengkap?.toLowerCase().includes(q) ||
                            namaKelas.toLowerCase().includes(q));
                });

                if (filteredSesi.length > 0) {
                    classesForDay[namaKelas] = {
                        ...kelasData,
                        sesi: filteredSesi
                    };
                }
            });

            if (Object.keys(classesForDay).length > 0) {
                result[hari] = classesForDay;
            }
        });
        
        return result;
    }, [jadwalGrouped, filterHari, filterKelas, searchQuery]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <AdminLayout user={auth.user} header="Jadwal Pelajaran">
            <Head title="Jadwal Pelajaran" />
            
            <style>
                {`
                @media print {
                    body * { visibility: hidden; }
                    #print-area, #print-area * { visibility: visible; }
                    #print-area { position: absolute; left: 0; top: 0; width: 100%; }
                    .no-print { display: none !important; }
                }
                `}
            </style>

            <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden no-print">
                    <div className="p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                                    <CalendarDaysIcon className="w-8 h-8 text-indigo-600" />
                                    Jadwal Pelajaran
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">
                                    Kelola data jadwal KBM (Kegiatan Belajar Mengajar) per Rombongan Belajar.
                                </p>
                            </div>
                            <div className="mt-4 md:mt-0 flex items-center gap-3 bg-indigo-50 px-4 py-2 rounded-xl text-indigo-700 font-semibold border border-indigo-100">
                                <CalendarDaysIcon className="w-5 h-5" />
                                {tahunAjaranAktif?.semester === 'Genap' ? 'SMST GENAP' : 'SMST GANJIL'} 
                                <span className="text-indigo-400">|</span> 
                                {tahunAjaranAktif?.tahun_ajaran || '-'}
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <div className="relative flex-grow max-w-md w-full">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                    placeholder="Cari kelas, mapel, atau guru..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <select
                                className="block w-full md:w-auto py-2 pl-3 pr-10 border border-gray-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium text-slate-700"
                                value={filterHari}
                                onChange={e => setFilterHari(e.target.value)}
                            >
                                <option value="Semua">Semua Hari</option>
                                {daysOrder.map(hari => <option key={hari} value={hari}>{hari}</option>)}
                            </select>

                            <select
                                className="block w-full md:w-auto py-2 pl-3 pr-10 border border-gray-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium text-slate-700"
                                value={filterKelas}
                                onChange={e => setFilterKelas(e.target.value)}
                            >
                                <option value="Semua">Semua Kelas</option>
                                {kelasOptions.map(k => <option key={k.id_kelas} value={k.id_kelas}>{k.tingkat} {k.jurusan}</option>)}
                            </select>

                            <button onClick={() => { setSearchQuery(''); setFilterHari(todayName); setFilterKelas('Semua'); }} className="text-sm text-orange-600 font-medium hover:text-orange-700 hover:bg-orange-50 px-3 py-2 rounded-lg transition-colors whitespace-nowrap">
                                Bersihkan Filter
                            </button>

                            <div className="flex-grow"></div>

                            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium rounded-xl border border-slate-200 transition-colors">
                                <PrinterOutlineIcon className="w-5 h-5" />
                                <span>Cetak</span>
                            </button>

                            <Link href={route('admin.jadwal-mengajar.index')} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-sm shadow-indigo-200">
                                <ClockIcon className="w-5 h-5" />
                                <span>Kelola Jadwal</span>
                            </Link>
                        </div>
                    </div>
                </div>

                <div id="print-area" className="space-y-8 pb-10">
                    {Object.keys(filteredJadwal).length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
                            <CalendarDaysIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-slate-700">Tidak ada jadwal</h3>
                            <p className="text-slate-500 mt-1">Coba ubah filter atau tambahkan jadwal baru.</p>
                        </div>
                    ) : (
                        daysOrder.map(hari => {
                            const dataHari = filteredJadwal[hari];
                            if (!dataHari) return null;

                            const totalSesiHariIni = Object.values(dataHari).reduce((sum, cls) => sum + cls.sesi.length, 0);

                            return (
                                <div key={hari} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-4">
                                        <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                                            <CalendarDaysIcon className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-extrabold text-slate-800">{hari}</h3>
                                        <span className="bg-white text-slate-600 text-xs font-bold px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                                            {totalSesiHariIni} Sesi
                                        </span>
                                    </div>
                                    
                                    <div className="p-6 space-y-6">
                                        {Object.values(dataHari).map((kelasData) => (
                                            <div key={kelasData.id_kelas} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                                <div className="bg-slate-900 px-6 py-4 flex justify-between items-center">
                                                    <div>
                                                        <h4 className="text-white font-bold text-lg flex items-center gap-2">
                                                            <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                                                            KELAS: {kelasData.nama_kelas}
                                                        </h4>
                                                        <p className="text-slate-400 text-xs mt-1 uppercase tracking-widest font-semibold ml-3.5">
                                                            Rombongan Belajar Terdaftar
                                                        </p>
                                                    </div>
                                                    <span className="bg-slate-800 text-slate-300 text-xs font-bold px-3 py-1.5 rounded-full border border-slate-700">
                                                        {kelasData.sesi.length} Sesi Aktif
                                                    </span>
                                                </div>

                                                <div className="overflow-x-auto">
                                                    <table className="w-full">
                                                        <thead>
                                                            <tr className="bg-slate-50 text-left border-b border-slate-200">
                                                                <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider w-16"></th>
                                                                <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider w-40">Waktu</th>
                                                                <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Mata Pelajaran</th>
                                                                <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Pegawai / Guru</th>
                                                                <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Siswa</th>
                                                                <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100">
                                                            {kelasData.sesi.sort((a, b) => a.jam_mulai.localeCompare(b.jam_mulai)).map((sesi, idx) => {
                                                                const status = getStatus(sesi.jam_mulai, sesi.jam_selesai);
                                                                const statusClass = getStatusColor(status);
                                                                
                                                                const jamMulaiFormatted = moment(sesi.jam_mulai, 'HH:mm:ss').format('HH:mm');
                                                                const jamSelesaiFormatted = moment(sesi.jam_selesai, 'HH:mm:ss').format('HH:mm');

                                                                const guruName = sesi.guru?.nama_lengkap;
                                                                const avatarColor = getAvatarColor(guruName);
                                                                const initials = getInitials(guruName);

                                                                return (
                                                                    <tr key={sesi.id_jadwal} className="hover:bg-slate-50/50 transition-colors">
                                                                        <td className="py-4 px-6 text-center text-slate-300">
                                                                            <div className="w-4 h-4 border-2 border-slate-200 rounded-full mx-auto"></div>
                                                                        </td>
                                                                        <td className="py-4 px-6">
                                                                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                                                                <ClockIcon className="w-4 h-4 text-slate-400" />
                                                                                {jamMulaiFormatted} - {jamSelesaiFormatted}
                                                                            </div>
                                                                        </td>
                                                                        <td className="py-4 px-6">
                                                                            <div className="text-sm font-bold text-indigo-900">{sesi.mapel?.nama_mapel || '-'}</div>
                                                                            <div className="text-[10px] font-bold text-slate-400 mt-0.5">{sesi.id_mapel}</div>
                                                                        </td>
                                                                        <td className="py-4 px-6">
                                                                            {guruName ? (
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${avatarColor}`}>
                                                                                        {initials}
                                                                                    </div>
                                                                                    <div>
                                                                                        <div className="text-sm font-bold text-slate-700">{guruName}</div>
                                                                                        <div className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wide">Guru Pengampu</div>
                                                                                    </div>
                                                                                </div>
                                                                            ) : (
                                                                                <div className="flex items-center gap-2 text-slate-400 text-sm font-medium italic">
                                                                                    <UserCircleIcon className="w-5 h-5" />
                                                                                    Belum diatur
                                                                                </div>
                                                                            )}
                                                                        </td>
                                                                        <td className="py-4 px-6 text-center">
                                                                            <div className="flex flex-col items-center justify-center">
                                                                                <div className="text-sm font-bold text-indigo-600">
                                                                                    {sesi.hadir_hari_ini}/{kelasData.total_siswa}
                                                                                </div>
                                                                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Hadir</div>
                                                                            </div>
                                                                        </td>
                                                                        <td className="py-4 px-6 text-center">
                                                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider ${statusClass}`}>
                                                                                {status}
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
