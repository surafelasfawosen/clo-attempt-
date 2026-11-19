const fs = require('fs');
const path = require('path');

// Extract all <script src="..."> from index.html
const html = fs.readFileSync('clo_system/web/index.html', 'utf8');
const scriptRegex = /<script\s+src="([^"]+)"/g;
const scripts = [];
let m;
while ((m = scriptRegex.exec(html)) !== null) {
  scripts.push(m[1].split('?')[0]);
}
console.log('Scripts in index.html:', scripts);

// Check if each script file exists and has valid syntax
scripts.forEach(s => {
  if (s.startsWith('http')) return;
  const p = path.join('clo_system/web', s);
  if (!fs.existsSync(p)) {
    console.error('MISSING SCRIPT:', p);
  } else {
    try {
      const code = fs.readFileSync(p, 'utf8');
      new Function(code);
      console.log('✓ Valid syntax:', s);
    } catch (e) {
      console.error('SYNTAX ERROR in ' + s + ':', e.message);
    }
  }
});

