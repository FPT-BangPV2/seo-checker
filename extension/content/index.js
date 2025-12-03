// content/index.js
// SINGLE BUNDLED CONTENT SCRIPT – Clean, readable, production-ready
// No import/export, no importScripts → Works perfectly in Manifest V3
// Fully commented in English – Easy to understand & extend

(() => {
  "use strict";
  console.log("[SEO Tag Inspector] Content script loaded on:", location.href);

  // ===================================================================
  // 1. SEO RULES – Each rule checks one specific SEO factor
  // ===================================================================

  class TitleRule {
    run(doc, result) {
      const title = doc.querySelector("title");
      if (!title || !title.textContent.trim()) {
        result.issues.push("Missing <title> tag");
      } else {
        const text = title.textContent.trim();
        result.headTags.push({ type: "title", value: text });
        if (text.length > 70) result.warnings.push(`Title too long (${text.length} chars)`);
        if (text.length < 10) result.warnings.push("Title too short (<10 chars)");
      }
    }
  }

  class DescriptionRule {
    run(doc, result) {
      const meta = doc.querySelector('meta[name="description"]');
      if (!meta || !meta.content.trim()) {
        result.issues.push("Missing meta description");
      } else {
        const content = meta.content.trim();
        result.headTags.push({ type: "meta", name: "description", value: content });
        if (content.length > 160)
          result.warnings.push(`Meta description too long (${content.length} chars)`);
      }
    }
  }

  class OpenGraphRule {
    run(doc, result) {
      // 1. Detect prefix in <head>
      const head = doc.querySelector("head");
      if (head?.hasAttribute("prefix")) {
        const prefix = head.getAttribute("prefix");
        result.headTags.push({ type: "prefix", value: prefix });
      }

      // 2. OG tags (get content & property)
      const ogSelectors = [
        'meta[property^="og:"]',
        'meta[content*="og:"]', // fallback
      ];
      const ogTags = new Set();
      ogSelectors.forEach((sel) => {
        doc.querySelectorAll(sel).forEach((tag) => {
          const property = tag.getAttribute("property") || tag.getAttribute("name");
          const content = tag.getAttribute("content");
          if (property && content) {
            const key = property.trim();
            if (!ogTags.has(key)) {
              ogTags.add(key);
              result.headTags.push({ type: "meta", property: key, value: content.trim() });
            }
          }
        });
      });

      // 3. Twitter Cards
      doc.querySelectorAll('meta[name^="twitter:"]').forEach((tag) => {
        const name = tag.getAttribute("name");
        const content = tag.getAttribute("content");
        if (name && content) {
          result.headTags.push({ type: "meta", name, value: content.trim() });
        }
      });

      // 4. Facebook & other meta (fb:app_id, article:*, etc.)
      doc
        .querySelectorAll('meta[name^="fb:"], meta[property^="article:"], meta[property^="book:"]')
        .forEach((tag) => {
          const name = tag.getAttribute("name") || tag.getAttribute("property");
          const content = tag.getAttribute("content");
          if (name && content) {
            result.headTags.push({ type: "meta", name: name, value: content.trim() });
          }
        });

      // 5. Check OG important (miss → warning)
      const importantOG = ["og:title", "og:description", "og:image", "og:url", "og:type"];
      importantOG.forEach((prop) => {
        const exists = Array.from(ogTags).some((t) => t === prop);
        if (!exists) {
          result.warnings.push(`Missing ${prop}`);
        }
      });
    }
  }

  class CanonicalRule {
    run(doc, result) {
      const link = doc.querySelector('link[rel="canonical"]');
      if (link?.href) {
        result.headTags.push({ type: "link", rel: "canonical", href: link.href });
      } else {
        result.warnings.push("Missing canonical URL");
      }
    }
  }

  class HeadingsRule {
    run(doc, result) {
      const h1 = doc.querySelector("h1");
      if (!h1) result.warnings.push("Missing H1 heading");

      doc.querySelectorAll("h1,h2,h3,h4,h5,h6").forEach((h) => {
        result.headings.push({
          level: h.tagName.toLowerCase(),
          text: h.textContent.trim(),
        });
      });
    }
  }

  class ImagesRule {
    run(doc, result) {
      doc.querySelectorAll("img").forEach((img) => {
        const src = img.currentSrc || img.src || "";
        if (!src) return;

        const cleanSrc = src.split("?")[0];
        const hasAlt = !!img.alt && img.alt.trim() !== "";

        result.images.push({
          src: src,
          alt: img.alt || "",
          hasAlt,
        });

        if (!hasAlt) result.warnings.push(`Image missing alt: ${src.split("/").pop()}`);
      });
    }
  }

  class DuplicatesRule {
    run(doc, result) {
      const seen = new Map();

      doc.querySelectorAll('meta[name], meta[property], link[rel="canonical"]').forEach((tag) => {
        const name = tag.getAttribute("name") || tag.getAttribute("property") || "canonical";
        const value = tag.getAttribute("content") || tag.getAttribute("href") || "";
        if (!name || !value) return;

        const key = `${name}:${value}`;
        if (seen.has(key)) {
          const existing = result.duplicates.find((d) => d.name === name && d.value === value);
          if (!existing) {
            result.duplicates.push({ name, value, count: 2 });
          }
        } else {
          seen.set(key, true);
        }
      });
    }
  }

  // ===================================================================
  // 2. MAIN SCANNER – Runs all rules
  // ===================================================================

  class SEOTagScanner {
    constructor() {
      this.rules = [
        TitleRule,
        DescriptionRule,
        OpenGraphRule,
        CanonicalRule,
        HeadingsRule,
        ImagesRule,
        DuplicatesRule,
      ];
    }

    scan(doc = document) {
      const result = {
        url: doc.location.href,
        timestamp: new Date().toISOString(),
        summary: { errors: 0, warnings: 0, duplicates: 0, missingAltImages: 0 },
        issues: [],
        warnings: [],
        headTags: [],
        duplicates: [],
        headings: [],
        images: [],
      };

      this.rules.forEach((Rule) => new Rule().run(doc, result));

      // Update summary counts
      result.summary.errors = result.issues.length;
      result.summary.warnings = result.warnings.length;
      result.summary.duplicates = result.duplicates.length;
      result.summary.missingAltImages = result.images.filter((i) => !i.hasAlt).length;

      return result;
    }
  }

  // ===================================================================
  // 3. HIGHLIGHTER – Visual feedback on page
  // ===================================================================

  class Highlighter {
    static highlightDuplicates(duplicates, doc = document) {
      duplicates.forEach((d) => {
        const selector = `meta[name="${d.name}"], meta[property="${d.name}"], link[rel="canonical"][href="${d.value}"]`;
        doc.querySelectorAll(selector).forEach((el) => {
          el.style.cssText +=
            "outline: 4px solid #ff006e !important; background: rgba(255,0,110,0.15) !important;";
        });
      });
    }

    static highlightMissingAlt(images, doc = document) {
      images
        .filter((i) => !i.hasAlt)
        .forEach((img) => {
          const el = doc.querySelector(`img[src*="${img.src.split("/").pop()}"]`);
          if (el) el.style.outline = "4px solid orange !important";
        });
    }
  }

  // ===================================================================
  // 4. MAIN EXECUTION – Auto scan + listen for manual rescan
  // ===================================================================

  const scanner = new SEOTagScanner();

  const performScan = () => {
    const result = scanner.scan();

    // Visual feedback
    Highlighter.highlightDuplicates(result.duplicates);
    Highlighter.highlightMissingAlt(result.images);

    // Send result to background script
    chrome.runtime.sendMessage({
      action: "scanComplete",
      data: result,
    });

    console.log("[SEO Tag Inspector] Scan completed:", result.summary);
  };

  // Auto scan on page load
  performScan();

  // Listen for manual rescan from popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.action === "runScan") {
      performScan();
      sendResponse({ success: true });
    }
    return true; // Keep message channel open for async response
  });
})();
