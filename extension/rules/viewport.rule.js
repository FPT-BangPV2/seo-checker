class ViewportRule extends BaseRule {
  run(doc, result) {
    const meta = doc.querySelector('meta[name="viewport"]');
    if (!meta) {
      this.pushIssue(result, "head", this.severityMap.error, {
        title: "Missing meta viewport",
        desc: "Viewport meta is essential for mobile responsiveness.",
        tag: 'meta[name="viewport"]',
        elementKey: "viewport",
        display: "viewport",
        suggestion: 'Add <meta name="viewport" content="width=device-width, initial-scale=1">.',
        reference:
          "https://developers.google.com/search/docs/crawling-indexing/mobile/mobile-sites-mobile-first-indexing",
      });
    } else {
      this.addTag(result, "meta", "viewport", meta.content);
    }
  }
}
