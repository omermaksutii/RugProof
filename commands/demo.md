---
description: Run Rugproof against the bundled vulnerable example contracts — first-run "wow moment".
argument-hint: "[reentrancy|oracle|flash-loan|inflation|replay|all]"
allowed-tools: Read, Bash, Agent, Skill
---

# /demo — run on bundled vulnerable contracts

First-run experience. Lets a new user see Rugproof's output on a real (but safe) vulnerable contract — no need to bring their own code yet.

## Bundled demos

Located in `examples/`:

| Demo | Contract | Primary vuln class |
|---|---|---|
| `reentrancy` | `VulnerableVault.sol` | reentrancy + access-control |
| `oracle` | `SpotOracleLending.sol` | oracle-manipulation + flash-loan |
| `flash-loan` | `FlashLoanGovernance.sol` | governance flash-loan |
| `inflation` | `Inflatable4626.sol` | ERC-4626 donation attack |
| `replay` | `ReplayableBridge.sol` | signature replay (cross-chain) |

## Procedure

1. Map `$ARGUMENTS` to one or more demo files. Default = `all`.
2. Run `/audit` on each.
3. Show full output (findings + grade + trust report).
4. For each finding, optionally also run `/exploit` to generate a working PoC.
5. End with a teaser:

```
That's what Rugproof finds on these demos.
Try it on your own code:
  /audit <your-file>
  /audit                        (scans your whole repo)

Got a deployed contract? Try:
  /audit-live <chain> <addr>
```

## Notes

- This is the marketing surface. Make the output look great — proper colors, no broken Markdown, satisfying summary.
- The 5 bundled demos should be selected such that they exhibit the most "wow" findings (visible reentrancy, oracle manip, inflation attack).
- For onboarding flows (`/rugproof-init` after-test-run), default to `/demo reentrancy` — quickest to read.
