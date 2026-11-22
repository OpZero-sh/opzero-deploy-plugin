---
name: host-mcp-server
description: Deploy an MCP server or an agent to OpZero from source, confirm it is healthy, and hand back the endpoint a client needs. Use when someone says "host this MCP server", "deploy my MCP", "give me a connector URL", "add my server to Claude", "why is my hosted server failing", "show my hosted MCP servers", or asks whether a server works with Claude, ChatGPT or Cursor.
---

# Host an MCP server on OpZero

OpZero (MCP server `opzero-deploy`) builds an MCP server or an agent from source files and serves it at `https://<project>.mcp.opzero.sh/mcp`. This skill covers deploying one, checking it, and giving the user what their client needs to connect. Options are listed in [references/workload-options.md](references/workload-options.md).

## When to use

- The user has server source, or wants one written, and asks for it to be hosted.
- The user wants the endpoint or the "add to client" details of a server they already host.
- A hosted server is unhealthy and the user wants to know why.
- The user asks whether an MCP endpoint works across clients.

Use `publish-and-preview` for a website. Do not deploy a workload when the user asked only for code or advice.

## Before you deploy

1. Read the platform's own guide first. Call `docs` with `skill: "mcp-servers"` (or `skill: "agents"` for an agent). It describes the runtime the source must be written against, and it changes over time. Do not write server source from memory.
2. If there is no source yet, call `docs` with `template` and `kind: "mcp_server"` or `kind: "agent"` to get a scaffold.
3. Settle who may call the server. This decides `auth_mode`:
   - `oauth` (the default for a server): callers sign in with OpZero. By default only the owner is admitted. `multi_tenant: true` admits any signed in OpZero user, each with their own data. `allowed_callers` admits named accounts.
   - `token`: one shared bearer token. Claude and ChatGPT connectors cannot send a bearer token, so a server meant for them should use `oauth`.
   - `public`: no sign in at all. Choose it only when the user says the server is meant to be open to anyone.
   If the user has not said, ask. Do not choose `public` or `multi_tenant` on your own.
4. Check the source for hard coded credentials. A real secret must not travel through the conversation. Do not ask the user to paste one. Deploy without it, then call `workload_inspect` with `action: "get"` and have the user type the value into the Secrets form of the console it opens. In a host that does not show MCP Apps views, send the user to the OpZero dashboard to enter it.

## Steps

1. Call `workload_deploy` with `kind` (`mcp_server` or `agent`), `files` (a map of path to source, at most 50 files) and `name` for a new project or `project` for an existing one. Add `auth_mode` and the options you settled above. Reusing a name redeploys in place.
2. Read the result. It returns the endpoint. A server deploy is smoke checked for health and MCP negotiation, so read any failure it reports. In `token` mode the token is returned only when it is first minted: pass it to the user once and do not repeat it later.
3. Confirm with `workload_inspect`: `action: "get"`, `kind`, `project`. Check the endpoint and auth mode match what the user asked for.
4. If the deploy failed or the server misbehaves, call `workload_inspect` with `action: "logs"` and `project`. Fix the source and deploy again to the same `project`.
5. Call `mcp_conformance` with `project` to check the server against real clients. Report failures by client. A failure there is a finding to report, not something to hide.
6. Call `list_mcps` with `name_contains` to get the connection details per client: the Add custom connector link for Claude, a command for Claude Code, config entries for Cursor and VS Code. Hand the user the one for their client. `list_mcps` never returns a token.

## What to tell the user

- The endpoint URL and the auth mode.
- Whether the smoke check and the conformance run passed, with any failures named.
- How to add it to their client, taken from `list_mcps`.
- For `token` mode, the token once, with a note that it will not be shown again.
- Any secret that still has to be entered in the console.

## Problems

- Build error: the result carries the error. `docs` with `uri: "doc://opzero/errors.md"` explains the codes.
- `401` when the user tries to connect: for `oauth` they need to sign in with an admitted account. Confirm `multi_tenant` and `allowed_callers` with `workload_inspect` get.
- A connector in Claude or ChatGPT cannot be added: check the auth mode. A `token` server has to be redeployed with `auth_mode: "oauth"` first.
- Plan cap on hosted servers or agents: `system_status` with `action: "status"` shows usage against each cap.
- Auth error on the tools themselves: `system_status` with `action: "auth"`.

## Examples

"Host this server and give me the connector URL for Claude."
Read the `mcp-servers` guide. Ask who should be able to call it if that is unclear. `workload_deploy` with `kind: "mcp_server"`, `files`, `name`, `auth_mode: "oauth"`. Then `workload_inspect` get, `mcp_conformance`, `list_mcps`. Reply with the endpoint, results and the Claude link.

"Which MCP servers do I have on OpZero?"
`list_mcps`. Reply with name, endpoint and auth mode for each. Nothing is deployed.

"My weather server stopped answering."
`workload_inspect` with `action: "get"`, then `action: "logs"`. Report the most recent deployment status and the error lines. Offer a fix, and redeploy only when the user agrees.

## Limits

- Changing settings in place, rotating a token and managing secrets by tool are not part of this plugin's tool list. The console and the OpZero dashboard cover them.
- `mcp_conformance` checks protocol behavior. It does not test whether the server's own tools return correct answers.
- A server in `public` mode can be called by anyone who has the URL.
