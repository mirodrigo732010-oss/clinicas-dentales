import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { text, voice = 'tongtong', speed = 1.0 } = await req.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Limit text length
    const limitedText = text.substring(0, 500);

    // Import ZAI SDK
    const ZAI = (await import('z-ai-web-dev-sdk')).default;
    const zai = await ZAI.create();

    // Generate TTS audio in WAV format for better compatibility
    const response = await zai.audio.tts.create({
      input: limitedText,
      voice: voice,
      speed: speed,
      response_format: 'wav',
      stream: false,
    });

    // Get audio data
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    // Convert to base64 data URL
    const base64 = audioBuffer.toString('base64');
    const audioUrl = `data:audio/wav;base64,${base64}`;

    return NextResponse.json({
      audioUrl,
      format: 'wav',
      sampleRate: 24000,
    });
  } catch (error) {
    console.error('TTS API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al generar audio' },
      { status: 500 }
    );
  }
}
