import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { audioBase64 } = await req.json();

    if (!audioBase64) {
      return NextResponse.json({ error: 'Audio data is required' }, { status: 400 });
    }

    // Import ZAI SDK
    const ZAI = (await import('z-ai-web-dev-sdk')).default;
    const zai = await ZAI.create();

    // Transcribe audio
    const response = await zai.audio.asr.create({
      file_base64: audioBase64,
    });

    return NextResponse.json({
      success: true,
      transcription: response.text,
    });
  } catch (error) {
    console.error('ASR API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al transcribir audio' },
      { status: 500 }
    );
  }
}
