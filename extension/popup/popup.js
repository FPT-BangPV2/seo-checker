console.log("[HeadTag checker] Popup loaded");

document.addEventListener("DOMContentLoaded", () => {
  const urlEl = document.getElementById("url");
  const errorsEl = document.getElementById("errors");
  const warningsEl = document.getElementById("warnings");
  const resultEl = document.getElementById("result");
  const scanBtn = document.getElementById("scanBtn");

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) {
      console.error("[MetaTag Auditor] No active tab");
      return;
    }
    urlEl.textContent = tabs[0].url.split("?")[0];
    // Load kết quả ban đầu
    const load = () => {
      chrome.storage.local.get("lastScan", (d) => {
        console.log("[MetaTag Auditor] Loading from storage:", d);
        if (!d.lastScan || d.lastScan.url !== tabs[0].url) {
          resultEl.innerHTML = `<div class="loading"><p>Nhấn "Quét ngay" để kiểm tra trang này</p></div>`;
          return;
        }
        errorsEl.textContent = d.lastScan.summary.errors;
        warningsEl.textContent = d.lastScan.summary.warnings;
        if (d.lastScan.issues.length + d.lastScan.warnings.length === 0) {
          resultEl.innerHTML = `<div class="item success" style="border-left-color:#10b981; text-align:center;">Tuyệt vời! Không phát hiện lỗi nào.</div>`;
          return;
        }
        resultEl.innerHTML = [
          ...d.lastScan.issues.map((i) => `<div class="item error">${i}</div>`),
          ...d.lastScan.warnings.map(
            (w) => `<div class="item warning">${w}</div>`
          ),
        ].join("");
      });
    };
    load();
    // Nút Quét ngay: Gửi qua background relay + spinner 3s
    scanBtn.onclick = () => {
      console.log("[MetaTag Auditor] Scan button clicked");
      resultEl.innerHTML = `<div class="loading"><div class="spinner"></div><p>Đang quét trang web... (3s)</p></div>`;
      errorsEl.textContent = "?";
      warningsEl.textContent = "?";
      // Gửi message qua background để relay
      chrome.runtime.sendMessage({ action: "runScan" }, (response) => {
        if (chrome.runtime.lastError) {
          console.error(
            "[MetaTag Auditor] Popup error:",
            chrome.runtime.lastError
          );
          resultEl.innerHTML = `<div class="item error">Lỗi: ${chrome.runtime.lastError.message}. Kiểm tra console!</div>`;
          return;
        }
        console.log("[MetaTag Auditor] Scan response:", response);
        if (response.success) {
          // Đợi 1s rồi load lại
          setTimeout(load, 1000);
        } else {
          resultEl.innerHTML = `<div class="item error">Lỗi quét: ${response.error}</div>`;
        }
      });
      // Force spinner visible 3s (dù async)
      setTimeout(() => {
        if (resultEl.querySelector(".loading")) {
          load();
        }
      }, 3000);
    };
    // Copy JSON
    document.getElementById("copyJson").onclick = () => {
      chrome.storage.local.get("lastScan", (d) => {
        console.log("[MetaTag Auditor] Copy attempt:", d);
        if (!d.lastScan) {
          alert("Chưa có dữ liệu! Quét trang trước.");
          return;
        }
        navigator.clipboard
          .writeText(JSON.stringify(d.lastScan, null, 2))
          .then(() => {
            alert("Đã copy JSON vào clipboard!");
          })
          .catch((err) => {
            console.error("[MetaTag Auditor] Copy error:", err);
            alert("Lỗi copy: " + err);
          });
      });
    };
    // Download CSV
    document.getElementById("downloadCsv").onclick = () => {
      chrome.storage.local.get("lastScan", (d) => {
        console.log("[MetaTag Auditor] Download attempt:", d);
        if (!d.lastScan) {
          alert("Chưa có dữ liệu! Quét trang trước.");
          return;
        }
        const data = d.lastScan;
        const rows = [
          ["URL", data.url],
          ["Thời gian", data.timestamp],
          ["Lỗi nghiêm trọng", data.summary.errors],
          ["Cảnh báo", data.summary.warnings],
          [""],
          ["Lỗi phát hiện", ...data.issues],
          ["Cảnh báo", ...data.warnings],
          [""],
          ["Thẻ HEAD", "Tên", "Nội dung"],
          ...data.headTags.map((t) => [t.type, t.name, t.value]),
        ];
        const csv = rows
          .map((r) =>
            r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
          )
          .join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `MetaTag-Auditor-${
          new Date().toISOString().split("T")[0]
        }.csv`;
        a.click();
        URL.revokeObjectURL(url);
      });
    };
  });
});
