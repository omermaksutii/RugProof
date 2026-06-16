# Rugproof v1.0.0 — launch handoff

The codebase is **launch-ready**: feature-complete, tested, documented, offline-first.
Everything that can be built autonomously is done. What remains are **external
actions only the project owner can perform** — they need keys, funds, hosting, or
accounts that can't live in the repo. Each is wired up to the point of a single
trigger.

## Ready to trigger (you provide the secret/account)

| Step | What's done | What you do |
|---|---|---|
| **Cut the GitHub release** | `release.yml` builds + packages, gated on version/tag match | `git tag v1.0.0 && git push origin v1.0.0` |
| **Marketplace submission** | `plugin.json` / `marketplace.json` complete and valid | Submit at [platform.claude.com/plugins/submit](https://platform.claude.com/plugins/submit) |
| **On-chain certificate live** | Contract + deploy script + signer tested; runbook in `nft/DEPLOY.md` | `make deploy-cert-testnet` then `deploy-cert-mainnet` with a funded key |
| **Live block-explorer / token-safety** | Etherscan v2 + GoPlus integrations done; offline fallback tested | Export `ETHERSCAN_API_KEY` (one key, all v2 chains) |
| **Real static-analyzer runs** | `slither-runner` / `mythril-runner` / `fuzz-runner` ready; CI `live-analyzers` job proves the path | `pip install slither-analyzer mythril`; install echidna/medusa/halmos |
| **Bug-bounty submission** | `format-bounty` produces Immunefi payloads; `/bounty-submit` wired | Export `IMMUNEFI_API_KEY` |
| **Public audit gallery (dynamic)** | Static gallery generated from `docs/gallery/manifest.json` | Provision hosting/domain if you want submissions beyond the static manifest |
| **Live `/audit` in CI** | `rugproof-pr.yml` runs in dry-run without a key | Add `ANTHROPIC_API_KEY` to repo secrets |
| **Demo videos / social / DNS** | README + Pages site live | Record, tweet, point a domain |

## What "1.0.0" guarantees

- **Stable findings schema** — `schemas/finding.schema.json` is frozen for the
  1.x line (see `docs/docs/stability.html`). Parser/report output validates against it.
- **Semver** — no breaking changes to command names, the findings shape, or MCP
  tool signatures within 1.x.
- **Offline-first** — works with zero configuration; every integration degrades
  to labeled mock data.
- **Tested** — Foundry + NFT tests, script unit tests, MCP integration tests
  (all 13 servers), e2e report pipeline, rule-pack validation, accuracy benchmark,
  docs/gallery drift gates, secret scan — all green in CI.

## Verify locally

```bash
make build && make test        # full suite
make validate-rules            # bundled rule packs
make bench                     # detection benchmark (add FINDINGS=<dir> for real scores)
node scripts/check-versions.mjs
```
