# Merchant Analytics & Inventory Intelligence Dashboard

An interactive Business Intelligence dashboard for a B2B Sales & Inventory Management platform. It turns raw merchant transaction logs and stock data into clear, filterable insights: revenue, profit margin, average order value, and inventory health.

**Live demo:** [add your Vercel/Netlify link here]

![Dashboard preview](./screenshots/dashboard.png)

## Contents

- [Key features](#key-features)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Data pipeline](#data-pipeline)
- [Business insights](#business-insights)
- [How filtering works](#how-filtering-works)
- [Team](#team)

## Key features

- **Sales Performance Hub:** gross revenue, net profit margin, and average order value (AOV), with charts for revenue trends.
- **Inventory Control Center:** product count, inventory value, and stock alerts (low, zero, and negative stock), plus fast-moving vs. dead stock.
- **Global filtering:** switch between "All" and a specific month, and every KPI and chart updates instantly.
- **Loading and error states:** the dashboard shows a loader while data is fetched and a clear message if a file fails to load.

## Tech stack

| Layer          | Tools                                |
| -------------- | ------------------------------------ |
| Data analytics | Python, Pandas                       |
| Frontend       | React (Vite), Tailwind CSS, Recharts |
| Deployment     | Vercel / Netlify                     |

## Project structure

```
merchant-analytics-inventory-dashboard/
├── analytics/
│   ├── raw/                  # anonymized raw merchant data
│   ├── output/               # cleaned and aggregated JSON
│   ├── sales_pipeline.py     # cleaning + sales KPIs
│   ├── build_analytics.py    # builds the final JSON payloads
│   └── test_analytics.py     # checks that the calculations are correct
├── public/
│   ├── validation_report.json
│   └── inventory_products.json
├── src/
│   ├── assets/
│   ├── Dashboard.jsx
│   ├── Sales.jsx
│   ├── Inventory.jsx
│   ├── Insight.jsx
│   ├── Layout.jsx
│   ├── Side.jsx              # sidebar navigation
│   ├── NotFound.jsx
│   ├── ThemeToggle.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Getting started

**Prerequisites:** Node.js 18+ and Python 3.10+.

```bash
# 1. Clone the repository
git clone https://github.com/miwts-ast/merchant-analytics-inventory-dashboard.git
cd merchant-analytics-inventory-dashboard

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Open the local URL shown in the terminal (usually `http://localhost:5173`).

To create a production build:

```bash
npm run build
npm run preview
```

## Data pipeline

The dashboard does not calculate anything from raw data in the browser. Python does the heavy lifting first and exports small JSON files that React reads.

**Cleaning steps**

1. Drop invalid records: rows where `gross_sale_amount <= 0` or timestamps are corrupt.
2. Standardize text: payment methods such as `bank_transfer` and `Bank Transfer` become one key; product titles are trimmed.
3. Handle edge cases: returns, cancelled orders, and negative stock values.
4. Aggregate: gross sales, margins (gross minus cost), monthly order counts, stock turnover, and dead-stock detection.

**Outputs** (served from `public/`)

| File                      | Used for                                              |
| ------------------------- | ----------------------------------------------------- |
| `validation_report.json`  | Overall totals (gross revenue, net margin, and so on) |
| `inventory_products.json` | Inventory health and stock alerts                     |
| Sales summary JSON        | Month-by-month sales figures for filtering            |

**Regenerate the data**

```bash
pip install pandas
python analytics/sales_pipeline.py
python analytics/build_analytics.py
python analytics/test_analytics.py
```

## Business insights

Three findings from the merchant data. Replace the bracketed text with your real numbers.

1. **[Insight title]:** [What you found, with the figure. Example: "Bank transfer accounts for X% of gross revenue, but card payments have the higher AOV."]
2. **[Insight title]:** [Example: "X% of inventory value is dead stock, which suggests merchants need a clearance or promotion feature."]
3. **[Insight title]:** [Example: "Revenue peaked in [month], while the number of orders stayed flat, meaning basket size grew rather than customer count."]

## How filtering works

The dashboard keeps one piece of filter state at the top and derives everything else from it, so the UI never gets out of sync.

- **Single source of truth:** the selected month lives in one `useState` in `Dashboard.jsx`. Its default is `"all"`.
- **Derived data with `useMemo`:** the filtered rows are computed with `useMemo` and depend only on `[month, salesSummary]`. They are recalculated when the filter or data changes, not on every render.
- **All vs. month:** when the filter is `"all"`, KPIs come from the pre-computed report. When a month is selected, they come from that month's rows in the sales summary.
- **Safe first render:** data is fetched in `useEffect`, so the components render a loader until the JSON arrives and use defaults (`?? 0`, `?? []`) so nothing crashes on `undefined`.
- **One formatter:** currency is formatted once with `Intl.NumberFormat("en-NG", { currency: "NGN" })` and reused across all cards.

## Team

- **Data Analyst:** [Akinrinle Gbolahan]
- **React Developer:** [Adekoya Daniel]

## Git workflow

Work is done on feature branches (`feature/data-pipeline`, `feature/dashboard-ui`) and merged into `main` through pull requests. `main` always holds the working version and is the branch deployed to Vercel.
