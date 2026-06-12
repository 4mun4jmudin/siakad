<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tbl_siswa_live_locations', function (Blueprint $table) {
            $table->id();
            $table->string('id_siswa', 20);
            $table->string('latitude', 50)->nullable();
            $table->string('longitude', 50)->nullable();
            $table->string('accuracy', 20)->nullable();
            $table->integer('distance_meters')->nullable();
            $table->string('status', 30)->default('online');
            $table->boolean('is_online')->default(true);
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->json('network_meta')->nullable();
            $table->json('location_meta')->nullable();
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamps();

            $table->foreign('id_siswa')->references('id_siswa')->on('tbl_siswa')->onDelete('cascade');

            $table->index('id_siswa');
            $table->index('last_seen_at');
            $table->index('status');
            $table->index('is_online');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_siswa_live_locations');
    }
};
