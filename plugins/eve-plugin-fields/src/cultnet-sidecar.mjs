#!/usr/bin/env node

import { Buffer } from "node:buffer";
import { decode, encode } from "@msgpack/msgpack";
import { startCultNetOperationServer } from "cultnet-ts";
import { dispatch, pluginId } from "./plugin.mjs";

const host = process.env.EVE_PLUGIN_HOST || "127.0.0.1";
const port = Number(process.env.EVE_PLUGIN_PORT || 0);
const runtimeId = "eve-plugin-fields";
const server = await startCultNetOperationServer({
  runtimeId,
  host,
  port,
  handler: request => {
    if (request.serviceId !== pluginId) throw new Error(`Expected service ${pluginId}.`);
    if (request.payloadSchema !== "gamecult.eve.plugin_abi.request.v1") throw new Error("Unsupported plugin payload schema.");
    const abiRequest = decode(Buffer.from(request.payload, "base64"));
    let abiResponse;
    try {
      abiResponse = {
        schema: "gamecult.eve.plugin_abi.response.v1",
        pluginId,
        operation: abiRequest.operation,
        requestId: abiRequest.requestId,
        status: "accepted",
        output: dispatch(abiRequest),
      };
    } catch (error) {
      abiResponse = {
        schema: "gamecult.eve.plugin_abi.response.v1",
        pluginId,
        operation: abiRequest?.operation || request.operation,
        requestId: abiRequest?.requestId || request.messageId,
        status: "rejected",
        output: {},
        diagnostics: [{ message: error instanceof Error ? error.message : String(error) }],
      };
    }
    return {
      schemaVersion: "cultnet.operation_response.v0",
      messageId: request.messageId,
      serviceId: pluginId,
      operation: request.operation,
      status: abiResponse.status,
      payloadSchema: abiResponse.schema,
      payloadEncoding: "messagepack-base64",
      payload: Buffer.from(encode(abiResponse)).toString("base64"),
      diagnostics: (abiResponse.diagnostics || []).map(item => item.message),
      sourceRuntimeId: runtimeId,
    };
  },
});

process.stdout.write(`${JSON.stringify({ schema: "gamecult.eve.plugin_endpoint.v1", pluginId, endpoint: server.endpoint })}\n`);
const stop = async () => {
  await server.close();
  process.exit(0);
};
process.once("SIGINT", stop);
process.once("SIGTERM", stop);
await new Promise(() => {});
