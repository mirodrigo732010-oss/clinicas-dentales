import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, access, mkdir } from 'fs/promises';
import { join } from 'path';
import ZAI from 'z-ai-web-dev-sdk';

const DATA_DIR = join(process.cwd(), 'data');
const CONFIG_FILE = join(DATA_DIR, 'assistant-config.json');
const KNOWLEDGE_FILE = join(DATA_DIR, 'knowledge.json');

// Default config
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

// In-memory conversations
const conversations = new Map<string, Array<{ role: string; content: string }>>();

// ZAI instance (se crea una vez)
let zaiInstance: any = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

// Helper functions
async function ensureDataDir() {
  try { await access(DATA_DIR); } catch { await mkdir(DATA_DIR, { recursive: true }); }
}

async function getConfig() {
  try {
    const data = await readFile(CONFIG_FILE, 'utf-8');
    return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
  } catch { return DEFAULT_CONFIG; }
}

async function saveConfig(config: any) {
  await ensureDataDir();
  await writeFile(CONFIG_FILE, JSON.stringify({ ...config, updatedAt: new Date().toISOString() }, null, 2));
}

async function getKnowledge() {
  try {
    const data = await readFile(KNOWLEDGE_FILE, 'utf-8');
    const knowledge = JSON.parse(data);
    return knowledge?.content?.trim() || '';
  } catch { return ''; }
}

function buildSystemPrompt(name: string, knowledge: string): string {
  let prompt = `Eres ${name}, un asistente virtual amable y profesional de la Clínica Dental Sonrisa Perfecta.

INFORMACIÓN IMPORTANTE:
- Teléfono: 5517489261
- WhatsApp: +52 55 1748 9261
- Dirección: Jacarandas 54 Col. Ahuehuetes, Tlalnepantla, Edo. Méx. CP 54150
- Moneda: MXN (Pesos Mexicanos)

INSTRUCCIONES:
1. Saluda de manera cálida y profesional
2. USA LA BASE DE CONOCIMIENTO para responder con información precisa
3. Si no sabes algo, ofrece conectar por WhatsApp: 55 1748 9261
4. Sé amable, concisa y útil
5. Responde en español de México`;

  if (knowledge) {
    prompt += `\n\n=== BASE DE CONOCIMIENTO ===\n${knowledge}\n=== FIN DE BASE DE CONOCIMIENTO ===`;
  }
  return prompt;
}

// Llamar a la IA del SDK (Z.AI)
async function callAI(messages: Array<{ role: string; content: string }>): Promise<string> {
  try {
    const zai = await getZAI();
    
    const formattedMessages = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }));

    const response = await zai.chat.completions.create({
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices?.[0]?.message?.content || 'No pude procesar eso.';
  } catch (error: any) {
    console.error('AI SDK Error:', error);
    throw error;
  }
}

// POST - Chat
export async function POST(req: NextRequest) {
  try {
    const { message, sessionId } = await req.json();
    if (!message) {
      return NextResponse.json({ error: 'Mensaje requerido' }, { status: 400 });
    }

    const [config, knowledge] = await Promise.all([getConfig(), getKnowledge()]);
    const systemPrompt = buildSystemPrompt(config.name, knowledge);

    let history = conversations.get(sessionId) || [];
    if (history.length === 0) {
      history.push({ role: 'assistant', content: systemPrompt });
    }
    history.push({ role: 'user', content: message });

    let response: string;
    let usedAI = false;
    
    try {
      response = await callAI(history);
      usedAI = true;
    } catch (aiError: any) {
      console.error('AI Error, usando respaldo:', aiError.message);
      response = getSmartResponse(message, config.name, knowledge);
    }

    history.push({ role: 'assistant', content: response });
    if (history.length > 20) history = [history[0], ...history.slice(-18)];
    conversations.set(sessionId, history);

    return NextResponse.json({ response, assistantName: config.name, usedAI });
  } catch (error: any) {
    console.error('Chat error:', error);
    return NextResponse.json({ 
      response: 'Lo siento, hubo un error. Llama al 55 1748 9261 para atención inmediata.' 
    });
  }
}

// Respuestas inteligentes que usan la base de conocimiento
function getSmartResponse(message: string, assistantName: string, knowledge: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (knowledge && knowledge.length > 0) {
    const sections = knowledge.split('\n\n');
    const keywords = lowerMessage.split(/\s+/).filter(w => w.length > 3);
    
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
      return `${bestSection}\n\n¿Hay algo más en lo que pueda ayudarte? 🦷`;
    }
    
    // Búsquedas específicas
    if (lowerMessage.includes('servicio') || lowerMessage.includes('tratamiento') || lowerMessage.includes('ofrecen') || lowerMessage.includes('hacen')) {
      for (const section of sections) {
        const s = section.toLowerCase();
        if (s.includes('servicio') || s.includes('tratamiento') || s.includes('procedimiento')) {
          return `${section}\n\n¿Te interesa más información? 🦷`;
        }
      }
    }
    
    if (lowerMessage.includes('pago') || lowerMessage.includes('tarjeta')) {
      for (const section of sections) {
        const s = section.toLowerCase();
        if (s.includes('pago') || s.includes('tarjeta') || s.includes('método')) {
          return `${section}\n\n¿Tienes más dudas? 🦷`;
        }
      }
    }
  }
  
  // Respuestas por defecto
  if (lowerMessage.match(/hola|buenos d[ií]as|buenas|hey/)) {
    return `¡Hola! 👋 Soy ${assistantName}, tu asistente de Clínica Dental Sonrisa Perfecta.\n\n¿En qué puedo ayudarte? Puedo informarte sobre:\n• 🦷 Tratamientos y servicios\n• 💰 Precios y promociones\n• 📍 Ubicación y horarios\n• 📅 Agendar citas`;
  }
  
  if (lowerMessage.includes('servicio') || lowerMessage.includes('tratamiento') || lowerMessage.includes('ofrecen')) {
    return `🦷 **Nuestros servicios:**\n\n• Limpieza dental profesional\n• Blanqueamiento dental\n• Ortodoncia (brackets e invisible)\n• Implantes dentales\n• Endodoncia (tratamiento de conducto)\n• Extracciones\n• Coronas y carillas\n• Diseño de sonrisa\n\n¿Te interesa información sobre algún tratamiento específico?`;
  }
  
  if (lowerMessage.includes('precio') || lowerMessage.includes('costo') || lowerMessage.includes('cuánto')) {
    return `💰 **Precios (MXN):**\n\n• Valoración: GRATIS\n• Limpieza: $499 MXN\n• Blanqueamiento: $3,500 MXN\n• Ortodoncia: Desde $15,000 MXN\n\n🎉 Pregunta por nuestras promociones vigentes.\n\n¿Te gustaría agendar una valoración gratuita?`;
  }
  
  if (lowerMessage.includes('pago') || lowerMessage.includes('tarjeta')) {
    return `💳 **Formas de pago:**\n\n• Efectivo\n• Tarjetas de crédito y débito (Visa, Mastercard, American Express)\n• Transferencia bancaria\n• Meses sin intereses\n\n¿Necesitas más información?`;
  }
  
  if (lowerMessage.includes('sucursal') || lowerMessage.includes('ubicación') || lowerMessage.includes('dónde') || lowerMessage.includes('dirección')) {
    return `📍 **Ubicación:**\n\nJacarandas 54, Col. Ahuehuetes\nTlalnepantla, Edo. Méx. CP 54150\n\n📞 WhatsApp: 55 1748 9261\n\nPor ahora contamos con una sola sucursal. ¿Necesitas ayuda para llegar?`;
  }
  
  if (lowerMessage.includes('horario')) {
    return `🕐 **Horarios:**\n\n• Lunes a Viernes: 9:00 AM - 8:00 PM\n• Sábados: 9:00 AM - 2:00 PM\n• Domingos: Cerrado\n\n¿Te gustaría agendar una cita?`;
  }
  
  if (lowerMessage.includes('cita') || lowerMessage.includes('agendar')) {
    return `📅 **Para agendar tu cita:**\n\n1. Haz clic en el botón verde "Agendar Cita" en la página\n2. Selecciona fecha y hora\n3. Ingresa tus datos\n4. ¡Listo!\n\nO llámanos al **55 1748 9261** 📞`;
  }
  
  return `Gracias por tu mensaje. Soy ${assistantName} 🦷\n\nPuedo ayudarte con información sobre:\n• Tratamientos y servicios\n• Precios y promociones\n• Ubicación y horarios\n• Agendar citas\n\n¿En qué puedo ayudarte? O llámanos al **55 1748 9261** 📞`;
}

// GET - Get config
export async function GET() {
  try {
    const config = await getConfig();
    return NextResponse.json(config);
  } catch {
    return NextResponse.json(DEFAULT_CONFIG);
  }
}

// PUT - Update config
export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const config = {
      name: data.name || DEFAULT_CONFIG.name,
      title: data.title || DEFAULT_CONFIG.title,
      welcomeMessage: data.welcomeMessage || DEFAULT_CONFIG.welcomeMessage,
      headerColor: data.headerColor || DEFAULT_CONFIG.headerColor,
      buttonColor: data.buttonColor || DEFAULT_CONFIG.buttonColor,
      buttonIcon: data.buttonIcon || DEFAULT_CONFIG.buttonIcon,
      avatar: data.avatar || DEFAULT_CONFIG.avatar,
      position: data.position || DEFAULT_CONFIG.position,
      isActive: data.isActive ?? DEFAULT_CONFIG.isActive
    };
    
    await saveConfig(config);
    return NextResponse.json({ success: true, config, message: 'Guardado correctamente' });
  } catch (error) {
    console.error('Error saving config:', error);
    return NextResponse.json({ success: false, error: 'Error al guardar' }, { status: 500 });
  }
}
