async function testQwen() {
  console.log('Sending test prompt to Ollama qwen2.5:7b-instruct at http://127.0.0.1:11434/api/generate ...');
  const start = Date.now();

  try {
    const res = await fetch('http://127.0.0.1:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen2.5:7b-instruct',
        prompt: 'You are an AI teaching assistant. Respond in one sentence: What is Booth multiplication?',
        stream: false,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`Ollama returned HTTP error ${res.status}:`, errText);
      return;
    }

    const data: any = await res.json();
    const elapsedSec = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`\nSuccess! Response received in ${elapsedSec}s:\n`);
    console.log(data.response);
  } catch (err: any) {
    console.error('Failed to communicate with Ollama:', err.message || err);
  }
}

testQwen();
