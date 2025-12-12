"use strict";

import { sendRuntimeMessage } from "../utils/messaging.js";
import { exportCSV } from "../utils/csv.js";
import { getLastScanForTab, storageKeyForTab } from "../utils/storage.js";

const scanBtn = document.getElementById("scanBtn");
const clearBtn = document.getElementById("clearBtn");
const urlEl = document.getElementById("url");
const errorsEl = document.getElementById("errors");
const warningsEl = document.getElementById("warnings");
const resultEl = document.getElementById("result");
const headCountEl = document.getElementById("head-count");
const bodyCountEl = document.getElementById("body-count");
const copyJsonBtn = document.getElementById("copyJson");
const downloadCsvBtn = document.getElementById("downloadCsv");
const tabs = document.querySelectorAll(".tab");
let currentTab = "head";
let scanData = null;

async function clearAll() {
  errorsEl.textContent = "0";
  warningsEl.textContent = "0";
  headCountEl.textContent = "(0)";
  bodyCountEl.textContent = "(0)";
  resultEl.innerHTML = '<div class="loading"><p>Click "Scan Page" to start</p></div>';

  scanData = null;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    chrome.tabs.sendMessage(tab.id, { action: "clearHighlight" }).catch(() => {});
  }
}

async function init() {
  const tabsQuery = await chrome.tabs.query({ active: true, currentWindow: true });
  const activeTab = tabsQuery[0];
  urlEl.textContent = activeTab.url.split("?")[0].split("#")[0] || "No URL";
  const storedData = await chrome.storage.local.get(storageKeyForTab(activeTab.id));
  scanData = storedData[storageKeyForTab(activeTab.id)];

  console.log("scanData::::", scanData);
  if (scanData) renderResult();
  else await clearAll();
}

function renderResult() {
  if (!scanData) {
    clearAll();
    return;
  }

  errorsEl.textContent = scanData.summary.errors;
  warningsEl.textContent = scanData.summary.warnings;

  const headTotal = scanData.head.errors.length + scanData.head.warnings.length;
  const bodyTotal = scanData.body.errors.length + scanData.body.warnings.length;
  headCountEl.textContent = `(${headTotal})`;
  bodyCountEl.textContent = `(${bodyTotal})`;

  renderTabContent();
}

function renderTabContent() {
  const section = scanData[currentTab];
  let html = "";

  if (!section.errors.length && !section.warnings.length) {
    html =
      '<div class="perfect"><span class="perfect-icon">✅</span><p class="muted">No issues found in this section.</p></div>';
  }

  html += createAccordion("Errors", section.errors, "error");
  html += createAccordion("Warnings", section.warnings, "warning");

  if (currentTab === "head") {
    html += '<h4 class="section-title">Tags Important</div>';
    html += createTagGrid(scanData.head.tags);
  }

  resultEl.innerHTML = html;
}

function createAccordion(title, items, type) {
  if (!items.length) return "";
  const grouped = groupIssues(items);
  let content = Object.values(grouped)
    .map((group) => createIssueCard(group, type))
    .join("");
  return `
    <div class="accordion">
    <div class="accordion-header">${title} (${items.length})</div>
    <div class="accordion-content">${content}</div>
    </div>
 `;
}

function groupIssues(items) {
  console.log("groupIssues:::", items);
  const grouped = {};
  items.forEach((item) => {
    const key = item.elementKey || "general";
    if (!grouped[key]) {
      grouped[key] = {
        tag: item.tag || item.title.split(" ")[0],
        display: item.title || item.display,
        issues: [],
      };
    }
    grouped[key].issues.push(item);
  });
  return grouped;
}

function createIssueCard(group, type) {
  const className = type === "error" ? "card error" : "card warning";
  let issuesHtml = group.issues
    .map(
      (issue) => `
        <div class="card-list">
          <p class="card-desc">${issue.desc || ""}</p>
          <p class="card-tip">Suggestion: ${issue.suggestion}</p>
          <p class="card-tip">Reference: <a href="${
            issue.reference || ""
          }" target="_blank">Google Docs</a></p>
        </div>
        `
    )
    .join("");
  return `
        <div class="${className}">
        <div class="card-header">
        <span class="tag">${group.tag}</span>
        <strong>${group.display}</strong>
        </div>
        <div class="issue-list">${issuesHtml}</div>
        </div>
 `;
}

function createTagGrid(tags) {
  if (!tags.length) return '<p class="muted">No tags found.</p>';
  let html = '<div class="tag-grid">';
  tags.forEach((tag) => {
    html += `
      <div class="tag-card">
      <div class="tag-wrap">
        <div class="tag-icon">${tag.type[0].toUpperCase()}</div>
        <div class="tag-label">${tag.name}</div>
      </div>
      <div class="tag-value truncate-3-lines">${tag.value || tag.href || ""}</div>
      </div>
   `;
  });
  html += "</div>";
  return html;
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    currentTab = tab.dataset.tab;
    renderTabContent();
  });
});

scanBtn.addEventListener("click", async () => {
  await clearAll();

  resultEl.innerHTML = '<div class="loading"><div class="spinner"></div><p>Scanning...</p></div>';
  const res = await sendRuntimeMessage({ action: "runScan" });
  if (res?.success) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    scanData = res.result?.data || (await getLastScanForTab(tab.id));
    renderResult();
  } else {
    resultEl.innerHTML = '<p class="error">Error: ' + res.error + "</p>";
  }
});

clearBtn.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  await sendRuntimeMessage({ action: "clearScan", tabId: tab.id });
  await clearAll();
});

copyJsonBtn.addEventListener("click", () => {
  if (!scanData) return alert("No scan data");
  navigator.clipboard.writeText(JSON.stringify(scanData, null, 2));
  copyJsonBtn.textContent = "Copied!";
  setTimeout(() => (copyJsonBtn.textContent = "Copy JSON"), 2000);
});

downloadCsvBtn.addEventListener("click", () => {
  if (!scanData) return alert("No scan data");
  exportCSV(`seo-scan-${new Date().toISOString().split("T")[0]}.csv`, scanData);
});

init();
