# Merchant Analytics & Inventory Intelligence Dashboard

An end-to-end merchant analytics platform that transforms raw transaction and inventory data into validated business insights and structured analytical outputs for an interactive React dashboard.

The project combines **Python-based data processing and analytics** with a **React frontend**, separating the analytics pipeline from the dashboard presentation layer.

---

## Project Overview

The Merchant Analytics & Inventory Intelligence Dashboard is designed to help merchants understand business performance, sales trends, and inventory health through a centralized analytical dashboard.

The project follows a data pipeline architecture:

```text
Raw Transaction & Inventory Data
              │
              ▼
      Python Analytics Pipeline
              │
      ┌───────┴────────┐
      ▼                ▼
 Data Cleaning     KPI & Analysis
      │                │
      └───────┬────────┘
              ▼
       Validated JSON
          Outputs
              │
              ▼
       React Dashboard
              │
              ▼
       Merchant Insights
```

The analytics layer produces structured JSON outputs that can be consumed by the React frontend to power dashboard cards, charts, tables, trends, and inventory indicators.

---

## Project Objectives

The project focuses on turning raw operational data into useful merchant intelligence by:

* Cleaning and validating transaction and inventory data.
* Calculating business performance metrics.
* Analyzing monthly sales and profit trends.
* Evaluating inventory health.
* Identifying inventory risk indicators.
* Producing structured JSON outputs for frontend consumption.
* Validating analytical results through automated checks.
* Providing a reliable data layer for the React dashboard.

---

## Business Questions

The analytical pipeline is designed to answer questions such as:

### Business Performance

* What is the overall sales performance?
* Which businesses generate the strongest sales performance?
* How does revenue and profit vary across businesses?
* What business-level KPIs can be used to monitor performance?

### Sales Trends

* How do sales and profit change over time?
* Which months show stronger or weaker performance?
* Are there meaningful trends in the available transaction data?

### Inventory Intelligence

* What is the current inventory position?
* Which products have inventory-related risks?
* Which businesses have potential inventory concerns?
* What products require attention based on available stock information?

---

## Analytical Outputs

The Python pipeline generates six validated JSON deliverables:

| Output                      | Purpose                                                     |
| --------------------------- | ----------------------------------------------------------- |
| `sales_summary.json`        | Overall sales KPIs and documented data-quality limitations  |
| `business_performance.json` | Cleaned sales performance by business                       |
| `monthly_trends.json`       | Valid-date monthly sales and profit trends                  |
| `inventory_health.json`     | Inventory health metrics and business-level risk indicators |
| `inventory_products.json`   | Cleaned product-level inventory records and stock flags     |
| `validation_report.json`    | Reconciliation and data-quality validation results          |

These outputs provide the analytical data layer used by the dashboard application.

---

## Technology Stack

### Analytics & Data Processing

* **Python**
* **Pandas**
* **JSON**
* **Jupyter / Python development environment**

### Dashboard

* **React**
* Frontend data visualization and dashboard components

### Development & Version Control

* **Git**
* **GitHub**

---

## Python Analytics Pipeline

The analytics layer is responsible for transforming the supplied raw datasets into structured, validated analytical outputs.

The main processing stages include:

1. Loading raw transaction and inventory data.
2. Inspecting the source data.
3. Handling data-quality issues.
4. Cleaning and transforming relevant fields.
5. Calculating business KPIs.
6. Generating business performance metrics.
7. Generating monthly sales and profit trends.
8. Calculating inventory health indicators.
9. Producing product-level inventory records.
10. Running automated validation checks.
11. Exporting the final analytical results as JSON.

### Main source files

```text
analytics/
├── src/
│   ├── build_analytics.py
│   └── test_analytics.py
│
└── output/
    ├── sales_summary.json
    ├── business_performance.json
    ├── monthly_trends.json
    ├── inventory_health.json
    ├── inventory_products.json
    └── validation_report.json
```

---

## Dashboard Integration

The analytics pipeline and frontend are intentionally separated.

The Python layer is responsible for:

```text
Raw Data → Cleaning → Analysis → Validation → JSON
```

The React layer is responsible for:

```text
JSON → Dashboard Components → Visualizations → User Interaction
```

This separation allows the analytical logic to remain independent from the dashboard interface while providing the frontend with structured and predictable data.

The React dashboard can use the generated JSON outputs to populate:

* KPI cards
* Business performance charts
* Monthly trend visualizations
* Inventory health indicators
* Product inventory tables
* Business-level comparisons
* Risk/alert sections

---

## Important Analytical Limitation

The supplied transaction log does **not** contain `product_id` or `quantity sold`, while the inventory dataset does not contain historical sales information.

Because of this, the project does not calculate unsupported metrics such as:

* Product-level units sold
* Stock turnover rate
* Fast-moving products based on sales
* Sales-based dead stock
* Product-level sales velocity

Instead of estimating or inventing these metrics, the pipeline explicitly documents the limitation.

This ensures that the dashboard presents metrics that can be supported by the available data.

---

## Validation

The project includes automated validation through:

```text
analytics/src/test_analytics.py
```

The validation process checks the generated analytical outputs and key KPI reconciliations.

The completed validation run returned:

```text
ALL TESTS PASSED
validation_status: PASS
```

This provides a basic quality-control layer between the analytical pipeline and the dashboard.

---

## Project Structure

```text
merchant-analytics-inventory-dashboard/
│
├── analytics/
│   ├── src/
│   │   ├── build_analytics.py
│   │   └── test_analytics.py
│   │
│   └── output/
│       ├── sales_summary.json
│       ├── business_performance.json
│       ├── monthly_trends.json
│       ├── inventory_health.json
│       ├── inventory_products.json
│       └── validation_report.json
│
├── raw/
│   └── [source datasets]
│
├── README.md
└── [frontend application files]
```

The repository structure may expand as the React dashboard development progresses.

---

## Running the Analytics Pipeline

Clone the repository and navigate to the project directory.

Run the analytics generation script:

```bash
python analytics/src/build_analytics.py
```

Run the validation tests:

```bash
python analytics/src/test_analytics.py
```

Successful validation should produce:

```text
ALL TESTS PASSED
```

---

## Current Project Status

### Completed

* Raw data analysis
* Data cleaning and transformation
* Sales KPI development
* Business performance analysis
* Monthly trend analysis
* Inventory health analysis
* Product-level inventory processing
* JSON analytical outputs
* Automated validation
* Git/GitHub project setup

### In Progress

* React dashboard development
* Frontend integration with analytical JSON outputs
* Dashboard visualizations
* Interactive filtering and navigation
* Final dashboard refinement

### Planned

* Final dashboard deployment
* Production-ready data integration
* Additional analytical features where supported by the available data

---

## Collaboration

This project separates the analytical and frontend responsibilities into two connected layers.

### Analytics Layer

Responsible for:

* Data preparation
* Data cleaning
* Analytical calculations
* KPI development
* Validation
* Structured JSON outputs

### Frontend Layer

Responsible for:

* React application
* Dashboard interface
* Data visualization
* Interactive components
* User experience
* Presentation of analytical results

Together, these components form the Merchant Analytics & Inventory Intelligence Dashboard.

---

## Project Goal

The goal is to build a practical analytics platform that demonstrates how raw business data can move through a complete workflow:

```text
Raw Data
   ↓
Data Cleaning
   ↓
Analysis
   ↓
Validation
   ↓
Structured Data
   ↓
React Dashboard
   ↓
Business Intelligence
```

The project emphasizes **data accuracy, transparent analytical limitations, reproducibility, and practical dashboard integration** rather than simply producing static charts or isolated analysis scripts.
