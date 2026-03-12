import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

// Load config from file
async function getConfig() {
  try {
    const data = await readFile('/etc/.z-ai-config', 'utf-8');
    return JSON.parse(data);
  } catch {
    try {
      const configPath = join(process.cwd(), '.z-ai-config');
      const data = await readFile(configPath, 'utf-8');
      return JSON.parse(data);
    } catch {
      throw new Error('Config not found');
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL requerida' }, { status: 400 });
    }

    // Validar URL
    let validUrl: URL;
    try {
      validUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: 'URL inválida' }, { status: 400 });
    }

    // Obtener configuración
    const config = await getConfig();
    
    // Usar fetch directo con todos los headers necesarios
    const response = await fetch(`${config.baseUrl}/functions/invoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
        'X-Token': config.token,
        'X-Z-AI-From': 'Z',
        'X-Chat-Id': config.chatId || '',
        'X-User-Id': config.userId || '',
      },
      body: JSON.stringify({
        function_name: 'page_reader',
        arguments: { url }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const apiResult = await response.json();
    const result = apiResult.result;

    if (!result?.data?.html) {
      return NextResponse.json({ error: 'No se pudo extraer contenido de la página' }, { status: 500 });
    }

    // Extraer texto del HTML
    const html = result.data.html;
    
    // Convertir HTML a texto limpio
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/h[1-6]>/gi, '\n\n')
      .replace(/<\/li>/gi, '\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]+/g, ' ')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n')
      .trim();

    return NextResponse.json({
      success: true,
      data: {
        title: result.data.title || validUrl.hostname,
        content: text,
        url: url,
        publishedTime: result.data.publishedTime || null
      }
    });
  } catch (error) {
    console.error('Error extracting web content:', error);
    return NextResponse.json({ 
      error: 'Error al extraer contenido de la página web',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
