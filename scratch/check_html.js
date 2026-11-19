const fs = require('fs');
const html = fs.readFileSync('clo_system/web/index.html', 'utf-8');

const idRegex = /id="([^"]+)"/g;
let match;
const ids = {};
const dupes = [];
while ((match = idRegex.exec(html)) !== null) {
  const id = match[1];
  if (ids[id]) dupes.push(id);
  else ids[id] = true;
}
console.log('Duplicate IDs count:', dupes.length);
console.log('Duplicate IDs:', dupes);

