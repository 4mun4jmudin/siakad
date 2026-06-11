import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import { ArrowPathIcon, ArrowsRightLeftIcon, ClockIcon, TrashIcon } from '@heroicons/react/24/outline';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

const ItemTypes = {
    MAPEL: 'mapel'
};

const cn = (...classes) => classes.filter(Boolean).join(' ');

const clampStyle = (lines = 1) => ({
    display: '-webkit-box',
    WebkitLineClamp: lines,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    wordBreak: 'break-word'
});

const DraggableMapel = ({ mapel }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemTypes.MAPEL,
        item: {
            id_mapel: mapel.id_mapel,
            id_guru_default: mapel.id_guru_default,
            nama_mapel: mapel.nama_mapel
        },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

    const guruDefault = mapel.guru_default ? mapel.guru_default.nama_lengkap : 'Belum diset Guru';

    return (
        <div
            ref={drag}
            title={`${mapel.nama_mapel}\n${guruDefault}`}
            className={cn(
                'mb-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm',
                'cursor-grab active:cursor-grabbing transition-all duration-200',
                isDragging
                    ? 'opacity-50 scale-95'
                    : 'hover:shadow-md hover:border-blue-300 hover:bg-blue-50/30'
            )}
        >
            <p
                className="text-sm font-bold leading-snug text-slate-800"
                style={clampStyle(2)}
            >
                {mapel.nama_mapel}
            </p>

            <p
                className="mt-1 text-xs leading-snug text-slate-500"
                style={clampStyle(1)}
            >
                {guruDefault}
            </p>
        </div>
    );
};

const DroppableSlot = ({
    day,
    timeSlot,
    scheduleItems,
    onDrop,
    onSwapClick,
    onRecommendClick,
    onDeleteClick
}) => {
    const [{ isOver, canDrop }, drop] = useDrop(() => ({
        accept: ItemTypes.MAPEL,
        drop: (item) => onDrop(item, day, timeSlot),
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
            canDrop: !!monitor.canDrop()
        }),
    }));

    const slotItems = scheduleItems.filter(item => {
        if (item.hari !== day) return false;

        const slotStart = timeSlot.start;
        const slotEnd = timeSlot.end;
        const itemStart = item.jam_mulai.substring(0, 5);
        const itemEnd = item.jam_selesai.substring(0, 5);

        return itemStart < slotEnd && itemEnd > slotStart;
    });

    const bgClass = isOver && canDrop
        ? 'bg-blue-50 border-blue-400 border-dashed ring-2 ring-blue-100'
        : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50';

    return (
        <div
            ref={drop}
            className={cn(
                'relative group min-h-[82px] rounded-xl border p-1 sm:p-1.5',
                'transition-all duration-200 overflow-visible',
                bgClass
            )}
        >
            {slotItems.map((item, idx) => {
                const namaMapel = item.mapel?.nama_mapel || '-';
                const namaGuru = item.guru?.nama_lengkap || '-';
                const jamMulai = item.jam_mulai?.substring(0, 5) || '-';
                const jamSelesai = item.jam_selesai?.substring(0, 5) || '-';
                const jam = `${jamMulai} - ${jamSelesai}`;

                return (
                    <div
                        key={idx}
                        className={cn(
                            'relative rounded-lg border border-indigo-200 bg-indigo-50',
                            'p-1.5 shadow-sm group/item overflow-visible'
                        )}
                        title={`${namaMapel}\nGuru: ${namaGuru}\nHari: ${item.hari}\nJam: ${jam}`}
                    >
                        <div className="min-w-0">
                            <p
                                className="text-center text-[9px] sm:text-[10px] xl:text-[11px] font-bold text-indigo-950 leading-tight"
                                style={clampStyle(2)}
                            >
                                {namaMapel}
                            </p>

                            <div className="hidden 2xl:block">
                                <p
                                    className="mt-1 text-center text-[9px] text-indigo-600 leading-tight"
                                    style={clampStyle(1)}
                                >
                                    {namaGuru}
                                </p>
                            </div>

                            <p className="mt-1 text-center text-[8px] sm:text-[9px] font-semibold text-indigo-400 leading-tight">
                                {jam}
                            </p>
                        </div>

                        <div
                            className={cn(
                                'absolute right-1 top-1 z-30 flex gap-1',
                                'opacity-0 group-hover/item:opacity-100 transition-opacity'
                            )}
                        >
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSwapClick(item);
                                }}
                                className={cn(
                                    'rounded-md border border-slate-100 bg-white p-1 shadow',
                                    'text-slate-600 hover:text-blue-600 hover:border-blue-200'
                                )}
                                title="Tukar Guru"
                            >
                                <ArrowsRightLeftIcon className="h-3 w-3" />
                            </button>

                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteClick(item.id_jadwal);
                                }}
                                className={cn(
                                    'rounded-md border border-slate-100 bg-white p-1 shadow',
                                    'text-slate-600 hover:text-red-600 hover:border-red-200'
                                )}
                                title="Hapus Jadwal"
                            >
                                <TrashIcon className="h-3 w-3" />
                            </button>
                        </div>

                        <div
                            className={cn(
                                'pointer-events-none absolute left-1/2 top-full z-50 mt-2 hidden',
                                'w-64 -translate-x-1/2 rounded-xl border border-slate-200',
                                'bg-white p-3 text-left shadow-2xl group-hover/item:block'
                            )}
                        >
                            <p className="text-xs font-bold leading-snug text-slate-900 break-words">
                                {namaMapel}
                            </p>

                            <div className="mt-2 space-y-1 text-[11px] leading-relaxed text-slate-600">
                                <p className="break-words">
                                    <span className="font-semibold text-slate-800">Guru:</span>{' '}
                                    {namaGuru}
                                </p>

                                <p>
                                    <span className="font-semibold text-slate-800">Hari:</span>{' '}
                                    {item.hari}
                                </p>

                                <p>
                                    <span className="font-semibold text-slate-800">Jam:</span>{' '}
                                    {jam}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}

            {slotItems.length === 0 && (
                <div className="flex min-h-[68px] flex-col items-center justify-center gap-1 text-center opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="text-[9px] sm:text-[10px] font-medium leading-tight text-slate-400">
                        Tarik ke sini
                    </span>

                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onRecommendClick(day, timeSlot);
                        }}
                        className="rounded bg-emerald-100 px-2 py-1 text-[8px] sm:text-[9px] font-semibold text-emerald-700 shadow-sm hover:bg-emerald-200"
                    >
                        Rekomendasi
                    </button>
                </div>
            )}
        </div>
    );
};

export default function InteractiveSchedule({
    auth,
    kelasOptions,
    guruOptions,
    mapels,
    tahunAjaranAktif,
    pengaturan
}) {
    const [selectedKelas, setSelectedKelas] = useState('');
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(false);

    const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
    const [selectedScheduleItem, setSelectedScheduleItem] = useState(null);
    const [newGuruId, setNewGuruId] = useState('');

    const [isRecommendationModalOpen, setIsRecommendationModalOpen] = useState(false);
    const [recommendationList, setRecommendationList] = useState([]);
    const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
    const [selectedRecommendationSlot, setSelectedRecommendationSlot] = useState(null);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const days = pengaturan?.jadwal_hari || ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    const timeBlocks = pengaturan?.jadwal_waktu || [
        { id: 'duha', type: 'istirahat', label: '07:00 - 08:00', keterangan: 'Wajib Shalat Duha', start: '07:00', end: '08:00' },
        { id: '1', type: 'pelajaran', label: '08:00 - 09:30', start: '08:00', end: '09:30' },
        { id: '2', type: 'pelajaran', label: '09:30 - 11:00', start: '09:30', end: '11:00' },
        { id: 'ist1', type: 'istirahat', label: '11:00 - 11:15', keterangan: 'Istirahat', start: '11:00', end: '11:15' },
        { id: '3', type: 'pelajaran', label: '11:15 - 12:00', start: '11:15', end: '12:00' },
        { id: 'ist2', type: 'istirahat', label: '12:00 - 13:00', keterangan: 'Istirahat & Shalat Dzuhur', start: '12:00', end: '13:00' },
        { id: '4', type: 'pelajaran', label: '13:00 - 14:30', start: '13:00', end: '14:30' }
    ];

    const gridTemplateColumns = `repeat(${days.length + 1}, minmax(0, 1fr))`;

    const fetchSchedule = async (id_kelas) => {
        if (!id_kelas) {
            setSchedule([]);
            return;
        }

        setLoading(true);

        try {
            const res = await axios.post(route('admin.jadwal-interaktif.fetch'), { id_kelas });
            setSchedule(res.data.jadwal);
        } catch (error) {
            console.error('Error in fetchSchedule:', error);
            toast.error('Gagal mengambil jadwal kelas.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedKelas) {
            fetchSchedule(selectedKelas);
        } else {
            setSchedule([]);
        }
    }, [selectedKelas]);

    const handleDrop = async (item, day, timeSlot) => {
        if (!selectedKelas) {
            toast.error('Pilih kelas terlebih dahulu!');
            return;
        }

        if (!item.id_guru_default) {
            toast.error('Mata pelajaran ini belum memiliki Guru Pengampu default. Silakan set di Data Master.');
            return;
        }

        if (isSubmitting) return;

        setIsSubmitting(true);

        const data = {
            id_kelas: selectedKelas,
            id_mapel: item.id_mapel,
            id_guru: item.id_guru_default,
            hari: day,
            jam_mulai: timeSlot.start,
            jam_selesai: timeSlot.end
        };

        const loadToast = toast.loading('Menyimpan jadwal...');

        try {
            const res = await axios.post(route('admin.jadwal-interaktif.drag-drop'), data);
            toast.success(res.data.message, { id: loadToast });
            await fetchSchedule(selectedKelas);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menyimpan. Terjadi bentrok.', { id: loadToast });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAutoSchedule = async () => {
        const confirm = window.confirm('Jadwal serentak akan mengisi slot kosong untuk seluruh kelas yang ada. Lanjutkan?');
        if (!confirm) return;

        const loadToast = toast.loading('Memproses auto-schedule. Mohon tunggu...');

        try {
            const res = await axios.post(route('admin.jadwal-interaktif.auto-schedule'));
            toast.success(res.data.message, { id: loadToast, duration: 4000 });

            if (selectedKelas) {
                fetchSchedule(selectedKelas);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Gagal memproses auto-schedule.', { id: loadToast });
        }
    };

    const openSwapModal = (item) => {
        setSelectedScheduleItem(item);
        setNewGuruId(item.id_guru);
        setIsSwapModalOpen(true);
    };

    const handleSwapTeacher = async (e) => {
        e.preventDefault();

        const loadToast = toast.loading('Memvalidasi dan mengubah guru...');

        try {
            await axios.post(route('admin.jadwal-interaktif.update-teacher'), {
                id_jadwal: selectedScheduleItem.id_jadwal,
                id_guru: newGuruId
            });

            toast.success('Guru berhasil diubah!', { id: loadToast });
            setIsSwapModalOpen(false);
            fetchSchedule(selectedKelas);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Bentrok jadwal!', { id: loadToast });
        }
    };

    const openRecommendationModal = async (day, timeSlot) => {
        if (!selectedKelas) {
            toast.error('Pilih kelas terlebih dahulu!');
            return;
        }

        setSelectedRecommendationSlot({ day, timeSlot });
        setIsRecommendationModalOpen(true);
        setIsLoadingRecommendations(true);
        setRecommendationList([]);

        try {
            const res = await axios.post(route('admin.jadwal-interaktif.recommendations'), {
                id_kelas: selectedKelas,
                hari: day,
                jam_mulai: timeSlot.start,
                jam_selesai: timeSlot.end
            });

            setRecommendationList(res.data.recommendations);
        } catch (error) {
            console.error(error);
            toast.error('Gagal mengambil rekomendasi.');
            setIsRecommendationModalOpen(false);
        } finally {
            setIsLoadingRecommendations(false);
        }
    };

    const handleSelectRecommendation = (mapel) => {
        if (!selectedRecommendationSlot) return;

        const item = {
            id_mapel: mapel.id_mapel,
            id_guru_default: mapel.id_guru_default,
            nama_mapel: mapel.nama_mapel
        };

        handleDrop(item, selectedRecommendationSlot.day, selectedRecommendationSlot.timeSlot);
        setIsRecommendationModalOpen(false);
    };

    const handleDeleteSchedule = async (id_jadwal) => {
        if (!window.confirm('Yakin ingin menghapus jadwal ini?')) return;

        const loadToast = toast.loading('Menghapus jadwal...');

        try {
            await axios.delete(route('admin.jadwal-interaktif.delete', id_jadwal));
            toast.success('Jadwal dihapus.', { id: loadToast });
            fetchSchedule(selectedKelas);
        } catch (error) {
            toast.error('Gagal menghapus jadwal.', { id: loadToast });
        }
    };

    return (
        <AdminLayout user={auth.user} header="Jadwal Interaktif">
            <Head title="Jadwal Interaktif" />
            <Toaster position="top-right" />

            <div className="min-h-screen bg-slate-50 p-3 sm:p-4 md:p-6 lg:p-8">
                <div className="mx-auto max-w-[1600px] space-y-6">

                    {/* Header Panel */}
                    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm md:flex-row md:items-center md:justify-between">
                        <div className="w-full md:max-w-md">
                            <label className="mb-1 block text-sm font-semibold text-slate-700">
                                Pilih Kelas
                            </label>

                            <select
                                className="min-h-11 w-full rounded-xl border-slate-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={selectedKelas}
                                onChange={(e) => setSelectedKelas(e.target.value)}
                            >
                                <option value="">-- Pilih Kelas --</option>

                                {kelasOptions.map(k => (
                                    <option key={k.id_kelas} value={k.id_kelas}>
                                        {k.tingkat} {k.jurusan}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex w-full gap-3 md:w-auto">
                            <button
                                type="button"
                                onClick={handleAutoSchedule}
                                className="flex min-h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow shadow-indigo-200 transition-transform hover:scale-[1.02] md:w-auto"
                            >
                                <ClockIcon className="mr-2 h-5 w-5 flex-shrink-0" />
                                <span className="text-center leading-tight">
                                    Buat Jadwal Serentak
                                </span>
                            </button>
                        </div>
                    </div>

                    <DndProvider backend={HTML5Backend}>
                        <div className="flex flex-col gap-6 lg:flex-row">

                            {/* Sidebar Mapel */}
                            <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm lg:w-1/4 xl:w-1/5 lg:h-[calc(100vh-250px)] lg:overflow-y-auto custom-scrollbar">
                                <h3 className="sticky top-0 z-10 mb-2 border-b bg-white pb-2 text-base font-bold text-slate-800">
                                    Daftar Mapel
                                </h3>

                                <p className="mb-4 text-xs leading-relaxed text-slate-500">
                                    Tarik mapel ke grid kalender.
                                </p>

                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
                                    {mapels.map(mapel => (
                                        <DraggableMapel key={mapel.id_mapel} mapel={mapel} />
                                    ))}
                                </div>
                            </div>

                            {/* Main Grid */}
                            <div className="w-full rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 lg:w-3/4 lg:p-5 xl:w-4/5 shadow-sm overflow-visible">
                                {!selectedKelas ? (
                                    <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-6 text-center text-slate-400">
                                        <ClockIcon className="mb-3 h-12 w-12 opacity-50" />

                                        <p className="text-sm font-medium leading-relaxed">
                                            Silakan pilih kelas terlebih dahulu untuk melihat grid jadwal.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="w-full min-w-0 overflow-visible">

                                        {/* Headers */}
                                        <div
                                            className="mb-2 grid gap-1 sm:gap-2"
                                            style={{ gridTemplateColumns }}
                                        >
                                            <div className="rounded-xl bg-slate-50 px-1 py-2 text-center text-[9px] sm:text-[10px] lg:text-xs font-bold uppercase leading-tight text-slate-500">
                                                Jam / Hari
                                            </div>

                                            {days.map(day => (
                                                <div
                                                    key={day}
                                                    className="rounded-xl bg-indigo-50 px-1 py-2 text-center text-[9px] sm:text-[10px] lg:text-xs font-bold uppercase leading-tight text-slate-700"
                                                    title={day}
                                                >
                                                    {day}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Rows */}
                                        {loading ? (
                                            <div className="flex items-center justify-center py-20 text-slate-400">
                                                <ArrowPathIcon className="h-8 w-8 animate-spin" />
                                            </div>
                                        ) : (
                                            timeBlocks.map((block, index) => (
                                                <React.Fragment key={block.id || index}>
                                                    {block.type === 'istirahat' ? (
                                                        <div
                                                            className="mb-2 grid gap-1 sm:gap-2"
                                                            style={{ gridTemplateColumns }}
                                                        >
                                                            <div className="col-span-1 rounded-xl bg-slate-50 px-1 py-2 text-center text-[8px] sm:text-[9px] lg:text-xs font-semibold leading-tight text-slate-500">
                                                                {block.start} - {block.end}
                                                            </div>

                                                            <div
                                                                className={cn(
                                                                    'flex items-center justify-center rounded-xl px-2 py-2 text-center text-[9px] sm:text-[10px] lg:text-xs font-semibold leading-tight',
                                                                    index === 0
                                                                        ? 'bg-amber-50 text-amber-700'
                                                                        : 'bg-green-50 text-green-700'
                                                                )}
                                                                style={{ gridColumn: `span ${days.length} / span ${days.length}` }}
                                                                title={block.keterangan || 'Istirahat'}
                                                            >
                                                                <span style={clampStyle(2)}>
                                                                    {block.keterangan || 'Istirahat'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div
                                                            className="mb-2 grid gap-1 sm:gap-2"
                                                            style={{ gridTemplateColumns }}
                                                        >
                                                            <div className="flex min-h-[82px] flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50 p-1 text-center sm:p-2">
                                                                <span
                                                                    className="text-[8px] sm:text-[9px] lg:text-[10px] xl:text-xs font-bold leading-tight text-slate-700"
                                                                    title={block.label || `${block.start} - ${block.end}`}
                                                                    style={clampStyle(2)}
                                                                >
                                                                    {block.label || `${block.start} - ${block.end}`}
                                                                </span>
                                                            </div>

                                                            {days.map(day => (
                                                                <DroppableSlot
                                                                    key={`${day}-${block.id}`}
                                                                    day={day}
                                                                    timeSlot={block}
                                                                    scheduleItems={schedule}
                                                                    onDrop={handleDrop}
                                                                    onSwapClick={openSwapModal}
                                                                    onRecommendClick={openRecommendationModal}
                                                                    onDeleteClick={handleDeleteSchedule}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
                                                </React.Fragment>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </DndProvider>
                </div>
            </div>

            {/* Modal Swap Guru */}
            <Modal show={isSwapModalOpen} onClose={() => setIsSwapModalOpen(false)} maxWidth="md">
                <form onSubmit={handleSwapTeacher} className="max-h-[85vh] overflow-y-auto p-4 sm:p-6">
                    <h2 className="mb-4 flex items-start gap-2 text-lg font-bold leading-tight text-slate-900">
                        <ArrowsRightLeftIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-indigo-600" />
                        <span>Tukar Guru / Pindah Jadwal Guru</span>
                    </h2>

                    <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
                        <p className="leading-relaxed break-words">
                            <span className="font-semibold">Mapel:</span>{' '}
                            {selectedScheduleItem?.mapel?.nama_mapel}
                        </p>

                        <p className="mt-1 leading-relaxed break-words">
                            <span className="font-semibold">Waktu:</span>{' '}
                            {selectedScheduleItem?.hari},{' '}
                            {selectedScheduleItem?.jam_mulai?.substring(0, 5)} - {selectedScheduleItem?.jam_selesai?.substring(0, 5)}
                        </p>
                    </div>

                    <div className="mb-6">
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Pilih Guru Pengganti
                        </label>

                        <select
                            className="min-h-11 w-full rounded-xl border-slate-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={newGuruId}
                            onChange={(e) => setNewGuruId(e.target.value)}
                            required
                        >
                            <option value="">-- Pilih Guru --</option>

                            {guruOptions.map(g => (
                                <option key={g.id_guru} value={g.id_guru}>
                                    {g.nama_lengkap}
                                </option>
                            ))}
                        </select>

                        <p className="mt-2 text-xs leading-relaxed text-slate-500">
                            Sistem akan secara otomatis mengecek bentrok jadwal untuk guru pengganti.
                        </p>
                    </div>

                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
                        <SecondaryButton type="button" onClick={() => setIsSwapModalOpen(false)}>
                            Batal
                        </SecondaryButton>

                        <PrimaryButton type="submit">
                            Simpan Perubahan
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal Rekomendasi Mapel */}
            <Modal show={isRecommendationModalOpen} onClose={() => setIsRecommendationModalOpen(false)} maxWidth="md">
                <div className="max-h-[85vh] overflow-y-auto bg-white p-4 sm:p-6">
                    <h2 className="mb-2 flex items-start gap-2 text-lg font-bold leading-tight text-slate-900">
                        <span className="rounded-xl bg-emerald-100 p-2 text-emerald-600">
                            <ClockIcon className="h-5 w-5" />
                        </span>

                        <span>Rekomendasi Mapel</span>
                    </h2>

                    {selectedRecommendationSlot && (
                        <p className="mb-4 text-sm leading-relaxed text-slate-500">
                            Untuk hari <strong>{selectedRecommendationSlot.day}</strong> jam{' '}
                            <strong>{selectedRecommendationSlot.timeSlot.label}</strong>
                        </p>
                    )}

                    <div className="mb-4">
                        {isLoadingRecommendations ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <ArrowPathIcon className="mb-2 h-8 w-8 animate-spin text-emerald-500" />

                                <p className="text-sm text-slate-500">
                                    Mencari guru yang kosong...
                                </p>
                            </div>
                        ) : recommendationList.length > 0 ? (
                            <div className="max-h-[400px] space-y-2 overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
                                {recommendationList.map(mapel => (
                                    <button
                                        key={mapel.id_mapel}
                                        type="button"
                                        onClick={() => handleSelectRecommendation(mapel)}
                                        className="group w-full rounded-xl border border-slate-200 p-3 text-left transition-all hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-sm"
                                    >
                                        <p className="font-bold leading-snug text-slate-800 group-hover:text-emerald-700 break-words">
                                            {mapel.nama_mapel}
                                        </p>

                                        <p className="mt-1 text-xs leading-snug text-slate-500 group-hover:text-emerald-600 break-words">
                                            Guru: {mapel.guru_default ? mapel.guru_default.nama_lengkap : '-'}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-8 text-center">
                                <p className="text-sm leading-relaxed text-slate-500">
                                    Semua guru sedang mengajar pada jam ini.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end border-t border-slate-100 pt-4">
                        <SecondaryButton onClick={() => setIsRecommendationModalOpen(false)}>
                            Tutup
                        </SecondaryButton>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
}