"use strict";
/**
 * background/service-worker.js
 * Service worker: Relay messages, persist scans, update badge.
 */
import { setStorage, storageKeyForTab } from "../utils/storage.js";
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("[SW] Received:", msg);
  if (!msg || !msg?.action) return sendResponse({ success: false, error: "Invalid action" });
  // run scan to active tab → forward to content script
  if (msg.action === "runScan") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      console.log("tab :", tab);
      if (!tab) return sendResponse({ success: false, error: "No active tab" });

      // Send message to content script
      chrome.tabs.sendMessage(tab.id, { action: "runScan" }, (res) => {
        if (chrome.runtime.lastError) {
          sendResponse({
            success: false,
            error: chrome.runtime.lastError.message,
          });
          return;
        }
        sendResponse({
          success: true,
          result: res?.result || null,
        });
      });
    });
    return true;
  }
  console.log("msg action:", msg.action);
  // scan complete from content script → persist and update badge
  if (msg.action === "scanComplete") {
    const tabId = sender.tab?.id;
    if (!tabId) return sendResponse({ success: false, error: "No tab" });
    setStorage({ [storageKeyForTab(tabId)]: msg.data })
      .then(() => {
        const total = (msg.data.summary?.errors || 0) + (msg.data.summary?.warnings || 0);
        const badge = total > 99 ? "99+" : total > 0 ? String(total) : "";
        chrome.action.setBadgeText({ text: badge });
        chrome.action.setBadgeBackgroundColor({
          color: total >= 3 ? "#ef4444" : "#f59e0b",
        });
        sendResponse({ success: true });
      })
      .catch((err) => sendResponse({ success: false, error: String(err) }));
    return true; // async
  }
  sendResponse({ success: false, error: "Unknown action" });
  return false;
});
