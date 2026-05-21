import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { PlusIcon, BookOpenIcon, UserGroupIcon, AcademicCapIcon, ClipboardDocumentListIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import Modal from '@/Components/Modal';
import SkeletonTable from '@/Components/SkeletonTable';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import Pagination from '@/Components/Pagination';
import { debounce } from 'lodash';
import { toast, Toaster } from 'react-hot-toast';

// Komponen Kartu Statistik
const StatCard = ({ icon, title, value, description, color }) => (
    <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-white/60 shadow-sm hover:shadow-md transition-all duration-300 flex items-start space-x-4">
        <div className={`p-4 rounded-2xl ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-semibold text-slate-500">{title}</p>
            <p className="text-3xl font-bold text-slate-800 tracking-tight mt-1">{value}</p>
            <p className="text-xs text-slate-400 mt-1">{description}</p>
        </div>
    </div>
);

// Komponen Badge Kategori
const CategoryBadge = ({ category }) => {
    const style = {
        'Wajib': 'bg-blue-50 text-blue-700 border-blue-200',
        'Peminatan': 'bg-emerald-50 text-emerald-700 border-emerald-200',
        'Muatan Lokal': 'bg-amber-50 text-amber-700 border-amber-200',
    };
    return <span className={`px-3 py-1 text-xs font-bold rounded-xl border shadow-sm ${style[category] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>{category}</span>;
};

// Komponen Badge Status
const StatusBadge = ({ status }) => {
    const style = {
        'Aktif': 'bg-emerald-50 text-emerald-700 border-emerald-200',
        'Tidak Aktif': 'bg-slate-50 text-slate-600 border-slate-200',
    };
    return (
        <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-xl border shadow-sm ${style[status] || style['Tidak Aktif']}`}>
            {status === 'Aktif' && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>}
            {status}
        </span>
    );
};

export default function Index({ auth, stats, mataPelajaran, guruPengampuList, filters }) {
    const { flash } = usePage().props;
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const [mapelToDelete, setMapelToDelete] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [flash]);

    const openDeleteModal = (mapel) => {
        setMapelToDelete(mapel);
        setConfirmingDeletion(true);
    };

    const closeDeleteModal = () => {
        setConfirmingDeletion(false);
        setMapelToDelete(null);
    };

    const deleteMapel = (e) => {
        e.preventDefault();
        if (mapelToDelete) {
            router.delete(route('admin.mata-pelajaran.destroy', mapelToDelete.id_mapel), {
                onSuccess: () => closeDeleteModal(),
                preserveScroll: true,
            });
        }
    };

    const handleSearch = debounce((e) => {
        router.get(route('admin.mata-pelajaran.index'), { search: e.target.value }, {
            preserveState: true,
            replace: true,
            onStart: () => setIsLoading(true),
            onFinish: () => setIsLoading(false),
        });
    }, 300);

    return (
        <AdminLayout user={auth.user} header="Mata Pelajaran">
            <Head title="Mata Pelajaran" />
            <Toaster position="top-right" />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-4 md:p-6 lg:p-8">
                <div className="max-w-[1440px] mx-auto space-y-8 animate-fadeInUp">
                    {/* Header dan Tombol Tambah */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-white/40 shadow-sm">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Mata Pelajaran</h1>
                            <p className="text-sm text-slate-500 mt-1">Kelola kurikulum dan daftar mata pelajaran sekolah</p>
                        </div>
                        <Link href={route('admin.mata-pelajaran.create')}>
                            <button className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:from-blue-700 hover:to-indigo-700 hover:scale-105 active:scale-95 w-full sm:w-auto">
                                <PlusIcon className="h-5 w-5 mr-2" />
                                Tambah Mata Pelajaran
                            </button>
                        </Link>
                    </div>

                    {/* Kartu Statistik */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard icon={<BookOpenIcon className="h-8 w-8 text-blue-600"/>} title="Total Mata Pelajaran" value={stats.totalMapel} description="Total keseluruhan mapel" color="bg-blue-100/80 shadow-inner" />
                        <StatCard icon={<ClipboardDocumentListIcon className="h-8 w-8 text-indigo-600"/>} title="Mata Pelajaran Wajib" value={stats.mapelWajib} description="Wajib untuk semua kelas" color="bg-indigo-100/80 shadow-inner" />
                        <StatCard icon={<AcademicCapIcon className="h-8 w-8 text-emerald-600"/>} title="Mapel Peminatan" value={stats.mapelPeminatan} description="Khusus per jurusan" color="bg-emerald-100/80 shadow-inner" />
                        <StatCard icon={<UserGroupIcon className="h-8 w-8 text-amber-600"/>} title="Total Siswa Aktif" value={stats.totalSiswa} description="Belajar di seluruh kelas" color="bg-amber-100/80 shadow-inner" />
                    </div>

                    {/* Daftar Mata Pelajaran */}
                    <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/40 shadow-xl shadow-slate-200/50 overflow-hidden">
                        <div className="p-6 md:p-8 border-b border-slate-100/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Daftar Mata Pelajaran</h2>
                                <p className="text-sm text-slate-500 mt-1">Daftar kurikulum mata pelajaran yang diajarkan</p>
                            </div>
                            <div className="relative w-full sm:w-72">
                                <input
                                    type="text"
                                    defaultValue={filters.search}
                                    onChange={handleSearch}
                                    placeholder="Cari mapel atau kode..."
                                    className="w-full rounded-xl border border-slate-200 bg-white/80 py-2.5 pl-4 pr-10 text-sm shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                />
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                    {isLoading ? (
                                        <svg className="h-4 w-4 animate-spin text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    ) : (
                                        <svg className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" /></svg>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200/60">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        {['Kode', 'Mata Pelajaran', 'Kategori', 'Status', 'JP', 'Aksi'].map((head, idx) => (
                                            <th key={head} className={`px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] ${idx === 4 || idx === 5 ? 'text-center' : ''}`}>{head}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100/50 bg-white/40">
                                    {isLoading ? (
                                        <SkeletonTable rows={5} columns={7} />
                                    ) : mataPelajaran.data.length > 0 ? mataPelajaran.data.map(mapel => (
                                        <tr key={mapel.id_mapel} className="hover:bg-white/80 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-semibold text-slate-600 bg-slate-50/50">{mapel.id_mapel}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">{mapel.nama_mapel}</td>
                                            <td className="px-6 py-4 whitespace-nowrap"><CategoryBadge category={mapel.kategori} /></td>
                                            <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={mapel.status} /></td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-600 text-center">{mapel.jumlah_jp}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Link href={route('admin.mata-pelajaran.show', mapel.id_mapel)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-blue-100" title="Detail">
                                                        <EyeIcon className="h-5 w-5"/>
                                                    </Link>
                                                    <Link href={route('admin.mata-pelajaran.edit', mapel.id_mapel)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-indigo-100" title="Edit">
                                                        <PencilIcon className="h-5 w-5"/>
                                                    </Link>
                                                    <button onClick={() => openDeleteModal(mapel)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-rose-100" title="Hapus">
                                                        <TrashIcon className="h-5 w-5"/>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                                <div className="flex flex-col items-center justify-center">
                                                    <BookOpenIcon className="h-12 w-12 text-slate-300 mb-3" />
                                                    <p className="text-base font-semibold">Tidak ada data mata pelajaran</p>
                                                    <p className="text-sm mt-1">Gunakan kata kunci lain atau tambahkan data baru.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Paginasi Ditambahkan */}
                        <div className="border-t border-slate-100/50 bg-white/40 px-6 py-4">
                            <Pagination links={mataPelajaran.links} />
                        </div>
                    </div>

                    {/* Distribusi dan Guru Pengampu */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1 bg-white/70 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/40 shadow-xl shadow-slate-200/50">
                             <h2 className="text-lg font-bold text-slate-800 mb-6">Distribusi Kategori</h2>
                             <div className="space-y-4">
                                <div className="flex justify-between items-center p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100/50 shadow-sm">
                                    <div>
                                        <p className="font-bold text-blue-900">Mapel Wajib</p>
                                        <p className="text-xs font-medium text-blue-600 mt-0.5">Semua jurusan</p>
                                    </div>
                                    <p className="text-2xl font-bold text-blue-700 bg-white px-4 py-2 rounded-xl shadow-sm border border-blue-100">{stats.mapelWajib}</p>
                                </div>
                                 <div className="flex justify-between items-center p-5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100/50 shadow-sm">
                                    <div>
                                        <p className="font-bold text-emerald-900">Peminatan</p>
                                        <p className="text-xs font-medium text-emerald-600 mt-0.5">Sesuai jurusan</p>
                                    </div>
                                    <p className="text-2xl font-bold text-emerald-700 bg-white px-4 py-2 rounded-xl shadow-sm border border-emerald-100">{stats.mapelPeminatan}</p>
                                </div>
                             </div>
                        </div>
                        <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/40 shadow-xl shadow-slate-200/50 flex flex-col">
                            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <AcademicCapIcon className="h-6 w-6 text-indigo-500" />
                                Daftar Guru Pengampu
                            </h2>
                            <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar flex-1">
                                {guruPengampuList.length > 0 ? guruPengampuList.map(guru => (
                                    <div key={guru.id_guru} className="flex justify-between items-center p-4 bg-white/80 hover:bg-white border border-slate-100 rounded-2xl shadow-sm transition-all hover:shadow-md">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shadow-inner">
                                                {guru.nama_lengkap.charAt(0)}
                                            </div>
                                            <p className="font-bold text-slate-800">{guru.nama_lengkap}</p>
                                        </div>
                                        <span className="text-sm font-semibold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200">{guru.jumlah_mapel} mapel</span>
                                    </div>
                                )) : (
                                    <div className="text-center py-8 text-slate-500">Belum ada guru pengampu yang dijadwalkan.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={confirmingDeletion} onClose={closeDeleteModal} maxWidth="md">
                <form onSubmit={deleteMapel} className="p-8">
                    <div className="flex items-center justify-center mb-6">
                        <div className="bg-rose-100 p-4 rounded-full">
                            <TrashIcon className="h-10 w-10 text-rose-600" />
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 text-center mb-2">
                        Hapus Mata Pelajaran?
                    </h2>
                    <p className="text-sm text-slate-500 text-center mb-8">
                        Data mata pelajaran <span className="font-bold text-slate-800">"{mapelToDelete?.nama_mapel}"</span> akan dihapus secara permanen. Anda tidak dapat membatalkan aksi ini.
                    </p>
                    <div className="flex justify-center gap-3">
                        <SecondaryButton type="button" onClick={closeDeleteModal} className="px-6 py-2.5 rounded-xl">Batal</SecondaryButton>
                        <DangerButton className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700">Ya, Hapus Data</DangerButton>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
