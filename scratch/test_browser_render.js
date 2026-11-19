const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('clo_system/web/index.html', 'utf8');

// Load in JSDOM with virtual console to capture ANY error
const virtualConsole = new jsdom.VirtualConsole();
const errors = [];
virtualConsole.on("error", (err) => {
  errors.push(err);
});
virtualConsole.on("jsdomError", (err) => {
  errors.push(err);
});
virtualConsole.on("warn", (w) => {
  console.log("Warn:", w);
});
virtualConsole.on("log", (l) => {
  console.log("Log:", l);
});

try {
  const dom = new JSDOM(html, {
    url: "http://localhost:8000/",
    runScripts: "dangerously",
    resources: "usable",
    virtualConsole
  });

  dom.window.addEventListener('load', () => {
    console.log("Page loaded!");
    console.log("Errors caught:", errors);
  });
} catch (e) {
  console.error("JSDOM initialization error:", e);
}

