# Deploy formats and arguments

Reference for the `deploy` tool on the `opzero-deploy` server. Taken from the tool's published input schema.

## Choosing where the deployment goes

| Argument | Meaning |
|---|---|
| `name` | Name for a new project. It is also the subdomain, so the site is served at `https://<name>.opzero.sh`. A project with that name is reused when it exists. Generated when omitted. |
| `new_project` | `true` always creates a fresh project even when one named `name` exists. |
| `project` | An existing project, by id or by name. Omit it to create or reuse a project by `name`. |
| `target` | Hosting provider for a new project: `cloudflare` (default), `netlify` or `vercel`. An existing project keeps its target. |

## Formats

Set `format` to one of the values below and send the matching content argument. Omit `format` only when you redeploy with `from` or `commit`.

### `html`

One page. Send `html`. Inline CSS and JavaScript are allowed. Tailwind classes compile automatically.

### `files`

A site made of several files. Send `files`, an object that maps each path to its contents as text.

- On an existing `project` the map is merged into the current deployment. Files not named keep their contents.
- A path mapped to `""` is deleted.
- `replace: true` replaces the whole file set instead of merging.

### `react`

One component. Send `code`: JSX or TSX source that exports a default component. `react`, `recharts` and `lucide-react` are available.

| Optional argument | Meaning |
|---|---|
| `title` | Page title. |
| `dependencies` | Extra packages for the import map, as an object of package name to version. |
| `ai` | `true` enables the server side AI binding. Cloudflare target only. |
| `system_prompt` | Pinned instructions for the AI binding, set on the server. Up to 10,000 characters. |
| `storage` | `true` enables per user persistence. Cloudflare target only. |

### `markdown`

A themed article. Send `markdown` (GitHub Flavored Markdown). The title comes from the first heading unless `title` is given. `theme` is `dark`, `light` or `auto` (default).

### `themed`

An HTML body wrapped in the OpZero theme. Send `content`. `style` is `landing`, `article` (default) or `dashboard`. `theme` is `dark`, `light` or `auto` (default). `title` sets the page title.

## Redeploying stored source

| Argument | Meaning |
|---|---|
| `from` | `"latest"` or a deployment id of `project`. Publishes the stored files of that deployment again with no content in the call. |
| `commit` | For an MCP server project: rebuild from its repository at this commit hash (12 to 64 hex characters). Not combined with a deployment id in `from`. |

To return to an earlier release on purpose, prefer the `deployment` tool with `action: "rollback"`, described in the `restore-release` skill.

## Starting from a scaffold

`docs` with `template` and `kind: "site"` returns files that are ready to deploy. Site template names in the tool schema: `opzero`, `landing`, `portfolio`, `blog`, `static`, `vite-react`, `react-esm` and `webmcp` (a web app with browser tools).

## Reading the result

`deployment_inspect` reads what `deploy` produced.

| `action` | Needs | Returns |
|---|---|---|
| `status` | `deployment`, or `project` for its last 5 records | status, statusDetail, url and sizes |
| `get` | `deployment` | one deployment with its full file contents and where the source came from |
| `list` | optional `project`, `limit` (default 10, up to 100) | recent deployments, newest first |

A deployment that finished shows the status `ready`. The tool description also names `pending` and `error`.
