import React, { useState, useMemo } from "react";
import { Head, router, usePage, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  CalendarDaysIcon,
  BookOpenIcon,
  AdjustmentsHorizontalIcon,
  CheckBadgeIcon,
  LockOpenIcon,
  ArrowDownTrayIcon,
  DocumentCheckIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  Cog8ToothIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  CalendarIcon,
  AcademicCapIcon,
  StarIcon,
  Square3Stack3DIcon,
  CalculatorIcon,
  ShieldCheckIcon,
  ArrowPathRoundedSquareIcon,
  UserGroupIcon,
} from "@heroicons/react/24/solid";

/* =================== Tab Definitions =================== */
const TABS = [
  { key: "komponen", label: "Komponen & Bobot", icon: Square3Stack3DIcon },
  { key: "kkm", label: "KKM", icon: AcademicCapIcon },
  { key: "predikat", label: "Predikat Nilai", icon: StarIcon },
];

/* =================== Main Component =================== */
export default function PagePengaturanPenilaian({
  items = [],
  komponen = [],
  kkmList = [],
  predikat = [],
  config = {},
  stats = {},
  options = {},
}) {
  const { props } = usePage();
  const [activeTab, setActiveTab] = useState("komponen");

  // Global Config Form
  const { data: configData, setData: setConfigData, post: postConfig, processing: processingConfig } = useForm({
    config: [
      { key: 'kkm_default_sekolah', value: config.kkm_default_sekolah || '75' },
      { key: 'kkm_terapkan', value: config.kkm_terapkan || 'Global Sekolah' },
      { key: 'periode_mulai', value: config.periode_mulai || '' },
      { key: 'periode_sampai', value: config.periode_sampai || '' },
      { key: 'periode_status', value: config.periode_status || 'Buka' }
    ]
  });

  const handleConfigChange = (key, value) => {
    const newConfig = configData.config.map(c => c.key === key ? { ...c, value } : c);
    if (!newConfig.find(c => c.key === key)) newConfig.push({ key, value });
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

  return (
    <div className="space-y-6">
      <Head title="Pengaturan Penilaian" />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Pengaturan Penilaian
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola aturan, komponen, bobot, KKM, dan konfigurasi penilaian
            sekolah.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
            <ArrowDownTrayIcon className="w-4 h-4" />
            Import Pengaturan
          </button>
          <button onClick={saveGlobalSettings} disabled={processingConfig} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50">
            <DocumentCheckIcon className="w-4 h-4" />
            {processingConfig ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <KPICard
          icon={<CalendarDaysIcon className="w-6 h-6" />}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
          label="Tahun Ajaran Aktif"
          value={props.pengaturan?.tahun_ajaran_aktif || "2024/2025"}
          badge="Aktif"
        />
        <KPICard
          icon={<BookOpenIcon className="w-6 h-6" />}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-100"
          label="Semester Aktif"
          value={props.pengaturan?.semester_aktif || "Genap"}
          badge="Aktif"
          badgeColor="text-emerald-700 bg-emerald-50 border-emerald-200"
        />
        <KPICard
          icon={<AdjustmentsHorizontalIcon className="w-6 h-6" />}
          iconColor="text-orange-500"
          iconBg="bg-orange-100"
          label="Total Komponen"
          value={`${komponen.length || 0} Komponen`}
          subtext={`Digunakan di ${items.length || 0} Mapel`}
        />
        <KPICard
          icon={<CheckBadgeIcon className="w-6 h-6" />}
          iconColor="text-purple-600"
          iconBg="bg-purple-100"
          label="KKM Rata-rata"
          value={getConfigValue('kkm_default_sekolah', '75.00')}
          subtext={getConfigValue('kkm_terapkan', 'Sekolah')}
        />
        <KPICard
          icon={<LockOpenIcon className="w-6 h-6" />}
          iconColor="text-teal-600"
          iconBg="bg-teal-100"
          label="Status Periode"
          value={getConfigValue('periode_status', 'Buka')}
          subtext={`${getConfigValue('periode_mulai', '-')} s/d ${getConfigValue('periode_sampai', '-')}`}
          valueColor="text-teal-600"
        />
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200 overflow-x-auto custom-scrollbar">
          <div className="flex px-4 gap-8">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-3 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${isActive
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                >
                  <Icon
                    className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-gray-400"
                      }`}
                  />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 bg-gray-50/30">
          {activeTab === "komponen" && (
            <TabKomponenBobot
              komponen={komponen}
              items={items}
              options={options}
              pengaturan={props.pengaturan}
              configData={configData}
              handleConfigChange={handleConfigChange}
              getConfigValue={getConfigValue}
            />
          )}
          {activeTab === "kkm" && (
            <TabKKM
              kkmList={kkmList}
              options={options}
              pengaturan={props.pengaturan}
              configData={configData}
              handleConfigChange={handleConfigChange}
              getConfigValue={getConfigValue}
            />
          )}
          {activeTab === "predikat" && (
            <TabPredikat
              predikat={predikat}
              options={options}
              pengaturan={props.pengaturan}
            />
          )}

        </div>
      </div>
    </div>
  );
}

PagePengaturanPenilaian.layout = (page) => (
  <AdminLayout user={page.props.auth.user} header="Pengaturan Penilaian">
    {page}
  </AdminLayout>
);

/* ========================================================================== */
/*  Tab: Komponen & Bobot                                                    */
/* ========================================================================== */
function TabKomponenBobot({ komponen = [], items = [], options = {}, pengaturan = {}, configData, handleConfigChange, getConfigValue }) {

  // States for Modals
  const [modalKomponenOpen, setModalKomponenOpen] = useState(false);
  const [editingKomponen, setEditingKomponen] = useState(null);

  const [modalAturOpen, setModalAturOpen] = useState(false);
  const [editingMapel, setEditingMapel] = useState(null);

  const [modalPeriodeOpen, setModalPeriodeOpen] = useState(false);

  // Forms
  const formKomponen = useForm({
    nama: '',
    kode: '',
    tipe: 'Formatif',
    bobot_default: 0,
    aktif: true
  });

  const activeTaObj = (options.tahunAjaran || []).find(t => t.tahun_ajaran === pengaturan?.tahun_ajaran_aktif);
  const activeIdTa = activeTaObj ? activeTaObj.id_tahun_ajaran : '';

  const formAturBobot = useForm({
    id_mapel: '',
    id_tahun_ajaran: activeIdTa,
    semester: pengaturan?.semester_aktif || 'Genap',
    bobot: [] // { id_komponen, bobot }
  });

  const totalBobotAtur = parseFloat(formAturBobot.data.bobot.reduce((s, x) => s + (parseFloat(x.bobot) || 0), 0).toFixed(2));

  const openAddKomponen = () => {
    setEditingKomponen(null);
    formKomponen.reset();
    formKomponen.clearErrors();
    setModalKomponenOpen(true);
  };

  const openEditKomponen = (k) => {
    setEditingKomponen(k);
    formKomponen.setData({
      nama: k.nama,
      kode: k.kode || '',
      tipe: k.tipe || 'Formatif',
      bobot_default: k.bobot_default || 0,
      aktif: k.aktif == 1
    });
    formKomponen.clearErrors();
    setModalKomponenOpen(true);
  };

  const submitKomponen = (e) => {
    e.preventDefault();
    if (editingKomponen) {
      formKomponen.put(route('admin.penilaian.bobot.komponen.update', editingKomponen.id_komponen), {
        onSuccess: () => setModalKomponenOpen(false)
      });
    } else {
      formKomponen.post(route('admin.penilaian.bobot.komponen.store'), {
        onSuccess: () => setModalKomponenOpen(false)
      });
    }
  };

  const deleteKomponen = (id) => {
    if (confirm('Yakin ingin menghapus komponen ini?')) {
      router.delete(route('admin.penilaian.bobot.komponen.destroy', id));
    }
  };

  const toggleAktif = (k) => {
    router.put(route('admin.penilaian.bobot.komponen.update', k.id_komponen), {
      ...k,
      aktif: k.aktif ? 0 : 1
    }, { preserveScroll: true });
  };

  // Mapel Rules
  const mapelList = options.mapel || [];
  const mapelWithBobot = mapelList.map(m => {
    const existing = items.find(i => i.id_mapel === m.id_mapel);
    return {
      ...m,
      has_bobot: !!existing,
      bobot_data: existing?.bobot || {}, // { id_komponen: { id, bobot } }
      kelas_jurusan: m.kelompok || 'Semua' // Simplification
    };
  });

  const openAturMapel = (m) => {
    setEditingMapel(m);

    // Create bobot array based on active components
    const activeKomponen = komponen.filter(k => k.aktif);
    const bobotArray = activeKomponen.map(k => {
      const b = m.bobot_data[k.id_komponen];
      return {
        id_komponen: k.id_komponen,
        nama: k.nama,
        bobot: b ? b.bobot : (k.bobot_default || 0)
      };
    });

    formAturBobot.setData({
      id_mapel: m.id_mapel,
      id_tahun_ajaran: activeIdTa || '',
      semester: pengaturan.semester_aktif || 'Genap',
      bobot: bobotArray
    });
    setModalAturOpen(true);
  };

  const submitAturBobot = (e) => {
    e.preventDefault();
    formAturBobot.post(route('admin.penilaian.bobot.store'), {
      onSuccess: () => setModalAturOpen(false)
    });
  };

  // Chart Logic
  const [selectedMapelId, setSelectedMapelId] = useState(mapelWithBobot.length > 0 ? mapelWithBobot[0].id_mapel : '');

  const chartData = useMemo(() => {
    const m = mapelWithBobot.find(x => x.id_mapel === selectedMapelId) || mapelWithBobot[0];
    if (!m) return [];

    const activeKomponen = komponen.filter(k => k.aktif);
    const colors = ["#10b981", "#3b82f6", "#f59e0b", "#a855f7", "#f43f5e", "#0ea5e9", "#8b5cf6"];

    let cData = [];
    activeKomponen.forEach((k, idx) => {
      const b = m.bobot_data[k.id_komponen];
      const val = b ? b.bobot : (k.bobot_default || 0);
      if (val >= 0) {
        cData.push({ name: k.nama, value: parseFloat(Number(val).toFixed(2)), color: colors[idx % colors.length] });
      }
    });
    return cData;
  }, [selectedMapelId, mapelWithBobot, komponen]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column - 8/12 */}
      <div className="lg:col-span-8 space-y-6">

        {/* Komponen Penilaian Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Komponen Penilaian</h3>
            <button onClick={openAddKomponen} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
              <PlusIcon className="w-4 h-4" />
              Tambah Komponen
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
                <tr>
                  <th className="px-5 py-3 w-12 text-center">No</th>
                  <th className="px-5 py-3">Nama Komponen</th>
                  <th className="px-5 py-3">Kode</th>
                  <th className="px-5 py-3">Tipe</th>
                  <th className="px-5 py-3 text-center">Bobot Default</th>
                  <th className="px-5 py-3 text-center">Aktif</th>
                  <th className="px-5 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {komponen.length > 0 ? komponen.map((k, idx) => (
                  <tr key={k.id_komponen} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-center text-gray-500">
                      {idx + 1}
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-800">
                      {k.nama}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{k.kode || '-'}</td>
                    <td className="px-5 py-3 text-gray-600">{k.tipe || '-'}</td>
                    <td className="px-5 py-3 text-center text-gray-600">
                      {k.bobot_default || 0} %
                    </td>
                    <td className="px-5 py-3 text-center">
                      <Toggle checked={k.aktif == 1} onChange={() => toggleAktif(k)} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEditKomponen(k)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteKomponen(k.id_komponen)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" className="px-5 py-4 text-center text-gray-500">Belum ada komponen penilaian.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-blue-50/50 px-5 py-3 border-t border-gray-200 flex justify-end items-center gap-4">
            <div className="flex items-center gap-2 text-blue-700 font-medium text-sm">
              <InformationCircleIcon className="w-5 h-5" />
              Total Bobot Default
            </div>
            <span className={`px-3 py-1 text-white rounded-full text-xs font-bold shadow-sm ${parseFloat(komponen.reduce((a, b) => a + (parseFloat(b.bobot_default) || 0), 0).toFixed(2)) === 100 ? 'bg-blue-600' : 'bg-orange-500'}`}>
              {parseFloat(komponen.reduce((a, b) => a + (parseFloat(b.bobot_default) || 0), 0).toFixed(2))} %
            </span>
          </div>
        </div>

        {/* Aturan Bobot per Mata Pelajaran Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">
              Aturan Bobot per Mata Pelajaran
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
                <tr>
                  <th className="px-5 py-3">Mata Pelajaran</th>
                  <th className="px-5 py-3">Kelas/Jurusan</th>
                  <th className="px-5 py-3">Profil Penilaian</th>
                  <th className="px-5 py-3 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mapelWithBobot.map(m => {

                  // Format profil string
                  let profilStr = "Gunakan Bobot Default";
                  if (m.has_bobot) {
                    const parts = [];
                    komponen.forEach(k => {
                      const b = m.bobot_data[k.id_komponen];
                      if (b && b.bobot > 0) parts.push(`${k.nama} ${b.bobot}%`);
                    });
                    if (parts.length > 0) profilStr = parts.join(' - ');
                  }

                  return (
                    <tr key={m.id_mapel} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-800">
                        {m.nama_mapel}
                      </td>
                      <td className="px-5 py-3 text-gray-600">{m.kelas_jurusan}</td>
                      <td className="px-5 py-3 text-gray-600 text-xs">
                        {profilStr}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <button onClick={() => openAturMapel(m)} className={`px-3 py-1.5 text-white rounded-lg text-xs font-medium transition-colors ${m.has_bobot ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                          Atur
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Column - 4/12 */}
      <div className="lg:col-span-4 space-y-6">
        {/* Contoh Bobot Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4">
            Bobot per Mata Pelajaran
          </h3>
          <div className="mb-4">
            <label className="block text-xs text-gray-500 mb-1.5">
              Pilih Mapel
            </label>
            <select
              value={selectedMapelId}
              onChange={e => setSelectedMapelId(e.target.value)}
              className="w-full border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 py-2.5">
              {mapelWithBobot.map(m => (
                <option key={m.id_mapel} value={m.id_mapel}>{m.nama_mapel}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="h-48 w-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-bold text-gray-800">
                  {parseFloat(chartData.reduce((sum, item) => sum + item.value, 0).toFixed(2))}%
                </span>
                <span className="text-xs text-gray-500">Total Bobot</span>
              </div>
            </div>
            {/* Custom Legend */}
            <div className="space-y-2">
              {chartData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-gray-600 w-16 truncate" title={item.name}>{item.name}</span>
                  <span className="font-medium text-gray-800 w-8 text-right">
                    {parseFloat(Number(item.value).toFixed(2))}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pengaturan KKM Global */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4">
            Pengaturan KKM Global
          </h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                KKM Default Sekolah
              </label>
              <input
                type="number"
                value={getConfigValue('kkm_default_sekolah', '75')}
                onChange={e => handleConfigChange('kkm_default_sekolah', e.target.value)}
                className="w-full border-gray-300 rounded-lg text-sm py-2 px-3"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Batas Tuntas
              </label>
              <input
                type="text"
                className="w-full border-gray-300 bg-gray-50 rounded-lg text-sm py-2 px-3 text-center"
                value=">= KKM"
                readOnly
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Batas Tidak Tuntas
              </label>
              <input
                type="text"
                className="w-full border-gray-300 bg-gray-50 rounded-lg text-sm py-2 px-3 text-center"
                value="< KKM"
                readOnly
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-2">
              Terapkan KKM
            </label>
            <div className="flex items-center gap-4 flex-wrap">
              {['Global Sekolah', 'Per Jurusan', 'Per Mata Pelajaran', 'Per Kelas'].map(opt => (
                <label key={opt} className="flex items-center gap-1.5 text-xs text-gray-700">
                  <input
                    type="radio"
                    name="kkm_apply"
                    checked={getConfigValue('kkm_terapkan', 'Global Sekolah') === opt}
                    onChange={() => handleConfigChange('kkm_terapkan', opt)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Periode Penilaian Aktif */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5">
            <h3 className="font-semibold text-gray-800 mb-4">
              Periode Penilaian Aktif
            </h3>
            <div className="flex items-end justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Mulai Input
                  </label>
                  <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-1.5">
                    <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{getConfigValue('periode_mulai') || '-'}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Sampai
                  </label>
                  <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-1.5">
                    <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{getConfigValue('periode_sampai') || '-'}</span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <label className="block text-xs text-gray-500 mb-1">
                  Status
                </label>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getConfigValue('periode_status') === 'Buka' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {getConfigValue('periode_status', 'Tutup')}
                </span>
              </div>
              <button onClick={() => setModalPeriodeOpen(true)} className="px-4 py-1.5 border border-blue-600 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors flex items-center gap-1.5">
                <PencilSquareIcon className="w-4 h-4" />
                Ubah
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}

      {/* Modal Komponen */}
      {modalKomponenOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-800">{editingKomponen ? 'Edit Komponen' : 'Tambah Komponen'}</h3>
              <button onClick={() => setModalKomponenOpen(false)} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="w-5 h-5" /></button>
            </div>
            <form onSubmit={submitKomponen}>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Komponen</label>
                  <input type="text" value={formKomponen.data.nama} onChange={e => formKomponen.setData('nama', e.target.value)} required className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Misal: Penilaian Harian" />
                  {formKomponen.errors.nama && <span className="text-xs text-red-500">{formKomponen.errors.nama}</span>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kode</label>
                    <input type="text" value={formKomponen.data.kode} onChange={e => formKomponen.setData('kode', e.target.value)} className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Misal: PH" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                    <select value={formKomponen.data.tipe} onChange={e => formKomponen.setData('tipe', e.target.value)} className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                      <option value="Formatif">Formatif</option>
                      <option value="Sumatif">Sumatif</option>
                      <option value="Praktik">Praktik</option>
                      <option value="Afektif">Afektif</option>
                      <option value="Portofolio">Portofolio</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bobot Default (%)</label>
                  <input type="number" min="0" max="100" value={formKomponen.data.bobot_default} onChange={e => formKomponen.setData('bobot_default', e.target.value)} className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={formKomponen.data.aktif} onChange={e => formKomponen.setData('aktif', e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm font-medium text-gray-700">Aktif digunakan</span>
                </label>
              </div>
              <div className="px-5 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
                <button type="button" onClick={() => setModalKomponenOpen(false)} className="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50">Batal</button>
                <button type="submit" disabled={formKomponen.processing} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Atur Bobot Mapel */}
      {modalAturOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-800">Atur Bobot Mapel: {editingMapel?.nama_mapel}</h3>
              <button onClick={() => setModalAturOpen(false)} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="w-5 h-5" /></button>
            </div>
            <form onSubmit={submitAturBobot}>
              <div className="p-5">
                <p className="text-sm text-gray-500 mb-4">Setel persentase bobot untuk komponen aktif pada mata pelajaran ini. Pastikan total = 100%.</p>
                <div className="space-y-3">
                  {formAturBobot.data.bobot.map((b, idx) => (
                    <div key={b.id_komponen} className="flex items-center justify-between gap-4">
                      <label className="text-sm font-medium text-gray-700 flex-1">{b.nama}</label>
                      <div className="w-32 relative">
                        <input type="number" min="0" max="100" value={b.bobot} onChange={(e) => {
                          const newB = [...formAturBobot.data.bobot];
                          newB[idx].bobot = parseFloat(e.target.value) || 0;
                          formAturBobot.setData('bobot', newB);
                        }} className="w-full border-gray-300 rounded-lg pr-8 focus:ring-blue-500 focus:border-blue-500" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
                  <span className="font-medium text-gray-700">Total Bobot:</span>
                  <span className={`text-lg font-bold ${totalBobotAtur === 100 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {totalBobotAtur} %
                  </span>
                </div>
              </div>
              <div className="px-5 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
                <button type="button" onClick={() => setModalAturOpen(false)} className="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50">Batal</button>
                <button type="submit" disabled={formAturBobot.processing || totalBobotAtur !== 100} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Simpan Bobot</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Periode */}
      {modalPeriodeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-800">Ubah Periode Penilaian</h3>
              <button onClick={() => setModalPeriodeOpen(false)} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mulai Input</label>
                <input type="date" value={getConfigValue('periode_mulai')} onChange={e => handleConfigChange('periode_mulai', e.target.value)} className="w-full border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batas Akhir (Sampai)</label>
                <input type="date" value={getConfigValue('periode_sampai')} onChange={e => handleConfigChange('periode_sampai', e.target.value)} className="w-full border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={getConfigValue('periode_status', 'Buka')} onChange={e => handleConfigChange('periode_status', e.target.value)} className="w-full border-gray-300 rounded-lg">
                  <option value="Buka">Buka (Input Diizinkan)</option>
                  <option value="Tutup">Tutup (Input Dikunci)</option>
                </select>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
              <button type="button" onClick={() => setModalPeriodeOpen(false)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Selesai</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/* ========================================================================== */
/*  Helper Components                                                         */
/* ========================================================================== */

function KPICard({ icon, iconColor, iconBg, label, value, subtext, badge, badgeColor, valueColor }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 relative overflow-hidden">
      <div className={`p-3 rounded-xl ${iconBg} ${iconColor}`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500 font-medium mb-0.5">{label}</p>
        <p className={`text-xl font-bold ${valueColor || 'text-gray-800'}`}>
          {value}
        </p>
        {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
      </div>
      {badge && (
        <span
          className={`absolute top-4 right-4 px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${badgeColor || "text-blue-700 bg-blue-50 border border-blue-200"
            }`}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <div className="relative inline-flex items-center cursor-pointer" onClick={onChange}>
      <input type="checkbox" className="sr-only peer" checked={checked} readOnly />
      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
    </div>
  );
}

function IconWrapper({ icon: Icon }) {
  if (!Icon) return null;
  return (
    <div className="w-16 h-16 mx-auto bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center">
      <Icon className="w-8 h-8" />
    </div>
  );
}

/* ========================================================================== */
/*  Tab: KKM                                                                 */
/* ========================================================================== */
function TabKKM({ kkmList = [], options = {}, pengaturan = {}, configData, handleConfigChange, getConfigValue }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingKKM, setEditingKKM] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const activeTaObj = (options.tahunAjaran || []).find(t => t.tahun_ajaran === pengaturan?.tahun_ajaran_aktif);
  const activeIdTa = activeTaObj ? activeTaObj.id_tahun_ajaran : '';

  const form = useForm({
    id: null,
    id_mapel: '',
    id_tahun_ajaran: activeIdTa,
    semester: pengaturan?.semester_aktif || 'Genap',
    jurusan: '',
    kkm: 75
  });

  const filteredList = useMemo(() => {
    return kkmList.filter(k =>
      (k.nama_mapel || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (k.jurusan || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [kkmList, searchQuery]);

  const openAdd = () => {
    setEditingKKM(null);
    form.setData({
      id: null,
      id_mapel: options.mapel?.[0]?.id_mapel || '',
      id_tahun_ajaran: activeIdTa,
      semester: pengaturan?.semester_aktif || 'Genap',
      jurusan: '',
      kkm: 75
    });
    form.clearErrors();
    setModalOpen(true);
  };

  const openEdit = (k) => {
    setEditingKKM(k);
    form.setData({
      id: k.id,
      id_mapel: k.id_mapel,
      id_tahun_ajaran: k.id_tahun_ajaran,
      semester: k.semester,
      jurusan: k.jurusan || '',
      kkm: k.kkm
    });
    form.clearErrors();
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    form.post(route('admin.penilaian.bobot.kkm.store'), {
      onSuccess: () => setModalOpen(false)
    });
  };

  const handleDelete = (k) => {
    if (confirm(`Apakah Anda yakin ingin menghapus KKM kustom untuk mapel "${k.nama_mapel}"?`)) {
      router.delete(route('admin.penilaian.bobot.kkm.destroy', k.id));
    }
  };

  const currentTerapkan = getConfigValue('kkm_terapkan', 'Global Sekolah');

  return (
    <div className="space-y-6">
      {/* Kebijakan KKM Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          <div className="space-y-1 max-w-xl">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
              <AcademicCapIcon className="w-5 h-5 text-blue-600" />
              Kebijakan KKM Aktif
            </h3>
            <p className="text-sm text-gray-500">
              Sistem saat ini menerapkan mode KKM: <span className="font-semibold text-blue-600">{currentTerapkan}</span>.
              {currentTerapkan === 'Global Sekolah'
                ? ' Semua mata pelajaran secara default menggunakan KKM global sekolah, kecuali didefinisikan khusus di bawah.'
                : ' Setiap mata pelajaran/jurusan dinilai berdasarkan batas lulus KKM spesifik masing-masing.'}
            </p>
          </div>
          <div className="flex items-center gap-4 bg-gray-50 px-4 py-3 rounded-lg border border-gray-100 self-stretch md:self-auto">
            <div>
              <span className="block text-[10px] uppercase font-bold text-gray-400">KKM Global</span>
              <span className="text-2xl font-extrabold text-blue-600">{getConfigValue('kkm_default_sekolah', '75')}</span>
            </div>
            <div className="border-l border-gray-200 h-8"></div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-gray-400">Tahun Ajaran</span>
              <span className="text-sm font-semibold text-gray-700">{pengaturan?.tahun_ajaran_aktif || '-'}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-3">Ganti Kebijakan Penerapan KKM</label>
          <div className="flex flex-wrap gap-4">
            {['Global Sekolah', 'Per Jurusan', 'Per Mata Pelajaran'].map(opt => (
              <label key={opt} className={`flex items-center gap-2.5 px-4 py-2 rounded-lg border text-sm font-medium cursor-pointer transition-all ${currentTerapkan === opt
                  ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}>
                <input
                  type="radio"
                  name="kkm_apply_tab"
                  checked={currentTerapkan === opt}
                  onChange={() => handleConfigChange('kkm_terapkan', opt)}
                  className="text-blue-600 focus:ring-blue-500 w-4 h-4 border-gray-300"
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Tabel KKM Khusus */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-semibold text-gray-800">Daftar KKM Kustom</h3>
            <p className="text-xs text-gray-500 mt-0.5">Definisikan KKM spesifik untuk mata pelajaran tertentu.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari mapel / jurusan..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-3 pr-8 py-1.5 border border-gray-300 rounded-lg text-xs w-48 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            </div>
            <button onClick={openAdd} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap">
              <PlusIcon className="w-3.5 h-3.5" />
              Atur KKM Mapel
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 w-12 text-center">No</th>
                <th className="px-5 py-3">Mata Pelajaran</th>
                <th className="px-5 py-3">Jurusan</th>
                <th className="px-5 py-3 text-center">Semester</th>
                <th className="px-5 py-3 text-center">Tahun Ajaran</th>
                <th className="px-5 py-3 text-center">KKM</th>
                <th className="px-5 py-3 text-center">Status Lulus</th>
                <th className="px-5 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredList.length > 0 ? filteredList.map((k, idx) => (
                <tr key={k.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 text-center text-gray-500 font-medium">
                    {idx + 1}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <BookOpenIcon className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold text-gray-800">{k.nama_mapel}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    {k.jurusan ? (
                      <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                        {k.jurusan}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs italic">Semua Jurusan</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${k.semester === 'Ganjil' ? 'bg-orange-50 text-orange-700 border border-orange-100' : 'bg-purple-50 text-purple-700 border border-purple-100'}`}>
                      {k.semester}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center text-gray-600 font-medium text-xs">
                    {k.tahun_ajaran}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className="text-sm font-extrabold text-blue-600">{parseFloat(k.kkm)}</span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${parseFloat(k.kkm) <= 75
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${parseFloat(k.kkm) <= 75 ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                      {parseFloat(k.kkm) <= 75 ? 'Standar Baik' : 'Batas Tinggi'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-center gap-2.5">
                      <button onClick={() => openEdit(k)} className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors">
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(k)} className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" className="px-5 py-8 text-center text-gray-500">
                    Tidak ada batas KKM khusus yang terdaftar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah/Edit KKM */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all border border-gray-100">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <AcademicCapIcon className="w-5 h-5 text-blue-600" />
                {editingKKM ? 'Edit KKM Khusus' : 'Atur KKM Khusus'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Mata Pelajaran</label>
                  <select
                    value={form.data.id_mapel}
                    onChange={e => form.setData('id_mapel', e.target.value)}
                    required
                    disabled={!!editingKKM}
                    className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100"
                  >
                    {options.mapel?.map(m => (
                      <option key={m.id_mapel} value={m.id_mapel}>{m.nama_mapel}</option>
                    ))}
                  </select>
                  {form.errors.id_mapel && <span className="text-xs text-red-500">{form.errors.id_mapel}</span>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Jurusan / Program Keahlian</label>
                  <select
                    value={form.data.jurusan}
                    onChange={e => form.setData('jurusan', e.target.value)}
                    disabled={!!editingKKM}
                    className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100"
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
                      value={options.tahunAjaran?.find(t => t.id_tahun_ajaran === form.data.id_tahun_ajaran)?.tahun_ajaran || form.data.id_tahun_ajaran}
                      disabled
                      className="w-full border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Semester</label>
                    <input
                      type="text"
                      value={form.data.semester}
                      disabled
                      className="w-full border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-500 cursor-not-allowed"
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
                      value={form.data.kkm}
                      onChange={e => form.setData('kkm', e.target.value)}
                      required
                      className="w-full border-gray-300 rounded-lg pr-12 text-sm focus:ring-blue-500 focus:border-blue-500 font-semibold"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-xs font-bold">Skala 100</span>
                    </div>
                  </div>
                  {form.errors.kkm && <span className="text-xs text-red-500">{form.errors.kkm}</span>}
                </div>
              </div>

              <div className="px-5 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg text-sm hover:bg-gray-50 font-medium">Batal</button>
                <button type="submit" disabled={form.processing} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 font-semibold disabled:opacity-50 flex items-center gap-1.5">
                  <DocumentCheckIcon className="w-4 h-4" />
                  Simpan KKM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ========================================================================== */
/*  Tab: Predikat Nilai                                                      */
/* ========================================================================== */
function TabPredikat({ predikat = [], options = {}, pengaturan = {} }) {
  const [modalOpen, setModalOpen] = useState(false);

  const activeTaObj = (options.tahunAjaran || []).find(t => t.tahun_ajaran === pengaturan?.tahun_ajaran_aktif);
  const activeIdTa = activeTaObj ? activeTaObj.id_tahun_ajaran : '';

  const form = useForm({
    id_tahun_ajaran: activeIdTa,
    semester: pengaturan?.semester_aktif || 'Genap',
    predikat: [] // array of { predikat, batas_bawah, batas_atas }
  });

  const sortedList = useMemo(() => {
    return [...predikat].sort((a, b) => b.batas_atas - a.batas_atas);
  }, [predikat]);

  const initDefaults = () => {
    if (confirm("Belum ada rentang predikat untuk periode aktif ini. Apakah Anda ingin menginisialisasi predikat default otomatis?\n\n- A (Sangat Baik): 90 - 100\n- B (Baik): 80 - 89.99\n- C (Cukup): 70 - 79.99\n- D (Kurang): 0 - 69.99")) {
      router.post(route('admin.penilaian.bobot.predikat.store'), {
        id_tahun_ajaran: activeIdTa,
        semester: pengaturan?.semester_aktif || 'Genap',
        predikat: [
          { predikat: 'A', batas_bawah: 90, batas_atas: 100 },
          { predikat: 'B', batas_bawah: 80, batas_atas: 89.99 },
          { predikat: 'C', batas_bawah: 70, batas_atas: 79.99 },
          { predikat: 'D', batas_bawah: 0, batas_atas: 69.99 }
        ]
      }, { preserveScroll: true });
    }
  };

  const openEdit = () => {
    let list = sortedList;
    if (list.length === 0) {
      list = [
        { predikat: 'A', batas_bawah: 90, batas_atas: 100 },
        { predikat: 'B', batas_bawah: 80, batas_atas: 89.99 },
        { predikat: 'C', batas_bawah: 70, batas_atas: 79.99 },
        { predikat: 'D', batas_bawah: 0, batas_atas: 69.99 }
      ];
    }
    form.setData({
      id_tahun_ajaran: activeIdTa,
      semester: pengaturan?.semester_aktif || 'Genap',
      predikat: list.map(p => ({
        predikat: p.predikat,
        batas_bawah: parseFloat(p.batas_bawah),
        batas_atas: parseFloat(p.batas_atas)
      }))
    });
    form.clearErrors();
    setModalOpen(true);
  };

  const handleBatasChange = (idx, field, val) => {
    const list = [...form.data.predikat];
    list[idx][field] = parseFloat(val) || 0;
    form.setData('predikat', list);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Sort array by batas_bawah ascending to perform validation
    const list = [...form.data.predikat].sort((a, b) => a.batas_bawah - b.batas_bawah);
    let valid = true;
    let errMsg = "";

    // Predikat terendah batas_bawah harus 0
    if (list[0].batas_bawah !== 0) {
      valid = false;
      errMsg = `Batas bawah untuk predikat terendah (${list[0].predikat}) harus bernilai 0.`;
    }

    // Predikat tertinggi batas_atas harus 100
    if (list[list.length - 1].batas_atas !== 100) {
      valid = false;
      errMsg = `Batas atas untuk predikat tertinggi (${list[list.length - 1].predikat}) harus bernilai 100.`;
    }

    // Check gaps and overlaps
    for (let i = 0; i < list.length - 1; i++) {
      if (list[i].batas_atas > list[i + 1].batas_bawah) {
        valid = false;
        errMsg = `Tumpang tindih terdeteksi antara predikat ${list[i].predikat} (s/d ${list[i].batas_atas}) dan predikat ${list[i + 1].predikat} (mulai ${list[i + 1].batas_bawah}).`;
        break;
      } else if (list[i].batas_atas < list[i + 1].batas_bawah - 0.1) {
        valid = false;
        errMsg = `Terdapat celah nilai kosong antara predikat ${list[i].predikat} (s/d ${list[i].batas_atas}) dan predikat ${list[i + 1].predikat} (mulai ${list[i + 1].batas_bawah}). Rentang nilai harus berkesinambungan.`;
        break;
      }
    }

    if (!valid) {
      alert("Peringatan Validasi Rentang:\n" + errMsg);
      return;
    }

    form.post(route('admin.penilaian.bobot.predikat.store'), {
      onSuccess: () => setModalOpen(false)
    });
  };

  // Color mappings for A, B, C, D
  const getPredikatColors = (p) => {
    switch (p) {
      case 'A': return { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', bar: 'bg-emerald-500' };
      case 'B': return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', bar: 'bg-blue-500' };
      case 'C': return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', bar: 'bg-amber-500' };
      default: return { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200', bar: 'bg-rose-500' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h3 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
            <StarIcon className="w-5 h-5 text-amber-500" />
            Aturan Predikat Nilai Aktif
          </h3>
          <p className="text-sm text-gray-500">
            Digunakan untuk pemetaan nilai akhir siswa dari skala angka (0-100) ke nilai predikat (A, B, C, D) di rapor dan rekap nilai.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {sortedList.length === 0 && (
            <button onClick={initDefaults} className="inline-flex items-center gap-1.5 px-4 py-2 border border-blue-600 text-blue-600 bg-white rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors shadow-xs">
              Gunakan Default
            </button>
          )}
          <button onClick={openEdit} className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
            <PencilSquareIcon className="w-4 h-4" />
            Atur Rentang Predikat
          </button>
        </div>
      </div>

      {/* Visual Progress Ranges Bar */}
      {sortedList.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h4 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-wider">Visualisasi Rentang Nilai</h4>
          <div className="h-6 w-full rounded-full bg-gray-100 flex overflow-hidden shadow-inner border border-gray-200">
            {[...sortedList].reverse().map((p, idx) => {
              const colors = getPredikatColors(p.predikat);
              const width = Math.max(5, Math.min(100, parseFloat(p.batas_atas) - parseFloat(p.batas_bawah)));
              return (
                <div
                  key={idx}
                  className={`h-full ${colors.bar} flex items-center justify-center text-[10px] font-extrabold text-white transition-all`}
                  style={{ width: `${width}%` }}
                  title={`Predikat ${p.predikat}: ${parseFloat(p.batas_bawah)} s/d ${parseFloat(p.batas_atas)}`}
                >
                  {p.predikat}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-2 px-1">
            <span>0 (Batas Terendah)</span>
            <span>50</span>
            <span>75 (Standar KKM)</span>
            <span>100 (Sempurna)</span>
          </div>
        </div>
      )}

      {/* Tabel Predikat */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-800">Tabel Batas Predikat</h3>
            <p className="text-xs text-gray-500 mt-0.5">Berlaku pada Tahun Ajaran: {pengaturan?.tahun_ajaran_aktif || '-'} ({pengaturan?.semester_aktif || '-'})</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 text-center w-24">Predikat</th>
                <th className="px-5 py-3">Batas Bawah (Mulai Dari)</th>
                <th className="px-5 py-3">Batas Atas (Sampai Dengan)</th>
                <th className="px-5 py-3">Keterangan Kompetensi</th>
                <th className="px-5 py-3 text-center">Periode Semester</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedList.length > 0 ? sortedList.map((p) => {
                const colors = getPredikatColors(p.predikat);
                let ket = "Sangat Baik - Menunjukkan penguasaan kompetensi yang sangat matang.";
                if (p.predikat === 'B') ket = "Baik - Menunjukkan penguasaan kompetensi yang baik.";
                if (p.predikat === 'C') ket = "Cukup - Menunjukkan penguasaan kompetensi yang cukup.";
                if (p.predikat === 'D') ket = "Kurang - Perlu bimbingan dan remedial intensif.";

                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-block px-3 py-1.5 rounded-lg text-sm font-extrabold border ${colors.bg} ${colors.text} ${colors.border} w-10 text-center shadow-xs`}>
                        {p.predikat}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-gray-700 text-sm">
                      {parseFloat(p.batas_bawah)}
                    </td>
                    <td className="px-5 py-4 font-semibold text-gray-700 text-sm">
                      {parseFloat(p.batas_atas)}
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-xs italic">
                      {ket}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="text-gray-600 font-semibold text-xs">
                        {pengaturan?.tahun_ajaran_aktif || '-'} ({p.semester})
                      </span>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="5" className="px-5 py-8 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
                    <span>Rentang predikat belum dikonfigurasi untuk periode ini.</span>
                    <button onClick={initDefaults} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm">
                      Inisialisasi Predikat Default
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Batch Edit Predikat */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 transform transition-all">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <StarIcon className="w-5 h-5 text-amber-500" />
                Atur Rentang Nilai Predikat
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-5 space-y-4">
                <p className="text-xs text-gray-500 italic">
                  Pastikan batas bawah predikat terendah adalah 0, batas atas predikat tertinggi adalah 100, dan tidak ada rentang nilai yang tumpang tindih (*overlap*) atau kosong (*gap*).
                </p>

                <div className="space-y-3">
                  <div className="grid grid-cols-12 gap-3 text-xs font-bold text-gray-400 uppercase tracking-wider pb-1">
                    <div className="col-span-2 text-center">Predikat</div>
                    <div className="col-span-5">Batas Bawah (Mulai Dari)</div>
                    <div className="col-span-5">Batas Atas (Sampai Dengan)</div>
                  </div>

                  {form.data.predikat.map((p, idx) => {
                    const colors = getPredikatColors(p.predikat);
                    return (
                      <div key={p.predikat} className="grid grid-cols-12 gap-3 items-center">
                        <div className="col-span-2 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded border text-xs font-bold ${colors.bg} ${colors.text} ${colors.border} w-8`}>
                            {p.predikat}
                          </span>
                        </div>
                        <div className="col-span-5 relative rounded-md shadow-xs">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={p.batas_bawah}
                            onChange={e => handleBatasChange(idx, 'batas_bawah', e.target.value)}
                            required
                            className="w-full border-gray-300 rounded-lg text-sm pr-6 focus:ring-blue-500 focus:border-blue-500 font-semibold"
                          />
                          <span className="absolute inset-y-0 right-2 flex items-center text-gray-400 text-[10px] pointer-events-none font-bold">%</span>
                        </div>
                        <div className="col-span-5 relative rounded-md shadow-xs">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={p.batas_atas}
                            onChange={e => handleBatasChange(idx, 'batas_atas', e.target.value)}
                            required
                            className="w-full border-gray-300 rounded-lg text-sm pr-6 focus:ring-blue-500 focus:border-blue-500 font-semibold"
                          />
                          <span className="absolute inset-y-0 right-2 flex items-center text-gray-400 text-[10px] pointer-events-none font-bold">%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="px-5 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg text-sm hover:bg-gray-50 font-medium">Batal</button>
                <button type="submit" disabled={form.processing} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 font-semibold disabled:opacity-50 flex items-center gap-1.5">
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
