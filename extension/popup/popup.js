"use strict";
/**
 * popup/popup.js
 * UI logic: Bind buttons, render results.
 */

import { sendRuntimeMessage } from "../utils/messaging.js"; // Rename for accuracy
import { exportCSV } from "../utils/csv.js";
import { setStorage, storageKeyForTab, getLastScanForTab, clearUI } from "../utils/storage.js"; // Merge state into storage

let activeTabId = null;
document.addEventListener("DOMContentLoaded", async () => {
  const scanBtn = document.getElementById("scanBtn");
  const copyBtn = document.getElementById("copyJson");
  const downloadBtn = document.getElementById("downloadCsv");
  const urlEl = document.getElementById("url");
  const errorsEl = document.getElementById("errors");
  const warningsEl = document.getElementById("warnings");
  const resultEl = document.getElementById("result");

  // Get active tab once
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  activeTabId = tab?.id;
  urlEl.textContent = tab?.url ? tab.url.split("?")[0] : "No active tab";

  await loadLastScan(errorsEl, warningsEl, resultEl);

  // scan button
  scanBtn.addEventListener("click", async () => {
    if (!activeTabId) return;

    setLoading(true);

    try {
      const res = await sendRuntimeMessage({ action: "runScan" });
      if (!res?.success) throw new Error(res?.error || "Scan failed");

      await loadLastScan(errorsEl, warningsEl, resultEl);
    } catch (error) {
      console.error("[Popup] scan error", error);
      resultEl.innerHTML = `<p class="error">Error: ${error.message}</p>`;
    } finally {
      setLoading(false);
    }
  });

  // Clear button
  clearBtn.addEventListener("click", async () => {
    if (!activeTabId) return;
    await setStorage({ [storageKeyForTab(activeTabId)]: null });
    clearUI();

    errorsEl.textContent = "0";
    warningsEl.textContent = "0";
  });

  // copy JSON button
  copyBtn.addEventListener("click", async () => {
    try {
      const last = await getLastScanForTab(activeTabId);

      if (!last) {
        throw new Error("No data");
      }
      await navigator.clipboard.writeText(JSON.stringify(last, null, 2));
      alert("Copied JSON!");
    } catch (error) {
      alert("Copy error: " + error.message);
    }
  });

  // download CSV button
  downloadBtn.addEventListener("click", async () => {
    try {
      const last = await getLastScanForTab(activeTabId);

      if (!last) {
        throw new Error("No data");
      }

      exportCSV(`SEO-Tag-Inspector-${new Date().toISOString().split("T")[0]}.csv`, last);
    } catch (error) {
      alert("Export error: " + error.message);
    }
  });

  // Loading state
  function setLoading(isLoading) {
    if (isLoading) {
      scanBtn.disabled = true;
      resultEl.innerHTML = `
       <div class="loading">
           <div class="spinner"></div>
           <p>Analyzing page structure...<br><small>Please wait a moment</small></p>
       </div>
       `;
    } else {
      scanBtn.disabled = false;
    }
  }
});

// Reusable load & render
async function loadLastScan(errorsEl, warningsEl, resultEl) {
  const last = await getLastScanForTab(activeTabId);
  if (!last) {
    clearUI();
    return;
  }
  errorsEl.textContent = last.summary.errors || 0;
  warningsEl.textContent = last.summary.warnings || 0;
  renderResult(last, resultEl);
}

// Render with sections
function renderResult(scan, resultEl) {
  let html = "";
  console.log("Rendering scan:", scan);

  // Issues section
  if (scan.issues.length > 0) {
    scan.issues.forEach((msg) => {
      let tag = "meta";
      if (msg.includes("title")) tag = "title";
      else if (msg.includes("description")) tag = 'meta name="description"';
      else if (msg.includes("canonical")) tag = 'link rel="canonical"';
      else if (msg.includes("robots")) tag = 'meta name="robots"';

      html += `
       <div class="issue-card">
         <strong><span class="tag">&lt;${escapeHtml(tag)}&gt;</span> ${escapeHtml(
        msg.replace("Missing ", "").trim()
      )}</strong>
         <div class="tip">This tag is critical for SEO and should be added immediately</div>
       </div>`;
    });
  }

  // Warnings section
  if (scan.warnings.length > 0) {
    scan.warnings.forEach((msg) => {
      let tag = "";
      let cleanMsg = msg;
      let extra = "";

      if (/og:/.test(msg)) {
        const match = msg.match(/og:[^ ]+/);
        tag = match ? `meta property="${match[0]}"` : "meta og";
        cleanMsg = `Missing ${match ? match[0] : "Open Graph tag"}`;
      } else if (msg.includes("Title")) {
        tag = "title";
        cleanMsg = msg.includes("long") ? "Title too long" : "Title too short";
        extra = msg.match(/\(.+\)/)?.[0] || "";
      } else if (msg.includes("description")) {
        tag = "meta description";
        cleanMsg = msg.includes("long") ? "Description too long" : "Description missing";
        extra = msg.match(/\(.+\)/)?.[0] || "";
      } else if (msg.includes("H1")) {
        tag = "h1";
        cleanMsg = "Missing H1";
      } else if (msg.includes("alt")) {
        tag = "img";
        cleanMsg = "Image missing alt";
        extra = msg.split(": ")[1]?.slice(0, 50) + (msg.split(": ")[1]?.length > 50 ? "..." : "");
      }

      html += `
       <div class="warn-card">
         <strong>
           <span class="tag">&lt;${escapeHtml(tag)}&gt;</span> 
           ${escapeHtml(cleanMsg)} 
           ${extra ? `<span class="length">${escapeHtml(extra)}</span>` : ""}
         </strong>
         <div class="tip">
           ${
             msg.includes("alt")
               ? "Improves accessibility + Google Images"
               : msg.includes("Title")
               ? "Ideal: 50–60 characters"
               : msg.includes("description")
               ? "Ideal: 150–160 characters"
               : msg.includes("og:")
               ? "Required for perfect social sharing"
               : "Recommended for better SEO"
           }
         </div>
       </div>`;
    });
  }

  const prefixTag = scan.headTags.find((t) => t.type === "prefix");
  if (prefixTag) {
    html += `<div class="prefix-note">Open Graph prefix detected: <code>${escapeHtml(
      prefixTag.value
    )}</code></div>`;
  }

  if (scan.issues.length === 0 && scan.warnings.length === 0) {
    html = `
     <div style="text-align:center;padding:80px 20px;color:#10b981;">
       <div style="font-size:64px;margin-bottom:16px;">Checkmark</div>
       <strong style="font-size:18px;display:block;margin-bottom:8px;">Perfect!</strong>
       <p style="color:#64748b;">No SEO issues detected. Great job!</p>
     </div>`;
  }

  // Head Tags section (sorted)
  //   const importantTags = scan.headTags.filter(
  //     (t) =>
  //       t.type === "title" ||
  //       t.name === "description" ||
  //       t.property?.startsWith("og:") ||
  //       t.rel === "canonical"
  //   );

  //   html += `<section class="section tags">
  //       <h3>Key Meta Tags</h3>`;
  //   if (importantTags.length === 0) {
  //     html += `<p class="muted">No important meta tags detected</p>`;
  //   } else {
  //     html += '<div class="tag-grid">';
  //     importantTags.forEach((t) => {
  //       let label = "";
  //       let value = "";
  //       let icon = "";

  //       if (t.type === "title") {
  //         label = "Title";
  //         value = t.value;
  //         icon = "T";
  //       } else if (t.name === "description") {
  //         label = "Description";
  //         value = t.value;
  //         icon = "D";
  //       } else if (t.property?.startsWith("og:")) {
  //         label = t.property.replace("og:", "");
  //         value = t.value;
  //         icon = "OG";
  //       } else if (t.rel === "canonical") {
  //         label = "Canonical";
  //         value = t.href;
  //         icon = "Link";
  //       }

  //       const truncated = value.length > 70 ? value.slice(0, 67) + "..." : value;

  //       html += `
  //           <div class="tag-card" title="${escapeHtml(value)}">
  //             <div class="tag-icon">${icon}</div>
  //             <div class="tag-content">
  //               <div class="tag-label">${label}</div>
  //               <div class="tag-value">${escapeHtml(truncated)}</div>
  //             </div>
  //           </div>`;
  //     });
  //     html += "</div>";
  //   }
  //   html += `</section>`;

  resultEl.innerHTML = html;
}

// Helper avoid XSS
function escapeHtml(text) {
  if (typeof text !== "string") return text;
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
