import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import GuruLayout from '@/Layouts/GuruLayout';
import { 
    ClipboardDocumentListIcon, 
    PlusIcon, 
    PencilSquareIcon, 
    TrashIcon,
    MagnifyingGlassIcon,
    EyeIcon
} from '@heroicons/react/24/outline';
import Pagination from '@/Components/Pagination';

export default function Index({ auth, tugas, filters }) {
    const [search, setSearch] = React.useState(filters.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('guru.tugas.index'), { search }, { preserveState: true });
    };

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus tugas ini?')) {
            router.delete(route('guru.tugas.destroy', id));
        }
    };

    return (
        <GuruLayout user={auth.user} header="Manajemen Tugas">
            <Head title="Manajemen Tugas" />

            <div className="max-w-7xl mx-auto space-y-6 pb-12">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <ClipboardDocumentListIcon className="w-6 h-6 text-indigo-600" />
                            Daftar Tugas
                        </h2>
                        <p className="text-slate-500 text-sm mt-1">Kelola penugasan untuk siswa kelas Anda.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <form onSubmit={handleSearch} className="relative w-full sm:w-64">
                            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari judul tugas..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </form>
                        <Link 
                            href={route('guru.tugas.create')}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                            <PlusIcon className="w-4 h-4" />
                            Buat Tugas
                        </Link>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-50 text-slate-600 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Judul Tugas</th>
                                    <th className="px-6 py-4 font-semibold">Kelas & Mapel</th>
                                    <th className="px-6 py-4 font-semibold">Tenggat Waktu</th>
                                    <th className="px-6 py-4 font-semibold">Terkumpul</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {tugas.data.map((item) => (
                                    <tr key={item.id_tugas} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-slate-800">{item.judul_tugas}</span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            <div>{item.jadwal_mengajar?.kelas?.tingkat} {item.jadwal_mengajar?.kelas?.jurusan}</div>
                                            <div className="text-xs text-slate-400 mt-0.5">{item.jadwal_mengajar?.mata_pelajaran?.nama_mapel}</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {new Date(item.tenggat_waktu).toLocaleString('id-ID', {
                                                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-100">
                                                {item.pengumpulan_tugas_count} Siswa
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                                ${item.status === 'Diterbitkan' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                                  item.status === 'Draft' ? 'bg-slate-100 text-slate-700 border-slate-200' : 
                                                  'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={route('guru.tugas.show', item.id_tugas)}
                                                    className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                                                    title="Lihat Detail & Penilaian"
                                                >
                                                    <EyeIcon className="w-4 h-4" />
                                                </Link>
                                                <Link
                                                    href={route('guru.tugas.edit', item.id_tugas)}
                                                    className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                    title="Edit Tugas"
                                                >
                                                    <PencilSquareIcon className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(item.id_tugas)}
                                                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                    title="Hapus Tugas"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {tugas.data.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                            Belum ada data tugas.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {tugas.links && tugas.data.length > 0 && (
                        <div className="px-6 py-4 border-t border-slate-100">
                            <Pagination links={tugas.links} />
                        </div>
                    )}
                </div>
            </div>
        </GuruLayout>
    );
}
