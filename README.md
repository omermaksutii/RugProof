# Rugproof

> Rugproof your code before someone else does.

🌐 **Live site:** [omermaksutii.github.io/RugProof](https://omermaksutii.github.io/RugProof/)
📦 **Latest:** [v0.1.0](https://github.com/omermaksutii/RugProof/releases/tag/v0.1.0)

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

### 38 slash commands

**Audit:** `/audit` `/audit-deep` `/audit-strict` `/audit-changes` `/audit-live` `/audit-history` `/quick-scan` `/score` `/explain`
**Output:** `/report` `/card` `/remediate`
**Exploit:** `/exploit` `/exploit-chain` `/exploit-live`
**Simulation:** `/simulate` `/replay-incident`
**Tests:** `/test-gen` `/invariant` `/fuzz` `/coverage` `/symbolic`
**Analysis:** `/gas` `/upgrade-safety` `/verify-deploy` `/diff-audit`
**Tooling integration:** `/slither` `/mythril`
**Workflow:** `/rugproof-init` `/dismiss` `/verify-finding` `/bounty` `/bounty-submit` `/demo`
**Notifications:** `/notify-slack` `/notify-discord` `/tweet`
**On-chain:** `/mint-cert` (Berachain soulbound audit certificate)

### 19 specialist subagents

**Functional:** `attacker` · `defender` · `exploit-poc-writer` · `invariant-writer` · `gas-optimizer` · `remediation-suggester` · `report-writer` · `assembly-auditor`

**Protocol-specific:** `amm-specialist` · `lending-specialist` · `staking-specialist` · `bridge-specialist` · `governance-specialist` · `yield-aggregator-specialist` · `nft-specialist`

**Hot-topic specialists (2025):** `aa-specialist` (ERC-4337) · `crosschain-messaging-specialist` (LayerZero V2 / CCIP / Hyperlane / Wormhole / Axelar) · `restaking-specialist` (EigenLayer / Symbiotic / Karak) · `intents-specialist` (ERC-7683 / UniswapX / CoW)

### 33 auto-invoked vulnerability skills

A detection-skill library that auto-activates when Claude sees matching code patterns. Covers the full CWE/SWC catalog plus modern DeFi-specific issues:

**Classic (19):** reentrancy (incl. read-only and cross-contract) · access control · oracle manipulation · flash-loan attacks · MEV/front-running · signature replay · storage layout · initialization · unchecked calls · DoS vectors · integer issues · delegatecall risks · tx-context misuse · token compatibility · approval issues · EIP-6780 self-destruct · inline assembly · pragma & address hygiene · centralization risk.

**Hot-topic 2025 (8):** ERC-4337 account abstraction · cross-chain messaging · Permit2 / EIP-2612 · ERC-1271 contract signatures · Diamond / EIP-2535 · restaking & EigenLayer AVS · ERC-7683 intents · ERC-4626 inflation/donation.

**AI-quality meta-skills (4):** confidence scoring · multi-pass self-critique (`/audit-strict`) · known-good reference comparison · false-positive feedback loop (`/dismiss` + `.rugproof.yml ignore:` + inline `// rugproof-ignore` markers).

**DX meta-skills (2):** caching-and-incremental (skip unchanged files) · progress-and-streaming (live status during long audits).

### 9 MCP servers

Chain I/O, test runners, history databases — `block-explorer` · `forge-runner` · `hardhat-runner` · `anvil` · `tenderly` · `c4-history` · `sherlock-history` · `gas-tracker` · `token-metadata`.

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

**Languages:** Solidity (full) · Vyper (most patterns) · Stylus / CosmWasm / Solana-Anchor (top vuln classes) · Yul / inline assembly (specialist)

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
├── commands/                         # 38 slash commands (real prompts)
├── agents/                           # 19 subagents
├── skills/                           # 33 auto-invoked detection skills
├── mcp/                              # 9 MCP servers (TypeScript)
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
make build       # builds all 9 MCP servers + scripts
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
node scripts/dist/test-mcp.js   # MCP smoke test (9/9 servers should pass)
```

The plugin.json points to `mcp/<name>-mcp/dist/index.js` for each server. Most return mock data when API keys / external tools are absent so the plugin works out-of-the-box even without a fully configured environment.

## Roadmap

This v1 release ships the **full skeleton** — every command, agent, skill, MCP, hook, template, and example contract is in place with real content. Phases that follow tighten implementation depth:

| Phase | Scope |
|------:|:------|
| 1 *(this release)* | Full skeleton: 38 commands · 19 agents · 33 skills · 9 MCPs · 4 hooks · 5 demo contracts · NFT cert · GitHub Action · Pages site |
| 2 | Wire `/exploit` end-to-end through `forge-runner-mcp` against real protocol forks |
| 3 | Real Etherscan-family integration in `block-explorer-mcp`; live audits production-ready |
| 4 | Tighten DeFi specialists with real-world test corpora; ship community rule packs |
| 5 | Public audit gallery served from a dynamic backend; bug-bounty submission API integration |
| 6 | Multi-language (Vyper, Stylus/Rust); on-chain audit certificate live on Berachain mainnet; Claude Code marketplace launch |

## License

MIT
