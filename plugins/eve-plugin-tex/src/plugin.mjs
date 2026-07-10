import { createHash } from "node:crypto";
import katex from "katex";

export const pluginId = "tex.math";
export const operations = ["describe", "validate", "project", "lower", "measure", "apply"];

const renderCache = new Map();

export function dispatch(request) {
  if (request?.schema !== "gamecult.eve.plugin_abi.request.v1") throw new Error("Unsupported request schema.");
  if (request.pluginId !== pluginId) throw new Error(`Expected plugin ${pluginId}.`);
  if (!operations.includes(request.operation)) throw new Error(`Unsupported operation ${request.operation}.`);

  switch (request.operation) {
    case "describe": return describe();
    case "validate": return validate(request.input || {});
    case "project": return project(request.input || {});
    case "lower": return lower(request.input || {});
    case "measure": return measure(request.input || {});
    case "apply": return apply(request.input || {});
  }
}

export function describe() {
  return {
    pluginId,
    componentKinds: ["embed.tex"],
    commands: [],
    capabilities: ["embed.tex", "tex.inline", "tex.block"],
    operations,
    semanticEngine: "katex",
    stateAuthority: "provider-owns-source-state",
  };
}

export function validate(input) {
  const requested = Array.isArray(input.componentKinds) ? input.componentKinds : [];
  let validSource = true;
  let diagnostic = null;
  if (typeof input.source === "string") {
    try {
      render(input);
    } catch (error) {
      validSource = false;
      diagnostic = error.message;
    }
  }
  return {
    acceptedComponentKinds: requested.filter((kind) => kind === "embed.tex"),
    rejectedComponentKinds: requested.filter((kind) => kind !== "embed.tex"),
    validSource,
    ...(diagnostic ? { diagnostic } : {}),
    requiredCapabilities: ["embed.tex"],
  };
}

export function project(input) {
  return {
    schema: "tex.math.render_request.v1",
    projectionKind: "render-request",
    ownedComponentKinds: ["embed.tex"],
    outputSchemas: ["tex.math.render_request.v1", "tex.math.render_result.v1"],
    documentId: requiredString(input.documentId, "documentId"),
    source: requiredString(input.source, "source"),
    displayMode: Boolean(input.displayMode),
    macros: normalizeMacros(input.macros),
  };
}

export function lower(input) {
  const rendered = render(input);
  return {
    schema: "tex.math.render_result.v1",
    loweringKind: "typeset-fragment",
    preservedComponentKinds: ["embed.tex"],
    requiredSchemas: ["tex.math.render_request.v1", "tex.math.render_result.v1"],
    fallbackKind: "source-text",
    documentId: requiredString(input.documentId, "documentId"),
    source: input.source,
    html: rendered.html,
    contentHash: rendered.contentHash,
    engine: "katex",
  };
}

export function measure(input) {
  render(input);
  return {
    measurementKind: "typeset-baseline-metrics",
    measurementOutputs: ["baseline", "advance", "inkBounds", "fallbackBounds"],
    measurementAuthority: "runtime-layout-required",
    preservesProviderAuthority: true,
  };
}

export function apply(input) {
  const rendered = render(input);
  renderCache.set(rendered.contentHash, rendered);
  return {
    stateEffects: ["cache-render-result", "emit-fallback-on-render-failure"],
    receiptSchema: "gamecult.eve.plugin_receipt.v1",
    contentHash: rendered.contentHash,
    cacheStatus: "stored",
    providerStateMutated: false,
  };
}

function render(input) {
  const source = requiredString(input.source, "source");
  const macros = normalizeMacros(input.macros);
  const contentHash = createHash("sha256").update(JSON.stringify({ source, macros, displayMode: Boolean(input.displayMode) })).digest("hex");
  const cached = renderCache.get(contentHash);
  if (cached) return cached;
  return {
    contentHash,
    html: katex.renderToString(source, { displayMode: Boolean(input.displayMode), macros, throwOnError: true, output: "htmlAndMathml" }),
  };
}

function normalizeMacros(value) {
  if (value == null) return {};
  if (typeof value !== "object" || Array.isArray(value)) throw new Error("macros must be an object.");
  return Object.fromEntries(Object.entries(value).map(([key, expansion]) => [key, requiredString(expansion, `macro ${key}`)]));
}

function requiredString(value, field) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${field} is required.`);
  return value;
}

