<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // admin, manager, sales_staff, inventory_staff, customer
            $table->string('display_name');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('role_id')->nullable()->after('id');
            $table->string('phone')->nullable()->after('email');
            $table->string('avatar')->nullable();
        });

        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('image')->nullable();
            $table->foreignId('parent_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('contact_person')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->decimal('outstanding_balance', 12, 2)->default(0.00);
            $table->timestamps();
        });

        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->text('shipping_address')->nullable();
            $table->decimal('total_spend', 12, 2)->default(0.00);
            $table->integer('order_count')->default(0);
            $table->timestamps();
        });

        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->foreignId('supplier_id')->nullable()->constrained('suppliers')->nullOnDelete();
            $table->string('sku')->unique();
            $table->string('barcode')->nullable()->unique();
            $table->decimal('cost_price', 10, 2)->default(0.00);
            $table->decimal('selling_price', 10, 2)->default(0.00);
            $table->decimal('discount_price', 10, 2)->nullable();
            $table->integer('stock')->default(0);
            $table->integer('min_stock')->default(5);
            $table->integer('max_stock')->default(100);
            $table->enum('status', ['active', 'draft', 'archived'])->default('active');
            $table->boolean('is_featured')->default(false);
            $table->string('main_image')->nullable();
            $table->timestamps();
        });

        Schema::create('product_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->string('image_path');
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('product_variations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->string('name'); // e.g. "Color: Black, Size: L"
            $table->string('sku')->unique();
            $table->decimal('cost_price', 10, 2)->nullable();
            $table->decimal('selling_price', 10, 2)->nullable();
            $table->integer('stock')->default(0);
            $table->timestamps();
        });

        Schema::create('inventory_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('variation_id')->nullable()->constrained('product_variations')->nullOnDelete();
            $table->enum('type', ['receive', 'sale', 'return', 'adjustment', 'damaged', 'lost', 'manual_correction']);
            $table->integer('qty_change'); // positive for receive/return, negative for sale/damaged/lost
            $table->integer('previous_qty');
            $table->integer('new_qty');
            $table->string('reference')->nullable(); // e.g. ORD-10023 or PO-8812
            $table->text('notes')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('exact_timestamp')->useCurrent();
            $table->timestamps();
        });

        Schema::create('purchases', function (Blueprint $table) {
            $table->id();
            $table->string('purchase_number')->unique();
            $table->foreignId('supplier_id')->nullable()->constrained('suppliers')->nullOnDelete();
            $table->string('supplier_name'); // Support existing or new supplier advertising on the fly
            $table->string('supplier_representative')->nullable(); // Person who delivered/supplied
            $table->string('staff_receiver_name')->nullable(); // Staff member who verified and collected
            $table->decimal('total_amount', 12, 2)->default(0.00);
            $table->enum('status', ['pending', 'received', 'cancelled'])->default('pending');
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamp('received_at')->nullable();
            $table->timestamps();
        });

        Schema::create('purchase_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_id')->constrained('purchases')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('variation_id')->nullable()->constrained('product_variations')->nullOnDelete();
            $table->integer('qty_ordered');
            $table->integer('qty_received')->default(0);
            $table->decimal('cost_price', 10, 2);
            $table->decimal('subtotal', 12, 2);
            $table->timestamps();
        });

        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->string('customer_name');
            $table->string('customer_email')->nullable();
            $table->string('customer_phone')->nullable();
            $table->text('shipping_address')->nullable();
            $table->decimal('subtotal', 12, 2)->default(0.00);
            $table->decimal('discount_amount', 12, 2)->default(0.00);
            $table->decimal('total_amount', 12, 2)->default(0.00);
            $table->decimal('total_cost', 12, 2)->default(0.00); // For Profit Calculation
            $table->decimal('gross_profit', 12, 2)->default(0.00); // Revenue minus Cost
            $table->enum('payment_status', ['pending', 'paid', 'failed', 'refunded'])->default('pending');
            $table->enum('order_status', ['pending', 'paid', 'processing', 'ready', 'shipped', 'completed', 'cancelled', 'refunded'])->default('pending');
            $table->string('payment_method')->default('online_paystack'); // online_paystack, cash, card_pos, bank_transfer
            $table->string('transaction_reference')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete(); // Staff who created (if POS)
            $table->timestamps();
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('variation_id')->nullable()->constrained('product_variations')->nullOnDelete();
            $table->string('product_name');
            $table->decimal('price', 10, 2);
            $table->decimal('cost_price', 10, 2);
            $table->integer('quantity');
            $table->decimal('subtotal', 12, 2);
            $table->timestamps();
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->string('reference')->unique();
            $table->string('gateway')->default('paystack');
            $table->decimal('amount', 12, 2);
            $table->string('currency')->default('NGN');
            $table->string('status')->default('pending');
            $table->json('gateway_response')->nullable();
            $table->timestamps();
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('user_name')->default('System');
            $table->string('user_role')->default('System');
            $table->string('action'); // e.g. PRODUCT_CREATED, STOCK_ADJUSTED, ORDER_PAID
            $table->string('category'); // inventory, sales, order, product, auth
            $table->text('description');
            $table->string('entity_type')->nullable();
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->timestamp('exact_timestamp')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('purchase_items');
        Schema::dropIfExists('purchases');
        Schema::dropIfExists('inventory_movements');
        Schema::dropIfExists('product_variations');
        Schema::dropIfExists('product_images');
        Schema::dropIfExists('products');
        Schema::dropIfExists('customers');
        Schema::dropIfExists('suppliers');
        Schema::dropIfExists('categories');
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role_id', 'phone', 'avatar']);
        });
        Schema::dropIfExists('roles');
    }
};
