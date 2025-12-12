class OpenGraphRule extends BaseRule {
  run(doc, result) {
    const prefix = doc.head.getAttribute("prefix") || "";
    if (!prefix.includes("og: https://ogp.me/ns#")) {
      this.pushIssue(result, "head", this.severityMap.warning, {
        title: "Missing Open Graph prefix",
        desc: "Required for Open Graph protocol.",
        code: '<head prefix="og: https://ogp.me/ns#">',
        tag: "head",
        elementKey: "og:prefix",
        display: "og:prefix",
        suggestion: "Add prefix attribute to <head>.",
        reference: "https://ogp.me/",
      });
    }
    const required = ["og:title", "og:type", "og:image", "og:url", "og:description"];
    const found = new Set();
    doc.querySelectorAll('meta[property^="og:"]').forEach((m) => {
      const property = m.getAttribute("property");
      const content = m.getAttribute("content")?.trim();
      if (property && content) {
        this.addTag(result, "meta", property, content);
        found.add(property);
      }
    });
    required.forEach((tag) => {
      if (!found.has(tag)) {
        this.pushIssue(result, "head", this.severityMap.warning, {
          title: `Missing ${tag}`,
          desc: "Important for social sharing previews.",
          code: `<meta property="${tag}" content="...">`,
          tag: `meta property="${tag}"`,
          elementKey: tag,
          display: tag,
          suggestion: "Add all required OG tags.",
          reference: "https://developers.facebook.com/docs/sharing/webmasters/",
        });
      }
    });
  }
}
