<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Order;
use App\Models\Product;
use App\Models\InventoryMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function auditLogs(Request $request)
    {
        $query = AuditLog::query();

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('user_name', 'like', "%{$search}%")
                  ->orWhere('action', 'like', "%{$search}%");
            });
        }

        return response()->json($query->orderBy('exact_timestamp', 'desc')->paginate(20));
    }

    public function profitAnalytics(Request $request)
    {
        $query = Order::whereIn('payment_status', ['paid', 'completed']);

        $timeframe = $request->get('timeframe', 'all');
        if ($timeframe === 'today') {
            $query->whereBetween('created_at', [now()->startOfDay(), now()->endOfDay()]);
        } elseif ($timeframe === 'this_week') {
            $query->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()]);
        } elseif ($timeframe === 'this_month') {
            $query->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()]);
        } elseif ($timeframe === 'this_year') {
            $query->whereBetween('created_at', [now()->startOfYear(), now()->endOfYear()]);
        }

        $orders = $query->get();
        $totalSales = $orders->sum('total_amount');
        $totalCost = $orders->sum('total_cost');
        $grossProfit = $totalSales - $totalCost;

        $profitByCategory = Product::select('category_id', DB::raw('SUM(stock * cost_price) as total_cost_valuation'), DB::raw('SUM(stock * selling_price) as total_retail_valuation'))
            ->with('category')
            ->groupBy('category_id')
            ->get();

        return response()->json([
            'timeframe' => $timeframe,
            'total_sales' => $totalSales,
            'total_cost' => $totalCost,
            'gross_profit' => $grossProfit,
            'overall_margin' => $totalSales > 0 ? round(($grossProfit / $totalSales) * 100, 2) : 0,
            'profit_by_category' => $profitByCategory,
            'order_count' => $orders->count(),
        ]);
    }

    public function dailyCloseSummary(Request $request)
    {
        $todayStart = now()->startOfDay();
        $todayEnd = now()->endOfDay();

        $todayOrders = Order::with('items.product')
            ->whereIn('payment_status', ['paid', 'completed'])
            ->whereBetween('created_at', [$todayStart, $todayEnd])
            ->get();

        $totalRevenue = $todayOrders->sum('total_amount');
        $totalCost = $todayOrders->sum('total_cost');
        $grossProfit = $totalRevenue - $totalCost;
        $salesCount = $todayOrders->count();

        $cashTotal = $todayOrders->where('payment_method', 'cash')->sum('total_amount');
        $cardPosTotal = $todayOrders->where('payment_method', 'card_pos')->sum('total_amount');
        $transferTotal = $todayOrders->where('payment_method', 'bank_transfer')->sum('total_amount');
        $onlineTotal = $todayOrders->where('payment_method', 'online_paystack')->sum('total_amount');

        $orderIds = $todayOrders->pluck('id');
        $itemsSold = DB::table('order_items')
            ->whereIn('order_id', $orderIds)
            ->select('product_name', 'price', DB::raw('SUM(quantity) as total_qty'), DB::raw('SUM(subtotal) as total_revenue'))
            ->groupBy('product_name', 'price')
            ->get();

        $closedLog = AuditLog::where('action', 'DAILY_REGISTER_CLOSED')
            ->whereBetween('created_at', [$todayStart, $todayEnd])
            ->first();

        return response()->json([
            'date' => now()->toDateString(),
            'formatted_date' => now()->format('F d, Y'),
            'is_closed' => (bool)$closedLog,
            'closed_at' => $closedLog ? $closedLog->created_at : null,
            'closed_by' => $closedLog ? $closedLog->user_name : null,
            'total_revenue' => $totalRevenue,
            'total_cost' => $totalCost,
            'gross_profit' => $grossProfit,
            'sales_count' => $salesCount,
            'payment_breakdown' => [
                'cash' => $cashTotal,
                'card_pos' => $cardPosTotal,
                'bank_transfer' => $transferTotal,
                'online_paystack' => $onlineTotal,
            ],
            'items_sold' => $itemsSold,
            'today_orders' => $todayOrders,
        ]);
    }

    public function closeDailyRegister(Request $request)
    {
        $todayStart = now()->startOfDay();
        $todayEnd = now()->endOfDay();

        $todayOrders = Order::whereIn('payment_status', ['paid', 'completed'])
            ->whereBetween('created_at', [$todayStart, $todayEnd])
            ->get();

        $totalRevenue = $todayOrders->sum('total_amount');
        $grossProfit = $totalRevenue - $todayOrders->sum('total_cost');
        $salesCount = $todayOrders->count();

        $staffName = $request->input('staff_name') ?? $request->user()?->name ?? 'Chief Operations';

        $log = AuditLog::create([
            'user_name' => $staffName,
            'user_role' => $request->user()?->role?->name ?? 'admin',
            'action' => 'DAILY_REGISTER_CLOSED',
            'category' => 'sales',
            'description' => "Closed daily register for " . now()->format('M d, Y') . ". Total Sales: ₦" . number_format($totalRevenue, 2) . " ({$salesCount} orders), Gross Profit: ₦" . number_format($grossProfit, 2) . ". Closed by {$staffName}.",
            'exact_timestamp' => now(),
        ]);

        return response()->json([
            'message' => "Daily register closed by {$staffName}!",
            'closing_log' => $log,
        ]);
    }

    public function reopenDailyRegister(Request $request)
    {
        $todayStart = now()->startOfDay();
        $todayEnd = now()->endOfDay();

        AuditLog::where('action', 'DAILY_REGISTER_CLOSED')
            ->whereBetween('created_at', [$todayStart, $todayEnd])
            ->delete();

        $staffName = $request->input('staff_name') ?? $request->user()?->name ?? 'Chief Operations';

        $log = AuditLog::create([
            'user_name' => $staffName,
            'user_role' => $request->user()?->role?->name ?? 'admin',
            'action' => 'DAILY_REGISTER_REOPENED',
            'category' => 'sales',
            'description' => "Re-opened daily sales register for editing & mistake corrections by {$staffName}.",
            'exact_timestamp' => now(),
        ]);

        return response()->json([
            'message' => 'Sales register re-opened for editing!',
            'log' => $log,
        ]);
    }
}
