import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, access, mkdir } from 'fs/promises';
import { join } from 'path';

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

INFORMACIÓN DE CONTACTO:
- Teléfono: 5517489261
- Dirección: Jacarandas 54 Col. Ahuehuetes, Tlalnepantla, Edo. Méx. CP 54150
- WhatsApp: +52 55 1748 9261

REGLAS:
1. Saluda de manera cálida y profesional
2. Usa tono cercano y empático
3. Sé concisa pero completa
4. USA LA BASE DE CONOCIMIENTO para responder con precisión
5. Si preguntan por ubicación, da la dirección completa
6. SIEMPRE responde basándote en la información de la BASE DE CONOCIMIENTO`;

  if (knowledge) {
    prompt += `\n\n📚 BASE DE CONOCIMIENTO (USA ESTA INFORMACIÓN PARA RESPONDER):\n${knowledge}`;
  }
  return prompt;
}

// Llamar a OpenAI API
async function callOpenAI(messages: Array<{ role: string; content: string }>) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  console.log('🔑 Verificando OPENAI_API_KEY:', apiKey ? 'Configurada (' + apiKey.substring(0, 10) + '...)' : 'NO CONFIGURADA');
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY no configurada en variables de entorno');
  }

  // Formatear mensajes para OpenAI
  const formattedMessages = [
    ...messages.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }))
  ];

  console.log('📤 Enviando a OpenAI:', formattedMessages.length, 'mensajes');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini', // Modelo económico y rápido
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ OpenAI API error:', response.status, errorText);
    throw new Error(`Error de OpenAI: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('✅ OpenAI response recibida');
  return data.choices?.[0]?.message?.content || 'No pude procesar eso.';
}

// POST - Chat
export async function POST(req: NextRequest) {
  try {
    const { message, sessionId } = await req.json();
    if (!message) {
      return NextResponse.json({ error: 'Mensaje requerido' }, { status: 400 });
    }

    console.log('📩 Mensaje recibido:', message);

    const [config, knowledge] = await Promise.all([getConfig(), getKnowledge()]);
    const systemPrompt = buildSystemPrompt(config.name, knowledge);

    let history = conversations.get(sessionId) || [];
    if (history.length === 0) {
      history.push({ role: 'assistant', content: systemPrompt });
    }
    history.push({ role: 'user', content: message });

    let response: string;
    
    try {
      // Intentar usar OpenAI
      console.log('🤖 Llamando a OpenAI...');
      response = await callOpenAI(history);
      console.log('✅ Respuesta de OpenAI:', response.substring(0, 100) + '...');
    } catch (aiError: any) {
      console.error('❌ AI Error:', aiError.message);
      
      // Si la IA falla, usar respuestas de respaldo
      console.log('🔄 Usando respuestas de respaldo...');
      response = getFallbackResponse(message, config.name, knowledge);
    }

    history.push({ role: 'assistant', content: response });
    if (history.length > 20) history = [history[0], ...history.slice(-18)];
    conversations.set(sessionId, history);

    return NextResponse.json({ response, assistantName: config.name });
  } catch (error: any) {
    console.error('❌ Chat error:', error);
    return NextResponse.json({ 
      response: 'Lo siento, hubo un error. Llama al 55 1748 9261 para atención inmediata.' 
    });
  }
}

// Respuestas de respaldo si la IA falla
function getFallbackResponse(message: string, assistantName: string, knowledge: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Buscar en la base de conocimiento
  if (knowledge) {
    const knowledgeLower = knowledge.toLowerCase();
    
    // Formas de pago
    if (lowerMessage.includes('pago') || lowerMessage.includes('tarjeta') || lowerMessage.includes('efectivo')) {
      if (knowledgeLower.includes('pago') || knowledgeLower.includes('tarjeta')) {
        const lines = knowledge.split('\n');
        let pagoInfo = '';
        let capturing = false;
        for (const line of lines) {
          if (line.toLowerCase().includes('pago') || line.toLowerCase().includes('tarjeta') || line.toLowerCase().includes('método')) {
            capturing = true;
          }
          if (capturing) {
            pagoInfo += line + '\n';
            if (line.trim() === '' && pagoInfo.length > 50) break;
          }
        }
        if (pagoInfo) {
          return `💳 **Formas de pago:**\n\n${pagoInfo}\n\n¿Tienes alguna otra duda?`;
        }
      }
    }
    
    // Buscar por palabras clave en el conocimiento
    const keywords = lowerMessage.split(' ').filter(w => w.length > 3);
    for (const keyword of keywords) {
      if (knowledgeLower.includes(keyword)) {
        const sections = knowledge.split('\n\n');
        for (const section of sections) {
          if (section.toLowerCase().includes(keyword)) {
            return `${section}\n\n¿Hay algo más en lo que pueda ayudarte?`;
          }
        }
      }
    }
  }
  
  // Respuestas por defecto
  if (lowerMessage.includes('pago') || lowerMessage.includes('tarjeta')) {
    return `💳 **Formas de pago:**\n\n• Efectivo\n• Tarjetas de crédito y débito (Visa, Mastercard, American Express)\n• Transferencia bancaria\n• Pagos a meses sin intereses con tarjetas participantes\n\n¿Necesitas más información?`;
  }
  
  if (lowerMessage.match(/hola|buenos d[ií]as|buenas/)) {
    return `¡Hola! 👋 Soy ${assistantName}, tu asistente de Clínica Dental Sonrisa Perfecta. ¿En qué puedo ayudarte?`;
  }
  
  if (lowerMessage.includes('precio') || lowerMessage.includes('costo')) {
    return `💰 **Precios:**\n\n• Valoración: GRATIS\n• Limpieza: $499 MXN\n• Blanqueamiento: $3,500 MXN\n\n¿Te gustaría más información?`;
  }
  
  if (lowerMessage.includes('ubicación') || lowerMessage.includes('dirección') || lowerMessage.includes('dónde')) {
    return `📍 **Ubicación:**\n\nJacarandas 54, Col. Ahuehuetes\nTlalnepantla, Edo. Méx. CP 54150\n\n📞 Llámanos: 55 1748 9261`;
  }
  
  if (lowerMessage.includes('horario')) {
    return `🕐 **Horarios:**\n\n• Lunes a Viernes: 9:00 AM - 8:00 PM\n• Sábados: 9:00 AM - 2:00 PM\n• Domingos: Cerrado`;
  }
  
  return `Gracias por tu mensaje. Soy ${assistantName}. Para atenderte mejor, llámanos al **55 1748 9261** o cuéntame qué necesitas y te ayudo con gusto.`;
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
