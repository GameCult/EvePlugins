import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

const root = path.resolve(import.meta.dirname, "..");
const fixture = JSON.parse(fs.readFileSync(path.join(root, "plugins/eve-plugin-tex/plugin-abi-fixture.json"), "utf8"));
const child = spawn(process.execPath, [path.join(root, "plugins/eve-plugin-tex/src/sidecar.mjs")], { cwd: root, stdio: ["pipe", "pipe", "inherit"] });
const responses = readline.createInterface({ input: child.stdout })[Symbol.asyncIterator]();

try {
  for (let index = 0; index < fixture.operations.length; index += 1) {
    const operation = fixture.operations[index];
    const requestId = `tex-witness-${index}`;
    child.stdin.write(`${JSON.stringify({ schema: fixture.requestSchema, pluginId: fixture.pluginId, operation: operation.operation, requestId, input: operation.input })}\n`);
    const next = await responses.next();
    assert.equal(next.done, false);
    const response = JSON.parse(next.value);
    assert.equal(response.schema, fixture.responseSchema);
    assert.equal(response.pluginId, fixture.pluginId);
    assert.equal(response.operation, operation.operation);
    assert.equal(response.requestId, requestId);
    assert.equal(response.status, "accepted");
    assertSubset(response.output, operation.expect, operation.operation);
  }
} finally {
  child.stdin.end();
  child.kill();
}

const outputDir = path.join(root, "artifacts", "tex-math");
fs.mkdirSync(outputDir, { recursive: true });
const witness = {
  schema: "gamecult.eve.plugin_witness.v1",
  witnessId: "tex.math.owner-sidecar",
  pluginId: "tex.math",
  ownerRepo: "EvePlugins",
  transport: "stdio-ndjson",
  operations: fixture.operations.map(({ operation }) => operation),
  status: "passed",
};
fs.writeFileSync(path.join(outputDir, "runtime-witness.json"), `${JSON.stringify(witness, null, 2)}\n`);
console.log(path.join(outputDir, "runtime-witness.json"));

function assertSubset(actual, expected, label) {
  if (Array.isArray(expected)) {
    assert.deepEqual(actual, expected, label);
    return;
  }
  if (expected && typeof expected === "object") {
    for (const [key, value] of Object.entries(expected)) assertSubset(actual?.[key], value, `${label}.${key}`);
    return;
  }
  assert.equal(actual, expected, label);
}
