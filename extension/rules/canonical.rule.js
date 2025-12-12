class CanonicalRule extends BaseRule {
  run(doc, result) {
    const link = doc.querySelector('link[rel="canonical"]');
    if (!link?.href) {
      this.pushIssue(result, "head", this.severityMap.warning, {
        title: "Missing canonical URL",
        desc: "Canonical helps prevent duplicate content issues.",
        tag: "link",
        elementKey: "canonical",
        display: "link:canonical",
        suggestion: 'Add <link rel="canonical" href="https://example.com/page">.',
        reference:
          "https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls",
      });
    } else {
      this.addTag(result, "link", "canonical", link.href, link.href);
      const current = location.href.split("?")[0].split("#")[0];
      if (link.href !== current && !link.href.includes(current)) {
        this.pushIssue(result, "head", this.severityMap.warning, {
          title: "Canonical does not match current URL",
          desc: "Mismatch may confuse search engines.",
          tag: "link",
          elementKey: "canonical",
          display: "link:canonical",
          suggestion: "Ensure canonical points to the preferred URL.",
        });
      }
    }
  }
}
