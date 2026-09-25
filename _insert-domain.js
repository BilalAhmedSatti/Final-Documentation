const fs = require("fs");
const indexPath = "e:/MYDBDoc/index.html";
const frag = fs.readFileSync("e:/MYDBDoc/_domain-learning-pages.html", "utf8");
let html = fs.readFileSync(indexPath, "utf8");

if (html.includes('id="page-domain"')) {
  console.log("already inserted");
} else {
  const marker = "      <!-- WORKFLOWS -->";
  if (!html.includes(marker)) {
    console.error("marker missing");
    process.exit(1);
  }
  html = html.replace(marker, frag + "\n\n      <!-- WORKFLOWS -->");
}

html = html.replace("css/site.css?v=7", "css/site.css?v=8");
html = html.replace("css/site.css?v=8", "css/site.css?v=9");
html = html.replace(/\?v=19/g, "?v=20");
html = html.replace(/\?v=20/g, "?v=20"); // keep

if (!html.includes("mermaid.min.js")) {
  html = html.replace(
    '<script src="js/data.js?v=20"></script>',
    '<script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>\n  <script src="js/data.js?v=20"></script>'
  );
  // fallback if version string differs
  if (!html.includes("mermaid.min.js")) {
    html = html.replace(
      /<script src="js\/data\.js\?v=\d+"><\/script>/,
      '<script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>\n  $&'
    );
  }
}

fs.writeFileSync(indexPath, html);
console.log("done", html.includes('id="page-domain"'), html.includes("mermaid.min.js"));
