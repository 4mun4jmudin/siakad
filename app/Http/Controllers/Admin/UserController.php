<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{


    /**
     * Menampilkan daftar semua pengguna beserta statistik dan pencarian.
     */
    public function index(Request $request)
    {
        // Hitung Statistik Dasar
        $stats = [
            'total' => User::count(),
            'admin' => User::where('level', 'Admin')->count(),
            'kepala_sekolah' => User::where('level', 'Kepala Sekolah')->count(),
            'lainnya' => User::whereNotIn('level', ['Admin', 'Kepala Sekolah'])->count(),
        ];

        // Query pengguna dengan pencarian dan filter
        $users = User::query()
            ->when($request->input('search'), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('nama_lengkap', 'like', "%{$search}%")
                      ->orWhere('username', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($request->input('level'), function ($query, $level) {
                if ($level !== 'Semua') {
                    $query->where('level', $level);
                }
            })
            ->with(['guru', 'siswa', 'orangTuaWali']) // Load relasi untuk cek keterhubungan
            ->latest('id_pengguna')
            ->paginate(10)
            ->withQueryString();

        // Map status relasi agar frontend tahu jika user terhubung ke Guru/Siswa/OrangTua
        $users->through(function ($user) {
            $user->is_linked = $user->guru()->exists() || $user->siswa()->exists() || $user->orangTuaWali()->exists();
            $user->linked_to = null;

            if ($user->guru()->exists()) {
                $user->linked_to = 'Guru';
            } elseif ($user->siswa()->exists()) {
                $user->linked_to = 'Siswa';
            } elseif ($user->orangTuaWali()->exists()) {
                $user->linked_to = 'Orang Tua';
            }

            return $user;
        });

        return Inertia::render('admin/Users/Index', [
            'users' => $users,
            'stats' => $stats,
            'filters' => $request->only(['search', 'level']),
        ]);
    }

    /**
     * Menampilkan form untuk membuat user baru.
     */
    public function create()
    {
        return Inertia::render('admin/Users/Create', [
            'levels' => ['Admin', 'Kepala Sekolah', 'Guru', 'Siswa', 'Orang Tua'],
        ]);
    }

    /**
     * Menyimpan user baru ke database.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_lengkap' => 'required|string|max:100',
            'username' => 'required|string|max:50|alpha_dash|unique:tbl_pengguna,username',
            'email' => 'required|string|email|max:100|unique:tbl_pengguna,email',
            'password' => 'required|string|min:6|confirmed',
            'level' => 'required|in:Admin,Kepala Sekolah,Guru,Siswa,Orang Tua',
        ]);

        try {
            DB::beginTransaction();

            User::create([
                'nama_lengkap' => $validated['nama_lengkap'],
                'username' => $validated['username'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'level' => $validated['level'],
            ]);

            DB::commit();

            return redirect()->route('admin.users.index')
                ->with('success', 'User ' . $validated['nama_lengkap'] . ' berhasil ditambahkan.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Gagal menambahkan user baru: ' . $e->getMessage());
            return back()->with('error', 'Gagal menambahkan user baru. Silakan coba lagi.');
        }
    }

    /**
     * Menampilkan form untuk mengedit user.
     */
    public function edit(User $user)
    {
        // Hindari load password
        return Inertia::render('admin/Users/Edit', [
            'user' => $user,
            'levels' => ['Admin', 'Kepala Sekolah', 'Guru', 'Siswa', 'Orang Tua'],
        ]);
    }

    /**
     * Memperbarui data user di database.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'nama_lengkap' => 'required|string|max:100',
            'username' => [
                'required',
                'string',
                'max:50',
                'alpha_dash',
                Rule::unique('tbl_pengguna')->ignore($user->id_pengguna, 'id_pengguna')
            ],
            'email' => [
                'required',
                'string',
                'email',
                'max:100',
                Rule::unique('tbl_pengguna')->ignore($user->id_pengguna, 'id_pengguna')
            ],
            'password' => 'nullable|string|min:6|confirmed',
            'level' => 'required|in:Admin,Kepala Sekolah,Guru,Siswa,Orang Tua',
        ]);

        try {
            DB::beginTransaction();

            $updateData = [
                'nama_lengkap' => $validated['nama_lengkap'],
                'username' => $validated['username'],
                'email' => $validated['email'],
                'level' => $validated['level'],
            ];

            // Jika password diisi, lakukan update password
            if ($request->filled('password')) {
                $updateData['password'] = Hash::make($validated['password']);
            }

            $user->update($updateData);

            // Jika user terhubung dengan Guru/Siswa/OrangTua, sinkronisasikan nama lengkapnya
            if ($user->guru) {
                $user->guru->update(['nama_lengkap' => $validated['nama_lengkap']]);
            } elseif ($user->siswa) {
                $user->siswa->update(['nama_lengkap' => $validated['nama_lengkap']]);
            } elseif ($user->orangTuaWali) {
                $user->orangTuaWali->update(['nama_lengkap' => $validated['nama_lengkap']]);
            }

            DB::commit();

            return redirect()->route('admin.users.index')
                ->with('success', 'Data user ' . $user->username . ' berhasil diperbarui.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Gagal memperbarui user: ' . $e->getMessage());
            return back()->with('error', 'Gagal memperbarui user. Silakan coba lagi.');
        }
    }

    /**
     * Menghapus user secara aman (safety guards).
     */
    public function destroy(User $user)
    {
        // 1. Cek apakah menghapus diri sendiri
        if ($user->id_pengguna === Auth::id()) {
            return back()->with('error', 'Anda tidak dapat menghapus akun Anda sendiri yang sedang digunakan.');
        }

        // 2. Cek apakah terhubung dengan profil lain
        $isLinked = $user->guru()->exists() || $user->siswa()->exists() || $user->orangTuaWali()->exists();
        if ($isLinked) {
            $role = '';
            if ($user->guru()->exists()) {
                $role = 'Guru';
            } elseif ($user->siswa()->exists()) {
                $role = 'Siswa';
            } else {
                $role = 'Orang Tua/Wali';
            }

            return back()->with('error', "User ini terhubung ke profil {$role}. Silakan hapus melalui menu Manajemen {$role} agar data konsisten.");
        }

        try {
            DB::beginTransaction();
            
            $username = $user->username;
            $user->delete();

            DB::commit();

            return redirect()->route('admin.users.index')
                ->with('success', "Akun user @{$username} berhasil dihapus.");
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Gagal menghapus user: ' . $e->getMessage());
            return back()->with('error', 'Gagal menghapus user dari database.');
        }
    }
}
