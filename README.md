# StockPilot — Intelligent Inventory, POS, Logistics & Commerce Platform

**StockPilot** is an integrated business operating platform connecting inventory control, walk-in POS checkout, online storefront sales, supplier purchasing, delivery status tracking, profit analytics, staff account controls, daily sales closing (Z-Reports), and system audit trails into a single synchronized system.

---

## 🌟 Key Features & Core Modules

### 1. 🛍️ Customer Online Storefront & Status Timeline Tracking
- **Intelligent Stock Visibility**: Products with active stock ($> 0$) appear on the public storefront. Items that reach zero stock ($0$) are automatically hidden to prevent overselling.
- **Delivery Zone Selection & Fee Calculation**: Customers select fulfillment options (Standard, Express, Pickup) and Delivery Zones during checkout. Delivery fees are auto-calculated into the total order price.
- **Unique Package Tracking (`TRK-XXXXXXXX`)**: Generates unique tracking numbers and recipient address records for every completed order.
- **1-Click Receipt Status Tracking**: Includes a **`🚚 View Package Status`** button on the receipt popup that opens the timestamped status timeline view.
- **Timestamped Customer Tracking Page (`/track/:trackingNumber`)**: Public tracking page displaying timestamped fulfillment steps (*Order Confirmed* $\rightarrow$ *Processing* $\rightarrow$ *Ready for Dispatch* $\rightarrow$ *Dispatched* $\rightarrow$ *In Transit* $\rightarrow$ *Out for Delivery* $\rightarrow$ *Delivered*).

### 2. 🚚 Delivery & Logistics Management
- **Admin Delivery Portal**: Filter orders by status (*Pending*, *Processing*, *Ready for Dispatch*, *In Transit*, *Delivered*), assign courier staff, set estimated delivery dates, and update fulfillment notes.
- **1-Click Direct Table Action Buttons**: Single-click status advancement buttons right in the Admin Deliveries table row (*Start Transit*, *Out for Delivery*, *Mark Delivered*).
- **Configurable Delivery Zones & Fees**: Add and configure delivery zones (zone name, region, standard fee, express fee, estimated delivery time).
- **Courier Mobile Terminal (`/courier`)**: Streamlined mobile interface for delivery drivers (`driver@stockpilot.com`) to view assigned packages and update delivery statuses.
- **Single Inventory Deduction**: Inventory is deducted ONCE upon order creation/payment confirmation. Delivery status updates do NOT perform duplicate stock deductions.

### 3. 🛒 In-Store Walk-In POS Terminal
- Fast walk-in sales register for physical store transactions with instant cart additions.
- Flexible payment methods: **Cash**, **Card / POS Terminal**, **Bank Transfer**.
- Automatic stock deduction, staff user attribution, and printable receipt popups.

### 4. 🔒 End-of-Day Register Close & Z-Report Engine
- Displays real-time daily metrics: **Total Revenue**, **Gross Profit**, **Payment Method Breakdown** (Cash, Card, Transfer, Paystack), and **Itemized Items Sold Today**.
- **Register Re-Opening Support**: Includes a *"Re-Open Register for Editing"* option to allow staff to make corrections or record missed transactions.

### 5. 📈 Financial Reports & Period Filters
- Timeframe filter pills: **Today's Report**, **Weekly Report**, **Monthly Report**, **Yearly Report**, and **All Time**.
- One-click **Export CSV** and **Print PDF** reports.

### 6. 👥 Role-Based Staff Workspaces & Session Switcher
- Manage staff credentials and role assignments (`admin`, `sales_staff`, `inventory_staff`, `delivery_staff`).
- **Streamlined Role Navigation**: Each staff role enters their dedicated workspace upon login (Sales Staff defaults to POS, Delivery Staff defaults to Logistics).
- Admins can click **"Switch Session"** to instantly assume any staff account session context for testing or supervision.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Vanilla CSS / Custom Glassmorphism, React Router DOM v7, Lucide Icons.
- **Backend**: Laravel REST API, Eloquent ORM, Database Migrations & Seeders.
- **Database**: SQLite (default: `backend/database/database.sqlite`) / MySQL compatible.

---

## ⚡ Quick Start & Deployment Setup

### 1. Local Backend Setup (Laravel API)
```bash
cd backend
composer install
php artisan migrate:fresh --seed
php artisan serve --port=8005
```

### 2. Local Frontend Setup (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

Open **`http://localhost:5173`** in your browser.

### 🚀 3. Live Deployment (Render / Vercel / Shared Hosting)
- **Frontend**: Deploy `frontend/` directory to Vercel or Render Static Site (Build command: `npm run build`, Output directory: `dist`).
- **Backend**: Deploy `backend/` directory to Render Web Service or Railway (Start command: `php artisan serve --host=0.0.0.0 --port=$PORT`).

---

## 🔑 Default Test Credentials

All default staff accounts use the password: **`password`**

| Role | Email | Password | Primary Interface |
| :--- | :--- | :--- | :--- |
| 👑 **Administrator** | `admin@stockpilot.com` | `password` | Executive Business Portal & Command Center |
| 🛒 **Sales Staff** | `sarah@stockpilot.com` | `password` | In-Store POS Sales Register |
| 📦 **Inventory Staff** | `stock@stockpilot.com` | `password` | Stock Restocks & Supplier Purchases |
| 🚚 **Delivery Staff** | `driver@stockpilot.com` | `password` | Courier Terminal & Dispatch |

---

## 🔗 Key API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/storefront/products` | Public catalog with intelligent stock filter (`stock > 0`) |
| `POST` | `/api/storefront/checkout` | Stock-validated checkout & order creation |
| `GET` | `/api/storefront/delivery-zones` | Active delivery zones & fees |
| `GET` | `/api/storefront/tracking/{trackingNumber}` | Public customer package tracking & timeline history |
| `GET` | `/api/deliveries` | Admin logistics listing & filters |
| `GET` | `/api/deliveries/my-deliveries` | Courier assigned deliveries list |
| `PATCH` | `/api/deliveries/{id}/status` | Update delivery status & log timeline history |
| `PATCH` | `/api/deliveries/{id}/assign` | Assign courier to a delivery |
| `GET/POST` | `/api/delivery-zones` | Manage delivery zones & fees |
| `GET/POST` | `/api/products` | Manage product catalog & inline price edits |
| `GET` | `/api/reports/daily-close` | Daily Z-Report financial summary |
| `POST` | `/api/reports/daily-close` | Lock daily sales register |
| `POST` | `/api/reports/daily-close/reopen` | Re-open sales register for mistake corrections |
| `GET` | `/api/reports/profit` | Profit analytics (supports `timeframe` = today, week, month, year) |
