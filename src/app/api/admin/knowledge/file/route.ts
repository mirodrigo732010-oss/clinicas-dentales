import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
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
      return NextResponse.json({ error: 'Archivo requerido' }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    const isPdf = fileName.endsWith('.pdf');
    const isWord = fileName.endsWith('.docx') || fileName.endsWith('.doc');

    if (!isPdf && !isWord) {
      return NextResponse.json({ error: 'Solo se aceptan archivos PDF o Word (.docx)' }, { status: 400 });
    }

    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ error: 'El archivo es muy grande (máximo 15MB)' }, { status: 400 });
    }

    // Save file temporarily
    const tempDir = join(tmpdir(), 'file-extract');
    if (!existsSync(tempDir)) {
      mkdirSync(tempDir, { recursive: true });
    }

    const tempPath = join(tempDir, `${Date.now()}-${file.name}`);
    const bytes = await file.arrayBuffer();
    await writeFile(tempPath, Buffer.from(bytes));

    let content = '';
    let pages = 1;

    try {
      if (isPdf) {
        const scriptPath = join(process.cwd(), 'scripts', 'extract-pdf.py');
        
        try {
          const { stdout } = await execAsync(`python3 "${scriptPath}" "${tempPath}"`);
          content = stdout.trim();
          pages = (content.match(/--- PÁGINA/g) || []).length || 1;
        } catch (scriptError) {
          console.error('PDF extraction error:', scriptError);
          return NextResponse.json({ 
            error: 'Error al procesar PDF. Asegúrate de tener pdfplumber instalado: pip install pdfplumber' 
          }, { status: 500 });
        }
      } else if (isWord) {
        const scriptPath = join(process.cwd(), 'scripts', 'extract-docx.py');
        
        try {
          const { stdout } = await execAsync(`python3 "${scriptPath}" "${tempPath}"`);
          content = stdout.trim();
        } catch (scriptError) {
          console.error('DOCX extraction error:', scriptError);
          return NextResponse.json({ 
            error: 'Error al procesar Word. Asegúrate de tener python-docx instalado: pip install python-docx' 
          }, { status: 500 });
        }
      }
    } finally {
      // Clean up temp file
      try {
        await unlink(tempPath);
      } catch {
        // Ignore cleanup errors
      }
    }

    if (!content) {
      return NextResponse.json({ 
        error: 'No se pudo extraer texto del archivo. Puede que esté protegido o vacío.' 
      }, { status: 400 });
    }

    // Clean up content
    content = content
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return NextResponse.json({
      success: true,
      data: {
        fileName: file.name,
        content,
        pages
      }
    });
  } catch (error) {
    console.error('Error extracting file:', error);
    return NextResponse.json({ 
      error: 'Error al procesar el archivo',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
