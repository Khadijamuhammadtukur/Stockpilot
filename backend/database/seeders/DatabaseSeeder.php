<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use App\Models\Category;
use App\Models\Supplier;
use App\Models\Product;
use App\Models\InventoryMovement;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\AuditLog;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Roles
        $adminRole = Role::create(['name' => 'admin', 'display_name' => 'Administrator', 'description' => 'Full System Access']);
        $managerRole = Role::create(['name' => 'manager', 'display_name' => 'Store Manager', 'description' => 'Operations & Stock Supervision']);
        $salesRole = Role::create(['name' => 'sales_staff', 'display_name' => 'Sales Staff', 'description' => 'POS & Order Processing']);
        $inventoryRole = Role::create(['name' => 'inventory_staff', 'display_name' => 'Inventory Staff', 'description' => 'Stock Audit & Receiving']);
        $deliveryStaffRole = Role::create(['name' => 'delivery_staff', 'display_name' => 'Delivery Staff', 'description' => 'Courier & Dispatch Fulfillment']);
        $customerRole = Role::create(['name' => 'customer', 'display_name' => 'Customer', 'description' => 'Storefront Shopper']);

        // 2. Users
        $admin = User::create([
            'role_id' => $adminRole->id,
            'name' => 'Chief Operations',
            'email' => 'admin@stockpilot.com',
            'password' => Hash::make('password'),
            'phone' => '+234 801 234 5678',
        ]);

        User::create([
            'role_id' => $salesRole->id,
            'name' => 'Sarah Johnson',
            'email' => 'sarah@stockpilot.com',
            'password' => Hash::make('password'),
            'phone' => '+234 802 987 6543',
        ]);

        User::create([
            'role_id' => $deliveryStaffRole->id,
            'name' => 'David Courier',
            'email' => 'driver@stockpilot.com',
            'password' => Hash::make('password'),
            'phone' => '+234 803 555 7788',
        ]);

        // 2b. Delivery Zones
        \App\Models\DeliveryZone::create([
            'name' => 'Central Metro Zone',
            'city_region' => 'Metropolitan City Center',
            'standard_fee' => 1500.00,
            'express_fee' => 3000.00,
            'estimated_delivery_time' => '1-2 Business Days',
            'is_active' => true,
        ]);

        \App\Models\DeliveryZone::create([
            'name' => 'Suburban Express Zone',
            'city_region' => 'Greater Suburban Region',
            'standard_fee' => 2500.00,
            'express_fee' => 4500.00,
            'estimated_delivery_time' => '2-3 Business Days',
            'is_active' => true,
        ]);

        \App\Models\DeliveryZone::create([
            'name' => 'Regional Standard Zone',
            'city_region' => 'Outstation Regional State',
            'standard_fee' => 4000.00,
            'express_fee' => 7000.00,
            'estimated_delivery_time' => '3-5 Business Days',
            'is_active' => true,
        ]);

        // 3. Categories
        $electronics = Category::create(['name' => 'Electronics', 'slug' => 'electronics', 'description' => 'Gadgets, audio, and devices']);
        $fashion = Category::create(['name' => 'Fashion', 'slug' => 'fashion', 'description' => 'Apparel, shoes, and accessories']);
        $groceries = Category::create(['name' => 'Groceries', 'slug' => 'groceries', 'description' => 'Daily consumer goods']);

        // 4. Suppliers
        $supplier1 = Supplier::create([
            'name' => 'TechDistro West Africa',
            'contact_person' => 'Emmanuel Adebayo',
            'email' => 'orders@techdistro.ng',
            'phone' => '+234 803 111 2233',
            'address' => 'Victoria Island, Lagos, Nigeria'
        ]);

        $supplier2 = Supplier::create([
            'name' => 'Apex Fashion Hub',
            'contact_person' => 'Chioma Okeke',
            'email' => 'sales@apexfashion.com',
            'phone' => '+234 805 444 5566',
            'address' => 'Ikeja, Lagos, Nigeria'
        ]);

        // 5. Products
        $p1 = Product::create([
            'name' => 'Wireless Noise-Canceling Headphones',
            'slug' => 'wireless-noise-canceling-headphones',
            'category_id' => $electronics->id,
            'supplier_id' => $supplier1->id,
            'sku' => 'AUD-NC-001',
            'barcode' => '890123456789',
            'cost_price' => 25000.00,
            'selling_price' => 42000.00,
            'stock' => 15,
            'min_stock' => 5,
            'max_stock' => 50,
            'status' => 'active',
            'is_featured' => true,
            'main_image' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
            'description' => 'Premium over-ear wireless headphones with active noise cancellation and 30-hour battery life.',
        ]);

        $p2 = Product::create([
            'name' => 'Ultra-Slim 4K Smart TV Streamer',
            'slug' => 'ultra-slim-4k-smart-tv-streamer',
            'category_id' => $electronics->id,
            'supplier_id' => $supplier1->id,
            'sku' => 'ELC-TV-004',
            'barcode' => '890123456790',
            'cost_price' => 18000.00,
            'selling_price' => 29500.00,
            'stock' => 2, // Critical Stock!
            'min_stock' => 5,
            'max_stock' => 30,
            'status' => 'active',
            'is_featured' => true,
            'main_image' => 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&q=80',
            'description' => 'Fast 4K HDR streaming device with voice remote.',
        ]);

        $p3 = Product::create([
            'name' => 'Leather Executive Laptop Briefcase',
            'slug' => 'leather-executive-laptop-briefcase',
            'category_id' => $fashion->id,
            'supplier_id' => $supplier2->id,
            'sku' => 'FAS-LEA-009',
            'barcode' => '890123456791',
            'cost_price' => 30000.00,
            'selling_price' => 55000.00,
            'stock' => 0, // Out of Stock! (Demonstrates Intelligent Stock Visibility)
            'min_stock' => 3,
            'max_stock' => 20,
            'status' => 'active',
            'is_featured' => false,
            'main_image' => 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
            'description' => 'Handcrafted genuine leather messenger bag with padded 15.6" laptop compartment.',
        ]);

        $p4 = Product::create([
            'name' => 'Ergonomic Mechanical Gaming Keyboard',
            'slug' => 'ergonomic-mechanical-gaming-keyboard',
            'category_id' => $electronics->id,
            'supplier_id' => $supplier1->id,
            'sku' => 'ELC-KEY-012',
            'barcode' => '890123456792',
            'cost_price' => 15000.00,
            'selling_price' => 28000.00,
            'stock' => 24,
            'min_stock' => 5,
            'max_stock' => 60,
            'status' => 'active',
            'is_featured' => true,
            'main_image' => 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
            'description' => 'RGB backlit mechanical keyboard with tactile blue switches.',
        ]);

        // 6. Inventory Movements
        InventoryMovement::create([
            'product_id' => $p1->id,
            'type' => 'receive',
            'qty_change' => 20,
            'previous_qty' => 0,
            'new_qty' => 20,
            'reference' => 'PO-INIT-01',
            'notes' => 'Initial shipment received',
            'user_id' => $admin->id,
            'exact_timestamp' => now()->subDays(3),
        ]);

        InventoryMovement::create([
            'product_id' => $p1->id,
            'type' => 'sale',
            'qty_change' => -5,
            'previous_qty' => 20,
            'new_qty' => 15,
            'reference' => 'ORD-98214',
            'notes' => 'Storefront online sale',
            'user_id' => null,
            'exact_timestamp' => now()->subHours(5),
        ]);

        // 7. Audit Logs
        AuditLog::create([
            'user_id' => $admin->id,
            'user_name' => $admin->name,
            'user_role' => 'administrator',
            'action' => 'SYSTEM_INIT',
            'category' => 'auth',
            'description' => 'StockPilot Initialized with default settings & catalog.',
            'exact_timestamp' => now()->subDays(3),
        ]);
    }
}
