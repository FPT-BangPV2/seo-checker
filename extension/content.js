class SEOTagScanner {
  constructor() {
    this.rules = [
      new TitleRule(),
      new DescriptionRule(),
      new RobotsRule(),
      new CanonicalRule(),
      new OpenGraphRule(),
      new ViewportRule(),
      new FaviconRule(),
      new LanguageRule(),
      new HeadingsRule(),
      new ImagesRule(),
      new DuplicatesRule(),
      new StructuredDataRule(),
    ];
  }
  scan() {
    const result = {
      url: location.href.split("?")[0].split("#")[0],
      timestamp: new Date().toISOString(),
      summary: { errors: 0, warnings: 0 },
      head: { errors: [], warnings: [], tags: [] },
      body: { errors: [], warnings: [] },
      duplicates: [],
      images: [],
    };

    this.rules.forEach((rule) => rule.run(document, result));

    result.summary.errors = result.head.errors.length + result.body.errors.length;
    result.summary.warnings = result.head.warnings.length + result.body.warnings.length;
    return result;
  }
}

const scanner = new SEOTagScanner();

function performScan() {
  const result = scanner.scan();
  Highlighter.apply(result);

  // Send result to background script
  chrome.runtime.sendMessage({
    action: "scanComplete",
    data: result,
  });

  console.log("[SEO Tag Inspector] Scan completed:", result.summary);
}

// Listen for messages from popup/background
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "runScan") {
    performScan();
    sendResponse({ success: true });
  }
});
