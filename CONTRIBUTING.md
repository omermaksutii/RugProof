# Contributing to Rugproof

Thanks for considering a contribution. The core invariant: **a finding is only worth shipping if it's a real bug.** That extends to the rules, the agents, and the docs.

## Where contributions go

| What you want to add | Where it lives |
|---|---|
| New vulnerability skill | `skills/<name>/SKILL.md` |
| New specialist subagent | `agents/<name>.md` |
| New slash command | `commands/<name>.md` |
| New MCP tool | `mcp/<name>-mcp/src/index.ts` |
| New hook | `hooks/<name>.sh` + register in `plugin.json` |
| Demo vulnerable contract | `examples/<Name>.sol` + update `examples/README.md` |
| Sample audit report | `samples/audit-<name>.md` (+ optional JSON for HTML render) |
| Community rule pack | separate repo; see `rules/README.md` |

## Quality bar

For a new skill (vuln detection rule):

- [ ] **One focused vuln class.** Don't bundle "reentrancy + oracle". Split.
- [ ] **Real detection patterns** with code samples.
- [ ] **Severity rubric** matching Rugproof's Critical/High/Medium/Low/Info scale.
- [ ] **Remediation pattern** — show the fix, not just the diagnosis.
- [ ] **False-positive notes** — when does the pattern *not* indicate a bug?
- [ ] At least one example tested against an intentionally vulnerable contract in `examples/`.

For a new specialist subagent:

- [ ] Triggered by a specific protocol type (don't add overlap with existing specialists).
- [ ] Lists the specific patterns it audits.
- [ ] Links to historical incidents.
- [ ] Has a clear "don't" section (when not to use it).

For a new MCP tool:

- [ ] TypeScript + `@modelcontextprotocol/sdk`
- [ ] `zod` for input validation
- [ ] Mock-data fallback when env / network missing
- [ ] Cache layer if it hits a rate-limited API
- [ ] No secrets in logs

## Local dev

```bash
# Install deps
cd mcp && npm install
cd ../scripts && npm install

# Build everything
cd .. && make build      # or: cd mcp && npm run build && cd ../scripts && npm run build

# Run the demo audit
make audit-demo          # or: forge test --match-contract ExploitREENT001 -vv

# Render samples
make sample-cards        # PNG cards for samples/
make sample-html         # HTML pages for web/docs/
```

## Tests

- Foundry tests: `forge test`
- NFT certificate tests: `FOUNDRY_PROFILE=nft forge test`
- MCP smoke test: `node scripts/dist/test-mcp.js`

All PRs run the GitHub Action which exercises the above.

## Style

- Solidity: pinned compiler in `foundry.toml`. Forge format runs in CI.
- TypeScript: strict mode. No `any` unless interfacing with untyped JSON.
- Markdown: 80-col soft wrap; no trailing whitespace; one H1 per file.
- Commit messages: imperative, one-line subject under 72 chars, optional body.

## Process

1. Open an issue first if your change is non-trivial — saves rework.
2. Fork → branch → commit → PR.
3. PR title = changelog line. Be specific.
4. Be patient with review. Security tools deserve careful review.

## Code of conduct

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). TL;DR: be kind, focus on the work.
