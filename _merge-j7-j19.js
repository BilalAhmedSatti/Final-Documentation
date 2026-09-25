const fs = require("fs");
const { beginner, workflows } = JSON.parse(
  fs.readFileSync("e:/MYDBDoc/js/_generated-j7-j19.json", "utf8")
);

function replaceJourneyBlocks(src, indent, ids, getBlock) {
  let out = src;
  const keys = Object.keys(ids);
  for (const id of keys) {
    const needle = indent + id + ": {";
    const start = out.indexOf(needle);
    if (start < 0) {
      console.log("missing", id, "at indent", JSON.stringify(indent));
      continue;
    }
    // Find end: next journey at same indent, or closing of parent object
    const searchFrom = start + needle.length;
    const nextJourney = out.slice(searchFrom).search(new RegExp("\\n" + indent + "J\\d+: \\{"));
    const nextOverview = out.slice(searchFrom).search(new RegExp("\\n" + indent + "overview:"));
    const nextComment = out.slice(searchFrom).search(new RegExp("\\n" + indent + "/\\*"));
    // Closing of parent object: "  };" or "};" at indent-2 or less
    const closeRe = new RegExp("\\n" + indent.replace(/ {2}$/, "") + "\\};");
    const nextClose = out.slice(searchFrom).search(closeRe);
    let relEnd = -1;
    const candidates = [];
    if (nextJourney >= 0) candidates.push(nextJourney);
    if (nextComment >= 0) candidates.push(nextComment);
    if (nextOverview >= 0) candidates.push(nextOverview);
    if (nextClose >= 0) candidates.push(nextClose);
    if (candidates.length) relEnd = Math.min(...candidates);
    if (relEnd < 0) {
      console.log("no end for", id);
      continue;
    }
    const end = searchFrom + relEnd;
    const json = JSON.stringify(getBlock(id), null, 2)
      .split("\n")
      .map((line, i) => (i === 0 ? line : indent + line))
      .join("\n");
    const block = indent + id + ": " + json + ",\n";
    out = out.slice(0, start) + block + out.slice(end);
    console.log("patched", id);
  }
  return out;
}

let sc = fs.readFileSync("e:/MYDBDoc/js/simple-content.js", "utf8");
sc = replaceJourneyBlocks(sc, "    ", beginner, (id) => beginner[id]);
fs.writeFileSync("e:/MYDBDoc/js/simple-content.js", sc);

let wf = fs.readFileSync("e:/MYDBDoc/js/workflows.js", "utf8");
wf = replaceJourneyBlocks(wf, "  ", workflows, (id) => workflows[id]);
fs.writeFileSync("e:/MYDBDoc/js/workflows.js", wf);

console.log("merge complete");
