# 9–10. Public EMI KYC benchmarks

> Public help centres and press only. **Not** SBP examination findings. Extra product limits beyond EMI §14 are **D** unless Legal maps them to regulation. Not legal advice.

## Method

- Use **official help / T&Cs** where available.  
- Map to **Verisys 50k / BV 400k / remittance 1.5m exclusion**.  
- JazzCash / EasyPaisa Bank / Mashreq NEO are **out of cohort** (not EMIs).

## Summary matrix

| EMI | Signup (public) | Default monthly incoming | Upgrade to 400k | Other public signals | Confidence |
|-----|-----------------|--------------------------|-----------------|----------------------|------------|
| **SadaPay** | App; CNIC; SBP 50k default stated | PKR 50,000 | In-app fingerprint BVS **or** NADRA e-Sahulat barcode receipt via chat | Help lists max balance, debit cycles, ATM — treat as product **D** | High (help.sadapay.pk) |
| **NayaPay** | CNIC, mobile, live selfie | PKR 50,000 | In-app fingerprint **or** Meezan ATM biometric (no card) | Help Jun 2025: cash-out 10k→50k; remittance →1.5m; merchant/P2P rows | High (help.nayapay.com) |
| **Finja / OPay** | Not publicly disclosed in this pass | Assume regulatory ladder until proven | Unknown channel | Legal entity vs brand: confirm | Low |
| **Digitt+ (Akhtar Fuiou)** | Not publicly disclosed | Assume ladder | Unknown | — | Low |
| **OneZapp (EPS)** | Not publicly disclosed | Assume ladder | Unknown | FSR: consumers, merchants, agents | Low |
| **Keenu (Wemsol)** | Not publicly disclosed | Assume ladder | Unknown | Wallet **+ gateway** on commercial licence | Low |

Sources:

- https://help.sadapay.pk/en/articles/7185807-what-are-my-personal-account-limits  
- https://help.sadapay.pk/en/articles/6404720-how-do-i-increase-my-sadapay-wallet-limit-via-in-app-bvs  
- https://help.sadapay.pk/en/articles/4939283-how-do-i-increase-my-sadapay-wallet-limit-wallet-limit-via-nadra-e-sahulat-centre  
- https://help.nayapay.com/article/68-are-there-any-account-limits  

## Patterns we should copy (C, not A)

1. **Explicit SBP 50k copy** on the home/limit screen — customers understand BV is the upgrade.  
2. **Two BV channels:** in-app SDK **and** offline authenticated NADRA/ATM/agent BV (helps seniors / poor prints).  
3. **Refund e-Sahulat fee** (SadaPay) — product **D**, good UX.  
4. **ATM BVS without inserting a card** (NayaPay + Meezan) — partnership **D**.  
5. Do **not** copy undocumented max-balance or yearly international rows into “SBP mandatory.”

## Patterns we must not copy blindly

- Treating selfie as sufficient for **400k** (it is not BV).  
- Opening a second wallet for the same CNIC.  
- Agent-led **issuance**.  
- Paying profit on wallet float (DRB competitive response — **illegal** for EMI).  
- Silent STP if screening/NADRA is down.

Full grid: [appendices/B-comparative-emi-matrix.md](appendices/B-comparative-emi-matrix.md).
