# Deployment records

What `deployment_inspect` returns on the `opzero-deploy` server, and what the `deployment` tool does with a record. Field names below were observed in a `list` response.

## Fields in a `list` row

| Field | Meaning |
|---|---|
| `id` | Deployment id (a UUID). This is the value `deployment_inspect` and `deployment` take as `deployment`. |
| `projectId`, `projectName`, `subdomain` | The project the record belongs to. |
| `projectType` | `static`, `mcp_server` or `agent`. |
| `status` | State of the deployment. A finished one reads `ready`. The tool description also names `pending` and `error`. |
| `url` | Where the deployment is served. A site looks like `https://<name>.opzero.sh`. A hosted MCP server looks like `https://<name>.mcp.opzero.sh/mcp`. |
| `filesCount` | Number of files in the deployment. |
| `createdAt`, `completedAt` | ISO timestamps in UTC. |
| `customDomain` | The custom domain, or null. |
| `commit`, `rootHash` | Present when the deployment was built from a source repository. Two records with the same `rootHash` have identical source trees. |
| `source` | Where the source came from: repository, commit, ref and the revision that is running. |

The response also carries `pagination` with `hasMore`. Raise `limit` (up to 100) to see further back.

## Actions of `deployment_inspect`

| `action` | Arguments | Use |
|---|---|---|
| `list` | optional `project`, optional `limit` | Recent deployments, newest first. Without `project` it spans all projects. |
| `get` | `deployment` | One deployment with its full file contents and source provenance. Use it to compare two releases. |
| `status` | `deployment`, or `project` | Status, statusDetail, url and sizes for one deployment, or the last 5 records of a project. A hosted agent deployment that is still pending is probed again by this call. |

## Actions of `deployment`

Both actions need `deployment`, the id of a record.

| `action` | Effect |
|---|---|
| `rollback` | Publishes the files of that record again as a new deployment of its project. An MCP server record that carries a commit is rebuilt from the repository at that commit. Other records use the stored files. History is kept. |
| `delete_record` | Permanently removes that record from history. The live site is not touched. This cannot be undone. |

## Reading history well

- Compare `createdAt` in one time zone. Records are in UTC, so convert before you match them to "this morning".
- Do not assume the newest record is live if its status is not `ready`.
- When two candidates have the same `rootHash` or identical files, say that the evidence cannot tell them apart.
