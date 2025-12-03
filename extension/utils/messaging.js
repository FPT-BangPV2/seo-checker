"use strict";
/**
 * utils/messaging.js
 * Promise wrappers for Chrome messaging.
 */
/**
 * Send message to runtime
 * @param {Object} msg
 * @returns {Promise<any>}
 */
export function sendRuntimeMessage(msg) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(msg, (res) => {
      if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
      else resolve(res);
    });
  });
}
