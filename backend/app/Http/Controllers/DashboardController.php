<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Order;
use App\Models\InventoryMovement;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $totalRevenue = Order::whereIn('payment_status', ['paid', 'completed'])->sum('total_amount');
        $totalCost = Order::whereIn('payment_status', ['paid', 'completed'])->sum('total_cost');
        $estimatedProfit = $totalRevenue - $totalCost;
        $totalSalesCount = Order::whereIn('payment_status', ['paid', 'completed'])->count();

        $totalProducts = Product::where('status', 'active')->count();
        $totalInventoryValue = Product::where('status', 'active')->select(DB::raw('SUM(stock * cost_price) as total_val'))->value('total_val') ?? 0;
        
        $lowStockCount = Product::where('status', 'active')->where('stock', '>', 0)->whereColumn('stock', '<=', 'min_stock')->count();
        $criticalStockCount = Product::where('status', 'active')->where('stock', '>', 0)->where('stock', '<=', 2)->count();
        $outOfStockCount = Product::where('status', 'active')->where('stock', '<=', 0)->count();
        $pendingOrdersCount = Order::where('order_status', 'pending')->count();

        $stockHealthScore = 100;
        if ($totalProducts > 0) {
            $riskRatio = ($outOfStockCount + $criticalStockCount) / $totalProducts;
            $stockHealthScore -= min(40, round($riskRatio * 100));
        }

        $profitMargin = $totalRevenue > 0 ? round(($estimatedProfit / $totalRevenue) * 100, 1) : 0;

        $pulseScore = max(10, min(100, $stockHealthScore));
        $pulseLabel = $pulseScore >= 80 ? 'Healthy' : ($pulseScore >= 60 ? 'Attention Needed' : 'Critical Action Required');

        $actionItems = [];
        if ($criticalStockCount > 0) {
            $actionItems[] = [
                'id' => 'critical_stock',
                'severity' => 'critical',
                'title' => "{$criticalStockCount} products are critically low on stock.",
                'action_label' => 'Review Inventory',
                'link' => '/admin/inventory'
            ];
        }
        if ($outOfStockCount > 0) {
            $actionItems[] = [
                'id' => 'out_of_stock',
                'severity' => 'warning',
                'title' => "{$outOfStockCount} products are completely out of stock and hidden from storefront.",
                'action_label' => 'Restock Items',
                'link' => '/admin/inventory'
            ];
        }
        if ($pendingOrdersCount > 0) {
            $actionItems[] = [
                'id' => 'pending_orders',
                'severity' => 'info',
                'title' => "{$pendingOrdersCount} customer orders are awaiting processing.",
                'action_label' => 'Review Orders',
                'link' => '/admin/orders'
            ];
        }

        $recentSales = Order::orderBy('created_at', 'desc')->take(5)->get();

        $recentMovements = InventoryMovement::with(['product', 'user'])
            ->orderBy('exact_timestamp', 'desc')
            ->take(6)
            ->get();

        $fastMovers = Product::where('status', 'active')->orderBy('stock', 'asc')->take(5)->get();
        $slowMovers = Product::where('status', 'active')->orderBy('stock', 'desc')->take(5)->get();

        return response()->json([
            'metrics' => [
                'total_revenue' => (float)$totalRevenue,
                'estimated_profit' => (float)$estimatedProfit,
                'profit_margin' => $profitMargin,
                'total_sales_count' => $totalSalesCount,
                'total_inventory_value' => (float)$totalInventoryValue,
                'total_products' => $totalProducts,
                'low_stock_count' => $lowStockCount,
                'critical_stock_count' => $criticalStockCount,
                'out_of_stock_count' => $outOfStockCount,
                'pending_orders_count' => $pendingOrdersCount,
            ],
            'business_pulse' => [
                'score' => $pulseScore,
                'label' => $pulseLabel,
                'inventory_status' => $criticalStockCount == 0 ? 'Healthy' : 'Risk Identified',
                'sales_status' => 'Growing',
                'profitability_status' => 'Stable',
                'stock_risk_count' => $criticalStockCount + $outOfStockCount,
            ],
            'action_center' => $actionItems,
            'recent_sales' => $recentSales,
            'recent_movements' => $recentMovements,
            'fast_movers' => $fastMovers,
            'slow_movers' => $slowMovers,
        ]);
    }
}
