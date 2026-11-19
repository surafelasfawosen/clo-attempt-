const fs = require('fs');
const html = fs.readFileSync('clo_system/web/index.html', 'utf8');

// Check container hierarchy
const lines = html.split('\n');
console.log('Total lines:', lines.length);

// Look for unclosed tags or syntax issues
const tags = ['div', 'main', 'section', 'header', 'aside', 'body', 'html'];
tags.forEach(t => {
  const openCount = (html.match(new RegExp('<' + t + '[ >]', 'gi')) || []).length;
  const closeCount = (html.match(new RegExp('</' + t + '>', 'gi')) || []).length;
  console.log(`Tag <${t}>: opened ${openCount}, closed ${closeCount}, diff: ${openCount - closeCount}`);
});

