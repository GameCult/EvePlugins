import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { Buffer } from "node:buffer";
import { decode, encode } from "@msgpack/msgpack";
import { invokeCultNetOperation } from "cultnet-ts";

const root = path.resolve(import.meta.dirname, "..");
const fixture = JSON.parse(fs.readFileSync(path.join(root, "plugins/eve-plugin-tex/plugin-abi-fixture.json"), "utf8"));
const child = spawn(process.execPath, [path.join(root, "plugins/eve-plugin-tex/src/cultnet-sidecar.mjs")], { cwd: root, stdio: ["ignore", "pipe", "inherit"] });
const responses = readline.createInterface({ input: child.stdout })[Symbol.asyncIterator]();
const endpointLine = await responses.next();
assert.equal(endpointLine.done, false);
const endpointAdvertisement = JSON.parse(endpointLine.value);
assert.equal(endpointAdvertisement.pluginId, fixture.pluginId);
const endpoint = endpointAdvertisement.endpoint;
const startedAt = performance.now();
const operationWitnesses = [];

try {
  for (let index = 0; index < fixture.operations.length; index += 1) {
    const operation = fixture.operations[index];
    const requestId = `tex-witness-${index}`;
    const operationStartedAt = performance.now();
    const abiRequest = { schema: fixture.requestSchema, pluginId: fixture.pluginId, operation: operation.operation, requestId, input: operation.input };
    const envelope = await invokeCultNetOperation(endpoint, {
      schemaVersion: "cultnet.operation_request.v0",
      messageId: requestId,
      serviceId: fixture.pluginId,
      operation: operation.operation,
      payloadSchema: fixture.requestSchema,
      payloadEncoding: "messagepack-base64",
      payload: Buffer.from(encode(abiRequest)).toString("base64"),
      sourceRuntimeId: "eve-conformance",
    }, { runtimeId: "eve-conformance" });
    const response = decode(Buffer.from(envelope.payload, "base64"));
    assert.equal(response.schema, fixture.responseSchema);
    assert.equal(response.pluginId, fixture.pluginId);
    assert.equal(response.operation, operation.operation);
    assert.equal(response.requestId, requestId);
    assert.equal(response.status, "accepted");
    assertSubset(response.output, operation.expect, operation.operation);
    operationWitnesses.push({
      operation: operation.operation,
      requestId,
      status: response.status,
      durationMs: Number((performance.now() - operationStartedAt).toFixed(3)),
      expectationCount: Object.keys(operation.expect).length,
    });
  }
} finally {
  child.kill();
}

const outputDir = path.join(root, "artifacts", "tex-math");
fs.mkdirSync(outputDir, { recursive: true });
const witness = {
  schema: "gamecult.eve.plugin_witness.v1",
  witnessId: "tex.math.owner-sidecar",
  pluginId: "tex.math",
  ownerRepo: "EvePlugins",
  status: "pass",
  transport: "cultnet-operation-v0+rudp",
  generatedAtUtc: new Date().toISOString(),
  durationMs: Number((performance.now() - startedAt).toFixed(3)),
  operations: operationWitnesses,
  advertisementPath: "plugins/eve-plugin-tex/advertisement.json",
  fixturePath: "plugins/eve-plugin-tex/plugin-abi-fixture.json",
  executable: { artifact: "plugins/eve-plugin-tex/src/cultnet-sidecar.mjs", command: "node" },
  diagnostics: [],
  authority: "plugin-sidecar-owns-tex-semantics-provider-retains-source-and-command-acceptance",
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
