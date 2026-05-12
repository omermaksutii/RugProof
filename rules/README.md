# Rugproof rule packs

Rule packs are user-published bundles of detection rules. Install with:

```
/plugin marketplace add <github-user>/<rule-pack-repo>
/plugin install <pack-name>
```

A rule pack lives in its own directory at the top level of a Claude plugin. Inside:

```
my-rule-pack/
├── pack.yml                  # metadata + author + license
├── skills/
│   ├── <rule-name>/SKILL.md  # detection rule (auto-loaded skill)
│   └── ...
├── agents/                   # optional — custom specialist subagents
└── README.md
```

## Pack manifest

```yaml
# pack.yml
name: my-rule-pack
version: 1.0.0
author: Alice (alice@example.com)
license: MIT
description: Custom detection rules for Acme Protocol forks.
target: solidity
requires_rugproof: ">=0.1.0"
rules:
  - acme-fork-fee-bypass
  - acme-fork-cooldown-skip
```

## Authoring a rule

A rule is just a Rugproof skill with frontmatter + detection guidance. See `community-pack-example/skills/example-fork-detection/SKILL.md` for a template.

## Curation

Rugproof maintains a curated index at https://omermaksutii.github.io/RugProof/rules. Submit your pack via PR to https://github.com/omermaksutii/RugProof-rules-index. Curated packs:

- Get the verified-author badge
- Appear in `/plugin marketplace browse rules`
- Receive bug reports / community contributions

## Conventions

- One rule = one skill file. Don't bundle.
- Severity rubric: match Rugproof's Critical/High/Medium/Low/Info scale.
- Always include false-positive notes.
- Always include a remediation pattern.
- Test on at least one realistic vulnerable example.

## Why rule packs

Custom forks of protocols (Uniswap V2 forks, Compound forks, Curve forks) often introduce protocol-specific bugs. The base Rugproof skills can't anticipate every fork's quirks. Rule packs let auditors share the lessons learned from auditing one fork with everyone auditing similar forks.
