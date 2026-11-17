import { recordingHtml } from "./generated-ui.mjs";
import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const RECORDING_URI = "ui://live-qa-validator-incognito/recording-choice.html";
const credentials = new Map();
const server = new McpServer({ name: "live-qa-validator-incognito", version: "0.2.0" });

server.registerResource("live-qa-incognito-recording-choice", RECORDING_URI, { mimeType: "text/html;profile=mcp-app" }, async () => ({ contents: [{ uri: RECORDING_URI, mimeType: "text/html;profile=mcp-app", text: recordingHtml, _meta: { ui: { prefersBorder: false } } }] }));

server.registerTool("open_live_qa_incognito_recording_choice", { title: "Choose Live QA Incognito recording", description: "Open the recording choice after the target website is visible in a new Chrome Incognito window.", inputSchema: {}, _meta: { ui: { resourceUri: RECORDING_URI } } }, async () => ({ structuredContent: { ready: true, panelRendered: "unconfirmed" }, content: [{ type: "text", text: "Choose Start recording or Skip recording." }] }));

server.registerTool("stage_live_qa_incognito_credentials", { title: "Stage Live QA Incognito credentials", description: "Stage session-only login credentials in process memory immediately after collecting them in chat (never write them to the intake artifact or its database). Returns a short-lived handle; retrieve it only immediately before authenticating with retrieve_live_qa_incognito_credentials. The handle expires after 30 minutes or on first retrieval, whichever comes first.", inputSchema: { username: z.string().optional(), password: z.string().optional() } }, async (input) => { const username=input.username||"", password=input.password||""; if(!username&&!password){return {structuredContent:{credentialHandle:""}, content:[{type:"text",text:"No credentials supplied; nothing staged."}]};} const credentialHandle=randomUUID(); credentials.set(credentialHandle,{username,password,expires:Date.now()+30*60*1000}); return { structuredContent: { credentialHandle }, content: [{ type: "text", text: "Credentials staged in memory only. Retrieve only immediately before login and never echo them." }] }; });

server.registerTool("retrieve_live_qa_incognito_credentials", { title: "Retrieve staged QA Incognito credentials", _meta: { ui: { visibility: ["model"] } }, description: "Retrieve session-only login credentials immediately before authenticating. Deletes them after one retrieval.", inputSchema: { credentialHandle: z.string().uuid() } }, async ({credentialHandle}) => { const entry=credentials.get(credentialHandle); credentials.delete(credentialHandle); if(!entry||entry.expires<Date.now()) return {isError:true,content:[{type:"text",text:"Credential handle is missing or expired."}]}; return { structuredContent:{username:entry.username,password:entry.password}, content:[{type:"text",text:"Session-only credentials retrieved. Do not echo or persist them."}]}; });

await server.connect(new StdioServerTransport());
