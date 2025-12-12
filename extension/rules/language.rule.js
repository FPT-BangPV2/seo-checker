// ./rules/language.rule.js
class LanguageRule extends BaseRule {
  run(doc, result) {
    console.log("LanguageRule result::", result);

    const lang = doc.documentElement.getAttribute("lang");
    if (!lang) {
      this.pushIssue(result, "head", this.severityMap.warning, {
        title: "Missing lang attribute",
        desc: "Specifies page language for accessibility and SEO.",
        tag: "html",
        elementKey: "lang",
        display: "html:lang",
        suggestion: 'Add <html lang="en"> or appropriate code.',
        reference: "https://developers.google.com/search/docs/advanced/guidelines/language-of-page",
      });
    } else {
      this.addTag(result, "html", "lang", lang);
    }
  }
}
