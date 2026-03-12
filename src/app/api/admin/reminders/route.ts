import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener todos los recordatorios
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (date) {
      // Filtrar por fecha de la cita
      where.appointment = { date };
    }

    const reminders = await db.reminder.findMany({
      where,
      include: {
        appointment: true
      },
      orderBy: { scheduledFor: 'asc' }
    });

    // Obtener configuración
    let config = await db.reminderConfig.findFirst();
    if (!config) {
      config = await db.reminderConfig.create({
        data: {}
      });
    }

    return NextResponse.json({ reminders, config });
  } catch (error) {
    console.error('Error fetching reminders:', error);
    return NextResponse.json({ error: 'Error al obtener recordatorios' }, { status: 500 });
  }
}

// POST - Crear recordatorio manual o actualizar configuración
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Si es para actualizar configuración
    if (body.updateConfig) {
      const config = await db.reminderConfig.update({
        where: { id: body.configId },
        data: {
          isActive: body.isActive,
          reminder24hEnabled: body.reminder24hEnabled,
          reminder2hEnabled: body.reminder2hEnabled,
          reminder1hEnabled: body.reminder1hEnabled,
          whatsappTemplate: body.whatsappTemplate,
          smsTemplate: body.smsTemplate,
          clinicPhone: body.clinicPhone,
          clinicName: body.clinicName,
        }
      });
      return NextResponse.json({ config });
    }

    // Crear recordatorio manual
    const { appointmentId, type, channel, message, scheduledFor } = body;
    
    const reminder = await db.reminder.create({
      data: {
        appointmentId,
        type,
        channel: channel || 'whatsapp',
        message,
        scheduledFor: new Date(scheduledFor),
      },
      include: { appointment: true }
    });

    return NextResponse.json({ reminder });
  } catch (error) {
    console.error('Error creating reminder:', error);
    return NextResponse.json({ error: 'Error al crear recordatorio' }, { status: 500 });
  }
}

// PUT - Marcar recordatorio como enviado
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, error } = body;

    const reminder = await db.reminder.update({
      where: { id },
      data: {
        status,
        sentAt: status === 'sent' ? new Date() : null,
        error: error || null
      }
    });

    return NextResponse.json({ reminder });
  } catch (error) {
    console.error('Error updating reminder:', error);
    return NextResponse.json({ error: 'Error al actualizar recordatorio' }, { status: 500 });
  }
}

// DELETE - Cancelar/eliminar recordatorio
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    await db.reminder.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    return NextResponse.json({ error: 'Error al eliminar recordatorio' }, { status: 500 });
  }
}
