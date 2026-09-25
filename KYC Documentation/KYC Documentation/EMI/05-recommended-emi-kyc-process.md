# 11. Recommended EMI wallet KYC process

> Combines EMI Regulations §12–15, Consolidated Framework, and AML RBA. UX labels **D**. Not legal advice.

## Design goals

1. Digital-only issuance (no agent-opened wallets).  
2. Fail-closed sanctions; fail-controlled NADRA.  
3. Limit tier is a **first-class state**, not a hidden flag.  
4. One CNIC, one instrument.  
5. Trust-account posting is orthogonal to KYC state but **blocked** until screening allows use of payment services (except the single pre-verification credit if we enable that product flag).

## High-level flow

```text
Open wallet
  → Tracking ID on screen
  → Mobile OTP (2FA)
  → SMS Tracking ID
  → Consents (T&Cs, privacy, NADRA/BV, charges)
  → Identity (Table-A + EMI §12 extras)
  → Live photo + live CNIC image
  → Sanctions / PEP pre-screen
  → NADRA Verisys (minimum) ──► WALLET_ACTIVE · VERISYS · 50k
         │
         └─ optional / prompted NADRA BV ──► BV · 400k
                │
                └─ later: SoF + SIM pairing + CRP + PSP&OD ──► ENHANCED · up to 1M
```

**Pilot licence:** BV monthly load cap is **200k**, not 400k. Gate this by `licence_phase`.

## Decisioning

| Outcome | When |
|---------|------|
| STP Verisys wallet | ID valid, Verisys pass, screening clear, CRP LOW/MEDIUM per policy, consents OK |
| STP BV wallet | Same + NADRA BV success |
| Hold | NADRA timeout; screening potential hit; incomplete docs |
| Video KYC | BV and eligible Verisys+MSISDN fail; no branch |
| Decline | True sanctions/fraud; duplicate CNIC (redirect not “policy reject”); consent refusal |
| Close + STR | One-credit used and credentials never verified |

## Phasing

| Phase | Scope |
|-------|--------|
| P0 | State machine, §12 fields, OTP 2FA, consents, tracking ID, audit, uniqueness |
| P1 | Verisys + live photo + screening + 50k wallet |
| P2 | NADRA BV in-app + offline BV receipt/ATM adapter + 400k (or 200k if pilot) |
| P3 | Video KYC, EDD, PEP, case management |
| P4 | TMS go-live quality, agent cash-in/out, refresh |
| P5 | Enhanced 1M (after commercial + PSP&OD) |
| P6 | Minors / merchants / remittance exclusions |

Screens: [05a-emi-user-journey.md](05a-emi-user-journey.md).  
All paths: [05b-emi-user-journeys-catalog.md](05b-emi-user-journeys-catalog.md).
