---
name: restore-release
description: Trace a regression through OpZero release history and restore a specific earlier deployment when the user authorizes a rollback.
---

List the project's releases with deployment_inspect. Compare the current deployment with the intended earlier one using timestamps, identifiers and the requested file or symptom. State what would change. If there are multiple plausible target releases, ask which one to restore.

When the user has authorized that rollback, call deployment with action rollback and the verified deployment identifier. Inspect the new deployment and its preview to confirm the restored content. Report the prior source release, the new deployment identifier and the live URL. A request to roll back needs no deletion of history.
