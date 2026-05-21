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
        Schema::table('tbl_jurnal_mengajar', function (Blueprint $table) {
            $table->unsignedBigInteger('id_rencana_materi')->nullable()->after('status_mengajar');
            $table->foreign('id_rencana_materi')->references('id_rencana')->on('tbl_rencana_materi')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tbl_jurnal_mengajar', function (Blueprint $table) {
            $table->dropForeign(['id_rencana_materi']);
            $table->dropColumn('id_rencana_materi');
        });
    }
};
