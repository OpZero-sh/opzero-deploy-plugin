// Runs before this plugin's `deployment` tool. Deleting a deployment record is
// permanent, so the user is asked to confirm it. A rollback passes through.
// Reads the hook event from stdin, writes a decision to stdout, and does
// nothing else: no files, no network.
let input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", chunk => { input += chunk; });
process.stdin.on("end", () => {
  const ask = reason => {
    const decision = {
      hookEventName: "PreToolUse",
      permissionDecision: "ask",
      permissionDecisionReason: reason
    };
    process.stdout.write(JSON.stringify({hookSpecificOutput: decision}));
  };
  let event;
  try {
    event = JSON.parse(input);
  } catch {
    ask("This deployment history change could not be checked. Confirm it before proceeding.");
    return;
  }
  const toolInput = event && event.tool_input ? event.tool_input : {};
  if (toolInput.action !== "delete_record") return;
  const record = typeof toolInput.deployment === "string" && toolInput.deployment ? " " + toolInput.deployment : "";
  ask("This permanently removes deployment record" + record + " from history. The live site is not changed. Confirm the record before proceeding.");
});
