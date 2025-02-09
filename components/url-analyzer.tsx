'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AnalysisResult } from '@/components/analysis-result'

const formSchema = z.object({
  url: z.string().url('Please enter a valid URL'),
})

type FormValues = z.infer<typeof formSchema>

export function UrlAnalyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: '',
    },
  })

  async function onSubmit(data: FormValues) {
    setIsAnalyzing(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: data.url }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze website')
      }

      const { analysis } = await response.json()
      setResult(analysis)
    } catch (err) {
      setError('Failed to analyze the website. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleDownload = () => {
    if (!result) return
    
    const blob = new Blob([result], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'analysis-report.md'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Enter website URL (e.g., https://example.com)"
                    {...field}
                    className="h-12 text-base"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full h-12 text-base"
            disabled={isAnalyzing}
          >
            {isAnalyzing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isAnalyzing ? 'Analyzing...' : 'Analyze Website'}
          </Button>
        </form>
      </Form>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <div className="space-y-4">
          <Button 
            variant="outline" 
            onClick={handleDownload}
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
          <AnalysisResult markdown={result} />
        </div>
      )}
    </div>
  )
}