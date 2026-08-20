#!/usr/bin/env python3
"""Build the fictional Harbor House OPFF demo pack. No real finances."""

from __future__ import annotations

import json
import random
import zipfile
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DEST = ROOT.parent.parent / "house.opff.prim"

MONTHS = [
    "2025-09", "2025-10", "2025-11", "2025-12",
    "2026-01", "2026-02", "2026-03", "2026-04",
    "2026-05", "2026-06", "2026-07", "2026-08",
]

rng = random.Random(14)


def money(n: float) -> float:
    return round(float(n), 2)


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def write_jsonl(name: str, rows: list[dict]) -> None:
    (ROOT / name).write_text("".join(json.dumps(r, separators=(",", ":")) + "\n" for r in rows), encoding="utf-8")


def row(n, date, category, payee, amount, account, memo):
    return {
        "id": f"TXN-{n:04d}",
        "date": date,
        "category": category,
        "payee": payee,
        "amount": money(amount),
        "account": account,
        "memo": memo,
    }


def main() -> None:
    finance = {
        "id": "house-harbor",
        "profile": "opff",
        "title": "Harbor House",
        "status": "operating",
        "currency": "USD",
        "plane": "personal",
        "as_of": "2026-08-18",
        "people": ["Jordan Hale", "Sam Hale"],
        "note": "Fictional household. Not anyone's real ledger.",
    }
    (ROOT / "finance.json").write_text(json.dumps(finance, indent=2) + "\n", encoding="utf-8")
    (ROOT / "index.md").write_text(
        """---
okf_version: "0.2"
profile: opff
title: Harbor House
status: operating
plane: personal
currency: USD
---

# Harbor House

A fictional household ledger. Accounts, cash flow, budgets, goals, and
net-worth snapshots stay in this pack. The charts cite the file.

Not real bank credentials. Not anyone's live finances.
""",
        encoding="utf-8",
    )

    accounts = [
        {"id": "ACC-CHK", "name": "Harbor Checking", "type": "depository", "class": "asset", "institution": "Harbor Credit Union", "balance": 4280.14},
        {"id": "ACC-SAV", "name": "Harbor Savings", "type": "depository", "class": "asset", "institution": "Harbor Credit Union", "balance": 18240.00},
        {"id": "ACC-HYSA", "name": "North HYSA", "type": "depository", "class": "asset", "institution": "North Cash", "balance": 24150.66},
        {"id": "ACC-TRIP", "name": "West Trip", "type": "depository", "class": "asset", "institution": "Harbor Credit Union", "balance": 640.00},
        {"id": "ACC-CC", "name": "Harbor Visa", "type": "credit", "class": "liability", "institution": "Harbor Credit Union", "balance": -2140.88, "limit": 8500, "apr": 0.1899},
        {"id": "ACC-BRK", "name": "North Brokerage", "type": "investment", "class": "asset", "institution": "North Brokerage", "balance": 38620.40},
        {"id": "ACC-401K", "name": "Harbor 401(k)", "type": "retirement", "class": "asset", "institution": "Harbor Retirement", "balance": 94210.00},
        {"id": "ACC-ROTH", "name": "Harbor Roth IRA", "type": "retirement", "class": "asset", "institution": "Harbor Retirement", "balance": 18400.00},
        {"id": "ACC-HSA", "name": "North HSA", "type": "retirement", "class": "asset", "institution": "North Health", "balance": 4120.00},
        {"id": "ACC-HOME", "name": "12 Pier Street", "type": "real_estate", "class": "asset", "institution": "Harbor County", "balance": 365000.00},
        {"id": "ACC-MTG", "name": "House mortgage", "type": "loan", "class": "liability", "institution": "North Home Loan", "balance": -218400.00, "rate": 0.0625, "min_pay": 2410},
        {"id": "ACC-CAR", "name": "Civic loan", "type": "loan", "class": "liability", "institution": "Harbor Auto", "balance": -12880.00, "rate": 0.0549, "min_pay": 420},
    ]
    write_jsonl("accounts.jsonl", accounts)

    vendors = {
        "Groceries": ["Hearth Market", "Corner Produce", "Bulk Barn"],
        "Dining": ["West Pier Cafe", "Noodle Room", "Saturday Pizza"],
        "Shopping": ["Harbor Hardware", "North Outfitters"],
    }
    txns = []
    n = 1
    for month in MONTHS:
        y, m = month.split("-")
        for day, who, amt in (
            (1, "Harbor Studio", 3850),
            (15, "Harbor Studio", 3850),
            (7, "North Clinic", 3100),
            (21, "North Clinic", 3100),
        ):
            txns.append(row(n, f"{y}-{m}-{day:02d}", "Income", who, amt, "ACC-CHK", "paycheck"))
            n += 1
        txns.append(row(n, f"{y}-{m}-01", "Income", "Harbor Studio match", 400, "ACC-401K", "401k match"))
        n += 1
        txns.append(row(n, f"{y}-{m}-01", "Housing", "North Home Loan", -2410, "ACC-CHK", "mortgage"))
        n += 1
        txns.append(row(n, f"{y}-{m}-03", "Housing", "Harbor HOA", -138, "ACC-CHK", "hoa"))
        n += 1
        txns.append(row(n, f"{y}-{m}-05", "Transport", "Civic loan", -420, "ACC-CHK", "auto loan"))
        n += 1
        txns.append(row(n, f"{y}-{m}-04", "Insurance", "Harbor Mutual", -96, "ACC-CHK", "home"))
        n += 1
        txns.append(row(n, f"{y}-{m}-06", "Insurance", "North Auto", -128, "ACC-CHK", "auto"))
        n += 1
        txns.append(row(n, f"{y}-{m}-08", "Utilities", "Harbor Power", money(-rng.uniform(95, 140)), "ACC-CHK", "electric"))
        n += 1
        txns.append(row(n, f"{y}-{m}-09", "Utilities", "North Water", money(-rng.uniform(38, 62)), "ACC-CHK", "water"))
        n += 1
        txns.append(row(n, f"{y}-{m}-10", "Utilities", "Harbor Fiber", -79, "ACC-CHK", "internet"))
        n += 1
        txns.append(row(n, f"{y}-{m}-11", "Phone", "Harbor Mobile", -86, "ACC-CC", "phone"))
        n += 1
        txns.append(row(n, f"{y}-{m}-11", "Fitness", "Pier Fitness", -48, "ACC-CC", "gym"))
        n += 1
        txns.append(row(n, f"{y}-{m}-12", "Subscriptions", "Stream Three", -16.99, "ACC-CC", "stream"))
        n += 1
        txns.append(row(n, f"{y}-{m}-12", "Subscriptions", "News Desk", -12, "ACC-CC", "news"))
        n += 1
        txns.append(row(n, f"{y}-{m}-12", "Subscriptions", "Cloud Mail", -9, "ACC-CC", "mail"))
        n += 1
        txns.append(row(n, f"{y}-{m}-14", "Health", "Harbor Pharmacy", money(-rng.uniform(18, 54)), "ACC-CC", "pharmacy"))
        n += 1
        txns.append(row(n, f"{y}-{m}-15", "Transfer", "Harbor 401(k)", -800, "ACC-CHK", "401k deferral"))
        n += 1
        txns.append(row(n, f"{y}-{m}-16", "Transfer", "Harbor Roth IRA", -500, "ACC-CHK", "roth"))
        n += 1
        txns.append(row(n, f"{y}-{m}-16", "Transfer", "North HSA", -200, "ACC-CHK", "hsa"))
        n += 1
        txns.append(row(n, f"{y}-{m}-18", "Giving", "Harbor Food Bank", -150, "ACC-CHK", "gift"))
        n += 1
        txns.append(row(n, f"{y}-{m}-22", "Transfer", "Harbor Savings", -400, "ACC-CHK", "to savings"))
        n += 1
        txns.append(row(n, f"{y}-{m}-23", "Transfer", "West Trip", -80, "ACC-CHK", "sinking fund"))
        n += 1
        txns.append(row(n, f"{y}-{m}-24", "Transfer", "North Brokerage", -250, "ACC-CHK", "invest"))
        n += 1
        for _ in range(6):
            day = rng.randint(2, 27)
            txns.append(row(n, f"{y}-{m}-{day:02d}", "Groceries", rng.choice(vendors["Groceries"]), money(-rng.uniform(62, 148)), "ACC-CHK", "groceries"))
            n += 1
        for _ in range(5):
            day = rng.randint(3, 28)
            txns.append(row(n, f"{y}-{m}-{day:02d}", "Dining", rng.choice(vendors["Dining"]), money(-rng.uniform(18, 82)), "ACC-CC", "dining"))
            n += 1
        txns.append(row(n, f"{y}-{m}-{rng.randint(4, 26):02d}", "Transport", "Harbor Fuel", money(-rng.uniform(36, 74)), "ACC-CC", "gas"))
        n += 1
        if rng.random() > 0.28:
            txns.append(row(n, f"{y}-{m}-{rng.randint(6, 27):02d}", "Shopping", rng.choice(vendors["Shopping"]), money(-rng.uniform(28, 168)), "ACC-CC", "shop"))
            n += 1
        if month == "2025-12":
            txns.append(row(n, f"{y}-{m}-20", "Shopping", "North Outfitters", -240, "ACC-CC", "gifts"))
            n += 1
        if month == "2026-03":
            txns.append(row(n, f"{y}-{m}-11", "Travel", "West Line Rail", -186, "ACC-CC", "weekend"))
            n += 1
        if month == "2026-04":
            txns.append(row(n, f"{y}-{m}-14", "Income", "Harbor Refund", 1800, "ACC-CHK", "tax refund"))
            n += 1
        if month == "2026-06":
            txns.append(row(n, f"{y}-{m}-16", "Health", "North Clinic", -220, "ACC-CHK", "visit"))
            n += 1

    txns.sort(key=lambda t: t["date"])
    for i, t in enumerate(txns, 1):
        t["id"] = f"TXN-{i:04d}"
    write_jsonl("transactions.jsonl", txns)

    skip = {"Transfer", "Income"}
    actual = defaultdict(float)
    for t in txns:
        if t["date"].startswith("2026-08") and t["amount"] < 0 and t["category"] not in skip:
            actual[t["category"]] += abs(t["amount"])
    limits = {
        "Housing": 2600, "Groceries": 900, "Dining": 320, "Transport": 280,
        "Utilities": 260, "Insurance": 230, "Phone": 90, "Fitness": 50,
        "Health": 180, "Subscriptions": 90, "Shopping": 250, "Giving": 150, "Travel": 200,
    }
    budgets = [
        {"category": cat, "budget": bud, "actual": money(actual.get(cat, 0))}
        for cat, bud in limits.items()
    ]
    write_jsonl("budgets.jsonl", budgets)

    assets = sum(a["balance"] for a in accounts if a["class"] == "asset")
    liab = sum(a["balance"] for a in accounts if a["class"] == "liability")
    end_cash = sum(a["balance"] for a in accounts if a["type"] == "depository")
    end_invest = sum(a["balance"] for a in accounts if a["type"] in ("investment", "retirement"))
    end_home = next(a["balance"] for a in accounts if a["type"] == "real_estate")
    snapshots = []
    for i, month in enumerate(MONTHS):
        t = i / (len(MONTHS) - 1)
        cash = money(lerp(38200, end_cash, t) + (0 if i == len(MONTHS) - 1 else rng.uniform(-180, 180)))
        invest = money(lerp(128400, end_invest, t) + (0 if i == len(MONTHS) - 1 else rng.uniform(-240, 240)))
        home = money(lerp(348000, end_home, t))
        debt = money(lerp(-246800, liab, t))
        income = 13900.00 if month != "2026-04" else 15700.00
        spend = money(lerp(11640, 11150, t) + rng.uniform(-120, 160))
        if i == len(MONTHS) - 1:
            cash, invest, home, debt = money(end_cash), money(end_invest), money(end_home), money(liab)
            income, spend = 13900.00, 11150.00
        snapshots.append({
            "month": month,
            "net_worth": money(cash + invest + home + debt),
            "cash": cash,
            "investments": invest,
            "home": home,
            "debt": debt,
            "income": money(income),
            "spend": money(spend),
            "savings_rate": money(((income - spend) / income) * 100),
        })
    write_jsonl("snapshots.jsonl", snapshots)

    cash_now = end_cash
    monthly_spend = 11150.00
    goals = [
        {"id": "G-EF", "name": "Emergency fund", "target": 66900, "current": money(cash_now), "unit": "USD", "note": "6 months of spend"},
        {"id": "G-ROTH", "name": "Roth IRA 2026", "target": 7000, "current": 4000, "unit": "USD", "note": "annual contribution"},
        {"id": "G-TRIP", "name": "West trip", "target": 2400, "current": 640, "unit": "USD", "note": "sinking fund"},
        {"id": "G-MTG", "name": "Extra mortgage", "target": 10000, "current": 2400, "unit": "USD", "note": "principal this year"},
    ]
    write_jsonl("goals.jsonl", goals)

    names = ("index.md", "finance.json", "accounts.jsonl", "transactions.jsonl", "budgets.jsonl", "snapshots.jsonl", "goals.jsonl")
    with zipfile.ZipFile(DEST, "w", zipfile.ZIP_DEFLATED) as z:
        for name in names:
            z.write(ROOT / name, name)
    print(f"{DEST.name} {DEST.stat().st_size} bytes  txns={len(txns)}  months={len(MONTHS)}  nw={snapshots[-1]['net_worth']}")


if __name__ == "__main__":
    main()
