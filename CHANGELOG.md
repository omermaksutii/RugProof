# Changelog

All notable changes to Rugproof will be documented here. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning: [SemVer](https://semver.org/).

## [0.2.0] — Unreleased

Hardening pass turning the v0.1 skeleton into a trustworthy, tested tool. See
`docs/superpowers/specs/2026-06-16-rugproof-v0.2.0-design.md` for the full plan.

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
