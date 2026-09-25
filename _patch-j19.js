const fs = require("fs");
const { beginner, workflows } = JSON.parse(
  fs.readFileSync("e:/MYDBDoc/js/_generated-j7-j19.json", "utf8")
);

function patchLast(path, indent, id, block) {
  let out = fs.readFileSync(path, "utf8");
  const needle = indent + id + ": {";
  const start = out.indexOf(needle);
  if (start < 0) throw new Error("missing " + id + " in " + path);

  // Walk braces from the opening `{` of this journey to find matching close
  const openBrace = out.indexOf("{", start);
  let depth = 0;
  let i = openBrace;
  for (; i < out.length; i++) {
    const ch = out[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        i++; // include closing }
        break;
      }
    }
  }
  // Include trailing comma/whitespace up to newline
  while (i < out.length && (out[i] === "," || out[i] === " " || out[i] === "\r")) i++;
  if (out[i] === "\n") i++;

  const json = JSON.stringify(block, null, 2)
    .split("\n")
    .map((line, idx) => (idx === 0 ? line : indent + line))
    .join("\n");
  const replacement = indent + id + ": " + json + ",\n";
  out = out.slice(0, start) + replacement + out.slice(i);
  fs.writeFileSync(path, out);
  console.log("patched", path, id);
}

patchLast("e:/MYDBDoc/js/simple-content.js", "    ", "J19", beginner.J19);
patchLast("e:/MYDBDoc/js/workflows.js", "  ", "J19", workflows.J19);
console.log("J19 done");
