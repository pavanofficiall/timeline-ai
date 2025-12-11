import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load .env.local if present
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

async function main() {
  const { extractStructuredData } = await import('../backend/services/aiExtractor');

  // If a text file is passed, read it; else use a synthetic text
  const arg = process.argv[2];
  let text: string;
  if (arg && fs.existsSync(arg)) {
    text = fs.readFileSync(arg, 'utf8');
  } else {
    text = `
On 2024-01-10, Alpha Pvt Ltd and Beta LLP executed a Master Service Agreement (MSA-2024.pdf).
On 2024-02-07, Beta LLP paid ₹2,50,000 to Alpha Pvt Ltd for Phase-1 (ref: NEFT-123).
On 2024-04-12, Alpha Pvt Ltd issued invoice INV-101.
On 2024-07-01, Beta LLP sent a breach notice due to missed milestones.
`;
  }

  console.log('GEMINI_API_KEY present:', Boolean(process.env.GEMINI_API_KEY));
  const start = Date.now();
  const result = await extractStructuredData(text);
  const dur = Date.now() - start;
  console.log('Duration ms:', dur);
  console.log(JSON.stringify(result, null, 2));
}

main().catch((e) => {
  console.error('test-extract failed:', e);
  process.exit(1);
});

