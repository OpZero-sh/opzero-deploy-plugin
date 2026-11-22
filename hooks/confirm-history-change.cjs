let input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", chunk => { input += chunk; });
process.stdin.on("end", () => {
  const event = JSON.parse(input);
  if (event.tool_input?.action !== "delete_record") return;
  const decision = {
    hookEventName: "PreToolUse",
    permissionDecision: "ask",
    permissionDecisionReason: "This removes a deployment history record. Confirm the selected record before proceeding."
  };
  process.stdout.write(JSON.stringify({hookSpecificOutput: decision}));
});
