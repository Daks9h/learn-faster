import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const baseText = fs.readFileSync(path.resolve(__dirname, '../test.txt'), 'utf-8');

// Duplicate and augment to create a multi-section ~13,000-character lecture
const longTranscript = [
  '# Part I: Foundations of Binary Arithmetic and Hardware Multiplication\n' + baseText,
  '# Part II: Radix-4 Recoding, Bit-Pair Tables, and Multiplier Optimization\n' + baseText.replace(/Booth/g, 'Radix-4 Booth'),
  '# Part III: Floating Point Traps, Underflow Invariants, and Pipelined Accumulation\n' + baseText.replace(/Booth/g, 'IEEE 754 Floating-Point'),
  '# Part IV: Memory Hierarchy, Cache Locality, and Superscalar Scheduling Constraints\n' + baseText,
].join('\n\n');

async function testLongLecture() {
  console.log(`Sending long transcript (${longTranscript.length} characters) to test 2-stage chunking...`);
  const start = Date.now();

  try {
    const res = await fetch('http://localhost:8787/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: longTranscript }),
    });

    console.log(`HTTP Status: ${res.status}`);
    const data = await res.json();
    const elapsedSec = ((Date.now() - start) / 1000).toFixed(1);

    if (res.ok) {
      console.log(`\nSUCCESS in ${elapsedSec}s!`);
      console.log('Course Title:', data.courseTitle);
      console.log('Quick Takes:', data.quickTake?.length);
      console.log('Key Concepts count:', data.keyConcepts?.length);
      console.log('Exam Radar items:', data.examRadar?.length);
      console.log('Flashcards count:', data.flashcards?.length);
      console.log('Quiz questions count:', data.quiz?.length);
      console.log('Compression metrics:', data.compression);
    } else {
      console.error('Analysis failed:', data);
    }
  } catch (err: any) {
    console.error('Request error:', err.message || err);
  }
}

testLongLecture();
