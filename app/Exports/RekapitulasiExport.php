<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Illuminate\Support\Collection;

class RekapitulasiExport implements FromCollection, WithHeadings, WithTitle, ShouldAutoSize
{
    protected array $data;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function collection()
    {
        return collect($this->data)->map(function ($item, $key) {
            return [
                $key + 1,
                $item['nama_kelas'] ?? $item['id_kelas'] ?? '-',
                $item['nama_mapel'] ?? $item['id_mapel'] ?? '-',
                $item['avg_nilai'] ?? 0,
                ($item['pass_rate_pct'] ?? 0) . '%',
            ];
        });
    }

    public function headings(): array
    {
        return [
            'No',
            'Kelas',
            'Mata Pelajaran',
            'Rata-rata Nilai',
            'Ketuntasan (%)',
        ];
    }

    public function title(): string
    {
        return 'Rekapitulasi Nilai';
    }
}
