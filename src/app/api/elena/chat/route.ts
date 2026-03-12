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

// Respuestas inteligentes predefinidas para la demo
function getIntelligentResponse(message: string, assistantName: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Saludos
  if (lowerMessage.match(/hola|buenos d[ií]as|buenas tardes|buenas noches|hey|qu[eé] tal/)) {
    return `¡Hola! 👋 Bienvenido/a a Clínica Dental Sonrisa Perfecta. Soy ${assistantName}, tu asistente virtual. ¿En qué puedo ayudarte hoy? Puedo informarte sobre nuestros tratamientos, precios, horarios o ayudarte a agendar una cita.`;
  }
  
  // Tratamientos
  if (lowerMessage.match(/tratamiento|servicio|qu[eé] hacen|qu[eé] ofrecen/)) {
    return `🦷 **Nuestros tratamientos principales:**\n\n• **Limpieza dental** - Desde $499 MXN\n• **Blanqueamiento dental** - $3,500 MXN (20% descuento con código SONRISA20)\n• **Ortodoncia** - Desde $15,000 MXN\n• **Implantes dentales** - Desde $12,000 MXN\n• **Coronas y carillas** - Desde $4,500 MXN\n• **Endodoncia** - Desde $3,000 MXN\n• **Extracciones** - Desde $800 MXN\n\n¿Te gustaría más información sobre alguno?`;
  }
  
  // Precios
  if (lowerMessage.match(/precio|costo|cu[aá]nto|cobran|tarifa/)) {
    return `💰 **Precios accesibles:**\n\n• Consulta y valoración: **GRATIS**\n• Limpieza dental profesional: **$499 MXN**\n• Blanqueamiento: **$3,500 MXN**\n• Ortodoncia: Desde **$15,000 MXN**\n\n🎯 **Promoción especial:** 20% de descuento en blanqueamiento con el código **SONRISA20**\n\nTodos los precios en pesos mexicanos (MXN). ¿Te gustaría agendar una valoración gratuita?`;
  }
  
  // Ubicación
  if (lowerMessage.match(/ubicaci[oó]n|direcci[oó]n|d[oó]nde est[aá]n|mapa|llegar/)) {
    return `📍 **Nuestra ubicación:**\n\n🏥 Jacarandas 54, Col. Ahuehuetes\nTlalnepantla, Estado de México\nCP 54150\n\n🚗 Fácil acceso por Av. de los Arcos\n🅿️ Contamos con estacionamiento\n\n📱 Puedes ver el mapa exacto en la sección inferior de esta página web, o llamarnos al **55 1748 9261** para que te indiquemos cómo llegar.`;
  }
  
  // Horarios
  if (lowerMessage.match(/horario|hora|abren|cierran|atienden|disponible/)) {
    return `🕐 **Horarios de atención:**\n\n📅 **Lunes a Viernes:**\n• 9:00 AM - 2:00 PM (matutino)\n• 4:00 PM - 8:00 PM (vespertino)\n\n📅 **Sábados:**\n• 9:00 AM - 2:00 PM\n\n🚫 Domingos cerrado\n\n¿Te gustaría agendar una cita? ¡Haz clic en el botón "Agendar Cita" en la página!`;
  }
  
  // Cita / Agendar
  if (lowerMessage.match(/cita|agendar|reservar|programar|consulta/)) {
    return `📅 **¡Agendar tu cita es muy fácil!**\n\n1. Haz clic en el botón verde **"Agendar Cita"** que está en la parte superior de la página\n2. Selecciona la fecha y hora que prefieras\n3. Ingresa tus datos\n4. ¡Listo! Recibirás confirmación por WhatsApp\n\n📞 También puedes llamar al **55 1748 9261** o enviar WhatsApp al mismo número.\n\n✨ La valoración inicial es **COMPLETAMENTE GRATIS**`;
  }
  
  // WhatsApp / Contacto
  if (lowerMessage.match(/whatsapp|tel[eé]fono|contactar|llamar|numero|n[uú]mero/)) {
    return `📱 **Contacto directo:**\n\n📞 Teléfono: **55 1748 9261**\n💬 WhatsApp: **+52 55 1748 9261**\n📧 Email: contacto@sonrisaperfecta.mx\n\n¡Escríbenos por WhatsApp! Respondemos rápido y podemos enviarte fotos, ubicación y resolver todas tus dudas.`;
  }
  
  // Promociones
  if (lowerMessage.match(/promoci[oó]n|descuento|oferta|especial/)) {
    return `🎉 **Promociones vigentes:**\n\n✨ **20% DESCUENTO en blanqueamiento dental**\nUsa el código: **SONRISA20**\n\n✨ **Limpieza dental solo $499 MXN**\nCódigo: **LIMPIEZA499**\n\n✨ **Valoración GRATUITA**\nPrimera consulta sin costo\n\n📝 Menciona estos códigos al agendar tu cita. ¿Te gustaría aprovechar alguna?`;
  }
  
  // Doctor / Personal
  if (lowerMessage.match(/doctor|dentista|especialista|personal|qui[eé]n atiende/)) {
    return `👨‍⚕️ **Nuestro equipo:**\n\nContamos con dentistas altamente calificados con más de 15 años de experiencia en:\n• Odontología general\n• Ortodoncia\n• Endodoncia\n• Implantología\n• Cirugía oral\n\n🏥 Utilizamos tecnología de última generación y materiales de la más alta calidad.\n\n¿Te gustaría conocer más sobre algún tratamiento específico?`;
  }
  
  // Dolor / Urgencia
  if (lowerMessage.match(/dolor|urgencia|emergencia|duele|muel[aá]|infecci[oó]n/)) {
    return `⚠️ **Si tienes dolor dental, es importante atenderte pronto.**\n\n📞 Llámanos AHORA al **55 1748 9261** para atención prioritaria.\n\n💼 Ofrecemos citas de urgencia el mismo día.\n\n🏥 Estamos en Jacarandas 54, Col. Ahuehuetes, Tlalnepantla.\n\nNo dejes pasar el dolor, puede ser señal de algo más serio. ¡Contáctanos!`;
  }
  
  // Gracias
  if (lowerMessage.match(/gracias|muchas gracias|agradezco|genial|perfecto|excelente/)) {
    return `¡De nada! 😊 Fue un placer ayudarte. Recuerda que estamos para servirte:\n\n📞 **55 1748 9261**\n📍 Jacarandas 54, Col. Ahuehuetes, Tlalnepantla\n\n¡Que tengas excelente día! Si tienes más preguntas, aquí estaré. 🦷`;
  }
  
  // Adiós
  if (lowerMessage.match(/adi[oó]s|bye|hasta luego|nos vemos/)) {
    return `¡Hasta pronto! 👋 Fue un placer atenderte.\n\nRecuerda que en **Clínica Dental Sonrisa Perfecta** tu sonrisa es nuestra prioridad.\n\n📞 Cualquier duda: **55 1748 9261**\n\n¡Cuídate mucho! 🦷✨`;
  }
  
  // Respuesta por defecto
  return `Gracias por tu mensaje. Soy ${assistantName}, asistente de Clínica Dental Sonrisa Perfecta. 🦷\n\nPuedo ayudarte con:\n• 📅 Agendar citas\n• 💰 Precios y promociones\n• 📍 Ubicación y horarios\n• 🦷 Información de tratamientos\n\n¿En qué puedo ayudarte? También puedes llamarnos al **55 1748 9261** para atención personalizada.`;
}

// POST - Chat
export async function POST(req: NextRequest) {
  try {
    const { message, sessionId } = await req.json();
    if (!message) {
      return NextResponse.json({ error: 'Mensaje requerido' }, { status: 400 });
    }

    const config = await getConfig();
    
    // Usar respuestas inteligentes para la demo
    const response = getIntelligentResponse(message, config.name);

    return NextResponse.json({ response, assistantName: config.name });
  } catch (error: any) {
    console.error('Chat error:', error);
    return NextResponse.json({ 
      response: 'Lo siento, hubo un error. Por favor llama al 55 1748 9261 para atención inmediata.' 
    });
  }
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
