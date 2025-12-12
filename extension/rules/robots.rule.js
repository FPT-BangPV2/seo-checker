// ./rules/robots.rule.js
class RobotsRule extends BaseRule {
  run(doc, result) {
    const meta = doc.querySelector('meta[name="robots"]');
    if (meta) {
      const content = meta.content.toLowerCase();
      this.addTag(result, "meta", "robots", content);
      if (content.includes("noindex")) {
        this.pushIssue(result, "head", this.severityMap.error, {
          title: "Noindex directive found",
          desc: "Prevents Google from indexing the page.",
          tag: "meta",
          elementKey: "meta:robots",
          display: content,
          suggestion: "Remove noindex if page should be indexed.",
          reference: "https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag",
        });
      }
    } else {
      this.pushIssue(result, "head", this.severityMap.warning, {
        title: "Missing meta robots",
        desc: "Controls crawling and indexing.",
        tag: "meta",
        elementKey: "meta:robots",
        display: "robots",
        suggestion: 'Add <meta name="robots" content="index, follow"> if needed.',
        reference: "https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag",
      });
    }
  }
}
