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
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('order_id');

            $table->foreignId('product_id')->nullable();
            $table->foreignId('product_listing_id')->nullable();

            $table->string('product_name_snapshot');

            $table->decimal('unit_price_snapshot', 10, 2);

            $table->integer('quantity');

            $table->decimal('subtotal_snapshot', 10, 2);

            $table->decimal('cost_snapshot', 10, 2)->nullable();

            $table->json('metadata_snapshot')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
