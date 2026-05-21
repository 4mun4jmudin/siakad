import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import GuruLayout from '@/Layouts/GuruLayout';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import PrimaryButton from '@/Components/PrimaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

export default function Index({ auth, rencanaMateri, mapels, flash }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        id_mapel: '',
        tingkat_kelas: '',
        judul_materi: '',
        deskripsi: '',
        pertemuan_ke: '',
    });

    const openCreateModal = () => {
        reset();
        clearErrors();
        setEditingId(null);
        setIsModalOpen(true);
    };

    const openEditModal = (materi) => {
        reset();
        clearErrors();
        setData({
            id_mapel: materi.id_mapel,
            tingkat_kelas: materi.tingkat_kelas || '',
            judul_materi: materi.judul_materi,
            deskripsi: materi.deskripsi || '',
            pertemuan_ke: materi.pertemuan_ke || '',
        });
        setEditingId(materi.id_rencana);
        setIsModalOpen(true);
    };

    const openDeleteModal = (materi) => {
        setItemToDelete(materi);
        setIsDeleteModalOpen(true);
    };

    const closeModals = () => {
        setIsModalOpen(false);
        setIsDeleteModalOpen(false);
        setEditingId(null);
        setItemToDelete(null);
        reset();
    };

    const submitForm = (e) => {
        e.preventDefault();
        if (editingId) {
            put(route('guru.rencana-materi.update', editingId), {
                onSuccess: () => closeModals(),
            });
        } else {
            post(route('guru.rencana-materi.store'), {
                onSuccess: () => closeModals(),
            });
        }
    };

    const submitDelete = (e) => {
        e.preventDefault();
        destroy(route('guru.rencana-materi.destroy', itemToDelete.id_rencana), {
            onSuccess: () => closeModals(),
        });
    };

    return (
        <GuruLayout user={auth.user} header="Rencana Materi / Silabus">
            <Head title="Rencana Materi" />

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Daftar Rencana Materi</h2>
                        <p className="text-sm text-gray-500">Target materi yang akan diajarkan per mata pelajaran</p>
                    </div>
                    <PrimaryButton onClick={openCreateModal} className="flex items-center">
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Rencana Materi
                    </PrimaryButton>
                </div>

                {flash.success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{flash.success}</span>
                    </div>
                )}

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Mata Pelajaran</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Kelas / Pertemuan</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Judul Materi</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {rencanaMateri.map((materi) => (
                                    <tr key={materi.id_rencana}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {materi.mata_pelajaran?.nama_mapel}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            Tingkat: {materi.tingkat_kelas || '-'}<br/>
                                            Pertemuan Ke: {materi.pertemuan_ke || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            <div className="font-medium">{materi.judul_materi}</div>
                                            <div className="text-gray-500 text-xs mt-1">{materi.deskripsi}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => openEditModal(materi)} className="text-blue-600 hover:text-blue-800" title="Edit"><Edit className="h-4 w-4" /></button>
                                                <button onClick={() => openDeleteModal(materi)} className="text-red-600 hover:text-red-800" title="Hapus"><Trash2 className="h-4 w-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {rencanaMateri.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="text-center py-10 text-gray-500">Belum ada rencana materi. Silakan tambahkan.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Form */}
            <Modal show={isModalOpen} onClose={closeModals}>
                <form onSubmit={submitForm} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        {editingId ? 'Edit Rencana Materi' : 'Tambah Rencana Materi'}
                    </h2>
                    
                    <div className="space-y-4">
                        {!editingId && (
                            <div>
                                <InputLabel htmlFor="id_mapel" value="Mata Pelajaran" />
                                <select
                                    id="id_mapel"
                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    value={data.id_mapel}
                                    onChange={e => setData('id_mapel', e.target.value)}
                                    required
                                >
                                    <option value="">-- Pilih Mata Pelajaran --</option>
                                    {mapels.map(mapel => (
                                        <option key={mapel.id_mapel} value={mapel.id_mapel}>{mapel.nama_mapel}</option>
                                    ))}
                                </select>
                                <InputError message={errors.id_mapel} className="mt-2" />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="tingkat_kelas" value="Tingkat Kelas (Opsional)" />
                                <TextInput
                                    id="tingkat_kelas"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={data.tingkat_kelas}
                                    onChange={e => setData('tingkat_kelas', e.target.value)}
                                    placeholder="Misal: X, XI, XII"
                                />
                                <InputError message={errors.tingkat_kelas} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="pertemuan_ke" value="Pertemuan Ke (Opsional)" />
                                <TextInput
                                    id="pertemuan_ke"
                                    type="number"
                                    min="1"
                                    className="mt-1 block w-full"
                                    value={data.pertemuan_ke}
                                    onChange={e => setData('pertemuan_ke', e.target.value)}
                                    placeholder="Misal: 1"
                                />
                                <InputError message={errors.pertemuan_ke} className="mt-2" />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="judul_materi" value="Judul Materi / Topik" />
                            <TextInput
                                id="judul_materi"
                                type="text"
                                className="mt-1 block w-full"
                                value={data.judul_materi}
                                onChange={e => setData('judul_materi', e.target.value)}
                                required
                            />
                            <InputError message={errors.judul_materi} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="deskripsi" value="Deskripsi / Sub Topik (Opsional)" />
                            <textarea
                                id="deskripsi"
                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                rows="3"
                                value={data.deskripsi}
                                onChange={e => setData('deskripsi', e.target.value)}
                            ></textarea>
                            <InputError message={errors.deskripsi} className="mt-2" />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton type="button" onClick={closeModals}>Batal</SecondaryButton>
                        <PrimaryButton className="ml-3" disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Simpan'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal Hapus */}
            <Modal show={isDeleteModalOpen} onClose={closeModals}>
                <form onSubmit={submitDelete} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        Apakah Anda yakin?
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Data rencana materi <strong>{itemToDelete?.judul_materi}</strong> akan dihapus permanen.
                    </p>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton type="button" onClick={closeModals}>Batal</SecondaryButton>
                        <DangerButton className="ml-3" disabled={processing}>
                            {processing ? 'Menghapus...' : 'Ya, Hapus'}
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </GuruLayout>
    );
}
