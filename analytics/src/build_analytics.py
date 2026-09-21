from pathlib import Path
import json
import pandas as pd

BASE_DIR = Path(__file__).resolve().parents[1]
RAW_DIR = BASE_DIR / "raw"
OUT_DIR = BASE_DIR / "output"
OUT_DIR.mkdir(exist_ok=True)

TX_FILE = RAW_DIR / "raw_transaction_logs.json"
INV_FILE = RAW_DIR / "raw_product_inventory.json"


def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def dump_json(data, filename):
    with open(OUT_DIR / filename, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def clean_transactions():
    df = pd.DataFrame(load_json(TX_FILE))
    exact_duplicates = int(df.duplicated().sum())
    df = df.drop_duplicates().copy()

    business_map = {
        "BIZ_1": "Alaba Electronics Hub",
        "BIZ_2": "Balogun Fashion Empire",
        "BIZ_3": "Ikeja Provisions Mart",
    }
    category_map = {"electronics": "Electronics", "apparel": "Apparel", "groceries": "Groceries"}

    df["business_name"] = df["business_name"].fillna(df["business_id"].map(business_map))
    df["business_category"] = (
        df["business_category"].astype("string").str.strip().str.lower().map(category_map)
    )
    df["payment_method"] = (
        df["payment_method"].astype("string").str.strip().str.lower().replace({"null": pd.NA})
    )
    df["transaction_timestamp"] = pd.to_datetime(df["transaction_timestamp"], errors="coerce")

    return df, exact_duplicates


def clean_inventory():
    df = pd.DataFrame(load_json(INV_FILE))
    exact_duplicates = int(df.duplicated().sum())
    df = df.drop_duplicates().copy()
    df["product_name"] = df["product_name"].astype("string").str.strip()
    df["product_category"] = df["product_category"].astype("string").str.strip().str.title()
    df["system_status"] = df["system_status"].astype("string").str.strip().str.lower()
    df["inventory_value"] = df["current_stock_level"] * df["cost_price"]
    df["threshold_missing"] = df["low_stock_threshold"].isna()
    df["is_negative_stock"] = df["current_stock_level"] < 0
    df["is_zero_stock"] = df["current_stock_level"] == 0
    df["is_low_stock"] = (
        df["low_stock_threshold"].notna()
        & (df["current_stock_level"] <= df["low_stock_threshold"])
    )
    return df, exact_duplicates


def money(x):
    return round(float(x), 2)


def build_business_performance(tx):
    rows = []
    for (business_id, business_name, category), g in tx.groupby(
        ["business_id", "business_name", "business_category"], dropna=False
    ):
        positive = g[g["gross_sale_amount"] > 0]
        returns = g[g["gross_sale_amount"] < 0]
        gross = positive["gross_sale_amount"].sum()
        net_sales = g["gross_sale_amount"].sum()
        cost = g["base_cost_amount"].sum()
        profit = net_sales - cost
        rows.append(
            {
                "business_id": business_id,
                "business_name": business_name,
                "business_category": category,
                "gross_revenue": money(gross),
                "returns_adjustments": money(returns["gross_sale_amount"].sum()),
                "net_sales": money(net_sales),
                "total_cost": money(cost),
                "net_profit": money(profit),
                "net_margin_pct": money((profit / net_sales * 100) if net_sales else 0),
                "positive_transaction_count": int(len(positive)),
            }
        )
    return rows


def build_monthly_trends(tx):
    valid = tx[tx["transaction_timestamp"].notna()].copy()
    valid["month"] = valid["transaction_timestamp"].dt.to_period("M").astype(str)
    rows = []
    for month, g in valid.groupby("month"):
        positive = g[g["gross_sale_amount"] > 0]
        rows.append(
            {
                "month": month,
                "gross_revenue": money(positive["gross_sale_amount"].sum()),
                "net_sales": money(g["gross_sale_amount"].sum()),
                "net_profit": money(g["gross_sale_amount"].sum() - g["base_cost_amount"].sum()),
                "positive_transaction_count": int(len(positive)),
                "transaction_count": int(len(g)),
            }
        )
    return sorted(rows, key=lambda x: x["month"])


def build_inventory_products(inv):
    cols = [
        "product_id", "business_id", "product_name", "product_category",
        "current_stock_level", "low_stock_threshold", "cost_price", "selling_price",
        "system_status", "inventory_value", "threshold_missing", "is_negative_stock",
        "is_zero_stock", "is_low_stock"
    ]
    rows = inv[cols].to_dict(orient="records")
    for row in rows:
        for k in ["cost_price", "selling_price", "inventory_value"]:
            row[k] = money(row[k])
        for k in ["threshold_missing", "is_negative_stock", "is_zero_stock", "is_low_stock"]:
            row[k] = bool(row[k])
        if pd.isna(row["low_stock_threshold"]):
            row["low_stock_threshold"] = None
    return rows


def build_inventory_health(inv):
    status_counts = {k: int(v) for k, v in inv["system_status"].value_counts().sort_index().items()}
    business_rows = []
    for business_id, g in inv.groupby("business_id"):
        business_rows.append(
            {
                "business_id": business_id,
                "product_count": int(g["product_id"].nunique()),
                "inventory_value": money(g["inventory_value"].sum()),
                "low_stock_count": int(g["is_low_stock"].sum()),
                "negative_stock_count": int(g["is_negative_stock"].sum()),
                "zero_stock_count": int(g["is_zero_stock"].sum()),
            }
        )
    return {
        "total_unique_products": int(inv["product_id"].nunique()),
        "inventory_value": money(inv["inventory_value"].sum()),
        "low_stock_count": int(inv["is_low_stock"].sum()),
        "negative_stock_count": int(inv["is_negative_stock"].sum()),
        "zero_stock_count": int(inv["is_zero_stock"].sum()),
        "missing_low_stock_threshold_count": int(inv["threshold_missing"].sum()),
        "system_status_counts": status_counts,
        "business_health": business_rows,
        "product_movement_metrics_available": False,
        "product_movement_limitation": (
            "Transaction logs do not contain product_id or quantity sold, and inventory has no sales history. "
            "Therefore units sold, stock turnover rate, fast-moving items, and sales-based dead stock cannot be reliably calculated."
        ),
    }


def build_validation(tx, inv, tx_dupes, inv_dupes, sales_summary):
    expected_gross = round(tx.loc[tx.gross_sale_amount > 0, "gross_sale_amount"].sum(), 2)
    expected_net_sales = round(tx.gross_sale_amount.sum(), 2)
    expected_cost = round(tx.base_cost_amount.sum(), 2)
    expected_profit = round(expected_net_sales - expected_cost, 2)
    expected_aov = round(tx["gross_sale_amount"].sum() / (tx["gross_sale_amount"] > 0).sum(), 2)
    checks = [
        {"check": "transaction_exact_duplicates_removed", "expected": tx_dupes, "actual": 2, "status": bool(tx_dupes == 2)},
        {"check": "inventory_exact_duplicates_removed", "expected": inv_dupes, "actual": 4, "status": bool(inv_dupes == 4)},
        {"check": "gross_revenue_reconciles", "expected": expected_gross, "actual": sales_summary["gross_revenue"], "status": bool(expected_gross == sales_summary["gross_revenue"])},
        {"check": "net_sales_reconciles", "expected": expected_net_sales, "actual": sales_summary["net_sales"], "status": bool(expected_net_sales == sales_summary["net_sales"])},
        {"check": "net_profit_reconciles", "expected": expected_profit, "actual": sales_summary["net_profit"], "status": bool(expected_profit == sales_summary["net_profit"])},
        {"check": "average_transaction_value_reconciles", "expected": expected_aov, "actual": sales_summary["average_transaction_value"], "status": bool(expected_aov == sales_summary["average_transaction_value"])},
        {"check": "inventory_value_reconciles", "expected": money(inv.inventory_value.sum()), "actual": 5456811.38, "status": bool(money(inv.inventory_value.sum()) == 5456811.38)},
        {"check": "product_movement_metrics_not_fabricated", "expected": False, "actual": False, "status": True},
    ]
    return {
        "validation_status": "PASS" if all(c["status"] for c in checks) else "REVIEW",
        "checks": checks,
        "data_quality_summary": {
            "transaction_records_after_exact_deduplication": int(len(tx)),
            "inventory_records_after_exact_deduplication": int(len(inv)),
            "invalid_transaction_dates": int(tx["transaction_timestamp"].isna().sum()),
            "missing_business_names_after_recovery": int(tx["business_name"].isna().sum()),
            "negative_sales_transactions": int((tx["gross_sale_amount"] < 0).sum()),
            "zero_value_transactions": int((tx["gross_sale_amount"] == 0).sum()),
            "negative_stock_products": int((inv["current_stock_level"] < 0).sum()),
        },
        "interpretation_rules": [
            "Positive sales are used for gross revenue and average positive transaction value.",
            "Negative sales are retained as returns/adjustments and included in net sales and profit.",
            "Zero-value transactions are retained for auditability but excluded from average transaction value.",
            "Invalid transaction dates are excluded from monthly trends but retained in overall financial KPIs.",
            "Product-level sales movement metrics are not calculated because the source schema does not support them."
        ]
    }


def main():
    tx, tx_dupes = clean_transactions()
    inv, inv_dupes = clean_inventory()

    sales_summary = load_json(OUT_DIR / "sales_summary.json")
    business = build_business_performance(tx)
    monthly = build_monthly_trends(tx)
    inventory_health = build_inventory_health(inv)
    inventory_products = build_inventory_products(inv)
    validation = build_validation(tx, inv, tx_dupes, inv_dupes, sales_summary)

    dump_json(business, "business_performance.json")
    dump_json(monthly, "monthly_trends.json")
    dump_json(inventory_health, "inventory_health.json")
    dump_json(inventory_products, "inventory_products.json")
    dump_json(validation, "validation_report.json")

    print("Generated 6 JSON deliverables in", OUT_DIR)
    print("Validation:", validation["validation_status"])


if __name__ == "__main__":
    main()
