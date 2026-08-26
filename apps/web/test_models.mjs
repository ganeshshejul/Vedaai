import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

const modelsToTest = [
  'gemini-2.5-pro',
  'gemini-2.5-flash',
  'gemini-3.1-pro',
  'gemini-3.1-flash',
  'gemini-2.5-pro-preview',
  'gemini-2.0-flash'
];

async function run() {
  for (const model of modelsToTest) {
    try {
      console.log(`Testing ${model}...`);
      const response = await ai.models.generateContent({
          model: model,
          contents: "Say 'Hello' and nothing else."
      });
      console.log(`[SUCCESS] ${model}: ${response.text}`);
    } catch (e) {
      console.error(`[FAILED] ${model}: ${e.message}`);
    }
  }
}
run();
