import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function test() {
  try {
    const models = ['gemini-flash-latest', 'gemini-3.1-flash-lite', 'gemini-2.5-flash'];
    for (const m of models) {
      console.log(`Testing ${m}...`);
      try {
        const response = await ai.models.generateContent({
          model: m,
          contents: [{ role: 'user', parts: [{ text: 'Hello' }] }],
        });
        console.log(`Success: ${m}`);
      } catch (e: any) {
         console.log(`Error on ${m}:`, e?.message);
      }
    }
  } catch (error: any) {
    console.error('ERROR:', error);
  }
}
test();
