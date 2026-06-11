import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Head, usePage, Link, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  ChevronDownIcon,
  FunnelIcon,
  ArrowPathIcon,
  ArrowRightIcon,
  PlusIcon,
  EyeIcon,
  PencilSquareIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";

/* =================== helpers angka AMAN =================== */
function toNumber(v) {
  if (typeof v === "number") return v;
  if (v === null || v === undefined) return NaN;
  const s = String(v).trim().replace(",", ".");
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : NaN;
}
function fix2(n) {
  const x = toNumber(n);
  return Number.isFinite(x) ? x.toFixed(2) : "—";
}
function pct(n) {
  const x = toNumber(n);
  return Number.isFinite(x) ? `${x.toFixed(1)}%` : "—";
}
function fmtNum(n) {
  const x = toNumber(n);
  return Number.isFinite(x) ? x.toLocaleString("id-ID") : "—";
}

/* =================== Warna Predikat =================== */
const PREDIKAT_COLORS = {
  A: "#3B82F6",
  B: "#22C55E",
  C: "#F59E0B",
  D: "#EF4444",
  E: "#8B5CF6",
};
const PREDIKAT_LABELS = {
  A: "A (Sangat Baik)",
  B: "B (Baik)",
  C: "C (Cukup)",
  D: "D (Kurang)",
  E: "E (Sangat Kurang)",
};
const BAR_COLORS = ["#3B82F6", "#60A5FA", "#2563EB", "#93C5FD", "#1D4ED8", "#BFDBFE"];

/* =================== Status Badge =================== */
const STATUS_STYLES = {
  Dipublish: "bg-green-100 text-green-700",
  "Menunggu Validasi": "bg-yellow-100 text-yellow-700",
  "Belum Dipublish": "bg-red-100 text-red-700",
  Diarsipkan: "bg-gray-100 text-gray-600",
};

/* =================== Main Component =================== */
export default function Dashboard({ options = {}, filters = {}, routes = {} }) {
  const { props } = usePage();
  const [f, setF] = useState({
    id_tahun_ajaran: filters?.id_tahun_ajaran || "",
    semester: filters?.semester || "",
    id_kelas: filters?.id_kelas || "",
    id_mapel: filters?.id_mapel || "",
    guru: "",
    status: "",
  });
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    summary: null,
    distribution: [],
    trend: [],
    mapel: [],
    kelas: [],
    breakdown: { predikat: {}, tuntas: { ya: 0, tidak: 0 } },
    remedial: [],
  });
  const [activeTab, setActiveTab] = useState("semua");
  const [exportOpen, setExportOpen] = useState(false);

  // helper querystring dari filter aktif
  const withQuery = useCallback(
    (url) => {
      const qs = new URLSearchParams(
        Object.fromEntries(
          Object.entries(f).filter(
            ([_, v]) => v !== "" && v !== null && v !== undefined
          )
        )
      ).toString();
      return qs ? `${url}?${qs}` : url;
    },
    [f]
  );

  const loadAll = useCallback(async () => {
    if (!f.id_tahun_ajaran || !f.semester) return;
    setLoading(true);
    try {
      const [
        summaryRes,
        distributionRes,
        trendRes,
        mapelRes,
        kelasRes,
        breakdownRes,
        remedialRes,
      ] = await Promise.all([
        fetch(withQuery(routes.summary)),
        fetch(withQuery(routes.distribution)),
        fetch(withQuery(routes.trend)),
        fetch(withQuery(routes.mapelLeaderboard)),
        fetch(withQuery(routes.kelasLeaderboard)),
        fetch(withQuery(routes.tuntasBreakdown)),
        fetch(withQuery(routes.remedialQueue)),
      ]);

      const [summary, distribution, trend, mapel, kelas, breakdown, remedial] =
        await Promise.all([
          summaryRes.json(),
          distributionRes.json(),
          trendRes.json(),
          mapelRes.json(),
          kelasRes.json(),
          breakdownRes.json(),
          remedialRes.json(),
        ]);

      setData({
        summary,
        distribution,
        trend,
        mapel,
        kelas,
        breakdown,
        remedial,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [f, routes, withQuery]);

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onApplyFilter = () => loadAll();
  const onResetFilter = () => {
    setF({
      id_tahun_ajaran: filters?.id_tahun_ajaran || "",
      semester: filters?.semester || "",
      id_kelas: "",
      id_mapel: "",
      guru: "",
      status: "",
    });
  };

  // Predikat donut data
  const predikatDonut = useMemo(() => {
    const p = data.breakdown?.predikat || {};
    return Object.entries(p)
      .filter(([_, v]) => v > 0)
      .map(([k, v]) => ({
        name: k,
        value: v,
        label: PREDIKAT_LABELS[k] || k,
      }));
  }, [data.breakdown]);

  const totalNilai = useMemo(() => {
    return predikatDonut.reduce((sum, d) => sum + d.value, 0);
  }, [predikatDonut]);

  // Summary cards data
  const cards = useMemo(() => {
    const s = data.summary || {};
    return [
      {
        label: "Total Penilaian",
        value: fmtNum(s.total_header || 0),
        sub: "Komponen Penilaian",
        icon: <ClipboardDocumentListIcon className="w-6 h-6" />,
        iconBg: "bg-blue-100 text-blue-600",
      },
      {
        label: "Nilai Dipublish",
        value: fmtNum(s.published || 0),
        sub: "Kelas",
        icon: <CheckCircleIcon className="w-6 h-6" />,
        iconBg: "bg-green-100 text-green-600",
      },
      {
        label: "Menunggu Validasi",
        value: fmtNum(s.pending || 0),
        sub: "Komponen",
        icon: <ClockIcon className="w-6 h-6" />,
        iconBg: "bg-amber-100 text-amber-600",
      },
      {
        label: "Belum Dipublish",
        value: fmtNum(s.draft || 0),
        sub: "Komponen",
        icon: <ExclamationCircleIcon className="w-6 h-6" />,
        iconBg: "bg-red-100 text-red-600",
      },
    ];
  }, [data.summary]);

  // Bar chart kelas data
  const kelasBarData = useMemo(() => {
    return (data.kelas || []).map((k) => ({
      name: k.nama_kelas || k.id_kelas,
      persen: toNumber(k.pass_rate_pct) || 0,
    }));
  }, [data.kelas]);

  // Tab definitions
  const tabs = [
    { key: "semua", label: "Semua Penilaian" },
    { key: "validasi", label: "Menunggu Validasi" },
    { key: "publish", label: "Dipublish" },
    { key: "belum", label: "Belum Dipublish" },
    { key: "arsip", label: "Diarsipkan" },
  ];

  // Sample table data (based on remedial queue or other available data)
  const tableData = useMemo(() => {
    let list = data.remedial || [];
    
    // Filter based on activeTab
    if (activeTab === "validasi") {
      list = list.filter(r => r.status === "Belum Dipublish");
    } else if (activeTab === "publish") {
      list = list.filter(r => r.status === "Dipublish");
    } else if (activeTab === "belum") {
      list = list.filter(r => r.status === "Belum Dipublish");
    } else if (activeTab === "arsip") {
      list = [];
    }

    return list.map((r, i) => ({
      no: i + 1,
      id_kelas: r.id_kelas,
      id_mapel: r.id_mapel,
      komponen: r.komponen || "—",
      mapel: r.nama_mapel || "—",
      kelas: r.nama_kelas || "—",
      guru: r.nama_guru || "—",
      tahunAjaran: r.tahun_ajaran || "—",
      semester: r.semester || "—",
      tanggal: r.tanggal || "—",
      status: r.status || "Belum Dipublish",
    }));
  }, [data.remedial, activeTab]);

  return (
    <div className="space-y-6">
      <Head title="Penilaian" />

      {/* ========== Header ========== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Penilaian</h1>
          <nav className="flex items-center gap-1 text-sm text-gray-500 mt-1">
            <Link href={route("admin.dashboard")} className="hover:text-blue-600">
              Dashboard
            </Link>
            <span>›</span>
            <span className="text-blue-600 font-medium">Penilaian</span>
          </nav>
        </div>
        <div className="relative">
          <button
            onClick={() => setExportOpen(!exportOpen)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            Export Laporan
            <ChevronDownIcon className="w-4 h-4" />
          </button>
          {exportOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border z-50 py-1">
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors">
                Export PDF
              </button>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors">
                Export Excel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========== Stat Cards ========== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-2xl ${card.iconBg}`}>{card.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500 font-medium">{card.label}</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{card.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
              </div>
            </div>
            <button className="flex items-center gap-1 text-blue-600 text-sm font-medium mt-4 hover:text-blue-700 transition-colors">
              Lihat detail <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* ========== Filter + Charts Row ========== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Filter Panel */}
        <div className="xl:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-gray-400" />
            Filter Data
          </h3>
          <div className="space-y-3">
            <FilterSelect
              label="Tahun Ajaran"
              value={f.id_tahun_ajaran}
              onChange={(v) => setF((s) => ({ ...s, id_tahun_ajaran: v }))}
              options={options.tahunAjaran || []}
            />
            <FilterSelect
              label="Semester"
              value={f.semester}
              onChange={(v) => setF((s) => ({ ...s, semester: v }))}
              options={options.semester || []}
            />
            <FilterSelect
              label="Kelas"
              value={f.id_kelas}
              onChange={(v) => setF((s) => ({ ...s, id_kelas: v }))}
              options={options.kelas || []}
              placeholder="Semua Kelas"
            />
            <FilterSelect
              label="Mata Pelajaran"
              value={f.id_mapel}
              onChange={(v) => setF((s) => ({ ...s, id_mapel: v }))}
              options={options.mapel || []}
              placeholder="Semua Mata Pelajaran"
            />
            <FilterSelect
              label="Guru"
              value={f.guru}
              onChange={(v) => setF((s) => ({ ...s, guru: v }))}
              options={options.guru || []}
              placeholder="Semua Guru"
            />
            <FilterSelect
              label="Status Penilaian"
              value={f.status}
              onChange={(v) => setF((s) => ({ ...s, status: v }))}
              options={[
                { value: "published", label: "Dipublish" },
                { value: "pending", label: "Menunggu Validasi" },
                { value: "draft", label: "Belum Dipublish" },
                { value: "archived", label: "Diarsipkan" },
              ]}
              placeholder="Semua Status"
            />
          </div>
          <div className="flex gap-2 mt-5">
            <button
              onClick={onApplyFilter}
              disabled={loading || !f.id_tahun_ajaran || !f.semester}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Memuat..." : "Filter"}
            </button>
            <button
              onClick={onResetFilter}
              className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Bar Chart - Persentase Ketuntasan Kelas */}
        <div className="xl:col-span-5 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-700 mb-4">
            Persentase Ketuntasan Kelas
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={kelasBarData}
                margin={{ top: 10, right: 10, bottom: 20, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 100]}
                />
                <Tooltip
                  formatter={(v) => [`${Number(v).toFixed(1)}%`, "Ketuntasan"]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                />
                <Bar dataKey="persen" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {kelasBarData.map((_, i) => (
                    <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <button className="flex items-center gap-1 text-blue-600 text-sm font-medium mt-2 hover:text-blue-700 transition-colors">
            Lihat laporan lengkap <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Donut Chart - Distribusi Predikat */}
        <div className="xl:col-span-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-700 mb-4">Distribusi Predikat</h3>
          <div className="flex items-center gap-4">
            <div className="relative w-44 h-44 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={predikatDonut}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {predikatDonut.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={PREDIKAT_COLORS[entry.name] || "#94a3b8"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v, name) => [v, PREDIKAT_LABELS[name] || name]}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-gray-800">
                  {fmtNum(totalNilai)}
                </span>
                <span className="text-xs text-gray-400">Total Nilai</span>
              </div>
            </div>
            {/* Legend */}
            <div className="flex-1 space-y-2">
              {predikatDonut.map((d) => {
                const percentage =
                  totalNilai > 0 ? ((d.value / totalNilai) * 100).toFixed(0) : 0;
                return (
                  <div key={d.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: PREDIKAT_COLORS[d.name] || "#94a3b8" }}
                      />
                      <span className="text-gray-600">{d.label}</span>
                    </div>
                    <span className="text-gray-500 font-medium tabular-nums">
                      {percentage}% ({fmtNum(d.value)})
                    </span>
                  </div>
                );
              })}
              {predikatDonut.length === 0 && (
                <p className="text-sm text-gray-400 italic">Belum ada data</p>
              )}
            </div>
          </div>
          <button className="flex items-center gap-1 text-blue-600 text-sm font-medium mt-4 hover:text-blue-700 transition-colors">
            Lihat detail predikat <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========== Tabs + Table ========== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {/* Tab bar + Button */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-100 px-5 pt-4 gap-3">
          <div className="flex items-center gap-0 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <Link
            href={route("admin.penilaian.nilai.index")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm mb-3 md:mb-0"
          >
            <PlusIcon className="w-4 h-4" />
            Tambah Penilaian
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">
                  No
                </th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">
                  Komponen Penilaian
                </th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">
                  Mata Pelajaran
                </th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">
                  Kelas
                </th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">
                  Guru
                </th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">
                  Tahun Ajaran
                </th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">
                  Semester
                </th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">
                  Tgl Input
                </th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">
                  Status
                </th>
                <th className="text-center px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tableData.length > 0 ? (
                tableData.map((row) => (
                  <tr
                    key={row.no}
                    className="hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="px-5 py-3 text-gray-600">{row.no}</td>
                    <td className="px-5 py-3 text-gray-800 font-medium">
                      {row.komponen}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{row.mapel}</td>
                    <td className="px-5 py-3 text-gray-600">{row.kelas}</td>
                    <td className="px-5 py-3 text-gray-600">{row.guru}</td>
                    <td className="px-5 py-3 text-gray-600">{row.tahunAjaran}</td>
                    <td className="px-5 py-3 text-gray-600">{row.semester}</td>
                    <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                      {row.tanggal}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                          STATUS_STYLES[row.status] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          href={route('admin.penilaian.nilai.index', { id_tahun_ajaran: row.tahunAjaran, semester: row.semester, id_kelas: row.id_kelas, id_mapel: row.id_mapel })}
                          className="p-1.5 rounded-lg hover:bg-blue-100 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Buka Daftar Nilai Kelas"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={10}
                    className="px-5 py-12 text-center text-gray-400"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <ClipboardDocumentListIcon className="w-10 h-10 text-gray-300" />
                      <p className="text-sm">
                        Belum ada data penilaian. Pilih filter terlebih dahulu.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {tableData.length > 0 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Menampilkan 1 - {tableData.length} dari {tableData.length} data
            </p>
            <div className="flex items-center gap-1">
              <button className="px-3 py-1.5 text-sm rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                ‹
              </button>
              <button className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white font-medium">
                1
              </button>
              <button className="px-3 py-1.5 text-sm rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                2
              </button>
              <button className="px-3 py-1.5 text-sm rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                3
              </button>
              <span className="px-2 text-gray-400">…</span>
              <button className="px-3 py-1.5 text-sm rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                ›
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Layout ---------- */
Dashboard.layout = (page) => (
  <AdminLayout user={page.props.auth.user} header="Penilaian">
    {page}
  </AdminLayout>
);

/* ---------- Filter Select Component ---------- */
function FilterSelect({
  label,
  value,
  onChange,
  options = [],
  placeholder = "— Pilih —",
}) {
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1.5 font-medium">
        {label}
      </label>
      <div className="relative">
        <select
          className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8 transition-colors"
          value={value || ""}
          onChange={(e) => onChange(e.target.value || "")}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}
