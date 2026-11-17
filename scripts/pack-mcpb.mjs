#!/usr/bin/env node
/**
 * pack-mcpb: build dist/recap-studio.mcpb, the MCP bundle attached to each
 * GitHub release and listed in server.json for the MCP registry.
 *
 * An .mcpb file is a zip with a manifest.json and the server files. This
 * script writes the zip itself, with stored (uncompressed) entries, a fixed
 * timestamp and a fixed order. The same sources therefore give the same bytes
 * on every machine, so the sha256 in server.json can be checked in CI.
 *
 *   node scripts/pack-mcpb.mjs           build the bundle, print its sha256
 *   node scripts/pack-mcpb.mjs --write   also write the sha256 and URL into server.json
 *   node scripts/pack-mcpb.mjs --check   exit 1 when server.json does not match the bundle
 */
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(resolve(root, p));
const pkg = JSON.parse(read("package.json"));
const plugin = JSON.parse(read(".claude-plugin/plugin.json"));

/** The MCPB manifest. Tool names come from the bundle itself, so they cannot drift. */
async function manifest() {
  const list = await toolsFromServer();
  return {
    manifest_version: "0.3",
    name: "recap-studio",
    display_name: "Recap Studio",
    version: pkg.version,
    description: "Render one HTML page you can email or open offline, and score it first. No JavaScript, no network.",
    long_description: plugin.description,
    author: { name: "Adam Boudjemaa", url: "https://github.com/Aboudjem" },
    repository: { type: "git", url: "https://github.com/Aboudjem/recap-studio" },
    homepage: "https://github.com/Aboudjem/recap-studio",
    documentation: "https://github.com/Aboudjem/recap-studio/blob/main/docs/mcp-tools.md",
    support: "https://github.com/Aboudjem/recap-studio/issues",
    license: "MIT",
    icon: "icon.png",
    keywords: ["explainer", "recap", "html", "offline", "validation"],
    server: {
      type: "node",
      entry_point: "server/recap.mjs",
      mcp_config: { command: "node", args: ["${__dirname}/server/recap.mjs", "mcp"] },
    },
    tools: list.map((t) => ({ name: t.name, description: t.description })),
    compatibility: { platforms: ["darwin", "win32", "linux"], runtimes: { node: ">=20.0.0" } },
  };
}

/** Ask the bundled server for its tool list over stdio, exactly as a client would. */
async function toolsFromServer() {
  const { spawnSync } = await import("node:child_process");
  const r = spawnSync("node", [resolve(root, "bin/recap.mjs"), "mcp"], {
    input: '{"jsonrpc":"2.0","id":1,"method":"tools/list"}\n',
    encoding: "utf8",
  });
  return JSON.parse(r.stdout.trim().split("\n")[0]).result.tools;
}

// ---- A minimal, deterministic zip writer (stored entries only) --------------

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

export function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

// 1980-01-01 00:00:00, the zip epoch: no clock, no timezone.
const DOS_TIME = 0;
const DOS_DATE = (0 << 9) | (1 << 5) | 1;

/** Build a zip from [{ name, data }] in the given order. */
export function zip(entries) {
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const { name, data } of entries) {
    const nameBuf = Buffer.from(name, "utf8");
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4); // version needed
    local.writeUInt16LE(0x0800, 6); // UTF-8 names
    local.writeUInt16LE(0, 8); // stored
    local.writeUInt16LE(DOS_TIME, 10);
    local.writeUInt16LE(DOS_DATE, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);
    locals.push(local, nameBuf, data);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(0x0314, 4); // made by: unix, zip 2.0
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(DOS_TIME, 12);
    central.writeUInt16LE(DOS_DATE, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt32LE((0o100644 << 16) >>> 0, 38); // -rw-r--r--
    central.writeUInt32LE(offset, 42);
    centrals.push(central, nameBuf);
    offset += local.length + nameBuf.length + data.length;
  }
  const centralSize = centrals.reduce((n, b) => n + b.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, ...centrals, end]);
}

/** The bundle bytes for the current sources. */
export async function buildMcpb() {
  return zip([
    { name: "manifest.json", data: Buffer.from(JSON.stringify(await manifest(), null, 2) + "\n", "utf8") },
    { name: "server/recap.mjs", data: read("bin/recap.mjs") },
    { name: "icon.png", data: read(".claude-plugin/icon.png") },
    { name: "LICENSE", data: read("LICENSE") },
  ]);
}

export const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");
export const assetUrl = (version) =>
  `https://github.com/Aboudjem/recap-studio/releases/download/v${version}/recap-studio.mcpb`;

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const bytes = await buildMcpb();
  const hash = sha256(bytes);
  const serverPath = resolve(root, "server.json");
  const server = JSON.parse(readFileSync(serverPath, "utf8"));
  const entry = server.packages?.find((p) => p.registryType === "mcpb");

  if (process.argv.includes("--check")) {
    const bad = [];
    if (server.version !== pkg.version) bad.push(`server.json version ${server.version}, package.json ${pkg.version}`);
    if (entry?.fileSha256 !== hash) bad.push(`server.json fileSha256 ${entry?.fileSha256}, bundle ${hash}`);
    if (entry?.identifier !== assetUrl(pkg.version)) bad.push(`server.json identifier ${entry?.identifier}`);
    if (bad.length) {
      console.error(`server.json does not match the bundle: ${bad.join("; ")}. Run \`npm run pack:mcpb -- --write\`.`);
      process.exit(1);
    }
    console.log(`ok: server.json matches the bundle (sha256 ${hash})`);
  } else {
    const out = resolve(root, "dist/recap-studio.mcpb");
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, bytes);
    console.log(`wrote dist/recap-studio.mcpb (${(bytes.length / 1024).toFixed(1)} KB)\nsha256 ${hash}`);
    if (process.argv.includes("--write")) {
      server.version = pkg.version;
      entry.identifier = assetUrl(pkg.version);
      entry.fileSha256 = hash;
      writeFileSync(serverPath, JSON.stringify(server, null, 2) + "\n", "utf8");
      console.log("updated server.json");
    }
  }
}
