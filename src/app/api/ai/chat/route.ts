import { NextResponse } from 'next/server';
import { extractFlashcards, fallbackChat, summarize } from '@/lib/ai/fallback';
import type { AiFlashcard } from '@/lib/ai/ai-client';

interface Body {
  task: 'chat' | 'summarize' | 'flashcards' | 'quiz';
  messages?: { role: 'user' | 'assistant'; content: string }[];
  text?: string;
}

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const SYSTEM_PROMPT = 'You are StudySphere, a concise, encouraging study assistant. Explain clearly and suggest next study actions.';
const MAX_TOKENS = 1024;

async function callGemini(messages: { role: 'user' | 'assistant'; content: string }[]): Promise<string> {
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  const res = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents,
      generationConfig: { maxOutputTokens: MAX_TOKENS, temperature: 0.4 }
    })
  });

  if (!res.ok) throw new Error(`Gemini error ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const hasProvider = Boolean(process.env.GEMINI_API_KEY);
  const userText = body.text ?? body.messages?.[body.messages.length - 1]?.content ?? '';

  if (hasProvider) {
    try {
      if (body.task === 'flashcards') {
        const reply = await callGemini([{
          role: 'user',
          content: 'Create up to 10 study flashcards from the text below. Return ONLY lines in the form "Question :: Answer", one per line, no preamble.\n\n' + userText
        }]);
        const flashcards: AiFlashcard[] = reply
          .split(/\r?\n/)
          .map((l) => l.split('::'))
          .filter((p) => p.length === 2)
          .map((p) => ({ front: p[0].trim(), back: p[1].trim() }))
          .filter((c) => c.front && c.back);
        return NextResponse.json({ flashcards, fallback: false });
      }

      const prompt = body.task === 'summarize' ? `Summarize for revision:\n\n${userText}` : userText;
      const history = (body.messages ?? []).slice(0, -1);
      const reply = await callGemini([...history, { role: 'user', content: prompt }]);
      return NextResponse.json({ reply, fallback: false });
    } catch {
      // fallback
    }
  }

  if (body.task === 'flashcards') {
    return NextResponse.json({ flashcards: extractFlashcards(userText), fallback: true });
  }
  if (body.task === 'summarize') {
    return NextResponse.json({ reply: summarize(userText), fallback: true });
  }
  return NextResponse.json({ reply: fallbackChat(userText), fallback: true });
}