class DuplicatesRule extends BaseRule {
  run(doc, result) {
    const seen = new Map();
    const selector = "head meta, head link"; // Broader: all meta and link tags in head
    doc.querySelectorAll(selector).forEach((el) => {
      let key =
        el.getAttribute("name") ||
        el.getAttribute("property") ||
        el.getAttribute("rel") ||
        el.getAttribute("http-equiv") ||
        el.tagName.toLowerCase();
      const value =
        el.getAttribute("content") || el.getAttribute("href") || el.textContent?.trim() || "";
      if (!key) return;
      const id = `${key}:${value}`;
      if (seen.has(id)) {
        const count = seen.get(id) + 1;
        seen.set(id, count);
        if (count === 2) {
          // Only push once when first duplicate detected
          result.duplicates.push({ name: key, value, count });
          this.pushIssue(result, "head", this.severityMap.error, {
            title: `Duplicate ${key}`,
            desc: `Appears ${count} times with value: "${value}".`,
            tag: el.tagName.toLowerCase(),
            elementKey: id,
            display: value,
            suggestion: "Remove duplicate tags to prevent parsing issues and SEO penalties.",
            reference:
              "https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls",
          });
        } else {
          // Update count in existing duplicate entry
          const dupe = result.duplicates.find((d) => d.name === key && d.value === value);
          if (dupe) dupe.count = count;
          // Update issue desc
          const issue = result.head.errors.find((i) => i.elementKey === id);
          if (issue) issue.desc = `Appears ${count} times with value: "${value}".`;
        }
      } else {
        seen.set(id, 1);
      }
    });
  }
}
