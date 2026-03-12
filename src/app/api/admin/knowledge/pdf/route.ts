import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Archivo PDF requerido' }, { status: 400 });
    }

    // Validar que sea PDF
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'El archivo debe ser un PDF' }, { status: 400 });
    }

    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'El archivo es muy grande (máximo 10MB)' }, { status: 400 });
    }

    // Guardar archivo temporalmente
    const tempDir = join(tmpdir(), 'pdf-extract');
    if (!existsSync(tempDir)) {
      mkdirSync(tempDir, { recursive: true });
    }

    const tempPath = join(tempDir, `${Date.now()}-${file.name}`);
    const bytes = await file.arrayBuffer();
    await writeFile(tempPath, Buffer.from(bytes));

    // Extraer texto con pdfplumber
    const scriptPath = join(process.cwd(), 'scripts', 'extract-pdf.py');
    const { stdout, stderr } = await execAsync(`python3 "${scriptPath}" "${tempPath}"`);

    if (stderr && !stderr.includes('UserWarning')) {
      console.error('PDF extraction stderr:', stderr);
    }

    // Limpiar archivo temporal
    try {
      await execAsync(`rm "${tempPath}"`);
    } catch {
      // Ignorar errores de limpieza
    }

    const text = stdout.trim();

    if (!text) {
      return NextResponse.json({ error: 'No se pudo extraer texto del PDF. Puede que sea un PDF escaneado o protegido.' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: {
        fileName: file.name,
        content: text,
        pages: text.split('\n\n--- PÁGINA').length - 1 || 1
      }
    });
  } catch (error) {
    console.error('Error extracting PDF:', error);
    return NextResponse.json({ 
      error: 'Error al procesar el PDF',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
