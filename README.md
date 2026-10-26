# Veritas

**Prove your income. Unlock credit.** Veritas turns informal earnings — tills, paybills, and regular senders — into a verified income report a lender can read. The report is free for the earner. Lenders pay for the proof.

This repository is a **product demo**. Sign-in, the statement read, and lender sharing all stay in the browser (`localStorage`). Nothing is sent to Safaricom. Veritas is not a licensed credit bureau and not a lender.

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

1. The landing page is one scroll: the problem, how a report is built, a sample file, pricing, and questions.
2. **Get started** asks for a name and a Safaricom number (`07…` or `2547…`). Any valid number works. One profile is kept on this device.
3. **Dashboard → Share statement** simulates a six-month read. The income, score, and sources are derived from the number so the same phone always rebuilds the same file.
4. **Share with a lender** marks the report as shared. Sign out from the dashboard or the menu.
5. Signing in again with the same number reopens that report.

Identity is stored under `veritas-v1`.
