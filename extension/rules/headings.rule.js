class HeadingsRule extends BaseRule {
  run(doc, result) {
    const h1s = doc.querySelectorAll("h1");
    if (h1s.length === 0) {
      this.pushIssue(result, "body", this.severityMap.error, {
        title: "Missing H1 tag",
        desc: "H1 is important for page structure and SEO.",
        tag: "h1",
        elementKey: "headings:h1",
        display: "h1",
        suggestion: "Add one <h1>Main Heading</h1>.",
        reference: "https://developers.google.com/search/docs/appearance/heading-tags",
      });
    }
    if (h1s.length > 1) {
      this.pushIssue(result, "body", this.severityMap.error, {
        title: `Multiple H1 tags (${h1s.length})`,
        desc: "Pages should have only one H1 for clear hierarchy.",
        tag: "h1",
        elementKey: "headings:h1",
        display: "h1",
        suggestion: "Use only one H1; downgrade others to H2 or lower.",
      });
    }
    let lastLevel = 0;
    doc.querySelectorAll("h1,h2,h3,h4,h5,h6").forEach((h) => {
      const level = parseInt(h.tagName[1]);
      if (lastLevel > 0 && level > lastLevel + 1) {
        this.pushIssue(result, "body", this.severityMap.warning, {
          title: `Skipped heading level: H${lastLevel} to H${level}`,
          desc: "Headings should follow sequential order for accessibility and SEO.",
          tag: `h${level}`,
          elementKey: "headings:skip",
          display: `H${level}`,
          suggestion: "Ensure headings are in order without skips.",
        });
      }
      lastLevel = level;
    });
  }
}
