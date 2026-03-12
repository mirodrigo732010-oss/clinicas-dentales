import { NextResponse } from 'next/server';
import { faqsApi } from '@/lib/db-adapter';

export async function GET() {
  try {
    const faqs = await faqsApi.getPublic();
    return NextResponse.json(faqs);
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return NextResponse.json([], { status: 200 });
  }
}
