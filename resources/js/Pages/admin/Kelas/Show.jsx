import React, { useState, useEffect, useCallback, useRef } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import Modal from '@/Components/Modal';
import Checkbox from '@/Components/Checkbox';
import InputLabel from '@/Components/InputLabel';
import SelectInput from '@/Components/SelectInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { toast } from '@/utils/toast';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { ArrowLeftIcon, PencilIcon, UserCircleIcon, UsersIcon, CalendarDaysIcon, MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import debounce from 'lodash.debounce';



// --- KOMPONEN SKELETON LOADER ---
const TableSkeleton = () => {
    return (
        <>
            {[...Array(5)].map((_, index) => (
                <tr key={index} className="animate-pulse border-b border-gray-200">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-48"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-10"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                </tr>
            ))}
        </>
    );
};

// Komponen untuk Tombol Tab
const TabButton = ({ icon, active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-x-2 px-5 py-2.5 text-sm font-semibold rounded-2xl transition-all duration-300 ${active
            ? 'bg-sky-100 text-sky-700 shadow-sm border border-sky-200/60'
            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-transparent'
            }`}
    >
        {icon}
        {children}
    </button>
);

// Komponen untuk konten tab "Daftar Siswa"
const DaftarSiswaTab = ({ siswas, search, onSearch, isLoading, selectedIds, onSelectAll, onSelectOne, onRemoveSelected, onOpenAddModal }) => (
    <div className="animate-fadeInUp">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 mt-6 gap-4">
            <div className="flex items-center gap-3">
                <PrimaryButton onClick={onOpenAddModal}>
                    <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
                    Tambah Siswa
                </PrimaryButton>
                {selectedIds.length > 0 && (
                    <button
                        onClick={onRemoveSelected}
                        className="inline-flex items-center gap-x-1.5 rounded-xl bg-rose-100/80 px-4 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-200 transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm border border-rose-200/50"
                    >
                        Keluarkan Terpilih ({selectedIds.length})
                    </button>
                )}
            </div>
            <div className="sm:w-1/3 w-full relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => onSearch(e.target.value)}
                    placeholder="Cari siswa (Nama/NIS)..."
                    className="w-full rounded-2xl border border-slate-200/60 bg-white/60 backdrop-blur-md py-2.5 pl-12 pr-4 text-sm text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100/50 focus:bg-white/90 shadow-inner"
                />
            </div>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200/50">
                <thead className="bg-slate-50/50">
                    <tr>
                        <th className="px-6 py-5 text-left w-10">
                            <Checkbox
                                checked={siswas.length > 0 && selectedIds.length === siswas.length}
                                onChange={(e) => onSelectAll(e.target.checked)}
                            />
                        </th>
                        <th className="px-6 py-5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">NIS</th>
                        <th className="px-6 py-5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nama Lengkap</th>
                        <th className="px-6 py-5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">JK</th>
                        <th className="px-6 py-5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody className="bg-transparent divide-y divide-slate-100/50">
                    {isLoading ? (
                        <TableSkeleton />
                    ) : siswas.length > 0 ? (
                        siswas.map((siswa, index) => (
                            <tr key={siswa.id_siswa} className={`transition-all duration-300 ease-out hover:bg-gradient-to-r hover:from-sky-50/80 hover:to-indigo-50/80 ${selectedIds.includes(siswa.id_siswa) ? 'bg-rose-50' : ''}`} style={{ animationDelay: `${index * 50}ms` }}>
                                <td className="px-6 py-5">
                                    <Checkbox
                                        checked={selectedIds.includes(siswa.id_siswa)}
                                        onChange={() => onSelectOne(siswa.id_siswa)}
                                    />
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-500 font-mono font-medium">{siswa.nis}</td>
                                <td className="px-6 py-5 whitespace-nowrap text-sm font-semibold text-slate-900">{siswa.nama_lengkap}</td>
                                <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-500">{siswa.jenis_kelamin === 'Laki-laki' ? 'L' : 'P'}</td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border shadow-sm ${siswa.status === 'Aktif' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' : 'bg-amber-50 text-amber-700 border-amber-200/60'}`}>{siswa.status}</span>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="px-6 py-12 whitespace-nowrap text-sm text-slate-400 text-center italic">Tidak ada siswa di kelas ini</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

// Komponen untuk konten tab "Jadwal Pelajaran"
const JadwalPelajaranTab = ({ jadwal }) => (
    <div className="overflow-x-auto mt-6 animate-fadeInUp">
        <table className="min-w-full divide-y divide-slate-200/50">
            <thead className="bg-slate-50/50">
                <tr>
                    <th className="px-6 py-5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Hari</th>
                    <th className="px-6 py-5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Jam</th>
                    <th className="px-6 py-5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mata Pelajaran</th>
                    <th className="px-6 py-5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Guru Pengajar</th>
                </tr>
            </thead>
            <tbody className="bg-transparent divide-y divide-slate-100/50">
                {jadwal.length > 0 ? (
                    jadwal.map((item, index) => (
                        <tr key={item.id_jadwal} className="transition-all duration-300 ease-out hover:bg-gradient-to-r hover:from-sky-50/80 hover:to-indigo-50/80" style={{ animationDelay: `${index * 50}ms` }}>
                            <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-slate-900">{item.hari}</td>
                            <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-500 font-mono font-medium">{item.jam_mulai.slice(0, 5)} - {item.jam_selesai.slice(0, 5)}</td>
                            <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-700 font-semibold">{item.mata_pelajaran.nama_mapel}</td>
                            <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-500">{item.guru.nama_lengkap}</td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="4" className="px-6 py-12 whitespace-nowrap text-sm text-slate-400 text-center italic">Tidak ada jadwal pelajaran</td>
                    </tr>
                )}
            </tbody>
        </table>
    </div>
);


export default function Show({ auth, kelas, siswasInKelas, unassignedSiswas, jadwalPelajaran, filters, guruOptions }) {
    const [activeTab, setActiveTab] = useState('siswa');

    // --- SEARCH STATE & DEBOUNCE ---
    const [search, setSearch] = useState(filters?.search || '');
    const [isLoading, setIsLoading] = useState(false);
    const isFirstRender = useRef(true);

    const debouncedSearch = useCallback(debounce((value) => {
        router.get(route('admin.kelas.show', kelas.id_kelas),
            { search: value },
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
                onStart: () => setIsLoading(true),
                onFinish: () => setIsLoading(false),
            }
        );
    }, 400), [kelas.id_kelas]);

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

    // --- MANAGE STUDENTS STATE ---
    const [selectedIds, setSelectedIds] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addSearch, setAddSearch] = useState('');
    const [selectedAddIds, setSelectedAddIds] = useState([]);

    // Logic Remove Students
    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedIds(siswasInKelas.map(s => s.id_siswa));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleRemoveSelected = () => {
        if (confirm(`Yakin ingin mengeluarkan ${selectedIds.length} siswa dari kelas ini?`)) {
            router.post(route('admin.kelas.remove-students', kelas.id_kelas), {
                ids: selectedIds
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedIds([]);
                    toast.success('Berhasil mengeluarkan siswa dari kelas');
                }
            });
        }
    };

    // Logic Add Students
    const filteredUnassigned = unassignedSiswas?.filter(s => 
        s.nama_lengkap.toLowerCase().includes(addSearch.toLowerCase()) || 
        s.nis.includes(addSearch)
    ) || [];

    const handleSelectAllAdd = (checked) => {
        if (checked) {
            setSelectedAddIds(filteredUnassigned.map(s => s.id_siswa));
        } else {
            setSelectedAddIds([]);
        }
    };

    const handleSelectOneAdd = (id) => {
        setSelectedAddIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const submitAddStudents = () => {
        router.post(route('admin.kelas.add-students', kelas.id_kelas), {
            ids: selectedAddIds
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsAddModalOpen(false);
                setSelectedAddIds([]);
                setAddSearch('');
                toast.success('Berhasil menambahkan siswa ke kelas');
            }
        });
    };


    // --- EDIT MODAL STATE & LOGIC ---
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const {
        data: editData,
        setData: setEditData,
        put: submitEdit,
        processing: editProcessing,
        errors: editErrors,
        reset: resetEdit
    } = useForm({
        tingkat: kelas.tingkat || '',
        jurusan: kelas.jurusan || '',
        id_wali_kelas: kelas.id_wali_kelas || '',
    });

    const openEditModal = () => {
        setEditData({
            tingkat: kelas.tingkat,
            jurusan: kelas.jurusan,
            id_wali_kelas: kelas.id_wali_kelas || '',
        });
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        resetEdit();
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        submitEdit(route('admin.kelas.update', kelas.id_kelas), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Data kelas berhasil diperbarui');
                closeEditModal();
            },
            onError: (errs) => {
                const message = Object.values(errs)[0] || 'Gagal memperbarui data, periksa kembali input Anda.';
                toast.error(message);
            }
        });
    };

    return (
        <AdminLayout user={auth.user} header={`Detail Kelas: ${kelas.tingkat} ${kelas.jurusan}`}>
            <Head title={`Detail Kelas ${kelas.tingkat} ${kelas.jurusan}`} />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/30 to-indigo-50/20 p-4 md:p-6 lg:p-8">
                <div className="max-w-[1440px] mx-auto space-y-8 animate-fadeInUp">
                    {/* Header Premium */}
                    <div className="relative overflow-hidden rounded-3xl border border-white/40 bg-white/70 backdrop-blur-xl p-6 md:p-8 shadow-xl shadow-slate-200/50">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-sky-400/10 to-indigo-400/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                        <div className="relative">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                                <div>
                                    <div className="mb-3 inline-flex items-center rounded-full border border-sky-200/60 bg-sky-50/80 backdrop-blur-sm px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-sky-700">
                                        Detail Kelas
                                    </div>
                                    <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Informasi Kelas</h2>
                                    <p className="mt-2 text-sm text-slate-500">Informasi lengkap mengenai kelas, wali kelas, dan daftar siswa.</p>
                                </div>
                                <div className="flex items-center gap-x-3 flex-shrink-0">
                                    <Link href={route('admin.kelas.index')} className="inline-flex h-10 items-center justify-center gap-x-2 rounded-xl border border-slate-200/60 bg-white/60 backdrop-blur-md px-4 text-sm font-semibold text-slate-600 transition-all duration-300 hover:bg-slate-50 hover:text-slate-900 hover:shadow-sm">
                                        <ArrowLeftIcon className="-ml-0.5 h-4 w-4" />
                                        Kembali
                                    </Link>
                                    <PrimaryButton onClick={openEditModal} className="shadow-lg shadow-sky-500/30 h-10">
                                        <PencilIcon className="-ml-0.5 h-4 w-4" />
                                        Edit Kelas
                                    </PrimaryButton>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-200/50">
                                <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-5 backdrop-blur-sm">
                                    <dt className="text-[11px] font-bold uppercase tracking-wider text-sky-600">Nama Kelas</dt>
                                    <dd className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{kelas.tingkat} <span className="text-sky-700">{kelas.jurusan}</span></dd>
                                </div>
                                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5 backdrop-blur-sm">
                                    <dt className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 flex items-center"><UserCircleIcon className="h-4 w-4 mr-1.5" />Wali Kelas</dt>
                                    <dd className="mt-1 text-xl font-bold tracking-tight text-slate-900 truncate">{kelas.wali_kelas?.nama_lengkap || <span className="text-rose-500 italic text-sm">Belum Diatur</span>}</dd>
                                </div>
                                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 backdrop-blur-sm">
                                    <dt className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 flex items-center"><UsersIcon className="h-4 w-4 mr-1.5" />Jumlah Siswa</dt>
                                    <dd className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{siswasInKelas?.length || 0} <span className="text-sm font-medium text-slate-500">Siswa</span></dd>
                                </div>
                            </div>
                        </div>
                    </div>

                <div className="overflow-hidden rounded-3xl border border-white/40 bg-white/70 backdrop-blur-xl shadow-xl shadow-slate-200/50">
                    <div className="p-6 md:p-8">
                        <div className="border-b border-slate-200/60 pb-2">
                            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                                <TabButton icon={<UsersIcon className="h-5 w-5" />} active={activeTab === 'siswa'} onClick={() => setActiveTab('siswa')}>Daftar Siswa</TabButton>
                                <TabButton icon={<CalendarDaysIcon className="h-5 w-5" />} active={activeTab === 'jadwal'} onClick={() => setActiveTab('jadwal')}>Jadwal Pelajaran</TabButton>
                            </nav>
                        </div>

                        {activeTab === 'siswa' && (
                            <DaftarSiswaTab
                                siswas={siswasInKelas}
                                search={search}
                                onSearch={setSearch}
                                isLoading={isLoading}
                                selectedIds={selectedIds}
                                onSelectAll={handleSelectAll}
                                onSelectOne={handleSelectOne}
                                onRemoveSelected={handleRemoveSelected}
                                onOpenAddModal={() => setIsAddModalOpen(true)}
                            />
                        )}
                        {activeTab === 'jadwal' && <JadwalPelajaranTab jadwal={jadwalPelajaran} />}
                    </div>
                </div>
                </div>
            </div>

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
                                value={kelas.id_kelas}
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
                                {guruOptions && guruOptions.filter(guru => !guru.is_assigned || guru.id_guru === kelas.id_wali_kelas).map((guru) => (
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

            {/* Modal Tambah Siswa */}
            <Modal show={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} maxWidth="2xl">
                <div className="p-6 sm:p-8 bg-white/80 backdrop-blur-2xl rounded-3xl border border-white/40">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-2">Tambah Siswa ke Kelas</h2>
                        <p className="text-sm text-slate-500">Pilih siswa yang saat ini belum memiliki kelas untuk dimasukkan ke <strong className="text-slate-700">{kelas.tingkat} {kelas.jurusan}</strong>.</p>
                    </div>
                    
                    <div className="mb-6 relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            value={addSearch}
                            onChange={(e) => setAddSearch(e.target.value)}
                            placeholder="Cari siswa (Nama/NIS)..."
                            className="w-full rounded-2xl border border-slate-200/60 bg-white/60 backdrop-blur-md py-3 pl-12 pr-4 text-sm text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100/50 shadow-inner"
                        />
                    </div>

                    <div className="max-h-96 overflow-y-auto rounded-2xl border border-slate-200/60 bg-white/40 backdrop-blur-sm shadow-inner">
                        <table className="min-w-full divide-y divide-slate-200/50">
                            <thead className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-md border-b border-slate-200/60">
                                <tr>
                                    <th className="px-5 py-4 text-left w-10">
                                        <Checkbox
                                            checked={filteredUnassigned.length > 0 && selectedAddIds.length === filteredUnassigned.length}
                                            onChange={(e) => handleSelectAllAdd(e.target.checked)}
                                        />
                                    </th>
                                    <th className="px-5 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Siswa Tersedia</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/50">
                                {filteredUnassigned.length > 0 ? (
                                    filteredUnassigned.map((siswa) => (
                                        <tr key={siswa.id_siswa} className="transition-all duration-200 hover:bg-sky-50/50 cursor-pointer" onClick={() => handleSelectOneAdd(siswa.id_siswa)}>
                                            <td className="px-5 py-4">
                                                <Checkbox
                                                    checked={selectedAddIds.includes(siswa.id_siswa)}
                                                    onChange={() => handleSelectOneAdd(siswa.id_siswa)}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="text-sm font-bold text-slate-900">{siswa.nama_lengkap}</div>
                                                <div className="text-xs text-slate-500 mt-0.5">NIS: <span className="font-mono">{siswa.nis}</span> &bull; {siswa.jenis_kelamin}</div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="2" className="px-5 py-12 text-center text-sm text-slate-400 italic">
                                            {unassignedSiswas?.length === 0 ? 'Semua siswa sudah memiliki kelas.' : 'Tidak ada siswa yang cocok dengan pencarian.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-8 flex justify-between items-center">
                        <div className="text-sm font-medium text-slate-500 bg-slate-100/50 px-3 py-1.5 rounded-lg border border-slate-200/50">
                            <span className="text-sky-600 font-bold">{selectedAddIds.length}</span> siswa dipilih
                        </div>
                        <div className="flex gap-3">
                            <SecondaryButton onClick={() => setIsAddModalOpen(false)}>Batal</SecondaryButton>
                            <PrimaryButton 
                                onClick={submitAddStudents} 
                                disabled={selectedAddIds.length === 0}
                            >
                                Simpan ke Kelas
                            </PrimaryButton>
                        </div>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
}
