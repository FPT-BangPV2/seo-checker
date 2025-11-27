console.log("[HeadTag checker] Background service worker loaded");

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("[HeadTag checker] Background received message:", msg);

  if (msg.action === "scanComplete") {
    // Save storage
    chrome.storage.local.set({ lastScan: msg.data }, () => {
      if (chrome.runtime.lastError) {
        console.error(
          "[HeadTag checker] Storage error:",
          chrome.runtime.lastError
        );
      } else {
        console.log("[HeadTag checker] Saved to storage:", msg.data);
      }
      // Update badge
      const total = msg.data.summary.errors + msg.data.summary.warnings;
      const text = total > 99 ? "99+" : total.toString();
      chrome.action.setBadgeText({ text: total > 0 ? text : "" });
      chrome.action.setBadgeBackgroundColor({
        color: total >= 3 ? "#ef4444" : "#f59e0b",
      });
    });
    sendResponse({ success: true });
    return;
  }

  if (msg.action === "runScan") {
    // Relay từ popup đến content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        console.log("[HeadTag checker] Relaying scan to tab:", tabs[0].id);
        chrome.tabs.sendMessage(tabs[0].id, msg, (response) => {
          if (chrome.runtime.lastError) {
            console.error(
              "[HeadTag checker] Error relaying to content:",
              chrome.runtime.lastError.message
            );
            sendResponse({
              success: false,
              error: chrome.runtime.lastError.message,
            });
          } else {
            console.log("[HeadTag checker] Relay response:", response);
            sendResponse(response);
          }
        });
      } else {
        sendResponse({ success: false, error: "No active tab" });
      }
    });

    return true; // Async response
  }
});
