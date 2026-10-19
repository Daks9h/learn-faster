import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { GeminiProvider } from '../src/providers/GeminiProvider.js';
import { RawStudyMaterialSchema, normalizeConceptTags } from '../src/schema.js';

async function testDirect() {
  const transcript = fs.readFileSync(path.resolve(__dirname, '../test.txt'), 'utf-8');
  const provider = new GeminiProvider();
  console.log('Testing GeminiProvider directly with transcript...');
  const startTime = Date.now();
  try {
    const result = await provider.generateStudyMaterial(transcript);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`Generated in ${duration} seconds!`);
    console.log('Keys:', Object.keys(result as object));
    const obj = result as any;
    if (obj.quiz) {
      console.log(`Quiz generated! Count: ${obj.quiz.length} questions`);
      console.log('Sample quiz question:', JSON.stringify(obj.quiz[0], null, 2));
    } else {
      console.log('WARNING: quiz field missing in model output!');
    }
    const validation = RawStudyMaterialSchema.safeParse(result);
    console.log('RawStudyMaterialSchema validation result:', validation.success ? 'SUCCESS' : 'FAILED');
    if (!validation.success) {
      console.log('Validation errors:', validation.error.format());
    } else {
      const normalized = normalizeConceptTags(validation.data);
      console.log('Normalized concepts matched successfully. Quiz count in normalized data:', normalized.data?.quiz?.length);
    }
  } catch (err: any) {
    console.error('Provider failed:', err);
  }
}

testDirect();
