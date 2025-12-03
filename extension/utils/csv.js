"use strict";
/**
 * utils/csv.js
 * Export scan result to CSV (improved: headers, sorted by type).
 */
/**
 * Export to CSV file
 * @param {string} filename
 * @param {ScanResult} scan
 */
export function exportCSV(filename, scan) {
  const rows = [];
  rows.push(["Type", "Name/Property", "Value", "Issue/Warning", "Count"]); // Headers for user/dev overview
  // Sort headTags by type
  scan.headTags
    .sort((a, b) => a.type.localeCompare(b.type))
    .forEach((t) => {
      rows.push([t.type, t.name, t.value, "", ""]);
    });
  // Duplicates
  scan.duplicates.forEach((d) => {
    rows.push(["duplicate", d.name, d.value, "Trùng lặp", d.count]);
  });
  // Issues/Warnings
  scan.issues.forEach((i) => rows.push(["issue", "", "", i, ""]));
  scan.warnings.forEach((w) => rows.push(["warning", "", "", w, ""]));
  // Headings
  rows.push(["", "", "", "", ""]); // Separator
  rows.push(["Heading Level", "Text", "", "", ""]);
  scan.headings.forEach((h) => rows.push([h.level, h.text, "", "", ""]));
  const csvContent = rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
