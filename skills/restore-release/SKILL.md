---
name: restore-release
description: Trace a regression through OpZero deployment history and roll a project back to an earlier release. Use when someone says "roll back", "restore the last working version", "undo the last deploy", "which deploy broke this", "what changed between releases", or asks which version of a site is live.
---

# Find the release that broke something and restore an earlier one

Every `deploy` on OpZero (MCP server `opzero-deploy`) leaves a deployment record. This skill reads those records to find where a change came in, then republishes an earlier one when the user authorizes it. Field meanings are in [references/deployment-records.md](references/deployment-records.md).

## When to use

- A site or hosted server on OpZero changed for the worse and the user wants to know which release did it.
- The user wants an earlier release live again.
- The user asks which deployment is live now.

Reading history is safe at any time. A rollback changes the live site, so it needs the user's clear go ahead for one specific deployment. For a long comparison across many releases, delegate the read only part to the `release-investigator` agent and keep the decision here.

## Steps

1. Identify the project. Call `project_inspect` with `action: "get"` and `project`. If the name is ambiguous the call is refused with candidates: show them and ask.
2. List its releases. Call `deployment_inspect` with `action: "list"`, `project` and a `limit` that covers the period in question (default 10, up to 100). The newest record is first. The newest `ready` record is normally what is live.
3. Narrow it down. Use `createdAt`, `status` and, for a hosted server, `commit` to find the last release before the symptom appeared.
4. Compare content when timestamps are not enough. Call `deployment_inspect` with `action: "get"` on the current deployment and on the candidate. Each returns the full file contents. Compare only the files tied to the symptom.
5. State what a rollback would change: the target deployment id, when it was made, and which files differ from what is live now.
6. If more than one earlier release fits, ask which one. Do not pick for the user.
7. After the user authorizes that rollback, call `deployment` with `action: "rollback"` and `deployment` set to the verified id. This publishes that release again as a new deployment. No history is removed.
8. Confirm. Call `deployment_inspect` with `action: "status"` on the new deployment until it reads `ready`, then `preview` the project and check that the restored content is what the user expected.

## What to tell the user

- The deployment that was live before, with id and time.
- The source release you restored, with id and time.
- The new deployment id, its status and the live URL.
- Anything the evidence could not settle, for example two releases with identical files.

## History records

A rollback never needs a record to be deleted. `deployment` with `action: "delete_record"` permanently removes one record from history and leaves the live site as it is. Use it only when the user asks to remove a specific record, and name the record id and time back to them first. In Claude Code this plugin's hook asks for confirmation before that call runs.

## Problems

- No earlier `ready` record: there is nothing to roll back to. Say so and offer to publish a fix with the `publish-and-preview` skill.
- The new deployment ends in `error`: report `statusDetail`. Do not guess which release is being served. Read `project_inspect` with `action: "get"` and describe what it shows.
- A hosted MCP server record that carries a commit is rebuilt from the repository at that commit. Records without a commit are republished from stored files. Tell the user which applies.
- Auth error: `system_status` with `action: "auth"`.

## Examples

"Show me the last three deployments of my documentation site. Which version is live?"
`project_inspect` get, then `deployment_inspect` list with `limit: 3`. Reply with a three row table (id, time, status) and name the live one. Change nothing.

"The pricing page broke after this morning's deploy. Put yesterday's version back."
List deployments, find the last record from yesterday and the ones from this morning. `get` both sides and confirm the pricing file differs. Tell the user which id you would restore and wait for a yes. Then `deployment` rollback, check status, preview, report.

"Clean up my deploy history."
Ask which records. Explain that removing records is permanent and does not change the live site. Remove only the records the user names.

## Limits

- History shows what OpZero stored for each deployment. It does not show why a change was made.
- A rollback republishes files, and for a hosted server rebuilds its source at a commit. Nothing in the tool's description says it restores data the app stored at run time or settings changed outside a deployment, so do not promise that.
