---
name: publish-and-preview
description: Publish a web page, a React component, a Markdown article or a set of site files to OpZero and show the live result. Use when someone says "deploy this", "publish this page", "put this online", "ship it and give me the link", "update my site", "redeploy", or asks to preview a site that is already on OpZero.
---

# Publish a site and preview it

OpZero (MCP server `opzero-deploy`) turns content into a live site at `https://<project>.opzero.sh`. This skill covers static sites and single page apps. For a hosted MCP server or agent use the `host-mcp-server` skill. For going back to an earlier release use `restore-release`.

## When to use

- The user has content (HTML, files, a React component, Markdown) and wants it live.
- The user wants to change or redeploy a site that already exists on OpZero.
- The user wants to see a deployed OpZero page in the conversation.

Do not publish when the user asked only for a draft, a review or an estimate. Hand over that deliverable and stop. Publishing puts content on a public URL, so the request has to authorize it.

## Before you publish

1. Read only the content the user selected. Check it for credentials, tokens, private keys and customer records. If you find any, name the file and line, keep it out of the deployment, and ask how to proceed.
2. Decide whether this is a new project or an existing one. If the user names a site, call `project_inspect` with `action: "get"` and `project` set to the name. If you are unsure which project they mean, call `project_inspect` with `action: "list"` and `name_contains`, then ask the user to pick. An ambiguous name is refused with the candidates.
3. Pick the format. The full argument list for each one is in [references/deploy-formats.md](references/deploy-formats.md).

| Material | `format` | Content argument |
|---|---|---|
| One HTML page | `html` | `html` |
| Several files (HTML, CSS, JS, assets as text) | `files` | `files`, a map of path to contents |
| A React component | `react` | `code` |
| An article written in Markdown | `markdown` | `markdown` |
| Page body HTML to wrap in the OpZero theme | `themed` | `content` |

## Steps

1. Call `deploy`.
   - New project: pass `name` (it becomes the subdomain) and the content. A project with that name is reused if it exists. Pass `new_project: true` only when the user wants a separate site with a name that is taken.
   - Existing project: pass `project` (id or name) and the content.
   - With `format: "files"` on an existing project the map is merged into the current deployment. Files you do not send stay as they are. A path mapped to `""` is deleted. Pass `replace: true` only when the user asked to replace the whole site.
   - To publish stored files again without sending content, pass `project` with `from: "latest"` or a deployment id.
2. Keep the deployment id and URL from the result.
3. Call `deployment_inspect` with `action: "status"` and `deployment` set to that id. If the status is not yet `ready`, check again before you call it live. A status of `error` comes with `statusDetail`: report it and do not claim success.
4. Call `preview` with `url` or `project` (exactly one). Hosts that support MCP Apps show the page inline. Other hosts get the URL as text.
5. Report the result.

## What to tell the user

- The live URL and the project name.
- The deployment id and its status as observed.
- What changed: files added, replaced or deleted, or "new project".
- Anything you held back and why.

## Problems

- Auth error from any tool: call `system_status` with `action: "auth"` and report what it says about the credential. The user may need to sign in again.
- Plan cap reached: call `system_status` with `action: "status"` to see usage against the caps, and tell the user which cap applies.
- Project not found: list projects with `name_contains` and ask. Do not create a new project under a guessed name when the user meant an existing one.
- Unsure of an argument or an error code: call `docs` with `topic: "deploy"`, or `docs` with `uri: "doc://opzero/errors.md"`.
- Need a starting point: `docs` with `template` and `kind: "site"` returns a scaffold ready to deploy.

## Examples

"Publish this event page as a new project called spring-gala and show me the preview."
Check the HTML for secrets. `deploy` with `format: "html"`, `name: "spring-gala"`, `html`. Check status, then `preview` with `project: "spring-gala"`. Reply with the URL, deployment id and status.

"Change the hero heading on my docs site to Welcome."
`project_inspect` get on the docs project, then `deployment_inspect` with `action: "get"` on its latest deployment to read the current file. `deploy` with `project`, `format: "files"` and a `files` map holding only the changed file. Confirm status and preview.

"What would it take to put this dashboard online?"
This asks for an estimate. Describe the format you would use and what the user needs to supply. Do not call `deploy`.

## Limits

- Content goes to OpZero and, once deployed, is public to anyone with the URL.
- `preview` only shows pages on opzero.sh. Apps backed by a server and some React builds do not embed and come back with a link to open instead.
- A custom domain, project rename, archive and delete are not part of this plugin's tool list. Point the user to the OpZero dashboard for those.
