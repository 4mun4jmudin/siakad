<?php

namespace App\Http\Controllers\OrangTua;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SwitchSiswaController extends Controller
{
    public function switch(Request $request)
    {
        $request->validate([
            'id_siswa' => 'required|string|exists:tbl_siswa,id_siswa'
        ]);

        $orangTua = Auth::user()->orangTuaWali;
        
        // Pastikan orang tua tersebut benar-benar wali dari siswa yang dipilih
        if (!$orangTua) {
            return back()->with('error', 'Akses ditolak.');
        }

        $validSiswa = $orangTua->siswas()->where('tbl_wali_siswa.id_siswa', $request->id_siswa)->exists();
        
        if ($validSiswa) {
            session(['active_id_siswa' => $request->id_siswa]);
            return back()->with('success', 'Berhasil beralih profil anak.');
        }

        return back()->with('error', 'Anak tidak ditemukan dalam daftar perwalian Anda.');
    }
}
