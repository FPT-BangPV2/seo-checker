console.log("[adTag Checker] Content script loaded on:", location.href);

class HeadTagScanner {
  static scan() {
    console.log("[adTag Checker] Starting scan...");
    const result = {
      url: location.href,
      timestamp: new Date().toISOString(),
      summary: { errors: 0, warnings: 0, duplicates: 0 },
      issues: [],
      warnings: [],
      headTags: [],
      headings: [],
      duplicates: [],
    };
    const head = document.head;
    const body = document.body;

    // Get all tag in head
    const tags = Array.from(head.children).map((el) => {
      const tag = el.tagName.toLowerCase();
      const attrs = {};
      for (const attr of el.attributes) {
        attrs[attr.name] = attr.value;
      }
      return { el, tag, attrs };
    });

    // Helper: Add tag into list
    const pushTag = (type, name, value, href = "") => {
      result.headTags.push({ type, name, value, href });
    };

    // Phân tích từng loại tag
    tags.forEach(({ el, tag, attrs }) => {
      if (tag === "title") {
        pushTag("title", "title", el.textContent.trim());
      }
      if (tag === "meta") {
        if (attrs.name) pushTag("meta", attrs.name, attrs.content || "");
        if (attrs.property)
          pushTag("meta", attrs.property, attrs.content || "");
      }
      if (tag === "link" && attrs.rel === "canonical") {
        pushTag("link", "canonical", attrs.href);
      }
      if (
        tag === "link" &&
        attrs.rel?.includes("alternate") &&
        attrs.hreflang
      ) {
        pushTag("link", "hreflang", attrs.hreflang, attrs.href);
      }
    });

    // Exact duplicate detection (same name/property + content)
    const seen = {};
    result.headTags.forEach((t) => {
      if (!t.name) return;
      const key = `${t.name}|${t.value}`;
      if (seen[key]) {
        seen[key].count++;
        if (seen[key].count === 2) {
          result.duplicates.push({
            name: t.name,
            value: t.value,
            count: seen[key].count + 1,
          });
          result.summary.duplicates++;
          result.issues.push(`Trùng lặp thẻ <${t.name}>: "${t.value}"`);
        }
      } else {
        seen[key] = { count: 1 };
      }
    });

    // Check heading
    const headings = Array.from(body.querySelectorAll("h1,h2,h3,h4,h5,h6"));
    result.headings = headings.map((h) => ({
      level: parseInt(h.tagName[1]),
      text: h.textContent.trim().substring(0, 150),
    }));
    const h1s = headings.filter((h) => h.tagName === "H1");
    if (h1s.length === 0) result.issues.push("Thiếu thẻ H1");
    if (h1s.length > 1)
      result.issues.push(`Có ${h1s.length} thẻ H1 (nên chỉ có 1)`);

    // Check skip heading
    let lastLevel = 0;
    headings.forEach((h) => {
      const level = parseInt(h.tagName[1]);
      if (lastLevel > 0 && level > lastLevel + 1) {
        result.warnings.push(`Bỏ qua cấp heading: H${lastLevel} → H${level}`);
      }
      lastLevel = level;
    });

    // Highlight error (only for duplicate)
    this.highlightErrors(result.duplicates);

    result.summary.errors = result.issues.length;
    result.summary.warnings = result.warnings.length;

    console.log("[HeadTag checker] Scan complete:", result);

    // Send result
    chrome.runtime.sendMessage(
      {
        action: "scanComplete",
        data: result,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error(
            "[HeadTag checker] Error sending to background:",
            chrome.runtime.lastError
          );
        } else {
          console.log("[HeadTag checker] Sent to background OK");
        }
      }
    );

    return result; // Return cho rescan if need
  }

  static highlightErrors(duplicates) {
    duplicates.forEach((dup) => {
      // Tìm elements duplicate
      document
        .querySelectorAll(
          `meta[name="${dup.name}"], meta[property="${dup.name}"], link[rel="canonical"]`
        )
        .forEach((el) => {
          if (
            (el.getAttribute("content") ||
              el.textContent ||
              el.getAttribute("href")) === dup.value
          ) {
            el.style.outline = "4px solid #ff006e";
            el.style.background = "rgba(255,0,110,0.15)";
          }
        });
    });
  }
}

// Auto run + listen lệnh rescan
HeadTagScanner.scan();

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("[MetaTag Auditor] Received message in content:", msg);
  if (msg.action === "runScan") {
    const result = HeadTagScanner.scan();
    sendResponse({ success: true, result });
  }
  return true; // Giữ message port open cho async
});
