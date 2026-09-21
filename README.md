# Merchant Analytics & Inventory Intelligence Dashboard — Analyst JSON Phase

This package contains the six analyst JSON deliverables and the Python source used to regenerate and validate them from the final-project raw data.

## JSON deliverables

1. `sales_summary.json` — overall sales KPIs and documented data-quality limitations.
2. `business_performance.json` — cleaned sales performance by business.
3. `monthly_trends.json` — valid-date monthly sales/profit trends.
4. `inventory_health.json` — inventory-level health metrics and business-level inventory risk indicators.
5. `inventory_products.json` — cleaned product-level inventory records and stock flags.
6. `validation_report.json` — reconciliation and data-quality checks.

## Python source

- `analytics/src/build_analytics.py` regenerates JSON 2–6 while preserving the completed `sales_summary.json` from this phase.
- `analytics/src/test_analytics.py` checks all six outputs and key KPI reconciliations.

## Important analytical limitation

The supplied transaction log has no `product_id` or `quantity sold`, and the inventory data has no sales history. Therefore product-level units sold, stock turnover rate, fast-moving products, and sales-based dead stock are not calculated. The pipeline documents this limitation instead of inventing unsupported metrics.

## Validation

The included test run completed successfully with `ALL TESTS PASSED` and `validation_status: PASS`.
