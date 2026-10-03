import assert from "node:assert/strict";
import test from "node:test";
import { webcrypto } from "node:crypto";

if (!globalThis.crypto) globalThis.crypto = webcrypto;

import { onRequest } from "../functions/[[path]].js";
import { createSessionToken } from "../functions/_lib/auth.js";
import { normalizeConfig } from "../functions/_lib/store.js";
import { LANGUAGES, STRINGS } from "../functions/_lib/i18n.js";

class MemoryKv {
  constructor() { this.values = new Map(); }
  async get(key, options) {
    const value = this.values.get(key);
    if (value == null) return null;
    return options && options.type === "json" ? JSON.parse(value) : value;
  }
  async put(key, value) { this.values.set(key, value); }
  async delete(key) { this.values.delete(key); }
  async list() { return { keys: [...this.values.keys()].map((name) => ({ name })) }; }
  async getWithMetadata(key, options) { return { value: await this.get(key, options), metadata: null }; }
}

function baseConfig() {
  return normalizeConfig({
    mode: "choice",
    access_pin: "1234",
    emergency_contact: "+390000000000",
    instructions: { it: "Segui le indicazioni." },
    arrival_guide: {
      vehicle_gate: { image: "data:image/jpeg;base64,AP==", note: { it: "Ingresso per le auto." } },
      parking: { image: "data:image/jpeg;base64,AA==", note: { it: "Posto sulla destra." } },
      outer_gate: { image: "data:image/jpeg;base64,AQ==", note: { it: "Accanto al cancello." } },
      inner_gate: { image: "data:image/jpeg;base64,Ag==", note: { it: "In fondo al vialetto." } },
      key_box: { image: "data:image/jpeg;base64,Aw==", note: { it: "Abbassa la levetta." } },
    },
    shelly: { server: "shelly-281-eu", auth_key: "secret" },
    doors: [{ id: "gate", name: { it: "Cancello" }, device_id: "device-1" }],
  });
}

async function environment() {
  const kv = new MemoryKv();
  await kv.put("config", JSON.stringify(baseConfig()));
  return {
    CONFIG_KV: kv,
    SETUP_PASSWORD: "admin-secret",
    ASSETS: { fetch: () => new Response("asset") },
    AI: {
      async run(_model, input) {
        const prompt = input.messages[1].content;
        const marker = "Italian source JSON:\n";
        return { response: JSON.parse(prompt.slice(prompt.indexOf(marker) + marker.length)) };
      },
    },
  };
}

function context(env, url, init = {}) {
  return { env, request: new Request(url, init) };
}

test("all six languages expose the same interface keys", () => {
  const expected = Object.keys(STRINGS.it).sort();
  for (const language of LANGUAGES) assert.deepEqual(Object.keys(STRINGS[language]).sort(), expected);
});

test("guide images accept photos and reject active image formats", () => {
  const valid = normalizeConfig({ arrival_guide: { parking: { image: "data:image/webp;base64,AA==" } } });
  assert.equal(valid.arrival_guide.parking.image, "data:image/webp;base64,AA==");
  const unsafe = normalizeConfig({ arrival_guide: { parking: { image: "data:image/svg+xml;base64,PHN2Zz4=" } } });
  assert.equal(unsafe.arrival_guide.parking.image, "");
});

test("the locked page never embeds guide photos or the shared PIN", async () => {
  const env = await environment();
  const response = await onRequest(context(env, "https://example.test/"));
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /function accessPinEntry/);
  assert.match(html, /Visualizza la guida/);
  assert.match(html, /Vai ai comandi di apertura/);
  assert.doesNotMatch(html, /data:image\/jpeg;base64,AA==/);
  assert.doesNotMatch(html, /key_box_pin\":\"1234/);
});

test("unlock returns the five guide steps in order and the same PIN for the lockbox", async () => {
  const env = await environment();
  const response = await onRequest(context(env, "https://example.test/", {
    method: "POST",
    headers: { "Content-Type": "application/json", "CF-Connecting-IP": "198.51.100.10" },
    body: JSON.stringify({ action: "unlock", pin: "1234", lang: "it" }),
  }));
  const body = await response.json();
  assert.equal(body.success, true);
  assert.equal(body.content.arrival_guide.length, 5);
  assert.equal(body.content.arrival_guide[0].id, "vehicle_gate");
  assert.equal(body.content.key_box_pin, "1234");
  assert.match(response.headers.get("Set-Cookie"), /^sc_guest=/);
});

test("five wrong attempts activate the temporary lock", async () => {
  const env = await environment();
  for (let index = 0; index < 5; index++) {
    const response = await onRequest(context(env, "https://example.test/", {
      method: "POST",
      headers: { "Content-Type": "application/json", "CF-Connecting-IP": "198.51.100.20" },
      body: JSON.stringify({ action: "unlock", pin: "9999", lang: "it" }),
    }));
    assert.equal(response.status, 200);
  }
  const blocked = await onRequest(context(env, "https://example.test/", {
    method: "POST",
    headers: { "Content-Type": "application/json", "CF-Connecting-IP": "198.51.100.20" },
    body: JSON.stringify({ action: "unlock", pin: "9999", lang: "it" }),
  }));
  assert.equal(blocked.status, 429);
  assert.match((await blocked.json()).msg, /Troppi tentativi/);
});

test("the regular setup save cannot silently change the guest PIN", async () => {
  const env = await environment();
  const token = await createSessionToken(env.SETUP_PASSWORD);
  const changed = baseConfig();
  changed.access_pin = "999999";
  const response = await onRequest(context(env, "https://example.test/setup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `sc_setup=${encodeURIComponent(token)}`,
    },
    body: JSON.stringify({ action: "save", config: changed }),
  }));
  assert.equal((await response.json()).ok, true);
  assert.equal((await env.CONFIG_KV.get("config", { type: "json" })).access_pin, "1234");
});

test("the guided PIN action accepts only 4 to 6 digits", async () => {
  const env = await environment();
  const token = await createSessionToken(env.SETUP_PASSWORD);
  const headers = { "Content-Type": "application/json", Cookie: `sc_setup=${encodeURIComponent(token)}` };
  const invalid = await onRequest(context(env, "https://example.test/setup/codice", {
    method: "POST", headers, body: JSON.stringify({ action: "save-access-pin", access_pin: "123" }),
  }));
  assert.equal(invalid.status, 400);
  const valid = await onRequest(context(env, "https://example.test/setup/codice", {
    method: "POST", headers, body: JSON.stringify({ action: "save-access-pin", access_pin: "654321" }),
  }));
  assert.equal((await valid.json()).ok, true);
  assert.equal((await env.CONFIG_KV.get("config", { type: "json" })).access_pin, "654321");
});
