import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dispatch } from "../src/plugin.mjs";

function request(operation, input = {}) {
  return dispatch({ schema: "gamecult.eve.plugin_abi.request.v1", pluginId: "fields.surface", operation, requestId: operation, input });
}

const document = {
  schema: "gamecult.fields.surface2d.v1",
  fieldId: "fixture.field",
  bounds: { minX: -10, minY: -5, maxX: 10, maxY: 5 },
  channels: [
    { channelId: "height", kind: "scalar", documentId: "cultmesh://fixture/height", schemaId: "gamecult.fields.scalar.v1" },
  ],
};

test("projects provider-owned field documents without taking native projection authority", () => {
  const result = request("project", { document });
  assert.equal(result.schema, "gamecult.fields.projection.v1");
  assert.equal(result.projectionKind, "semantic-field-surface");
  assert.equal(result.channels[0].documentId, "cultmesh://fixture/height");
  assert.equal(result.nativeProjectionAuthority, "runtime-adapter");
  assert.equal(result.providerStateMutated, false);
});

test("rejects components and schemas outside field ownership", () => {
  const result = request("validate", { componentKinds: ["field.surface2d", "world.scene3d"], document });
  assert.deepEqual(result.acceptedComponentKinds, ["field.surface2d"]);
  assert.deepEqual(result.rejectedComponentKinds, ["world.scene3d"]);
  assert.equal(result.validDocument, true);
  assert.equal(request("validate", { componentKinds: ["field.surface2d"], document: { ...document, schema: "provider.private.v1" } }).validDocument, false);
});

test("measures field domains without mutating provider state", () => {
  const result = request("measure", { document });
  assert.equal(result.width, 20);
  assert.equal(result.height, 10);
  assert.equal(result.channelCount, 1);
  assert.deepEqual(result.measurementOutputs, ["width", "height", "channelCount"]);
  assert.equal(result.preservesProviderAuthority, true);
});

test("publishes a runtime-neutral Unity contract package", () => {
  const packageRoot = new URL("../unity/org.gamecult.eve.plugin-fields/", import.meta.url);
  const manifest = JSON.parse(readFileSync(new URL("package.json", packageRoot), "utf8"));
  const contracts = readFileSync(new URL("Runtime/EveFieldsContracts.cs", packageRoot), "utf8");
  assert.equal(manifest.name, "org.gamecult.eve.plugin-fields");
  assert.match(contracts, /interface IEveFieldsSplatsDocument/);
  assert.match(contracts, /gamecult\.fields\.splats\.v1/);
  assert.doesNotMatch(contracts, /UnityEngine|Aetheria|MessagePack|GameCult\.Caching/);
  assert.match(readFileSync(new URL("../GameCult.Eve.PluginFields.csproj", import.meta.url), "utf8"), /netstandard2\.1/);
});

test("records fields plugin graduation after two native runtime proofs", () => {
  const manifest = JSON.parse(readFileSync(new URL("../plugin.json", import.meta.url), "utf8"));
  assert.equal(manifest.graduation.status, "graduated");
  assert.deepEqual(manifest.graduation.runtimeAdapters, ["web-reference", "unity-scene"]);
});
