# 17–21. AML, risk, EDD, agents, refresh (EMI)

> EMI §22–24 + AML/CFT/CPF Regulations + Consolidated EDD. Not legal advice.

## TMS (**A**)

EMI **shall** deploy automated TMS. Enhanced wallets require **robust** scenarios (1:N, N:1, etc.) and that control **must not be outsourced**.

Minimum scenario families (**B** as catalogue; **A** as TMS existence):

- Velocity vs declared SoI  
- Many-to-one / one-to-many  
- Just-below-limit structuring vs 50k/400k/1M  
- New-device + first large cash-out  
- Minor wallet funded from unexpected sources  
- Agent cash-in immediately followed by IBFT out  

STR to FMU on suspicion (issuance **or** processing) (**A**).

## Risk / EDD

- Board-approved RBA and CRP.  
- High risk / PEP: EDD + senior approval (AML Reg–5) + recorded video KYC when NFTF (Consolidated).  
- New products (cards, remittance, escrow, APIs): ML/TF assessment **before** launch (**A**).

## Agents (**A**)

- One-time SBP approval; SLA; public agent list.  
- Board ANM policy (onboarding, fraud, liquidity, complaints, termination).  
- Agents **must not** represent themselves as the EMI.  
- **Must not issue** e-money instruments.  
- May use existing **branchless banking** agent network.  
- SBP may inspect agents and order termination.

## Refresh / ongoing CDD (**A**)

Periodic update proportionate to CRP (**B** intervals; **A** obligation). Event-driven: ID expiry, adverse hit, limit upgrade. Overdue: **explicit** restriction, not silent clamp.

## Trust / float (ops overlap)

Reconciliation of e-money in issue vs trust account(s). Concentration: ≤50% with one trustee if OEB > PKR 300m. Rating downgrade: change trustee in **3 months**.

## Reporting to SBP

- Annual audited FS (3 months)  
- Quarterly capital returns  
- Instrument counts, volumes, trust balances  
- Fraud/theft/robbery including agents  
- Cyber: Annexure F monthly; **major** within **48 hours** to PSP&OD  
