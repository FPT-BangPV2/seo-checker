// build.js
const fs = require("fs");
const path = require("path");

const OUTPUT_FILE = "./extension/content/main.js";

// Import scanner, rules
const files = [
  "extension/rules/base.rule.js",
  "extension/rules/title.rule.js",
  "extension/rules/description.rule.js",
  "extension/rules/robots.rule.js",
  "extension/rules/canonical.rule.js",
  "extension/rules/og.rule.js",
  "extension/rules/viewport.rule.js",
  "extension/rules/favicon.rule.js",
  "extension/rules/language.rule.js",
  "extension/rules/headings.rule.js",
  "extension/rules/images.rule.js",
  "extension/rules/duplicates.rule.js",
  "extension/rules/structuredData.rule.js",
  "extension/content.js", // ← Entry point (performScan + listener)
  "extension/highlighter/index.js",
];

let output = `(function() {\n"use strict";\n\n`;

// Mapping
files.forEach((file) => {
  const fullPath = path.resolve(file);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, "utf8");
    output += `// ===================================\n`;
    output += `// FILE: ${file}\n`;
    output += `// ===================================\n`;
    output += content + "\n\n";
  } else {
    console.warn(`Warning: Not found file: ${file}`);
  }
});

// Auto running
output += `// ===================================\n`;
output += `// AUTO RUN + SCAN LISTENER\n`;
output += `// ===================================\n`;
output += `performScan();\n\n`;
output += `chrome.runtime.onMessage.addListener((msg, sender, respond) => {\n`;
output += `  if (msg.action === "runScan") {\n`;
output += `    performScan();\n`;
output += `    respond({ success: true });\n`;
output += `  }\n`;
output += `  return true;\n`;
output += `});\n\n`;
output += `})();`;

fs.writeFileSync(OUTPUT_FILE, output);
console.log("Build Successfully! → content/main.js was ready!");
console.log(`→ File created: ${OUTPUT_FILE}`);
