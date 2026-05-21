<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Data Siswa</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
        }
        h2 {
            text-align: center;
            margin-bottom: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #000;
            padding: 6px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
            text-align: center;
        }
        .text-center {
            text-align: center;
        }
    </style>
</head>
<body>

    <h2>Data Siswa</h2>

    <table>
        <thead>
            <tr>
                <th width="3%">No</th>
                <th width="8%">NIS</th>
                <th width="8%">NISN</th>
                <th width="20%">Nama Lengkap</th>
                <th width="5%">L/P</th>
                <th width="12%">Kelas</th>
                <th width="20%">Tempat, Tanggal Lahir</th>
                <th width="10%">Agama</th>
                <th width="14%">Status Kelengkapan</th>
            </tr>
        </thead>
        <tbody>
            @forelse($siswas as $index => $siswa)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td class="text-center">{{ $siswa->nis }}</td>
                    <td class="text-center">{{ $siswa->nisn }}</td>
                    <td>{{ $siswa->nama_lengkap }}</td>
                    <td class="text-center">{{ $siswa->jenis_kelamin === 'Laki-laki' ? 'L' : 'P' }}</td>
                    <td class="text-center">
                        @if($siswa->kelas)
                            {{ $siswa->kelas->tingkat }} {{ $siswa->kelas->jurusan }}
                        @else
                            -
                        @endif
                    </td>
                    <td>
                        {{ $siswa->tempat_lahir }}, 
                        {{ $siswa->tanggal_lahir ? date('d-m-Y', strtotime($siswa->tanggal_lahir)) : '-' }}
                    </td>
                    <td class="text-center">{{ $siswa->agama ?? '-' }}</td>
                    <td class="text-center">
                        {{ $siswa->kelengkapan_data ?? 0 }}% 
                        ({{ $siswa->is_data_lengkap ? 'Lengkap' : 'Belum' }})
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="9" class="text-center">Tidak ada data siswa</td>
                </tr>
            @endforelse
        </tbody>
    </table>

</body>
</html>
