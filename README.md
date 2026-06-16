# Rugproof

> Rugproof your code before someone else does.

🌐 **Live site:** [omermaksutii.github.io/RugProof](https://omermaksutii.github.io/RugProof/)
📦 **Latest:** v1.0.0 — 45 commands · 23 agents · 45 skills · 13 MCP servers · tested, offline-first, with rule packs, a benchmark, non-EVM coverage, and post-deploy monitoring

A Claude Code plugin that turns your editor into a full-stack smart contract security auditor: vulnerability detection, working exploit PoCs, mainnet-fork simulation, invariant generation, gas profiling, soulbound on-chain audit certificates, and shareable audit cards — Solidity + Vyper across every major EVM chain.

## Install

### From this GitHub source (works today)

```bash
# In Claude Code:
/plugin marketplace add omermaksutii/RugProof
/plugin install rugproof@omermaksutii-RugProof
/rugproof-init                              # 60-second setup
/audit examples/VulnerableVault.sol         # try it on the bundled vulnerable demo
```

### From the official Anthropic marketplace

Pending review. Once listed at [claude.com/plugins](https://claude.com/plugins):

```bash
/plugin install rugproof
```

Submit your own plugin at [claude.ai/settings/plugins/submit](https://claude.ai/settings/plugins/submit) or [platform.claude.com/plugins/submit](https://platform.claude.com/plugins/submit).

### Local dev

```bash
git clone https://github.com/omermaksutii/RugProof
cd RugProof
make build       # MCP servers + scripts
make test        # forge tests + NFT tests + MCP smoke test
make audit-demo  # runs the bundled reentrancy exploit (passes)
```

## Quickstart

```bash
# In any Solidity project:
/audit                          # full audit on the repo
/audit src/Vault.sol            # audit one file
/quick-scan                     # fast pre-commit-style scan
/audit-live 0xabc... --chain ethereum  # audit a deployed contract by fork
/exploit <finding-id>           # write a working Foundry PoC
/report                         # render Markdown / HTML / PDF / PNG card
```

## What's in the box

### 45 slash commands

**Audit:** `/audit` `/audit-deep` `/audit-strict` `/audit-changes` `/audit-live` `/audit-history` `/audit-deps` `/audit-multi-chain` `/quick-scan` `/rug-check` `/score` `/explain`
**Output:** `/report` `/card` `/remediate`
**Exploit:** `/exploit` `/exploit-chain` `/exploit-live`
**Simulation:** `/simulate` `/replay-incident`
**Tests / proofs:** `/test-gen` `/invariant` `/fuzz` `/coverage` `/symbolic` `/prover`
**Analysis:** `/gas` `/upgrade-safety` `/verify-deploy` `/diff-audit` `/audit-diff` `/pre-deploy` `/monitor`
**Tooling integration:** `/slither` `/mythril`
**Workflow:** `/rugproof-init` `/dismiss` `/verify-finding` `/bounty` `/bounty-submit` `/demo`
**Notifications:** `/notify-slack` `/notify-discord` `/tweet`
**On-chain:** `/mint-cert` (Berachain soulbound audit certificate)

### 23 specialist subagents

**Functional:** `attacker` · `defender` · `exploit-poc-writer` · `invariant-writer` · `gas-optimizer` · `remediation-suggester` · `report-writer` · `assembly-auditor`

**Protocol-specific:** `amm-specialist` · `lending-specialist` · `staking-specialist` · `bridge-specialist` · `governance-specialist` · `yield-aggregator-specialist` · `nft-specialist`

**Hot-topic specialists (2025):** `aa-specialist` (ERC-4337) · `crosschain-messaging-specialist` (LayerZero V2 / CCIP / Hyperlane / Wormhole / Axelar) · `restaking-specialist` (EigenLayer / Symbiotic / Karak) · `intents-specialist` (ERC-7683 / UniswapX / CoW)

**Language / chain / economics:** `vyper-specialist` (Vyper compiler-class bugs) · `l2-sequencer-specialist` (rollup finality, sequencer uptime, L1↔L2) · `economic-rug-specialist` (owner powers + 0–100 rugability score) · `zk-verifier-specialist` (proof-verifier correctness)

### 45 auto-invoked vulnerability skills

A detection-skill library that auto-activates when Claude sees matching code patterns. Covers the full CWE/SWC catalog plus modern DeFi-specific issues:

**Classic (19):** reentrancy (incl. read-only and cross-contract) · access control · oracle manipulation · flash-loan attacks · MEV/front-running · signature replay · storage layout · initialization · unchecked calls · DoS vectors · integer issues · delegatecall risks · tx-context misuse · token compatibility · approval issues · EIP-6780 self-destruct · inline assembly · pragma & address hygiene · centralization risk.

**Hot-topic 2025 (8):** ERC-4337 account abstraction · cross-chain messaging · Permit2 / EIP-2612 · ERC-1271 contract signatures · Diamond / EIP-2535 · restaking & EigenLayer AVS · ERC-7683 intents · ERC-4626 inflation/donation.

**v0.2 additions (8):** ve-lock governance · fee-on-transfer accounting · signature malleability · MEV / PBS · liquidation cascades · oracle redundancy failure · cross-contract state inconsistency · ZK verifier bugs.

**AI-quality meta-skills (4):** confidence scoring · multi-pass self-critique (`/audit-strict`) · known-good reference comparison · false-positive feedback loop (`/dismiss` + `.rugproof.yml ignore:` + inline `// rugproof-ignore` markers).

**DX meta-skills (2):** caching-and-incremental (skip unchanged files) · progress-and-streaming (live status during long audits).

### 13 MCP servers

Chain I/O, test runners, history databases, static-analyzer + fuzz runners — `block-explorer` (Etherscan v2 multichain, EIP-1967/1822 proxy resolution) · `forge-runner` · `hardhat-runner` · `anvil` · `tenderly` · `c4-history` · `sherlock-history` · `gas-tracker` · `token-metadata` (+ GoPlus safety) · `slither-runner` · `mythril-runner` · `fuzz-runner` (Echidna/Medusa/Halmos). Every server degrades gracefully to labeled mock data offline, so the plugin works with zero configuration.

### 4 hooks

Pre-commit quick-scan · pre-push full audit · pre-deploy build-artifact check · post-test coverage analyzer. (Pre-commit and pre-push live as git hook scripts; pre-deploy and post-test wire into Claude Code's Bash hook events via `plugin.json`.)

### 5 bundled vulnerable demo contracts

`examples/` ships a "wow on first install" set: classic reentrancy vault, spot-oracle lending market, flash-loan governance, ERC-4626 inflation attack, replay-able bridge. Run `/demo` after install to see Rugproof in action without bringing your own code.

## Configuration

Create a `.rugproof.yml` at the repo root. See `.rugproof.yml.example`.

```yaml
severity_threshold: high       # block CI on this severity or worse
chains: [ethereum, berachain, arbitrum, base]
include: ["src/**/*.sol"]
exclude: ["test/**", "script/**"]
ignore:
  - id: REENT-001
    reason: "Single-trusted-caller, reviewed 2025-Q4"
```

Inline suppression in code:

```solidity
// rugproof-ignore: REENT-001 — single trusted caller, reviewed 2025-Q4
function trustedOp() external onlyOwner { ... }
```

## Supported

**Chains:** Ethereum · Berachain · Arbitrum · Base · Optimism · Polygon · BSC · Linea · zkSync · Scroll

**Languages:** Solidity (full) · Vyper (specialist + skill) · Stylus/Rust · CosmWasm · Solana-Anchor (dedicated skills for top vuln classes) · Yul / inline assembly (specialist)

## Output formats

`/report` produces Markdown, HTML, PDF, JSON, and a shareable PNG audit card. `/card` produces just the PNG — built for social sharing.

## Live site

📖 **Docs + sample reports + gallery:** [omermaksutii.github.io/RugProof](https://omermaksutii.github.io/RugProof/)

The site is built from the `docs/` folder via the GitHub Pages workflow at `.github/workflows/pages.yml` — every push to `main` that touches `docs/` redeploys.

## Repository layout

```
RugProof/
├── .claude-plugin/plugin.json        # marketplace manifest + MCP/hook wiring
├── .github/                          # workflows (pages, pr-audit, release) + action + templates
├── commands/                         # 45 slash commands (real prompts)
├── agents/                           # 23 subagents
├── skills/                           # 45 auto-invoked detection skills
├── mcp/                              # 13 MCP servers (TypeScript)
├── scripts/                          # render-card · render-report · md-to-html · telemetry · …
├── hooks/                            # 4 hooks
├── templates/                        # report.md.hbs · report.html.hbs · audit-card.svg.hbs
├── examples/                         # 5 vulnerable demo contracts
├── nft/                              # AuditCertificate.sol (soulbound) + tests
├── samples/                          # rendered sample reports + cards
├── docs/                             # GitHub Pages site (auto-deployed)
├── rules/                            # community rule pack template
├── test/                             # Foundry exploit tests
├── lib/                              # forge-std, openzeppelin-contracts (gitmodules)
├── foundry.toml · remappings.txt
├── Makefile · LICENSE · SECURITY.md · CONTRIBUTING.md · CODE_OF_CONDUCT.md · CHANGELOG.md
├── .rugproof.yml.example · .rugproofignore.example
└── README.md
```

## Build

One-liner via Makefile:

```bash
make build       # builds all 13 MCP servers + scripts
make test        # forge tests + NFT tests + MCP smoke test
make audit-demo  # runs the bundled reentrancy exploit PoC (passes)
make sample-cards   # rerender PNG audit cards from samples/
make sample-html    # rerender HTML pages from samples/
```

Or manually:

```bash
cd mcp && npm install && npm run build
cd ../scripts && npm install && npm run build
forge install                   # if you want to refresh git submodules
forge test -vv                  # exploit PoC against VulnerableVault passes
node scripts/dist/test-mcp.js   # MCP smoke test (13/13 servers should pass)
```

The plugin.json points to `mcp/<name>-mcp/dist/index.js` for each server. Most return mock data when API keys / external tools are absent so the plugin works out-of-the-box even without a fully configured environment.

## Roadmap

v0.1 shipped the full skeleton; the **0.2 → 1.0 arc** hardened it into a tested,
real-integration, launch-ready tool.

| Version | Scope | Status |
|------:|:------|:------|
| 0.1.0 | Full skeleton: every command · agent · skill · MCP · hook · template · demo · NFT cert · Action · Pages site | ✅ |
| 0.2.0 | Bug-fixes + real test suites + CI gates + Etherscan v2 / GoPlus / Slither / Mythril MCPs + 4 specialists / 8 skills / 5 commands + source-generated docs | ✅ |
| 0.3.0 | EIP-1967/1822 proxy resolver · live-analyzer CI · dependency maintenance | ✅ |
| 0.4.0 | Rule-pack validator + 2 real packs · accuracy benchmark harness | ✅ |
| 0.5.0 | `fuzz-runner` MCP (Echidna/Medusa/Halmos) · non-EVM skills (Stylus/CosmWasm/Solana) | ✅ |
| 0.6.0 | Monitoring MCP + `/monitor` · Immunefi bounty formatter | ✅ |
| 0.7.0 | On-chain certificate deploy-readiness (Berachain runbook + targets) | ✅ |
| 0.8.0 | Source-driven public audit gallery | ✅ |
| 0.9.0 | Incremental cache · MCP-boundary input safety · `_shared` tests | ✅ |
| **1.0.0** | **Launch: frozen findings schema + semver commitment + owner-gated handoff (`LAUNCH.md`)** | ✅ |

**Shipping to users** is the only remaining work, and it's external (marketplace
submission, mainnet cert deploy, API keys, hosting) — see [`LAUNCH.md`](LAUNCH.md).

## License

MIT
