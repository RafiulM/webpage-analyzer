"use client"

import { AuroraBackground } from '@/components/ui/aurora-background'
import { PlaceholdersAndVanishInput } from '@/components/ui/placeholders-and-vanish-input'
import { useState } from 'react'
import { AnalysisResult } from '@/components/analysis-result'
import { Button } from '@/components/ui/button'
import { Download, Loader2, X } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useLocalStorage } from 'usehooks-ts'
import { formatDistanceToNow } from 'date-fns'

interface Report {
  url: string
  analysis: string
  timestamp: number
}

export default function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reports, setReports] = useLocalStorage<Report[]>('webpage-reports', [])
  const [expandedReports, setExpandedReports] = useState<Set<number>>(new Set())

  const placeholders = [
    "Enter a website URL to analyze (e.g., https://example.com)",
    "Let's analyze your website content",
    "Get insights about your website's copywriting",
    "Discover layout improvement suggestions",
    "Find out how to enhance your website",
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const input = form.querySelector('input') as HTMLInputElement
    const url = input.value.trim()

    if (!url) return

    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze website')
      }

      const { analysis } = await response.json()
      
      // Add new report to the beginning of the list
      setReports(prevReports => [{
        url,
        analysis,
        timestamp: Date.now()
      }, ...prevReports])
      
    } catch (err) {
      setError('Failed to analyze the website. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleDownload = (report: Report) => {
    const blob = new Blob([report.analysis], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analysis-report-${new Date(report.timestamp).toISOString().split('T')[0]}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const toggleReport = (timestamp: number) => {
    setExpandedReports(prev => {
      const newSet = new Set(prev)
      if (newSet.has(timestamp)) {
        newSet.delete(timestamp)
      } else {
        newSet.add(timestamp)
      }
      return newSet
    })
  }

  const handleClose = (timestamp: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedReports(prev => {
      const newSet = new Set(prev)
      newSet.delete(timestamp)
      return newSet
    })
  }

  return (
    <AuroraBackground>
      <div className="min-h-screen flex flex-col">
        <div className={`flex flex-col items-center justify-center px-4 ${reports.length === 0 ? 'flex-1' : 'py-8'} gap-8`}>
          <h1 className="text-3xl md:text-7xl font-bold dark:text-white text-center">
            Landing Page Content Analyzer
          </h1>
          <p className="font-extralight text-base md:text-2xl dark:text-neutral-200 text-center max-w-2xl">
            Get actionable insights to improve your landing page copywriting and layout
          </p>
          <div className="w-full max-w-2xl">
            <PlaceholdersAndVanishInput
              placeholders={placeholders}
              onChange={handleChange}
              onSubmit={handleSubmit}
            />
          </div>

          {isAnalyzing && (
            <div className="flex items-center gap-2 text-lg">
              <Loader2 className="h-5 w-5 animate-spin" />
              Analyzing page...
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="max-w-2xl">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        {reports.length > 0 && (
          <div className="flex-1 w-full px-4 pb-8">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map((report) => {
                  const isExpanded = expandedReports.has(report.timestamp);
                  return (
                    <div 
                      key={report.timestamp} 
                      className={`relative bg-background/50 backdrop-blur-sm rounded-lg p-6 space-y-4 border border-border/50 hover:border-border transition-all cursor-pointer ${
                        isExpanded ? 'md:col-span-2 lg:col-span-3 ' : ''
                      }`}
                      onClick={() => toggleReport(report.timestamp)}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <h2 className="text-lg font-semibold truncate">
                              {report.url}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                              {formatDistanceToNow(report.timestamp, { addSuffix: true })}
                            </p>
                          </div>
                          {isExpanded && (
                            <div className="flex gap-2 flex-shrink-0">
                              <Button 
                                variant="outline" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownload(report);
                                }}
                                size="sm"
                              >
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => handleClose(report.timestamp, e)}
                                className="text-muted-foreground hover:text-foreground"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="max-h-[500px] overflow-y-auto rounded-md">
                          <div className="prose prose-sm dark:prose-invert prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border max-w-none">
                            <AnalysisResult markdown={report.analysis} />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </AuroraBackground>
  )
}