class StructuredDataRule extends BaseRule {
  run(doc, result) {
    const hasJsonLd = doc.querySelector('script[type="application/ld+json"]');
    if (!hasJsonLd) {
      this.pushIssue(result, "head", this.severityMap.warning, {
        title: "Missing Structured Data (JSON-LD)",
        desc: "Enhances search results with rich snippets.",
        tag: "script",
        elementKey: "structured-data",
        display: "script:application/ld+json",
        suggestion: 'Add <script type="application/ld+json">{...}</script>.',
        reference:
          "https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data",
      });
    } else {
      this.addTag(result, "script", "application/ld+json", "Present");
      // Optionally parse and validate, but keep simple for now
    }
  }
}
