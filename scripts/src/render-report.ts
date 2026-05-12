#!/usr/bin/env node
/**
 * Render the audit report from findings JSON to Markdown + HTML.
 *
 * Usage:
 *   render-report --findings <path> [--out-md <path>] [--out-html <path>]
 */

import { readFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Handlebars from "handlebars";

const here = dirname(fileURLToPath(import.meta.url));
const TPL_DIR = resolve(here, "..", "..", "templates");

function parseArgs(argv: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const k = a.slice(2);
      const v = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "true";
      out[k] = v;
    }
  }
  return out;
}

function severityLower(s: string): string {
  return (s || "info").toLowerCase();
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.findings) {
    console.error("usage: render-report --findings <path> [--out-md path] [--out-html path]");
    process.exit(1);
  }
  const findings = JSON.parse(await readFile(resolve(args.findings), "utf-8"));

  // Decorate each finding with severity_lower for HTML CSS
  if (Array.isArray(findings.findings)) {
    findings.findings = findings.findings.map((f: any) => ({
      ...f, severity_lower: severityLower(f.severity),
    }));
  }

  const tplMd = await readFile(resolve(TPL_DIR, "report.md.hbs"), "utf-8");
  const tplHtml = await readFile(resolve(TPL_DIR, "report.html.hbs"), "utf-8");

  const md = Handlebars.compile(tplMd)(findings);
  const html = Handlebars.compile(tplHtml)(findings);

  const outMd = args["out-md"] ?? `audit-${findings.date ?? "now"}.md`;
  const outHtml = args["out-html"] ?? `audit-${findings.date ?? "now"}.html`;

  await writeFile(resolve(outMd), md, "utf-8");
  await writeFile(resolve(outHtml), html, "utf-8");

  console.log(`✓ wrote ${outMd}\n✓ wrote ${outHtml}`);
}

main().catch((err) => {
  console.error("render-report failed:", err);
  process.exit(1);
});
