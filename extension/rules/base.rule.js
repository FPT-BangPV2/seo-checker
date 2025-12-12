class BaseRule {
  constructor() {
    this.severityMap = {
      error: "error", // Critical: Must fix, affects indexing or core functionality.
      warning: "warning", // Optimization: Recommended, affects performance or best practices.
    };
  }

  // Standardized push method for consistency.
  pushIssue(result, section, severity, issue) {
    const group = severity === this.severityMap.error ? "errors" : "warnings";
    result[section][group].push({
      ...issue,
      severity,
      suggestion: issue.suggestion || "Follow Google SEO guidelines.",
      reference: issue.reference || "https://developers.google.com/search/docs",
    });
  }

  addTag(result, type, name, value, href = "") {
    result.head.tags.push({ type, name, value: value?.trim() || "", href });
  }

  // Each rule must implement run(doc, result)
  run() {
    throw new Error("Rule must implement run method.");
  }
}
