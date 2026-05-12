---
description: Run Slither and have Claude triage its findings — separate true positives from false positives, write PoCs for real bugs.
argument-hint: "[file-or-dir]"
allowed-tools: Read, Bash, Agent, Skill, mcp__forge-runner__*
---

# /slither — AI triage on top of Slither

Slither has high recall (catches a lot) but low precision (lots of false positives). Rugproof's role: be the AI layer that triages.

## Prerequisites

Slither installed: `pip install slither-analyzer`.

## Procedure

### Step 1 — Run Slither

```bash
slither <target> --json - 2>/dev/null
```

Capture the JSON output. It contains detectors fired, severity (Slither's own), affected lines.

### Step 2 — For each Slither finding

- Read the affected lines.
- Apply the relevant Rugproof vuln skill.
- Determine: is this exploit-able in *this specific context*?
- Categorize:
  - **True positive (confirmed):** real, write a `/exploit` PoC if possible.
  - **True positive (theoretical):** real per Slither but no exploit path in this context — note and downgrade severity.
  - **False positive:** Slither over-flagged; explain why.
  - **Insufficient context:** Slither's detector requires data Slither doesn't have (e.g. trust assumptions); request user input.

### Step 3 — Output

```
Slither + Rugproof triage:

  Slither raw findings: 47
  After Rugproof triage:
    Confirmed exploitable:    3     (PoCs generated)
    Real but contextual:      11    (downgraded severity)
    False positives:          28    (auto-dismissed with reasoning)
    Needs user judgment:      5

Confirmed exploitable:
  [reentrancy-eth] Vault.withdraw at src/Vault.sol:142
    Slither severity: HIGH | Rugproof: HIGH-CONFIRMED
    PoC: test/exploits/ExploitREENT-Slither-001.t.sol  (passes)

False positives (sampled):
  [dead-code] Bridge._verify at src/Bridge.sol:200
    Slither flagged as unreachable; Rugproof: reachable via fallback receiver,
    but pattern is a defensive-only path with no exploit. Dismissed.
```

## Why this is useful

- Slither alone produces too much noise to action.
- Rugproof's reasoning lets the user act on the *signal*, not the raw output.
- Positioning: not a Slither replacement — Slither's *triage layer*.

## Notes

- Don't suppress Slither findings without writing the *reason* in the dismissal record.
- Where Rugproof's own skills already covered the issue, deduplicate against Rugproof's prior `/audit` findings.
