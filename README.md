# OpZero Deploy

Publish a site from a conversation and open the result while the change is still fresh. When a release goes wrong, look through its deployment history, identify the last working version, and restore it. OpZero also hosts MCP servers and returns the endpoint your client needs.

[Connect with Claude, ChatGPT, Muse Code, or Grok](PROVIDERS.md)

> “Show me the last three deployments of my documentation site. Which version is live?”

> “Publish this event page as a new project and show me the preview.”

### What you can do

- Deploy a page, a React component, or a set of files and preview the resulting site.
- Compare releases before a rollback. The release investigator reads history and status without making changes.
- Publish a hosted workload and retrieve its connector URL.

### Connect

Sign in to OpZero with the account that owns the target project. The plugin uses the scoped OpZero endpoint at `https://opzero.sh/mcp/directory`. Project lookups send the requested project identifiers to OpZero. Publishing also sends the content you select and can put it on a public URL. Preview the source for secrets before publishing.

[OpZero documentation](https://opzero.sh/docs) · [Privacy](https://opzero.sh/privacy) · [Support](https://opzero.sh/support)

## Install in Claude Code

```text
/plugin marketplace add OpZero-sh/plugins
/plugin install opzero-deploy@opzero
```
