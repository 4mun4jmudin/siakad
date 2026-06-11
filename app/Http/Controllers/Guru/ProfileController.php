<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use App\Models\Pengaturan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function show()
    {
        /** @var User $user */
        $user = Auth::user();

        $guru = $user->guru;
        abort_unless($guru, 404, 'Data profil tidak ditemukan.');

        $guruArr = $guru->toArray();
        $fotoPath = $guru->foto_profil;

        $guruArr['foto_url'] = ($fotoPath && Storage::disk('public')->exists($fotoPath))
            ? url('/storage-public/' . ltrim($fotoPath, '/'))
            : null;

        return Inertia::render('Guru/Profile/Show', [
            'guru' => $guruArr,
            'account' => [
                'username' => $user->username ?? null,
                'email' => $user->email ?? null,
            ],
        ]);
    }

    public function update(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();

        $guru = $user->guru;
        abort_unless($guru, 404, 'Data profil tidak ditemukan.');

        $validator = Validator::make($request->all(), [
            'nama_lengkap' => ['required', 'string', 'max:255'],
            'nip' => ['nullable', 'string', 'max:50'],
            'no_telepon' => ['nullable', 'string', 'max:20'],
            'jenis_kelamin' => ['required', 'string', 'in:Laki-Laki,Laki-laki,Perempuan'],
            'tempat_lahir' => ['nullable', 'string', 'max:100'],
            'tanggal_lahir' => ['nullable', 'date'],
            'agama' => ['nullable', 'string', 'max:50'],
            'alamat' => ['nullable', 'string'],
            'file_foto' => ['nullable', 'image', 'mimes:jpeg,png,jpg', 'max:2048'],
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->with('error', 'Gagal memperbarui profil.')->withInput();
        }

        $validated = $validator->validated();

        $guru->nama_lengkap = $validated['nama_lengkap'];
        $guru->nip = $validated['nip'] ?? null;
        $guru->jenis_kelamin = $validated['jenis_kelamin'];
        $guru->tempat_lahir = $validated['tempat_lahir'] ?? null;
        $guru->tanggal_lahir = $validated['tanggal_lahir'] ?? null;
        $guru->agama = $validated['agama'] ?? null;
        $guru->no_telepon = $validated['no_telepon'] ?? null;
        $guru->alamat = $validated['alamat'] ?? null;

        if ($request->hasFile('file_foto')) {
            if ($guru->foto_profil && Storage::disk('public')->exists($guru->foto_profil)) {
                Storage::disk('public')->delete($guru->foto_profil);
            }

            $path = $request->file('file_foto')->store('profil_guru', 'public');
            $guru->foto_profil = $path;
        }

        $guru->save();

        return back()->with('success', 'Profil berhasil diperbarui.');
    }

    public function updateAccount(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();

        $table = $user->getTable();
        $pk = $user->getKeyName();
        $id = $user->getKey();

        $validator = Validator::make($request->all(), [
            'username' => [
                'required',
                'string',
                'min:4',
                'max:50',
                Rule::unique($table, 'username')->ignore($id, $pk),
            ],
            'email' => [
                'nullable',
                'email',
                'max:100',
                Rule::unique($table, 'email')->ignore($id, $pk),
            ],
        ], [
            'username.required' => 'Username wajib diisi.',
            'username.min' => 'Username minimal 4 karakter.',
            'username.unique' => 'Username sudah dipakai.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah dipakai.',
        ]);

        if ($validator->fails()) {
            $first = $validator->errors()->first() ?: 'Gagal memperbarui akun.';
            return back()
                ->withErrors($validator)
                ->with('error', $first)
                ->withInput();
        }

        $validated = $validator->validated();

        $user->username = $validated['username'];
        $user->email = $validated['email'] ?? null;
        $user->save();

        return back()->with('success', 'Akun berhasil diperbarui.');
    }

    public function updatePassword(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();

        $pengaturan = Pengaturan::query()->first();
        $minLen = (int)($pengaturan?->password_min_length ?? 8);
        if ($minLen < 8) $minLen = 8;

        $requireUpper = (int)($pengaturan?->password_require_upper ?? 0) === 1;

        $rules = [
            'current_password' => ['required', 'string'],
            'password' => array_values(array_filter([
                'required',
                'string',
                "min:$minLen",
                'confirmed',
                $requireUpper ? 'regex:/[A-Z]/' : null,
            ])),
        ];

        $messages = [
            'current_password.required' => 'Password lama wajib diisi.',
            'password.required' => 'Password baru wajib diisi.',
            'password.min' => "Password minimal {$minLen} karakter.",
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
            'password.regex' => 'Password harus mengandung minimal 1 huruf kapital (A-Z).',
        ];

        $validator = Validator::make($request->all(), $rules, $messages);

        if ($validator->fails()) {
            $first = $validator->errors()->first() ?: 'Gagal mengubah password.';
            return back()
                ->withErrors($validator)
                ->with('error', $first)
                ->withInput();
        }

        $data = $validator->validated();

        if (!Hash::check($data['current_password'], $user->password)) {
            return back()
                ->withErrors(['current_password' => 'Password lama salah.'])
                ->with('error', 'Password lama salah.');
        }

        $user->password = $data['password'];
        $user->save();

        return back()->with('success', 'Password berhasil diubah.');
    }
}
