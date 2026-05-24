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
        Schema::create('pc_build_items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('pc_build_id');

            $table->foreignId('product_id');
            $table->foreignId('product_listing_id')->nullable();

            $table->string('category_type');

            $table->integer('quantity')->default(1);
            $table->decimal('price_snapshot', 10, 2);

            $table->json('spec_snapshot')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pc_build_items');
    }
};
