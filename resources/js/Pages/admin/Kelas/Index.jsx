import React, { useState, useEffect, useCallback } from 'react';
import { toast } from '@/utils/toast';
import AdminLayout from '@/Layouts/AdminLayout';
import Modal from '@/Components/Modal';
import Checkbox from '@/Components/Checkbox';
import { Head, Link, usePage, useForm, router } from '@inertiajs/react';
import SkeletonTable from '@/Components/SkeletonTable';
import {
    PencilSquareIcon,
    TrashIcon,
    PlusIcon,
    BuildingOffice2Icon,
    UsersIcon,
    AcademicCapIcon,
    UserCircleIcon,
    MagnifyingGlassIcon,
    EyeIcon,
    XCircleIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import debounce from 'lodash.debounce';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import SelectInput from '@/Components/SelectInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';



// Komponen untuk kartu statistik
const StatCard = ({ icon, label, value, detail, colorClass, isFeatured }) => (
    <div className={`group relative overflow-hidden rounded-3xl border bg-white/70 backdrop-blur-md p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] ${isFeatured ? 'border-sky-200 shadow-xl shadow-sky-100/50 ring-1 ring-sky-100' : 'border-white/40 shadow-lg hover:shadow-xl'}`}>
        {isFeatured && (
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-sky-400/20 to-indigo-400/20 blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
        )}
        <div className="relative flex items-center justify-between gap-4">
            <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{label}</p>
                <p className={`mt-2 text-3xl font-bold tracking-tight ${isFeatured ? 'text-sky-700' : 'text-slate-900'}`}>{value}</p>
                <p className="text-xs text-slate-400 mt-1">{detail}</p>
            </div>
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg ${colorClass}`}>
                {icon}
            </div>
        </div>
        <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-slate-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
);


// Komponen untuk "Empty State"
const EmptyState = ({ onAddClick }) => (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fadeInUp">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-white/60 backdrop-blur-sm text-slate-400 shadow-inner">
            <BuildingOffice2Icon className="h-12 w-12" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900">Tidak ada data kelas</h3>
        <p className="mt-2 max-w-md text-sm text-slate-500">Silakan mulai dengan menambahkan data kelas baru menggunakan form tambah.</p>
        <div className="mt-6">
            <PrimaryButton onClick={onAddClick}>
                <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
                Tambah Kelas Pertama
            </PrimaryButton>
        </div>
    </div>
);


export default function Index({ auth, kelasList, stats, filters, guruOptions }) {
    const { flash, errors } = usePage().props;
    const { delete: destroy, processing: deletingProcessing } = useForm();
    const [search, setSearch] = useState(filters.search || '');

    // State untuk Modal Create
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const {
        data: createData,
        setData: setCreateData,
        post: submitCreate,
        processing: createProcessing,
        errors: createErrors,
        reset: resetCreate
    } = useForm({
        tingkat: '',
        jurusan: '',
        id_wali_kelas: '',
    });

    // State untuk Modal Edit
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingKelas, setEditingKelas] = useState(null);
    const {
        data: editData,
        setData: setEditData,
        put: submitEdit,
        processing: editProcessing,
        errors: editErrors,
        reset: resetEdit
    } = useForm({
        tingkat: '',
        jurusan: '',
        id_wali_kelas: '',
    });

    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // State Bulk Delete
    const [selectedIds, setSelectedIds] = useState([]);
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);
    const [bulkAction, setBulkAction] = useState(null);

    // State Random Assign Wali
    const [isRandomAssignModalOpen, setIsRandomAssignModalOpen] = useState(false);
    const [isRandomAssignProcessing, setIsRandomAssignProcessing] = useState(false);

    const handleRandomAssign = () => {
        setIsRandomAssignProcessing(true);
        router.post(route('admin.kelas.random-assign-wali'), {}, {
            preserveScroll: true,
            onSuccess: () => {
                setIsRandomAssignModalOpen(false);
                setIsRandomAssignProcessing(false);
            },
            onError: () => {
                setIsRandomAssignProcessing(false);
                toast.error('Gagal melakukan auto-assign wali kelas.');
            }
        });
    };

    const isFirstRender = React.useRef(true);

    const debouncedSearch = useCallback(debounce((value) => {
        router.get(route('admin.kelas.index'),
            { search: value },
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
                onStart: () => setIsLoading(true),
                onFinish: () => setIsLoading(false),
            }
        );
    }, 400), []);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        debouncedSearch(search);
    }, [search, debouncedSearch]);

    useEffect(() => {
        return () => debouncedSearch.cancel();
    }, [debouncedSearch]);

    // Handle Delete
    const confirmDeletion = (e, item) => {
        e.preventDefault();
        setItemToDelete(item);
        setConfirmingDeletion(true);
    };

    const closeDeleteModal = () => {
        setConfirmingDeletion(false);
        setItemToDelete(null);
    };

    const deleteItem = (e) => {
        e.preventDefault();
        destroy(route('admin.kelas.destroy', itemToDelete.id_kelas), {
            preserveScroll: true,
            onSuccess: () => {
                closeDeleteModal();
            },
            onError: (err) => {
                closeDeleteModal();
                if (!err.error) {
                    const errorMessage = Object.values(err)[0] || 'Gagal menghapus data kelas.';
                    toast.error(errorMessage);
                }
            },
        });
    };

    // Handle Bulk Action
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = kelasList.map(k => k.id_kelas);
            setSelectedIds(allIds);
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(itemId => itemId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const executeBulkAction = (e) => {
        e.preventDefault();
        
        if (bulkAction === 'delete') {
            setIsBulkProcessing(true);
        }
    };

    const confirmBulkDelete = () => {
        router.post(route('admin.kelas.bulk-delete'), { ids: selectedIds }, {
            preserveScroll: true,
            onFinish: () => {
                setIsBulkProcessing(false);
                setBulkAction(null);
            },
            onSuccess: () => {
                setSelectedIds([]);
            }
        });
    };

    const cancelBulkDelete = () => {
        setIsBulkProcessing(false);
        setBulkAction(null);
    };

    // Handle Create
    const openCreateModal = () => {
        setIsCreateModalOpen(true);
    };

    const closeCreateModal = () => {
        setIsCreateModalOpen(false);
        resetCreate();
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        submitCreate(route('admin.kelas.store'), {
            preserveScroll: true,
            onSuccess: () => {
                closeCreateModal();
            },
            onError: (errs) => {
                if (!errs.error) {
                    const message = Object.values(errs)[0] || 'Gagal menyimpan data, periksa kembali input Anda.';
                    toast.error(message);
                }
            }
        });
    };

    // Handle Edit
    const openEditModal = (kelas) => {
        setEditingKelas(kelas);
        setEditData({
            tingkat: kelas.tingkat,
            jurusan: kelas.jurusan || '',
            id_wali_kelas: kelas.id_wali_kelas || '',
        });
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditingKelas(null);
        resetEdit();
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        submitEdit(route('admin.kelas.update', editingKelas.id_kelas), {
            preserveScroll: true,
            onSuccess: () => {
                closeEditModal();
            },
            onError: (errs) => {
                if (!errs.error) {
                    const message = Object.values(errs)[0] || 'Gagal memperbarui data, periksa kembali input Anda.';
                    toast.error(message);
                }
            }
        });
    };


    return (
        <AdminLayout user={auth.user} header="Data Kelas">
            <Head title="Data Kelas" />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/30 to-indigo-50/20 p-4 md:p-6 lg:p-8">
                <div className="space-y-8 max-w-[1440px] mx-auto animate-fadeInUp">
                    {/* Header premium */}
                    <div className="relative overflow-hidden rounded-3xl border border-white/40 bg-white/70 backdrop-blur-xl p-6 md:p-8 shadow-xl shadow-slate-200/50">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-sky-400/10 to-indigo-400/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                        <div className="relative flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div>
                                <div className="mb-3 inline-flex items-center rounded-full border border-sky-200/60 bg-sky-50/80 backdrop-blur-sm px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-sky-700">
                                    Master Data • Kelas
                                </div>
                                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">Data Kelas</h1>
                                <p className="mt-2 text-slate-500 max-w-lg">Kelola data kelas dan penugasan wali kelas.</p>
                            </div>
                            <div className="flex flex-wrap items-center justify-end gap-3">
                                <SecondaryButton onClick={() => setIsRandomAssignModalOpen(true)} className="shadow-lg hover:shadow-indigo-500/30 border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                                    <SparklesIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
                                    Assign Wali Serentak
                                </SecondaryButton>
                                <PrimaryButton onClick={openCreateModal} className="shadow-lg shadow-sky-500/30">
                                    <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
                                    Tambah Kelas
                                </PrimaryButton>
                            </div>
                        </div>
                    </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard icon={<BuildingOffice2Icon className="h-6 w-6 text-gray-500" />} label="Total Kelas" value={stats.total} detail="Kelas terdaftar" />
                    <StatCard icon={<UsersIcon className="h-6 w-6 text-green-500" />} label="Kelas Aktif" value={stats.aktif} detail="Sedang berjalan" />
                    <StatCard icon={<AcademicCapIcon className="h-6 w-6 text-blue-500" />} label="Total Siswa" value={stats.totalSiswa} detail="Siswa aktif" />
                    <StatCard icon={<UserCircleIcon className="h-6 w-6 text-purple-500" />} label="Dengan Wali" value={stats.denganWali} detail="Memiliki wali kelas" />
                </div>

                <div className="overflow-hidden rounded-3xl border border-white/40 bg-white/70 backdrop-blur-xl shadow-xl shadow-slate-200/50">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-white/40 bg-white/40 backdrop-blur-sm p-6">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">Pencarian Kelas</h3>
                            <p className="mt-1 text-sm text-slate-500">
                                {isLoading ? 'Memuat data...' : `Total ${kelasList.length} kelas ditemukan`}
                            </p>
                        </div>
                        <div className="relative w-full lg:w-[360px]">
                            <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama kelas atau wali kelas..."
                                className="w-full rounded-2xl border border-white/40 bg-white/60 backdrop-blur-md py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100/50 focus:bg-white/90 shadow-inner"
                            />
                        </div>
                    </div>

                        {/* BULK ACTION TOOLBAR (Floating) */}
                        {selectedIds.length > 0 && (
                            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg z-50 flex items-center gap-4 animate-fade-in-up">
                                <span className="font-semibold text-sm">{selectedIds.length} Dipilih</span>
                                <div className="h-4 w-px bg-gray-600"></div>

                                <button onClick={() => { setBulkAction('delete'); setIsBulkProcessing(true); }} className="text-sm hover:text-red-300 flex items-center gap-1">
                                    <TrashIcon className="h-4 w-4" /> Hapus
                                </button>

                                <div className="h-4 w-px bg-gray-600"></div>
                                <button onClick={() => setSelectedIds([])} className="text-gray-400 hover:text-white">
                                    <XCircleIcon className="h-5 w-5" />
                                </button>
                            </div>
                        )}

                        {kelasList.length > 0 || isLoading ? (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-200/50">
                                        <thead className="bg-white/40 backdrop-blur-sm">
                                            <tr>
                                                <th className="px-6 py-5 text-left w-10">
                                                    <Checkbox
                                                        checked={kelasList.length > 0 && selectedIds.length === kelasList.length}
                                                        onChange={handleSelectAll}
                                                    />
                                                </th>
                                                <th className="px-6 py-5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">ID Kelas</th>
                                                <th className="px-6 py-5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nama Kelas</th>
                                                <th className="px-6 py-5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Wali Kelas</th>
                                                <th className="px-6 py-5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Jumlah Siswa</th>
                                                <th className="px-6 py-5 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-transparent divide-y divide-slate-100/50">
                                            {isLoading ? (
                                                <SkeletonTable rows={5} columns={6} />
                                            ) : (
                                                kelasList.map((kelas, index) => (
                                                    <tr key={kelas.id_kelas} className={`transition-all duration-300 ease-out hover:bg-gradient-to-r hover:from-sky-50/80 hover:to-indigo-50/80 animate-fadeInUp disabled:opacity-50 ${selectedIds.includes(kelas.id_kelas) ? 'bg-sky-50' : ''}`} style={{ animationDelay: `${index * 50}ms` }}>
                                                        <td className="px-6 py-5">
                                                            <Checkbox
                                                                checked={selectedIds.includes(kelas.id_kelas)}
                                                                onChange={() => handleSelectOne(kelas.id_kelas)}
                                                            />
                                                        </td>
                                                        <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-500 font-mono">{kelas.id_kelas}</td>
                                                        <td className="px-6 py-5 whitespace-nowrap">
                                                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-sky-100 text-sky-800 border border-sky-200/60 shadow-sm">
                                                                {kelas.tingkat} {kelas.jurusan}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-700">{kelas.wali_kelas?.nama_lengkap || <span className="text-rose-500 italic text-xs">Belum diatur</span>}</td>
                                                        <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-500 font-semibold">{kelas.siswa_count} Siswa</td>
                                                        <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-right">
                                                            <div className="flex items-center justify-end gap-x-2">
                                                                <Link href={route('admin.kelas.show', kelas.id_kelas)} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/50 bg-white/60 backdrop-blur-sm text-slate-500 transition-all duration-200 hover:border-sky-300 hover:bg-sky-50/80 hover:text-sky-600 hover:scale-110 active:scale-95" title="Lihat Detail"><EyeIcon className="h-4 w-4" /></Link>
                                                                <button onClick={() => openEditModal(kelas)} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/50 bg-white/60 backdrop-blur-sm text-slate-500 transition-all duration-200 hover:border-amber-300 hover:bg-amber-50/80 hover:text-amber-600 hover:scale-110 active:scale-95" title="Edit Data"><PencilSquareIcon className="h-4 w-4" /></button>
                                                                <button onClick={(e) => confirmDeletion(e, kelas)} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/50 bg-white/60 backdrop-blur-sm text-slate-500 transition-all duration-200 hover:border-rose-300 hover:bg-rose-50/80 hover:text-rose-600 hover:scale-110 active:scale-95" title="Hapus Data"><TrashIcon className="h-4 w-4" /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        ) : (
                            <EmptyState onAddClick={openCreateModal} />
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Tambah Kelas */}
            <Modal show={isCreateModalOpen} onClose={closeCreateModal}>
                <div className="p-6 sm:p-8 bg-white/80 backdrop-blur-2xl rounded-3xl border border-white/40">
                    <form onSubmit={handleCreateSubmit}>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-6">Tambah Data Kelas</h2>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel htmlFor="tingkat" value="Tingkat Kelas *" />
                                <SelectInput
                                    id="tingkat"
                                    name="tingkat"
                                    value={createData.tingkat}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setCreateData('tingkat', e.target.value)}
                                    required
                                >
                                    <option value="">Pilih Tingkat</option>
                                    <option value="X">Kelas X</option>
                                    <option value="XI">Kelas XI</option>
                                    <option value="XII">Kelas XII</option>
                                </SelectInput>
                                <InputError message={createErrors.tingkat} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="jurusan" value="Jurusan (Opsional)" />
                                <TextInput
                                    id="jurusan"
                                    name="jurusan"
                                    value={createData.jurusan}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setCreateData('jurusan', e.target.value)}
                                    placeholder="Contoh: IPA, IPS, RPL"
                                />
                                <InputError message={createErrors.jurusan} className="mt-2" />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="id_wali_kelas" value="Wali Kelas (Opsional)" />
                            <SelectInput
                                id="id_wali_kelas"
                                name="id_wali_kelas"
                                value={createData.id_wali_kelas}
                                className="mt-1 block w-full"
                                onChange={(e) => setCreateData('id_wali_kelas', e.target.value)}
                            >
                                <option value="">--- Pilih Wali Kelas ---</option>
                                {guruOptions && guruOptions.filter(guru => !guru.is_assigned).map((guru) => (
                                    <option key={guru.id_guru} value={guru.id_guru}>
                                        {guru.nama_lengkap} (NIP: {guru.nip || '-'})
                                    </option>
                                ))}
                            </SelectInput>
                            <InputError message={createErrors.id_wali_kelas} className="mt-2" />
                            <p className="mt-1 text-xs text-gray-500">Pilih guru yang akan menjadi wali kelas ini. Anda bisa mengaturnya nanti jika belum ada.</p>
                        </div>
                    </div>

                        <div className="mt-8 flex justify-end gap-3">
                            <SecondaryButton onClick={closeCreateModal} type="button">Batal</SecondaryButton>
                            <PrimaryButton type="submit" disabled={createProcessing}>
                                {createProcessing ? 'Menyimpan...' : 'Simpan Kelas'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Modal Edit Kelas */}
            <Modal show={isEditModalOpen} onClose={closeEditModal}>
                <div className="p-6 sm:p-8 bg-white/80 backdrop-blur-2xl rounded-3xl border border-white/40">
                    <form onSubmit={handleEditSubmit}>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-6">Edit Data Kelas</h2>

                    <div className="space-y-6">
                        <div>
                            <InputLabel htmlFor="edit_id_kelas" value="ID Kelas (Tidak Dapat Diubah)" />
                            <TextInput
                                id="edit_id_kelas"
                                name="id_kelas"
                                value={editingKelas?.id_kelas || ''}
                                className="mt-1 block w-full bg-gray-100"
                                disabled
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel htmlFor="edit_tingkat" value="Tingkat Kelas *" />
                                <SelectInput
                                    id="edit_tingkat"
                                    name="tingkat"
                                    value={editData.tingkat}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setEditData('tingkat', e.target.value)}
                                    required
                                >
                                    <option value="">Pilih Tingkat</option>
                                    <option value="X">Kelas X</option>
                                    <option value="XI">Kelas XI</option>
                                    <option value="XII">Kelas XII</option>
                                </SelectInput>
                                <InputError message={editErrors.tingkat} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="edit_jurusan" value="Jurusan (Opsional)" />
                                <TextInput
                                    id="edit_jurusan"
                                    name="jurusan"
                                    value={editData.jurusan}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setEditData('jurusan', e.target.value)}
                                    placeholder="Contoh: IPA, IPS, RPL"
                                />
                                <InputError message={editErrors.jurusan} className="mt-2" />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_id_wali_kelas" value="Wali Kelas (Opsional)" />
                            <SelectInput
                                id="edit_id_wali_kelas"
                                name="id_wali_kelas"
                                value={editData.id_wali_kelas}
                                className="mt-1 block w-full"
                                onChange={(e) => setEditData('id_wali_kelas', e.target.value)}
                            >
                                <option value="">--- Pilih Wali Kelas ---</option>
                                {guruOptions && guruOptions.filter(guru => !guru.is_assigned || guru.id_guru === editingKelas?.id_wali_kelas).map((guru) => (
                                    <option key={guru.id_guru} value={guru.id_guru}>
                                        {guru.nama_lengkap} (NIP: {guru.nip || '-'})
                                    </option>
                                ))}
                            </SelectInput>
                            <InputError message={editErrors.id_wali_kelas} className="mt-2" />
                        </div>
                    </div>

                        <div className="mt-8 flex justify-end gap-3">
                            <SecondaryButton onClick={closeEditModal} type="button">Batal</SecondaryButton>
                            <PrimaryButton type="submit" disabled={editProcessing}>
                                {editProcessing ? 'Memperbarui...' : 'Update Kelas'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Modal Delete Confirmation */}
            <Modal show={confirmingDeletion} onClose={closeDeleteModal}>
                <div className="p-6 sm:p-8 bg-white/80 backdrop-blur-2xl rounded-3xl border border-white/40">
                    <div className="flex items-start gap-5 mb-6">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-rose-100/80 text-rose-600 shadow-inner">
                            <TrashIcon className="h-7 w-7" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight text-slate-900">Konfirmasi Hapus</h2>
                            <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                Data Kelas: <strong className="text-slate-900">{itemToDelete?.tingkat} {itemToDelete?.jurusan}</strong> akan dihapus.
                            </p>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={closeDeleteModal} type="button">Batal</SecondaryButton>
                        <button onClick={deleteItem} type="button" disabled={deletingProcessing} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-200/50 transition-all duration-200 hover:from-rose-700 hover:to-pink-700 hover:scale-105 active:scale-95 disabled:opacity-50">
                            {deletingProcessing ? 'Menghapus...' : 'Ya, Hapus'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Modal Bulk Delete Confirmation */}
            <Modal show={isBulkProcessing && bulkAction === 'delete'} onClose={cancelBulkDelete}>
                <div className="p-6 sm:p-8 bg-white/80 backdrop-blur-2xl rounded-3xl border border-white/40">
                    <div className="flex items-start gap-5 mb-6">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-rose-100/80 text-rose-600 shadow-inner">
                            <TrashIcon className="h-7 w-7" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight text-slate-900">Konfirmasi Hapus Massal</h2>
                            <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                Apakah Anda yakin ingin menghapus <strong className="text-slate-900">{selectedIds.length}</strong> kelas terpilih?<br/>
                                Siswa yang ada di dalam kelas-kelas ini tidak akan dihapus, namun status kelasnya akan menjadi <strong>Belum Ada Kelas</strong>.
                            </p>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={cancelBulkDelete} type="button">Batal</SecondaryButton>
                        <button onClick={confirmBulkDelete} type="button" disabled={deletingProcessing} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-200/50 transition-all duration-200 hover:from-rose-700 hover:to-pink-700 hover:scale-105 active:scale-95 disabled:opacity-50">
                            {deletingProcessing ? 'Menghapus...' : 'Ya, Hapus Semua'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Modal Random Assign Wali Kelas */}
            <Modal show={isRandomAssignModalOpen} onClose={() => setIsRandomAssignModalOpen(false)}>
                <div className="p-6 sm:p-8 bg-white/80 backdrop-blur-2xl rounded-3xl border border-white/40">
                    <div className="flex items-start gap-5 mb-6">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-100/80 text-indigo-600 shadow-inner">
                            <SparklesIcon className="h-7 w-7" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight text-slate-900">Auto-Assign Wali Kelas</h2>
                            <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                Sistem akan secara otomatis mencari dan menetapkan guru aktif yang masih "bebas" ke kelas-kelas yang saat ini tidak memiliki wali kelas.
                            </p>
                            <p className="mt-2 text-sm leading-relaxed text-slate-600 bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                                <strong className="text-indigo-700">Prioritas:</strong> Sistem akan memprioritaskan guru yang <span className="font-semibold underline">sudah mengajar</span> di kelas tersebut (berdasarkan Jadwal Mengajar). Jika tidak ada, sistem akan memilih guru bebas secara acak.
                            </p>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setIsRandomAssignModalOpen(false)} type="button">Batal</SecondaryButton>
                        <button onClick={handleRandomAssign} type="button" disabled={isRandomAssignProcessing} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200/50 transition-all duration-200 hover:from-indigo-700 hover:to-purple-700 hover:scale-105 active:scale-95 disabled:opacity-50">
                            {isRandomAssignProcessing ? 'Memproses...' : 'Ya, Assign Serentak'}
                        </button>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
}
