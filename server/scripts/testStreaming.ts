import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const baseText = fs.readFileSync(path.resolve(__dirname, '../test.txt'), 'utf-8');

async function testStreaming() {
  console.log(`Testing streaming analyze with ${baseText.length} chars...`);
  const start = Date.now();

  const res = await fetch('http://localhost:8787/api/analyze?stream=true', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-stream-progress': 'true',
    },
    body: JSON.stringify({ text: baseText }),
  });

  console.log(`HTTP Status: ${res.status}`);
  console.log(`Content-Type: ${res.headers.get('content-type')}`);

  const reader = res.body?.getReader();
  if (!reader) throw new Error('No reader');

  const decoder = new TextDecoder();
  let buffer = '';
  let finalResult = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n\n');
    buffer = lines.pop() || '';

    for (const block of lines) {
      if (block.startsWith('data:')) {
        const jsonStr = block.slice(5).trim();
        try {
          const event = JSON.parse(jsonStr);
          const elapsed = ((Date.now() - start) / 1000).toFixed(1);
          if (event.type === 'progress') {
            console.log(`[${elapsed}s] PROGRESS: ${event.percent}% - ${event.message}`);
          } else if (event.type === 'result') {
            console.log(`[${elapsed}s] RESULT RECEIVED! Course: "${event.data?.courseTitle}"`);
            finalResult = event.data;
          } else if (event.type === 'error') {
            console.error(`[${elapsed}s] ERROR:`, event.error);
          }
        } catch (e) {
          console.warn('Parse err:', jsonStr);
        }
      }
    }
  }

  const totalTime = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\nStream completed in ${totalTime}s!`);
  if (finalResult) {
    console.log(`Key Concepts: ${finalResult.keyConcepts?.length}`);
    console.log(`Exam Radar: ${finalResult.examRadar?.length}`);
    console.log(`Flashcards: ${finalResult.flashcards?.length}`);
    console.log(`Quiz: ${finalResult.quiz?.length}`);
    console.log(`Compression:`, finalResult.compression);
  }
}

testStreaming().catch(console.error);
