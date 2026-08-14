import React, { useState, useEffect } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { StarIcon } from '@heroicons/react/24/solid';
import { TrashIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';

export default function AdminFeedbackIndex({ feedbacks, stats }) {
    const { delete: destroy } = useForm();
    const { flash } = usePage().props;

    const [filterRole, setFilterRole] = useState('Semua');

    useEffect(() => {
        if (flash.success) {
            Swal.fire({ title: 'Berhasil!', text: flash.success, icon: 'success', confirmButtonText: 'Tutup' });
        }
    }, [flash]);

    // Polling data (SPA-like real-time) setiap 10 detik
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['feedbacks', 'stats'], preserveScroll: true, preserveState: true });
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Hapus Feedback?',
            text: "Data yang dihapus tidak dapat dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(route('admin.feedback.destroy', id));
            }
        });
    };

    const renderStars = (rating) => {
        return (
            <div className="flex">
                {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                ))}
            </div>
        );
    };

    // Filter feedback by role (Siswa, Guru, Orang Tua)
    const filteredFeedbacks = filterRole === 'Semua' 
        ? feedbacks 
        : feedbacks.filter(fb => fb.pengguna?.level === filterRole);

    return (
        <AdminLayout header="Rekapitulasi Feedback Pengguna">
            <Head title="Admin - Rekap Feedback" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Stats Widget */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white shadow rounded-lg p-6 flex flex-col items-center justify-center">
                            <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Total Feedback</h3>
                            <div className="text-4xl font-extrabold text-gray-900">{stats.total}</div>
                            <div className="mt-2 text-sm text-gray-500">Dari semua pengguna (Siswa, Guru, Ortu)</div>
                        </div>
                        <div className="bg-white shadow rounded-lg p-6 flex flex-col items-center justify-center">
                            <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Rata-rata Penilaian</h3>
                            <div className="text-4xl font-extrabold text-yellow-500 flex items-center">
                                {stats.average} <StarIcon className="w-8 h-8 ml-2 text-yellow-400" />
                            </div>
                            <div className="mt-2 text-sm text-gray-500">Skala 1 - 5 Bintang</div>
                        </div>
                    </div>

                    {/* Table Area */}
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Daftar Feedback & Masukan</h3>
                            <select 
                                value={filterRole} 
                                onChange={(e) => setFilterRole(e.target.value)}
                                className="border-gray-300 rounded-md shadow-sm text-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            >
                                <option value="Semua">Semua Role</option>
                                <option value="Siswa">Siswa</option>
                                <option value="Guru">Guru</option>
                                <option value="Orang Tua">Orang Tua</option>
                            </select>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Tgl Submit</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Pengguna</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Role</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Rating</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Komentar</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredFeedbacks.length > 0 ? (
                                        filteredFeedbacks.map((fb) => (
                                            <tr key={fb.id_feedback} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(fb.created_at).toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric'})}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{fb.pengguna?.nama_lengkap || 'Unknown'}</div>
                                                    <div className="text-sm text-gray-500">{fb.pengguna?.username}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                        ${fb.pengguna?.level === 'Guru' ? 'bg-blue-100 text-blue-800' : ''}
                                                        ${fb.pengguna?.level === 'Siswa' ? 'bg-green-100 text-green-800' : ''}
                                                        ${fb.pengguna?.level === 'Orang Tua' ? 'bg-purple-100 text-purple-800' : ''}
                                                    `}>
                                                        {fb.pengguna?.level || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {renderStars(fb.rating)}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700 min-w-[300px]">
                                                    {fb.komentar ? (
                                                        <span className="break-words">{fb.komentar}</span>
                                                    ) : (
                                                        <span className="text-gray-400 italic">Tidak ada komentar</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button onClick={() => handleDelete(fb.id_feedback)} className="text-red-600 hover:text-red-900" title="Hapus">
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                                                Belum ada data feedback untuk ditampilkan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </AdminLayout>
    );
}
