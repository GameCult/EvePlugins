export const pluginId = "fields.surface";
export const operations = ["describe", "validate", "project", "measure"];
export const componentKinds = ["field.surface2d", "gravity.surface"];

export function dispatch(request) {
  if (request?.schema !== "gamecult.eve.plugin_abi.request.v1") throw new Error("Unsupported request schema.");
  if (request.pluginId !== pluginId) throw new Error(`Expected plugin ${pluginId}.`);
  if (!operations.includes(request.operation)) throw new Error(`Unsupported operation ${request.operation}.`);
  switch (request.operation) {
    case "describe": return describe();
    case "validate": return validate(request.input || {});
    case "project": return project(request.input || {});
    case "measure": return measure(request.input || {});
  }
}

export function describe() {
  return {
    pluginId,
    componentKinds,
    commands: [],
    capabilities: ["field.surface2d", "gravity.surface", "field.scalar", "field.vector", "field.objects"],
    operations,
    stateAuthority: "provider-owns-field-documents",
  };
}

export function validate(input) {
  const requested = Array.isArray(input.componentKinds) ? input.componentKinds : [];
  const document = input.document || {};
  const diagnostics = [];
  if (document.schema && document.schema !== "gamecult.fields.surface2d.v1") diagnostics.push(`Unsupported field schema ${document.schema}.`);
  if (document.bounds && !validBounds(document.bounds)) diagnostics.push("Field bounds must have increasing finite axes.");
  return {
    acceptedComponentKinds: requested.filter(kind => componentKinds.includes(kind)),
    rejectedComponentKinds: requested.filter(kind => !componentKinds.includes(kind)),
    validDocument: diagnostics.length === 0,
    diagnostics,
    requiredCapabilities: ["field.surface2d"],
  };
}

export function project(input) {
  const document = requiredObject(input.document, "document");
  if (document.schema !== "gamecult.fields.surface2d.v1") throw new Error("document must use gamecult.fields.surface2d.v1.");
  if (!validBounds(document.bounds)) throw new Error("document bounds are invalid.");
  const channels = Array.isArray(document.channels) ? document.channels.map(normalizeChannel) : [];
  return {
    schema: "gamecult.fields.projection.v1",
    projectionKind: "semantic-field-surface",
    ownedComponentKinds: componentKinds,
    fieldId: requiredString(document.fieldId, "fieldId"),
    bounds: { ...document.bounds },
    channels,
    objects: document.objects ? normalizeDocumentRef(document.objects, "objects") : null,
    nativeProjectionAuthority: "runtime-adapter",
    providerStateMutated: false,
  };
}

export function measure(input) {
  const projection = project(input);
  return {
    measurementKind: "field-domain-metrics",
    measurementOutputs: ["width", "height", "channelCount"],
    width: projection.bounds.maxX - projection.bounds.minX,
    height: projection.bounds.maxY - projection.bounds.minY,
    channelCount: projection.channels.length,
    preservesProviderAuthority: true,
  };
}

function normalizeChannel(channel, index) {
  const value = requiredObject(channel, `channels[${index}]`);
  const kind = requiredString(value.kind, `channels[${index}].kind`);
  if (!["scalar", "vector", "color", "mask"].includes(kind)) throw new Error(`Unsupported field channel kind ${kind}.`);
  return {
    channelId: requiredString(value.channelId, `channels[${index}].channelId`),
    kind,
    ...normalizeDocumentRef(value, `channels[${index}]`),
  };
}

function normalizeDocumentRef(value, field) {
  return {
    documentId: requiredString(value.documentId, `${field}.documentId`),
    schemaId: requiredString(value.schemaId, `${field}.schemaId`),
  };
}

function validBounds(value) {
  return value && [value.minX, value.minY, value.maxX, value.maxY].every(Number.isFinite) && value.minX < value.maxX && value.minY < value.maxY;
}

function requiredObject(value, field) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${field} is required.`);
  return value;
}

function requiredString(value, field) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${field} is required.`);
  return value;
}
