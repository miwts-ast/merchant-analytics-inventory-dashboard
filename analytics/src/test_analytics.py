from pathlib import Path
import json

BASE = Path(__file__).resolve().parents[1]
OUT = BASE / "output"

FILES = [
    "sales_summary.json",
    "business_performance.json",
    "monthly_trends.json",
    "inventory_health.json",
    "inventory_products.json",
    "validation_report.json",
]

for name in FILES:
    path = OUT / name
    assert path.exists(), f"Missing {name}"
    with open(path, encoding="utf-8") as f:
        json.load(f)

sales = json.load(open(OUT / "sales_summary.json", encoding="utf-8"))
business = json.load(open(OUT / "business_performance.json", encoding="utf-8"))
monthly = json.load(open(OUT / "monthly_trends.json", encoding="utf-8"))
health = json.load(open(OUT / "inventory_health.json", encoding="utf-8"))
products = json.load(open(OUT / "inventory_products.json", encoding="utf-8"))
validation = json.load(open(OUT / "validation_report.json", encoding="utf-8"))

assert sales["gross_revenue"] == 801981.87
assert sales["net_sales"] == 793481.87
assert sales["net_profit"] == 221268.25
assert sales["average_transaction_value"] == 41762.2
assert len(business) == 3
assert len(monthly) == 6
assert health["total_unique_products"] == 20
assert health["inventory_value"] == 5456811.38
assert len(products) == 20
assert validation["validation_status"] == "PASS"
assert all(check["status"] for check in validation["checks"])
print("ALL TESTS PASSED")
