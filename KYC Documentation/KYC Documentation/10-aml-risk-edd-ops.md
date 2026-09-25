# 17–21. AML / PEP / Sanctions, Risk Scoring, EDD, Manual Review, KYC Refresh

> Diagrams: [diagrams/07-aml-pep-sanctions.mmd](diagrams/07-aml-pep-sanctions.mmd), [08-risk-assessment.mmd](diagrams/08-risk-assessment.mmd), [09-edd-flow.mmd](diagrams/09-edd-flow.mmd), [10-kyc-refresh.mmd](diagrams/10-kyc-refresh.mmd).  
> Not legal advice.

---

## 17. AML / PEP / Sanctions screening

### Regulatory backbone (**A**)

- Pre-screen vs **UNSC** designations and **ATA 1997** proscribed lists (Consolidated Framework §F.4; AML TFS regulations)  
- PEP identification and EDD treatment (AML Regulation–5)  
- Ongoing monitoring and STR/CTR to FMU (AML Reg–7)  

### Screening flow

```text
Profile complete
   → Sanctions/TFS screen (customer + associated parties)
   → PEP screen
   → Internal watchlist / prior reject list
   → (Optional) Adverse media
   → If potential hit → Case (alert adjudication)
   → Confirmed prohibited → Reject / freeze path
   → Clear / false positive → Risk assessment
```

### Adjudication rules (policy-owned)

| Result | Action |
|--------|--------|
| Confirmed sanctions/proscribed | Reject; no account; notify per legal counsel process |
| Potential hit | Manual review; maker-checker |
| PEP match | EDD + senior management approval |
| Provider error | Do not STP approve |

### Data / services

- `screening_results`  
- Sanctions Service, PEP Service, Case Management  
- Store **list version** for audit reconstructability  

---

## 18. Customer risk scoring

### Requirement

CRP model documented and approved (**A**). Digital/non-face-to-face is a delivery-channel risk factor (**B** interpretation of RBA).

### Illustrative factor groups (finalize with Compliance)

| Group | Examples | Weighting notes |
|-------|----------|-----------------|
| Customer | PEP, occupation/DNFBP, nationality, residency | High for PEP/DNFBP |
| Product | Current vs savings, limits, cards | |
| Channel | App remote, device risk, IP/geo mismatch | |
| Verification assurance | BV success vs Verisys vs video | Lower assurance → higher risk |
| Behavior expected | Turnover vs declared income | |
| Fraud signals | Duplicate device/CNIC attempts | |

### Outputs

- `LOW` → STP eligible  
- `MEDIUM` → additional info or light touch review  
- `HIGH` → EDD_REQUIRED  

Store `model_version` + `factors_json` on each assessment.

### Automatic outcomes

| Rating | Approval | Rejection |
|--------|----------|-----------|
| Low + clear screening + BV | Automatic approve | Automatic reject only for hard policy fails (sanctions, age, ineligible ID, fraud lock) |
| Medium | Conditional | — |
| High | No STP | — |

---

## 19. EDD process

Triggers (**A**): high CRP; PEPs; other bank policy triggers (complex ownership — entities Phase 2).

Steps:

1. Open `kyc_cases` type `EDD`  
2. Request additional documents / SoW-SoF evidence  
3. **Recorded video KYC/interview** for non-face-to-face EDD (Consolidated §G)  
4. Senior management approval for PEPs  
5. Enhanced monitoring flag on activation  
6. Retain video per record-retention rules  

---

## 20. Manual review / KYC operations dashboard

### Queues

- Pending cases  
- High-risk / EDD  
- Failed verification  
- Sanctions / PEP hits  
- Duplicate identity  
- Document exceptions  
- Expired documents / BV pending  
- KYC refresh due  
- SLA breach (individual TAT 2 WD)  

### Maker-checker

| Action | Maker | Checker |
|--------|-------|---------|
| False-positive sanctions clear | Analyst | Senior / Compliance |
| Approve high-risk | Senior KYC | Compliance Officer (policy) |
| Override risk rating | Senior KYC | Compliance |
| Reject | Analyst | Senior (except auto sanctions reject) |

### Roles

| Role | Permissions |
|------|-------------|
| KYC Analyst | View cases PII need-to-know; propose actions |
| Senior KYC Analyst | Approve medium; checker for analyst |
| Compliance Officer | Policy overrides; PEP approvals per matrix |
| AML Officer | Sanctions/STR escalation |
| KYC Administrator | Queues, assignments, reference data |
| Auditor | Read-only audit and cases |

---

## 21. KYC refresh process

```text
Scheduler (by risk rating interval)
  → Mark REFRESH_DUE / notify customer
  → Customer updates profile + fresh screening + risk
  → If overdue beyond policy → restrict debit / freeze per AML policy
  → If material change → EDD/manual as needed
  → Complete → update next refresh date
```

Also event-driven refresh triggers: CNIC expiry, adverse screening hit, channel fraud event, product upgrade.

### Dormancy

Align with AML definition of dormant/inoperative (no customer-initiated txn **or** digital login for preceding one year — per AML Definitions updated text). Reactivation requires identification/verification per regulations.
