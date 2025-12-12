class TitleRule extends BaseRule {
  run(doc, result) {
    const metaTitle = doc.querySelector("title");
    if (!metaTitle || !metaTitle.textContent.trim()) {
      this.pushIssue(result, "head", this.severityMap.error, {
        title: "Missing <title> tag",
        desc: "The title tag is crucial for SEO as it defines the page title in search results.",
        tag: "title",
        elementKey: "title",
        display: "h1",
        suggestion: "Add <title>Your Page Title</title> with 10-70 characters.",
        reference: "https://developers.google.com/search/docs/appearance/title-link",
      });
    } else {
      const text = metaTitle.textContent.trim();
      this.addTag(result, "title", "title", text);

      if (text.length < 10) {
        this.pushIssue(result, "head", this.severityMap.warning, {
          title: "Title too short",
          desc: "Titles under 10 characters may not effectively describe the page.",
          tag: "title",
          display: text,
          elementKey: "title",
          suggestion: "Extend title to at least 10 characters for better SEO.",
        });
      }
      if (text.length > 70) {
        this.pushIssue(result, "head", this.severityMap.warning, {
          title: "Title too long",
          desc: `${text.length} characters (recommended up to 70).`,
          tag: "title",
          display: text,
          elementKey: "title",
          suggestion: "Shorten title to 70 characters or less.",
        });
      }
    }
  }
}
