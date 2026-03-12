import { NextRequest, NextResponse } from 'next/server';

const REMINDER_SERVICE_PORT = 3005;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path') || '';
  const port = searchParams.get('XTransformPort') || REMINDER_SERVICE_PORT;
  
  try {
    const res = await fetch(`http://localhost:${port}/${path}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Reminder service not available' }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path') || '';
  const port = searchParams.get('XTransformPort') || REMINDER_SERVICE_PORT;
  
  try {
    const body = await request.json();
    
    const res = await fetch(`http://localhost:${port}/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Reminder service not available' }, { status: 503 });
  }
}
