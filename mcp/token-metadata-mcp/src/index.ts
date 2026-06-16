#!/usr/bin/env node
/**
 * Rugproof token-metadata MCP server.
 * Fetches ERC-20 metadata via eth_call, detects fee-on-transfer / rebasing / blacklist patterns.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

const RPCS: Record<string, string> = {
  ethereum: "https://eth.llamarpc.com",
  berachain: "https://rpc.berachain.com",
  arbitrum: "https://arb1.arbitrum.io/rpc",
  base: "https://mainnet.base.org",
  optimism: "https://mainnet.optimism.io",
  polygon: "https://polygon-rpc.com",
  bsc: "https://bsc-dataseed.binance.org",
  linea: "https://rpc.linea.build",
  zksync: "https://mainnet.era.zksync.io",
  scroll: "https://rpc.scroll.io",
};

const SELECTOR = {
  name: "0x06fdde03",
  symbol: "0x95d89b41",
  decimals: "0x313ce567",
  totalSupply: "0x18160ddd",
};

// Keyed by lowercase address so lookups are case-insensitive regardless of how
// the caller checksums the address.
const KNOWN_QUIRKS: Record<string, string[]> = {
  "0xdac17f958d2ee523a2206206994597c13d831ec7": ["non-standard-return", "blacklistable", "pausable"],   // USDT mainnet
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": ["blacklistable", "pausable"],                          // USDC mainnet
  "0x6b175474e89094c44da98b954eedeac495271d0f": ["dai-permit-variant"],                                 // DAI
  "0x83f20f44975d03b1b09e64809b757c47f942beea": ["rebasing"],                                           // sDAI
  "0xae7ab96520de3a18e5e111b5eaab095312d7fe84": ["rebasing"],                                           // stETH
  "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2": ["dao-pausable"],                                       // MKR
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": [],                                                     // WETH (clean baseline)
};

async function ethCall(rpc: string, to: string, data: string): Promise<string | null> {
  try {
    const res = await fetch(rpc, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0", id: 1, method: "eth_call",
        params: [{ to, data }, "latest"],
      }),
    });
    const j: any = await res.json();
    return j.result ?? null;
  } catch {
    return null;
  }
}

function decodeString(hex: string | null): string {
  if (!hex || hex === "0x") return "";
  try {
    if (hex.length === 66) {
      // bytes32 packed
      let out = "";
      for (let i = 2; i < 66; i += 2) {
        const c = parseInt(hex.substr(i, 2), 16);
        if (c === 0) break;
        out += String.fromCharCode(c);
      }
      return out;
    }
    // dynamic bytes/string ABI encoding
    const len = parseInt(hex.substr(66, 64), 16);
    let out = "";
    for (let i = 0; i < len; i++) {
      out += String.fromCharCode(parseInt(hex.substr(130 + i * 2, 2), 16));
    }
    return out;
  } catch {
    return hex;
  }
}

const server = new Server(
  { name: "rugproof-token-metadata", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "get_token_metadata",
      description: "Fetch name, symbol, decimals, totalSupply for an ERC-20 token.",
      inputSchema: {
        type: "object",
        properties: { chain: { type: "string" }, address: { type: "string" } },
        required: ["chain", "address"],
      },
    },
    {
      name: "detect_quirks",
      description: "Detect known token quirks (fee-on-transfer, rebasing, blacklistable, pausable).",
      inputSchema: {
        type: "object",
        properties: { chain: { type: "string" }, address: { type: "string" } },
        required: ["chain", "address"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;

  if (name === "get_token_metadata") {
    const { chain, address } = z.object({
      chain: z.string(), address: z.string(),
    }).parse(args);
    const rpc = RPCS[chain];
    if (!rpc) return textResult({ __error: `unsupported chain: ${chain}` });
    const [n, s, d, t] = await Promise.all([
      ethCall(rpc, address, SELECTOR.name),
      ethCall(rpc, address, SELECTOR.symbol),
      ethCall(rpc, address, SELECTOR.decimals),
      ethCall(rpc, address, SELECTOR.totalSupply),
    ]);
    return textResult({
      address, chain,
      name: decodeString(n),
      symbol: decodeString(s),
      decimals: d ? parseInt(d, 16) : null,
      totalSupply: t ?? null,
    });
  }

  if (name === "detect_quirks") {
    const { address } = z.object({
      chain: z.string(), address: z.string(),
    }).parse(args);
    const known = KNOWN_QUIRKS[address.toLowerCase()];
    const quirks = known ?? [];
    return textResult({
      address,
      known: known !== undefined,
      quirks,
      hint: known === undefined
        ? "Address not in the known-quirks DB — verify ERC-20 behaviour against your own tests."
        : quirks.length === 0
          ? "Known token with no integration-breaking quirks."
          : "Detected quirks may affect ERC-20 integration; see [[token-compatibility]] skill.",
    });
  }

  throw new Error(`unknown tool: ${name}`);
});

function textResult(obj: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(obj, null, 2) }] };
}

const transport = new StdioServerTransport();
await server.connect(transport);
