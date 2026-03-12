import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Inicializar disponibilidad del doctor si no existe
export async function GET() {
  try {
    // Verificar si ya hay disponibilidad configurada
    const existing = await db.doctorAvailability.findMany();
    
    if (existing.length > 0) {
      return NextResponse.json({ 
        message: 'La disponibilidad ya está configurada',
        availability: existing 
      });
    }

    // Crear disponibilidad por defecto
    // 0 = Domingo, 1 = Lunes, 2 = Martes, 3 = Miércoles, 4 = Jueves, 5 = Viernes, 6 = Sábado
    const defaultAvailability = [
      { dayOfWeek: 1, startTime: '09:00', endTime: '20:00', isActive: true }, // Lunes
      { dayOfWeek: 2, startTime: '09:00', endTime: '20:00', isActive: true }, // Martes
      { dayOfWeek: 3, startTime: '09:00', endTime: '20:00', isActive: true }, // Miércoles
      { dayOfWeek: 4, startTime: '09:00', endTime: '20:00', isActive: true }, // Jueves
      { dayOfWeek: 5, startTime: '09:00', endTime: '20:00', isActive: true }, // Viernes
      { dayOfWeek: 6, startTime: '09:00', endTime: '14:00', isActive: true }, // Sábado (medio día)
      // Domingo (0) no labora por defecto
    ];

    for (const day of defaultAvailability) {
      await db.doctorAvailability.create({ data: day });
    }

    const created = await db.doctorAvailability.findMany({
      orderBy: { dayOfWeek: 'asc' }
    });

    return NextResponse.json({ 
      message: 'Disponibilidad inicializada correctamente',
      availability: created 
    });
  } catch (error) {
    console.error('Error initializing availability:', error);
    return NextResponse.json({ 
      error: 'Error al inicializar disponibilidad',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Actualizar disponibilidad
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { dayOfWeek, startTime, endTime, isActive } = data;

    if (dayOfWeek === undefined || !startTime || !endTime) {
      return NextResponse.json({ 
        error: 'Faltan campos requeridos' 
      }, { status: 400 });
    }

    const availability = await db.doctorAvailability.upsert({
      where: { dayOfWeek },
      update: { startTime, endTime, isActive: isActive ?? true },
      create: { dayOfWeek, startTime, endTime, isActive: isActive ?? true }
    });

    return NextResponse.json({ 
      message: 'Disponibilidad actualizada',
      availability 
    });
  } catch (error) {
    console.error('Error updating availability:', error);
    return NextResponse.json({ 
      error: 'Error al actualizar disponibilidad' 
    }, { status: 500 });
  }
}
