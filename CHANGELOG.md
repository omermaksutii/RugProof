# Changelog

All notable changes to Rugproof will be documented here. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning: [SemVer](https://semver.org/).

## [Unreleased]

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

Landing page · gallery (5 cards) · 5 sample HTML reports · docs index. Static site at `web/`.

#### CI/CD

GitHub Action (`omermaksutii/RugProof-action@v1` composite action) + workflows for PR audit + release packaging.

#### Scripts (`scripts/`)

`render-card` · `render-report` · `md-to-html` · `check-update` · `telemetry` · `report-crash`. All TypeScript, all build clean. Telemetry / crash reporting strictly opt-in.

#### Repo

`LICENSE` (MIT) · `SECURITY.md` · `CONTRIBUTING.md` · `CODE_OF_CONDUCT.md` · `.gitmodules` · `foundry.toml` · `remappings.txt` · `.rugproof.yml.example` · `.rugproofignore.example` · `Makefile`.

[Unreleased]: https://github.com/omermaksutii/RugProof/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/omermaksutii/RugProof/releases/tag/v0.1.0
