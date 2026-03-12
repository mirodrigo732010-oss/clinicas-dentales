import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener configuración del asistente
export async function GET() {
  try {
    let config = await db.assistantConfig.findFirst();
    
    // Si no existe, crear configuración por defecto
    if (!config) {
      config = await db.assistantConfig.create({
        data: {
          name: 'Elena',
          title: 'Asistente Virtual',
          welcomeMessage: '¡Hola! ¿En qué puedo ayudarte?',
          headerColor: '#0077B6',
          buttonColor: '#0077B6',
          buttonIcon: 'message-circle',
          position: 'bottom-right',
          isActive: true,
        }
      });
    }
    
    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error('Error fetching assistant config:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al obtener configuración' 
    }, { status: 500 });
  }
}

// POST - Actualizar configuración del asistente
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Buscar configuración existente
    let config = await db.assistantConfig.findFirst();
    
    if (config) {
      // Actualizar
      config = await db.assistantConfig.update({
        where: { id: config.id },
        data: {
          name: data.name,
          title: data.title,
          welcomeMessage: data.welcomeMessage,
          headerColor: data.headerColor,
          buttonColor: data.buttonColor,
          buttonIcon: data.buttonIcon,
          position: data.position,
          isActive: data.isActive,
        }
      });
    } else {
      // Crear
      config = await db.assistantConfig.create({
        data: {
          name: data.name || 'Elena',
          title: data.title || 'Asistente Virtual',
          welcomeMessage: data.welcomeMessage || '¡Hola! ¿En qué puedo ayudarte?',
          headerColor: data.headerColor || '#0077B6',
          buttonColor: data.buttonColor || '#0077B6',
          buttonIcon: data.buttonIcon || 'message-circle',
          position: data.position || 'bottom-right',
          isActive: data.isActive ?? true,
        }
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      config,
      message: 'Configuración guardada correctamente' 
    });
  } catch (error) {
    console.error('Error updating assistant config:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al guardar configuración' 
    }, { status: 500 });
  }
}
