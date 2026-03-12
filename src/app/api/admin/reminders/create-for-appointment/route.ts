import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Crear recordatorios automáticos para una cita
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { appointmentId } = body;

    if (!appointmentId) {
      return NextResponse.json({ error: 'ID de cita requerido' }, { status: 400 });
    }

    // Obtener la cita
    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId }
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 });
    }

    // Verificar que tenga teléfono
    if (!appointment.patientPhone) {
      return NextResponse.json({ error: 'La cita no tiene teléfono registrado' }, { status: 400 });
    }

    // Obtener configuración de recordatorios
    let config = await db.reminderConfig.findFirst();
    if (!config) {
      config = await db.reminderConfig.create({ data: {} });
    }

    if (!config.isActive) {
      return NextResponse.json({ message: 'Recordatorios desactivados', reminders: [] });
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
        .replace('{tratamiento}', appointment.treatment);
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
    const reminders = await Promise.all(
      remindersToCreate.map(data => 
        db.reminder.create({
          data,
          include: { appointment: true }
        })
      )
    );

    return NextResponse.json({ 
      message: `Se crearon ${reminders.length} recordatorios`,
      reminders 
    });
  } catch (error) {
    console.error('Error creating reminders:', error);
    return NextResponse.json({ error: 'Error al crear recordatorios' }, { status: 500 });
  }
}
