import { NextRequest, NextResponse } from 'next/server';
import { readFile, access, mkdir } from 'fs/promises';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data');
const CONFIG_FILE = join(DATA_DIR, 'assistant-config.json');
const KNOWLEDGE_FILE = join(DATA_DIR, 'knowledge.json');
// Google usa gemini-2.5-flash en su quickstart actual.
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

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
- Procura responder en menos de 150 tokens.
- No inventes información.

REGLAS IMPORTANTES:
- Usa primero la base de conocimiento proporcionada.
- Si falta un dato, dilo con honestidad.
- Si no sabes algo, invita al paciente a contactar por WhatsApp al 55 1748 9261.
- Cuando el usuario quiera reservar, reagendar o cancelar, indícale que use el botón o formulario de cita del sitio.
- No prometas descuentos, horarios, doctores o tratamientos que no aparezcan en la base de conocimiento.
- Si el usuario pregunta varias cosas, contesta todo en orden.
- Puedes usar emojis con moderación cuando ayuden a que la respuesta se vea amable.
- En el primer contacto, puedes pedir el nombre del usuario si ayuda a continuar la conversación.

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
  return messages
    .filter((msg) => msg.role !== 'system')
    .map((msg) => ({
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
          maxOutputTokens: 500,
          topP: 0.95
        }
      })
    }
  );

  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(`Gemini API error ${response.status}: ${rawText}`);
  }

  let data: any = {};
  try {
    data = JSON.parse(rawText);
  } catch {
    throw new Error(`Gemini devolvió JSON inválido: ${rawText}`);
  }

  const text = data?.candidates?.[0]?.content?.parts
    ?.map((part: { text?: string }) => part.text || '')
    .join('')
    .trim();

  if (!text) {
    const finishReason = data?.candidates?.[0]?.finishReason || 'sin finishReason';
    const promptFeedback = JSON.stringify(data?.promptFeedback || {});
    throw new Error(`Gemini no devolvió texto. finishReason=${finishReason}. promptFeedback=${promptFeedback}`);
  }

  return text;
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function findBestKnowledgeSection(message: string, knowledge: string): string {
  if (!knowledge) return '';

  const normalizedMessage = normalizeText(message);
  const keywords = normalizedMessage.split(' ').filter((word) => word.length >= 3);
  const sections = knowledge.split(/\n\n+/).map((s) => s.trim()).filter(Boolean);

  let bestSection = '';
  let bestScore = 0;

  for (const section of sections) {
    const normalizedSection = normalizeText(section);
    let score = 0;

    for (const keyword of keywords) {
      if (normalizedSection.includes(keyword)) score += 1;
    }

    if (score > bestScore) {
      bestScore = score;
      bestSection = section;
    }
  }

  return bestScore > 0 ? bestSection : '';
}

function getSmartResponse(message: string, assistantName: string, knowledge: string): string {
  const lowerMessage = normalizeText(message);

  if (/^(hola|holla|hello|buenas|buenos dias|buen dia|hey|que tal)$/.test(lowerMessage)) {
    return `¡Hola! 👋 Soy ${assistantName}. Con gusto te ayudo con tratamientos, precios, horarios, pagos y citas. Si deseas, también puedes decirme tu nombre para atenderte mejor. ¿Qué te gustaría saber?`;
  }

  if (lowerMessage.includes('servicio') || lowerMessage.includes('tratamiento')) {
    return `Claro. Estos son algunos servicios de la clínica: limpieza dental, blanqueamiento, diseño de sonrisa, ortodoncia invisible, implantes, carillas, endodoncia, periodoncia y odontopediatría. Si quieres, te explico el que te interese o te digo precios. 🦷`;
  }

  if (lowerMessage.includes('informacion') || lowerMessage.includes('información') || lowerMessage.includes('ubicacion') || lowerMessage.includes('direccion') || lowerMessage.includes('direccion')) {
    return `Con gusto. La clínica está en Jacarandas 54, Col. Ahuehuetes, Tlalnepantla, Estado de México. Atiende de lunes a viernes de 9:00 AM a 8:00 PM y sábados de 9:00 AM a 2:00 PM. Teléfono y WhatsApp: 55 1748 9261.`;
  }

  if (lowerMessage.includes('precio') || lowerMessage.includes('costa') || lowerMessage.includes('cuanto cuesta') || lowerMessage.includes('pago')) {
    return `Manejamos pago en efectivo, tarjetas, transferencia y financiamiento. Algunos precios base son: limpieza $500 MXN, blanqueamiento $5,000 MXN, endodoncia desde $3,500 MXN e implantes desde $18,000 MXN. Si quieres, te comparto el precio del tratamiento que te interesa.`;
  }

  if (lowerMessage.includes('cita') || lowerMessage.includes('agendar') || lowerMessage.includes('reservar') || lowerMessage.includes('reagendar') || lowerMessage.includes('cancelar')) {
    return 'Para agendar, reagendar o cancelar tu cita, usa el botón o formulario de la página. Si prefieres apoyo directo, también puedes escribir por WhatsApp al 55 1748 9261. 📅';
  }

  const bestSection = findBestKnowledgeSection(message, knowledge);
  if (bestSection) {
    return `${bestSection}\n\nSi quieres, también puedo ayudarte a resolver otra duda o a agendar tu cita. 🦷`;
  }

  return `Soy ${assistantName}. Con gusto te ayudo con información de la clínica, tratamientos, horarios, pagos o citas. También puedes escribir por WhatsApp al 55 1748 9261. 🦷`;
}

export async function GET() {
  try {
    await ensureDataDir();
    const config = await getConfig();
    return NextResponse.json(config);
  } catch {
    return NextResponse.json(DEFAULT_CONFIG);
  }
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
    let debugError = '';

    try {
      response = await callGemini(history);
      usedAI = true;
      provider = 'gemini';
    } catch (aiError: any) {
      debugError = aiError?.message || 'Error desconocido con Gemini';
      console.error('Gemini error, usando respaldo local:', debugError);
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
      model: usedAI ? GEMINI_MODEL : 'fallback',
      debugError: usedAI ? null : debugError
    });
  } catch (error: any) {
    console.error('Chat error:', error);

    return NextResponse.json(
      {
        response: 'Lo siento, hubo un problema al responder. Revisa la configuración de Gemini o contacta por WhatsApp al 55 1748 9261.',
        usedAI: false,
        provider: 'error',
        debugError: error?.message || 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
