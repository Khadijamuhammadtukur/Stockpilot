<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PurchaseController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\ReportController;

use App\Http\Controllers\DeliveryController;

Route::prefix('storefront')->group(function () {
    Route::get('/products', [ProductController::class, 'storefrontIndex']);
    Route::get('/products/{slug}', [ProductController::class, 'storefrontShow']);
    Route::post('/checkout', [OrderController::class, 'checkout']);
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/delivery-zones', [DeliveryController::class, 'deliveryZones']);
    Route::get('/tracking/{trackingNumber}', [DeliveryController::class, 'show']);
    
    Route::post('/paystack/initialize', [\App\Http\Controllers\PaystackController::class, 'initialize']);
    Route::get('/paystack/verify/{reference}', [\App\Http\Controllers\PaystackController::class, 'verify']);
});

Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/auth/user', [AuthController::class, 'user']);
Route::post('/auth/profile', [AuthController::class, 'updateProfile']);

Route::get('/admin/users', [AuthController::class, 'listStaff']);
Route::post('/admin/users', [AuthController::class, 'createStaff']);
Route::post('/admin/switch-user', [AuthController::class, 'switchUser']);

Route::get('/dashboard', [DashboardController::class, 'index']);

Route::get('/products', [ProductController::class, 'index']);
Route::post('/products', [ProductController::class, 'store']);
Route::put('/products/{id}', [ProductController::class, 'update']);
Route::post('/products/{id}/stock', [ProductController::class, 'adjustStock']);
Route::get('/products/{id}/performance', [ProductController::class, 'performanceProfile']);

Route::get('/orders', [OrderController::class, 'index']);
Route::get('/orders/{id}', [OrderController::class, 'show']);
Route::patch('/orders/{id}/status', [OrderController::class, 'updateStatus']);

Route::get('/deliveries', [DeliveryController::class, 'index']);
Route::get('/deliveries/my-deliveries', [DeliveryController::class, 'myDeliveries']);
Route::patch('/deliveries/{id}/status', [DeliveryController::class, 'updateStatus']);
Route::patch('/deliveries/{id}/assign', [DeliveryController::class, 'assignStaff']);
Route::get('/delivery-zones', [DeliveryController::class, 'allZones']);
Route::post('/delivery-zones', [DeliveryController::class, 'storeZone']);
Route::put('/delivery-zones/{id}', [DeliveryController::class, 'updateZone']);

Route::get('/purchases', [PurchaseController::class, 'index']);
Route::post('/purchases', [PurchaseController::class, 'store']);
Route::get('/suppliers', [SupplierController::class, 'index']);
Route::post('/suppliers', [SupplierController::class, 'store']);

Route::get('/categories', [CategoryController::class, 'index']);
Route::post('/categories', [CategoryController::class, 'store']);

Route::get('/reports/audit-logs', [ReportController::class, 'auditLogs']);
Route::get('/reports/profit', [ReportController::class, 'profitAnalytics']);
Route::get('/reports/daily-close', [ReportController::class, 'dailyCloseSummary']);
Route::post('/reports/daily-close', [ReportController::class, 'closeDailyRegister']);
Route::post('/reports/daily-close/reopen', [ReportController::class, 'reopenDailyRegister']);
