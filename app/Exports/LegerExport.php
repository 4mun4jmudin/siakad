<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class LegerExport implements FromArray, WithHeadings, WithTitle, ShouldAutoSize, WithStyles
{
    protected array $data;
    protected array $mapelHeaders;
    protected array $kelasInfo;

    public function __construct(array $data, array $mapelHeaders, array $kelasInfo)
    {
        $this->data = $data;
        $this->mapelHeaders = $mapelHeaders;
        $this->kelasInfo = $kelasInfo;
    }

    public function array(): array
    {
        return $this->data;
    }

    public function headings(): array
    {
        return array_merge(
            ['No', 'NIS', 'Nama Siswa'],
            $this->mapelHeaders,
            ['Rata-rata', 'Peringkat']
        );
    }

    public function title(): string
    {
        return 'Leger ' . ($this->kelasInfo['id_kelas'] ?? 'Kelas');
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1    => ['font' => ['bold' => true]],
        ];
    }
}
