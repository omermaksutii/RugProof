---
description: Mint a soulbound Audit Certificate NFT on Berachain (or other supported chain) for a completed audit.
argument-hint: "[--chain berachain] [--ipfs-pin]"
allowed-tools: Read, Bash, mcp__block-explorer__*
---

# /mint-cert — mint an Audit Certificate NFT

Mints a soulbound NFT recording the completed audit. The token's metadata bundle (audit JSON + Markdown report + PNG card) is pinned to IPFS.

Default chain: **Berachain** (the launch ecosystem).

## Prerequisites

- A completed `/audit` (with results saved to `rugproof-reports/`)
- Wallet env: `RUGPROOF_SUBJECT_PK` (the subject's signing key) and `RUGPROOF_SUBJECT_ADDR`
- Issuer signature obtained from Rugproof's signer service (`POST https://api.omermaksutii.github.io/RugProof/v1/issue-cert` with audit JSON; returns issuer sig)
- IPFS pinning credentials (Pinata / Web3.Storage / Filecoin) if using `--ipfs-pin`

## Procedure

1. **Bundle the audit.** Collect:
   - `findings.json`
   - `audit.md` rendered report
   - `audit-card.png` PNG card
   Hash all three together → `reportHash` (sha256).

2. **Pin to IPFS.** If `--ipfs-pin`, upload the bundle. Capture CID. Otherwise expect `RUGPROOF_BUNDLE_CID` env var.

3. **Request issuer signature.** POST the bundle metadata + reportHash to Rugproof's signer:
   ```bash
   curl -X POST https://api.omermaksutii.github.io/RugProof/v1/issue-cert \
        -H "content-type: application/json" \
        -d '{ "subject": "0x...", "reportHash": "0x...", "ipfsCid": "Qm...", "targetName": "MyVault", "grade": 5, "chainId": 80094 }'
   ```
   Returns `{ "issuerSig": "0x..." }`.

4. **Submit the mint tx.** Call `AuditCertificate.issue(subject, reportHash, ipfsCid, targetName, grade, issuerSig)` on the deployment for the target chain.

5. **Output the cert.**
   ```
   ✓ minted Rugproof Audit Certificate
     chain:       berachain
     contract:    0xCERT...
     tokenId:     42
     subject:     0xUSER...
     ipfs:        ipfs://QmExample...
     opensea:     https://opensea.io/...   (or beratrail equivalent)
     image:       https://gateway.ipfs.io/ipfs/QmExample.../card.png
   ```

## Why soulbound

The cert is bound to the audited contract owner / repo maintainer. Transferring it would amount to selling a security claim, which would be fraud. Soulbound prevents secondary-market drift.

## Notes

- The mint costs gas (~150K). On Berachain that's fractions of a cent.
- Rugproof's issuer signer is a multi-sig — sigs are countersigned only after Rugproof has independently re-verified the audit JSON.
- Cert grade is permanent. Re-audit produces a new cert; old certs aren't burned (they're history).
- `RUGPROOF_OFFLINE=1` blocks this command.
