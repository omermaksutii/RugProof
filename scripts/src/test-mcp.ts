#!/usr/bin/env node
/**
 * MCP smoke test. Spawns each Rugproof MCP server, completes the JSON-RPC handshake,
 * lists tools, prints a summary, and exits non-zero on any failure.
 *
 * Usage:
 *   node scripts/dist/test-mcp.js                 # test all
 *   node scripts/dist/test-mcp.js gas-tracker     # test one
 */

import { spawn } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, "..", "..");
const MCP_DIR = resolve(ROOT, "mcp");

const SERVERS = [
  "block-explorer",
  "forge-runner",
  "hardhat-runner",
  "anvil",
  "tenderly",
  "c4-history",
  "sherlock-history",
  "gas-tracker",
  "token-metadata",
];

interface JsonRpc {
  jsonrpc: "2.0";
  id?: number | string;
  method?: string;
  params?: unknown;
  result?: unknown;
  error?: { code: number; message: string };
}

async function testServer(name: string, timeoutMs = 5000): Promise<{ name: string; ok: boolean; tools: number; error?: string }> {
  const dist = resolve(MCP_DIR, `${name}-mcp`, "dist", "index.js");
  if (!existsSync(dist)) {
    return { name, ok: false, tools: 0, error: `dist missing: ${dist}` };
  }

  return new Promise((resolveResult) => {
    const proc = spawn("node", [dist], { env: process.env });
    let buf = "";
    let toolCount = -1;
    let initialized = false;
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      try { proc.kill("SIGKILL"); } catch {}
      resolveResult({ name, ok: false, tools: 0, error: `timeout after ${timeoutMs}ms` });
    }, timeoutMs);

    proc.on("error", (err) => {
      clearTimeout(timer);
      resolveResult({ name, ok: false, tools: 0, error: String(err) });
    });

    proc.stderr.on("data", () => {/* swallow non-protocol noise */});

    proc.stdout.on("data", (chunk: Buffer) => {
      buf += chunk.toString();
      while (buf.includes("\n")) {
        const idx = buf.indexOf("\n");
        const line = buf.slice(0, idx).trim();
        buf = buf.slice(idx + 1);
        if (!line) continue;
        let msg: JsonRpc;
        try { msg = JSON.parse(line); }
        catch { continue; }

        if (msg.id === 1 && msg.result) {
          // initialize response received
          initialized = true;
          // send initialized notification
          send(proc, { jsonrpc: "2.0", method: "notifications/initialized" });
          // ask for tools/list
          send(proc, { jsonrpc: "2.0", id: 2, method: "tools/list" });
        }
        if (msg.id === 2 && msg.result) {
          const tools = (msg.result as { tools?: unknown[] }).tools ?? [];
          toolCount = tools.length;
          clearTimeout(timer);
          try { proc.kill("SIGTERM"); } catch {}
          if (!timedOut) resolveResult({ name, ok: toolCount > 0, tools: toolCount });
        }
        if (msg.error) {
          clearTimeout(timer);
          try { proc.kill("SIGTERM"); } catch {}
          resolveResult({ name, ok: false, tools: 0, error: `${msg.error.code}: ${msg.error.message}` });
        }
      }
    });

    // initialize
    send(proc, {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "rugproof-smoke-test", version: "0.1.0" },
      },
    });
  });
}

function send(proc: ReturnType<typeof spawn>, msg: JsonRpc) {
  proc.stdin?.write(JSON.stringify(msg) + "\n");
}

async function main() {
  const arg = process.argv[2];
  const targets = arg ? [arg] : SERVERS;
  const results = [];
  console.log(`\n🛡  Rugproof MCP smoke test — ${targets.length} server(s)\n`);

  for (const name of targets) {
    process.stdout.write(`  ${name.padEnd(22)} `);
    const r = await testServer(name);
    results.push(r);
    if (r.ok) console.log(`✓ ${r.tools} tools`);
    else console.log(`✗ ${r.error ?? "no tools"}`);
  }

  const okCount = results.filter((r) => r.ok).length;
  const failCount = results.length - okCount;
  console.log(`\n  ${okCount}/${results.length} passing`);
  if (failCount > 0) process.exit(1);
}

main();
