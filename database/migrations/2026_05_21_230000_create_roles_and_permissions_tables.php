<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Create tbl_roles table
        Schema::create('tbl_roles', function (Blueprint $table) {
            $table->id('id_role');
            $table->string('nama_role', 50)->unique();
            $table->string('deskripsi', 255)->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // 2. Create tbl_permissions table
        Schema::create('tbl_permissions', function (Blueprint $table) {
            $table->id('id_permission');
            $table->string('nama_permission', 100)->unique();
            $table->string('label_permission', 100);
            $table->string('grup', 50);
            $table->timestamps();
        });

        // 3. Create tbl_role_permission pivot table
        Schema::create('tbl_role_permission', function (Blueprint $table) {
            $table->foreignId('id_role')->constrained('tbl_roles', 'id_role')->onDelete('cascade');
            $table->foreignId('id_permission')->constrained('tbl_permissions', 'id_permission')->onDelete('cascade');
            $table->primary(['id_role', 'id_permission']);
        });

        // 4. Modify tbl_pengguna table to add id_role
        Schema::table('tbl_pengguna', function (Blueprint $table) {
            $table->foreignId('id_role')->nullable()->after('level')->constrained('tbl_roles', 'id_role')->onDelete('set null');
        });

        // 5. Seed default roles
        $roles = [
            [
                'nama_role' => 'Admin',
                'deskripsi' => 'Super Administrator dengan hak akses penuh ke seluruh sistem',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'nama_role' => 'Kepala Sekolah',
                'deskripsi' => 'Kepala Sekolah dengan hak akses monitoring dan laporan akademik',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'nama_role' => 'Guru',
                'deskripsi' => 'Pendidik/Guru dengan hak akses pembelajaran, tugas, materi, dan penilaian kelas',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'nama_role' => 'Siswa',
                'deskripsi' => 'Siswa dengan hak akses melihat jadwal, materi, tugas, dan mengumpulkan tugas',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'nama_role' => 'Orang Tua',
                'deskripsi' => 'Orang Tua/Wali dengan hak akses memantau perkembangan akademik anak',
                'created_at' => now(),
                'updated_at' => now()
            ],
        ];

        DB::table('tbl_roles')->insert($roles);

        // 6. Seed default permissions
        $permissions = [
            // Group: General / Dashboard
            ['nama_permission' => 'dashboard_view', 'label_permission' => 'Melihat Dashboard', 'grup' => 'General', 'created_at' => now(), 'updated_at' => now()],
            
            // Group: Siswa
            ['nama_permission' => 'siswa_view', 'label_permission' => 'Melihat Data Siswa', 'grup' => 'Siswa', 'created_at' => now(), 'updated_at' => now()],
            ['nama_permission' => 'siswa_manage', 'label_permission' => 'Mengelola Data Siswa', 'grup' => 'Siswa', 'created_at' => now(), 'updated_at' => now()],
            
            // Group: Guru
            ['nama_permission' => 'guru_view', 'label_permission' => 'Melihat Data Guru', 'grup' => 'Guru', 'created_at' => now(), 'updated_at' => now()],
            ['nama_permission' => 'guru_manage', 'label_permission' => 'Mengelola Data Guru', 'grup' => 'Guru', 'created_at' => now(), 'updated_at' => now()],
            
            // Group: Akademik
            ['nama_permission' => 'kelas_view', 'label_permission' => 'Melihat Data Kelas', 'grup' => 'Akademik', 'created_at' => now(), 'updated_at' => now()],
            ['nama_permission' => 'kelas_manage', 'label_permission' => 'Mengelola Data Kelas', 'grup' => 'Akademik', 'created_at' => now(), 'updated_at' => now()],
            ['nama_permission' => 'mapel_view', 'label_permission' => 'Melihat Mata Pelajaran', 'grup' => 'Akademik', 'created_at' => now(), 'updated_at' => now()],
            ['nama_permission' => 'mapel_manage', 'label_permission' => 'Mengelola Mata Pelajaran', 'grup' => 'Akademik', 'created_at' => now(), 'updated_at' => now()],
            ['nama_permission' => 'jadwal_view', 'label_permission' => 'Melihat Jadwal Mengajar', 'grup' => 'Akademik', 'created_at' => now(), 'updated_at' => now()],
            ['nama_permission' => 'jadwal_manage', 'label_permission' => 'Mengelola Jadwal Mengajar', 'grup' => 'Akademik', 'created_at' => now(), 'updated_at' => now()],
            
            // Group: Laporan
            ['nama_permission' => 'laporan_view', 'label_permission' => 'Melihat & Cetak Laporan', 'grup' => 'Laporan', 'created_at' => now(), 'updated_at' => now()],
            ['nama_permission' => 'laporan_manage', 'label_permission' => 'Mengatur Laporan Akademik', 'grup' => 'Laporan', 'created_at' => now(), 'updated_at' => now()],
            
            // Group: Pengaturan
            ['nama_permission' => 'pengaturan_view', 'label_permission' => 'Melihat Pengaturan Sistem', 'grup' => 'Pengaturan', 'created_at' => now(), 'updated_at' => now()],
            ['nama_permission' => 'pengaturan_manage', 'label_permission' => 'Mengubah Pengaturan Sistem', 'grup' => 'Pengaturan', 'created_at' => now(), 'updated_at' => now()],
            ['nama_permission' => 'role_permission_manage', 'label_permission' => 'Mengelola Role & Hak Akses', 'grup' => 'Pengaturan', 'created_at' => now(), 'updated_at' => now()],
        ];

        DB::table('tbl_permissions')->insert($permissions);

        // 7. Map existing users in tbl_pengguna to roles based on their current level
        $roleMapping = DB::table('tbl_roles')->pluck('id_role', 'nama_role')->toArray();

        foreach ($roleMapping as $roleName => $roleId) {
            DB::table('tbl_pengguna')
                ->where('level', $roleName)
                ->update(['id_role' => $roleId]);
        }

        // 8. Map permissions to default roles (except Admin which has superaccess bypassing pivot)
        $guruId = $roleMapping['Guru'] ?? null;
        $kasekId = $roleMapping['Kepala Sekolah'] ?? null;
        $siswaId = $roleMapping['Siswa'] ?? null;
        $ortuId = $roleMapping['Orang Tua'] ?? null;

        $allPermissions = DB::table('tbl_permissions')->pluck('id_permission', 'nama_permission')->toArray();

        // Permissions for Guru
        if ($guruId) {
            $guruPermissions = [
                'dashboard_view',
                'siswa_view',
                'kelas_view',
                'mapel_view',
                'jadwal_view',
                'laporan_view',
            ];
            foreach ($guruPermissions as $pName) {
                if (isset($allPermissions[$pName])) {
                    DB::table('tbl_role_permission')->insert([
                        'id_role' => $guruId,
                        'id_permission' => $allPermissions[$pName]
                    ]);
                }
            }
        }

        // Permissions for Kepala Sekolah
        if ($kasekId) {
            $kasekPermissions = [
                'dashboard_view',
                'siswa_view',
                'guru_view',
                'kelas_view',
                'mapel_view',
                'jadwal_view',
                'laporan_view',
                'pengaturan_view',
            ];
            foreach ($kasekPermissions as $pName) {
                if (isset($allPermissions[$pName])) {
                    DB::table('tbl_role_permission')->insert([
                        'id_role' => $kasekId,
                        'id_permission' => $allPermissions[$pName]
                    ]);
                }
            }
        }

        // Permissions for Siswa
        if ($siswaId) {
            $siswaPermissions = [
                'dashboard_view',
                'kelas_view',
                'mapel_view',
                'jadwal_view',
            ];
            foreach ($siswaPermissions as $pName) {
                if (isset($allPermissions[$pName])) {
                    DB::table('tbl_role_permission')->insert([
                        'id_role' => $siswaId,
                        'id_permission' => $allPermissions[$pName]
                    ]);
                }
            }
        }

        // Permissions for Orang Tua
        if ($ortuId) {
            $ortuPermissions = [
                'dashboard_view',
                'kelas_view',
                'mapel_view',
                'jadwal_view',
                'laporan_view',
            ];
            foreach ($ortuPermissions as $pName) {
                if (isset($allPermissions[$pName])) {
                    DB::table('tbl_role_permission')->insert([
                        'id_role' => $ortuId,
                        'id_permission' => $allPermissions[$pName]
                    ]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tbl_pengguna', function (Blueprint $table) {
            $table->dropForeign(['id_role']);
            $table->dropColumn('id_role');
        });

        Schema::dropIfExists('tbl_role_permission');
        Schema::dropIfExists('tbl_permissions');
        Schema::dropIfExists('tbl_roles');
    }
};
