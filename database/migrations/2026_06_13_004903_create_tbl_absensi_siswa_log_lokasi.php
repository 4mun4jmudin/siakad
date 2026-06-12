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
        Schema::create('tbl_absensi_siswa_log_lokasi', function (Blueprint $table) {
            $table->id();
            
            $table->string('id_siswa', 20);
            $table->foreign('id_siswa')->references('id_siswa')->on('tbl_siswa')->onDelete('cascade');
            
            $table->string('ip_address', 45)->nullable();
            
            $table->string('latitude', 50)->nullable();
            $table->string('longitude', 50)->nullable();
            $table->string('accuracy', 20)->nullable();
            $table->integer('distance_meters')->nullable();
            
            $table->enum('mode_absen', ['masuk', 'pulang'])->nullable();
            $table->integer('allowed_radius_meters')->nullable();
            $table->boolean('is_within_radius')->nullable();
            $table->unsignedBigInteger('gps_timestamp')->nullable();
            
            $table->text('client_user_agent')->nullable();
            
            $table->string('provider_name', 50)->nullable();
            $table->integer('risk_score')->nullable();
            $table->boolean('vpn_detected')->default(false);
            $table->boolean('proxy_detected')->default(false);
            $table->boolean('tor_detected')->default(false);
            $table->boolean('hosting_detected')->default(false);
            
            $table->json('network_meta')->nullable();
            $table->json('location_meta')->nullable();
            
            $table->text('risk_reason')->nullable();
            $table->boolean('is_valid')->default(true);
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_absensi_siswa_log_lokasi');
    }
};
