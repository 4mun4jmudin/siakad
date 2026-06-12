import subprocess
import re

# Get the original file content from git
result = subprocess.run(['git', 'show', 'HEAD:resources/js/Pages/Admin/Siswa/Show.jsx'], capture_output=True, text=True, encoding='utf-8')
if result.returncode != 0:
    print('Error getting file from git:', result.stderr)
    exit(1)

content = result.stdout

new_biodata_tab = """const BiodataTab = ({ siswa }) => {
  const dob = siswa.tanggal_lahir
    ? new Date(siswa.tanggal_lahir).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '-';

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Informasi Pribadi
        </h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <div><dt className="text-sm text-gray-500">Nama Panggilan</dt><dd className="mt-1 text-sm text-gray-900">{siswa.nama_panggilan || '-'}</dd></div>
          <div><dt className="text-sm text-gray-500">Jenis Kelamin</dt><dd className="mt-1 text-sm text-gray-900">{siswa.jenis_kelamin || '-'}</dd></div>
          <div><dt className="text-sm text-gray-500">NIK</dt><dd className="mt-1 text-sm text-gray-900">{siswa.nik || '-'}</dd></div>
          <div><dt className="text-sm text-gray-500">Nomor KK</dt><dd className="mt-1 text-sm text-gray-900">{siswa.nomor_kk || '-'}</dd></div>
          <div><dt className="text-sm text-gray-500">Tempat, Tanggal Lahir</dt><dd className="mt-1 text-sm text-gray-900">{siswa.tempat_lahir || '-'}, {dob}</dd></div>
          <div><dt className="text-sm text-gray-500">Agama</dt><dd className="mt-1 text-sm text-gray-900">{siswa.agama || '-'}</dd></div>
          
          <div className="sm:col-span-2">
            <dt className="text-sm text-gray-500">Alamat Lengkap</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {siswa.alamat_lengkap || '-'}
              {siswa.rt || siswa.rw ? ` RT ${siswa.rt || '-'} / RW ${siswa.rw || '-'}` : ''}
              {siswa.dusun ? `, Dusun ${siswa.dusun}` : ''}
              {siswa.kelurahan ? `, Kel. ${siswa.kelurahan}` : ''}
              {siswa.kecamatan ? `, Kec. ${siswa.kecamatan}` : ''}
              {siswa.kode_pos ? ` ${siswa.kode_pos}` : ''}
            </dd>
          </div>
          <div><dt className="text-sm text-gray-500">Jenis Tinggal</dt><dd className="mt-1 text-sm text-gray-900">{siswa.jenis_tinggal || '-'}</dd></div>
          <div><dt className="text-sm text-gray-500">Alat Transportasi</dt><dd className="mt-1 text-sm text-gray-900">{siswa.alat_transportasi || '-'}</dd></div>
          <div><dt className="text-sm text-gray-500">Jarak ke Sekolah</dt><dd className="mt-1 text-sm text-gray-900">{siswa.jarak_rumah_ke_sekolah || '-'}</dd></div>
          <div><dt className="text-sm text-gray-500">Titik Koordinat</dt><dd className="mt-1 text-sm text-gray-900">{siswa.lintang || '-'}, {siswa.bujur || '-'}</dd></div>
          
          <div><dt className="text-sm text-gray-500">Anak Ke</dt><dd className="mt-1 text-sm text-gray-900">{siswa.anak_ke || '-'}</dd></div>
          <div><dt className="text-sm text-gray-500">Jumlah Saudara</dt><dd className="mt-1 text-sm text-gray-900">{siswa.jumlah_saudara ?? '-'}</dd></div>
        </dl>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Kontak Pribadi & Fisik</h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <div><dt className="text-sm text-gray-500">Telepon</dt><dd className="mt-1 text-sm text-gray-900">{siswa.telepon_siswa || '-'}</dd></div>
          <div><dt className="text-sm text-gray-500">HP</dt><dd className="mt-1 text-sm text-gray-900">{siswa.hp_siswa || '-'}</dd></div>
          <div><dt className="text-sm text-gray-500">Email</dt><dd className="mt-1 text-sm text-gray-900">{siswa.email_siswa || '-'}</dd></div>
          <div><dt className="text-sm text-gray-500">Kebutuhan Khusus</dt><dd className="mt-1 text-sm text-gray-900">{siswa.kebutuhan_khusus || '-'}</dd></div>
          <div><dt className="text-sm text-gray-500">Berat Badan</dt><dd className="mt-1 text-sm text-gray-900">{siswa.berat_badan ? `${siswa.berat_badan} kg` : '-'}</dd></div>
          <div><dt className="text-sm text-gray-500">Tinggi Badan</dt><dd className="mt-1 text-sm text-gray-900">{siswa.tinggi_badan ? `${siswa.tinggi_badan} cm` : '-'}</dd></div>
          <div><dt className="text-sm text-gray-500">Lingkar Kepala</dt><dd className="mt-1 text-sm text-gray-900">{siswa.lingkar_kepala ? `${siswa.lingkar_kepala} cm` : '-'}</dd></div>
        </dl>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Dokumen & Kesejahteraan</h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <div><dt className="text-sm text-gray-500">SKHUN</dt><dd className="mt-1 text-sm text-gray-900">{siswa.skhun || '-'}</dd></div>
          <div><dt className="text-sm text-gray-500">No. Peserta UN</dt><dd className="mt-1 text-sm text-gray-900">{siswa.no_peserta_ujian_nasional || '-'}</dd></div>
          <div><dt className="text-sm text-gray-500">No. Seri Ijazah</dt><dd className="mt-1 text-sm text-gray-900">{siswa.no_seri_ijazah || '-'}</dd></div>
          <div><dt className="text-sm text-gray-500">No. Registrasi Akta Lahir</dt><dd className="mt-1 text-sm text-gray-900">{siswa.no_registrasi_akta_lahir || '-'}</dd></div>
          <div className="sm:col-span-2 border-t border-gray-100 my-2 pt-2"></div>
          <div><dt className="text-sm text-gray-500">KPS</dt><dd className="mt-1 text-sm text-gray-900">{siswa.penerima_kps || '-'} {siswa.no_kps ? `(${siswa.no_kps})` : ''}</dd></div>
          <div><dt className="text-sm text-gray-500">KIP</dt><dd className="mt-1 text-sm text-gray-900">{siswa.penerima_kip || '-'} {siswa.nomor_kip ? `(${siswa.nomor_kip})` : ''} {siswa.nama_di_kip ? `A/N: ${siswa.nama_di_kip}` : ''}</dd></div>
          <div><dt className="text-sm text-gray-500">KKS</dt><dd className="mt-1 text-sm text-gray-900">{siswa.nomor_kks || '-'}</dd></div>
          <div><dt className="text-sm text-gray-500">PIP</dt><dd className="mt-1 text-sm text-gray-900">{siswa.layak_pip || '-'} {siswa.alasan_layak_pip ? `(${siswa.alasan_layak_pip})` : ''}</dd></div>
          <div className="sm:col-span-2"><dt className="text-sm text-gray-500">Bank & Rekening</dt><dd className="mt-1 text-sm text-gray-900">{siswa.bank || '-'} {siswa.nomor_rekening_bank ? `- ${siswa.nomor_rekening_bank}` : ''} {siswa.rekening_atas_nama ? `A/N: ${siswa.rekening_atas_nama}` : ''}</dd></div>
        </dl>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Asal Sekolah</h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <div><dt className="text-sm text-gray-500">Sekolah Asal</dt><dd className="mt-1 text-sm text-gray-900">{siswa.sekolah_asal || '-'}</dd></div>
          <div><dt className="text-sm text-gray-500">Tahun Lulus</dt><dd className="mt-1 text-sm text-gray-900">{siswa.tahun_lulus || '-'}</dd></div>
        </dl>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Ayah</h3>
          <dl className="space-y-3">
            <div><dt className="text-sm text-gray-500">Nama Ayah</dt><dd className="mt-1 text-sm text-gray-900">{siswa.nama_ayah || '-'}</dd></div>
            <div><dt className="text-sm text-gray-500">NIK Ayah</dt><dd className="mt-1 text-sm text-gray-900">{siswa.nik_ayah || '-'}</dd></div>
            <div><dt className="text-sm text-gray-500">Tahun Lahir</dt><dd className="mt-1 text-sm text-gray-900">{siswa.tahun_lahir_ayah || '-'}</dd></div>
            <div><dt className="text-sm text-gray-500">Pendidikan</dt><dd className="mt-1 text-sm text-gray-900">{siswa.pendidikan_ayah || '-'}</dd></div>
            <div><dt className="text-sm text-gray-500">Pekerjaan</dt><dd className="mt-1 text-sm text-gray-900">{siswa.pekerjaan_ayah || '-'}</dd></div>
            <div><dt className="text-sm text-gray-500">Penghasilan</dt><dd className="mt-1 text-sm text-gray-900">{siswa.penghasilan_ayah || '-'}</dd></div>
          </dl>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Ibu</h3>
          <dl className="space-y-3">
            <div><dt className="text-sm text-gray-500">Nama Ibu</dt><dd className="mt-1 text-sm text-gray-900">{siswa.nama_ibu || '-'}</dd></div>
            <div><dt className="text-sm text-gray-500">NIK Ibu</dt><dd className="mt-1 text-sm text-gray-900">{siswa.nik_ibu || '-'}</dd></div>
            <div><dt className="text-sm text-gray-500">Tahun Lahir</dt><dd className="mt-1 text-sm text-gray-900">{siswa.tahun_lahir_ibu || '-'}</dd></div>
            <div><dt className="text-sm text-gray-500">Pendidikan</dt><dd className="mt-1 text-sm text-gray-900">{siswa.pendidikan_ibu || '-'}</dd></div>
            <div><dt className="text-sm text-gray-500">Pekerjaan</dt><dd className="mt-1 text-sm text-gray-900">{siswa.pekerjaan_ibu || '-'}</dd></div>
            <div><dt className="text-sm text-gray-500">Penghasilan</dt><dd className="mt-1 text-sm text-gray-900">{siswa.penghasilan_ibu || '-'}</dd></div>
          </dl>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Kontak Orang Tua / Wali</h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <div><dt className="text-sm text-gray-500">Nama Wali</dt><dd className="mt-1 text-sm text-gray-900">{siswa.nama_wali || '-'}</dd></div>
          <div><dt className="text-sm text-gray-500">No. HP Wali</dt><dd className="mt-1 text-sm text-gray-900">{siswa.no_hp_wali || '-'}</dd></div>
          <div><dt className="text-sm text-gray-500">NIK Wali</dt><dd className="mt-1 text-sm text-gray-900">{siswa.nik_wali || '-'}</dd></div>
          <div><dt className="text-sm text-gray-500">Tahun Lahir</dt><dd className="mt-1 text-sm text-gray-900">{siswa.tahun_lahir_wali || '-'}</dd></div>
          <div><dt className="text-sm text-gray-500">Pendidikan</dt><dd className="mt-1 text-sm text-gray-900">{siswa.pendidikan_wali || '-'}</dd></div>
          <div><dt className="text-sm text-gray-500">Pekerjaan</dt><dd className="mt-1 text-sm text-gray-900">{siswa.pekerjaan_wali || '-'}</dd></div>
          <div><dt className="text-sm text-gray-500">Penghasilan</dt><dd className="mt-1 text-sm text-gray-900">{siswa.penghasilan_wali || '-'}</dd></div>
          <div className="sm:col-span-2"><dt className="text-sm text-gray-500">Alamat Wali</dt><dd className="mt-1 text-sm text-gray-900">{siswa.alamat_wali || '-'}</dd></div>
        </dl>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Informasi Akademik
        </h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <dt className="text-sm text-gray-500">Wali Kelas</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {siswa.kelas?.wali_kelas?.nama_lengkap || 'Belum diatur'}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Kelas</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {siswa.kelas ? `${siswa.kelas.tingkat} ${siswa.kelas.jurusan}` : '-'}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Status</dt>
            <dd className="mt-1">
              <StatusBadge status={siswa.status} />
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};"""

pattern = r'const BiodataTab = \(\{ siswa \}\) => \{.*?^};\n'
replaced_content = re.sub(pattern, new_biodata_tab + '\n', content, flags=re.DOTALL | re.MULTILINE)

if replaced_content == content:
    print('Regex failed to match BiodataTab.')
    exit(1)

with open('resources/js/Pages/Admin/Siswa/Show.jsx', 'w', encoding='utf-8') as f:
    f.write(replaced_content)

print('Successfully restored and updated Show.jsx')
