/**
 * cleanup_login_and_modals.js
 * 1. Cleans modals.html: Removes 1234dbu mention and emojis from modal icons.
 * 2. Cleans teacher_portal.js: Updates login error messages to not reveal default password.
 */

const fs = require('fs');
const path = require('path');

// 1. Clean modals.html
const modalsPath = path.join(__dirname, '../clo_system/templates/teacher/modals.html');
let modalsHtml = fs.readFileSync(modalsPath, 'utf8');

modalsHtml = modalsHtml.replace(
  'You are currently using the default university initial password (<span class="font-mono font-bold bg-amber-100 px-1 py-0.5 rounded">1234dbu</span>). DBU security policy requires changing to a personalized password before proceeding to your workspace.',
  'DBU institutional security policy requires setting a personalized password upon first login before proceeding to your workspace.'
);

modalsHtml = modalsHtml.replace(
  'placeholder="Enter current password (1234dbu)"',
  'placeholder="Enter current password"'
);

// Replace emoji in revision modal with SVG
modalsHtml = modalsHtml.replace(
  `<div class="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center text-lg font-bold border border-amber-200">
          ↩️
        </div>`,
  `<div class="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center text-sm font-bold border border-amber-200">
          <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
        </div>`
);

fs.writeFileSync(modalsPath, modalsHtml, 'utf8');
console.log('✓ Cleaned modals.html (no default password leak, no emojis)');

// 2. Clean teacher_portal.js error messages
const portalJsPath = path.join(__dirname, '../clo_system/static/js/teacher_portal.js');
let portalJs = fs.readFileSync(portalJsPath, 'utf8');

portalJs = portalJs.replace(
  'errEl.innerText = "Invalid credentials. Default initial password is: 1234dbu";',
  'errEl.innerText = "Invalid institutional credentials. Please check your ID and password.";'
);

portalJs = portalJs.replace(
  'errEl.innerText = "Please choose a personal password different from the initial default (1234dbu).";',
  'errEl.innerText = "Please choose a secure personal password different from your previous password.";'
);

fs.writeFileSync(portalJsPath, portalJs, 'utf8');
console.log('✓ Cleaned teacher_portal.js (no default password leak in error messages)');

