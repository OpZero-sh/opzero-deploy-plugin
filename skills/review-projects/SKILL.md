---
name: review-projects
description: List and inspect OpZero projects, find stale or duplicate ones, and check the account's plan usage or sign in state. Use when someone says "what do I have on OpZero", "list my projects", "find my old test sites", "how much of my plan have I used", "which projects are stale", or when an OpZero tool fails with an auth error.
---

# Review projects and account status

Read only checks on an OpZero account (MCP server `opzero-deploy`). Nothing in this skill changes a project.

## When to use

- The user wants an inventory of their projects, or details of one.
- The user wants to know which projects are old, duplicated or left over from tests.
- The user asks about plan limits or usage.
- A tool call failed with an auth error and you need to know why.

## Tools

| Need | Call |
|---|---|
| One project in detail | `project_inspect` with `action: "get"`, `project` (id or name) |
| A filtered list | `project_inspect` with `action: "list"` |
| Candidates for cleanup | `project_inspect` with `action: "cleanup"` |
| Plan, usage and caps | `system_status` with `action: "status"` |
| Why a credential fails | `system_status` with `action: "auth"` |

## Listing projects

`project_inspect` with `action: "list"` pages through projects, 50 per page by default (`limit` up to 100). The response includes `counts` per project type and `pagination` with `nextCursor`. Pass that value as `cursor` to get the next page.

Filters:

| Argument | Values |
|---|---|
| `project_type` | `static`, `mcp_server`, `agent` |
| `status` | `active` (default), `archived`, `deleted`, `all` |
| `target` | `cloudflare`, `netlify`, `vercel` |
| `name_contains` | substring of the name |
| `stale_days` | only projects not deployed for this many days |
| `sort_by` | `last_deploy` (default), `created`, `name`, `type` |

Each row has `id`, `name`, `url`, `subdomain`, `customDomain`, `target`, `status`, `projectType`, `createdAt`, `lastDeployAt` and `deploymentCount`.

Do not page through everything by default. Start with the filter that answers the question, report `counts`, and offer to go further.

## Finding stale and duplicate projects

1. Call `project_inspect` with `action: "cleanup"`. It reports duplicates, stale projects and projects with generated names.
2. For a custom cutoff, use `action: "list"` with `stale_days`.
3. Present the candidates as a table with name, type, last deploy date and URL.
4. Stop there. This plugin's tool list has no archive or delete tool. Tell the user they can remove projects in the OpZero dashboard, and make clear that the list is a suggestion: a project that has not been deployed lately may still be in use.

## Account status

`system_status` with `action: "status"` returns the plan, usage, active projects, recent deployments and how much of each cap is used (hosted MCP servers, agents and others), plus service health. Quote the numbers it returns. Do not state plan limits from memory.

## Auth problems

When any OpZero tool returns an auth error, call `system_status` with `action: "auth"` before retrying. It reports the token type, identity, roles, scopes, how long the session has left and the state of the OAuth discovery endpoints. Tell the user what it found in one or two sentences. If the session has expired, ask them to sign in to the connector again. Never print a token.

## Examples

"What sites do I have on OpZero?"
`project_inspect` list with `project_type: "static"`. Reply with a short table and the total from `counts`.

"Find test projects I can get rid of."
`project_inspect` cleanup. Show the candidates grouped as duplicates, stale and generated names. Say that removal happens in the dashboard.

"Am I close to my plan limit?"
`system_status` status. Report usage against each cap that the response lists.

## Limits

- Blog posts are not projects and do not appear here.
- "Stale" means no recent deployment. It says nothing about traffic.
