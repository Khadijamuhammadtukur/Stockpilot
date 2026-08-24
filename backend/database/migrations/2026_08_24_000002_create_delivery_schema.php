<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Delivery Zones
        Schema::create('delivery_zones', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('city_region');
            $table->decimal('standard_fee', 10, 2)->default(0.00);
            $table->decimal('express_fee', 10, 2)->default(0.00);
            $table->string('estimated_delivery_time')->default('1-3 Business Days');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Deliveries
        Schema::create('deliveries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->string('delivery_method')->default('standard'); // standard, express, pickup
            $table->foreignId('delivery_zone_id')->nullable()->constrained('delivery_zones')->nullOnDelete();
            $table->decimal('delivery_fee', 10, 2)->default(0.00);
            $table->string('tracking_number')->unique();
            $table->string('delivery_status')->default('pending');
            // pending, processing, ready_for_dispatch, dispatched, in_transit, out_for_delivery, delivered, delivery_failed, cancelled, returned
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('estimated_delivery_date')->nullable();
            $table->timestamp('dispatched_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 3. Delivery Addresses
        Schema::create('delivery_addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('delivery_id')->nullable()->constrained('deliveries')->cascadeOnDelete();
            $table->string('recipient_name');
            $table->string('phone');
            $table->string('email')->nullable();
            $table->text('address');
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('landmark')->nullable();
            $table->text('delivery_notes')->nullable();
            $table->timestamps();
        });

        // 4. Delivery Status History Timeline
        Schema::create('delivery_status_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('delivery_id')->constrained('deliveries')->cascadeOnDelete();
            $table->string('status');
            $table->text('note')->nullable();
            $table->foreignId('changed_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('changed_by_name')->default('System');
            $table->timestamp('exact_timestamp')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('delivery_status_histories');
        Schema::dropIfExists('delivery_addresses');
        Schema::dropIfExists('deliveries');
        Schema::dropIfExists('delivery_zones');
    }
};
