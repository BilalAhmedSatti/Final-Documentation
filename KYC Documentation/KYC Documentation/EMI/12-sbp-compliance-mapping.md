# 25–26. EMI compliance mapping

> Maps **A** requirements to implementation. Statuses are design-time. Not legal advice.

| ID | Requirement | Source | Component | Data | API / control | Status |
|----|-------------|--------|-----------|------|---------------|--------|
| E-A01 | Digital onboarding default | EMI §12 | KYC app | `kyc_applications.channel` | POST /applications | Designed |
| E-A02 | Minimum CDD fields + 2 extra | EMI §12.I | Identity module | identity + extras | POST /identity | Designed |
| E-A03 | 2FA | EMI §12.II | OTP | `contact_verifications` | /contact/verify | Designed |
| E-A04 | Verify before activate + TFS pre-screen | EMI §12.III | Screening + NADRA | `screenings` | hold on fail | Designed |
| E-A05 | One credit then close+STR | EMI §12.IV | Policy flag | `unverified_one_credit` | close job | Designed (default **off**) |
| E-A06 | EDD high risk | EMI §12.V / AML | Case + video | `edd_cases` | /video-kyc | Designed |
| E-A07 | T&Cs consent | EMI §12.VI | Consents | `consents` | POST /consents | Designed |
| E-A08 | One CNIC one instrument | EMI §12.VII | Uniqueness | hash unique | DUPLICATE_CNIC | Designed |
| E-A09 | Real-time alerts | EMI §12.VIII | Notify | `alerts` | ledger hook | Designed |
| E-A10 | STR on suspicion | EMI §12.IX / AML | STR | `str_cases` | ops queue | Designed |
| E-A11 | TFS freeze / no service | EMI §12.X | Screening | lists | fail closed | Designed |
| E-A12 | Pilot/commercial/enhanced/minor limits | EMI §14 | Limit engine | `limit_policies` | ledger reject | Designed |
| E-A13 | Enhanced controls not outsourced | EMI §14.III | In-house KYC | artefacts | /enhanced | Designed |
| E-A14 | Issue/redeem at par; cash redemption BV | EMI §15 | Ledger + BV | `trust_postings` | redemption API | Designed |
| E-A15 | Trust account, no co-mingle | EMI §16 | Trust adapter | `trust_postings` | recon job | Designed |
| E-A16 | Agents: approval; no issuance | EMI §17 | Agent GW | `agents` | AGENT_CANNOT_ISSUE | Designed |
| E-A17 | TMS | EMI §22.I | TMS | alerts | scenarios | Designed |
| E-A18 | RBA + new-tech risk | EMI §22.II–III | Risk | assessments | go-live gate | Designed |
| E-A19 | Records ≥10 years | EMI §24.II | Storage | retention class | Legal memo | Open |
| E-A20 | Pre-pilot + annual system audit | EMI §21.IV | GRC | audit reports | — | Process |
| E-A21 | Consolidated: live photo, TAT 2 WD, tracking ID, BV ladder, video fallback | BPRD C1/2025 | KYC | TAT clocks | /tracking | Designed |
| E-A22 | Table-A / no anonymous | AML + Consolidated | KYC | Table-A | validation | Designed |
| E-A23 | No interest on e-money | EMI §7.V | Product | — | no profit module | Designed |
| E-A24 | No banking/lending | EMI §7.III | Licence | — | product firewall | Process |

Open items: Shared e-KYC EMI onboarding; Annexure-J field list from PDF annex (Legal extract); NADRA contract.
