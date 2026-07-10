#!/usr/bin/env node

import readline from "node:readline";
import { dispatch, pluginId } from "./plugin.mjs";

readline.createInterface({ input: process.stdin }).on("line", (line) => {
  if (!line.trim()) return;
  let request;
  try {
    request = JSON.parse(line.replace(/^\uFEFF/, ""));
    respond(request, dispatch(request));
  } catch (error) {
    respond(request, {}, "rejected", error.message);
  }
});

function respond(request, output, status = "accepted", message) {
  process.stdout.write(`${JSON.stringify({
    schema: "gamecult.eve.plugin_abi.response.v1",
    pluginId,
    operation: request?.operation || "unknown",
    requestId: request?.requestId || "unknown",
    status,
    output,
    ...(message ? { diagnostics: [{ message }] } : {}),
  })}\n`);
}

