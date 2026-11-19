const fs = require('fs');
const assert = require('assert');

// Mock DOM
const mockElements = {};
function createMockEl(id) {
  return {
    id,
    value: '',
    innerText: '',
    innerHTML: '',
    className: '',
    classList: {
      contains: () => false,
      add: () => {},
      remove: () => {}
    },
    getContext: () => ({})
  };
}

global.document = {
  getElementById: (id) => {
    if (!mockElements[id]) {
      mockElements[id] = createMockEl(id);
    }
    return mockElements[id];
  },
  addEventListener: () => {}
};
global.window = {
  scrollTo: () => {}
};
global.Chart = function() {
  this.destroy = () => {};
};

const stateJs = fs.readFileSync('clo_system/static/js/state.js', 'utf8');
const teacherJs = fs.readFileSync('clo_system/static/js/teacher_portal.js', 'utf8');

eval(stateJs + '; global.State = State;');
eval(teacherJs + '; global.TeacherPortal = TeacherPortal;');

console.log('🧪 Testing Teacher Authentication & Certificate Submission System...');

// 1. Test Login & Session Switch
TeacherPortal.init();
TeacherPortal.showLoginScreen();
assert.strictEqual(TeacherPortal.isAuthenticated, false);
console.log('✓ Teacher portal can switch to dedicated Login screen.');

TeacherPortal.quickSelectLogin('inst_yared_m');
TeacherPortal.loginAs('inst_yared_m');
assert.strictEqual(TeacherPortal.isAuthenticated, true);
assert.strictEqual(TeacherPortal.activeTeacherId, 'inst_yared_m');
console.log('✓ Quick login switches faculty account cleanly.');

// Switch back to Dr. Adimias
TeacherPortal.loginAs('inst_adimias_w');
assert.strictEqual(TeacherPortal.activeTeacherId, 'inst_adimias_w');

// 2. Test Certificate Portfolio
assert.ok(TeacherPortal.certificates.length >= 3, 'Must have at least 3 initial certificates');
assert.strictEqual(TeacherPortal.certificates[0].verified, true);

TeacherPortal.renderCertificatesList();
const certsHtml = document.getElementById('tp-certificates-list').innerHTML;
assert.ok(certsHtml.includes('Certified Operations Research Analyst'));
assert.ok(certsHtml.includes('Verified by Academic Commission'));
console.log('✓ Submitted certificates render with accreditation verification seals.');

// 3. Test Submitting a New Professional Certificate
document.getElementById('new-cert-title').value = 'Senior Optimization Fellowship 2026';
document.getElementById('new-cert-issuer').value = 'African Institute for Mathematical Sciences';
document.getElementById('new-cert-id').value = 'AIMS-OPT-2026';
document.getElementById('new-cert-date').value = '2026-05-10';

const initialCertCount = TeacherPortal.certificates.length;
TeacherPortal.submitNewCertificate();
assert.strictEqual(TeacherPortal.certificates.length, initialCertCount + 1);
assert.strictEqual(TeacherPortal.certificates[0].title, 'Senior Optimization Fellowship 2026');
assert.strictEqual(TeacherPortal.certificates[0].verified, true);
console.log('✓ New professional certificate submitted and verified by Academic Commission.');

// 4. Test Publications Dossier
assert.ok(TeacherPortal.publicationsList.length >= 2);
TeacherPortal.renderPublicationsList();
const pubHtml = document.getElementById('tp-publications-list').innerHTML;
assert.ok(pubHtml.includes('Dual Simplex Approaches'));

document.getElementById('new-pub-title').value = 'Deep Reinforcement Learning for Network Routing';
document.getElementById('new-pub-journal').value = 'IEEE Transactions on Network Science';
document.getElementById('new-pub-year').value = '2026';
document.getElementById('new-pub-doi').value = '10.1109/TNS.2026.112';

const initialPubCount = TeacherPortal.publicationsList.length;
TeacherPortal.submitNewPublication();
assert.strictEqual(TeacherPortal.publicationsList.length, initialPubCount + 1);
assert.strictEqual(TeacherPortal.publicationsList[0].title, 'Deep Reinforcement Learning for Network Routing');
console.log('✓ Research publication submitted and indexed into faculty dossier.');

console.log('\n🎉 ALL AUTHENTICATION & CERTIFICATE TESTS PASSED SUCCESSFULLY!');

