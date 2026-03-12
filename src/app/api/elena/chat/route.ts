import { NextRequest, NextResponse } from 'next/server';
import { readFile, access, mkdir } from 'fs/promises';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data');
const CONFIG_FILE = join(DATA_DIR, 'assistant-config.json');
const KNOWLEDGE_FILE = join(DATA_DIR, 'knowledge.json');
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

const DEFAULT_CONFIG = {
  name: 'Elena',
  title: 'Asistente Virtual',
  welcomeMessage: '¡Hola! ¿En qué puedo ayudarte?',
  headerColor: '#0077B6',
  buttonColor: '#0077B6',
  buttonIcon: 'message-circle',
  avatar: 'woman-doctor',
  position: 'bottom-right',
  isActive: true
};

type ChatRole = 'system' | 'user' | 'assistant';
type ChatMessage = { role: ChatRole; content: string };

const conversations = new Map<string, ChatMessage[]>();

async function ensureDataDir() {
  try {
    await access(DATA_DIR);
  } catch {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

async function getConfig() {
  try {
    const data = await readFile(CONFIG_FILE, 'utf-8');
    return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

async function getKnowledge() {
  try {
    const data = await readFile(KNOWLEDGE_FILE, 'utf-8');
    const knowledge = JSON.parse(data);
    return knowledge?.content?.trim() || '';
  } catch {
    return '';
  }
}

function buildSystemPrompt(name: string, knowledge: string): string {
  let prompt = `Eres ${name}, la asistente virtual oficial de la Clínica Dental Sonrisa Perfecta.

OBJETIVO:
Responder dudas de pacientes, explicar servicios, horarios, formas de pago, ubicación y ayudar a que agenden una cita.

ESTILO:
- Habla siempre en español de México.
- Sé amable, cálida, profesional y clara.
- Responde de forma natural, no robótica.
- Da respuestas útiles y concretas.
- No inventes información.

REGLAS IMPORTANTES:
- Usa primero la base de conocimiento proporcionada.
- Si falta un dato, dilo con honestidad.
- Si no sabes algo, invita al paciente a contactar por WhatsApp al 55 1748 9261.
- Cuando el usuario quiera reservar, reagendar o cancelar, indícale que use el botón o formulario de cita del sitio.
- No prometas descuentos, horarios, doctores o tratamientos que no aparezcan en la base de conocimiento.
- Si el usuario pregunta varias cosas, contesta todo en orden.
- Puedes usar emojis con moderación cuando ayuden a que la respuesta se vea amable.

DATOS FIJOS DEL NEGOCIO:
- Teléfono: 55 1748 9261
- WhatsApp: +52 55 1748 9261
- Dirección: Jacarandas 54, Col. Ahuehuetes, Tlalnepantla, Estado de México, CP 54150
- Moneda: MXN (pesos mexicanos)`;

  if (knowledge) {
    prompt += `\n\nBASE DE CONOCIMIENTO DE LA CLÍNICA:\n${knowledge}`;
  }

  return prompt;
}

function toGeminiContents(messages: ChatMessage[]) {
  const history = messages.filter((msg) => msg.role !== 'system');

  return history.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));
}

async function callGemini(messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Falta la variable GEMINI_API_KEY');
  }

  const systemMessage = messages.find((msg) => msg.role === 'system')?.content || '';
  const contents = toGeminiContents(messages);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemMessage }]
        },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500
        }
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || '').join('').trim();

  if (!text) {
    throw new Error('Gemini no devolvió texto');
  }

  return text;
}

function getSmartResponse(message: string, assistantName: string, knowledge: string): string {
  const lowerMessage = message.toLowerCase();

  if (knowledge && knowledge.length > 0) {
    const sections = knowledge.split('\n\n');
    const keywords = lowerMessage.split(/\s+/).filter((w) => w.length > 3);

    let bestSection = '';
    let maxMatches = 0;

    for (const section of sections) {
      const sectionLower = section.toLowerCase();
      let matches = 0;

      for (const keyword of keywords) {
        if (sectionLower.includes(keyword)) matches++;
      }

      if (matches > maxMatches) {
        maxMatches = matches;
        bestSection = section;
      }
    }

    if (maxMatches >= 1 && bestSection) {
      return `${bestSection}\n\nSi quieres, también puedo ayudarte a agendar tu cita. 🦷`;
    }
  }

  if (lowerMessage.match(/hola|buenos d[ií]as|buenas|hey/)) {
    return `¡Hola! 👋 Soy ${assistantName}, asistente de Clínica Dental Sonrisa Perfecta.\n\nPuedo ayudarte con tratamientos, precios, ubicación, horarios y citas. ¿Qué deseas saber?`;
  }

  if (lowerMessage.includes('cita') || lowerMessage.includes('agendar')) {
    return 'Para agendar tu cita, usa el botón o formulario de la página. Si prefieres apoyo directo, también puedes escribir por WhatsApp al 55 1748 9261. 📅';
  }

  return `Soy ${assistantName}. Con gusto te ayudo con información de la clínica, tratamientos, horarios, pagos o citas. También puedes escribir por WhatsApp al 55 1748 9261. 🦷`;
}

export async function POST(req: NextRequest) {
  try {
    await ensureDataDir();

    const body = await req.json();
    const message = body?.message?.trim();
    const sessionId = body?.sessionId?.trim() || 'default-session';

    if (!message) {
      return NextResponse.json({ error: 'Mensaje requerido' }, { status: 400 });
    }

    const [config, knowledge] = await Promise.all([getConfig(), getKnowledge()]);
    const systemPrompt = buildSystemPrompt(config.name, knowledge);

    let history = conversations.get(sessionId) || [];

    if (history.length === 0) {
      history.push({ role: 'system', content: systemPrompt });
    } else {
      history[0] = { role: 'system', content: systemPrompt };
    }

    history.push({ role: 'user', content: message });

    let response = '';
    let usedAI = false;
    let provider = 'fallback';

    try {
      response = await callGemini(history);
      usedAI = true;
      provider = 'gemini';
    } catch (aiError: any) {
      console.error('Gemini error, usando respaldo local:', aiError?.message || aiError);
      response = getSmartResponse(message, config.name, knowledge);
    }

    history.push({ role: 'assistant', content: response });

    if (history.length > 20) {
      history = [history[0], ...history.slice(-19)];
    }

    conversations.set(sessionId, history);

    return NextResponse.json({
      response,
      assistantName: config.name,
      usedAI,
      provider,
      model: usedAI ? GEMINI_MODEL : 'fallback'
    });
  } catch (error: any) {
    console.error('Chat error:', error);

    return NextResponse.json(
      {
        response: 'Lo siento, hubo un problema al responder. Revisa la configuración de Gemini o contacta por WhatsApp al 55 1748 9261.',
        usedAI: false,
        provider: 'error'
      },
      { status: 500 }
    );
  }
}
