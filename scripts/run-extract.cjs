require('dotenv').config({ path: '.env.local' });
require('ts-node/register/transpile-only');

const fs = require('fs');
const path = require('path');

async function main() {
  const mod = require('../backend/services/aiExtractor.ts');
  // Register TS path aliases if needed by replacing import paths at runtime (simple shim)
  const Module = require('module');
  const originalRequire = Module.prototype.require;
  Module.prototype.require = function(id) {
    if (id === '../backend/lib/prompt') return require('../backend/lib/prompt.ts');
    return originalRequire.apply(this, arguments);
  };
  const { extractStructuredData } = mod;
  const arg = process.argv[2];
  let text;
  if (arg && fs.existsSync(arg)) {
    text = fs.readFileSync(arg, 'utf8');
  } else {
    text = `Missing Documents\nDocument Name Reason Missing Requested On\nID Proof Not submitted 2025-01-05\nAddress Proof Unreadable copy 2025-01-06\nIncome Certificate User did not upload 2025-01-07\n\nIdentified Parties\nParty Name Role Contact\nJohn Doe Primary Applicant +91 90000 11111\nJane Smith Co Applicant +91 90000 22222\nMark Wilson Guarantor +91 90000 33333\n\nPayments\nPayment ID Amount Status Date\nP001 ■10,000 Paid 2025-01-03\nP002 ■5,500 Pending 2025-01-04\nP003 ■2,750 Failed 2025-01-05`;
  }
  const res = await extractStructuredData(text);
  console.log(JSON.stringify(res, null, 2));
}

main().catch((e) => {
  console.error('run-extract failed:', e);
  process.exit(1);
});
