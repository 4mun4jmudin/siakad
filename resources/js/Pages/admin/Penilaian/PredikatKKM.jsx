import React, { useState, useMemo } from "react";
import { Head, useForm, router, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import {
  DocumentCheckIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  XMarkIcon,
  BookOpenIcon,
  AcademicCapIcon as AcademicOutline,
} from "@heroicons/react/24/outline";
import {
  StarIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  Cog6ToothIcon,
  LightBulbIcon,
} from "@heroicons/react/24/solid";

export default function PagePredikatKKM({
  predikat = [],
  kkmList = [],
  config = {},
  stats = {},
  pengaturan = {},
  options = {}
}) {
  const [activeTab, setActiveTab] = useState("predikat");
  const [activeSubTab, setActiveSubTab] = useState("mapel");

  // Global Config Form (Ketuntasan & Rapor)
  const { data: configData, setData: setConfigData, post: postConfig, processing: processingConfig } = useForm({
    config: [
      { key: 'kkm_terapkan', value: config.kkm_terapkan || 'Global Sekolah' },
      { key: 'kkm_default_sekolah', value: config.kkm_default_sekolah || '75' },
      { key: 'kkm_pembulatan', value: config.kkm_pembulatan || 'Pembulatan Normal' },
      { key: 'kkm_tampilkan_rapor', value: config.kkm_tampilkan_rapor || '1' }
    ]
  });

  const handleConfigChange = (key, value) => {
    const newConfig = configData.config.map(c => c.key === key ? { ...c, value: String(value) } : c);
    if (!configData.config.find(c => c.key === key)) newConfig.push({ key, value: String(value) });
    setConfigData('config', newConfig);
  };

  const getConfigValue = (key, def = '') => {
    return configData.config.find(c => c.key === key)?.value || def;
  };

  const saveGlobalSettings = () => {
    postConfig(route('admin.penilaian.bobot.config.store'), {
      preserveScroll: true,
      onSuccess: () => alert('Pengaturan global berhasil disimpan!')
    });
  };

  // ==========================================
  // PREDIKAT TAB STATES & LOGIC
  // ==========================================
  const [modalPredikatOpen, setModalPredikatOpen] = useState(false);
  
  const activeTaObj = (options.tahunAjaran || []).find(t => t.tahun_ajaran === pengaturan?.tahun_ajaran_aktif);
  const activeIdTa = activeTaObj ? activeTaObj.id_tahun_ajaran : '';

  const formPredikat = useForm({
    id_tahun_ajaran: activeIdTa,
    semester: pengaturan?.semester_aktif || 'Ganjil',
    predikat: []
  });

  const sortedPredikat = useMemo(() => {
    return [...predikat].sort((a, b) => b.batas_atas - a.batas_atas);
  }, [predikat]);

  const initDefaultPredikat = () => {
    if (confirm("Belum ada rentang predikat untuk periode aktif ini. Apakah Anda ingin menginisialisasi predikat default otomatis?\n\n- A (Sangat Baik): 90 - 100\n- B (Baik): 80 - 89.99\n- C (Cukup): 70 - 79.99\n- D (Kurang): 0 - 69.99")) {
      router.post(route('admin.penilaian.bobot.predikat.store'), {
        id_tahun_ajaran: activeIdTa,
        semester: pengaturan?.semester_aktif || 'Ganjil',
        predikat: [
          { predikat: 'A', batas_bawah: 90, batas_atas: 100 },
          { predikat: 'B', batas_bawah: 80, batas_atas: 89.99 },
          { predikat: 'C', batas_bawah: 70, batas_atas: 79.99 },
          { predikat: 'D', batas_bawah: 0,  batas_atas: 69.99 }
        ]
      }, { preserveScroll: true });
    }
  };

  const openEditPredikat = () => {
    let list = sortedPredikat;
    if (list.length === 0) {
      list = [
        { predikat: 'A', batas_bawah: 90, batas_atas: 100 },
        { predikat: 'B', batas_bawah: 80, batas_atas: 89.99 },
        { predikat: 'C', batas_bawah: 70, batas_atas: 79.99 },
        { predikat: 'D', batas_bawah: 0,  batas_atas: 69.99 }
      ];
    }
    formPredikat.setData({
      id_tahun_ajaran: activeIdTa,
      semester: pengaturan?.semester_aktif || 'Ganjil',
      predikat: list.map(p => ({
        predikat: p.predikat,
        batas_bawah: parseFloat(p.batas_bawah),
        batas_atas: parseFloat(p.batas_atas)
      }))
    });
    formPredikat.clearErrors();
    setModalPredikatOpen(true);
  };

  const addPredikatRow = () => {
    const list = [...formPredikat.data.predikat];
    // Find next unused letter
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const used = list.map(x => x.predikat);
    const nextLetter = letters.find(l => !used.includes(l)) || 'X';
    
    list.push({ predikat: nextLetter, batas_bawah: 0, batas_atas: 100 });
    formPredikat.setData('predikat', list);
  };

  const removePredikatRow = (idx) => {
    const list = [...formPredikat.data.predikat];
    list.splice(idx, 1);
    formPredikat.setData('predikat', list);
  };

  const handlePredikatChange = (idx, field, val) => {
    const list = [...formPredikat.data.predikat];
    list[idx][field] = field === 'predikat' ? val.toUpperCase() : parseFloat(val) || 0;
    formPredikat.setData('predikat', list);
  };

  const submitPredikat = (e) => {
    e.preventDefault();

    if (formPredikat.data.predikat.length === 0) {
      alert("Harus ada minimal satu predikat!");
      return;
    }

    const list = [...formPredikat.data.predikat].sort((a,b) => a.batas_bawah - b.batas_bawah);
    let valid = true;
    let errMsg = "";
    
    if (list[0].batas_bawah !== 0) {
      valid = false;
      errMsg = `Batas bawah untuk predikat terendah (${list[0].predikat}) harus bernilai 0.`;
    }
    
    if (list[list.length-1].batas_atas !== 100) {
      valid = false;
      errMsg = `Batas atas untuk predikat tertinggi (${list[list.length-1].predikat}) harus bernilai 100.`;
    }
    
    for (let i = 0; i < list.length - 1; i++) {
      if (list[i].batas_atas > list[i+1].batas_bawah) {
        valid = false;
        errMsg = `Tumpang tindih terdeteksi antara predikat ${list[i].predikat} (s/d ${list[i].batas_atas}) dan predikat ${list[i+1].predikat} (mulai ${list[i+1].batas_bawah}).`;
        break;
      } else if (list[i].batas_atas < list[i+1].batas_bawah - 0.1) {
        valid = false;
        errMsg = `Terdapat celah nilai kosong antara predikat ${list[i].predikat} (s/d ${list[i].batas_atas}) dan predikat ${list[i+1].predikat} (mulai ${list[i+1].batas_bawah}).`;
        break;
      }
    }

    if (!valid) {
      alert("Validasi Rentang Gagal:\n" + errMsg);
      return;
    }

    formPredikat.post(route('admin.penilaian.bobot.predikat.store'), {
      onSuccess: () => setModalPredikatOpen(false)
    });
  };

  const getPredikatColors = (p) => {
    const clean = p.split(' ')[0];
    switch (clean) {
      case 'A': return { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', bar: 'bg-emerald-500' };
      case 'B': return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', bar: 'bg-blue-500' };
      case 'C': return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', bar: 'bg-amber-500' };
      case 'D': return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', bar: 'bg-orange-500' };
      default: return { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200', bar: 'bg-rose-500' };
    }
  };

  const getPredikatDesc = (p) => {
    const clean = p.split(' ')[0];
    switch (clean) {
      case 'A': return "Sangat Baik - Menunjukkan penguasaan kompetensi yang sangat matang.";
      case 'B': return "Baik - Menunjukkan penguasaan kompetensi yang baik.";
      case 'C': return "Cukup - Menunjukkan penguasaan kompetensi yang cukup.";
      default: return "Kurang - Perlu bimbingan dan remedial intensif.";
    }
  };

  const getPredikatForScore = (score) => {
    const found = sortedPredikat.find(p => score >= parseFloat(p.batas_bawah) && score <= parseFloat(p.batas_atas));
    return found ? found.predikat : '-';
  };

  // ==========================================
  // KKM TAB STATES & LOGIC
  // ==========================================
  const [modalKKMOpen, setModalKKMOpen] = useState(false);
  const [editingKKM, setEditingKKM] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJurusan, setSelectedJurusan] = useState("Semua Jurusan");
  const [selectedKelas, setSelectedKelas] = useState("Semua Kelas");

  const formKKM = useForm({
    id: null,
    id_mapel: '',
    id_tahun_ajaran: activeIdTa,
    semester: pengaturan?.semester_aktif || 'Ganjil',
    jurusan: '',
    kkm: 75
  });

  const filteredKKMList = useMemo(() => {
    return kkmList.filter(k => {
      const matchSearch = (k.nama_mapel || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchJurusan = selectedJurusan === "Semua Jurusan" || k.jurusan === selectedJurusan;
      
      let matchKelas = true;
      if (selectedKelas !== "Semua Kelas" && options.kelas) {
        const classObj = options.kelas.find(cls => cls.id_kelas === selectedKelas || cls.nama_kelas === selectedKelas);
        matchKelas = classObj ? k.jurusan === classObj.jurusan : true;
      }

      return matchSearch && matchJurusan && matchKelas;
    });
  }, [kkmList, searchQuery, selectedJurusan, selectedKelas, options.kelas]);

  const openAddKKM = () => {
    setEditingKKM(null);
    formKKM.setData({
      id: null,
      id_mapel: options.mapel?.[0]?.id_mapel || '',
      id_tahun_ajaran: activeIdTa,
      semester: pengaturan?.semester_aktif || 'Ganjil',
      jurusan: '',
      kkm: 75
    });
    formKKM.clearErrors();
    setModalKKMOpen(true);
  };

  const openEditKKM = (k) => {
    setEditingKKM(k);
    formKKM.setData({
      id: k.id,
      id_mapel: k.id_mapel,
      id_tahun_ajaran: k.id_tahun_ajaran,
      semester: k.semester,
      jurusan: k.jurusan || '',
      kkm: k.kkm
    });
    formKKM.clearErrors();
    setModalKKMOpen(true);
  };

  const submitKKM = (e) => {
    e.preventDefault();
    formKKM.post(route('admin.penilaian.bobot.kkm.store'), {
      onSuccess: () => setModalKKMOpen(false)
    });
  };

  const deleteKKM = (k) => {
    if (confirm(`Apakah Anda yakin ingin menghapus KKM kustom untuk mapel "${k.nama_mapel}"?`)) {
      router.delete(route('admin.penilaian.bobot.kkm.destroy', k.id));
    }
  };

  return (
    <div className="space-y-6">
      <Head title="Predikat & KKM" />

      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Predikat & KKM</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola predikat nilai, KKM, dan aturan ketuntasan sekolah secara dinamis.
          </p>
        </div>
        <div>
          <button onClick={saveGlobalSettings} disabled={processingConfig} className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50">
            <DocumentCheckIcon className="w-5 h-5" />
            {processingConfig ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
          </button>
        </div>
      </div>

      {/* 2. TABS */}
      <div className="border-b border-gray-200 overflow-x-auto custom-scrollbar bg-white rounded-t-xl border border-gray-150">
        <div className="flex px-4 gap-2">
          <TabButton
            icon={<StarIcon className="w-4 h-4" />}
            label="Predikat Nilai"
            isActive={activeTab === "predikat"}
            onClick={() => setActiveTab("predikat")}
          />
          <TabButton
            icon={<AcademicCapIcon className="w-4 h-4" />}
            label="KKM"
            isActive={activeTab === "kkm"}
            onClick={() => setActiveTab("kkm")}
          />
          <TabButton
            icon={<CheckCircleIcon className="w-4 h-4" />}
            label="Status Ketuntasan & Rapor"
            isActive={activeTab === "ketuntasan"}
            onClick={() => setActiveTab("ketuntasan")}
          />
        </div>
      </div>

      {/* 3. CONTENT */}
      {activeTab === "predikat" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Table Predikat */}
          <div className="lg:col-span-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 flex flex-col h-full">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Pengaturan Predikat Nilai</h3>
                  <p className="text-sm text-gray-500">Atur rentang nilai untuk setiap predikat yang digunakan di sekolah.</p>
                </div>
                <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                  {sortedPredikat.length === 0 && (
                    <button onClick={initDefaultPredikat} className="inline-flex items-center gap-1.5 px-3 py-2 border border-blue-200 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-50 transition-colors">
                      Inisialisasi Default
                    </button>
                  )}
                  <button onClick={openEditPredikat} className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-650 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-xs">
                    <PencilSquareIcon className="w-4 h-4" /> Atur Rentang Predikat
                  </button>
                </div>
              </div>

              {/* Visual segment progress bar */}
              {sortedPredikat.length > 0 && (
                <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-inner">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Visualisasi Rentang Nilai</h4>
                  <div className="h-6 w-full rounded-full bg-gray-200 flex overflow-hidden border border-gray-300">
                    {[...sortedPredikat].reverse().map((p, idx) => {
                      const colors = getPredikatColors(p.predikat);
                      const width = Math.max(5, Math.min(100, parseFloat(p.batas_atas) - parseFloat(p.batas_bawah)));
                      return (
                        <div
                          key={idx}
                          className={`h-full ${colors.bar} flex items-center justify-center text-[10px] font-extrabold text-white transition-all shadow-xs`}
                          style={{ width: `${width}%` }}
                          title={`Predikat ${p.predikat}: ${parseFloat(p.batas_bawah)} s/d ${parseFloat(p.batas_atas)}`}
                        >
                          {p.predikat}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[9px] font-bold text-gray-400 mt-2 px-1">
                    <span>0</span>
                    <span>50</span>
                    <span>75 (KKM)</span>
                    <span>100</span>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto border border-gray-150 rounded-xl mb-4">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Predikat</th>
                      <th className="px-5 py-3.5 text-center">Batas Bawah</th>
                      <th className="px-5 py-3.5 text-center">Batas Atas</th>
                      <th className="px-5 py-3.5">Deskripsi</th>
                      <th className="px-5 py-3.5 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sortedPredikat.length > 0 ? sortedPredikat.map((item, idx) => {
                      const colors = getPredikatColors(item.predikat);
                      return (
                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-5 py-3.5">
                            <span className={`inline-block px-3 py-1 rounded-md text-xs font-extrabold border ${colors.bg} ${colors.text} ${colors.border}`}>
                              {item.predikat}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-center text-gray-700 font-bold">{parseFloat(item.batas_bawah)}</td>
                          <td className="px-5 py-3.5 text-center text-gray-700 font-bold">{parseFloat(item.batas_atas)}</td>
                          <td className="px-5 py-3.5 text-gray-500 text-xs italic">{getPredikatDesc(item.predikat)}</td>
                          <td className="px-5 py-3.5 text-center">
                            <button onClick={openEditPredikat} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition-colors">
                              <PencilSquareIcon className="w-4.5 h-4.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan="5" className="px-5 py-8 text-center text-gray-500">
                          Belum ada rentang predikat disetel. Klik inisialisasi default di kanan atas.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-start gap-3 mt-auto">
                <InformationCircleIcon className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <p className="text-xs text-indigo-700 leading-relaxed">
                  Rentang nilai predikat harus berurutan rapat dari 0 sampai 100 tanpa tumpang tindih (*overlap*) maupun celah kosong (*gap*). Data ini memengaruhi konversi otomatis nilai akhir di rapor siswa.
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar Preview Predikat */}
          <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-1.5">
                <StarIcon className="w-5 h-5 text-amber-500" />
                Preview Mapping Nilai
              </h3>
              <p className="text-sm text-gray-500 mb-5 pb-3 border-b border-gray-100">Contoh konversi nilai angka ke huruf berdasarkan rentang di samping.</p>
              
              <table className="w-full text-sm text-left">
                <thead className="border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="pb-3 font-semibold">Nilai Contoh</th>
                    <th className="pb-3 font-semibold text-center w-24">Predikat</th>
                    <th className="pb-3 font-semibold">Deskripsi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[95, 85, 75, 65, 45].map((val) => {
                    const pred = getPredikatForScore(val);
                    const colors = getPredikatColors(pred);
                    return (
                      <tr key={val} className="hover:bg-gray-50/50">
                        <td className="py-3 font-bold text-gray-800 text-sm">{val}</td>
                        <td className="py-3 text-center">
                          <span className={`inline-flex items-center justify-center w-8 h-6 rounded font-extrabold text-xs border ${colors.bg} ${colors.text} ${colors.border}`}>
                            {pred}
                          </span>
                        </td>
                        <td className="py-3 text-gray-500 text-[11px] truncate max-w-[120px]">{getPredikatDesc(pred)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "kkm" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Table KKM */}
          <div className="lg:col-span-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Pengaturan KKM</h3>
                  <p className="text-sm text-gray-500">Atur Kriteria Ketuntasan Minimal (KKM) untuk setiap mata pelajaran.</p>
                </div>
                <button onClick={openAddKKM} className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-xs">
                  <PlusIcon className="w-4 h-4" /> Atur KKM Mapel
                </button>
              </div>

              {/* Sub tabs mapel vs kelas */}
              <div className="flex border-b border-gray-200 mb-5 bg-gray-50/50 p-1.5 rounded-lg border border-gray-100">
                 <button 
                    onClick={() => setActiveSubTab('mapel')}
                    className={`flex-1 text-center py-2 text-xs font-semibold rounded-md transition-all ${activeSubTab === 'mapel' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                   KKM per Mata Pelajaran
                 </button>
                 <button 
                    onClick={() => setActiveSubTab('kelas')}
                    className={`flex-1 text-center py-2 text-xs font-semibold rounded-md transition-all ${activeSubTab === 'kelas' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                   KKM per Kelas / Jurusan
                 </button>
              </div>

              {/* Filters & Search */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5 bg-gray-50/30 p-3 rounded-xl border border-gray-100">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Pilih Jurusan</label>
                  <select
                    value={selectedJurusan}
                    onChange={e => setSelectedJurusan(e.target.value)}
                    className="w-full border-gray-300 rounded-lg text-xs py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 font-semibold"
                  >
                    <option value="Semua Jurusan">Semua Jurusan</option>
                    {options.jurusan?.map(j => (
                      <option key={j} value={j}>{j}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Pilih Kelas</label>
                  <select
                    value={selectedKelas}
                    onChange={e => setSelectedKelas(e.target.value)}
                    className="w-full border-gray-300 rounded-lg text-xs py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 font-semibold"
                  >
                    <option value="Semua Kelas">Semua Kelas</option>
                    {options.kelas?.map(c => (
                      <option key={c.id_kelas} value={c.id_kelas}>{c.nama_kelas}</option>
                    ))}
                  </select>
                </div>
                <div>
                   <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Cari Mata Pelajaran</label>
                   <div className="relative">
                      <input
                        type="text"
                        placeholder="Cari mapel..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full border-gray-300 rounded-lg text-xs py-2 px-3 pl-9 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                      />
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                   </div>
                </div>
              </div>

              {/* Table list */}
              <div className="overflow-x-auto border border-gray-150 rounded-xl mb-4">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3 w-12 text-center">No</th>
                      <th className="px-5 py-3">Mata Pelajaran</th>
                      <th className="px-5 py-3">Jurusan</th>
                      <th className="px-5 py-3 text-center">Semester</th>
                      <th className="px-5 py-3 text-center">KKM</th>
                      <th className="px-5 py-3 text-center w-24">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredKKMList.length > 0 ? filteredKKMList.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3 text-center text-gray-500 font-medium">{idx + 1}</td>
                        <td className="px-5 py-3 font-semibold text-gray-800 flex items-center gap-2">
                          <BookOpenIcon className="w-4 h-4 text-gray-400" />
                          {item.nama_mapel}
                        </td>
                        <td className="px-5 py-3">
                          {item.jurusan ? (
                            <span className="px-2.5 py-0.5 rounded bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-bold">
                              {item.jurusan}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs italic">Semua Jurusan</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${item.semester === 'Ganjil' ? 'bg-orange-50 text-orange-700 border border-orange-100' : 'bg-purple-50 text-purple-700 border border-purple-100'}`}>
                            {item.semester}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className="text-sm font-extrabold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-lg shadow-2xs">
                            {parseFloat(item.kkm)}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <div className="flex items-center justify-center gap-2.5">
                            <button onClick={() => openEditKKM(item)} className="text-indigo-650 hover:text-indigo-850 p-1 hover:bg-indigo-50 rounded transition-colors"><PencilSquareIcon className="w-4.5 h-4.5" /></button>
                            <button onClick={() => deleteKKM(item)} className="text-red-500 hover:text-red-750 p-1 hover:bg-red-50 rounded transition-colors"><TrashIcon className="w-4.5 h-4.5" /></button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="6" className="px-5 py-8 text-center text-gray-500">
                          Tidak ada batas KKM khusus/kustom yang terdaftar untuk filter ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar Ringkasan KKM */}
          <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 flex flex-col h-full">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-1.5">
                <AcademicCapIcon className="w-5 h-5 text-indigo-600" />
                Ringkasan KKM
              </h3>
              <p className="text-sm text-gray-500 mb-6 pb-3 border-b border-gray-100">Statistik rata-rata KKM berdasarkan jurusan.</p>
              
              <table className="w-full text-sm text-left mb-6">
                <thead className="border-b border-gray-100 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="pb-3 font-semibold">Jurusan</th>
                    <th className="pb-3 font-semibold text-center">Rata-rata KKM</th>
                    <th className="pb-3 font-semibold text-center w-20">Mapel</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats.ringkasan && stats.ringkasan.length > 0 ? stats.ringkasan.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="py-3 text-gray-700 text-xs font-semibold">{item.jurusan}</td>
                      <td className="py-3">
                         <div className="flex items-center gap-2">
                            <div className="w-12 h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                               <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${item.progress}%` }}></div>
                            </div>
                            <span className="font-extrabold text-gray-800 text-xs">{item.rata}</span>
                         </div>
                      </td>
                      <td className="py-3 text-center text-gray-500 font-medium text-xs">{item.mapel}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="3" className="py-3 text-center text-gray-400 text-xs italic">Belum ada statistik KKM.</td>
                    </tr>
                  )}
                  <tr className="bg-gray-50/80 font-bold border-t border-gray-200">
                     <td className="py-3.5 font-bold text-gray-800 text-xs pl-2">Rata-rata Sekolah</td>
                     <td className="py-3.5 font-extrabold text-indigo-750 text-xs">
                       {stats.rata_sekolah || 75}
                     </td>
                     <td className="py-3.5 text-gray-800 text-center font-bold text-xs">{stats.total_mapel || 0}</td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-auto bg-amber-50 border border-amber-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1.5">
                   <LightBulbIcon className="w-5 h-5 text-amber-500 shrink-0" />
                   <h4 className="font-bold text-amber-800 text-xs uppercase tracking-wide">Informasi Penting</h4>
                </div>
                <p className="text-[11px] text-amber-700 leading-relaxed pl-7">
                   KKM kustom dapat berbeda untuk setiap mata pelajaran sesuai dengan karakteristik, kompleksitas materi, dan program jurusan keahlian.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "ketuntasan" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800">Pengaturan Ketuntasan & Rapor</h3>
            <p className="text-sm text-gray-500 mb-6 pb-3 border-b border-gray-100">Atur kebijakan penentuan status kelulusan siswa dan tampilan predikat di rapor.</p>

            <div className="flex flex-col xl:flex-row gap-8 items-start">
               <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Acuan Ketuntasan</label>
                    <select
                      value={getConfigValue('kkm_terapkan', 'Global Sekolah')}
                      onChange={e => handleConfigChange('kkm_terapkan', e.target.value)}
                      className="w-full border-gray-300 rounded-lg text-sm py-2.5 px-3 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 font-semibold"
                    >
                      <option value="Global Sekolah">KKM Global Sekolah</option>
                      <option value="Per Mata Pelajaran">KKM per Mata Pelajaran</option>
                      <option value="Per Jurusan">KKM per Jurusan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Minimal Nilai Akhir (KKM Sekolah)</label>
                    <div className="flex items-center gap-2">
                       <input
                         type="number"
                         value={getConfigValue('kkm_default_sekolah', '75')}
                         onChange={e => handleConfigChange('kkm_default_sekolah', e.target.value)}
                         className="w-24 border-gray-300 rounded-lg text-sm py-2.5 px-3 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 font-bold"
                       />
                       <span className="text-gray-500 font-semibold">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Sistem Pembulatan Nilai</label>
                    <select
                      value={getConfigValue('kkm_pembulatan', 'Pembulatan Normal')}
                      onChange={e => handleConfigChange('kkm_pembulatan', e.target.value)}
                      className="w-full border-gray-300 rounded-lg text-sm py-2.5 px-3 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 font-semibold"
                    >
                      <option value="Pembulatan Normal">Pembulatan Normal (Batas 0.5)</option>
                      <option value="Pembulatan ke Atas">Pembulatan ke Atas (Ceil)</option>
                      <option value="Tanpa Pembulatan">Tanpa Pembulatan (Desimal Asli)</option>
                    </select>
                  </div>
               </div>
               
               <div className="flex items-center gap-4 border-l border-gray-200 pl-8 h-full">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Tampilkan di Rapor</label>
                    <div className="relative inline-flex items-center cursor-pointer" onClick={() => handleConfigChange('kkm_tampilkan_rapor', getConfigValue('kkm_tampilkan_rapor', '1') === '1' ? '0' : '1')}>
                      <input type="checkbox" className="sr-only peer" checked={getConfigValue('kkm_tampilkan_rapor', '1') === '1'} readOnly />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </div>
                  </div>
               </div>

               <div className="flex-1 bg-indigo-50 rounded-xl border border-indigo-100 p-4 w-full">
                  <div className="flex items-center gap-2 mb-1.5">
                     <CheckCircleIcon className="w-5 h-5 text-indigo-600" />
                     <h4 className="font-bold text-indigo-800 text-xs uppercase tracking-wide">Rumus Ketuntasan Aktif</h4>
                  </div>
                  <p className="text-xs text-indigo-700 ml-7 leading-relaxed">
                     Siswa dinyatakan tuntas kelulusan jika <span className="font-semibold text-indigo-900">Nilai Akhir &gt;= KKM</span> yang ditentukan oleh acuan kebijakan yang Anda set di samping.
                  </p>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODALS SECTION
         ========================================== */}

      {/* Modal Tambah/Edit KKM */}
      {modalKKMOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all border border-gray-150">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <AcademicOutline className="w-5 h-5 text-indigo-600" />
                {editingKKM ? 'Edit KKM Khusus' : 'Atur KKM Khusus'}
              </h3>
              <button onClick={() => setModalKKMOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={submitKKM}>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Mata Pelajaran</label>
                  <select
                    value={formKKM.data.id_mapel}
                    onChange={e => formKKM.setData('id_mapel', e.target.value)}
                    required
                    disabled={!!editingKKM}
                    className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100 font-medium text-gray-700"
                  >
                    {options.mapel?.map(m => (
                      <option key={m.id_mapel} value={m.id_mapel}>{m.nama_mapel}</option>
                    ))}
                  </select>
                  {formKKM.errors.id_mapel && <span className="text-xs text-red-500">{formKKM.errors.id_mapel}</span>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Jurusan / Program Keahlian</label>
                  <select
                    value={formKKM.data.jurusan}
                    onChange={e => formKKM.setData('jurusan', e.target.value)}
                    disabled={!!editingKKM}
                    className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100 font-medium text-gray-700"
                  >
                    <option value="">Semua Jurusan</option>
                    {options.jurusan?.map(j => (
                      <option key={j} value={j}>{j}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Tahun Ajaran</label>
                    <input
                      type="text"
                      value={options.tahunAjaran?.find(t => t.id_tahun_ajaran === formKKM.data.id_tahun_ajaran)?.tahun_ajaran || formKKM.data.id_tahun_ajaran}
                      disabled
                      className="w-full border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-500 cursor-not-allowed font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Semester</label>
                    <input
                      type="text"
                      value={formKKM.data.semester}
                      disabled
                      className="w-full border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-500 cursor-not-allowed font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-1">KKM Batas Kelulusan (0 - 100)</label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formKKM.data.kkm}
                      onChange={e => formKKM.setData('kkm', e.target.value)}
                      required
                      className="w-full border-gray-300 rounded-lg pr-12 text-sm focus:ring-blue-500 focus:border-blue-500 font-extrabold text-blue-600"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-[10px] font-bold">Skala 100</span>
                    </div>
                  </div>
                  {formKKM.errors.kkm && <span className="text-xs text-red-500">{formKKM.errors.kkm}</span>}
                </div>
              </div>

              <div className="px-5 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
                <button type="button" onClick={() => setModalKKMOpen(false)} className="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg text-sm hover:bg-gray-50 font-medium">Batal</button>
                <button type="submit" disabled={formKKM.processing} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 font-semibold disabled:opacity-50 flex items-center gap-1.5">
                  <DocumentCheckIcon className="w-4 h-4" />
                  Simpan Batas KKM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Batch Edit Predikat */}
      {modalPredikatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-150 transform transition-all">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <StarIcon className="w-5 h-5 text-amber-500" />
                Atur Rentang Nilai Predikat
              </h3>
              <button onClick={() => setModalPredikatOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={submitPredikat}>
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-center mb-1.5 pb-2 border-b border-gray-100">
                  <p className="text-[11px] text-gray-500 italic">
                    Masukkan rentang nilai berkesinambungan tanpa tumpang tindih (*overlap*).
                  </p>
                  <button type="button" onClick={addPredikatRow} className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-250 text-emerald-700 rounded-md text-[10px] font-bold hover:bg-emerald-100 transition-colors">
                    <PlusIcon className="w-3 h-3" /> Tambah Baris
                  </button>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  <div className="grid grid-cols-12 gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider pb-1">
                    <div className="col-span-2 text-center">Predikat</div>
                    <div className="col-span-4">Batas Bawah (%)</div>
                    <div className="col-span-4">Batas Atas (%)</div>
                    <div className="col-span-2 text-center">Hapus</div>
                  </div>

                  {formPredikat.data.predikat.map((p, idx) => {
                    const colors = getPredikatColors(p.predikat);
                    return (
                      <div key={idx} className="grid grid-cols-12 gap-3 items-center">
                        <div className="col-span-2 text-center">
                          <input
                            type="text"
                            maxLength="2"
                            value={p.predikat}
                            onChange={e => handlePredikatChange(idx, 'predikat', e.target.value)}
                            required
                            className="w-10 text-center border-gray-300 rounded-lg text-xs py-1.5 font-bold uppercase focus:ring-indigo-500"
                            placeholder="A"
                          />
                        </div>
                        <div className="col-span-4 relative rounded-md shadow-xs">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={p.batas_bawah}
                            onChange={e => handlePredikatChange(idx, 'batas_bawah', e.target.value)}
                            required
                            className="w-full border-gray-300 rounded-lg text-xs py-1.5 pr-6 focus:ring-blue-500 focus:border-blue-500 font-semibold"
                          />
                          <span className="absolute inset-y-0 right-2 flex items-center text-gray-400 text-[9px] pointer-events-none font-bold">%</span>
                        </div>
                        <div className="col-span-4 relative rounded-md shadow-xs">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={p.batas_atas}
                            onChange={e => handlePredikatChange(idx, 'batas_atas', e.target.value)}
                            required
                            className="w-full border-gray-300 rounded-lg text-xs py-1.5 pr-6 focus:ring-blue-500 focus:border-blue-500 font-semibold"
                          />
                          <span className="absolute inset-y-0 right-2 flex items-center text-gray-400 text-[9px] pointer-events-none font-bold">%</span>
                        </div>
                        <div className="col-span-2 text-center">
                          <button type="button" onClick={() => removePredikatRow(idx)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="px-5 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
                <button type="button" onClick={() => setModalPredikatOpen(false)} className="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg text-sm hover:bg-gray-50 font-medium">Batal</button>
                <button type="submit" disabled={formPredikat.processing} className="px-4 py-2 bg-indigo-650 text-white rounded-lg text-sm hover:bg-indigo-700 font-semibold disabled:opacity-50 flex items-center gap-1.5">
                  <DocumentCheckIcon className="w-4 h-4" />
                  Simpan Rentang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

PagePredikatKKM.layout = (page) => (
  <AdminLayout user={page.props.auth.user} header="Predikat & KKM">
    {page}
  </AdminLayout>
);

function TabButton({ icon, label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
        isActive
          ? "border-indigo-600 text-indigo-700 bg-indigo-50/10"
          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
      }`}
    >
      <span className={isActive ? "text-indigo-650" : "text-gray-400"}>{icon}</span>
      {label}
    </button>
  );
}
