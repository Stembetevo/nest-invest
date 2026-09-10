# nest (Nest Bills)

**M-Pesa for Treasury Bills.** nest lets anyone in Kenya start at **KSh 100**, pledge via M-Pesa in **3 taps**, and earn current government T-bill rates. nest does not take investment risk — it routes. The fee is **1% of the interest**, not of principal.

This repository is a **Phase 1 product demo**: auction alerts, 3-tap pledging, and a simple portfolio. M-Pesa STK, CBK auction books, and DhowCSD settlement are simulated in the browser (`localStorage`). Do not send real money here. This is not a CMA-licensed offer and not a Central Bank of Kenya product.

## Run locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43123](http://127.0.0.1:43123).

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server on port **43123** |
| `npm run build` | Production build |
| `npm run start` | Serve the production build on 43123 |
| `npm run lint` | ESLint |

## Try the demo

1. Home shows this week’s 91 / 182 / 364-day auctions (rates ~15%, last 91-day take-up 204% oversubscribed).
2. **Alerts** — toggle SMS-style reminders (stored on device only).
3. **Pledge from KSh 100** — pick an amount, confirm the STK sheet, enter a 4-digit PIN.
4. Any PIN works except **0000**, which fails so you can see the error path. Cancel the sheet to abandon the pledge.
5. **Portfolio** lists pledges, expected interest, nest’s 1% cut, and payout date.
6. **How it works → Reset this demo** clears pledges and alerts.

Fee math: `interest = principal × annualRate × (days / 365)`; `nestFee = interest × 1%`; you keep the rest.

## What this is not (yet)

- Real Safaricom Daraja STK, CBK auction APIs, or DhowCSD accounts
- KYC, CMA licensing, or moving actual M-Pesa funds
- Phase 2 auto-laddering (beat MMFs without watching every Wednesday)
- Phase 3 secondary market (make T-bills feel liquid)

Identity is an M-Pesa number kept in `localStorage` under `nest-bills-v1`. There is no login and no database.
