import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import { Card, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import AdminLayout from "@/Layouts/AdminLayout";

function NilaiIndex({ options = {}, list = [] }) {
  const [f, setF] = useState({
    id_tahun_ajaran: "",
    semester: "",
    id_kelas: "",
    id_mapel: "",
  });

  const apply = (e) => {
    e?.preventDefault?.();
    router.get(route("admin.penilaian.nilai.index"), f, {
      preserveState: true,
      preserveScroll: true,
      replace: true,
    });
  };

  return (
    <div className="space-y-6">
      <Head title="Kelola Nilai" />
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Kelola Nilai</h1>
        <p className="text-gray-500 text-sm mt-1">Daftar Nilai Siswa per Kelas dan Mata Pelajaran</p>
      </div>

      <Card>
        <CardContent>
          <form onSubmit={apply} className="grid md:grid-cols-5 gap-3">
            <Select
              label="Tahun Ajaran"
              value={f.id_tahun_ajaran}
              onChange={(v) => setF((s) => ({ ...s, id_tahun_ajaran: v }))}
              options={(options.ta || []).map((t) => ({
                value: t.value ?? t.id_tahun_ajaran,
                label: t.label ?? t.tahun_ajaran,
              }))}
            />
            <Select
              label="Semester"
              value={f.semester}
              onChange={(v) => setF((s) => ({ ...s, semester: v }))}
              options={options.semester || []}
            />
            <Select
              label="Kelas"
              value={f.id_kelas}
              onChange={(v) => setF((s) => ({ ...s, id_kelas: v }))}
              options={(options.kelas || []).map((k) => ({
                value: k.value ?? k.id_kelas,
                label: k.label ?? k.id_kelas,
              }))}
            />
            <Select
              label="Mapel"
              value={f.id_mapel}
              onChange={(v) => setF((s) => ({ ...s, id_mapel: v }))}
              options={(options.mapel || []).map((m) => ({
                value: m.value ?? m.id_mapel,
                label: m.label ?? m.nama_mapel,
              }))}
            />
            <div className="flex items-end">
              <Button type="submit" className="w-full">Terapkan</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <Th text="NIS / Nama Siswa" />
                  <Th text="Mapel" />
                  <Th text="Nilai Akhir" center />
                  <Th text="Predikat" center />
                  <Th text="Tuntas" center />
                  <Th text="Status" center />
                  <Th text="Aksi" />
                </tr>
              </thead>
              <tbody>
                {list.length ? (
                  list.map((r) => (
                    <tr className="border-t" key={r.id_penilaian}>
                      <Td text={`${r.nis || "-"} / ${r.nama_siswa || r.id_siswa}`} />
                      <Td text={r.nama_mapel || r.id_mapel} />
                      <Td text={fmt2(r.nilai_akhir)} center />
                      <Td text={r.predikat || "—"} center />
                      <Td text={r.tuntas ? "Ya" : "Tidak"} center />
                      <td className="p-2 text-center">
                        {r.status_kunci ? (
                          <span className="px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded font-medium">
                            🔒 Dikunci
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded font-medium">
                            🔓 Aktif
                          </span>
                        )}
                      </td>
                      <td className="p-2">
                        <Link
                          href={route("admin.penilaian.nilai.detail.show", r.id_penilaian)}
                          className="px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
                        >
                          Detail
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td className="p-4 text-gray-500" colSpan={7}>Belum ada data.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* set layout */
NilaiIndex.layout = (page) => (
  <AdminLayout user={page.props.auth.user} header="Kelola Nilai">{page}</AdminLayout>
);

export default NilaiIndex;

/* ===== helper UI ===== */
function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1">{label}</label>
      <select
        className="w-full border rounded px-3 py-2"
        value={value || ""}
        onChange={(e) => onChange(e.target.value || "")}
      >
        <option value="">— Pilih —</option>
        {(options || []).map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
function Th({ text, center }) { return <th className={`p-2 ${center ? "text-center" : "text-left"}`}>{text}</th>; }
function Td({ text, center }) { return <td className={`p-2 ${center ? "text-center" : "text-left"}`}>{text}</td>; }
function fmt2(n) { return n == null ? "—" : Number(n).toFixed(2); }
