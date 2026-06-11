<!DOCTYPE html>
<html>
<head>
    <title>Rekapitulasi Nilai</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f3f4f6; }
        .header { text-align: center; margin-bottom: 30px; }
        .summary-box { border: 1px solid #ddd; padding: 15px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h2>Laporan Rekapitulasi Nilai</h2>
        <p>Tahun Ajaran: {{ $filters['id_tahun_ajaran'] ?? 'Semua' }} | Semester: {{ $filters['semester'] ?? 'Semua' }}</p>
    </div>

    <div class="summary-box">
        <strong>Ringkasan:</strong><br/>
        Total Penilaian: {{ $summary->total_header ?? 0 }}<br/>
        Rata-rata Sekolah: {{ isset($summary->avg_nilai) ? number_format($summary->avg_nilai, 2) : 0 }}<br/>
        Ketuntasan: {{ $summary->tuntas_pct ?? 0 }}%
    </div>

    <h3>Ketuntasan per Kelas</h3>
    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Kelas</th>
                <th>Rata-rata</th>
                <th>Ketuntasan (%)</th>
            </tr>
        </thead>
        <tbody>
            @foreach($kelas as $k)
            <tr>
                <td>{{ $loop->iteration }}</td>
                <td>{{ $k['nama_kelas'] ?? $k['id_kelas'] ?? '-' }}</td>
                <td>{{ $k['avg_nilai'] ?? 0 }}</td>
                <td>{{ $k['pass_rate_pct'] ?? 0 }}%</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <h3>Top Mata Pelajaran (Rata-rata Tertinggi)</h3>
    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Mata Pelajaran</th>
                <th>Rata-rata</th>
            </tr>
        </thead>
        <tbody>
            @foreach(array_slice($mapel, 0, 5) as $m)
            <tr>
                <td>{{ $loop->iteration }}</td>
                <td>{{ $m['nama_mapel'] ?? $m['id_mapel'] ?? '-' }}</td>
                <td>{{ $m['avg_nilai'] ?? 0 }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
