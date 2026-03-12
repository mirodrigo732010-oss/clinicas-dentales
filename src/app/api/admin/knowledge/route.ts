import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, access, mkdir } from 'fs/promises';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data');
const KNOWLEDGE_FILE = join(DATA_DIR, 'knowledge.json');

interface KnowledgeData {
  content: string;
  updatedAt: string;
}

async function getKnowledge(): Promise<KnowledgeData> {
  try {
    const data = await readFile(KNOWLEDGE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { content: '', updatedAt: new Date().toISOString() };
  }
}

async function saveKnowledge(content: string): Promise<KnowledgeData> {
  try {
    await access(DATA_DIR);
  } catch {
    await mkdir(DATA_DIR, { recursive: true });
  }
  
  const data: KnowledgeData = {
    content,
    updatedAt: new Date().toISOString()
  };
  await writeFile(KNOWLEDGE_FILE, JSON.stringify(data, null, 2));
  return data;
}

// GET - Obtener el conocimiento actual
export async function GET() {
  try {
    const knowledge = await getKnowledge();
    
    return NextResponse.json({ 
      success: true,
      knowledge
    });
  } catch (error) {
    console.error('Error fetching knowledge:', error);
    return NextResponse.json({ 
      success: false,
      knowledge: { content: '', updatedAt: new Date().toISOString() },
      error: String(error)
    });
  }
}

// POST - Actualizar conocimiento
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { content, append } = body;

    if (content === undefined) {
      return NextResponse.json({ error: 'Contenido requerido' }, { status: 400 });
    }

    let finalContent = content;

    if (append) {
      const existing = await getKnowledge();
      if (existing.content) {
        finalContent = existing.content + '\n\n---\n\n' + content;
      }
    }

    const knowledge = await saveKnowledge(finalContent);

    return NextResponse.json({ 
      success: true, 
      knowledge,
      message: 'Conocimiento guardado correctamente'
    });
  } catch (error) {
    console.error('Error updating knowledge:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Error al guardar', 
      details: String(error) 
    }, { status: 500 });
  }
}

// DELETE - Limpiar todo
export async function DELETE() {
  try {
    await saveKnowledge('');
    return NextResponse.json({ 
      success: true, 
      message: 'Conocimiento eliminado' 
    });
  } catch (error) {
    console.error('Error deleting:', error);
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 });
  }
}
