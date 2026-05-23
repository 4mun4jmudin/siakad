import React, { useMemo } from "react";
import { Head, Link, useForm, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Card, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";

/* =================== helpers angka AMAN =================== */
const toNumber = (v) => {
  if (typeof v === "number") return v;
  if (v === null || v === undefined) return NaN;
  const s = String(v).trim().replace(",", "."); // support comma decimal
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : NaN;
};

const fix2 = (v) => {
  const n = toNumber(v);
  return Number.isFinite(n) ? n.toFixed(2) : "—";
};

/* =================== Komponen Utama =================== */
function NilaiDetail({ header, details = [], komponenOptions = [] }) {
  // Rekap komponen (avg per komponen)
  const rekap = useMemo(() => {
    const by = {};
    for (const d of details) {
      const kId = d.id_komponen || 0;
      const kNama = d.komponen_penilaian?.nama || d.komponen || "-";
      if (!by[kNama]) by[kNama] = { total: 0, count: 0 };
      const n = toNumber(d.nilai);
      if (Number.isFinite(n)) {
        by[kNama].total += n;
        by[kNama].count += 1;
      }
    }
    
    return komponenOptions.map((k) => {
      const item = by[k.nama];
      const avg = item && item.count ? item.total / item.count : null;
      return { komponen: k.nama, rata: avg, jumlah: item?.count ?? 0 };
    });
  }, [details, komponenOptions]);

  // Form tambah detail
  const { data, setData, post, processing, reset, errors } = useForm({
    id_komponen: "",
    deskripsi: "",
    tanggal: "",
    nilai: "",
    bobot: "",
  });

  const submit = (e) => {
    e.preventDefault();
    if (header.status_kunci) return;
    
    post(route("admin.penilaian.nilai.detail.store", header.id_penilaian), {
      preserveScroll: true,
      onSuccess: () => reset("deskripsi", "tanggal", "nilai", "bobot"),
    });
  };

  const deleteDetail = (idDetail) => {
    if (header.status_kunci) return;
    if (confirm("Apakah Anda yakin ingin menghapus baris nilai ini?")) {
      router.delete(route("admin.penilaian.nilai.detail.destroy", idDetail), {
        preserveScroll: true,
      });
    }
  };

  const toggleLock = () => {
    router.post(route("admin.penilaian.nilai.toggle-lock", header.id_penilaian), {}, {
      preserveScroll: true,
    });
  };

  return (
    <div className="space-y-6">
      <Head title={`Detail Nilai - ${header?.nama_siswa}`} />

      <div>
        <h1 className="text-3xl font-bold text-gray-800">Detail Nilai Siswa</h1>
        <p className="text-gray-500 text-sm mt-1">Rincian nilai akademik lengkap dan kelulusan KKM</p>
      </div>

      {/* Lock status banner */}
      {header.status_kunci && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm flex items-center gap-2 shadow-sm">
          <span className="text-xl">🔒</span>
          <div>
            <strong>Penilaian Dikunci:</strong> Rincian nilai siswa ini telah dikunci oleh administrator. Segala bentuk penambahan, pengubahan, atau penghapusan nilai dinonaktifkan.
          </div>
        </div>
      )}

      {/* Header info */}
      <Card className="border border-slate-100 shadow-sm bg-white">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 pb-4 border-b border-slate-100">
            <div>
              <h1 className="text-lg font-semibold text-slate-800">Detail Penilaian Akademik</h1>
              <p className="text-xs text-slate-500">Informasi ringkas penilaian dan KKM target</p>
            </div>
            
            {/* Lock / Unlock Toggle Button */}
            <button
              onClick={toggleLock}
              className={`px-4 py-2 text-xs font-semibold rounded-lg shadow-sm transition-all duration-200 flex items-center gap-2 ${
                header.status_kunci
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }`}
            >
              {header.status_kunci ? "🔓 Buka Kunci Nilai" : "🔒 Kunci Penilaian"}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
            <Info label="Nama Siswa" value={header?.nama_siswa} />
            <Info label="Mata Pelajaran" value={header?.nama_mapel} />
            <Info label="Semester" value={header?.semester} />
            <Info label="KKM" value={header?.kkm ?? 75} />
            <Info 
              label="Nilai Akhir" 
              value={
                <span className={`font-bold ${header?.nilai_akhir >= (header?.kkm ?? 75) ? 'text-green-600' : 'text-red-600'}`}>
                  {fix2(header?.nilai_akhir)}
                </span>
              } 
            />
            <Info 
              label="Status Kelulusan" 
              value={
                header?.tuntas == null ? "—" : (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    header.tuntas ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {header.tuntas ? "Tuntas" : "Tidak Tuntas"}
                  </span>
                )
              } 
            />
          </div>
        </CardContent>
      </Card>

      {/* Rekap komponen */}
      <Card className="border border-slate-100 shadow-sm bg-white">
        <CardContent className="p-5">
          <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <span>📊</span> Rekap Komponen Penilaian
          </h2>
          <div className="overflow-x-auto rounded-lg border border-slate-100">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-100 text-slate-600 font-medium">
                  <Th text="Nama Komponen" />
                  <Th text="Jumlah Entri Nilai" center />
                  <Th text="Nilai Rata-rata" center />
                </tr>
              </thead>
              <tbody>
                {rekap.map((r) => (
                  <tr className="border-t border-slate-100 hover:bg-slate-50 transition-colors" key={r.komponen}>
                    <Td text={r.komponen} className="font-medium text-slate-700" />
                    <Td text={r.jumlah} center />
                    <Td text={
                      r.rata != null ? (
                        <span className={`font-semibold ${r.rata >= (header?.kkm ?? 75) ? 'text-green-600' : 'text-amber-600'}`}>
                          {fix2(r.rata)}
                        </span>
                      ) : "—"
                    } center />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Daftar detail */}
      <Card className="border border-slate-100 shadow-sm bg-white">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <span>📝</span> Rincian Nilai Detil
            </h2>
            <Link
              href={route("admin.penilaian.nilai.index")}
              className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium"
            >
              ← Kembali ke Daftar Nilai
            </Link>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-100">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-100 text-slate-600 font-medium">
                  <Th text="Tanggal Input" />
                  <Th text="Komponen" />
                  <Th text="Keterangan / Deskripsi" />
                  <Th text="Nilai" center />
                  <Th text="Bobot Lokal" center />
                  {!header.status_kunci && <Th text="Aksi" center />}
                </tr>
              </thead>
              <tbody>
                {details.length ? (
                  details.map((d) => (
                    <tr className="border-t border-slate-100 hover:bg-slate-50 transition-colors" key={d.id_detail}>
                      <Td text={d.tanggal ?? "—"} />
                      <Td text={d.komponen_penilaian?.nama ?? d.komponen} className="font-medium text-slate-700" />
                      <Td text={d.deskripsi ?? "—"} />
                      <Td text={
                        <span className={`font-semibold ${d.nilai >= (header?.kkm ?? 75) ? 'text-green-600' : 'text-amber-600'}`}>
                          {fix2(d.nilai)}
                        </span>
                      } center />
                      <Td text={d.bobot == null || d.bobot === "" ? "—" : `${fix2(d.bobot)}%`} center />
                      {!header.status_kunci && (
                        <td className="p-2 text-center">
                          <button
                            onClick={() => deleteDetail(d.id_detail)}
                            className="px-2 py-1 text-xs bg-red-50 text-red-600 border border-red-100 rounded hover:bg-red-100 hover:text-red-700 font-medium transition-colors"
                          >
                            Hapus
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="p-8 text-center text-slate-400 bg-slate-50/50" colSpan={header.status_kunci ? 5 : 6}>
                      Belum ada rincian nilai terdaftar untuk siswa ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Form tambah detail */}
      {!header.status_kunci && (
        <Card className="border border-slate-100 shadow-sm bg-white">
          <CardContent className="p-5">
            <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <span>➕</span> Tambah Rincian Nilai Baru
            </h2>
            <form onSubmit={submit} className="grid md:grid-cols-6 gap-3">
              <Select
                label="Komponen"
                value={data.id_komponen}
                onChange={(v) => setData("id_komponen", v)}
                options={komponenOptions.map((k) => ({ value: k.id_komponen, label: k.nama }))}
                error={errors.id_komponen}
              />
              <Input
                type="date"
                label="Tanggal Pelaksanaan"
                value={data.tanggal || ""}
                onChange={(v) => setData("tanggal", v)}
                error={errors.tanggal}
              />
              <Input
                type="text"
                label="Keterangan / Topik"
                placeholder="Mis: Ujian Bab 1"
                value={data.deskripsi}
                onChange={(v) => setData("deskripsi", v)}
                error={errors.deskripsi}
              />
              <Input
                type="number"
                step="0.01"
                label="Nilai Angka"
                placeholder="0 - 100"
                value={data.nilai}
                onChange={(v) => setData("nilai", v)}
                error={errors.nilai}
              />
              <Input
                type="number"
                step="0.01"
                label="Bobot Lokal (opsional)"
                placeholder="Mis: 10"
                value={data.bobot}
                onChange={(v) => setData("bobot", v)}
                error={errors.bobot}
              />
              <div className="flex items-end">
                <Button type="submit" disabled={processing} className="w-full bg-slate-800 hover:bg-slate-950 text-white font-medium h-[38px] rounded-lg">
                  {processing ? "Menyimpan..." : "Simpan Nilai"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* layout */
NilaiDetail.layout = (page) => (
  <AdminLayout user={page.props.auth.user} header="Detail Nilai Siswa">{page}</AdminLayout>
);

export default NilaiDetail;

/* =================== sub components =================== */
function Info({ label, value }) {
  return (
    <div className="p-3 bg-slate-50 border border-slate-100/50 rounded-lg">
      <div className="text-slate-400 text-xs mb-1 font-medium">{label}</div>
      <div className="font-semibold text-slate-700">{value ?? "—"}</div>
    </div>
  );
}
function Th({ text, center }) {
  return <th className={`p-3 text-slate-500 font-semibold ${center ? "text-center" : "text-left"}`}>{text}</th>;
}
function Td({ text, center, className = "" }) {
  return <td className={`p-3 text-slate-600 ${center ? "text-center" : "text-left"} ${className}`}>{text}</td>;
}

function Input({ label, type = "text", value, onChange, placeholder, step, error }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1">{label}</label>
      <input
        type={type}
        step={step}
        className={`w-full border rounded-lg px-3 py-2 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-800 transition-all ${error ? "border-red-500 bg-red-50/50" : "border-slate-200"}`}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {error ? <div className="text-xs text-red-600 mt-1">{error}</div> : null}
    </div>
  );
}
function Select({ label, value, onChange, options = [], error }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1">{label}</label>
      <select
        className={`w-full border rounded-lg px-3 py-2 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-800 transition-all ${error ? "border-red-500 bg-red-50/50" : "border-slate-200"}`}
        value={value || ""}
        onChange={(e) => onChange(e.target.value || "")}
      >
        <option value="">— Pilih —</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error ? <div className="text-xs text-red-600 mt-1">{error}</div> : null}
    </div>
  );
}
