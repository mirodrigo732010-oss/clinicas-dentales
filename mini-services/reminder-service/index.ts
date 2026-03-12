// Reminder Service - Servicio de recordatorios automáticos
// Este servicio se comunica con la API principal para procesar recordatorios

const PORT = 3005;
const MAIN_API = 'http://localhost:3000';

// Función para formatear número de teléfono a formato WhatsApp
function formatPhoneForWhatsApp(phone: string): string {
  // Limpiar el número
  let clean = phone.replace(/\D/g, '');
  // Si no tiene código de país, agregar 52 (México)
  if (clean.length === 10) {
    clean = '52' + clean;
  }
  return clean;
}

// Función para generar link de WhatsApp
function generateWhatsAppLink(phone: string, message: string): string {
  const formattedPhone = formatPhoneForWhatsApp(phone);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
}

// Obtener recordatorios pendientes de la API principal
async function getPendingReminders() {
  try {
    const response = await fetch(`${MAIN_API}/api/admin/reminders?status=pending`);
    const data = await response.json();
    return data.reminders || [];
  } catch (error) {
    console.error('Error obteniendo recordatorios:', error);
    return [];
  }
}

// Actualizar recordatorio en la API principal
async function updateReminder(id: string, data: { status: string; error?: string | null }) {
  try {
    await fetch(`${MAIN_API}/api/admin/reminders`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data })
    });
  } catch (error) {
    console.error('Error actualizando recordatorio:', error);
  }
}

// Procesar recordatorios pendientes
async function processReminders() {
  console.log(`[${new Date().toISOString()}] Verificando recordatorios pendientes...`);
  
  try {
    const reminders = await getPendingReminders();
    const now = new Date();
    
    // Filtrar recordatorios que ya debieron enviarse
    const dueReminders = reminders.filter((r: any) => {
      const scheduledFor = new Date(r.scheduledFor);
      return scheduledFor <= now;
    });

    if (dueReminders.length === 0) {
      return { processed: 0, reminders: [] };
    }

    console.log(`Encontrados ${dueReminders.length} recordatorios para procesar`);

    const results = [];

    for (const reminder of dueReminders) {
      const appointment = reminder.appointment;
      
      if (!appointment || !appointment.patientPhone) {
        await updateReminder(reminder.id, { status: 'failed', error: 'No hay teléfono registrado' });
        continue;
      }

      // Verificar que la cita siga confirmada
      if (appointment.status === 'cancelled') {
        await updateReminder(reminder.id, { status: 'cancelled', error: null });
        continue;
      }

      // Generar link de WhatsApp
      const whatsappLink = generateWhatsAppLink(appointment.patientPhone, reminder.message);
      
      // Actualizar el recordatorio a "ready" con el link
      await updateReminder(reminder.id, { status: 'ready', error: whatsappLink });

      results.push({
        id: reminder.id,
        patientName: appointment.patientName,
        patientPhone: appointment.patientPhone,
        type: reminder.type,
        whatsappLink,
        appointmentDate: appointment.date,
        appointmentTime: appointment.time
      });

      console.log(`Recordatorio ${reminder.type} listo para ${appointment.patientName}`);
    }

    return { processed: results.length, reminders: results };
  } catch (error) {
    console.error('Error procesando recordatorios:', error);
    throw error;
  }
}

// API Server
const server = Bun.serve({
  port: PORT,
  async fetch(request) {
    const url = new URL(request.url);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Health check
    if (url.pathname === '/health') {
      return Response.json({ status: 'ok', timestamp: new Date().toISOString() }, { headers: corsHeaders });
    }

    // Procesar recordatorios manualmente
    if (url.pathname === '/process' && request.method === 'POST') {
      try {
        const result = await processReminders();
        return Response.json(result, { headers: corsHeaders });
      } catch (error) {
        return Response.json({ error: 'Error procesando recordatorios' }, { status: 500, headers: corsHeaders });
      }
    }

    // Obtener estadísticas
    if (url.pathname === '/stats') {
      try {
        const response = await fetch(`${MAIN_API}/api/admin/reminders`);
        const data = await response.json();
        const reminders = data.reminders || [];
        
        const stats = {
          pending: reminders.filter((r: any) => r.status === 'pending').length,
          ready: reminders.filter((r: any) => r.status === 'ready').length,
          sent: reminders.filter((r: any) => r.status === 'sent').length,
          failed: reminders.filter((r: any) => r.status === 'failed').length,
        };
        
        return Response.json(stats, { headers: corsHeaders });
      } catch (error) {
        return Response.json({ error: 'Error obteniendo estadísticas' }, { status: 500, headers: corsHeaders });
      }
    }

    // Marcar como enviado
    if (url.pathname === '/mark-sent' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { id } = body as { id: string };
        
        await updateReminder(id, { status: 'sent', error: null });
        
        return Response.json({ success: true }, { headers: corsHeaders });
      } catch (error) {
        return Response.json({ error: 'Error actualizando recordatorio' }, { status: 500, headers: corsHeaders });
      }
    }

    // Obtener recordatorios listos para enviar
    if (url.pathname === '/ready') {
      try {
        const response = await fetch(`${MAIN_API}/api/admin/reminders?status=ready`);
        const data = await response.json();
        const reminders = data.reminders || [];
        
        // Formatear para el panel
        const formatted = reminders.map((r: any) => ({
          id: r.id,
          patientName: r.appointment?.patientName,
          patientPhone: r.appointment?.patientPhone,
          type: r.type,
          message: r.message,
          whatsappLink: r.error, // El link está guardado aquí temporalmente
          scheduledFor: r.scheduledFor,
          appointmentDate: r.appointment?.date,
          appointmentTime: r.appointment?.time
        }));
        
        return Response.json({ reminders: formatted }, { headers: corsHeaders });
      } catch (error) {
        return Response.json({ error: 'Error obteniendo recordatorios' }, { status: 500, headers: corsHeaders });
      }
    }

    return Response.json({ error: 'Not found' }, { status: 404, headers: corsHeaders });
  }
});

// Ejecutar verificación cada minuto
setInterval(async () => {
  try {
    await processReminders();
  } catch (error) {
    console.error('Error en verificación automática:', error);
  }
}, 60000); // Cada 1 minuto

// Ejecutar una vez al inicio
setTimeout(() => {
  processReminders().catch(console.error);
}, 5000); // Esperar 5 segundos a que la API principal esté lista

console.log(`🔔 Reminder Service corriendo en puerto ${PORT}`);
