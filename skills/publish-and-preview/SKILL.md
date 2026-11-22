---
name: publish-and-preview
description: Use when someone wants to publish a web page or a set of site files to OpZero, view the live result, or connect an OpZero-hosted MCP.
---

For a new site, use the requested name and choose the deploy format that fits the material. For an existing site, use project_inspect and deployment_inspect to identify the intended project and current release. A deployment of files merges by default. Preserve unrelated files unless the user asks to replace the whole site.

Read only the content the user selected. If it includes a credential or customer record, identify the affected file and keep it out of a public deployment. Before calling deploy, make sure the request actually authorizes publishing. A request for a draft or an estimate ends with that deliverable.

After deploy, check deployment_inspect with the returned identifier. If still building, check again before reporting it live. Use preview on the resulting site and return the URL and its observed status. For an explicitly requested hosted MCP, use workload_deploy with the intended source, then workload_inspect and list_mcps to confirm the endpoint and sign-in mode. Do not echo credentials.
