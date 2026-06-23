# drop — project notes

## Page naming (user's shorthand)
- **«начальная»** = `Drop Landing.html` — лендинг, hero "Predict. Connect. Get Rewarded."
- **«дешборд»** = `Drop Dashboard.html` — страница "Claim Your Rewards"

When the user says "начальная" / "начальную" they mean the landing page.
When they say "дешборд" / "дашборд" they mean the dashboard page.

## Notes
- Wallet "connection" = entering a Polymarket wallet address. The dashboard then pulls **real, live read-only data** from the public Polymarket Data API (data-api.polymarket.com): portfolio value, positions, P&L, trade count, and recent activity. No real wallet signing / transactions — claim buttons are decorative.
- Live data logic lives in `polydrop-pm.js` (shared by landing + dashboard). Also fetches lifetime volume from lb-api.polymarket.com/volume.
- Allocation model: $DROP = lifetime volume × 0.1 coins; 1 $DROP = $0.50 (so USD ≈ volume × 0.05). Dashboard shows two decorative claim options: "Claim now" (instant USD) and "Claim at TGE" (full token allocation) → confirm-ownership modal → success. No real signing.
- Flow: landing "Get Started" → Fair Participation Policy (anti-Sybil checkboxes, sets `drop-agreed`) → "Connect your Polymarket wallet" address input → fetch → dashboard. Dashboard is gated: requires `drop-agreed`, redirects to landing otherwise. Connected address persists in `drop-pm-address`.
- Theme: site is light-mode only. The theme toggle was removed; pages force light (`data-theme` is cleared on load). Dark-theme CSS rules remain in files but are never activated.
