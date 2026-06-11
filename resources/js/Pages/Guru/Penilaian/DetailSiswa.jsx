import React, { useMemo, useState } from "react";
import { Head, Link, useForm, router } from "@inertiajs/react";
import GuruLayout from "@/Layouts/GuruLayout";
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
function NilaiDetailSiswa({ header, details = [], komponenOptions = [] }) {
  const [editingId, setEditingId] = useState(null);

  // Rekap komponen (avg per komponen)
  const rekap = useMemo(() => {
    const by = {};
    for (const d of details) {
      const kId = d.id_komponen || 0;
      const kNama = d.komponen_penilaian?.nama || "-";
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

  // Form edit detail
  const editForm = useForm({
    id_komponen: "",
    deskripsi: "",
    tanggal: "",
    nilai: "",
    bobot: "",
  });

  const isLocked = header.status_kunci;

  const submit = (e) => {
    e.preventDefault();
    if (isLocked) return;
    
    post(route("guru.penilaian.detail.store", header.id_penilaian), {
      preserveScroll: true,
      onSuccess: () => reset("deskripsi", "tanggal", "nilai", "bobot"),
    });
  };

  const deleteDetail = (idDetail) => {
    if (isLocked) return;
    if (confirm("Apakah Anda yakin ingin menghapus baris nilai ini?")) {
      router.delete(route("guru.penilaian.detail.destroy", idDetail), {
        preserveScroll: true,
      });
    }
  };

  const startEdit = (d) => {
    if (isLocked) return;
    setEditingId(d.id_detail);
    editForm.setData({
      id_komponen: d.id_komponen || "",
      deskripsi: d.deskripsi || "",
      tanggal: d.tanggal || "",
      nilai: d.nilai ?? "",
      bobot: d.bobot ?? "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    editForm.reset();
  };

  const submitEdit = (e, idDetail) => {
    e.preventDefault();
    if (isLocked) return;
    editForm.put(route("guru.penilaian.detail.update", idDetail), {
      preserveScroll: true,
      onSuccess: () => {
        setEditingId(null);
        editForm.reset();
      },
    });
  };

  return (
    <div className="space-y-6">
      <Head title={`Detail Nilai - ${header?.nama_siswa}`} />

      <div>
        <h1 className="text-3xl font-bold text-slate-800">Input Nilai Siswa</h1>
        <p className="text-slate-500 text-sm mt-1">Masukkan rincian nilai berdasarkan komponen penilaian</p>
      </div>

      {/* Lock status banner */}
      {isLocked && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm flex items-center gap-2 shadow-sm">
          <span className="text-xl">🔒</span>
          <div>
            <strong>Penilaian Dikunci:</strong> Rincian nilai siswa ini telah dikunci oleh administrator. Segala bentuk penambahan, pengubahan, atau penghapusan nilai tidak dapat dilakukan. Hubungi administrator jika ada kesalahan.
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
            
            <Link
              href={route('guru.penilaian.showKelas', [header.id_kelas, header.id_mapel])}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1"
            >
              &larr; Kembali ke Daftar Siswa
            </Link>
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
                  {!isLocked && <Th text="Aksi" center />}
                </tr>
              </thead>
              <tbody>
                {details.length ? (
                  details.map((d) => (
                    editingId === d.id_detail ? (
                      /* ====== Inline Edit Row ====== */
                      <tr className="border-t border-indigo-100 bg-indigo-50/30" key={d.id_detail}>
                        <td className="p-2">
                          <input
                            type="date"
                            className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                            value={editForm.data.tanggal || ""}
                            onChange={(e) => editForm.setData("tanggal", e.target.value)}
                          />
                        </td>
                        <td className="p-2">
                          <select
                            className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                            value={editForm.data.id_komponen || ""}
                            onChange={(e) => editForm.setData("id_komponen", e.target.value || "")}
                          >
                            <option value="">— Pilih —</option>
                            {komponenOptions.map((k) => (
                              <option key={k.id_komponen} value={k.id_komponen}>{k.nama}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                            value={editForm.data.deskripsi}
                            onChange={(e) => editForm.setData("deskripsi", e.target.value)}
                            placeholder="Deskripsi"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            step="0.01"
                            className="w-20 border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-center bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                            value={editForm.data.nilai}
                            onChange={(e) => editForm.setData("nilai", e.target.value)}
                          />
                          {editForm.errors.nilai && <div className="text-xs text-red-500 mt-0.5">{editForm.errors.nilai}</div>}
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            step="0.01"
                            className="w-16 border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-center bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                            value={editForm.data.bobot}
                            onChange={(e) => editForm.setData("bobot", e.target.value)}
                          />
                        </td>
                        <td className="p-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={(e) => submitEdit(e, d.id_detail)}
                              disabled={editForm.processing}
                              className="px-2 py-1 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium transition-colors disabled:opacity-50"
                            >
                              {editForm.processing ? "..." : "Simpan"}
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="px-2 py-1 text-xs bg-slate-100 text-slate-600 border border-slate-200 rounded-md hover:bg-slate-200 font-medium transition-colors"
                            >
                              Batal
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      /* ====== Normal Display Row ====== */
                      <tr className="border-t border-slate-100 hover:bg-slate-50 transition-colors" key={d.id_detail}>
                        <Td text={d.tanggal ?? "—"} />
                        <Td text={d.komponen_penilaian?.nama ?? "—"} className="font-medium text-slate-700" />
                        <Td text={d.deskripsi ?? "—"} />
                        <Td text={
                          <span className={`font-semibold ${d.nilai >= (header?.kkm ?? 75) ? 'text-green-600' : 'text-amber-600'}`}>
                            {fix2(d.nilai)}
                          </span>
                        } center />
                        <Td text={d.bobot == null || d.bobot === "" ? "—" : `${fix2(d.bobot)}%`} center />
                        {!isLocked && (
                          <td className="p-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => startEdit(d)}
                                className="px-2 py-1 text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 rounded hover:bg-indigo-100 hover:text-indigo-700 font-medium transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteDetail(d.id_detail)}
                                className="px-2 py-1 text-xs bg-red-50 text-red-600 border border-red-100 rounded hover:bg-red-100 hover:text-red-700 font-medium transition-colors"
                              >
                                Hapus
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    )
                  ))
                ) : (
                  <tr>
                    <td className="p-8 text-center text-slate-400 bg-slate-50/50" colSpan={isLocked ? 5 : 6}>
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
      {!isLocked && (
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
NilaiDetailSiswa.layout = (page) => (
  <GuruLayout user={page.props.auth.user} header="Detail Nilai Siswa">{page}</GuruLayout>
);

export default NilaiDetailSiswa;

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
