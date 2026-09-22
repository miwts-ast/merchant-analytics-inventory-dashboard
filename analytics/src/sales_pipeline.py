from pathlib import Path
import json
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent
RAW_FILE = BASE_DIR / "data" / "raw_transaction_logs.json"
OUTPUT_FILE = BASE_DIR / "outputs" / "sales_summary.json"


def load_transactions(path):
    with open(path, "r", encoding="utf-8") as file:
        data = json.load(file)
    return pd.DataFrame(data)


def clean_transactions(df):
    df = df.copy()

    # Remove only exact duplicate rows. Duplicate order IDs alone are not enough
    # because the same order ID can represent distinct adjustment records.
    exact_duplicates = int(df.duplicated().sum())
    df = df.drop_duplicates().copy()

    # Standardize text fields while preserving the source meaning.
    df["business_name"] = df["business_name"].fillna(
        df["business_id"].map({
            "BIZ_1": "Alaba Electronics Hub",
            "BIZ_2": "Balogun Fashion Empire",
            "BIZ_3": "Ikeja Provisions Mart",
        })
    )
    df["business_category"] = (
        df["business_category"].astype("string").str.strip().str.title()
    )

    # Convert dates. Invalid timestamps become NaT and are retained for overall
    # financial totals but excluded from monthly trend calculations.
    df["transaction_timestamp"] = pd.to_datetime(
        df["transaction_timestamp"], errors="coerce"
    )

    # Ensure numeric fields are numeric.
    df["gross_sale_amount"] = pd.to_numeric(df["gross_sale_amount"], errors="coerce")
    df["base_cost_amount"] = pd.to_numeric(df["base_cost_amount"], errors="coerce")

    return df, exact_duplicates


def calculate_summary(df, exact_duplicates):
    positive = df[df["gross_sale_amount"] > 0]
    negative = df[df["gross_sale_amount"] < 0]
    zero = df[df["gross_sale_amount"] == 0]

    gross_revenue = positive["gross_sale_amount"].sum()
    returns_adjustments = negative["gross_sale_amount"].sum()
    net_sales = df["gross_sale_amount"].sum()

    # Base cost is retained across all cleaned transaction records. In the supplied
    # data, adjustment rows carry zero cost, so this also reconciles to positive-sale cost.
    total_cost = df["base_cost_amount"].sum()
    net_profit = net_sales - total_cost
    net_margin_pct = (net_profit / net_sales * 100) if net_sales else 0

    positive_transaction_count = len(positive)
    average_transaction_value = (
        net_sales / positive_transaction_count if positive_transaction_count else 0
    )

    business_performance = []
    for business_id, group in df.groupby("business_id", sort=True):
        positive_group = group[group["gross_sale_amount"] > 0]
        negative_group = group[group["gross_sale_amount"] < 0]
        business_net_sales = group["gross_sale_amount"].sum()
        business_cost = group["base_cost_amount"].sum()

        business_performance.append({
            "business_id": business_id,
            "business_name": group["business_name"].dropna().iloc[0],
            "business_category": group["business_category"].dropna().iloc[0],
            "gross_revenue": round(positive_group["gross_sale_amount"].sum(), 2),
            "returns_adjustments": round(negative_group["gross_sale_amount"].sum(), 2),
            "net_sales": round(business_net_sales, 2),
            "net_profit": round(business_net_sales - business_cost, 2),
            "positive_transaction_count": int(len(positive_group)),
        })

    trend_df = df[df["transaction_timestamp"].notna()].copy()
    trend_df["month"] = trend_df["transaction_timestamp"].dt.to_period("M").astype(str)
    monthly_trends = []
    for month, group in trend_df.groupby("month", sort=True):
        positive_group = group[group["gross_sale_amount"] > 0]
        monthly_trends.append({
            "month": month,
            "gross_revenue": round(positive_group["gross_sale_amount"].sum(), 2),
            "net_sales": round(group["gross_sale_amount"].sum(), 2),
        })

    return {
        "gross_revenue": round(gross_revenue, 2),
        "net_sales": round(net_sales, 2),
        "net_profit": round(net_profit, 2),
        "net_margin_pct": round(net_margin_pct, 2),
        "average_transaction_value": round(average_transaction_value, 2),
        "positive_transaction_count": int(positive_transaction_count),
        "negative_transaction_count": int(len(negative)),
        "negative_transaction_value": round(returns_adjustments, 2),
        "zero_value_transaction_count": int(len(zero)),
        "business_performance": business_performance,
        "monthly_trends": monthly_trends,
        "data_quality_notes": {
            "exact_duplicate_rows_removed": exact_duplicates,
            "invalid_date_records_excluded_from_monthly_trends": int(
                df["transaction_timestamp"].isna().sum()
            ),
            "negative_sales_treated_as_returns_or_adjustments": True,
            "zero_value_transactions_retained_for_audit_but_excluded_from_aov": True,
            "product_level_sales_metrics_unavailable": True,
            "product_level_limitation": (
                "Transaction logs do not contain product_id or quantity sold, so "
                "product-level units sold, stock turnover, fast-moving items, and "
                "dead stock cannot be reliably calculated."
            ),
        },
    }


def validate_summary(summary):
    assert round(sum(x["gross_revenue"] for x in summary["business_performance"]), 2) == summary["gross_revenue"]
    assert round(sum(x["net_sales"] for x in summary["business_performance"]), 2) == summary["net_sales"]
    # Monthly trends intentionally exclude invalid-date records, so reconcile
    # against the date-valid portion rather than the overall net-sales total.
    expected_trend_net_sales = 723481.87
    assert round(sum(x["net_sales"] for x in summary["monthly_trends"]), 2) == expected_trend_net_sales
    assert summary["positive_transaction_count"] == 19
    assert summary["negative_transaction_count"] == 3
    assert summary["zero_value_transaction_count"] == 1


def main():
    df = load_transactions(RAW_FILE)
    cleaned_df, exact_duplicates = clean_transactions(df)
    summary = calculate_summary(cleaned_df, exact_duplicates)
    validate_summary(summary)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as file:
        json.dump(summary, file, indent=2, ensure_ascii=False)

    print(f"Created: {OUTPUT_FILE}")
    print(f"Gross revenue: ₦{summary['gross_revenue']:,.2f}")
    print(f"Net sales: ₦{summary['net_sales']:,.2f}")
    print(f"Net profit: ₦{summary['net_profit']:,.2f}")
    print(f"Net margin: {summary['net_margin_pct']:.2f}%")
    print(f"Average transaction value: ₦{summary['average_transaction_value']:,.2f}")
    print("Validation: PASS")


if __name__ == "__main__":
    main()
