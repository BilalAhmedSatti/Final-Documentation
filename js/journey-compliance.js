/**
 * Rules & compliance for each KYC journey (J1–J19).
 * Plain-English must-follows for new joiners + auditors.
 * Runs after data / from-map / emi-enrich.
 */
(function () {
  const D = window.KYC_DATA;
  if (!D?.journeys) return;

  const COMPLIANCE = {
    J1: {
      headline: "Clean biometric path — strongest proof, highest ordinary limits",
      mustFollow: [
        "Tracking ID appears before the wallet number — never issue a spendable wallet early.",
        "NADRA biometric (BV) must succeed; a selfie / liveness check is not BV.",
        "Sanctions / ATA lists must be CLEAR (store list version + time).",
        "If risk is HIGH, do not finish on J1 — go to J6 for senior approval first.",
        "Wait the 2-hour cooling-off after all gates before the app can operate.",
        "One CNIC = one active wallet with this EMI (duplicate → J12).",
      ],
      instruments: [
        "CCOF — digital fields, remote BV ladder, cooling-off via K / BPRD 04",
        "EMI §12 — CDD, consent, uniqueness",
        "EMI §14.II — biometric limit band",
        "AML — pre-screen before payment services",
        "BPRD Circular 04 — device bind, short-code OTP, cooling-off",
      ],
      failClosed: [
        "NADRA or lists down → J11 (hold), never silent APPROVED",
        "Incomplete CDD pack → do not activate",
      ],
      auditMusts: [
        "Replay: Tracking ID → evidence → screen → risk → BV → cool-off end → wallet number",
        "Show NADRA BV reference (not a local selfie labelled as BV)",
        "Show list version used at pre-screen",
      ],
    },
    J2: {
      headline: "Verisys only when BV is genuinely impossible — lower limits",
      mustFollow: [
        "Use only SBP-listed reasons (e.g. age, disability, unclear prints, NRP abroad until BV exists) — not “customer skipped”.",
        "Complete the full Verisys bundle: Verisys + SIM–CNIC pairing + OTP/call-back + live photo already on spine.",
        "Activate only at Verisys band (example: ~PKR 50,000 / month load; lower cash-out) — never grant biometric-tier limits.",
        "Record the written reason BV was not possible.",
        "Later upgrade to biometric limits is a new case (J13), not an edit of this result.",
      ],
      instruments: [
        "CCOF F.1.iv–v — alternate remote verification when BV not possible",
        "EMI §12 & §14.II.a–b — Verisys band / alternate controls",
        "BPRD 04 — alternate device / call-back controls where applicable",
      ],
      failClosed: [
        "Pairing or OTP/call-back fail → J2 did not pass (move toward J3/J4/J8)",
        "Do not mark BV_PASSED on a Verisys-only pack",
      ],
      auditMusts: [
        "Show listed reason code for skipping BV",
        "Show Verisys + pairing + OTP/call-back all succeeded",
        "Show limit_tier = VERISYS in the ledger",
      ],
    },
    J3: {
      headline: "File may open, but spending stays blocked until verification finishes",
      mustFollow: [
        "DEBIT_BLOCKED is not a normal spending wallet — debits, cash-out, P2P, merchant pay stay blocked.",
        "Do not use J3 to onboard someone who failed sanctions screening.",
        "Tell the customer clearly what is still required (BV or full J2 pack).",
        "If verification never completes: close the instrument and consider STR (EMI §12.IV) — especially if a rare early-credit flag was used.",
        "Best default: do not allow money in before KYC finishes.",
      ],
      instruments: [
        "CCOF F.1.v.c — restricted / debit-blocked style outcomes",
        "EMI §12.III — credentials / restricted use tension",
        "EMI §12.IV — unverified close + STR when applicable",
        "AML — no payment services while uncleared",
      ],
      failClosed: [
        "Never silently lift the debit block without BV or full J2 success",
        "Never treat J3 as WALLET_ACTIVE for spending",
      ],
      auditMusts: [
        "Show debit-block flag and blocked rail attempts",
        "Show path out (BV/J2 complete) or close + STR consideration",
      ],
    },
    J4: {
      headline: "Last remote rung — video / partner; still not a fake biometric",
      mustFollow: [
        "Use only after higher ladder rungs cannot work for eligible reasons.",
        "Retain recorded video per CCOF G.2 (long retention).",
        "Video KYC + Verisys still does not equal NADRA BV — do not grant biometric limits from video alone.",
        "Screening must already be clear (or handled) — officers must not tip off sanctions details.",
        "If the path fails or customer refuses → written decline (J8).",
      ],
      instruments: [
        "CCOF F.1.v.d–f — video / assisted remote options",
        "CCOF G.2 — video evidence retention",
        "EMI §12.V — if also high risk, EDD still applies",
        "EMI §17 — partner / agent boundaries (partners do not issue wallets casually)",
      ],
      failClosed: [
        "No silent 400k after video alone",
        "No tip-off language in customer copy",
      ],
      auditMusts: [
        "Show recording retained and reason for descending the ladder",
        "Show final limit_tier still matches verification strength",
      ],
    },
    J5: {
      headline: "Sanctions / proscribed true match — hard stop, no tip-off",
      mustFollow: [
        "Confirmed hit → no wallet / no payment services.",
        "Customer message is truthful but must not reveal a list match or that an STR may be filed (no tipping-off).",
        "Internal reason codes may be richer than customer text.",
        "Apply TFS internally; file STR when required — compliance owns this, not outsourced frontline.",
        "Keep Tracking ID for status lookup.",
        "Store list version + timestamp with the hit decision.",
      ],
      instruments: [
        "CCOF F.4 — screening / TFS expectations",
        "EMI §12.III, §12.IX–X — no relationship / ongoing duties",
        "AML / CFT + TFS — UNSC & ATA 1997 lists",
        "STR rules + tipping-off prohibition",
      ],
      failClosed: [
        "Never STP-retry a confirmed true match into APPROVED",
        "Lists down is J11 — not a fake CLEAR that becomes J5 later by mistake",
      ],
      auditMusts: [
        "Show hit adjudication trail (potential → confirmed)",
        "Show customer-safe decline vs internal code",
        "Show STR/TFS internal artefacts when filed (not in customer app)",
      ],
    },
    J6: {
      headline: "High risk / PEP — extra evidence and senior approval before activate",
      mustFollow: [
        "HIGH CRP or PEP blocks activation until EDD is approved.",
        "Collect source of funds / wealth (and recorded video interview when required).",
        "Senior named approval is mandatory — no silent skip because BV already passed.",
        "EDD runs with the verification ladder; it does not replace BV/screening/CDD.",
        "If refused or incomplete → J8 decline path.",
      ],
      instruments: [
        "CCOF G — enhanced / assisted verification themes",
        "EMI §12.V — high-risk / EDD",
        "AML EDD — SoF/SoW, senior management approval",
      ],
      failClosed: [
        "Do not activate HIGH risk without approval artefact",
        "Do not outsource the senior decision stamp casually",
      ],
      auditMusts: [
        "Show risk inputs, evidence pack, approver identity, timestamp",
        "Show activation only after approval + cool-off",
      ],
    },
    J7: {
      headline: "Save and resume ≤ 30 days — same Tracking ID, server is truth",
      mustFollow: [
        "Incomplete applications remain resumable up to 30 days under the same Tracking ID.",
        "Authoritative state is on the server — not photos left in the phone gallery.",
        "On resume: re-check device bind and screening list freshness; land on last incomplete step (no skip forward).",
        "Day 31+ → EXPIRED; customer must start a new application.",
        "Tell customers at consent time that save/resume exists.",
      ],
      instruments: [
        "CCOF — save/resume 30 days, session continuity",
        "BPRD 04 — re-auth / device expectations on return",
        "EMI §12.VI — informed consent including save notice",
      ],
      failClosed: [
        "Do not resume an expired pack into activation",
        "Unbound device on resume → treat as J9, do not skip BV",
      ],
      auditMusts: [
        "Show same Tracking ID across pause/resume",
        "Show EXPIRED timestamp if day 31+",
      ],
    },
    J8: {
      headline: "Every terminal “no” needs a clear written reason",
      mustFollow: [
        "Customer receives a specific compliant reason (EN/UR) — not vague “something went wrong”.",
        "Tracking ID remains usable for status lookup where allowed.",
        "Internal compliance codes stay separate from customer text (especially after J5).",
        "Respect TAT communication rules (notify when decisions drag past expected windows).",
        "Refusing only marketing is fine; refusing mandatory T&Cs / NADRA purpose blocks issuance.",
      ],
      instruments: [
        "CCOF I — communication / TAT themes",
        "AML — incomplete CDD / decline handling; no tipping-off",
        "EMI §12.IV — close paths where applicable",
        "EMI §12.VI — consent gating",
      ],
      failClosed: [
        "No free-typed tip-off language in customer notices",
        "No disappearing Tracking ID after decline",
      ],
      auditMusts: [
        "Show mapped reason catalogue entry",
        "Show notice channels (in-app / SMS / email) and times",
      ],
    },
    J9: {
      headline: "New unbound device — BV, notify old channels, cool-off",
      mustFollow: [
        "Login on a new phone/tablet requires NADRA BV — not “just OTP”.",
        "Notify old mobile/email about the new device.",
        "Enforce 2-hour cooling-off before the device is fully trusted.",
        "Block password reset from unbound devices.",
        "Enforce max devices per customer; investigate many CNICs on one device.",
      ],
      instruments: [
        "BPRD Circular 04 — new device / bind / notify / cool-off",
        "CCOF K — pulls BPRD 04 into digital onboarding frame",
      ],
      failClosed: [
        "Unbound device cannot skip BV",
        "NADRA down → J11, not trust-by-default",
      ],
      auditMusts: [
        "Show BV on new device, notify events, cool-off window",
        "Show device bind record",
      ],
    },
    J10: {
      headline: "KYC does not end at issuance — keep watching",
      mustFollow: [
        "Continue sanctions / watchlist screening after the wallet is live.",
        "Run TMS / fraud scenarios (structuring, mule pass-through, odd device patterns).",
        "File STR when suspicion exists — regardless of amount thresholds for suspicion.",
        "Salary / remittance load exclusions (if SBP granted) change load math only — AML/TMS stay on.",
        "Retain monitoring artefacts for the retention period (~10 years in these docs).",
        "Do not tip customers about sanctions matches during monitoring holds.",
      ],
      instruments: [
        "AML ongoing monitoring",
        "EMI §12.IX–X — ongoing CDD / reporting duties",
        "BPRD 04 D — transaction alert / monitoring themes",
        "STR / CTR rules; FMU filing in Pakistan",
      ],
      failClosed: [
        "Suspicious pattern → hold/investigate — not silent clear",
        "True match later → J5-style stop / TFS",
      ],
      auditMusts: [
        "Show ongoing screen runs and TMS alerts with times",
        "Show STR trail when filed (internal)",
      ],
    },
    J11: {
      headline: "Vendor / list timeout — fail closed, never silent success",
      mustFollow: [
        "NADRA 503/timeout or sanctions provider down → stay IN_PROGRESS / HOLD.",
        "Never activate or grant biometric limits because the checker was offline.",
        "Show Tracking ID and a retry path; customer may leave and resume ≤ 30 days (J7).",
        "Stub adapters in test must obey the same fail-closed rules as production.",
        "If CDD cannot be completed in time, do not open — communicate per TAT rules.",
      ],
      instruments: [
        "AML — incomplete CDD ⇒ do not open",
        "CCOF TAT / disclosure expectations",
        "Fail-closed compliance design practice",
      ],
      failClosed: [
        "Map provider errors to PENDING/UNAVAILABLE — never APPROVED",
        "No “force approve” without a named officer reason that still meets CDD (almost never for NADRA-down)",
      ],
      auditMusts: [
        "Show error codes, hold state, retries, recovery into J1/J2/J13",
      ],
    },
    J12: {
      headline: "One CNIC → one active e-money instrument with this EMI",
      mustFollow: [
        "Block a second wallet when an active instrument already exists for the CNIC.",
        "Authenticated returning customer: clear copy — “You already have a wallet — log in.”",
        "Unauthenticated probes get a generic reply (no account enumeration).",
        "Minor linked wallets are not a second adult wallet for the guardian’s CNIC.",
        "Re-open after full closure is a Legal/policy question — do not improvise.",
      ],
      instruments: [
        "EMI §12.VII — one instrument per CNIC per EMI",
        "BPRD 04 A.ix — enumeration / existence disclosure control",
      ],
      failClosed: [
        "Never issue-wallet when uniqueness key says active exists",
      ],
      auditMusts: [
        "Show uniqueness hit and customer-facing copy used",
        "Show that no second instrument id was created",
      ],
    },
    J13: {
      headline: "Raising limits = verify again — not a settings toggle",
      mustFollow: [
        "Category / limit upgrade is a new verification case (CCOF F.1).",
        "Verisys → BV: real NADRA BV via in-app / e-Sahulat / partner ATM — selfie is not enough.",
        "Re-screen and refresh CRP; apply 2-hour cooling-off; old band applies until then.",
        "Enhanced ~1M needs SoF (Annexure-J), CNIC–SIM pairing, TMS+CRP in-house — do not outsource this verification (EMI §14.III).",
        "Confirm commercial licence / PSP&OD product flags before offering enhanced.",
        "Till BV for cash-in must open a proper upgrade case — do not silently lift caps as a side effect.",
      ],
      instruments: [
        "CCOF F.1 — opening or change/upgradation of category",
        "EMI §14 — limit bands; §14.III enhanced / no outsourcing",
        "Annexure-J — source of funds evidence",
        "BPRD 04 — cooling-off on material change",
      ],
      failClosed: [
        "BV fail → stay on old band — never fake BV",
        "Enhanced checks fail → remain BV with clear missing-item copy",
      ],
      auditMusts: [
        "Show new verification case id, BV/SoF artefacts, re-screen, cool-off, new limit_tier",
      ],
    },
    J14: {
      headline: "Contact / password change — prove holder, notify, cool-off",
      mustFollow: [
        "Changing mobile, email, or password on a live wallet needs step-up / BV as required.",
        "Notify old channels about the change.",
        "Enforce 2-hour cooling-off before the new credential is fully trusted.",
        "If the device is unbound, complete J9 first.",
        "Do not silently swap MSISDN without proof and notify.",
      ],
      instruments: [
        "BPRD 04 A.i.c / A.iii / A.viii — credential / contact change controls",
        "CCOF K — BPRD 04 in digital frame",
        "CCOF F.1 — if pairing / identity assurance must be re-run",
      ],
      failClosed: [
        "No credential change without audit trail and cool-off where required",
      ],
      auditMusts: [
        "Show old→new values (masked), BV/step-up, notify, cool-off window",
      ],
    },
    J15: {
      headline: "Minor wallets only from guardian app — linked, never orphan",
      mustFollow: [
        "Open only inside the parent/guardian’s app; block standalone minor signup.",
        "Screen both minor and guardian; store guardian undertaking.",
        "Basic minor: Verisys-class limits; fund only from parent wallet; TMS on.",
        "Freelancer minor: NADRA BV + verified income → higher minor band — still not adult enhanced 1M.",
        "Agents never issue the child’s instrument (EMI §17.VII).",
        "Confirm Form-B / digital eligibility with Legal where required.",
      ],
      instruments: [
        "EMI §14.IV–V — minor products / limits",
        "EMI §12 — CDD for associated persons",
        "CCOF — associated-person screening",
        "EMI §17.VII — agents do not issue",
      ],
      failClosed: [
        "No orphan minor wallet",
        "No silent adult 1M on a minor product",
      ],
      auditMusts: [
        "Show parent linkage, undertaking, screens on both parties, limit_tier",
      ],
    },
    J16: {
      headline: "Close and redeem at par — keep the trail",
      mustFollow: [
        "Redeem e-money at par; no haircut “closure fee” on redemption value.",
        "Cash redemption needs BV; IBFT-out needs 2FA as designed.",
        "Unverified instruments that must close follow EMI §12.IV (+ STR when required).",
        "Retain records for the retention period (EMI §24.II / ~10 years theme).",
        "After closure, CNIC uniqueness / re-open policy must be explicit — ties to J12.",
      ],
      instruments: [
        "EMI §15.I–III — issuance/redemption at par; cash rules",
        "EMI §12.IV — unverified close + STR",
        "EMI §12.VII — uniqueness after close (policy)",
        "EMI §24.II — record retention",
      ],
      failClosed: [
        "Do not destroy audit history on close",
        "Do not cash-redeem without required BV",
      ],
      auditMusts: [
        "Show redeem postings at par, BV/2FA proofs, CLOSED state, retention hold",
      ],
    },
    J17: {
      headline: "Periodic / event refresh — overdue must be explicit",
      mustFollow: [
        "Scheduler marks refresh due by risk / calendar / events (e.g. expired ID).",
        "Notify the customer with a clear call-to-action.",
        "Re-screen and refresh CRP; material change may reopen EDD (J6).",
        "Overdue restriction uses explicit customer copy — never a silent limit clamp.",
        "High-assurance products may require re-BV.",
      ],
      instruments: [
        "AML ongoing CDD",
        "CCOF Table-A / expired ID token themes",
        "EMI ongoing relationship duties",
      ],
      failClosed: [
        "Do not leave overdue customers fully unrestricted without policy basis",
        "True match on refresh → J5 path",
      ],
      auditMusts: [
        "Show due date, notices, refresh application, re-screen, new next-due",
      ],
    },
    J18: {
      headline: "Non-resident / alternate ID classes — same gates, class-specific verify",
      mustFollow: [
        "Treat id_class as first-class (CNIC / NICOP / POC / ARC / POR).",
        "Apply screening and uniqueness the same way — no “foreign skip”.",
        "BV vs Verisys exception depends on listed rules and whether BV is operational abroad.",
        "NRP_BV_NOT_OPERATIONAL is a dated configuration flag — not a customer convenience skip.",
        "FATCA/CRS / tax residency fields apply where required.",
      ],
      instruments: [
        "CCOF C.5 — ID classes",
        "CCOF F.1.iv.b / F.1.v — NRP/POC exceptions",
        "EMI §12.I — minimum CDD fields",
        "FATCA/CRS obligations where applicable",
      ],
      failClosed: [
        "Do not activate without class-appropriate verification + clear screen",
      ],
      auditMusts: [
        "Show id_class, which NADRA/product path ran, screen result, final band",
      ],
    },
    J19: {
      headline: "Cash channels — existing wallet only; BV / 2FA; agents never issue",
      mustFollow: [
        "Agent / till cannot open a wallet — open in the app only.",
        "Cash-in and full cash redemption: NADRA BV at the till.",
        "ATM cash-out: 2FA mandatory; agent cash-out: BV or 2FA if BVS challenged.",
        "Post at par; enforce monthly load and cash-out caps.",
        "Verisys-only customer who completes BV at till must open J13 to raise band — no silent 400k.",
        "Structuring / mule patterns → fail closed and treat as J10.",
        "IBFT funding without till cash is a separate allowed path (EMI §15.II).",
      ],
      instruments: [
        "EMI §15.I–II — cash-in / redemption / funding channels",
        "EMI §14.II.b–d — cash-out / ATM 2FA",
        "EMI §17.VII — agents distribute/redeem, do not issue",
        "CCOF / BPRD — till biometric expectations",
      ],
      failClosed: [
        "No credit without BV on cash-in",
        "AGENT_CANNOT_ISSUE enforced in API and UI",
      ],
      auditMusts: [
        "Show channel, BV/2FA proof, par posting, limit checks, any TMS hold",
      ],
    },
  };

  for (const j of D.journeys) {
    const c = COMPLIANCE[j.id];
    if (!c) continue;
    j.compliance = c;
    // Keep legacy string fields in sync for facts strip
    if (!j.rules || j.rules.length < 40) {
      j.rules = c.instruments.join(" · ");
    }
    if (!j.regulatory?.length) {
      j.regulatory = c.instruments.slice();
    }
  }
})();
