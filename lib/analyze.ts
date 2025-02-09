import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
})

export async function getWebsiteContent(url: string) {
  const response = await fetch(`https://r.jina.ai/${url}`, {
    headers: {
      'Authorization': `Bearer ${process.env.JINA_API_KEY}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch website content')
  }

  const content = await response.text()
  return content
}

export async function analyzeContent(content: string) {
  const prompt = `Analyze this website content and provide a detailed report with the following sections:
1. Content Overview - Evaluate the clarity, structure and effectiveness
2. SEO Analysis - Check meta tags, headings, and keyword usage
3. Layout Suggestions - Recommend improvements for visual hierarchy and user experience
4. Copywriting Improvements - Suggest ways to enhance the messaging and call-to-actions
5. Action Items - List specific tasks to implement the suggestions

Content to analyze:
${content}
`

  const completion = await openai.chat.completions.create({
    model: "o3-mini",
    messages: [
      {
        role: "system",
        content: "You are an expert web content analyst that excel in digital marketing and SEO. Provide clear, actionable insights for improving website content and layout. Your response should be formatted in markdown. Only respond with the result"
      },
      {
        role: "user",
        content: prompt
      }
    ],
    max_completion_tokens: 2000
  })

  return completion.choices[0].message.content
}