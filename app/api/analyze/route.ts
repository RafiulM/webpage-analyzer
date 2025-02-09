import { NextResponse } from 'next/server'
import { getWebsiteContent, analyzeContent } from '@/lib/analyze'

export async function POST(req: Request) {
  try {
    const { url } = await req.json()
    
    // Get website content using JinaAI
    const content = await getWebsiteContent(url)
    
    // Analyze content using OpenAI
    const analysis = await analyzeContent(content)
    
    return NextResponse.json({ analysis })
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze website' },
      { status: 500 }
    )
  }
}