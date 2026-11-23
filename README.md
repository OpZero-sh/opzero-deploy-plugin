# OpZero Deploy

Publish a site from a conversation and open the result while the change is still fresh. When a release goes wrong, look through its deployment history, identify the last working version, and restore it. OpZero also hosts MCP servers and returns the endpoint your client needs.

[Connect with Claude, ChatGPT, Muse Code, or Grok](PROVIDERS.md)

> “Show me the last three deployments of my documentation site. Which version is live?”

> “Publish this event page as a new project and show me the preview.”

> “Host this MCP server and give me the connector URL for Claude.”

## What is in the plugin

### Skills

| Skill | What it does |
|---|---|
| `publish-and-preview` | Deploys one HTML page, a set of files, a React component or a Markdown article, checks the deployment status and shows the live page. Updates an existing site by merging only the files that changed. |
| `restore-release` | Reads deployment history, compares releases file by file, and rolls a project back to a release you choose. History is kept. |
| `host-mcp-server` | Deploys an MCP server or agent from source, checks its health and cross client conformance, and returns the details each client needs to add it. |
| `review-projects` | Lists and filters projects, finds stale or duplicate ones, and reports plan usage and sign in state. Read only. |

Each skill folder may hold a `references` folder with argument tables and field notes that Claude reads when it needs them.

### Agent

`release-investigator` compares deployments and reports which one introduced a change. It can only read: its tools are `deployment_inspect`, `project_inspect` and `workload_inspect`. It never deploys, rolls back or deletes.

### Hooks

None. The plugin has no hooks and runs no code on your machine. Deleting a deployment record is permanent, so the `restore-release` skill tells Claude to name the record and ask you to confirm before it makes that call.

## What the plugin connects to and sends

- **MCP server.** The plugin connects to one remote server, the scoped OpZero endpoint at `https://opzero.sh/mcp/directory`. You sign in to OpZero with OAuth using the account that owns the target project. No API key is stored in the plugin.
- **What is sent.** Project lookups send the project names or ids you ask about. Publishing sends the content you select, and OpZero serves it at a public URL under `opzero.sh`. Hosting an MCP server sends its source files. Check content for secrets before publishing: the skills tell Claude to do this and to keep credentials out of a deployment.
- **What is not sent.** The plugin has no telemetry and makes no other network calls of its own.

### Optional files for other clients

These files are not used by Claude. They exist so the same product can be used from other assistants.

- `integrations/grok-servers.json`, `integrations/muse-settings.json` and the files under `integrations/openai` are configuration for those clients. They contain the same server URL and no credentials.

The two scripts that read them are not in this repository. They are in the catalog repository, [OpZero-sh/plugins](https://github.com/OpZero-sh/plugins), and run only when you clone it and run them yourself.

- `tools/build_openai.py` builds a ZIP package for ChatGPT and Codex from the skills, the license, the product icon and the files under `integrations/openai` in a checkout of this repository. It reads local files and writes ZIP files to the folder you name. It makes no network calls.
- `tools/grok_example.py` is a sample for the xAI API. It reads `integrations/grok-servers.json`. With `--dry-run` it prints a request and sends nothing. Without it, the script reads `XAI_API_KEY` from your environment and sends one request to `https://api.x.ai/v1/responses`. If `OPZERO_DEPLOY_ACCESS_TOKEN` is set, that OpZero access token is included in the request so that xAI can call the OpZero server for you.

## Limits

- A deployment is public to anyone who has its URL.
- This plugin's tool list covers deploying, reading history, rolling back, hosting workloads and reading projects. Renaming, archiving or deleting a project and setting a custom domain are done in the OpZero dashboard.

[OpZero documentation](https://opzero.sh/docs) · [Privacy](https://opzero.sh/privacy) · [Support](https://opzero.sh/support)

## Install in Claude Code

```text
/plugin marketplace add OpZero-sh/plugins
/plugin install opzero-deploy@opzero
```

After installing, open `/mcp` and sign in to **opzero-deploy**.
