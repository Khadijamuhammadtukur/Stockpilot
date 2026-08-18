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

// Public Storefront Endpoints
Route::prefix('storefront')->group(function () {
    Route::get('/products', [ProductController::class, 'storefrontIndex']);
    Route::get('/products/{slug}', [ProductController::class, 'storefrontShow']);
    Route::post('/checkout', [OrderController::class, 'checkout']);
    Route::get('/categories', [CategoryController::class, 'index']);
    
    // Paystack Online Payment Integration
    Route::post('/paystack/initialize', [\App\Http\Controllers\PaystackController::class, 'initialize']);
    Route::get('/paystack/verify/{reference}', [\App\Http\Controllers\PaystackController::class, 'verify']);
});

// Authentication & Profile Endpoints
Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/auth/user', [AuthController::class, 'user']);
Route::post('/auth/profile', [AuthController::class, 'updateProfile']);

// Staff Account Management & Admin User Switching
Route::get('/admin/users', [AuthController::class, 'listStaff']);
Route::post('/admin/users', [AuthController::class, 'createStaff']);
Route::post('/admin/switch-user', [AuthController::class, 'switchUser']);

// Protected / Admin & Portal Endpoints
Route::get('/dashboard', [DashboardController::class, 'index']);

// Product Management & Stock Adjustment
Route::get('/products', [ProductController::class, 'index']);
Route::post('/products', [ProductController::class, 'store']);
Route::put('/products/{id}', [ProductController::class, 'update']);
Route::post('/products/{id}/stock', [ProductController::class, 'adjustStock']);
Route::get('/products/{id}/performance', [ProductController::class, 'performanceProfile']);

// Orders & Sales Management
Route::get('/orders', [OrderController::class, 'index']);
Route::get('/orders/{id}', [OrderController::class, 'show']);
Route::patch('/orders/{id}/status', [OrderController::class, 'updateStatus']);

// Purchase Orders & Suppliers
Route::get('/purchases', [PurchaseController::class, 'index']);
Route::post('/purchases', [PurchaseController::class, 'store']);
Route::get('/suppliers', [SupplierController::class, 'index']);
Route::post('/suppliers', [SupplierController::class, 'store']);

// Categories
Route::get('/categories', [CategoryController::class, 'index']);
Route::post('/categories', [CategoryController::class, 'store']);

// Audit Trail & Business Reports
Route::get('/reports/audit-logs', [ReportController::class, 'auditLogs']);
Route::get('/reports/profit', [ReportController::class, 'profitAnalytics']);
Route::get('/reports/daily-close', [ReportController::class, 'dailyCloseSummary']);
Route::post('/reports/daily-close', [ReportController::class, 'closeDailyRegister']);
Route::post('/reports/daily-close/reopen', [ReportController::class, 'reopenDailyRegister']);
