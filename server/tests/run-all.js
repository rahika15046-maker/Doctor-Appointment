// server/tests/run-all.js
// Test runner for all Medora hospital suite tests

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testFiles = [
  'collaborator1-patient-auth.test.js',
  'collaborator2-hospital-doctors-booking.test.js',
  'full-system.test.js'
];

async function runTest(file) {
  return new Promise((resolve) => {
    console.log(`\n======================================================`);
    console.log(` RUNNING: ${file}`);
    console.log(`======================================================`);
    const proc = spawn('node', [path.join(__dirname, file)], { stdio: 'inherit' });
    proc.on('close', (code) => {
      resolve({ file, passed: code === 0 });
    });
  });
}

async function main() {
  const results = [];
  for (const f of testFiles) {
    const res = await runTest(f);
    results.push(res);
  }

  console.log(`\n======================================================`);
  console.log(` ALL TEST SUITES SUMMARY`);
  console.log(`======================================================`);
  let allPassed = true;
  for (const r of results) {
    console.log(` ${r.passed ? '✓' : '✗'} ${r.file}: ${r.passed ? 'PASSED' : 'FAILED'}`);
    if (!r.passed) allPassed = false;
  }
  console.log(`======================================================`);
  if (!allPassed) {
    console.error('Some tests failed!');
    process.exit(1);
  } else {
    console.log('ALL TEST SUITES PASSED CLEANLY (100% SUCCESS)\n');
    process.exit(0);
  }
}

main();
