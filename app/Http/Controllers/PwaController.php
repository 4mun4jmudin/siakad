<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pengaturan;

class PwaController extends Controller
{
    public function manifest()
    {
        $pengaturan = Pengaturan::first();
        $appName = $pengaturan->nama_sekolah ?? 'Siakad';
        $logoUrl = $pengaturan->logo_url ? asset($pengaturan->logo_url) : asset('images/l.png');
        
        $manifest = [
            'name' => $appName,
            'short_name' => 'Siakad',
            'description' => 'Sistem Informasi Akademik Sekolah',
            'start_url' => '/?source=pwa',
            'display' => 'standalone',
            'background_color' => '#ffffff',
            'theme_color' => '#4f46e5',
            'icons' => [
                [
                    'src' => url('/pwa-icon/192'),
                    'sizes' => '192x192',
                    'type' => 'image/png',
                    'purpose' => 'any maskable'
                ],
                [
                    'src' => url('/pwa-icon/512'),
                    'sizes' => '512x512',
                    'type' => 'image/png',
                    'purpose' => 'any maskable'
                ]
            ]
        ];

        return response()->json($manifest);
    }

    public function icon($size)
    {
        $pengaturan = Pengaturan::first();
        $logoPath = public_path('images/l.png');
        
        if ($pengaturan && $pengaturan->logo_url) {
            $cleanedUrl = ltrim($pengaturan->logo_url, '/');
            $dbPath = public_path($cleanedUrl);
            
            if (file_exists($dbPath)) {
                $logoPath = $dbPath;
            } else {
                // Handle both "storage/" and "storage-public/" prefixes
                $storageRelative = $cleanedUrl;
                if (str_starts_with($storageRelative, 'storage-public/')) {
                    $storageRelative = substr($storageRelative, strlen('storage-public/'));
                } elseif (str_starts_with($storageRelative, 'storage/')) {
                    $storageRelative = substr($storageRelative, strlen('storage/'));
                }
                
                $directStoragePath = storage_path('app/public/' . ltrim($storageRelative, '/'));
                if (file_exists($directStoragePath)) {
                    $logoPath = $directStoragePath;
                }
            }
        }

        $size = (int) $size;
        if (!in_array($size, [192, 512])) {
            $size = 192;
        }

        $extension = strtolower(pathinfo($logoPath, PATHINFO_EXTENSION));

        if ($extension === 'svg') {
            return response()->file($logoPath, ['Content-Type' => 'image/svg+xml']);
        }

        $sourceImage = null;
        if ($extension === 'png') {
            $sourceImage = @imagecreatefrompng($logoPath);
        } elseif (in_array($extension, ['jpg', 'jpeg'])) {
            $sourceImage = @imagecreatefromjpeg($logoPath);
        } elseif ($extension === 'webp') {
            $sourceImage = @imagecreatefromwebp($logoPath);
        }

        if (!$sourceImage) {
            abort(404);
        }

        $srcWidth = imagesx($sourceImage);
        $srcHeight = imagesy($sourceImage);

        $canvas = imagecreatetruecolor($size, $size);
        
        imagealphablending($canvas, false);
        imagesavealpha($canvas, true);
        $transparent = imagecolorallocatealpha($canvas, 255, 255, 255, 127);
        imagefill($canvas, 0, 0, $transparent);

        $ratio = min($size / $srcWidth, $size / $srcHeight);
        $newWidth = (int) ($srcWidth * $ratio);
        $newHeight = (int) ($srcHeight * $ratio);

        $dstX = (int) (($size - $newWidth) / 2);
        $dstY = (int) (($size - $newHeight) / 2);

        imagecopyresampled(
            $canvas, $sourceImage,
            $dstX, $dstY,
            0, 0,
            $newWidth, $newHeight,
            $srcWidth, $srcHeight
        );

        ob_start();
        imagepng($canvas);
        $imageString = ob_get_clean();

        imagedestroy($sourceImage);
        imagedestroy($canvas);

        return response($imageString)->header('Content-Type', 'image/png');
    }
}
