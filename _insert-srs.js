const fs = require("fs");
const indexPath = "e:/MYDBDoc/index.html";
const frag = fs.readFileSync("e:/MYDBDoc/_domain-srs-pages.html", "utf8");
let html = fs.readFileSync(indexPath, "utf8");

if (!html.includes('id="page-domain-srs"')) {
  const marker = "      <!-- WORKFLOWS -->";
  if (!html.includes(marker)) {
    console.error("marker missing");
    process.exit(1);
  }
  html = html.replace(marker, frag + "\n\n      <!-- WORKFLOWS -->");
  console.log("inserted SRS pages");
} else {
  console.log("SRS pages already present");
}

html = html.replace(/\?v=22/g, "?v=23");
html = html.replace("css/site.css?v=10", "css/site.css?v=11");
html = html.replace("css/site.css?v=9", "css/site.css?v=11");

// Link from master domain page jump section if present
if (html.includes("Team exercises") && !html.includes('data-page="domain-srs"')) {
  html = html.replace(
    '<a class="pill amber" href="#domain-practice" data-page="domain-practice">Team exercises</a>',
    '<a class="pill amber" href="#domain-srs" data-page="domain-srs">SRS onboarding</a>\n    <a class="pill amber" href="#domain-practice" data-page="domain-practice">Team exercises</a>'
  );
}

fs.writeFileSync(indexPath, html);
console.log("ok", html.includes('id="page-domain-srs"'), html.includes("?v=23"));
