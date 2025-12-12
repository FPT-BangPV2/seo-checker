"use strict";
/**
 * background/service-worker.js
 * Service worker: Relay messages, persist scans, update badge.
 */
import {
  setStorage,
  storageKeyForTab,
  getLastScanForTab,
  clearScanForTab,
} from "../utils/storage.js";

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("[SW] Received:", msg);
  if (!msg || !msg.action) return false;
  if (msg.action === "runScan") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab) return sendResponse({ success: false, error: "No active tab" });
      chrome.tabs.sendMessage(tab.id, { action: "runScan" }, (res) => {
        if (chrome.runtime.lastError) {
          return sendResponse({ success: false, error: chrome.runtime.lastError.message });
        }
        sendResponse({ success: true, result: res });
      });
    });
    return true;
  }
  // scan complete from content script → persist and update badge
  if (msg.action === "scanComplete") {
    const tabId = sender.tab?.id;
    if (!tabId) return sendResponse({ success: false, error: "No tab" });
    setStorage({ [storageKeyForTab(tabId)]: msg.data })
      .then(() => {
        updateBadge(tabId, msg.data);
        sendResponse({ success: true });
      })
      .catch((err) => sendResponse({ success: false, error: String(err) }));
    return true;
  }
  // clear
  if (msg.action === "clearScan") {
    const tabId = msg.tabId;
    if (!tabId) return sendResponse({ success: false });
    clearScanForTab(tabId).then(() => {
      chrome.action.setBadgeText({ tabId, text: "" });
      sendResponse({ success: true });
    });
    return true;
  }

  return false;
});

// Update notify badge
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const data = await getLastScanForTab(tabId);
  if (data) updateBadge(tabId, data);
  else chrome.action.setBadgeText({ tabId, text: "" });
});

function updateBadge(tabId, data) {
  const total = (data.summary?.errors || 0) + (data.summary?.warnings || 0);
  const text = total > 99 ? "99+" : total > 0 ? String(total) : "";
  chrome.action.setBadgeText({ tabId, text });
  chrome.action.setBadgeBackgroundColor({
    tabId,
    color: total >= 3 ? "#ef4444" : total > 0 ? "#f59e0b" : "#10b981",
  });
}

confirm()