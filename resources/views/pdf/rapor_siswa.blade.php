<!DOCTYPE html>
<html>
<head>
    <title>Rapor Siswa - {{ $siswa->nama_lengkap }}</title>
    <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 12px; margin: 30px; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .header h2 { margin: 0; font-size: 20px; }
        .header p { margin: 5px 0 0 0; }
        .info-table { width: 100%; margin-bottom: 20px; }
        .info-table td { padding: 3px 0; }
        .info-table .label { width: 15%; font-weight: bold; }
        .nilai-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .nilai-table th, .nilai-table td { border: 1px solid #333; padding: 6px; }
        .nilai-table th { background-color: #f0f0f0; text-align: center; }
        .nilai-table .center { text-align: center; }
        .summary { margin-top: 20px; border: 1px solid #333; padding: 10px; }
        .signature { margin-top: 50px; width: 100%; }
        .signature td { text-align: center; width: 50%; }
    </style>
</head>
<body>
    <div class="header">
        <h2>LAPORAN HASIL BELAJAR SISWA</h2>
        <p>SMK NEGERI 1 CONTOH</p>
    </div>

    <table class="info-table">
        <tr>
            <td class="label">Nama Siswa</td>
            <td>: {{ $siswa->nama_lengkap }}</td>
            <td class="label">Kelas</td>
            <td>: {{ $kelas->id_kelas ?? '-' }}</td>
        </tr>
        <tr>
            <td class="label">NIS</td>
            <td>: {{ $siswa->nis ?? '-' }}</td>
            <td class="label">Semester</td>
            <td>: {{ $semester }}</td>
        </tr>
        <tr>
            <td class="label">Tahun Ajaran</td>
            <td>: {{ $tahun_ajaran }}</td>
            <td class="label"></td>
            <td></td>
        </tr>
    </table>

    <table class="nilai-table">
        <thead>
            <tr>
                <th rowspan="2" style="width: 5%">No</th>
                <th rowspan="2" style="width: 35%">Mata Pelajaran</th>
                <th rowspan="2" style="width: 15%">KKM</th>
                <th colspan="3">Nilai Akhir</th>
            </tr>
            <tr>
                <th>Angka</th>
                <th>Predikat</th>
                <th>Keterangan</th>
            </tr>
        </thead>
        <tbody>
            @foreach($nilai as $n)
            <tr>
                <td class="center">{{ $loop->iteration }}</td>
                <td>{{ $n->mapel->nama_mapel ?? $n->id_mapel }}</td>
                <td class="center">{{ $n->kkm ?? 75 }}</td>
                <td class="center">{{ $n->nilai_akhir }}</td>
                <td class="center">{{ $n->predikat }}</td>
                <td class="center">{{ $n->tuntas ? 'Tuntas' : 'Belum Tuntas' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="summary">
        <strong>Peringkat Kelas:</strong> {{ $rapor->peringkat_kelas ?? '-' }} dari {{ $total_siswa }} siswa<br/>
        <strong>Rata-rata Kelas:</strong> {{ isset($rapor->rata_rata) ? number_format($rapor->rata_rata, 2) : '-' }}
    </div>

    <table class="signature">
        <tr>
            <td>
                Mengetahui,<br/>
                Orang Tua / Wali<br/><br/><br/><br/>
                _________________________
            </td>
            <td>
                Wali Kelas<br/><br/><br/><br/>
                _________________________
            </td>
        </tr>
    </table>
</body>
</html>
