import assert from "node:assert/strict";
import test from "node:test";
import { dispatch } from "../src/plugin.mjs";

function request(operation, input = {}) {
  return dispatch({ schema: "gamecult.eve.plugin_abi.request.v1", pluginId: "tex.math", operation, requestId: operation, input });
}

test("typesets TeX through KaTeX without taking provider authority", () => {
  const result = request("lower", { documentId: "basic", source: "E = mc^2", displayMode: true });
  assert.equal(result.schema, "tex.math.render_result.v1");
  assert.equal(result.engine, "katex");
  assert.match(result.html, /katex/);
});

test("validates owned components and rejects invalid TeX", () => {
  assert.deepEqual(request("validate", { componentKinds: ["embed.tex", "embed.norn"], source: "x^2" }), {
    acceptedComponentKinds: ["embed.tex"], rejectedComponentKinds: ["embed.norn"], validSource: true, requiredCapabilities: ["embed.tex"],
  });
  assert.equal(request("validate", { componentKinds: ["embed.tex"], source: "\\notacommand{" }).validSource, false);
});

test("caches render results without mutating provider state", () => {
  const result = request("apply", { documentId: "basic", source: "E = mc^2" });
  assert.equal(result.cacheStatus, "stored");
  assert.equal(result.providerStateMutated, false);
});

