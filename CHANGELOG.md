# Changelog

All notable changes to Rugproof will be documented here. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning: [SemVer](https://semver.org/).

## [0.7.0] — Unreleased

On-chain audit certificate — deploy-ready.

### Added

- **`nft/DEPLOY.md`**: full Berachain deployment runbook for the soulbound
  `AuditCertificate` (Bepolia testnet 80069 → mainnet 80094, env vars, verify,
  issuer-key security, end-to-end mint check). The contract, deploy script, and
  EIP-712 signer were already complete + tested; this makes going live a
  one-command, ready-to-trigger step (needs only a funded key).
- **Makefile**: `deploy-cert-testnet` / `deploy-cert-mainnet` targets.
- `/mint-cert`: documents the deployed-address config (`certificate:` in
  `.rugproof.yml`) and the local `sign-cert` issuer-signature flow (no backend).
- Confirmed the TS signer's `abi.encode` digest matches the contract's
  `keccak256(abi.encode(chainId, address(this), subject, reportHash, ipfsCid,
  targetName, grade))` byte-for-byte.

## [0.6.0] — Unreleased

Post-deployment monitoring & bug-bounty submission tooling.

### Added

- **New `monitoring` MCP**: `suggest_monitors` recommends which on-chain events to
  alert on for a contract (ownership/upgrade/admin/pause/roles + large-transfer,
  with topic0 hashes and severity — pure/offline), and `scan_recent` flags
  high-severity events in recent logs (offline → sample). MCP count 12 → 13.
- **New `/monitor` command**: turns a contract into an alerting plan + scans for
  alarming activity already on-chain. Commands 44 → 45.
- **`scripts/format-bounty.ts`**: formats a finding + program metadata into an
  Immunefi-style submission (severity mapping, PoC embed, slug derivation) as JSON
  + Markdown; unit-tested and wired into `/bounty-submit` (the POST still needs
  `IMMUNEFI_API_KEY` — ready to trigger).

## [0.5.0] — Unreleased

Multi-language coverage & the property-fuzzing / symbolic toolchain.

### Added

- **New `fuzz-runner` MCP**: wraps Echidna, Medusa, and Halmos — runs the real
  binary when installed, else a labeled sample. `is_available` reports presence.
  Wired into `/fuzz`, `/symbolic`, and `/prover`. MCP count 11 → 12.
- **3 non-EVM detection skills**: `stylus-rust` (Arbitrum Stylus storage aliasing,
  panic-DoS, release-mode wrapping), `cosmwasm` (missing `info.sender` auth,
  unbounded iteration, reply/migrate footguns), `solana-anchor` (signer/owner
  checks, type cosplay, PDA bump, close-account drain). Skills 42 → 45.
- README "Languages" updated: Stylus/CosmWasm/Solana-Anchor now have dedicated
  skills (not just "top vuln classes").

## [0.4.0] — Unreleased

Specialist depth, community rule packs, and an honest accuracy benchmark.

### Added

- **Rule-pack tooling**: `scripts/validate-rule-pack.mjs` validates a pack's
  `pack.yml` against its `skills/<rule>/SKILL.md` files (required metadata, every
  listed rule resolves, frontmatter name matches). CI validates all bundled packs;
  `make validate-rules`.
- **2 real bundled rule packs**: `solady-gotchas` (SafeTransferLib no-contract
  check, guarded-initializer front-run, gas-optimized ERC20 assumptions) and
  `uniswap-v4-hooks` (permission-flag mismatch, unlock-reentrancy, delta
  settlement) — beyond the prior template-only example.
- **Benchmark harness** (`scripts/src/benchmark.ts` + `bench/expected.json`):
  scores audit output against a labeled corpus → per-target and aggregate
  recall / precision / F1. Unit-tested; `make bench`; CI self-check.

## [0.3.0] — Unreleased

Exploit-pipeline & live-audit depth, plus maintenance — the march toward 1.0.

### Added / Changed

- **block-explorer-mcp**: new `resolve_proxy` tool — detects EIP-1967
  (transparent / UUPS / beacon) and EIP-1822 proxiable patterns by reading the
  standard storage slots and returns implementation/admin/beacon addresses.
  `/audit-live` now uses it for one-call proxy resolution.
- **CI**: new `live-analyzers` job installs real Slither + Mythril and exercises
  the `slither-runner` / `mythril-runner` MCPs and the `parse-slither` pipeline
  end-to-end (validates the non-stub path).
- **deps**: safe Dependabot bumps — `zod` 4, `rimraf` 6, `@types/node` 25 (mcp),
  `sharp` 0.34 (scripts); `actions/setup-node` v6, `actions/upload-artifact` v7.
  Deferred: `@noble/*` 2.x (breaking `sign()` API in the security-critical cert
  signer) and `typescript` 6 (needs a `moduleResolution` migration) — both stay
  pinned with passing builds rather than risk regressions.

## [0.2.0] — 2026-06-16

Hardening pass turning the v0.1 skeleton into a trustworthy, tested tool. See
`docs/superpowers/specs/2026-06-16-rugproof-v0.2.0-design.md` for the full plan.

### Phase 5 — regression tracking

- New `scripts/src/diff-reports.ts` (`diffReports()` + CLI): diffs two Rugproof
  report JSONs by finding id → added / fixed / persisting, per-severity counts
  delta, grade change, and a `regressed` flag (new High/Critical) that exits
  non-zero so it works as a CI gate. Unit-tested.
- New `/audit-diff` command driving it (before-vs-after of the same contract;
  distinct from `/diff-audit`, which compares code against a canonical library).
- `/audit-strict` gains an optional N-of-M specialist-panel consensus tier for
  the strongest false-positive suppression. Commands 43 → 44.

### Phase 4 — DX & docs

- `scripts/generate-docs.mjs`: generates the docs-site reference pages
  (`commands.html`, `skills.html`, `agents.html`, `mcp-reference.html`) directly
  from `commands/`, `agents/`, `skills/`, so they can't drift. CI fails if they're
  stale; `make docs` regenerates them.
- New narrative pages: `configuration.html` (full `.rugproof.yml` schema +
  recipes), `troubleshooting.html` (stub-data causes, offline mode, common fixes),
  `telemetry.html` (what's sent, opt-out, privacy switches).
- Commands cheatsheet now includes a "which command?" decision tree.
- Refreshed the docs index and README: counts updated (43 commands, 23 agents,
  42 skills, 11 MCP servers), roadmap rewritten to reflect completed v0.2 phases,
  stale `v0.1.0` / `web/` references corrected.

### Phase 3 — detection breadth (agents, skills, commands)

- **4 new specialist agents**: `vyper-specialist` (Vyper 0.2.15 `@nonreentrant`
  miscompile + decorator/auth pitfalls), `l2-sequencer-specialist` (sequencer
  uptime, force-inclusion, L1↔L2 finality, address aliasing, per-stack opcode
  differences), `economic-rug-specialist` (owner-power rug vectors + a 0-100
  rugability score), `zk-verifier-specialist` (proof-verifier correctness,
  pairing precompiles, nullifiers, trusted setup).
- **8 new vulnerability skills**: ve-lock-governance, fee-on-transfer,
  signature-malleability, mev-pbs, liquidation-cascade, oracle-redundancy,
  cross-contract-state, zk-verifier-bugs.
- **5 new commands**: `/audit-deps` (dependency/version advisory audit),
  `/audit-multi-chain` (cross-chain config-drift diff), `/rug-check` (rugability
  score + owner-power checklist), `/prover` (Halmos/Certora formal verification
  with property templates), `/pre-deploy` (launch checklist + go/no-go).
- Formalized the `/audit` specialist-dispatch table (protocol signal → agents,
  now covering all 23 specialists) and expanded its skill-coverage list.
- Wired the bundled Vyper demo (`examples-vyper/VulnerableVyper.vy`) into `/demo`.
- Counts: agents 19 → 23, skills 33 → 42 (incl. earlier additions), commands 38 → 43.

### Phase 2 — MCP depth & real integrations (offline-first)

- New shared workspace package `@rugproof/mcp-shared`: `isOffline()`, uniform
  `stub()` envelope, `fetchJSON()` with retry + exponential backoff + 429/5xx
  handling, and `hasBinary()` PATH probing — zero runtime dependencies.
- **New `slither-runner` MCP**: runs `slither --json -` when installed, else
  returns a labeled representative sample with the same shape; pipe through
  `parse-slither` for normalized findings. `is_available` reports tool presence.
- **New `mythril-runner` MCP**: same pattern around `myth analyze -o json`.
- **block-explorer-mcp**: migrated to the unified **Etherscan v2 multichain** API
  (single `ETHERSCAN_API_KEY`, `chainid` param) for 9 chains, Beratrail for
  Berachain; retry/backoff via the shared client; API keys redacted in echoed
  URLs; honours `RUGPROOF_OFFLINE`.
- **token-metadata-mcp**: new `check_safety` tool (GoPlus token-security —
  honeypot / fee-on-transfer / mint authority / blacklist / proxy / owner powers)
  with an offline fallback derived from the local quirks DB.
- `/slither` and `/mythril` commands updated to drive the new runner MCPs (and
  their offline fallbacks); `plugin.json` registers both new servers. MCP count
  9 → 11; smoke + offline integration tests cover all 11.

### Phase 1 — tests & CI hardening

- **Test suites** (zero new runtime deps, `node:test`, fully offline):
  - `scripts/test/`: unit tests for the Slither/Mythril parsers (severity remap,
    detector/SWC → vuln mapping, grading) and the EIP-712 cert signer (known-vector
    address derivation, determinism, and a full ecrecover round-trip that matches
    `AuditCertificate.sol`).
  - `mcp/test/`: spawns each server over stdio and verifies tool listing plus an
    offline (stub/in-memory) invocation — no keys or binaries required.
  - `scripts/test/e2e-report.sh`: renders a PNG card + HTML report and validates
    the card summary, exercising the full output pipeline.
- Refactored `parse-slither` / `parse-mythril` / `sign-cert` to export their pure
  logic behind an entry-guard so it is importable and testable.
- Published `schemas/finding.schema.json` (the normalized report shape) and
  validate parser output against it in tests.
- `scripts/check-versions.mjs`: fails CI/release if any manifest version or the
  CHANGELOG drift apart.
- **CI** (`.github/workflows/ci.yml`): build + Foundry/NFT/script/MCP/e2e tests +
  version-sync on every push/PR; `forge fmt --check` lint job; gitleaks secret scan.
- `rugproof-pr.yml` no longer silently swallows `forge build` failures (now a
  surfaced warning annotation); `release.yml` gates on version-sync and tag match.
- `forge fmt` applied to the demo contracts; Makefile wired to the new test
  targets and its stale `web/` paths corrected to `docs/`.

### Phase 0 — cleanup & bug fixes

- **anvil-mcp**: replaced the fixed 1.5s post-spawn sleep with real RPC readiness
  polling (`waitForRpc`); a fork that never comes up now errors instead of
  returning an unusable URL.
- **hardhat-runner-mcp**: `npx --no-install` + closed stdin so the runner fails
  fast in non-Hardhat directories instead of hanging on an install prompt; added
  a configurable process timeout (`RUGPROOF_HH_TIMEOUT_MS`). Fixes the MCP
  smoke-test timeout.
- **token-metadata-mcp**: known-quirks DB is now keyed by lowercase address so
  lookups are case-insensitive (previously a checksummed input missed); added
  sDAI/stETH/MKR/WETH entries and a `known` flag in the response.
- **c4-history-mcp / sherlock-history-mcp**: robust protocol-name extraction from
  contest repo slugs (no longer assumes a `YYYY-MM-` prefix / `-judging` suffix).
- **forge-runner-mcp**: mock fallbacks now carry a `__reason` so stub gas /
  coverage / storage data is clearly labeled.
- **block-explorer-mcp**: `get_constructor_args` reads real data from
  `getsourcecode` when an API key is present; `get_trace` stub is labeled and
  points to the anvil/tenderly MCP for real traces.
- Fixed stale `/bounty` "TODO when available" reference in `/exploit-live`.
- Version reconcile: manifests, MCP/scripts workspaces bumped to `0.2.0`.

## [0.1.1] — 2026-05-20

### Added / Changed

- `marketplace.json` manifest for marketplace listing.
- Real `notify-discord` / `notify-slack`, Slither/Mythril parsers, and EIP-712
  certificate signer scripts.
- Vyper pattern support; PDF report rendering.
- MCP invoke tests in the smoke runner.

## [0.1.0] — 2026-05-13

Initial release. Full skeleton + working tooling pipeline.

### Added

#### Slash commands (38)

Audit: `/audit` `/audit-deep` `/audit-strict` `/audit-changes` `/audit-live` `/audit-history` `/quick-scan` `/score` `/explain`
Output: `/report` `/card` `/remediate`
Exploit: `/exploit` `/exploit-chain` `/exploit-live`
Simulation: `/simulate` `/replay-incident`
Tests: `/test-gen` `/invariant` `/fuzz` `/coverage` `/symbolic`
Analysis: `/gas` `/upgrade-safety` `/verify-deploy` `/diff-audit`
Tooling: `/slither` `/mythril`
Workflow: `/rugproof-init` `/dismiss` `/verify-finding` `/bounty` `/bounty-submit` `/demo`
Notifications: `/notify-slack` `/notify-discord` `/tweet`
NFT: `/mint-cert`

#### Specialist subagents (19)

Functional (8): `attacker` `defender` `exploit-poc-writer` `invariant-writer` `gas-optimizer` `remediation-suggester` `report-writer` `assembly-auditor`
Protocol-specific (7): `amm-specialist` `lending-specialist` `staking-specialist` `bridge-specialist` `governance-specialist` `yield-aggregator-specialist` `nft-specialist`
Hot-topic (4): `aa-specialist` `crosschain-messaging-specialist` `restaking-specialist` `intents-specialist`

#### Vulnerability skills (33)

Classic (19): reentrancy · access-control · oracle-manipulation · flash-loan-attacks · mev-frontrunning · signature-replay · storage-layout · initialization · unchecked-calls · dos-vectors · integer-issues · delegatecall-risks · tx-context-misuse · token-compatibility · approval-issues · selfdestruct-eip6780 · inline-assembly · pragma-and-addresses · centralization-risk
Hot-topic (8): erc4337-account-abstraction · cross-chain-messaging · permit2-patterns · erc1271-contract-signatures · diamond-eip2535 · restaking-eigenlayer · intents-erc7683 · erc4626-inflation
AI-quality meta-skills (4): confidence-scoring · multi-pass-self-critique · known-good-comparison · false-positive-feedback-loop
DX meta-skills (2): caching-and-incremental · progress-and-streaming

#### MCP servers (9)

`block-explorer` · `forge-runner` · `hardhat-runner` · `anvil` · `tenderly` · `c4-history` (real GitHub fetch + 24h cache) · `sherlock-history` (same) · `gas-tracker` · `token-metadata`. All TypeScript, all build clean.

#### Hooks (4)

`pre-commit-quickscan.sh` · `pre-push-audit.sh` · `pre-deploy-check.sh` · `post-test-coverage.sh`. The latter two wired via `plugin.json`'s `PreToolUse` / `PostToolUse`.

#### Templates

`report.md.hbs` · `report.html.hbs` · `audit-card.svg.hbs`. Real Handlebars; renders end-to-end via `scripts/render-card.js` + `scripts/render-report.js` + `scripts/md-to-html.js`.

#### Demo contracts (5)

`examples/`: `VulnerableVault` · `SpotOracleLending` · `FlashLoanGovernance` · `Inflatable4626` · `ReplayableBridge`. Each documents the vuln class it demonstrates. Reference Foundry exploit `test/exploits/ExploitREENT001.t.sol` passes (attacker drains 11 ETH from a 10 ETH victim deposit).

#### NFT certificate

Soulbound ERC-721 (`nft/src/AuditCertificate.sol`) with EIP-712 issuer-signed mints, designed for Berachain. 3 passing tests.

#### Web

Landing page · gallery (5 cards) · 5 sample HTML reports · docs index. Static site at `docs/`, auto-deployed to GitHub Pages.

#### CI/CD

GitHub Action (`omermaksutii/RugProof-action@v1` composite action) + workflows for PR audit + release packaging.

#### Scripts (`scripts/`)

`render-card` · `render-report` · `md-to-html` · `check-update` · `telemetry` · `report-crash`. All TypeScript, all build clean. Telemetry / crash reporting strictly opt-in.

#### Repo

`LICENSE` (MIT) · `SECURITY.md` · `CONTRIBUTING.md` · `CODE_OF_CONDUCT.md` · `.gitmodules` · `foundry.toml` · `remappings.txt` · `.rugproof.yml.example` · `.rugproofignore.example` · `Makefile`.

[0.2.0]: https://github.com/omermaksutii/RugProof/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/omermaksutii/RugProof/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/omermaksutii/RugProof/releases/tag/v0.1.0
