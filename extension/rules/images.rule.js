// ./rules/images.rule.js
class ImagesRule extends BaseRule {
  run(doc, result) {
    doc.querySelectorAll("img").forEach((img, index) => {
      const src = img.currentSrc || img.src || "";
      if (!src) return;
      const key = `img:${index}`;
      const shortName = this.shortenUrl(src);
      const hasAlt = img.alt?.trim();
      const hasLazy = img.loading === "lazy" || img.hasAttribute("loading");
      const hasSrcset = img.hasAttribute("srcset");
      const hasWidth = img.hasAttribute("width");
      const hasHeight = img.hasAttribute("height");
      if (!hasAlt) {
        this.pushIssue(result, "body", this.severityMap.warning, {
          title: "Missing alt attribute",
          desc: "Alt text improves accessibility and image SEO.",
          tag: "img",
          display: shortName,
          elementKey: key,
          suggestion: 'Add alt="Descriptive text".',
          reference: "https://developers.google.com/search/docs/advanced/guidelines/google-images",
        });
      }
      if (!hasLazy && !src.includes("data:")) {
        this.pushIssue(result, "body", this.severityMap.warning, {
          title: 'Missing loading="lazy"',
          desc: "Lazy loading improves page speed.",
          tag: "img",
          display: shortName,
          elementKey: key,
          suggestion: 'Add loading="lazy" to offscreen images.',
          reference: "https://developers.google.com/search/docs/appearance/lazy-loading",
        });
      }
      if (!hasSrcset) {
        this.pushIssue(result, "body", this.severityMap.warning, {
          title: "Missing srcset attribute",
          desc: "Srcset enables responsive images.",
          tag: "img",
          display: shortName,
          elementKey: key,
          suggestion: "Add srcset with different resolutions.",
          reference: "https://developers.google.com/search/docs/appearance/responsive-images",
        });
      }
      if (!hasWidth || !hasHeight) {
        this.pushIssue(result, "body", this.severityMap.warning, {
          title: "Missing width or height",
          desc: "Prevents layout shifts (CLS score).",
          tag: "img",
          display: shortName,
          elementKey: key,
          suggestion: "Add width and height attributes.",
          reference: "https://developers.google.com/search/docs/appearance/core-web-vitals",
        });
      }
      // Collect images for potential export
      result.images.push(shortName);
    });
  }
  shortenUrl(url) {
    if (url.startsWith("data:")) {
      return "Inline DataURL Image";
    }
    if (url.startsWith("blob:")) {
      return "Blob URL Image";
    }
    if (url.includes("%")) {
      return decodeURIComponent(url);
    }

    try {
      const ur = new URL(url);
      const parts = ur.pathname.split("/");
      const short = parts.slice(-2).join("/");
      if (short.length > 50) short = "..." + short.slice(47);

      return short || ur.hostname;
    } catch {
      return url.split("/").pop()?.slice(0, 50) || "Unknown Image";
    }
  }
}
