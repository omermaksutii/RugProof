# Security policy

## Reporting a vulnerability in Rugproof itself

If you've found a bug in **Rugproof** (the auditor) — not in a contract Rugproof audited — please report it privately:

- **Email:** the GitHub Security Advisory link below (PGP key: https://github.com/omermaksutii.gpg)
- **GitHub Security Advisory:** https://github.com/omermaksutii/RugProof/security/advisories/new

Please include:
- A reproduction (failing test, sample input, or PoC).
- Affected version (`plugin.json` version field).
- Whether you'd like attribution (anonymous OK).

We'll acknowledge within **48 hours** and aim to ship a fix or mitigation within **14 days** for High/Critical issues.

### Scope

In-scope:
- Code execution / sandbox escape via crafted contract input
- Path traversal in any file-handling tool
- Credential exfiltration via the MCP servers
- Any auditor-result manipulation that could mask a real vulnerability
- Telemetry / crash reporting leaking user data when opted out

Out-of-scope:
- Findings about contracts the user is auditing (those belong to the contract's protocol)
- Issues requiring an attacker who already controls the user's machine
- Theoretical issues without exploit paths

## Reporting a vulnerability in a contract Rugproof audited

If Rugproof identified a finding in a contract you don't own, **do not disclose publicly**. Use the protocol's bounty program:

- **Immunefi:** https://immunefi.com
- **Cantina:** https://cantina.xyz
- **SEAL 911 (active emergencies):** https://seal-911.com
- **Direct:** check the protocol's docs for `security@`

Rugproof's `/bounty-submit` command can format the disclosure for you.

## Hall of fame

Researchers who responsibly disclosed vulnerabilities in Rugproof:

| Date | Researcher | Severity | Finding |
|---|---|---|---|
| _your name here_ | | | |

## Coordinated-disclosure timeline

We honor a 90-day disclosure window by default. Active in-the-wild exploitation may shorten this; pre-disclosure of mitigation drafts may extend it. Report timeline is communicated explicitly in the acknowledgement.
