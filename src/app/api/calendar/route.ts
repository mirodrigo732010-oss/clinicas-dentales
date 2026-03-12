import { NextRequest, NextResponse } from 'next/server';
import { appointmentsApi, getAvailableSlots, getMexicoDate, checkAvailability } from '@/lib/db-adapter';
import { db } from '@/lib/db';

interface AppointmentRequest {
  name: string;
  phone: string;
  email?: string;
  date: string;
  time: string;
  treatment?: string;
  notes?: string;
}

// WhatsApp del doctor
const WHATSAPP_NUMBER = '5215517489261';

// Función para formatear fecha en español
function formatDateSpanish(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12, 0, 0);
  return date.toLocaleDateString('es-ES', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long',
    year: 'numeric'
  });
}

// Función para enviar notificación WhatsApp (genera el link)
function generateWhatsAppLink(data: { name: string; phone: string; date: string; time: string; treatment: string }) {
  const formattedDate = formatDateSpanish(data.date);
  const message = `🦷 *NUEVA CITA CONFIRMADA*

👤 *Paciente:* ${data.name}
📱 *Teléfono:* ${data.phone}
📅 *Fecha:* ${formattedDate}
🕐 *Hora:* ${data.time}
🦷 *Tratamiento:* ${data.treatment}

_Cita agendada desde la página web de Clínica Dental Sonrisa Perfecta_`;
  
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

// Función para crear recordatorios automáticos
async function createRemindersForAppointment(appointmentId: string, appointment: any) {
  try {
    // Obtener configuración de recordatorios
    let config = await db.reminderConfig.findFirst();
    if (!config) {
      config = await db.reminderConfig.create({ data: {} });
    }

    if (!config.isActive) {
      console.log('Recordatorios desactivados, no se crearán');
      return;
    }

    // Crear fecha y hora de la cita
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}:00`);
    
    // Función para formatear fecha
    const formatDate = (dateStr: string) => {
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
    };

    // Formatear hora
    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(':');
      const h = parseInt(hours);
      return `${h > 12 ? h - 12 : h}:${minutes} ${h >= 12 ? 'PM' : 'AM'}`;
    };

    // Preparar mensaje con plantilla
    const prepareMessage = (template: string) => {
      return template
        .replace('{nombre}', appointment.patientName)
        .replace('{fecha}', formatDate(appointment.date))
        .replace('{hora}', formatTime(appointment.time))
        .replace('{tratamiento}', appointment.treatment || 'Valoración inicial');
    };

    const remindersToCreate = [];

    // Recordatorio 24 horas antes
    if (config.reminder24hEnabled) {
      const scheduledFor = new Date(appointmentDateTime.getTime() - 24 * 60 * 60 * 1000);
      if (scheduledFor > new Date()) {
        remindersToCreate.push({
          appointmentId,
          type: '24h',
          scheduledFor,
          channel: 'whatsapp',
          message: prepareMessage(config.whatsappTemplate)
        });
      }
    }

    // Recordatorio 2 horas antes
    if (config.reminder2hEnabled) {
      const scheduledFor = new Date(appointmentDateTime.getTime() - 2 * 60 * 60 * 1000);
      if (scheduledFor > new Date()) {
        remindersToCreate.push({
          appointmentId,
          type: '2h',
          scheduledFor,
          channel: 'whatsapp',
          message: prepareMessage(config.whatsappTemplate)
        });
      }
    }

    // Recordatorio 1 hora antes
    if (config.reminder1hEnabled) {
      const scheduledFor = new Date(appointmentDateTime.getTime() - 1 * 60 * 60 * 1000);
      if (scheduledFor > new Date()) {
        remindersToCreate.push({
          appointmentId,
          type: '1h',
          scheduledFor,
          channel: 'whatsapp',
          message: prepareMessage(config.whatsappTemplate)
        });
      }
    }

    // Crear recordatorios
    if (remindersToCreate.length > 0) {
      await db.reminder.createMany({ data: remindersToCreate });
      console.log(`✅ Creados ${remindersToCreate.length} recordatorios para cita ${appointmentId}`);
    }
  } catch (error) {
    console.error('Error creando recordatorios:', error);
  }
}

// Create appointment
export async function POST(req: NextRequest) {
  try {
    const data: AppointmentRequest = await req.json();

    if (!data.name || !data.phone || !data.date || !data.time) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: nombre, teléfono, fecha y hora' },
        { status: 400 }
      );
    }

    // Validar formato de fecha
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.date)) {
      return NextResponse.json(
        { error: 'Formato de fecha inválido' },
        { status: 400 }
      );
    }

    // Validar que la fecha no sea anterior a hoy (usando zona horaria de México)
    const today = getMexicoDate();
    if (data.date < today) {
      return NextResponse.json(
        { error: 'No puedes agendar citas en fechas pasadas' },
        { status: 400 }
      );
    }

    // Check if slot is available
    const isAvailable = await checkAvailability(data.date, data.time);

    if (!isAvailable) {
      return NextResponse.json(
        { error: 'Este horario ya no está disponible. Por favor selecciona otro.' },
        { status: 400 }
      );
    }

    // Create appointment
    const appointment = await appointmentsApi.create({
      patientName: data.name,
      patientPhone: data.phone,
      patientEmail: data.email || '',
      date: data.date,
      time: data.time,
      treatment: data.treatment || 'Valoración inicial',
      status: 'confirmed',
      notes: data.notes || '',
    });

    console.log('✅ Appointment created:', appointment.id, data.date, data.time);

    // Crear recordatorios automáticos
    await createRemindersForAppointment(appointment.id, {
      patientName: data.name,
      date: data.date,
      time: data.time,
      treatment: data.treatment || 'Valoración inicial'
    });

    // Generar link de WhatsApp para notificación automática
    const whatsappLink = generateWhatsAppLink({
      name: data.name,
      phone: data.phone,
      date: data.date,
      time: data.time,
      treatment: data.treatment || 'Valoración inicial'
    });

    return NextResponse.json({
      success: true,
      appointment,
      message: 'Cita agendada exitosamente',
      whatsappLink, // Enviar link de WhatsApp al frontend
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Error al agendar la cita. Intenta de nuevo.' },
      { status: 500 }
    );
  }
}

// Get appointments or available slots
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const view = searchParams.get('view');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Doctor view: get all appointments for date
    if (view === 'doctor' && date) {
      const appointments = await appointmentsApi.getByDate(date);
      const activeAppointments = appointments.filter(
        (a: { status: string }) => a.status !== 'cancelled'
      );

      return NextResponse.json({ appointments: activeAppointments });
    }

    // Get appointments by date range (for calendar view)
    if (startDate && endDate) {
      const allAppointments = await appointmentsApi.getAll();
      const filteredAppointments = allAppointments.filter(
        (a: { date: string; status: string }) => 
          a.date >= startDate && a.date <= endDate && a.status !== 'cancelled'
      );

      return NextResponse.json({ appointments: filteredAppointments });
    }

    // Patient view: get available slots for a specific date
    if (date) {
      // Validar que la fecha no sea anterior a hoy
      const today = getMexicoDate();
      if (date < today) {
        return NextResponse.json({
          date,
          availableSlots: [],
          error: 'Fecha no válida',
        });
      }

      const availableSlots = await getAvailableSlots(date);

      return NextResponse.json({
        date,
        availableSlots,
        workingHours: {
          morning: '09:00 - 14:00',
          afternoon: '16:00 - 20:00',
        },
      });
    }

    // Default: get upcoming appointments
    const today = getMexicoDate();
    const allAppointments = await appointmentsApi.getAll();
    const upcomingAppointments = allAppointments
      .filter((a: { date: string; status: string }) => a.date >= today && a.status !== 'cancelled')
      .slice(0, 20);

    return NextResponse.json({ appointments: upcomingAppointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ 
      error: 'Error al obtener datos',
      availableSlots: [] 
    }, { status: 500 });
  }
}

// Update appointment status
export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'ID y estado requeridos' }, { status: 400 });
    }

    const appointment = await appointmentsApi.update(id, { status });

    return NextResponse.json({ success: true, appointment });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
  }
}

// Cancel appointment
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    const appointment = await appointmentsApi.update(id, { status: 'cancelled' });

    return NextResponse.json({ success: true, appointment });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    return NextResponse.json({ error: 'Error al cancelar' }, { status: 500 });
  }
}
