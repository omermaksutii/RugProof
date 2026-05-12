.PHONY: help build build-mcp build-scripts test test-foundry test-nft test-mcp \
        sample-cards sample-html demo audit-demo render-card clean fmt

DEFAULT_GOAL := help

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "} {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

build: build-mcp build-scripts ## Build everything (MCP servers + scripts)

build-mcp: ## Build all 9 MCP servers
	cd mcp && npm install && npm run build

build-scripts: ## Build the scripts/ TypeScript bundle
	cd scripts && npm install && npm run build

test: test-foundry test-nft test-mcp ## Run all test suites

test-foundry: ## Run Foundry exploit tests against the demo contracts
	forge test -vv

test-nft: ## Run AuditCertificate (soulbound NFT) tests
	FOUNDRY_PROFILE=nft forge test -vv

test-mcp: ## MCP smoke test — JSON-RPC roundtrip against all servers
	node scripts/dist/test-mcp.js

sample-cards: build-scripts ## Render PNG audit cards for the 5 demo contracts
	@for pair in \
	  "VulnerableVault:samples/sample-findings.json:samples/sample-card.png" \
	  "SpotOracleLending:samples/findings-spot-oracle.json:samples/card-spot-oracle.png" \
	  "FlashLoanGovernance:samples/findings-flash-loan-gov.json:samples/card-flash-loan-gov.png" \
	  "Inflatable4626:samples/findings-inflatable.json:samples/card-inflatable.png" \
	  "ReplayableBridge:samples/findings-replayable-bridge.json:samples/card-replayable-bridge.png"; do \
	    IFS=: read -r name in out <<< "$$pair"; \
	    node scripts/dist/render-card.js --findings "$$in" --out "$$out"; \
	done
	cp samples/sample-card.png samples/card-*.png web/assets/

sample-html: build-scripts ## Render the 5 sample audit reports as HTML pages
	@for pair in \
	  "audit-vulnerable-vault.md:web/docs/sample-vulnerable-vault.html" \
	  "audit-spot-oracle-lending.md:web/docs/sample-spot-oracle-lending.html" \
	  "audit-flash-loan-governance.md:web/docs/sample-flash-loan-governance.html" \
	  "audit-inflatable-4626.md:web/docs/sample-inflatable-4626.html" \
	  "audit-replayable-bridge.md:web/docs/sample-replayable-bridge.html"; do \
	    IFS=: read -r src dst <<< "$$pair"; \
	    node scripts/dist/md-to-html.js --in "samples/$$src" --out "$$dst"; \
	done

audit-demo: ## Run the bundled exploit PoC against VulnerableVault
	forge test --match-contract ExploitREENT001 -vv

demo: audit-demo ## Alias for audit-demo

render-card: build-scripts ## Render an arbitrary card. Usage: make render-card IN=findings.json OUT=card.png
	node scripts/dist/render-card.js --findings "$(IN)" --out "$(OUT)"

clean: ## Remove build outputs
	rm -rf out out-nft cache mcp/*/dist scripts/dist

fmt: ## Format Solidity (forge fmt)
	forge fmt
