# Hosted workload options

Reference for `workload_deploy`, `workload_inspect`, `list_mcps` and `mcp_conformance` on the `opzero-deploy` server. Taken from the published input schemas and from a `list_mcps` response.

## `workload_deploy`

Required: `kind` and `files`.

| Argument | Applies to | Meaning |
|---|---|---|
| `kind` | both | `mcp_server` or `agent`. |
| `files` | both | Source files keyed by path, at most 50. A server needs `server.ts`, `index.ts` or `main.ts` (TypeScript) or `server.py` (Python). An agent needs `agent.ts`, `index.ts` or `main.ts` that exports Agent classes. Files ending in .html, .css, .svg, .txt and .md can be imported as strings. |
| `name` | both | Project name. Reusing a name redeploys in place unless `new_project` is true. |
| `project` | both | Existing project, by id or name, to redeploy into. |
| `new_project` | both | `true` creates a fresh project even when the name exists. |
| `auth_mode` | both | `oauth` (default for a server), `token` (default for an agent) or `public`. Omit on a redeploy to keep the current mode. |
| `multi_tenant` | server, oauth | `true` admits any signed in OpZero user, each with their own user, storage and connections. |
| `allowed_callers` | both, oauth | Up to 50 accounts (emails or account subjects) admitted alongside the owner. An empty list clears it. |
| `secrets` | both | Encrypted environment secrets as key and value. Keys that start with `OPZERO_` are reserved. Prefer the console's Secrets form for real credentials so the value stays out of the conversation. |
| `runtime` | server | `cloudflare` (default) or `vercel`. Vercel needs an entitlement on the account. |
| `schedule` | server | Cron in UTC, five fields or `@hourly`, `@daily`, `@weekly`, `@monthly`. The shortest interval is 5 minutes. `""` removes it. |
| `durable` | server, Cloudflare | Opts into a per server SQLite store. `true`, or an object with `schema`, `methods` and `alarm`. |
| `blobs` | server, Cloudflare | Opts into blob storage. The source must declare it too. |
| `allow_public_shared_storage` | server, public | Allows anonymous callers to write shared storage. |
| `classes` | agent | Exported Agent class names to host. Defaults to every class in the source that extends Agent. Dropping a class on a redeploy deletes its stored instances. |
| `idle_archive_days` | agent | Days without activity before the agent is archived (default 14, 0 turns it off). |
| `reviewer_account` | server, oauth | Creates a sign in scoped to this one server for directory review. Leave it out unless the user asks for it. |

A server is built against `@opzero/mcp-runtime` (TypeScript) or `opzero_mcp` (Python). Read `docs` with `skill: "mcp-servers"` for the current API before writing source.

## `workload_inspect`

| `action` | Needs | Returns |
|---|---|---|
| `list` | `kind` | Your servers or agents with endpoint and auth mode. Paged with `cursor`. |
| `get` | `kind`, `project` | One workload. For a server: project, server id, runtime, endpoint and auth mode. For an agent: classes, secret key names, recent runs and how to connect. |
| `logs` | `project` (server) | Deployment health, records and widget boot reports. `limit` up to 50, `since` as an ISO timestamp. |
| `secrets` | `project` (server) | Secret key names. Values are never returned. |
| `widgets` | `project` (server) | The server's MCP Apps views. |
| `model_grants`, `model_usage` | optional filters | The model grant ledger for workloads that call models. |

## `list_mcps`

Arguments: `name_contains`, `limit` (default 50, up to 100) and `client` (`claude`, `claude_desktop`, `claude_code`, `chatgpt`, `cursor`, `vscode`, `other`).

Each server row carries `name`, `endpoint`, `authMode`, `multiTenant`, `lastDeployAt` and a `connect` block:

| `connect` field | Use |
|---|---|
| `url` | The endpoint to paste into a client. |
| `command` | A ready `claude mcp add` command for Claude Code. |
| `cursor`, `vscode` | Config entries for those editors. |
| `cursorInstall`, `vscodeInstall` | One click install links. |
| `requiresToken`, `tokenPlaceholder` | Set for a `token` server. The placeholder stands in for the token, which this tool never returns. |

The response also lists how each client adds a server. For Claude and ChatGPT it gives the page where a custom connector is added.

## `mcp_conformance`

Give exactly one target: `project` (a hosted server), `endpoint` (any https MCP URL, with `auth_mode`) or `gateway`. `clients` limits the run to named client profiles. The run covers protocol version handling, notification handling, catalogue shape, the sign in challenge, discovery, CORS, MCP Apps views, and name and count limits. OAuth checks are skipped for `public` and `token` servers.
