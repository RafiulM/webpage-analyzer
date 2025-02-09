'use client'

import { Card } from '@/components/ui/card'
import {marked} from 'marked'

interface AnalysisResultProps {
  markdown: string
}

export function AnalysisResult({ markdown }: AnalysisResultProps) {
  return (
    <Card className="p-6">
      <div className="prose prose-zinc dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: marked(markdown) }} />
    </Card>
  )
}