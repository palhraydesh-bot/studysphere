async function callGemini(messages: { role: 'user' | 'assistant'; content: string }[]): Promise<string> {
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  console.log("GEMINI KEY:", !!process.env.GEMINI_API_KEY);

  const res = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents,
      generationConfig: {
        maxOutputTokens: MAX_TOKENS,
        temperature: 0.4
      }
    })
  });

  console.log("STATUS:", res.status);

  const data = await res.json();

  console.log("DATA:", JSON.stringify(data));

  if (!res.ok) {
    throw new Error(`Gemini error ${res.status}`);
  }

  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}