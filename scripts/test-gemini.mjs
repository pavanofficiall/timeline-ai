import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) dotenv.config({ path: envPath });

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY missing');
    process.exit(1);
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  const models = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash-001',
  ];
  const prompt = 'Return JSON only: {"ok": true, "msg": "hello"}';
  for (const m of models) {
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const res = await model.generateContent([{ text: prompt }]);
      const text = res?.response?.text?.() || '';
      console.log('MODEL OK:', m, '\
RESPONSE:', text.slice(0, 200));
      return;
    } catch (e) {
      console.error('MODEL FAIL:', m, String(e?.message || e));
    }
  }
  process.exit(2);
}

main();
