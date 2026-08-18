# StockPilot Platform — Comprehensive Project Report

**StockPilot: Intelligent Inventory, Sales, In-Store POS & Commerce Management Platform**  
*Central Philosophy: "Know your stock. Understand your business. Serve your customers. Act before problems become losses."*

---

## 1. Executive Summary & Key Concepts Explained

StockPilot is an integrated business operating platform connecting inventory management, in-store POS checkout, sales pipeline management, supplier purchasing, profit analytics, staff account controls, daily sales closing (Z-Reports), and a customer-facing online storefront into a single synchronized system.

### 1.1 Business Core Concepts Explained
- **Revenue**: Total gross monetary amount collected from all completed sales (e.g. ₦100,000 made in a day/week).
- **Cost of Goods Sold (COGS)**: Total purchasing cost of items that were sold.
- **Gross Profit**: Net earnings remaining after subtracting COGS from Revenue ($\text{Gross Profit} = \text{Revenue} - \text{COGS}$).
- **SKU (Stock Keeping Unit)**: Unique alphanumeric identifier code assigned to each product (e.g., `AUD-NC-001` or `SPK-WRL-012`) to track inventory uniquely without confusion.
- **KPIs (Key Performance Indicators)**: High-level financial and inventory metrics (Total Revenue, Net Profit, Inventory Valuation, Out of Stock Count) displayed on the main command dashboard.
- **Walk-In Bank Transfer**: When a physical customer pays via bank transfer at the POS counter, staff selects "Transfer", verifies funds receipt in the business bank account, and completes the sale.
- **Price Change Audit Log**: Cost price and selling price changes are tracked live in the `products` table (current state), `audit_logs` table (historical audit trail of who changed what and when), and `inventory_movements` table.

---

## 2. Standardized Authentication & Account Management Policy

### 2.1 Unified Testing & Production Password Standard
To keep testing and initial deployment seamless, **all default seeded accounts use a single standardized password**:

- **Unified Password**: `password`
- **Default Administrator Account**: `admin@stockpilot.com` | Password: `password`
- **Default Sales Staff Account**: `sarah@stockpilot.com` | Password: `password`

### 2.2 Profile & Credentials Management (Email & Password Updates)
Users can update their account details at any time:
1. Click the **Settings** button in the header navbar when logged in.
2. Update **Full Name**, **Email Address**, **Phone Number**, or enter a **New Password**.
3. All profile updates trigger an automatic system **Audit Log** (`PROFILE_UPDATED`) recording the date, time, and user action.

---

## 3. Database Architecture & Current Status

### 3.1 Database Status
- **Current Database State**: **100% Fully Migrated, Seeded & Verified**
- **Default Local Database**: SQLite database located at `backend/database/database.sqlite`.
- **MySQL Compatibility**: Pre-configured in `backend/.env`. Switch to MySQL anytime by setting:
  ```env
  DB_CONNECTION=mysql
  DB_HOST=127.0.0.1
  DB_PORT=3306
  DB_DATABASE=stockpilot
  DB_USERNAME=root
  DB_PASSWORD=
  ```

### 3.2 Database Schema Overview

| Table Name | Description | Key Columns |
| :--- | :--- | :--- |
| `roles` | Role-Based Access Control (RBAC) | `id`, `name` (admin, manager, sales_staff, inventory_staff, customer), `display_name` |
| `users` | User Accounts | `id`, `role_id`, `name`, `email`, `password`, `phone` |
| `categories` | Product Categories | `id`, `name`, `slug`, `description`, `image`, `is_active` |
| `suppliers` | Supplier Profiles | `id`, `name`, `contact_person`, `email`, `phone`, `address`, `outstanding_balance` |
| `customers` | Customer Profiles | `id`, `user_id`, `name`, `email`, `phone`, `total_spend`, `order_count` |
| `products` | Core Product Catalog | `id`, `name`, `slug`, `sku`, `barcode`, `cost_price`, `selling_price`, `stock`, `min_stock`, `status`, `main_image` |
| `product_variations` | Product Options (Size/Color) | `id`, `product_id`, `name`, `sku`, `cost_price`, `selling_price`, `stock` |
| `inventory_movements` | Stock Movement Audit Timeline | `id`, `product_id`, `type` (`receive`, `sale`, `return`, `adjustment`, `damaged`), `qty_change`, `previous_qty`, `new_qty`, `reference`, `user_id`, `exact_timestamp` |
| `orders` | Sales & Online Customer Orders | `id`, `order_number`, `customer_id`, `customer_name`, `subtotal`, `total_amount`, `total_cost`, `gross_profit`, `payment_status`, `order_status` |
| `order_items` | Individual Order Line Items | `id`, `order_id`, `product_id`, `product_name`, `price`, `cost_price`, `quantity`, `subtotal` |
| `purchases` | Supplier Purchase Orders | `id`, `purchase_number`, `supplier_id`, `total_amount`, `status`, `received_at` |
| `purchase_items` | Purchase Order Line Items | `id`, `purchase_id`, `product_id`, `qty_ordered`, `qty_received`, `cost_price`, `subtotal` |
| `payments` | Gateway Payment Records | `id`, `order_id`, `reference`, `gateway` (`cash`, `card_pos`, `bank_transfer`, `online_paystack`), `amount`, `status`, `gateway_response` |
| `audit_logs` | System Audit Log | `id`, `user_id`, `user_name`, `user_role`, `action`, `category`, `description`, `exact_timestamp` |

---

## 4. Core Modules & Key Features

### 4.1 Business Pulse Engine & Action Center
- Evaluates overall operational health using an algorithmic score from **0 to 100**.
- System-generated alerts prioritize critical stock, out-of-stock items, and pending orders.

### 4.2 Intelligent Stock Visibility
- **Stock $> 0$**: Item displays on storefront catalog automatically for online shoppers.
- **Stock $= 0$**: Item is automatically hidden from storefront catalog listings to prevent overselling.
- **Stock $0 \rightarrow N$**: Item automatically reappears on the storefront as soon as a restock occurs.

### 4.3 In-Store Walk-In POS Terminal (`AdminPos.jsx`)
- Fast walk-in sales register for physical store transactions.
- Product search & category filters with instant cart additions.
- Flexible payment methods: **Cash**, **Card / POS Terminal**, **Bank Transfer**.
- Automatic stock deduction, sales timeline logging with staff user attribution, and printable receipt modal.

### 4.4 End of Day Register Close & Z-Report Engine (`DailyCloseModal.jsx`)
- Accessible via the top navbar button **"End of Day Close (Z-Report)"**.
- Displays real-time daily metrics: **Total Revenue Made**, **Total Gross Profit Made**, **Total Orders**, **Payment Breakdown** (Cash, Card/POS, Transfer, Paystack), and **Itemized Items Sold Today**.
- **Register Re-Opening Support**: Includes a *"Re-Open Register for Editing"* button to allow staff to correct mistakes or enter missed transactions.

### 4.5 Financial Reports: Today, Weekly, Monthly & Yearly (`AdminReports.jsx`)
- Financial period selector pills: **Today's Report**, **Weekly Report**, **Monthly Report**, **Yearly Report**, and **All Time**.
- Allows business owners to track performance trends across any timeframe.

### 4.6 Staff Accounts & Session Switcher (`AdminStaff.jsx`)
- Manage staff credentials and role assignments (`admin`, `sales_staff`, `inventory_staff`, `manager`).
- Add new staff accounts on the fly.
- Admins can click **"Switch to User"** to immediately assume any staff account session smoothly.

### 4.7 Standalone Supplier Management & PO Engine (`AdminPurchases.jsx`)
- Create and manage supplier profiles independently with the **"Add New Supplier"** modal.
- Create supplier purchase orders with automatic stock incrementing and cost/selling price updates.

### 4.8 Product Setup & Preset Image Selector (`AdminInventory.jsx`)
- Auto-generates clean SKUs (e.g. `SKU-HEADPH-891`).
- Curated clickable preset image thumbnails (Headphones, TV Streamer, Leather Bag, Keyboard, Watch) for 1-click image assignment.
- Description field is optional.
- Frictionless **Inline Price Editing** directly in table rows.
- Movement history timeline displays the exact **Staff Member's Name** for full accountability.

---

## 5. API Reference Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard` | Returns Business Pulse score, Action Center alerts, KPIs, timeline feed |
| `GET` | `/api/storefront/products` | Public catalog with intelligent stock visibility filter (`stock > 0`) |
| `POST` | `/api/storefront/checkout` | Live stock-validated checkout & POS order creation |
| `GET` | `/api/products` | Full catalog listing for Admin/Staff |
| `POST` | `/api/products` | Create new product with preset image & auto SKU |
| `PUT` | `/api/products/{id}` | Update product details & prices directly |
| `POST` | `/api/products/{id}/stock` | Adjust/Restock stock with price updates & movement logging |
| `GET` | `/api/products/{id}/performance` | Product performance profile & movement history with staff attribution |
| `GET` | `/api/orders` | Orders pipeline list |
| `PATCH` | `/api/orders/{id}/status` | Update order fulfillment status |
| `GET` | `/api/purchases` | Purchase orders list |
| `POST` | `/api/purchases` | Create supplier PO & auto-increment product stock & prices |
| `GET` | `/api/suppliers` | List all suppliers |
| `POST` | `/api/suppliers` | Create new supplier company profile |
| `GET` | `/api/admin/users` | List staff user accounts |
| `POST` | `/api/admin/users` | Create new staff user account |
| `POST` | `/api/admin/switch-user` | Switch session context to staff user |
| `POST` | `/api/auth/profile` | Update account credentials (Name, Email, Password) |
| `GET` | `/api/reports/audit-logs` | System audit trail logs |
| `GET` | `/api/reports/profit` | Gross profit & financial margin calculations (supports `timeframe`) |
| `GET` | `/api/reports/daily-close` | Daily sales closing summary & Z-report metrics |
| `POST` | `/api/reports/daily-close` | Lock daily sales register & issue Z-report log |
| `POST` | `/api/reports/daily-close/reopen` | Re-open daily sales register for mistake corrections |

---

## 6. How to Run Locally

### Start Backend Server
```bash
cd backend
php artisan serve --port=8005
```

### Start Frontend Server
```bash
cd frontend
npm run dev
```
Open **`http://localhost:5174/`** in your browser.
